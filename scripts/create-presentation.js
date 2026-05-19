// @ts-nocheck
const puppeteer  = require('puppeteer');
const pptxgen    = require('pptxgenjs');
const http       = require('http');
const path       = require('path');
const fs         = require('fs');
const handler    = require('serve-handler');

const DIST = path.join(__dirname, '..', 'dist-web');
const OUT  = path.join(__dirname, '..', 'Siply_Presentation.pptx');
const PORT = 3737;
const W    = 390;
const H    = 844;

const C = {
  bg:      'E8F4FD', blue:    '3B9EE8', blueDk:  '1E7CC8',
  blueXL:  'EBF5FF', white:   'FFFFFF', text:    '1A2F45',
  textSec: '6B8FA8', success: '4CAF82', accent:  '00C9FF',
};

// ─── Screenshots ─────────────────────────────────────────────────────────────

async function takeScreenshots() {
  const server = http.createServer((req, res) => handler(req, res, { public: DIST }));
  await new Promise(r => server.listen(PORT, r));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const routes = [
    { name: 'today',      path: '/',           file: 'screen_today.png'    },
    { name: 'statistics', path: '/statistics', file: 'screen_stats.png'    },
    { name: 'settings',   path: '/settings',   file: 'screen_settings.png' },
  ];

  const shots = {};
  for (const route of routes) {
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
    await page.goto(`http://localhost:${PORT}${route.path}`, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    const buf = await page.screenshot({ type: 'png' });
    const outPath = path.join(__dirname, '..', 'assets', 'screenshots', route.file);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buf);
    shots[route.name] = 'data:image/png;base64,' + buf.toString('base64');
    console.log(`  Screenshot: ${route.name} (${buf.length} bytes)`);
    await page.close();
  }

  await browser.close();
  server.close();
  return shots;
}

// ─── Slide helpers ────────────────────────────────────────────────────────────

function waterBg(s) {
  s.addShape('ellipse', { x: -1, y: -1, w: 3.5, h: 3.5, fill: { color: C.blue, transparency: 88 }, line: { color: C.blue, transparency: 100 } });
  s.addShape('ellipse', { x: 8,  y: 5,  w: 3,   h: 3,   fill: { color: C.accent, transparency: 88 }, line: { color: C.accent, transparency: 100 } });
}

function header(s, title) {
  s.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.9, fill: { color: C.blue }, line: { color: C.blue, transparency: 100 } });
  s.addText(title, { x: 0.5, y: 0.13, w: 9, h: 0.65, fontSize: 26, bold: true, color: C.white, fontFace: 'Segoe UI' });
}

function code(s, x, y, w, h, text) {
  s.addShape('rect', { x, y, w, h, fill: { color: '1A2F45' }, rectRadius: 0.12, line: { color: '1A2F45', transparency: 100 } });
  s.addText(text, { x: x + 0.15, y: y + 0.08, w: w - 0.3, h: h - 0.16, fontSize: 12, color: 'A8EFFF', fontFace: 'Courier New' });
}

// ─── Build PPTX ───────────────────────────────────────────────────────────────

async function buildPptx(shots) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';  // 10 × 7.5 inches

  // ── 1. Tytuł ────────────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.bg };
    waterBg(s);
    s.addShape('rect', { x: 0, y: 0, w: 0.18, h: '100%', fill: { color: C.blue }, line: { color: C.blue, transparency: 100 } });

    s.addText('💧', { x: 1, y: 1.3, w: 1, h: 1, fontSize: 54, align: 'center' });
    s.addText('Siply', { x: 0.5, y: 2.3, w: 9, h: 1.3, fontSize: 80, bold: true, color: C.text, fontFace: 'Segoe UI', charSpacing: -2 });
    s.addText('Nawadniaj się pięknie.', { x: 0.5, y: 3.55, w: 7, h: 0.6, fontSize: 22, color: C.textSec, fontFace: 'Segoe UI' });

    s.addShape('rect', { x: 0.5, y: 4.25, w: 3.2, h: 0.55, fill: { color: C.blue }, rectRadius: 0.27, line: { color: C.blue, transparency: 100 } });
    s.addText('React Native + Expo', { x: 0.5, y: 4.25, w: 3.2, h: 0.55, fontSize: 14, bold: true, color: C.white, fontFace: 'Segoe UI', align: 'center' });

    s.addText('Autor: Damian Chymkowski  ·  Projekt studencki  ·  2025', { x: 0.5, y: 6.85, w: 9, h: 0.4, fontSize: 13, color: C.textSec, fontFace: 'Segoe UI' });
  }

  // ── 2. O aplikacji ──────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.white };
    waterBg(s);
    header(s, 'O aplikacji');

    s.addText('Siply to mobilna aplikacja do śledzenia dziennego spożycia wody.\nProsta, piękna i w pełni offline — bez rejestracji, bez backendu, bez chmury.', {
      x: 0.5, y: 1.05, w: 9, h: 1, fontSize: 16, color: C.text, fontFace: 'Segoe UI',
    });

    const feats = [
      ['Animowany pierścień',   'SVG arc wypełniający się powoli z bąbelkami'],
      ['Szybki dodaj',          '+100 / +250 / +330 / +500 ml — jeden tap'],
      ['Własna ilość',          'Wpisz dowolną ilość ml w modal bottom-sheet'],
      ['Cofnij wpis',           'Undo ostatniego kroku z potwierdzeniem'],
      ['Wykres 7 dni',          'Słupki SVG z linią celu i legendą'],
      ['Ustawienia',            'Dzienny cel, presety 1.5–3 L, reset danych'],
    ];

    feats.forEach(([t, d], i) => {
      const x = i % 2 === 0 ? 0.4 : 5.15;
      const y = 2.15 + Math.floor(i / 2) * 1.25;
      s.addShape('rect', { x, y, w: 4.4, h: 1.05, fill: { color: C.blueXL }, rectRadius: 0.15, line: { color: 'D0E8F8' } });
      s.addShape('ellipse', { x: x + 0.14, y: y + 0.32, w: 0.38, h: 0.38, fill: { color: C.blue }, line: { color: C.blue, transparency: 100 } });
      s.addText(t, { x: x + 0.65, y: y + 0.07, w: 3.6, h: 0.4, fontSize: 13, bold: true, color: C.text, fontFace: 'Segoe UI' });
      s.addText(d, { x: x + 0.65, y: y + 0.48, w: 3.6, h: 0.44, fontSize: 11, color: C.textSec, fontFace: 'Segoe UI' });
    });
  }

  // ── 3–5. Screenshoty ────────────────────────────────────────────────────
  addScreenSlide(pptx, shots.today,      'Ekran główny — Dziś',  [
    'Animowany pierścień SVG z bąbelkami',
    'Licznik ml liczy się płynnie w górę',
    'Szybkie przyciski +ml z animacją',
    'Latający popup z komentarzem',
    'Dziennik wpisów z godziną',
  ]);
  addScreenSlide(pptx, shots.statistics, 'Statystyki — 7 dni', [
    'Wykres słupkowy (react-native-svg)',
    'Linia dziennego celu',
    'Karty: średnia, najlepszy dzień',
    'Pasek realizacji celu tygodnia',
    'Karty wjeżdżają z dołu (animacja)',
  ]);
  addScreenSlide(pptx, shots.settings,   'Ustawienia', [
    'Edycja dziennego celu',
    'Presety: 1.5 / 2.0 / 2.5 / 3.0 L',
    'Dynamiczny hint zależny od celu',
    'Reset danych z potwierdzeniem',
    'Info o aplikacji i autorze',
  ]);

  // ── 6. Stack technologiczny ──────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.white };
    waterBg(s);
    header(s, 'Stack technologiczny');

    const tech = [
      { name: 'React Native 0.81',    desc: 'Cross-platform mobile framework',   color: '61DAFB' },
      { name: 'Expo SDK 54',          desc: 'Toolchain, native APIs, EAS Build',  color: '000020' },
      { name: 'Expo Router 6',        desc: 'File-based nawigacja (zakładki)',     color: C.blue   },
      { name: 'TypeScript 5.9',       desc: 'Statyczne typowanie całej apki',     color: '3178C6' },
      { name: 'AsyncStorage 2.2',     desc: 'Lokalne persystowanie danych',       color: C.success },
      { name: 'react-native-svg',     desc: 'Wykres słupkowy + pierścień SVG',    color: 'FF6B6B' },
      { name: 'expo-linear-gradient', desc: 'Gradient tła na każdym ekranie',     color: 'FF9F43' },
      { name: 'Ionicons (Expo)',       desc: 'Ikony wektorowe w UI i navbarze',   color: '6C63FF' },
    ];

    tech.forEach((t, i) => {
      const x = i % 2 === 0 ? 0.4 : 5.15;
      const y = 1.05 + Math.floor(i / 2) * 1.3;
      s.addShape('rect', { x, y, w: 4.4, h: 1.05, fill: { color: C.white }, rectRadius: 0.15, line: { color: t.color, width: 2 } });
      s.addShape('rect', { x, y, w: 0.18, h: 1.05, fill: { color: t.color }, line: { color: t.color, transparency: 100 } });
      s.addText(t.name, { x: x + 0.3, y: y + 0.08, w: 3.9, h: 0.42, fontSize: 13, bold: true, color: C.text, fontFace: 'Segoe UI' });
      s.addText(t.desc, { x: x + 0.3, y: y + 0.52, w: 3.9, h: 0.38, fontSize: 11, color: C.textSec, fontFace: 'Segoe UI' });
    });
  }

  // ── 7. Architektura ──────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.white };
    waterBg(s);
    header(s, 'Architektura i model danych');

    s.addShape('rect', { x: 0.4, y: 1.0, w: 5.0, h: 5.5, fill: { color: 'F8FBFF' }, rectRadius: 0.15, line: { color: 'D0E8F8' } });
    s.addText('Struktura katalogów', { x: 0.6, y: 1.1, w: 4.6, h: 0.4, fontSize: 13, bold: true, color: C.blue, fontFace: 'Segoe UI' });
    s.addText(
      'app/(tabs)/index.tsx      ← ekran Dziś\n' +
      'app/(tabs)/statistics.tsx ← statystyki\n' +
      'app/(tabs)/settings.tsx   ← ustawienia\n' +
      'components/               ← komponenty UI\n' +
      'hooks/useWaterData.ts     ← stan wody\n' +
      'hooks/useSettings.ts      ← stan ustawień\n' +
      'services/storage.ts       ← AsyncStorage\n' +
      'types/index.ts            ← typy TS\n' +
      'constants/                ← kolory, stałe\n' +
      'utils/dateUtils.ts        ← daty po polsku',
      { x: 0.6, y: 1.6, w: 4.7, h: 3.8, fontSize: 11, color: C.text, fontFace: 'Courier New' });

    s.addShape('rect', { x: 5.7, y: 1.0, w: 4.0, h: 5.5, fill: { color: 'F8FBFF' }, rectRadius: 0.15, line: { color: 'D0E8F8' } });
    s.addText('Model danych (AsyncStorage)', { x: 5.9, y: 1.1, w: 3.6, h: 0.4, fontSize: 13, bold: true, color: C.blue, fontFace: 'Segoe UI' });
    s.addText(
      'KEY: siply_water_records\n\n' +
      '"2025-05-19": {\n' +
      '  date: "2025-05-19",\n' +
      '  totalMl: 1850,\n' +
      '  entries: [\n' +
      '    { id: "...",\n' +
      '      amount: 500,\n' +
      '      timestamp: 17... }\n' +
      '  ]\n' +
      '}\n\n' +
      'KEY: siply_settings\n\n' +
      '{ dailyGoalMl: 2000,\n' +
      '  unit: "ml" }',
      { x: 5.9, y: 1.6, w: 3.6, h: 3.8, fontSize: 11, color: C.text, fontFace: 'Courier New' });
  }

  // ── 8. Jak uruchomić ─────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.white };
    waterBg(s);
    header(s, 'Jak uruchomić?');

    const steps = [
      { n: '1', t: 'Sklonuj repozytorium', c: 'git clone https://github.com/damianCuczelnia/Siply.git\ncd Siply' },
      { n: '2', t: 'Zainstaluj zależności', c: 'npm install' },
      { n: '3', t: 'Uruchom Expo',          c: 'npx expo start' },
      { n: '4', t: 'Otwórz na telefonie',   c: 'Expo Go (iOS / Android) → zeskanuj QR kod' },
    ];

    steps.forEach((step, i) => {
      const y = 1.1 + i * 1.45;
      s.addShape('ellipse', { x: 0.4, y: y + 0.22, w: 0.52, h: 0.52, fill: { color: C.blue }, line: { color: C.blue, transparency: 100 } });
      s.addText(step.n, { x: 0.4, y: y + 0.22, w: 0.52, h: 0.52, fontSize: 18, bold: true, color: C.white, fontFace: 'Segoe UI', align: 'center', valign: 'middle' });
      s.addText(step.t, { x: 1.1, y: y + 0.06, w: 8.5, h: 0.38, fontSize: 15, bold: true, color: C.text, fontFace: 'Segoe UI' });
      code(s, 1.1, y + 0.46, 8.5, 0.76, step.c);
    });
  }

  // ── 9. Demo (placeholder) ────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.bg };
    waterBg(s);
    header(s, 'Demo');

    // Big placeholder box
    s.addShape('rect', { x: 1.2, y: 1.1, w: 7.6, h: 5.0, fill: { color: '1A2F45' }, rectRadius: 0.35, line: { color: C.blue, width: 3 } });

    // Play button circle
    s.addShape('ellipse', { x: 4.35, y: 2.75, w: 1.3, h: 1.3, fill: { color: C.blue }, line: { color: C.blue, transparency: 100 } });
    s.addText('▶', { x: 4.35, y: 2.75, w: 1.3, h: 1.3, fontSize: 32, color: C.white, align: 'center', valign: 'middle' });

    s.addText('[ Wstaw nagranie DEMO ]', {
      x: 1.2, y: 4.3, w: 7.6, h: 0.55,
      fontSize: 18, color: C.textSec, fontFace: 'Segoe UI', align: 'center',
    });
    s.addText('Przeciągnij plik wideo lub kliknij prawym → Wstaw wideo', {
      x: 1.2, y: 4.9, w: 7.6, h: 0.4,
      fontSize: 12, color: '445566', fontFace: 'Segoe UI', align: 'center',
    });
  }

  // ── 10. Dziękuję ─────────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.bg };
    waterBg(s);
    s.addShape('rect', { x: 0, y: 0, w: 0.18, h: '100%', fill: { color: C.blue }, line: { color: C.blue, transparency: 100 } });

    s.addText('💧', { x: 1.2, y: 1.5, w: 1, h: 1, fontSize: 56, align: 'center' });
    s.addText('Dziękuję za uwagę!', { x: 0.5, y: 2.6, w: 9, h: 1.1, fontSize: 52, bold: true, color: C.text, fontFace: 'Segoe UI' });
    s.addText('Siply  ·  Damian Chymkowski  ·  2025', { x: 0.5, y: 3.75, w: 9, h: 0.55, fontSize: 20, color: C.textSec, fontFace: 'Segoe UI' });

    s.addShape('rect', { x: 0.5, y: 4.6, w: 4, h: 0.55, fill: { color: C.blueXL }, rectRadius: 0.27, line: { color: C.blue } });
    s.addText('github.com/damianCuczelnia/Siply', { x: 0.5, y: 4.6, w: 4, h: 0.55, fontSize: 13, color: C.blue, fontFace: 'Segoe UI', align: 'center' });
  }

  await pptx.writeFile({ fileName: OUT });
  console.log(`\n✅  Zapisano: ${OUT}`);
}

// ─── Screenshot slide ────────────────────────────────────────────────────────

function addScreenSlide(pptx, imgData, title, bullets) {
  const s = pptx.addSlide();
  s.background = { color: C.white };
  waterBg(s);
  header(s, title);

  if (imgData) {
    // Phone frame
    s.addShape('rect', { x: 0.45, y: 0.95, w: 3.55, h: 6.1, fill: { color: '1A2F45' }, rectRadius: 0.38, line: { color: '1A2F45', transparency: 100 } });
    s.addImage({ data: imgData, x: 0.62, y: 1.17, w: 3.22, h: 5.68 });
    s.addShape('rect', { x: 1.55, y: 1.05, w: 1.3, h: 0.22, fill: { color: '1A2F45' }, rectRadius: 0.11, line: { color: '1A2F45', transparency: 100 } });
  }

  s.addText('Co widać na ekranie:', { x: 4.4, y: 1.1, w: 5.3, h: 0.4, fontSize: 13, bold: true, color: C.blue, fontFace: 'Segoe UI' });

  bullets.forEach((b, i) => {
    const y = 1.65 + i * 0.88;
    s.addShape('ellipse', { x: 4.4, y: y + 0.14, w: 0.28, h: 0.28, fill: { color: C.blue }, line: { color: C.blue, transparency: 100 } });
    s.addText(b, { x: 4.8, y: y + 0.04, w: 4.9, h: 0.62, fontSize: 14, color: C.text, fontFace: 'Segoe UI' });
  });
}

// ─── Entry point ─────────────────────────────────────────────────────────────

(async () => {
  console.log('📸  Robię screenshoty...');
  const shots = await takeScreenshots().catch(err => {
    console.warn('⚠️  Screenshoty nieudane:', err.message, '— kontynuuję bez nich');
    return {};
  });

  console.log('📊  Generuję PPTX...');
  await buildPptx(shots);
})();
