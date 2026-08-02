#!/usr/bin/env node
// 每日新聞 push 前強制自檢
// 用法： node tools/selfcheck.js 2026-07-27
// exit 0 = 通過可以 push；exit 1 = 有問題，唔准 push，要修好再跑
const fs = require("fs");
const date = process.argv[2];
const mode = (process.argv[3] || "am").toLowerCase();   // am = 朝早版(05:45)，pm = 晚間版(18:00)
if (!date) { console.error("用法: node tools/selfcheck.js YYYY-MM-DD [am|pm]"); process.exit(1); }
if (!["am", "pm"].includes(mode)) { console.error("第二個參數只可以係 am 或 pm"); process.exit(1); }

const html = fs.readFileSync("index.html", "utf8");
const m = html.match(/const DB = ([\s\S]*?);\n/);
if (!m) { console.error("✖ 搵唔到 const DB"); process.exit(1); }
let db;
try { db = eval("(" + m[1] + ")"); } catch (e) { console.error("✖ DB 唔係合法 JS: " + e.message); process.exit(1); }
const day = db[date];
if (!day) { console.error("✖ DB 冇 " + date + " 呢個 key"); process.exit(1); }
// 一日兩版：DB[date] = {am:{...}, pm:{...}}；舊日子仍然係單版（平鋪）
const twoEd = !!(day.am || day.pm);
const d = twoEd ? day[mode] : day;
if (!d) { console.error("✖ DB[" + date + "] 冇 " + mode + " 呢版"); process.exit(1); }
const other = twoEd ? day.am : null;   // 只用嚟查晚報有冇重複早報

// 內嵌 script 必須可以編譯
try { require("vm").compileFunction(html.match(/<script>([\s\S]*?)<\/script>/)[1]); }
catch (e) { console.error("✖ 內嵌 script 編譯失敗: " + e.message); process.exit(1); }

const G = ["hks", "hkl", "hke", "hkp", "cn", "us", "tw", "war"];
const NAME = { hks: "香港社會", hkl: "民生", hke: "經濟", hkp: "政治", cn: "中國", us: "美國", tw: "台灣", war: "美伊戰爭" };
// 每組最少條數：社會／民生規格係 8 條，其餘最少 3 條
const MINS = { hks: 8, hkl: 8, hke: 3, hkp: 3, cn: 3, us: 3, tw: 3, war: 3 };
const HK = ["hks", "hkl", "hke", "hkp"];
// 一日兩版之後改用 12 小時窗（留 3 鐘頭鬆動位，硬底線 15 鐘頭）
// am（朝早 05:45 出）：收前一晚 18:00 起嘅料，硬底線 = 前一日 15:00
// pm（晚間 18:00 出）：收今朝 06:00 起嘅料，硬底線 = 今日 03:00
const prev = new Date(date + "T00:00:00Z"); prev.setUTCDate(prev.getUTCDate() - 1);
const prevDay = prev.toISOString().slice(0, 10);
// 2026-08-02 用戶追加（兩條）：
//  ① 晚報香港組唔准出今朝 06:00 之前嘅料（嗰啲係早報範圍），硬底線＝06:00 冇鬆動位
//  ② 國際組唔再放寬到 24 小時：來源乜嘢語言都得（英文／阿拉伯文／日文…），出稿時自己譯做中文，
//     所以「中文料少」唔再係出舊料嘅理由。國際組硬底線同香港組睇齊。
const FLOOR_HK  = mode === "pm" ? date + " 06:00"     : prevDay + " 15:00";
const FLOOR_INT = FLOOR_HK;
const WANT      = mode === "pm" ? date + " 06:00"     : prevDay + " 18:00";
const HKG = ["hks", "hkl", "hke", "hkp"];
const floorOf = k => HKG.includes(k) ? FLOOR_HK : FLOOR_INT;

// 禁用來源（交接 doc「內容版塊」嗰節）：東網on.cc、TVB、大公、文匯、中央社／CNA、政府網
// 08-02 教訓：用咗中央社做台灣卡先發現，自檢捉唔到，所以補呢個 check。
const BAN = [
  [/on\.cc/i, "東網 on.cc"], [/東網/, "東網"],
  [/tvb\.com/i, "TVB"], [/無綫|TVB/i, "TVB"],
  [/takungpao|大公/i, "大公報"], [/wenweipo|文匯/i, "文匯報"],
  [/cna\.com\.tw|focustaiwan/i, "中央社／CNA"], [/^中央社$|中央通訊社/, "中央社"],
  [/\.gov(\.|$)|gov\.hk|gov\.tw|gov\.cn/i, "政府網"],
];
const bad = [];
const warn = [];
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
    else if (x[4] < floorOf(k)) bad.push(`${tag} 發放時間超出時間窗（硬底線 ${floorOf(k)}）：${x[4]}`);
    else if (x[4] < WANT) warn.push(`${tag} 早過 12 小時窗（想要 ${WANT} 之後）：${x[4]}`);
    if (!/^https:\/\/\S+/.test(x[6] || "")) bad.push(`${tag} 冇插圖 og:image`);
    BAN.forEach(([re, n]) => { if (re.test(x[2] || "") || re.test(x[3] || "")) bad.push(`${tag} 用咗禁用來源：${n}（${x[2]}）`); });
  });
});

// 全站唯一性：唔准同一條文章重複出現喺唔同組
const all = [];
G.forEach(k => (d[k] || []).forEach(x => all.push([k, x[3]])));
const seen = {};
all.forEach(([k, u]) => { if (seen[u]) bad.push(`跨組重複連結：${seen[u]} 同 ${k} 用同一條 ${u}`); else seen[u] = k; });

// 晚報唔准重複早報出過嘅文章（用戶 2026-08-02 定案：以「唔准重複」為硬規則）
if (other && mode === "pm") {
  const prevUrls = new Set();
  G.forEach(k => (other[k] || []).forEach(x => prevUrls.add(x[3])));
  const dup = [];
  G.forEach(k => (d[k] || []).forEach(x => { if (prevUrls.has(x[3])) dup.push(`${NAME[k]} 重複咗早報出過嘅：${x[3]}`); }));
  if (dup.length) bad.push(...dup);
}

// 同一單事跨來源撞卡（用戶 2026-08-02 定案：同一單新聞一律只留一條，唔理係咪唔同來源）
// URL 去重捉唔到（hk01 同星島各出一篇），所以用標題＋撮要嘅罕見二字詞重疊做偵測。
// 只出 ⚠ 提示，唔 fail —— 機械判斷有機會誤殺，留返俾出稿嗰個 session 自己睇。
const STOPG = new Set(("警方,調查,被捕,送院,身亡,不治,死亡,事件,現場,消防,救護,男子,女子,涉嫌,拘捕,案件,昨日,今日,香港," +
  "政府,表示,指出,相關,包括,目標,問題,影響,市民,發生,一名,兩名,傷者,證實,回應,批次,實用,司機,車撞,投票," +
  "恢復,暫停,繼續,報復,美軍,威脅,打擊,共和,和黨,一房,警告,美元,服務,宣布").split(","));
function gramsOf(x) {
  const out = new Set();
  [x[0], x[1]].forEach(s => {
    String(s || "").split(/[^一-鿿0-9A-Za-z]+/).filter(Boolean).forEach(seg => {
      if (/^[0-9A-Za-z]+$/.test(seg)) { if (seg.length >= 3) out.add(seg.toLowerCase()); return; }
      for (let i = 0; i + 2 <= seg.length; i++) {
        const g = seg.slice(i, i + 2);
        if (!STOPG.has(g) && !/[0-9]/.test(g)) out.add(g);
      }
    });
  });
  return out;
}
{
  const cards = [];
  G.forEach(k => (d[k] || []).forEach((x, i) => cards.push({ tag: `${NAME[k]}[${i}]`, t: x[0], g: gramsOf(x) })));
  const df = {};
  cards.forEach(c => c.g.forEach(g => df[g] = (df[g] || 0) + 1));
  for (let a = 0; a < cards.length; a++) for (let b = a + 1; b < cards.length; b++) {
    const sh = [...cards[a].g].filter(g => cards[b].g.has(g) && df[g] <= 2);
    if (sh.length >= 3) warn.push(`疑似同一單事：${cards[a].tag}「${cards[a].t}」⟷ ${cards[b].tag}「${cards[b].t}」（共通詞：${sh.join("、")}）→ 只留最新最全嗰條，另一條換第二單`);
  }
}

// 兩篇簡報
[["ai", "AI 動向"], ["warb", "美伊戰爭"]].forEach(([k, n]) => {
  const b = d[k];
  if (!b || typeof b !== "object") { bad.push(`${n}簡報完全冇`); return; }
  if (!b.t || b.t.length < 200) bad.push(`${n}簡報太短（${(b.t || "").length} 字，要 ~300）`);
  if (!/^https:\/\/\S+/.test(b.img || "")) bad.push(`${n}簡報冇插圖`);
  if (!Array.isArray(b.src) || b.src.length < 2) bad.push(`${n}簡報來源少過 2 個`);
  // 簡報每日更新：upd 一定要係今日
  if (b.upd !== date) bad.push(`${n}簡報 upd=${b.upd}，唔係今日 ${date}（即係冇更新過）`);
  if (b.t && !/[一-鿿]/.test(b.t)) bad.push(`${n}簡報唔係中文`);
});

if (!Array.isArray(d.track) || d.track.length < 3) bad.push(`事件追蹤只有 ${(d.track || []).length} 條`);
if (!d._updated) bad.push("_updated 冇填");
if (!fs.existsSync("archive/" + date.replace(/-/g, "") + ".html")) bad.push("冇寫 archive 快照");

console.log("── 自檢報告 " + date + "（" + (mode === "pm" ? "晚報" : "早報") + "，12小時窗 " + WANT + " 起）──");
console.log(G.map(k => `${NAME[k]}=${(d[k] || []).length}`).join("｜"));
console.log(`事件追蹤=${(d.track || []).length}｜AI簡報=${((d.ai || {}).t || "").length}字｜美伊簡報=${((d.warb || {}).t || "").length}字`);
let noimg = 0; G.forEach(k => (d[k] || []).forEach(x => { if (!x[6]) noimg++; }));
console.log(`總卡數=${all.length}｜缺圖=${noimg}`);
if (warn.length) {
  console.log("\n⚠ 提提你（唔會 fail，但盡量換返新料）共 " + warn.length + " 項：");
  warn.forEach(x => console.log("  • " + x));
}
if (bad.length) {
  console.log("\n✖ 唔合格，共 " + bad.length + " 項問題：");
  bad.forEach(x => console.log("  • " + x));
  console.log("\n→ 唔准 push，要修好再跑一次。");
  process.exit(1);
}
console.log("\n✅ 全部通過，可以 push。");
