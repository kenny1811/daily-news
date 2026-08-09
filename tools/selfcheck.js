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
// 「上一版」＝時間上緊接住嘅前一版：pm 嘅上一版係同日 am；am 嘅上一版係前一日 pm（前一日單版就係佢自己）。
// 2026-08-03 教訓：本來只查同日 am↔pm，結果 08-03 早報照抄咗 08-02 晚報兩條，完全捉唔到。
const prevD = new Date(date + "T00:00:00Z"); prevD.setUTCDate(prevD.getUTCDate() - 1);
const prevKey = prevD.toISOString().slice(0, 10);
let other = null, otherName = "";
if (mode === "pm") { other = twoEd ? day.am : null; otherName = "今朝早報"; }
else {
  const pd = db[prevKey];
  if (pd) { other = (pd.am || pd.pm) ? (pd.pm || pd.am) : pd; otherName = "尋晚晚報（" + prevKey + "）"; }
}

// 內嵌 script 必須可以編譯
try { require("vm").compileFunction(html.match(/<script>([\s\S]*?)<\/script>/)[1]); }
catch (e) { console.error("✖ 內嵌 script 編譯失敗: " + e.message); process.exit(1); }

const G = ["hks", "hkl", "hke", "hkp", "cn", "us", "tw", "war"];
const NAME = { hks: "香港社會", hkl: "民生", hke: "經濟", hkp: "政治", cn: "中國", us: "美國", tw: "台灣", war: "美伊戰爭" };
// 每組最少條數：社會／民生規格係 8 條，其餘最少 3 條
const MINS = { hks: 8, hkl: 8, hke: 3, hkp: 3, cn: 3, us: 3, tw: 3, war: 3 };
const HK = ["hks", "hkl", "hke", "hkp"];
// 2026-08-04 用戶更正：**12 小時窗本身就係硬底線，冇鬆動位**。
// 之前 session 自己加咗個「15 鐘頭硬底線 + 12 鐘頭只出 ⚠」嘅寬限，用戶講明從來冇定過，已取消。
// am（朝早 06:00 出）：只收前一晚 18:00 之後嘅料，早過即 fail
// pm（晚間 18:00 出）：只收今朝 06:00 之後嘅料，早過即 fail
// 香港組同國際組完全相同（來源乜嘢語言都得，出稿自己譯，「中文料少」唔係出舊料嘅理由）。
const prev = new Date(date + "T00:00:00Z"); prev.setUTCDate(prev.getUTCDate() - 1);
const prevDay = prev.toISOString().slice(0, 10);
const WANT      = mode === "pm" ? date + " 06:00"     : prevDay + " 18:00";
const FLOOR_HK  = WANT;
const FLOOR_INT = WANT;
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
  // 2026-08-08 用戶指示：唔要巴士的報
  [/bastillepost/i, "巴士的報"], [/巴士的報/, "巴士的報"],
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
    else if (x[4] < floorOf(k)) bad.push(`${tag} 發放時間早過 12 小時硬底線 ${floorOf(k)}：${x[4]}`);
    if (!/^https:\/\/\S+/.test(x[6] || "")) bad.push(`${tag} 冇插圖 og:image`);
    // 2026-08-03 教訓：hk01 CDN 圖一定要帶簽名段，即 .../<id>.jpeg/<hash>[?v=...]。
    // 淨係抄到 .../<id>.jpeg（冇 hash）就會 403 甩圖，網頁顯示灰底「香港01」。
    else if (/cdn\.hk01\.com\//.test(x[6]) && !/\.(jpe?g|png|webp)\/[A-Za-z0-9_\-]{10,}/i.test(x[6]))
      bad.push(`${tag} hk01 圖片 URL 冇簽名段（會甩圖）：${x[6]}`);
    // 2026-08-04 教訓：WebFetch 轉 markdown 有機會將簽名段中間某一小截重複咗（例：...Kz__EKz__EK...），
    // 出嚟嘅 URL 一樣「有簽名段」但係 404 甩圖。hk01 簽名段固定 43 個字元（32 bytes base64url），唔等於 43 就一定錯。
    else if (/cdn\.hk01\.com\//.test(x[6])) {
      const sig = (x[6].match(/\.(?:jpe?g|png|webp)\/([A-Za-z0-9_\-]+)/i) || [])[1] || "";
      if (sig.length !== 43) bad.push(`${tag} hk01 簽名段長度 ${sig.length}（應該係 43，多數係 WebFetch 抄漏／抄多咗）：${x[6]}`);
    }
    // 2026-08-09 教訓：NPR 嘅 og:image 係 Brightspot dims3 轉檔連結，喺我哋個站 hotlink 會失敗變灰底。
    // 網頁 imgFix 而家會自動拆返入面 ?url= 嗰條原圖，但存落 DB 最好一開始就存直接連結。
    if (/\/dims[0-9]?\//.test(x[6] || "") && /[?&]url=/.test(x[6] || ""))
      warn.push(`${tag} og:image 係轉檔連結（Brightspot dims），建議直接抄 ?url= 入面嗰條原圖並改成 https：${x[6].slice(0, 90)}…`);
    BAN.forEach(([re, n]) => { if (re.test(x[2] || "") || re.test(x[3] || "")) bad.push(`${tag} 用咗禁用來源：${n}（${x[2]}）`); });
  });
});

// 全站唯一性：唔准同一條文章重複出現喺唔同組
const all = [];
G.forEach(k => (d[k] || []).forEach(x => all.push([k, x[3]])));
const seen = {};
all.forEach(([k, u]) => { if (seen[u]) bad.push(`跨組重複連結：${seen[u]} 同 ${k} 用同一條 ${u}`); else seen[u] = k; });

// 唔准重複「上一版」出過嘅文章（用戶 2026-08-02 定案；2026-08-03 擴展到跨日：早報 vs 尋晚晚報）
if (other) {
  const prevUrls = new Set();
  G.forEach(k => (other[k] || []).forEach(x => prevUrls.add(x[3])));
  const dup = [];
  G.forEach(k => (d[k] || []).forEach(x => { if (prevUrls.has(x[3])) dup.push(`${NAME[k]} 重複咗${otherName}出過嘅：${x[3]}`); }));
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
  G.forEach(k => (d[k] || []).forEach((x, i) => cards.push({ tag: `${NAME[k]}[${i}]`, t: x[0], g: gramsOf(x), cur: true })));
  // 2026-08-03 加：連上一版一齊比（早報 vs 尋晚晚報／晚報 vs 今朝早報）。
  // 同一單事跨版跟進報導 URL 唔同，URL 去重捉唔到，一定要靠詞重疊。
  if (other) G.forEach(k => (other[k] || []).forEach((x, i) => cards.push({ tag: `${otherName}·${NAME[k]}[${i}]`, t: x[0], g: gramsOf(x), cur: false })));
  const df = {};
  cards.forEach(c => c.g.forEach(g => df[g] = (df[g] || 0) + 1));
  for (let a = 0; a < cards.length; a++) for (let b = a + 1; b < cards.length; b++) {
    if (!cards[a].cur && !cards[b].cur) continue;          // 兩張都係舊版嘅唔關事
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
  // 2026-08-08 用戶要求：簡報要多幾個 source，唔可以成篇都係同一間媒體
  // （08-06 至 08-08 好多版嘅 AI 簡報淨係得兩條，兩條都係 TechCrunch）
  const MINSRC = k === "ai" ? 4 : 3;          // AI 動向要 4 個，美伊要 3 個
  const MINOUT = k === "ai" ? 3 : 2;          // 唔同媒體數目下限
  const srcArr = Array.isArray(b.src) ? b.src : [];
  if (srcArr.length < MINSRC) bad.push(`${n}簡報得 ${srcArr.length} 個來源（要最少 ${MINSRC} 個）`);
  // 來源名有機會寫成「TechCrunch — 標題」，比對嗰陣要斬走破折號後面嗰截
  const outlet = s => String(s || "").split(/\s*[—–|｜:：]\s*/)[0].trim().toLowerCase();
  const outlets = new Set(srcArr.map(x => outlet(Array.isArray(x) ? x[0] : x)).filter(Boolean));
  if (srcArr.length >= 2 && outlets.size < MINOUT)
    bad.push(`${n}簡報得 ${outlets.size} 間媒體（${[...outlets].join("／")}），要最少 ${MINOUT} 間唔同媒體`);
  const surls = srcArr.map(x => Array.isArray(x) ? x[1] : "").filter(Boolean);
  if (new Set(surls).size !== surls.length) bad.push(`${n}簡報有重複來源連結`);
  surls.forEach(u => { if (!/^https:\/\/\S+$/.test(u)) bad.push(`${n}簡報來源連結有問題：${u}`); });
  // 簡報每日更新：upd 一定要係今日
  if (b.upd !== date) bad.push(`${n}簡報 upd=${b.upd}，唔係今日 ${date}（即係冇更新過）`);
  if (b.t && !/[一-鿿]/.test(b.t)) bad.push(`${n}簡報唔係中文`);
});

// ── 事件追蹤（2026-08-07 用戶定案）──────────────────────────────
// 唔再有上限：所有仲生效嘅線索每版都要照出，冇新進展就寫「今日無新進展」＋帶返最後一次進展。
// 要除名一定要事件真係完咗，而且**要問過用戶**；用戶批准之後將事件名加入 tools/retired.json 先過到自檢。
// 舊做法（硬性淨係出 6 條）令到「港·水務署五年換喉」等線索俾新事件靜靜雞頂走，用戶 08-07 捉到。
const RET = (() => {
  try {
    const j = JSON.parse(fs.readFileSync("tools/retired.json", "utf8"));
    return new Set((Array.isArray(j) ? j : j.retired || []).map(x => typeof x === "string" ? x : x.name));
  } catch (e) { return new Set(); }
})();
const NOP = /今日無新進展|今日未見新|未見新進展|未見新報道|無新進展|冇新進展/;
if (!Array.isArray(d.track) || d.track.length < 3) bad.push(`事件追蹤只有 ${(d.track || []).length} 條`);
else {
  // 格式：一定要 3 欄 [事件名, 狀態, 今日進展]。2 欄會令網頁出「undefined」（08-06 晚報中招）。
  d.track.forEach((r, i) => {
    if (!Array.isArray(r) || r.length !== 3)
      bad.push(`事件追蹤[${i}] 唔係 3 欄 [事件名, 狀態, 今日進展]：${JSON.stringify(r).slice(0, 70)}`);
    else if (!String(r[0] || "").trim() || !String(r[1] || "").trim() || !String(r[2] || "").trim())
      bad.push(`事件追蹤[${i}] 有空欄：${JSON.stringify(r).slice(0, 70)}`);
  });
  const tnames = new Set(d.track.map(r => Array.isArray(r) ? r[0] : ""));
  if (tnames.size !== d.track.length) bad.push("事件追蹤有重複事件名");
  // 唔准靜靜雞除名：上一版有嘅，今版一定要有
  if (other && Array.isArray(other.track)) {
    other.track.forEach(r => {
      if (!Array.isArray(r) || !r[0]) return;
      if (!tnames.has(r[0]) && !RET.has(r[0]))
        bad.push(`事件追蹤漏咗${otherName}出過嘅「${r[0]}」→ 唔准靜靜雞除名。冇新進展就照出（狀態寫「跟進中」、進展寫「今日無新進展」＋帶返最後一次進展）；真係完咗就要問用戶，用戶批准後將事件名加入 tools/retired.json`);
    });
  }
  // 連續多版無新進展 → ⚠ 建議問用戶除唔除名（唔會 fail）
  const edsList = [];
  Object.keys(db).sort().forEach(dt => {
    const v = db[dt];
    if (v.am || v.pm) { if (v.am) edsList.push({ k: dt + " am", t: v.am.track }); if (v.pm) edsList.push({ k: dt + " pm", t: v.pm.track }); }
    else edsList.push({ k: dt, t: v.track });
  });
  const curKey = twoEd ? date + " " + mode : date;
  const ci = edsList.findIndex(e => e.k === curKey);
  const past = ci > 0 ? edsList.slice(Math.max(0, ci - 5), ci).reverse() : [];
  // ── 交叉核對：今日有相關新聞卡，就唔准寫「今日無新進展」──────────────
  // 2026-08-07 教訓：08-07 晚報有「荃灣工地爆食水管」同「北角福蔭道爆水管」兩張卡，
  // 但「港·水務署五年換喉」照抄住「今日無新進展；最後進展（08-04）」，用戶即刻捉到。
  const TKEYS = (() => {
    try {
      const j = JSON.parse(fs.readFileSync("tools/track_keys.json", "utf8"));
      return j.keys || j;
    } catch (e) { return {}; }
  })();
  const todayCards = [];
  G.forEach(k => (d[k] || []).forEach((x, i) => todayCards.push({ tag: `${NAME[k]}[${i}]`, t: x[0] || "", txt: (x[0] || "") + " " + (x[1] || "") })));
  Object.keys(TKEYS).forEach(name => {
    const res = (TKEYS[name] || []).map(p => { try { return new RegExp(p, "i"); } catch (e) { return null; } }).filter(Boolean);
    if (!res.length) return;
    const hit = todayCards.filter(c => res.some(re => re.test(c.txt)));
    if (!hit.length) return;
    const row = d.track.find(r => Array.isArray(r) && r[0] === name);
    if (!row) {
      warn.push(`今日有 ${hit.length} 張卡好似關「${name}」事（${hit.slice(0, 2).map(h => h.tag + "「" + h.t + "」").join("、")}），但事件追蹤冇呢條線索 → 睇下使唔使加返`);
      return;
    }
    if (NOP.test(String(row[1]) + String(row[2])))
      bad.push(`事件追蹤「${name}」寫住「無新進展」，但今日明明有相關新聞卡：${hit.map(h => h.tag + "「" + h.t + "」").join("、")} → 一定要寫返今日嘅實質進展`);
  });
  d.track.forEach(r => {
    if (!Array.isArray(r) || r.length !== 3) return;
    if (!NOP.test(String(r[1]) + String(r[2]))) return;
    let n = 1;
    for (const e of past) {
      const p = (e.t || []).find(x => Array.isArray(x) && x[0] === r[0]);
      if (p && NOP.test(String(p[1]) + String(p[2]))) n++; else break;
    }
    if (n >= 4) warn.push(`「${r[0]}」已經連續 ${n} 版無新進展 → 喺回覆度問返用戶洗唔洗除名；用戶批准先加入 tools/retired.json，唔准自己刪`);
  });
}
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
// ── 🖼 要人手驗圖嘅清單（2026-08-09 加）─────────────────────────
// selfcheck 淨係驗到 URL 格式，驗唔到張圖真係開唔開到（雲端 container 對外封晒，curl 一律 403）。
// 2026-08-09 教訓：以色列時報張圖路徑被抄成 /2026/05/（跟咗檔名入面嘅 20260525），
// 實際 og:image 係 /2026/08/，格式完全正確所以自檢放行，出街先發現甩圖。
// 做法：下面每條 URL 用 WebFetch 開一次——
//   回「Image content is not supported」＝ 張圖存在，OK
//   回 404 / CLIENT_ERROR ＝ URL 錯咗，要返去原文重新逐字抄 og:image，唔准自己砌路徑
{
  const need = [];
  G.forEach(k => (d[k] || []).forEach((x, i) => {
    const u = x[6] || "";
    if (!u || /cdn\.hk01\.com|image\.hkhl\.hk/.test(u)) return;   // 呢兩個 CDN 已有專門格式檢查
    need.push(`${NAME[k]}[${i}] ${u}`);
  }));
  [["ai", "AI 動向"], ["warb", "美伊戰爭"]].forEach(([k, n]) => {
    const u = (d[k] || {}).img || "";
    if (u && !/cdn\.hk01\.com|image\.hkhl\.hk/.test(u)) need.push(`${n}簡報插圖 ${u}`);
  });
  if (need.length) {
    console.log(`\n🖼 要 WebFetch 逐條驗圖（非 hk01／星島，共 ${need.length} 條）——回「Image content is not supported」＝ OK；回 404 ＝ URL 抄錯，要返原文重抄：`);
    need.forEach(x => console.log("  • " + x));
  }
}

if (bad.length) {
  console.log("\n✖ 唔合格，共 " + bad.length + " 項問題：");
  bad.forEach(x => console.log("  • " + x));
  console.log("\n→ 唔准 push，要修好再跑一次。");
  process.exit(1);
}
console.log("\n✅ 全部通過，可以 push。");
