#!/usr/bin/env node
// 每日新聞 push 前強制自檢
// 用法： node tools/selfcheck.js 2026-07-27
// exit 0 = 通過可以 push；exit 1 = 有問題，唔准 push，要修好再跑
const fs = require("fs");
const date = process.argv[2];
if (!date) { console.error("用法: node tools/selfcheck.js YYYY-MM-DD"); process.exit(1); }

const html = fs.readFileSync("index.html", "utf8");
const m = html.match(/const DB = ([\s\S]*?);\n/);
if (!m) { console.error("✖ 搵唔到 const DB"); process.exit(1); }
let db;
try { db = eval("(" + m[1] + ")"); } catch (e) { console.error("✖ DB 唔係合法 JS: " + e.message); process.exit(1); }
const d = db[date];
if (!d) { console.error("✖ DB 冇 " + date + " 呢個 key"); process.exit(1); }

// 內嵌 script 必須可以編譯
try { require("vm").compileFunction(html.match(/<script>([\s\S]*?)<\/script>/)[1]); }
catch (e) { console.error("✖ 內嵌 script 編譯失敗: " + e.message); process.exit(1); }

const G = ["hks", "hkl", "hke", "hkp", "cn", "us", "tw", "war"];
const NAME = { hks: "香港社會", hkl: "民生", hke: "經濟", hkp: "政治", cn: "中國", us: "美國", tw: "台灣", war: "美伊戰爭" };
// 每組最少條數：社會／民生規格係 8 條，其餘最少 3 條
const MINS = { hks: 8, hkl: 8, hke: 3, hkp: 3, cn: 3, us: 3, tw: 3, war: 3 };
const HK = ["hks", "hkl", "hke", "hkp"];
// 24 小時窗：發放時間唔可以早過 date 前一日 00:00
const prev = new Date(date + "T00:00:00Z"); prev.setUTCDate(prev.getUTCDate() - 1);
const FLOOR = prev.toISOString().slice(0, 10) + " 00:00";

const bad = [];
G.forEach(k => {
  const a = d[k] || [];
  if (a.length < MINS[k]) bad.push(`${NAME[k]}(${k}) 只有 ${a.length} 條（要 ${MINS[k]} 條）`);
  const srcs = new Set(a.map(x => x[2]));
  if (a.length >= 3 && srcs.size < 2) bad.push(`${NAME[k]}(${k}) 100% 單一來源：${[...srcs].join("/")}`);
  const urls = new Set();
  a.forEach((x, i) => {
    const tag = `${NAME[k]}[${i}]`;
    if (!x[0]) bad.push(`${tag} 冇標題`);
    else if (!/[一-鿿]/.test(x[0])) bad.push(`${tag} 標題唔係中文：${x[0].slice(0, 30)}`);
    if (!x[1]) bad.push(`${tag} 冇摘要`);
    if (!x[2]) bad.push(`${tag} 冇來源名`);
    if (!/^https:\/\/\S+$/.test(x[3] || "")) bad.push(`${tag} URL 有問題：${x[3]}`);
    if (/^https?:\/\/[^\/]+\/?$/.test(x[3] || "")) bad.push(`${tag} 用咗首頁／列表頁做連結`);
    if (urls.has(x[3])) bad.push(`${tag} 同組內重複連結`); else urls.add(x[3]);
    if (!x[4]) bad.push(`${tag} 冇發放時間`);
    else if (x[4] < FLOOR) bad.push(`${tag} 發放時間超出 24 小時窗：${x[4]}`);
    if (!/^https:\/\/\S+/.test(x[6] || "")) bad.push(`${tag} 冇插圖 og:image`);
  });
});

// 全站唯一性：唔准同一條文章重複出現喺唔同組
const all = [];
G.forEach(k => (d[k] || []).forEach(x => all.push([k, x[3]])));
const seen = {};
all.forEach(([k, u]) => { if (seen[u]) bad.push(`跨組重複連結：${seen[u]} 同 ${k} 用同一條 ${u}`); else seen[u] = k; });

// 兩篇簡報
[["ai", "AI 動向"], ["warb", "美伊戰爭"]].forEach(([k, n]) => {
  const b = d[k];
  if (!b || typeof b !== "object") { bad.push(`${n}簡報完全冇`); return; }
  if (!b.t || b.t.length < 200) bad.push(`${n}簡報太短（${(b.t || "").length} 字，要 ~300）`);
  if (!/^https:\/\/\S+/.test(b.img || "")) bad.push(`${n}簡報冇插圖`);
  if (!Array.isArray(b.src) || b.src.length < 2) bad.push(`${n}簡報來源少過 2 個`);
  // 簡報改成隔日更新：upd 係今日或者尋日都收貨，再舊就 fail
  if (b.upd !== date && b.upd !== FLOOR.slice(0, 10)) bad.push(`${n}簡報 upd=${b.upd}，超過兩日冇更新（今日 ${date}）`);
  if (b.t && !/[一-鿿]/.test(b.t)) bad.push(`${n}簡報唔係中文`);
});

if (!Array.isArray(d.track) || d.track.length < 3) bad.push(`事件追蹤只有 ${(d.track || []).length} 條`);
if (!d._updated) bad.push("_updated 冇填");
if (!fs.existsSync("archive/" + date.replace(/-/g, "") + ".html")) bad.push("冇寫 archive 快照");

console.log("── 自檢報告 " + date + " ──");
console.log(G.map(k => `${NAME[k]}=${(d[k] || []).length}`).join("｜"));
console.log(`事件追蹤=${(d.track || []).length}｜AI簡報=${((d.ai || {}).t || "").length}字｜美伊簡報=${((d.warb || {}).t || "").length}字`);
console.log(`總卡數=${all.length}｜缺圖=${all.filter(([k, u]) => 0).length}`);
if (bad.length) {
  console.log("\n✖ 唔合格，共 " + bad.length + " 項問題：");
  bad.forEach(x => console.log("  • " + x));
  console.log("\n→ 唔准 push，要修好再跑一次。");
  process.exit(1);
}
console.log("\n✅ 全部通過，可以 push。");
