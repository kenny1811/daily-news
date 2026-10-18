const assert = require('node:assert/strict');
const { validateLateThreads } = require('./late-threads');

const parseHKT = s => {
  const m = String(s || '').match(/^(\d{4}-\d\d-\d\d) (\d\d:\d\d)$/);
  return m ? Date.parse(`${m[1]}T${m[2]}:00+08:00`) : null;
};
const window = {
  parseHKT,
  floorMs: parseHKT('2026-10-14 09:00'),
  ceilMs: parseHKT('2026-10-14 21:55'),
  nowMs: parseHKT('2026-10-14 22:00')
};
const card = [
  '較早目擊帖今日獲核實','今日報道補充新證據','目擊者（Threads）',
  'https://www.threads.com/@witness/post/ABC123',
  '2026-10-11 18:00','2026-10-11 18:00','https://example.com/image.jpg',0,
  { freshReport: { source:'獨立新聞', url:'https://example.com/news/123', publishedAt:'2026-10-14 12:30', newInformation:'首次核實地點與事發經過' } }
];
assert.deepEqual(validateLateThreads(card,window),[]);
const check = (change, expected) => {
  const changed=structuredClone(card);
  change(changed);
  assert.match(validateLateThreads(changed,window).join('\n'),expected);
};
check(c=>{c[8]=undefined},/欠窗內新報道/);
check(c=>{c[8].freshReport.publishedAt='2026-10-11 20:00'},/唔喺本版時間窗/);
check(c=>{c[8].freshReport.publishedAt='2026-10-14'},/確切首發時分/);
check(c=>{c[8].freshReport.publishedAt='2026-10-14 22:01'},/未來/);
check(c=>{c[8].freshReport.url='https://www.threads.com/@other/post/DEF'},/單篇文章/);
check(c=>{c[8].freshReport.newInformation=''},/新資訊/);
check(c=>{c[3]='https://example.com/old-news'},/只容許 Threads/);
console.log('late Threads: truthful post time and in-window report evidence validated');
