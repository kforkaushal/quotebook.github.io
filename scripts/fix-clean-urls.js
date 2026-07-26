const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2];
if (!ROOT) { console.error('Usage: node fix-clean-urls.js <root-folder>'); process.exit(1); }

const patterns = [
  { re: /(href=["'])([^"':]+?)\.html(["'#?])/g, rep: '$1$2$3' },
  { re: /(<loc>)([^<]+?)\.html(<\/loc>)/g, rep: '$1$2$3' },
  { re: /(window\.location(?:\.href)?\s*=\s*["'])([^"':]+?)\.html/g, rep: '$1$2' },
  { re: /(canonical["'\s:]*href=["'])([^"':]+?)\.html(["'])/g, rep: '$1$2$3' },
];

let filesChanged = 0;
function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const full = path.join(dir, entry.name);
    if (entry.name === '.git' || entry.name === 'node_modules') return;
    if (entry.isDirectory()) return walk(full);
    if (!/\.(html|js|xml|json)$/.test(entry.name)) return;
    let txt = fs.readFileSync(full, 'utf8');
    const before = txt;
    patterns.forEach(p => { txt = txt.replace(p.re, p.rep); });
    if (txt !== before) {
      fs.writeFileSync(full, txt, 'utf8');
      filesChanged++;
      console.log('Updated:', full);
    }
  });
}
walk(ROOT);
console.log(`\nDone. ${filesChanged} files updated.`);
