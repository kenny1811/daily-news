const fs = require('fs');
const TODAY = '2026-08-16';
const data = JSON.parse(fs.readFileSync('am_data.json', 'utf8'));
const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
const idx = lines.findIndex(l => l.startsWith('const DB = '));
if (idx < 0) { console.error('DB line not found'); process.exit(1); }
const db = JSON.parse(lines[idx].replace(/^const DB = /, '').replace(/;\s*$/, ''));

// sanity: signature check for hk01 CDN images
for (const g of ['hks','hkl','hke','hkp','cn','us','tw','war']) {
  for (const c of data[g]) {
    const img = c[6];
    if (/cdn\.hk01\.com/.test(img)) {
      const m = img.match(/\.(?:jpeg|jpg|png|JPG|PNG)\/([^?]+)/);
      if (!m || m[1].length !== 43) { console.error('BAD hk01 sig (' + (m?m[1].length:'none') + '): ' + c[0]); process.exit(1); }
    }
  }
}

const am = {
  hks: data.hks, hkl: data.hkl, hke: data.hke, hkp: data.hkp,
  cn: data.cn, us: data.us, tw: data.tw, war: data.war,
  track: data.track, ai: data.ai, warb: data.warb, _updated: data._updated
};
if (!db[TODAY]) db[TODAY] = {};
db[TODAY].am = am;

const sorted = {};
for (const k of Object.keys(db).sort().reverse()) sorted[k] = db[k];
lines[idx] = 'const DB = ' + JSON.stringify(sorted) + ';';
fs.writeFileSync('index.html', lines.join('\n'));
// verify parse
const check = lines[idx].replace(/^const DB = /, '').replace(/;\s*$/, '');
JSON.parse(check);
console.log('OK. keys:', Object.keys(sorted).slice(0, 3).join(','), '| am groups:', Object.keys(db[TODAY].am).join(','));
