// @ts-nocheck
/**
 * Generates app icon PNGs from an SVG water drop design using sharp.
 * Run once: node scripts/generate-icons.js
 */
const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

const OUT = path.join(__dirname, '..', 'assets', 'images');

// ─── SVG water drop icon ──────────────────────────────────────────────────────

function makeSvg(size, withPadding = true) {
  const pad   = withPadding ? Math.round(size * 0.12) : 0;
  const inner = size - pad * 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#E8F4FD"/>
      <stop offset="100%" stop-color="#B8DFF8"/>
    </linearGradient>
    <linearGradient id="drop" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%"   stop-color="#00C9FF"/>
      <stop offset="100%" stop-color="#1E7CC8"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%"   stop-color="#FFFFFF" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${Math.round(size * 0.04)}" stdDeviation="${Math.round(size * 0.05)}" flood-color="#1E7CC8" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background rounded rect -->
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#bg)"/>

  <!-- Drop shadow (separate element) -->
  <g filter="url(#shadow)">
    <!-- Water drop path: starts at top, curves to bottom point -->
    <path d="
      M ${pad + inner * 0.5},${pad + inner * 0.08}
      C ${pad + inner * 0.5},${pad + inner * 0.08}
        ${pad + inner * 0.12},${pad + inner * 0.42}
        ${pad + inner * 0.12},${pad + inner * 0.58}
      C ${pad + inner * 0.12},${pad + inner * 0.82}
        ${pad + inner * 0.5},${pad + inner * 0.96}
        ${pad + inner * 0.5},${pad + inner * 0.96}
      C ${pad + inner * 0.5},${pad + inner * 0.96}
        ${pad + inner * 0.88},${pad + inner * 0.82}
        ${pad + inner * 0.88},${pad + inner * 0.58}
      C ${pad + inner * 0.88},${pad + inner * 0.42}
        ${pad + inner * 0.5},${pad + inner * 0.08}
        ${pad + inner * 0.5},${pad + inner * 0.08}
      Z
    " fill="url(#drop)"/>
  </g>

  <!-- Shine highlight -->
  <path d="
    M ${pad + inner * 0.5},${pad + inner * 0.08}
    C ${pad + inner * 0.5},${pad + inner * 0.08}
      ${pad + inner * 0.12},${pad + inner * 0.42}
      ${pad + inner * 0.12},${pad + inner * 0.58}
    C ${pad + inner * 0.12},${pad + inner * 0.82}
      ${pad + inner * 0.5},${pad + inner * 0.96}
      ${pad + inner * 0.5},${pad + inner * 0.96}
    C ${pad + inner * 0.5},${pad + inner * 0.96}
      ${pad + inner * 0.88},${pad + inner * 0.82}
      ${pad + inner * 0.88},${pad + inner * 0.58}
    C ${pad + inner * 0.88},${pad + inner * 0.42}
      ${pad + inner * 0.5},${pad + inner * 0.08}
      ${pad + inner * 0.5},${pad + inner * 0.08}
    Z
  " fill="url(#shine)"/>

  <!-- Small inner bubble for realism -->
  <ellipse cx="${pad + inner * 0.65}" cy="${pad + inner * 0.32}" rx="${inner * 0.07}" ry="${inner * 0.1}" fill="white" opacity="0.45" transform="rotate(-25 ${pad + inner * 0.65} ${pad + inner * 0.32})"/>
</svg>`;
}

async function generate() {
  const configs = [
    { file: 'icon.png',          size: 1024, padding: true  },
    { file: 'adaptive-icon.png', size: 1024, padding: true  },
    { file: 'splash-icon.png',   size: 512,  padding: false },
    { file: 'favicon.png',       size: 64,   padding: true  },
  ];

  for (const cfg of configs) {
    const svg = makeSvg(cfg.size, cfg.padding);
    const outPath = path.join(OUT, cfg.file);
    await sharp(Buffer.from(svg)).png().toFile(outPath);
    const stat = fs.statSync(outPath);
    console.log(`  ✅  ${cfg.file.padEnd(24)} ${cfg.size}×${cfg.size}px  (${Math.round(stat.size / 1024)} KB)`);
  }

  console.log('\n  Icons saved to assets/images/\n');
}

generate().catch(e => { console.error(e); process.exit(1); });
