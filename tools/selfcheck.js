#!/usr/bin/env node
// 每日新聞 push 前強制自檢
// 用法： node tools/selfcheck.js 2026-07-27
// exit 0 = 通過可以 push；exit 1 = 有問題，唔准 push，要修好再跑
const fs = require("fs");
const path = require("path");
const socialPolicy = require('./social-policy');
const { validateLateThreads } = require('./late-threads');
const { verifyAllImages } = require('./image-verifier');

// ── 規矩唯一來源：tools/rules.json（2026-09-21 起）────────────────────
// 時間窗、每組條數、禁用清單、hke 禁用＋合資格獨立來源、hk01 簽名、簡報來源數、track 門檻，
// 全部由 rules.json 讀入；AGENTS.md 對應段落只係人睇嘅抄本。改規矩改 rules.json，再同步 AGENTS.md 文字。
const RULES = (() => {
  const p = path.join(__dirname, "rules.json");
  try { return JSON.parse(fs.readFileSync(p, "utf8")); }
  catch (e) { console.error("✖ 讀唔到 " + p + "：" + e.message); process.exit(1); }
})();
const mkRe = x => new RegExp(x.re, x.flags || "");
const reList = arr => arr.map(x => [mkRe(x), x.name]);
const uniqNames = arr => [...new Set(arr.map(x => x.name))];

if (process.argv.includes("--print-rules")) {
  const W = RULES.window, T = RULES.track, B = RULES.brief;
  const dayName = d => d === "prev" ? "噚日" : "今日";
  const listRe = arr => arr.map(x => `      /${x.re}/${x.flags || ""}  → ${x.name}`).join("\n");
  console.log("── tools/rules.json（selfcheck 用嘅規矩，人睇版）──");
  console.log(`1. 時間窗（HKT，硬底線）：`);
  console.log(`   午報 am：${dayName(W.am.floor.day)} ${W.am.floor.time} 之後、${dayName(W.am.ceil.day)} ${W.am.ceil.time} 之前`);
  console.log(`   夜報 pm：${dayName(W.pm.floor.day)} ${W.pm.floor.time} 之後、${dayName(W.pm.ceil.day)} ${W.pm.ceil.time} 之前`);
  console.log(`   新規則（parse 做 epoch、驗上限、驗未來）由 ${W.strictFrom} 起嘅版先生效；之前嘅舊版照舊只用字串比較驗下限。`);
  console.log(`2. 每組最少條數：` + Object.keys(RULES.mins).filter(k => k[0] !== "_").map(k => `${k}=${RULES.mins[k]}`).join("｜"));
  console.log(`3. 全組禁用來源（${uniqNames(RULES.ban.list).length} 家）：${uniqNames(RULES.ban.list).join("、")}\n${listRe(RULES.ban.list)}`);
  console.log(`4. 經濟組 hke 額外禁用：${uniqNames(RULES.hkeBan.list).join("、")}\n${listRe(RULES.hkeBan.list)}`);
  console.log(`5. 經濟組合資格獨立來源（每版最少一條，任何一間都算數，${uniqNames(RULES.indie.list).length} 家）：${uniqNames(RULES.indie.list).join("／")}\n${listRe(RULES.indie.list)}`);
  console.log(`6. hk01 CDN 圖（URL 配到 ${RULES.hk01.cdnRe}）一定要帶簽名段，長度固定 ${RULES.hk01.sigLen} 個字元`);
  console.log(`7. 簡報：ai 最少 ${B.ai.minSrc} 個來源、${B.ai.minOutlets} 間唔同媒體、正文 ≥${B.ai.minLen} 字；warb 最少 ${B.warb.minSrc} 個來源、${B.warb.minOutlets} 間唔同媒體、正文 ≥${B.warb.minLen} 字`);
  console.log(`8. 事件追蹤：每條 ${T.cols} 欄、最少 ${T.minRows} 條；連續 ${T.lowfreqAfter} 版無新進展→直接轉低頻（唔使問）；連續 ${T.retireAfter} 版→可除名（有已知後續節點一律唔准除名）；回望 ${T.lookback} 版`);
  console.log(`   「無新進展」字眼 regex：/${T.nop}/（同 index.html 嘅 NOP 一致）`);
  if (RULES.social) {
    console.log(`9. 社交來源：由 ${RULES.social.effectiveFrom} 起，只採用 ${RULES.social.platforms.join('、')} 社交原帖（Facebook 及 Instagram 停用）；每組及每篇簡報 ${RULES.social.minRatio * 100}%（向上取整）為${RULES.social.targetOnly ? '搜料目標（記錄差額，唔因差額阻止出稿）' : '硬配額'}。`);
    const lateFrom = RULES.social.lateOriginalPostFrom || RULES.social?.nextPolicy?.lateOriginalPostFrom;
    if (lateFrom) console.log(`   舊 Threads 原帖例外由 ${lateFrom} 起：必須另附窗內首次發佈嘅單篇新報道及兩個真實時間。`);
  }
  if (RULES.image) {
    console.log(`10. 圖片硬性驗證：全部圖片經 HTTP GET 實測，回傳 HTTP 200 且為有效圖片格式（大小 ≥ ${RULES.image.minBytes} bytes；404 或死圖直接 exit 1 唔准出街）。`);
  }
  process.exit(0);
}

const args = process.argv.slice(2);
let candidateFile = null;
const cleanArgs = [];
for (let i = 0; i < args.length; i++) {
  if ((args[i] === "--file" || args[i] === "--candidate") && args[i + 1]) {
    candidateFile = path.resolve(args[++i]);
  } else {
    cleanArgs.push(args[i]);
  }
}
const date = cleanArgs[0];
const mode = (cleanArgs[1] || "am").toLowerCase();   // am = 午報(09:00 出稿)，pm = 夜報(21:00 出稿)。2026-08-15 改制，DB key 照舊 am/pm
if (!date) { console.error("用法: node tools/selfcheck.js YYYY-MM-DD [am|pm] [--file candidate.json]   或   node tools/selfcheck.js --print-rules"); process.exit(1); }
if (!["am", "pm"].includes(mode)) { console.error("第二個參數只可以係 am 或 pm"); process.exit(1); }

const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
// ── 資料唯一來源：data/YYYY-MM-DD.json（2026-09-21 起，DB 由 index.html 拆出）────
// 只讀目標日期及之前最近 30 日（最多 ~60 版，足夠 cover lookback=45 版同上一版去重），唔再每次 parse 晒全部歷史檔。
function loadDB() {
  let dates;
  const idxPath = path.join(ROOT, "data", "index.json");
  try { dates = JSON.parse(fs.readFileSync(idxPath, "utf8")); }
  catch (e) { console.error("✖ 讀唔到 data/index.json：" + e.message); process.exit(1); }
  if (!Array.isArray(dates)) { console.error("✖ data/index.json 唔係陣列"); process.exit(1); }
  const allDates = dates.includes(date) ? dates : [date, ...dates].sort().reverse();
  const pos = allDates.indexOf(date);
  const subset = allDates.slice(Math.max(0, pos), pos + 32);
  const out = {};
  for (const dd of subset) {
    if (dd === date && candidateFile) continue;
    const fp = path.join(ROOT, "data", dd + ".json");
    if (!fs.existsSync(fp)) continue;
    try { out[dd] = JSON.parse(fs.readFileSync(fp, "utf8")); }
    catch (e) { console.error("✖ 讀唔到 " + fp + "：" + e.message); process.exit(1); }
  }
  if (candidateFile) {
    let cand;
    try { cand = JSON.parse(fs.readFileSync(candidateFile, "utf8")); }
    catch (e) { console.error("✖ 讀唔到候選檔 " + candidateFile + "：" + e.message); process.exit(1); }
    const existing = fs.existsSync(path.join(ROOT, "data", date + ".json"))
      ? JSON.parse(fs.readFileSync(path.join(ROOT, "data", date + ".json"), "utf8"))
      : {};
    if (cand && (cand.am || cand.pm)) {
      out[date] = { ...existing, ...(cand.am ? { am: cand.am } : {}), ...(cand.pm ? { pm: cand.pm } : {}) };
    } else {
      out[date] = { ...existing, [mode]: cand };
    }
  }
  return out;
}
const db = loadDB();
const day = db[date];
if (!day) { console.error("✖ DB 冇 " + date + " 呢個 key"); process.exit(1); }
// 一日兩版：DB[date] = {am:{...}, pm:{...}}；舊日子仍然係單版（平鋪）
const twoEd = !!(day.am || day.pm);
const d = twoEd ? day[mode] : day;
if (!d) { console.error("✖ DB[" + date + "] 冇 " + mode + " 呢版"); process.exit(1); }
// 「上一版」＝時間上緊接住嘅前一版：pm 嘅上一版係同日 am；am 嘅上一版係前一日 pm（如前一日缺稿，向後搵最近已存在嘅上一版）。
const prevD = new Date(date + "T00:00:00Z"); prevD.setUTCDate(prevD.getUTCDate() - 1);
const prevKey = prevD.toISOString().slice(0, 10);
let other = null, otherName = "";
if (mode === "pm" && twoEd && day.am) {
  other = day.am;
  otherName = "今日午報";
} else {
  const prevDates = Object.keys(db).filter(k => k < date).sort().reverse();
  const pKey = db[prevKey] ? prevKey : prevDates[0];
  const pd = pKey ? db[pKey] : null;
  if (pd) {
    other = (pd.am || pd.pm) ? (pd.pm || pd.am) : pd;
    otherName = pKey === prevKey
      ? "噚日" + (pd.pm ? "夜報" : pd.am ? "午報" : "") + "（" + pKey + "）"
      : "上一版（" + pKey + (pd.pm ? " pm" : pd.am ? " am" : "") + "）";
  }
}

// 內嵌 script 必須可以編譯
try { require("vm").compileFunction(html.match(/<script>([\s\S]*?)<\/script>/)[1]); }
catch (e) { console.error("✖ 內嵌 script 編譯失敗: " + e.message); process.exit(1); }

const G = ["hks", "hkl", "hke", "hkp", "cn", "us", "tw", "war"];
const NAME = { hks: "香港社會", hkl: "民生", hke: "經濟", hkp: "政治", cn: "中國", us: "美國", tw: "台灣", war: "美伊戰爭" };
// 每組最少條數（rules.json mins）：社會／民生規格係 8 條，其餘最少 3 條
const MINS = Object.fromEntries(G.map(k => [k, RULES.mins[k]]));
G.forEach(k => { if (typeof MINS[k] !== "number") { console.error("✖ rules.json mins 冇 " + k); process.exit(1); } });
const HK = ["hks", "hkl", "hke", "hkp"];
const prev = new Date(date + "T00:00:00Z"); prev.setUTCDate(prev.getUTCDate() - 1);
const prevDay = prev.toISOString().slice(0, 10);
const WIN = RULES.window[mode];
const winDay = spec => (spec.day === "prev" ? prevDay : date) + " " + spec.time;
const WANT      = winDay(WIN.floor);
const CEIL      = (() => {
  const todayHK = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  if (date !== todayHK) return winDay(WIN.ceil);
  const prop = mode === 'pm' ? 'pmView' : 'amView';
  const defView = mode === 'pm' ? '22:00' : '10:00';
  const offsetMin = mode === 'pm' ? 5 : 15;
  let view = defView;
  try { view = JSON.parse(fs.readFileSync(path.join(ROOT, 'settings.json'), 'utf8'))[prop] || view; } catch (_) {}
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(view)) throw Error(`Invalid ${prop} setting`);
  const [hour, minute] = view.split(':').map(Number);
  return new Date(Date.parse(date + 'T00:00:00Z') + (hour * 60 + minute - offsetMin) * 60000).toISOString().slice(0, 16).replace('T', ' ');
})();
const FLOOR_HK  = WANT;
const FLOOR_INT = WANT;
const HKG = ["hks", "hkl", "hke", "hkp"];
const floorOf = k => HKG.includes(k) ? FLOOR_HK : FLOOR_INT;
const STRICT = date >= RULES.window.strictFrom;
// 發放時間 → 真 UTC epoch ms。
const TZ_MIN = (() => { const o = String(RULES.window.tz || "+08:00").replace(":", ""); return (o[0] === "-" ? -1 : 1) * (+o.slice(1, 3) * 60 + +o.slice(3, 5)); })();
function parseHKT(s) {
  const mm = String(s || "").trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?\s*(?:\(港時\))?\s*(Z|[+\-]\d{2}:?\d{2})?$/);
  if (!mm) return null;
  const Y = +mm[1], Mo = +mm[2], D = +mm[3], h = +(mm[4] || 0), mi = +(mm[5] || 0), se = +(mm[6] || 0), off = mm[7];
  if (Mo < 1 || Mo > 12 || D < 1 || D > 31 || h > 23 || mi > 59 || se > 60) return null;
  let offMin = TZ_MIN;
  if (off === "Z") offMin = 0;
  else if (off) { const o = off.replace(":", ""); offMin = (o[0] === "-" ? -1 : 1) * (+o.slice(1, 3) * 60 + +o.slice(3, 5)); }
  return Date.UTC(Y, Mo - 1, D, h, mi, se) - offMin * 60000;
}
const fmtHKT = ms => new Date(ms + TZ_MIN * 60000).toISOString().slice(0, 16).replace("T", " ");
const FLOOR_MS = parseHKT(WANT), CEIL_MS = parseHKT(CEIL), NOW_MS = Date.now();
const LATE_THREADS = RULES.social?.lateOriginalPostFrom || RULES.social?.nextPolicy?.lateOriginalPostFrom;
const LATE_THREADS_ACTIVE = !!LATE_THREADS && `${date} ${mode}` >= LATE_THREADS;

// 禁用來源（rules.json ban）：東網on.cc、TVB、大公、文匯、中央社／CNA、政府網、巴士的報、am730、RTHK、香港商報、星島美國／加拿大
// 08-02 教訓：用咗中央社做台灣卡先發現，自檢捉唔到，所以補呢個 check。
const BAN = reList(RULES.ban.list);
const HK01_CDN = new RegExp(RULES.hk01.cdnRe), HK01_SIG = RULES.hk01.sigLen;
const bad = [];
const warn = [];
if(socialPolicy.active(RULES.social,date,mode)){
  const activeSocialPolicy=socialPolicy.policyFor(RULES.social,date,mode);
  const social=socialPolicy.auditSocial(d,activeSocialPolicy,G);
  bad.push(...social.errors);
  if(activeSocialPolicy.targetOnly)warn.push(...social.shortfalls);
  console.log((activeSocialPolicy.targetOnly?'社交來源目標：':'社交來源配額：')+Object.entries(social.counts).map(([g,c])=>`${g}=${c.social}/${c.total}（${activeSocialPolicy.targetOnly?'目標':'至少'}${c.required}）`).join('｜'));
}
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
    else if (!STRICT) {
      // 舊版（strictFrom 之前）：照舊字串比較，只驗下限
      if (x[4] < floorOf(k)) bad.push(`${tag} 發放時間早過 12 小時硬底線 ${floorOf(k)}：${x[4]}`);
    } else {
      const t = parseHKT(x[4]);
      if (t === null) bad.push(`${tag} 發放時間格式讀唔到（要 YYYY-MM-DD HH:MM，HKT）：${x[4]}`);
      else {
        if (t < FLOOR_MS) {
          if (LATE_THREADS_ACTIVE && socialPolicy.platformOf(x[3]) === 'Threads')
            validateLateThreads(x, { parseHKT, floorMs: FLOOR_MS, ceilMs: CEIL_MS, nowMs: NOW_MS }).forEach(e => bad.push(`${tag} ${e}`));
          else bad.push(`${tag} 發放時間早過 12 小時硬底線 ${floorOf(k)}：${x[4]}`);
        }
        else if (t > CEIL_MS) bad.push(`${tag} 發放時間遲過時間窗上限 ${CEIL}：${x[4]}`);
        if (t > NOW_MS) bad.push(`${tag} 發放時間係未來（本機而家 ${fmtHKT(NOW_MS)} HKT）：${x[4]}`);
        if (x[8] && !(LATE_THREADS_ACTIVE && t < FLOOR_MS && socialPolicy.platformOf(x[3]) === 'Threads')) bad.push(`${tag} freshReport 只可用於合資格舊 Threads 原帖`);
      }
    }
    if (!/^https:\/\/\S+/.test(x[6] || "")) bad.push(`${tag} 冇插圖 og:image`);
    // 2026-08-03 教訓：hk01 CDN 圖一定要帶簽名段，即 .../<id>.jpeg/<hash>[?v=...]。
    // 淨係抄到 .../<id>.jpeg（冇 hash）就會 403 甩圖，網頁顯示灰底「香港01」。
    else if (HK01_CDN.test(x[6]) && !/\.(jpe?g|png|webp)\/[A-Za-z0-9_\-]{10,}/i.test(x[6]))
      bad.push(`${tag} hk01 圖片 URL 冇簽名段（會甩圖）：${x[6]}`);
    // 2026-08-04 教訓：WebFetch 轉 markdown 有機會將簽名段中間某一小截重複咗（例：...Kz__EKz__EK...），
    // 出嚟嘅 URL 一樣「有簽名段」但係 404 甩圖。hk01 簽名段固定 43 個字元（32 bytes base64url），唔等於 43 就一定錯。
    else if (HK01_CDN.test(x[6])) {
      const sig = (x[6].match(/\.(?:jpe?g|png|webp)\/([A-Za-z0-9_\-]+)/i) || [])[1] || "";
      if (sig.length !== HK01_SIG) bad.push(`${tag} hk01 簽名段長度 ${sig.length}（應該係 ${HK01_SIG}，多數係 WebFetch 抄漏／抄多咗）：${x[6]}`);
    }
    // 2026-08-09 教訓：NPR 嘅 og:image 係 Brightspot dims3 轉檔連結，喺我哋個站 hotlink 會失敗變灰底。
    // 網頁 imgFix 而家會自動拆返入面 ?url= 嗰條原圖，但存落 DB 最好一開始就存直接連結。
    if (/\/dims[0-9]?\//.test(x[6] || "") && /[?&]url=/.test(x[6] || ""))
      warn.push(`${tag} og:image 係轉檔連結（Brightspot dims），建議直接抄 ?url= 入面嗰條原圖並改成 https：${x[6].slice(0, 90)}…`);
    BAN.forEach(([re, n]) => { if (re.test(x[2] || "") || re.test(x[3] || "")) bad.push(`${tag} 用咗禁用來源：${n}（${x[2]}）`); });
    if (x[8]?.freshReport) BAN.forEach(([re, n]) => { const report=x[8].freshReport; if (re.test(report.source || '') || re.test(report.url || '')) bad.push(`${tag} 新報道用咗禁用來源：${n}`); });
  });
});

// ── 經濟組來源改制（2026-09-03 用戶定案）────────────────────────
// 用戶：「香港01、星島嘅經濟版隱惡揚善、唱好香港，唔係以事論事」。
// The Standard 係星島集團旗下，同一把聲，一併禁。
// 規矩兩條：
//   ① hke 唔准用 香港01／星島／The Standard（fatal）
//   ② hke 每版**最少一條**要嚟自「合資格獨立來源」清單（見下面 INDIE）
//      ★ 2026-09-04 用戶指示：追新聞 thechasernews 停更近一年，正式取消，唔再算獨立來源
//      ★★ 2026-09-06 用戶定案（揀咗方案 2「擴池」）：原本淨係認端傳媒／綠豆，但 09-06 午報同夜報
//         連續兩版死喺呢條——端傳媒當日 09:00 後零文章、綠豆最新稿停喺 09-04，週末尤其中伏。
//         用戶指示擴闊合資格清單，**任何一間都算數**：端傳媒、綠豆、大紀元財經、世界日報、
//         有線新聞財經 i-CABLE、CNBC、衛報 Guardian、路透社 Reuters、日經亞洲、BBC（英文）、
//         Politico、The Hill、France24、NPR。
//         ⚠ 經濟一週 edigest **唔算**合資格獨立來源（佢本身就係
//         「其餘位」嘅常規填充來源，計埋去等於取消咗呢條規矩），但照舊可以用嚟填其餘兩格。
//   ③ ★ 2026-09-04 用戶指示：etnet 經濟通唔要（hke fatal）；有線新聞財經 i-cable 用得
//   其餘位可以用：有線新聞財經、大紀元財經、世界日報、集誌社、CNBC／BBC／Guardian／Politico 等非港01星島來源
//   ★ 2026-09-18：香港財經時報 businesstimes 已剔除（全站 Cloudflare bot 牆，入唔到）。
//     新加替代：Hong Kong Business hongkongbusiness.hk（published_time +0800 就係 HKT）、鉅亨網 news.cnyes.com（UTC 要 +8）、
//     Mingtiandi mingtiandi.com（UTC 要 +8）。詳情見 AGENTS.md 第 4 節③。
//   ★ 2026-09-19：路透社 reuters.com 全站 401（首頁／分版／Google News 繞路都 401），已由清單剔除；
//     同日新加海峽時報、新加坡 CNA、Asia Times、Fortune、Semafor、Dimsum Daily、Asia Financial、DW 中文（週末／凌晨補位）。
//   ★ 2026-09-21：兩張清單改由 tools/rules.json（hkeBan／indie）讀入，報錯訊息由清單自動生成，唔會再同 AGENTS.md 甩拍。
{
  const HKE_BAN = reList(RULES.hkeBan.list);
  const INDIE = reList(RULES.indie.list);
  const a = d.hke || [];
  a.forEach((x, i) => {
    const h = HKE_BAN.find(([re]) => re.test(x[2] || "") || re.test(x[3] || ""));
    if (h) bad.push(`經濟[${i}] 經濟組禁用來源：${h[1]}（用戶 2026-09-03 定案：唱好香港、唔以事論事）`);
    if (x[8]?.freshReport) {
      const report=x[8].freshReport;
      const rh=HKE_BAN.find(([re]) => re.test(report.source || '') || re.test(report.url || ''));
      if (rh) bad.push(`經濟[${i}] 窗內新報道來自經濟組禁用來源：${rh[1]}`);
    }
  });
  const hit = a.filter(x => INDIE.some(([re]) => re.test(x[2] || "") || re.test(x[3] || "")));
  if (a.length && hit.length === 0)
    bad.push("經濟組每版最少要有一條嚟自合資格獨立來源：" + uniqNames(RULES.indie.list).join("／") + "（用戶 2026-09-06 定案「擴池」，2026-09-19 再擴；清單見 tools/rules.json indie）");
}

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
  if (!b.t || b.t.length < RULES.brief[k].minLen) bad.push(`${n}簡報太短（${(b.t || "").length} 字，要 ~300）`);
  if (!/^https:\/\/\S+/.test(b.img || "")) bad.push(`${n}簡報冇插圖`);
  // 2026-08-08 用戶要求：簡報要多幾個 source，唔可以成篇都係同一間媒體
  // （08-06 至 08-08 好多版嘅 AI 簡報淨係得兩條，兩條都係 TechCrunch）
  const MINSRC = RULES.brief[k].minSrc;       // AI 動向要 4 個，美伊要 3 個（rules.json brief）
  const MINOUT = RULES.brief[k].minOutlets;   // 唔同媒體數目下限
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
// 除名門檻（2026-08-31 用戶定案，rules.json track）：連續 20 版無新進展→直接轉低頻（加 lowfreq.json，唔使問）；
// 連續 40 版→可除名（加 retired.json）；但凡有已知後續節點（開庭／聆訊／報告發表／正式開通）一律唔准除名，改續低頻。
// 舊做法（硬性淨係出 6 條）令到「港·水務署五年換喉」等線索俾新事件靜靜雞頂走，用戶 08-07 捉到。
const RET = (() => {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(__dirname, "retired.json"), "utf8"));
    return new Set((Array.isArray(j) ? j : j.retired || []).map(x => typeof x === "string" ? x : x.name));
  } catch (e) { return new Set(); }
})();
// 低頻跟進名單（2026-08-09 用戶批准）：仲要每版照出，但唔會再出「連續 N 版無新進展」⚠。
const LOW_MAP = (() => {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(__dirname, "lowfreq.json"), "utf8"));
    const arr = (Array.isArray(j) ? j : j.lowfreq || []);
    const today = date;
    const m = new Map();
    for (const x of arr) {
      const obj = typeof x === "string" ? { name: x } : x;
      if (!obj.until || today <= obj.until) m.set(obj.name, obj);
    }
    return m;
  } catch (e) { return new Map(); }
})();
const LOW = new Set(LOW_MAP.keys());
// NOP：「無新進展」字眼，唯一版本喺 rules.json track.nop；index.html 個 NOP 一定要同佢一模一樣（下面有核對）。
const NOP = new RegExp(RULES.track.nop);
{
  const idxNop = (html.match(/const NOP=\/(.*?)\/;/) || [])[1];
  if (idxNop === undefined) bad.push("index.html 搵唔到 const NOP=/…/;（renderNews 入面）");
  else if (idxNop !== RULES.track.nop) bad.push(`index.html 嘅 NOP regex 同 tools/rules.json track.nop 唔一致：\n      index.html: /${idxNop}/\n      rules.json: /${RULES.track.nop}/`);
}
const TRK = RULES.track;
if (!Array.isArray(d.track) || d.track.length < TRK.minRows) bad.push(`事件追蹤只有 ${(d.track || []).length} 條`);
else {
  // 格式：一定要 3 欄 [事件名, 狀態, 今日進展]。2 欄會令網頁出「undefined」（08-06 晚報中招）。
  d.track.forEach((r, i) => {
    if (!Array.isArray(r) || r.length !== TRK.cols)
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
        bad.push(`事件追蹤漏咗${otherName}出過嘅「${r[0]}」→ 唔准靜靜雞除名。冇新進展就照出（狀態寫「跟進中」、進展寫「今日無新進展」＋帶返最後一次進展）；要除名先要連續 ${TRK.retireAfter} 版無新進展而且冇已知後續節點，再將事件名加入 tools/retired.json`);
    });
  }
  // 連續多版無新進展 → ⚠（唔會 fail）。2026-08-31 起：20 版轉低頻、40 版可除名（有已知後續除外）
  const edsList = [];
  Object.keys(db).sort().forEach(dt => {
    const v = db[dt];
    if (v.am || v.pm) { if (v.am) edsList.push({ k: dt + " am", t: v.am.track }); if (v.pm) edsList.push({ k: dt + " pm", t: v.pm.track }); }
    else edsList.push({ k: dt, t: v.track });
  });
  const curKey = twoEd ? date + " " + mode : date;
  const ci = edsList.findIndex(e => e.k === curKey);
  // 2026-08-31 用戶定案：門檻改做 20 版轉低頻／40 版除名，所以回望窗要開到 45 版（原本只有 5 版，n 永遠去唔到 20）
  const past = ci > 0 ? edsList.slice(Math.max(0, ci - TRK.lookback), ci).reverse() : [];
  // ── 交叉核對：今日有相關新聞卡，就唔准寫「今日無新進展」──────────────
  const TKEYS = (() => {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(__dirname, "track_keys.json"), "utf8"));
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
    if (RET.has(r[0])) return;
    if (!NOP.test(String(r[1]) + String(r[2]))) return;
    let n = 1;
    for (const e of past) {
      const p = (e.t || []).find(x => Array.isArray(x) && x[0] === r[0]);
      if (p && NOP.test(String(p[1]) + String(p[2]))) n++; else break;
    }
    const lowEntry = LOW_MAP.get(r[0]);
    if (n >= TRK.retireAfter) {
      if (!lowEntry?.keepUntilNode)
        warn.push(`「${r[0]}」已經連續 ${n} 版無新進展（≥${TRK.retireAfter}）→ 按 2026-08-31 用戶定案可以除名，加入 tools/retired.json。⚠ 但凡有已知後續節點（開庭／聆訊／報告發表／正式開通嘅實日子）一律唔准除名，改為續低頻（設 keepUntilNode: true）`);
    } else if (!LOW.has(r[0]) && n >= TRK.lowfreqAfter) {
      warn.push(`「${r[0]}」已經連續 ${n} 版無新進展（≥${TRK.lowfreqAfter}）→ 按 2026-08-31 用戶定案直接轉低頻跟蹤，加入 tools/lowfreq.json，唔使問用戶、唔准除名`);
    }
  });
}
if (!d._updated) bad.push("_updated 冇填");
// 2026-09-21：archive/ 快照已由 git commit 取代（出稿流程第 8 步取消），唔再驗 archive 檔存在。

(async () => {
  console.log("── 自檢報告 " + date + "（" + (mode === "pm" ? "夜報" : "午報") + "，12小時窗 " + WANT + " 起）──");
  console.log(G.map(k => `${NAME[k]}=${(d[k] || []).length}`).join("｜"));
  console.log(`事件追蹤=${(d.track || []).length}｜AI簡報=${((d.ai || {}).t || "").length}字｜美伊簡報=${((d.warb || {}).t || "").length}字`);
  let noimg = 0; G.forEach(k => (d[k] || []).forEach(x => { if (!x[6]) noimg++; }));
  console.log(`總卡數=${all.length}｜缺圖=${noimg}`);
  if (warn.length) {
    console.log("\n⚠ 提提你（唔會 fail，但盡量換返新料）共 " + warn.length + " 項：");
    warn.forEach(x => console.log("  • " + x));
  }

  // ── 🖼 驗圖：強制 HTTP GET 實測（2026-10-19 升級為強制 blocking）────
  const need = [];
  G.forEach(k => (d[k] || []).forEach((x, i) => {
    const u = x[6] || "";
    if (!u) return;
    need.push({
      group: k,
      tag: `${NAME[k]}[${i}]`,
      title: x[0] || "",
      source: x[2] || "",
      articleUrl: x[3] || "",
      url: u
    });
  }));
  [["ai", "AI 動向"], ["warb", "美伊戰爭"]].forEach(([k, n]) => {
    const b = d[k] || {}; const u = b.img || "";
    const from = (b.src && b.src[0] && b.src[0][1]) || "（來源見 src）";
    if (u) need.push({
      group: k,
      tag: `${n}簡報插圖`,
      title: `${n}封面`,
      source: (b.src && b.src[0] && b.src[0][0]) || "",
      articleUrl: from,
      url: u
    });
  });

  const skipFetch = process.argv.includes("--skip-image-fetch");
  if (need.length && !skipFetch) {
    console.log(`\n🖼 正在實測驗圖（共 ${need.length} 條，發送 HTTP GET 實測並檢查二進制格式）...`);
    const imgRule = RULES.image || { concurrency: 8, minBytes: 80, timeoutMs: 15000 };
    const { results, failures } = await verifyAllImages(need, imgRule.concurrency);

    if (failures.length > 0) {
      console.log(`\n❌ 發現 ${failures.length} 條圖片實測失敗（404 或格式無效）：`);
      failures.forEach(f => {
        const msg = `${f.tag}「${f.title}」圖片無效：${f.verification.reason}（URL: ${f.url}）`;
        console.log(`  • ❌ ${msg}`);
        bad.push(`🖼 [驗圖失敗] ${msg}`);
      });
    } else {
      console.log(`✅ 圖片實測全部通過：${need.length} 條圖片全部 HTTP 200 且為有效圖片格式。`);
    }

    // 當非候選檔且全部通過時，自動將逐圖驗證證據保存至 docs/verification/
    if (!candidateFile && failures.length === 0) {
      const verDir = path.join(ROOT, "docs", "verification");
      try {
        if (!fs.existsSync(verDir)) fs.mkdirSync(verDir, { recursive: true });
        const verPath = path.join(verDir, `${date}-${mode}.json`);
        const verOutput = results.map(r => ({
          group: r.group,
          title: r.title,
          source: r.source,
          url: r.articleUrl,
          ogImage: r.url,
          verification: r.verification
        }));
        fs.writeFileSync(verPath, JSON.stringify(verOutput, null, 2) + "\n", "utf8");
        console.log(`📁 逐圖驗證紀錄已自動同步寫入：docs/verification/${date}-${mode}.json`);
      } catch (e) {
        console.warn(`⚠ 寫入 docs/verification 失敗：${e.message}`);
      }
    }
  } else if (skipFetch) {
    console.log(`\n⚠ 已跳過實測驗圖（指定咗 --skip-image-fetch）`);
  }

  if (bad.length) {
    console.log("\n✖ 唔合格，共 " + bad.length + " 項問題：");
    bad.forEach(x => console.log("  • " + x));
    console.log("\n→ 唔准 push，要修好再跑一次。");
    process.exit(1);
  }
  console.log("\n✅ 全部通過，可以 push。");
})().catch(err => {
  console.error("✖ 自檢執行出錯：", err);
  process.exit(1);
});
