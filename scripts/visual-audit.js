/**
 * VISUAL-AUDIT.JS — Catches user-facing visual bugs across hundreds of pages
 * without depending on an AI IDE's understanding of the code at all.
 *
 * WHY THIS EXISTS:
 * Antigravity (or any AI IDE) reasons about *code*, one file/conversation at a
 * time. But "this button is bigger here than there" is not a code-text
 * problem — it's a RENDERED, VISUAL, CROSS-FILE problem. The only reliable
 * way to catch it is to actually render every page in a real browser and
 * measure/compare what a user would see. This script does that automatically.
 *
 * WHAT IT PRODUCES:
 * 1. A screenshot of every page at both mobile and desktop width.
 * 2. A single contact-sheet HTML file so you can visually scan 300+ pages
 *    in under a minute instead of opening each one.
 * 3. A numeric outlier report — measures key elements (buttons, header,
 *    hero card, quote grid) on every page and flags any page where an
 *    element's size/position deviates significantly from the median across
 *    all pages. This is what finds "this one button is 60% bigger" without
 *    you having to spot it by eye.
 *
 * SETUP (run once):
 *   npm install playwright
 *   npx playwright install chromium
 *
 * RUN:
 *   node scripts/visual-audit.js <folder-with-html-files> [baseUrlPathPrefix]
 *
 * Example:
 *   node scripts/visual-audit.js ./quotes
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TARGET_DIR = process.argv[2];
const OUTPUT_DIR = path.join(process.cwd(), 'visual-audit-output');
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];

// Elements worth measuring for outlier detection — adjust selectors to match your actual class names
const WATCH_SELECTORS = {
  primaryButton: '.btn-load-more, .btn-download-poster, .primary-action',
  headerNav: 'header, .app-header',
  heroOrTitle: 'h1, .section-heading',
  quoteCard: '.quote-card',
};

if (!TARGET_DIR) {
  console.error('Usage: node visual-audit.js <folder-with-html-files>');
  process.exit(1);
}

function median(nums) {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

async function measureElement(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top) };
  }, selector);
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const shotsDir = path.join(OUTPUT_DIR, 'screenshots');
  if (!fs.existsSync(shotsDir)) fs.mkdirSync(shotsDir, { recursive: true });

  const files = fs.readdirSync(TARGET_DIR).filter(f => f.endsWith('.html'));
  console.log(`Found ${files.length} pages. Launching browser...`);

  const browser = await chromium.launch();
  const measurements = {}; // { selectorKey: { fileName: {width,height,top} } }
  Object.keys(WATCH_SELECTORS).forEach(k => measurements[k] = {});

  for (const file of files) {
    const filePath = 'file://' + path.resolve(TARGET_DIR, file);
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      try {
        await page.goto(filePath, { waitUntil: 'networkidle', timeout: 15000 });
        const shotName = `${file.replace('.html', '')}__${vp.name}.png`;
        await page.screenshot({ path: path.join(shotsDir, shotName), fullPage: false });

        // Only measure at desktop width, to keep the outlier comparison apples-to-apples
        if (vp.name === 'desktop') {
          for (const [key, selector] of Object.entries(WATCH_SELECTORS)) {
            const m = await measureElement(page, selector);
            if (m) measurements[key][file] = m;
          }
        }
      } catch (err) {
        console.warn(`  ! Failed to load ${file} (${vp.name}): ${err.message}`);
      }
      await page.close();
    }
    console.log(`  captured: ${file}`);
  }
  await browser.close();

  // --- Outlier detection ---
  const outlierReport = [];
  for (const [key, byFile] of Object.entries(measurements)) {
    const widths = Object.values(byFile).map(m => m.width).filter(Boolean);
    const heights = Object.values(byFile).map(m => m.height).filter(Boolean);
    const medW = median(widths), medH = median(heights);
    if (medW == null) continue;
    for (const [file, m] of Object.entries(byFile)) {
      const widthDeviation = Math.abs(m.width - medW) / medW;
      const heightDeviation = Math.abs(m.height - medH) / medH;
      if (widthDeviation > 0.25 || heightDeviation > 0.25) {
        outlierReport.push(
          `${file} — "${key}" is ${m.width}x${m.height}px, vs typical ${Math.round(medW)}x${Math.round(medH)}px ` +
          `(${Math.round(Math.max(widthDeviation, heightDeviation) * 100)}% off median)`
        );
      }
    }
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'outliers.md'),
    `# Visual Outlier Report\n\nPages scanned: ${files.length}\n\n` +
    (outlierReport.length
      ? outlierReport.map(l => `- ${l}`).join('\n')
      : 'No outliers beyond the 25% deviation threshold — layout is consistent across all scanned pages.')
  );

  // --- Contact sheet (visual scan of everything in one page) ---
  const thumbs = files.map(f => {
    const desktopShot = `screenshots/${f.replace('.html', '')}__desktop.png`;
    const mobileShot = `screenshots/${f.replace('.html', '')}__mobile.png`;
    return `
      <div class="card">
        <p class="filename">${f}</p>
        <div class="row">
          <img src="${desktopShot}" alt="desktop" class="desktop-shot">
          <img src="${mobileShot}" alt="mobile" class="mobile-shot">
        </div>
      </div>`;
  }).join('\n');

  const contactSheetHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Visual Audit Contact Sheet</title>
<style>
  body { font-family: system-ui, sans-serif; background: #f2f2f2; margin: 0; padding: 20px; }
  h1 { font-size: 18px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
  .card { background: white; border-radius: 8px; padding: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
  .filename { font-size: 12px; font-weight: 600; margin: 0 0 8px; word-break: break-all; }
  .row { display: flex; gap: 6px; align-items: flex-start; }
  .desktop-shot { width: 240px; border: 1px solid #ddd; }
  .mobile-shot { width: 80px; border: 1px solid #ddd; }
</style></head>
<body>
  <h1>Visual Audit — ${files.length} pages — scroll to spot anything that looks different from its neighbors</h1>
  <div class="grid">${thumbs}</div>
</body></html>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'contact-sheet.html'), contactSheetHtml);

  console.log(`\nDone.`);
  console.log(`Open ${path.join(OUTPUT_DIR, 'contact-sheet.html')} in a browser to visually scan all pages.`);
  console.log(`Open ${path.join(OUTPUT_DIR, 'outliers.md')} for the numeric outlier list.`);
}

main();
