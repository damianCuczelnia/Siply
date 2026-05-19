// @ts-nocheck
/**
 * Generates realistic 7-day demo data and writes it directly to a JSON file
 * that the app loads on first run. Run once before the presentation.
 *
 * Usage: node scripts/seed-demo-data.js
 *
 * This writes to assets/demo-seed.json AND patches services/storage.ts
 * to pre-populate AsyncStorage with demo data when it's empty.
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// ─── Generate realistic data ──────────────────────────────────────────────────

function generateEntryId() {
  return `entry_${Date.now() - Math.floor(Math.random() * 1e9)}_${Math.random().toString(36).slice(2, 9)}`;
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Typical daily water intake pattern (time offset from midnight in ms + amount)
const DAILY_PATTERNS = [
  // [hourOffset, minuteOffset, amount]
  [7, 15, 250],   // poranna szklanka
  [9, 30, 330],   // przy śniadaniu
  [11, 0,  250],  // przed obiadem
  [13, 15, 500],  // po obiedzie
  [15, 45, 250],  // popołudniowa kawa (nah, woda)
  [18, 0,  330],  // przed kolacją
  [20, 30, 250],  // wieczorna szklanka
];

// Totals per day (simulate variability - some days good, some bad)
const DAY_CONFIGS = [
  { totalTarget: 2100, entryCount: 7, label: 'Mon' },
  { totalTarget: 1650, entryCount: 5, label: 'Tue' },
  { totalTarget: 2400, entryCount: 8, label: 'Wed' },
  { totalTarget: 1900, entryCount: 6, label: 'Thu' },
  { totalTarget: 2600, entryCount: 7, label: 'Fri' },
  { totalTarget: 1200, entryCount: 4, label: 'Sat' }, // lazy weekend
  { totalTarget: 1850, entryCount: 6, label: 'Sun' }, // today partial
];

const today = new Date();
const records = {};

// Generate 7 days: 6 past days + today (partially filled)
for (let i = 6; i >= 0; i--) {
  const date = new Date(today);
  date.setDate(today.getDate() - i);
  const key    = formatDateKey(date);
  const config = DAY_CONFIGS[6 - i];

  // For today (i=0), only use entries up to current hour
  const isToday      = i === 0;
  const currentHour  = today.getHours();
  const maxEntries   = isToday ? Math.max(2, Math.floor(currentHour / 3)) : config.entryCount;
  const patterns     = DAILY_PATTERNS.slice(0, maxEntries);

  const entries = patterns.map((pattern, idx) => {
    const [h, m, amount] = pattern;
    const entryDate = new Date(date);
    entryDate.setHours(h, m, 0, 0);
    // Add slight jitter
    entryDate.setMinutes(m + Math.floor(Math.random() * 15));
    return {
      id:        generateEntryId(),
      amount,
      timestamp: entryDate.getTime(),
    };
  });

  const totalMl = entries.reduce((sum, e) => sum + e.amount, 0);

  records[key] = {
    date:    key,
    entries,
    totalMl,
  };
}

const settings = {
  dailyGoalMl: 2000,
  unit: 'ml',
};

const output = {
  records,
  settings,
  generatedAt: new Date().toISOString(),
};

// ─── Write to assets/demo-seed.json ──────────────────────────────────────────

const outDir  = path.join(ROOT, 'assets');
const outFile = path.join(outDir, 'demo-seed.json');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(output, null, 2));

// ─── Print summary ────────────────────────────────────────────────────────────

console.log('\n✅  Demo seed data generated!\n');
Object.entries(records).forEach(([date, rec]) => {
  const bar   = '█'.repeat(Math.round(rec.totalMl / 100));
  const today = formatDateKey(new Date());
  const label = date === today ? ' ← DZIŚ' : '';
  console.log(`  ${date}  ${String(rec.totalMl).padStart(4)} ml  ${bar}${label}`);
});

console.log(`\n  Cel: 2000 ml`);
console.log(`  Plik: ${outFile}`);
console.log('\n  Teraz zaimportuj dane do app przez storage.ts patch.\n');

// ─── Patch services/storage.ts to auto-seed on first load ───────────────────

const storagePath = path.join(ROOT, 'services', 'storage.ts');
let storageSource = fs.readFileSync(storagePath, 'utf8');

const SEED_COMMENT = '// AUTO-SEEDED FOR DEMO';

if (storageSource.includes(SEED_COMMENT)) {
  console.log('  services/storage.ts already patched — skipping.\n');
} else {
  // Build the seed injection string
  const seedJson = JSON.stringify(output.records);
  const settingsJson = JSON.stringify(settings);

  const PATCH = `
${SEED_COMMENT}
async function seedDemoDataIfEmpty(): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEYS.waterRecords);
    if (existing) return; // already has data
    const seed = ${seedJson};
    await AsyncStorage.setItem(STORAGE_KEYS.waterRecords, JSON.stringify(seed));
    const existingSettings = await AsyncStorage.getItem(STORAGE_KEYS.settings);
    if (!existingSettings) {
      await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(${settingsJson}));
    }
  } catch {}
}
// Call once on module load
seedDemoDataIfEmpty();
`;

  // Insert after the imports block (after the last import line)
  const importEnd = storageSource.lastIndexOf('import ');
  const lineEnd   = storageSource.indexOf('\n', importEnd);
  storageSource   = storageSource.slice(0, lineEnd + 1) + PATCH + storageSource.slice(lineEnd + 1);
  fs.writeFileSync(storagePath, storageSource);
  console.log('  ✅  Patched services/storage.ts with demo seed.\n');
}
