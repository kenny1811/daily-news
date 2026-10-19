# Antigravity / Codex 接手須知（2026-10-18 更新）

文件讀取頻率：同一個 chat 首次讀取適用規則一次；已自動載入或實際讀過嘅相同內容視為已讀。規則有更新先重讀有更新嗰份，唔因新任務或追問重讀全文。README、project 摘要、歷史及其他參考資料只喺當前工作有需要時讀相關部分。

呢個項目（`D:\Projects\Daily News`）由 Antigravity 接手 AI 編採及排程（舊 Codex 排程已停用）。AGENTS.md 係現行操作規矩；CLAUDE.md 只保留兼容入口。
- 每次先讀本機時間，唔准估時間。回應時間格式跟 `D:\Projects\AGENTS.md` 總規則。
- 明確要求改程式嘅任務（包括今次遷移）已授權相關修改；日常出稿只改新聞資料、工作紀錄及必要追蹤清單。唔好趁出稿改程式。
- 新聞生產排程見 docs/codex-schedule.md（Antigravity sidecar：`daily-news`，一日兩次）。唔用舊 Claude 或舊 Codex 排程工具。
- 出稿前讀 docs/source-notes/README.md；所附來源筆記係舊經驗，實際文章時間、圖片同可用性要當次核實。
- 以下來源限制及配額保留；機器檢查以 tools/rules.json 為準。規則文字如有衝突，要報告，唔好為過關靜靜改 selfcheck。
- 四組編採係工作分工，唔要求同時有四個子 agent。遵守當次 agent 容量；總容量四個時，最多三個子 agent 加主 agent。
- 自動任務唔會有人即時答，常規取捨按規矩決定；需要用戶處理嘅阻礙要如實報告。
- 已有同日同版就唔重複出稿或覆寫。中斷後恢復先核對現有資料及紀錄。
- 如上一日缺稿，去 data/index.json 搵最近已存在、早於今版嘅 edition 作去重及事件追蹤基準；唔好因為缺稿丟失 track。唔自動補寫歷史新聞。
- 寫資料前備份本次涉及嘅檔案及記錄 git status；失敗只回復自己今次改動，保留別人工作。每日稿 commit 只包括今次出稿檔案；唔用 git add -A。
- 先在不公開嘅暫存位置砌好完整 JSON，再寫入每日檔，避免 server 讀到半截 JSON。原有另一版要完整保留。
- 午報死線未合格可依既有例外出稿，但要逐項揭露問題；夜報未合格放棄並還原今次改動。唔可以編造事實、來源、時間或圖片補配額。
- 驗圖要保留 HTTP status、圖片實際類型／大小同原文 og:image 比對結果；錯誤 HTML 頁就算 HTTP 200 都唔當圖片成功。
- 本文件以下沿用原有編採手冊；歷史日期係當時勘測日期，唔代表現時網站仍有相同行為。

---
# 門前直樹每日新聞 — 本機出稿規矩

呢個資料夾係「每日新聞簡報」嘅出稿工作區。
> **規矩放邊度（2026-09-21 起）**：selfcheck 會機械驗嘅 8 組規矩——時間窗、每組條數、禁用來源、hke 禁用＋合資格獨立來源、hk01 簽名段、簡報來源數、事件追蹤門檻、「無新進展」字眼——**機器版統一喺 `tools/rules.json`**，`tools/selfcheck.js` 直接讀佢，唔再自己寫一份。本檔對應段落（有標「以 `tools/rules.json` 為準」嗰啲）係俾人睇嘅抄本，內容同 rules.json 一致；改規矩要兩邊一齊改，跑 `node tools/selfcheck.js --print-rules` 可以印返機器版核對。

## 工作規矩
共通規矩統一寫喺上一層嘅
[`D:\Projects\AGENTS.md`](../AGENTS.md) —— 同一個 chat 首次讀一次共通規矩，規則有更新先重讀；本項目嘅 Codex 特別規則見下文。

## 0. 講嘢方式（唔跟＝做錯）
- **唔好用匪語**。
- 用**正式廣東話**：「噚晚」唔係「尋晚」；唔好用生僻字。
- 回應精簡，問乜答乜，唔使講你嘅思考過程。
- 提供資料必需附 source link。

## 1. 一個 prompt，一日兩版
每次開工**第一件事讀本機時間**（`date` 或 PowerShell `Get-Date`，部機係香港時區，可信）。然後自己判斷做邊版：

| 本機時間 | 做邊版 | DB key |
|---|---|---|
| 06:00 – 14:59 | **午報** ☀️ | `am` |
| 18:00 – 翌日 02:59 | **夜報** 🌙 | `pm` |
| 其他時間 | **問返用戶**，唔好估 | — |

夜報如果係凌晨 00:00–02:59 開，日期用**前一日**（即係補做嗰日嘅夜報）。

## 2. ★ 時間窗＝硬底線，冇鬆動位
以 `tools/rules.json` → `window` 為準，內容如下：
| 版 | 只收呢個時段發放（HKT）嘅新聞 |
|---|---|
| 午報 am | **噚日 21:00 之後、今日 09:30 之前** |
| 夜報 pm | **今日 09:00 之後、今日 21:55 之前** |

香港組（hks/hkl/hke/hkp）同國際組（cn/us/tw/war）**完全相同**。早過底線一秒都唔要，selfcheck 會 exit 1。
條數唔夠**唔准放寬時間**，要去搵多啲來源；真係夠唔到就報俾用戶知邊組唔夠，都唔准出超窗嘅料。
**2026-10-14 am 起嘅 Threads 原帖例外**：當窗內單篇報道首次披露／核實舊原帖所涉新聞，卡可連較早嘅散戶第一手 Threads 原帖，但要保留原帖真實發放時間，並喺第九欄 `freshReport` 附上窗內單篇報道嘅來源、URL、首次發放時間及新增資訊。時間窗檢查改用該報道嘅首發時間；原帖本身唔假裝係窗內，亦唔設任意「更新時間」重置。只係舊聞翻炒、轉載舊帖或兩者冇直接關係，一律唔適用；兩條連結都要核實，舊原帖仍須符合第一手、圖片、禁用及去重要求。13 日及之前嘅版唔追溯改規則。
★ 收 subagent 料之前、同埋任何「趕唔切」嘅判斷之前，**重讀一次時鐘**，唔好一路推算。

## 3. 出稿流程（本機直出，唔經 GitHub）
> **2026-09-21 DB 拆檔**：新聞資料由 `index.html` 入面嗰句 `const DB = {...}`（2.3MB+、日日變大）拆咗做 `data/YYYY-MM-DD.json`（一日一個檔，內容就係嗰日嗰個 `{am:{...},pm:{...}}`）+ `data/index.json`（日期清單，由新到舊）。`index.html` 而家得返 ~24KB，開場 fetch 呢兩類檔案嚟畫面，畫面/操作同以前一模一樣。**出稿淨係郁 `data/` 入面嘅 json，唔再郁 `index.html`。**
1. 讀本機時間 → 決定 am／pm。
2. 讀 `data/<上一版日期>.json`（午報嘅上一版＝噚日 pm，冇就噚日 am；夜報嘅上一版＝同日 am；例如今日做午報，就開 `data/<噚日>.json` 睇佢個 `pm`），抽晒每組標題同 URL 做排除清單。
3. 攞熱度訊號（見第 5 節）。
4. 按第 6 節四組工作分工；有空位就平行處理，受 agent 上限限制時分批執行，主 agent 可以自行負責一組。
5. 砌好當日嗰版，寫入 `data/<今日>.json`：
   - 檔案未存在（今日第一版）→ 新起檔案，內容 `{ "am": {...} }`（做午報）或 `{ "pm": {...} }`（做夜報）。
   - 檔案已存在（今日第二版，通常係夜報跟喺午報後面）→ **讀返現有內容，喺原有 object 加多一個 key**（例如已有 `am`，加 `pm`），**唔准掉低／覆寫原有嗰個版**。
   - **唔准郁另一版**（做夜報唔准郁份 json 入面嘅 `am`，反之亦然）。
   - **唔准郁**：`data/` 入面其他日子嘅檔案、`index.html` 嘅 CSS、tab、favicon 標籤、`fmtT`、早晚切換嗰組 function（`ED`／`ED2`／`EDOF`）、搜尋嗰組 function（呢啲而家全部喺 `index.html`，出稿日常完全唔使掂佢）。
   - 更新 `data/index.json`：今日日期未喺清單就加去**最前面**（`[今日, ...原本清單]`，由新到舊排）；已經存在（今日第二版）就唔使再加，淨係改返 `data/<今日>.json` 個內容就夠。
   - 兩個檔（`data/<今日>.json` 同 `data/index.json`）都要驗 `JSON.parse` 過到先算。
6. 跑自檢：`node tools/selfcheck.js <今日日期> <am|pm>`（selfcheck 而家直接讀 `data/index.json` + `data/*.json`；**2026-10-19 起已整合強制 HTTP GET 逐圖實測與二進制檢查，404 或死圖直接 exit 1 唔准出街，全部通過時自動寫入 docs/verification/**），**exit 0 先可以出街**。
7. ~~跟自檢個 🖼 清單逐條驗圖~~ **已整合入 selfcheck（2026-10-19）**：`selfcheck.js` 會自動對全部圖片執行 HTTP GET 實測與 magic bytes 檢驗，死圖直接 exit 1，杜絕人為跳步。
8. ~~`cp index.html archive/YYYYMMDD.html`~~ **已取消（2026-09-21）**：快照由第 11 步嘅 git commit 取代，唔使再 cp；`archive/` 舊檔留住、已 gitignore，selfcheck 亦唔再驗 archive 檔。
9. **發佈**：唔使做任何嘢。8080 server（`serve_news.ps1`）就係直接讀呢個資料夾嘅 `index.html` 同 `data/*.json`，寫完即刻生效（瀏覽器開住個頁重新整理就 fetch 返新 `data/<今日>.json`），Meshnet 睇嘅就係佢。
10. 寫 `簡報/每日簡報_YYYYMMDD.md`（各組條數、自檢結果、遇到嘅問題）。
11. **新聞出稿 commit 係已授權例外，唔使問 Kenny**（2026-09-29 再確認）：每次出完稿都要 commit；`只 stage 今次出稿涉及嘅檔案，再 git commit -m "<午報|夜報> dd/mm/yyyy"`。
    DB 拆檔之後，出稿改動嘅主要係 `data/<今日>.json`（同新日子要 `data/index.json`），`index.html` 一般唔會再有改動。
    root 嘅 scratch（`*.html`／`*.xml`／`*.json`，`index.html`／`settings.example.json` 除外）、`settings.json`（用戶狀態，2026-09-21 起唔入 git，範本係 `settings.example.json`）同 `archive/` 已 gitignore，唔會入 commit；`data/` 唔喺 gitignore 之內，要入 commit。
    夜報放棄嗰陣用 `只還原本次改動嘅檔案到開工備份，唔准整批 checkout` 還原，保留開工前既有內容。
12. 向用戶報告時，**只寫需要用戶跟進嘅事**（缺料、驗圖失敗、selfcheck fail、放棄咗嘅部分、要佢手動做嘅嘢）；一切正常嘅嘢唔好講，冇嘢要跟進就一句「✅ 已出，冇嘢要跟進」。

**死線**：午報目標 09:45 前搞掂、夜報 21:45 前搞掂（用戶 22:00 坐低睇）。任何一步卡住就放棄嗰部分照出，唔准無限等。
夜報死線到咗仍然唔合格 → **放棄呢次夜報**（`只還原本次改動嘅檔案到開工備份，唔准整批 checkout` 或者手動還原返 `data/<今日>.json`），保住午報，回覆講明點解。午報死線到咗唔合格 → 照出，但回覆入面逐項列出問題。

## 4. ★★★ 經濟組 hke 兩條硬規矩（selfcheck fatal）
**呢兩條一定要原文貼落 Sub2 嘅指示入面。**
①② 以 `tools/rules.json` → `hkeBan`／`indie` 為準，內容如下：
① **hke 禁用**：香港01（hk01.com）、星島（stheadline.com）、The Standard（thestandard.com.hk）、etnet 經濟通（etnet.com.hk）
   — 用戶原話：「香港01、星島嘅經濟版隱惡揚善、唱好香港，唔係以事論事」；The Standard 係星島集團旗下，同一把聲。
② **hke 每版最少一條**要嚟自呢個「合資格獨立來源」清單，**任何一間都算數**：
   端傳媒 theinitium.com／綠豆 greenbean.media／大紀元 epochtimes（中英文版都算）／世界日報 worldjournal.com／
   有線新聞財經 i-cable.com／CNBC／衛報 theguardian.com／
   日經亞洲 asia.nikkei.com／BBC（英文）／Politico／The Hill／France24／NPR／
   **［2026-09-19 新加，實測合格］** 海峽時報財經 straitstimes.com／新加坡 CNA 財經 channelnewsasia.com／
   Asia Times asiatimes.com／Fortune fortune.com／Semafor semafor.com／Dimsum Daily dimsumdaily.hk／
   Asia Financial asiafinancial.com／DW 中文 dw.com
   ⚠ 經濟一週 edigest **唔算**合資格獨立來源（但照舊可以填其餘兩格）。
   ❌ **路透社 reuters.com 已剔除（2026-09-19）**：全站 401（首頁、/markets/asia/、/world/china/ 同 Google News 繞路全部 401），唔好再試。
   ★★ **週末／凌晨補位次序（2026-09-19 實測，星期六 10:30 全部有新稿）**：
      ① 海峽時報財經 RSS ② 新加坡 CNA 財經 ③ 經濟一週 edigest ④ Asia Times ⑤ Fortune。
      Semafor、Hong Kong Business、Mingtiandi **週末停更，唔好指意**；鉅亨網港股收市後基本停更（週末最多收到一條清晨稿）。
   **［新來源用法，2026-09-19 實測］**
   • **海峽時報財經** https://www.straitstimes.com/business ✅ **週末凌晨最強一張牌**（週六 05:00–10:30 已出 7 篇）；
     ⚠ `/business` 係 JS render，**第一入口一定要用 RSS** `https://www.straitstimes.com/news/business/rss.xml`；單篇 `/business/<子版>/<slug>`；
     ★ **時間兩種寫法唔好撈亂**：`article:published_time` 帶 `Z` ＝ UTC 要 +8，但 **JSON-LD `datePublished` 係 `+08:00` 本身就係 HKT**，
     RSS `pubDate` 亦係 `+0800` —— **一律讀 JSON-LD 或 RSS**；og:image 喺 `cassette.sphdigital.com.sg/image/straitstimes/<hash>`（冇副檔名，照抄）；英文。
   • **新加坡 CNA 財經** https://www.channelnewsasia.com/business ✅（⚠ 呢個係新加坡 CNA，**唔係**禁用嗰個台灣中央社 CNA）；
     週六朝早 05:00–10:14 已出 20 篇；第一入口 `https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml`；
     單篇 `/business/<slug>-<7位ID>`；**JSON-LD `datePublished` 本身就係 HKT，唔使換算**；
     og:image 喺 `dam.mediacorp.sg/image/upload/…?itok=…` 係簽名連結，**成條照抄唔准剝殼**；英文。
     ⚠ 唔好加 `&category=10296`，嗰個係體育版。
   • **Asia Times** https://asiatimes.com/ — 香港出版英文獨立財經／地緣媒體，平日日產 8–12 篇，**週末極淡**；
     第一入口 `https://asiatimes.com/feed/` 或 wp-json；單篇 `/YYYY/MM/<slug>/`；`article:published_time` 係 **真 UTC，要 +8**；
     og:image 喺 `asiatimes.com/wp-content/uploads/`；英文。⚠ 香港題材唔係日日有，做 hke 前先掃 `https://asiatimes.com/tag/hong-kong/`。
   • **Fortune** https://fortune.com/ — 日產 10+ 篇、通宵出稿；`https://fortune.com/feed/`；單篇 `/YYYY/MM/DD/<slug>/`；
     JSON-LD `datePublished` 寫 `-00:00`（怪寫法但確認係 **UTC，要 +8**）；og:image 喺 `fortune.com/img-assets/…`；英文。美股／企業為主。
   • **Semafor Business** https://www.semafor.com/vertical/business — 日產 5–8 篇，**週末停更，平日先用**；單篇 `/article/MM/DD/YYYY/<slug>`；
     ★ `article:published_time` 係 `<meta name=` **唔係** `property=`（grep 唔好淨係搵 property），值帶 `Z` ＝ **UTC 要 +8**；
     og:image 喺 `img.semafor.com/…`，HTML 入面啲 `&` 寫成 `&amp;`，**要解返做 `&` 先 fetch 到**；英文。
   • **Dimsum Daily** https://www.dimsumdaily.hk/ — 英文香港日報，**通宵同週末照出**（週六 10:36 前已出 10 篇）；用法見第 11 節。
   • **Asia Financial** https://www.asiafinancial.com/ — 技術全合格（`+00:00` 已查 wp-json 確認係**真 UTC，要 +8**），
     但**產量極低（7 日得 5 篇）**，只做後備嘅後備；單篇 `/<slug>`；og:image 喺 `asiafinancial.com/wp-content/uploads/`；英文。
   • **DW 中文** https://www.dw.com/zh/ — 中文唔使譯；第一入口 `https://rss.dw.com/rdf/rss-chi-all`；
     單篇 `https://www.dw.com/zh/a-<8位ID>`（**唔使中文 slug，避開編碼問題**）；JSON-LD `datePublished` 帶 `Z` ＝ **UTC 要 +8**；
     og:image 喺 `static.dw.com/image/<ID>_6.jpg`。⚠ 全題材 feed，要自己篩財經／中港金融。
   ⚠ **日經亞洲 asia.nikkei.com 降級**：入到（200）但 JSON-LD `isAccessibleForFree:false` ＝付費牆，正文讀唔晒，
     撮要唔好靠估；og:image 係 `images.ft.com/v3/image/raw/<編碼原圖>?…` 轉檔連結，要解返入面條原圖。
③ 其餘兩格用：經濟一週 edigest（★ **單篇 `article:published_time` 標 `+00:00` 但個數值本身就係 HKT，唔使換算、唔准 +8**；
   ★ **週末照出，星期六日產 20–27 篇**，之前寫「週末停更」係錯）、集誌社，或者任何上面嗰啲合資格獨立來源，
   加埋以下三個 **2026-09-18 新加嘅替代來源**（全部實測有 og:image ＋ 單篇 published_time）：
   • **Hong Kong Business** https://hongkongbusiness.hk/ ✅ 平日首選替代（⚠ **週末停更已實證，星期六零稿**） — 香港本地經濟／樓市／零售，日產 8+ 篇；
     單篇 `/<版面>/news/<slug>` 或 `/<版面>/exclusive/<slug>`（版面例：economy、commercial-property、food-beverage、building-engineering）；
     `article:published_time` 係 **`+0800`，本身就係 HKT，唔使換算**；og:image 喺 `cmgassets.com`；英文，出稿自己譯。
   • **鉅亨網 cnyes** https://news.cnyes.com/news/cat/hk_stock （港股版，日產 10+ 篇；⚠ **港股收市後基本停更**，週末最多收到一條清晨稿）；
     單篇 `https://news.cnyes.com/news/id/<7位ID>`；`article:published_time` 帶 `Z` ＝ **UTC，要 +8**；og:image 喺 `cimg.cnyes.cool`；繁體中文，唔使譯。
   • **Mingtiandi** https://www.mingtiandi.com/ — 香港／亞太地產投資英文獨立媒體，香港題材唔係日日有，做樓市卡先用；**週末完全停更**；
     單篇 `/real-estate/<分類>/<slug>/`；og:image 喺 `s49634.pcdn.co`。
     ★★ **2026-09-19 更正（之前寫錯）**：`article:published_time` 個 `+00:00` **本身就係 HKT，唔使換算**；
     **反而 JSON-LD `datePublished` 先係真 UTC 要 +8**。兩個欄位差足 8 個鐘，揀錯一個成張卡報廢。
   ❌ **香港財經時報 businesstimes.com.hk 已剔除（2026-09-18）**：全站 Cloudflare bot 牆（403＋JS challenge），curl 同真人瀏覽器都過唔到，唔好再試。
   ❌ 同日一併試過唔合格、唔好再試：香港經濟日報 hket.com（Human Verification 牆）、FT 中文網 ftchinese.com（付費牆兼「访问受限」）、
     智通財經 zhitongcaijing.com 同 AASTOCKS（**冇 og:image／冇 published_time／冇 JSON-LD**，發放時間無從讀起）、
     自由亞洲 RFA 粵語（已停運，首頁掛「告別讀者」）、Transit Jam（403）、Bloomberg（403）。
   ❌ **2026-09-19 一批實測唔合格，唔好再試**：路透社 reuters.com（全站 401）、MarketWatch（401，連 RSS 入面條單篇都 401）、
     香港經濟日報 TOPick topick.hket.com（全站 405）、Investing.com 香港 hk.investing.com（403）、
     新浪香港財經 finance.sina.com.hk（HTTP 000，域名疑似已死或被封）、東方財富 eastmoney.com 同格隆匯 gelonghui.com（**單篇零 meta，冇 og:image 冇 published_time**）、
     Webb-site（已 301 去 Substack 而且停更到 2025-12）、Quamnet 華富財經（JS SPA，curl 攞唔到單篇）、
     Infocast（只有 AJAX 碎片，冇單篇可分享頁）、Business Insider（付費牆兼冇 og:image）、Quartz（得 2 條 feed 而且已變 SEO listicle）。
   ✅ **VOA 中文 voachinese.com 可以用（2026-09-19 用戶釐清「政府網」只指中共、港府同中國盟友政府，VOA 唔受限）**：
     單篇 `/a/<slug>-<YYYYMMDD>/<7位ID>.html`、JSON-LD `datePublished` 係 `"YYYY-MM-DD HH:MM:SSZ"` 空格分隔嘅 **UTC 要 +8**、
     og:image 喺 `gdb.voanews.com`；簡體中文要轉繁體。做 hke 合資格獨立來源同 cn 組後備都得。
④ 有線新聞財經：**一定要由首頁 https://www.i-cable.com/ 入**，單篇 `/財經資訊/<6位ID>/…`，**中文 slug 照抄唔好斬**；`article:published_time` **UTC 要 +8**；og:image 喺 `icable-prod.s3.ap-southeast-1.amazonaws.com`。⚠ `/category/新聞資訊/` 同 `/news/` 回舊 cache，唔好用。
⑤ 世界日報 og:image 係 `pgw.worldjournal.com/gw/photo.php?u=` 轉檔連結，**照抄完整，唔准剝殼**。
⑥ 用戶明確唔要：財新、中原地產 CCL（連 CCL 指數題材都唔好做卡）、追新聞（停更近一年）。

## 5. ★ 熱度優先（香港組用）
開工攞兩個熱度訊號（**攞唔到就照舊出稿，唔好等**）：
- `https://trends.google.com/trending/rss?geo=HK`（關鍵詞＋大約搜尋量）
- `https://www.hk01.com/hot`（最Hit）

用法：喺**窗內合格**嘅香港組候選卡度配對熱門關鍵詞，配中＝熱卡。
- 候選多過配額：熱卡優先入圍；組內熱卡排頭位，多張就按搜尋量高低。
- **卡面標記**：熱卡加**第 8 欄** `1` → `[標題,撮要,來源,URL,發放,更新,圖,1]`，網頁自動喺標題前加 🔥。唔係熱卡維持 7 欄。每組最多標 2–3 張。
- 硬規矩全部不變：時間窗、禁用來源、去重、唔收純娛樂／KOL（藝人緋聞幾熱都唔收）。熱度只係同級之間嘅排序器，「突發重大＞影響多人」行先。

## 6. 四組編採分工
每組條數以 `tools/rules.json` → `mins` 為準，內容如下：
- **Sub1**：香港社會 hks 8 條 ＋ 民生 hkl 8 條（唔好收政界表態／法官人事，留返俾 Sub2）
- **Sub2**：香港經濟 hke 3 條（**第 4 節要原文貼晒俾佢**）＋ 政治 hkp 3 條
- **Sub3**：中國 cn **8** 條（2026-09-19 由 3 加到 8）／美國 us 3 ／台灣 tw 3 ／美伊 war 3。cn 8 條唔可以淨靠星島，要混埋香港01 /zone/5、大紀元、希望之聲；唔夠就開補位 agent，一樣守硬時間窗。
- **Sub4**：兩篇簡報 ai（AI 動向）同 warb（美伊戰爭），各約 300 字＋插圖

每個 subagent 都要俾佢：真實香港時間、**硬時間窗上下限**、禁用來源清單、上一版已出嘅題材排除清單、og:image 格式要求、**URL 寫法要求**、負責組別嘅完整來源池；香港組嗰啲仲要俾埋熱度關鍵詞。
subagent 出錯／超時／JSON 廢 → 重試一次。條數唔夠就再開補位 agent，**補位一樣要守硬時間窗**。
★ **subagent 交返嚟嘅外媒長 slug URL 要逐條開一次確認**（試過 Al Arabiya 條 URL 截斷咗半截）。

事件追蹤 track 由總指揮自己砌（規矩見第 8 節），唔好淨係交俾 subagent。

## 7. 新聞卡格式
7 欄 `[標題, 撮要, 來源, URL, 發放時間, 更新時間, og:image]`；熱卡可加第 8 欄 `1`。
上述舊 Threads 例外用第 9 欄物件：`{"freshReport":{"source":"新報道媒體","url":"https://...單篇","publishedAt":"YYYY-MM-DD HH:MM","newInformation":"窗內首次披露／核實嘅內容"}}`。第 5、6 欄仍係原帖真實時間；網頁同時顯示原帖與新報道連結及兩個時間。

- 全部繁體中文（非中文來源要譯）；標題 10–20 字，撮要約 20 字，唔好同標題重複。
- 只可以用**單篇文章 URL**（有 ID），或第 11 節容許嘅**單一社交平台原帖永久連結**（有 post ID）；唔准首頁／個人檔案頁／分類頁／list／tag／liveblog。
- **URL 寫法**：hk01 一律 `https://www.hk01.com/article/<id>`（**唔准帶中文 slug**）；星島一律 `https://www.stheadline.com/<版面>/<純ID>/`（**帶中文 slug 會 403**）。
  ⚠ 例外：i-CABLE 個「新聞資訊」「財經資訊」係固定路徑段要留；集誌社／edigest 嘅中文 slug 唔會 403，照抄。
  ★★ **i-CABLE 單篇一定要用完整 percent-encoded URL**（由首頁 grep 返嗰條原文照抄）：**未 encode 嘅中文 slug curl 會回 404**（2026-09-19 兩條都中招）。
     法庭線 thewitnesshk 嘅 encoded 中文 slug **斬短一個字就 400**，一樣要逐字抄全條。Dimsum Daily 部分 slug 含 `%e2%80%91` 之類特殊連字號，**唔准手改做普通 `-`**。
- 發放時間第一優先由文章本身讀出（JSON-LD `datePublished`；大紀元／ETtoday／UDN／LTN 讀 `article:published_time`），**唔准估、唔准作**。
  換算：UTC +8、美東 EDT +12、英國 BST +7；**i-CABLE 嘅 published_time 係 UTC，要 +8**。
  ★★★ **WordPress／Yoast 嘅 `article:published_time` 個 `+00:00` 唔可信**（2026-09-19 實測，同一個 CMS 兩種行為都有）：
  | 站 | `article:published_time` 實際係 | 要唔要 +8 |
  |---|---|---|
  | Dimsum Daily、Asia Times、Asia Financial | 真 UTC（＝wp-json `date_gmt`） | **要 +8** |
  | 經濟一週 edigest、Mingtiandi | 本地 HKT（＝wp-json `date`） | **唔使** |
  → **任何 WordPress 來源第一次用之前，一定要行一次** `https://<站>/wp-json/wp/v2/posts?per_page=5&_fields=date,date_gmt,link`
  **睇個 meta 值等於 `date` 定 `date_gmt`**，唔好信個 offset 標籤。呢條 curl 亦係查「日產量／週末凌晨有冇稿」最快嘅方法。
  ⚠ 綠豆 greenbean.media 個 WP 時區設成 UTC+1（`date` 同 `date_gmt` 只差 1 個鐘），`article:published_time` 標 `+01:00`，
    **個數值其實等於真 UTC → 正確 HKT ＝ 數值 +8**，唔好用 `date` 欄當 HKT。
- **The Standard 時間寫法（2026-09-19 更正）**：佢**有** JSON-LD `"datePublished":"…+0800"`，**本身就係 HKT 唔使換算**，
  舊規矩寫「單篇冇時間 meta、要用相對時間推算」**已經作廢**。
- **相對時間換算**（仍然適用於其他真係冇 meta 嘅站）：可以用**單篇頁上面**嘅「N mins/hours ago」用本機時鐘減返；「yesterday／N days ago」直接唔要。**列表頁嘅相對時間唔可信。**
- og:image 必填，讀唔到就唔要嗰條；**唔准自己砌圖 URL，一定要由原文逐字抄**。
- **hk01 CDN 圖一定要連簽名段**，簽名段固定 43 個字元，唔係 43 就重新 讀取原文／圖片工具（curl.exe、瀏覽器或 web 工具）（fatal）。
  （簽名段長度以 `tools/rules.json` → `hk01.sigLen` 為準，同上面一致。）
- og:image **唔好用轉檔連結**（Brightspot dims3 嗰類 `.../format/jpeg/?url=...`）→ 抄 `?url=` 入面嗰條原圖並改 https。
  ⚠ 例外（呢啲要照抄完整，剝殼就壞）：世界日報同 UDN 嘅 `pgw...photo.php?u=`、
  新加坡 CNA 嘅 `dam.mediacorp.sg/…?itok=`、Hong Kong Business 嘅 `cmgassets.com/…?VersionId=…&itok=`、
  海峽時報嘅 `cassette.sphdigital.com.sg/image/straitstimes/<hash>`（冇副檔名嗰種）。
- ⚠ **HTML 入面嘅 `&amp;` 要解返做 `&` 先入卡**（Semafor、衛報、UDN／世界日報 photo.php 嗰啲長 query 最常中）；唔解就成條圖連結壞。

## 8. ★★ 事件追蹤 track（冇上限，唔准刪）
欄數、最少條數、20／40 版門檻、「無新進展」字眼（NOP regex，同 `index.html` 嘅 `NOP` 一致，selfcheck 會核對）以 `tools/rules.json` → `track` 為準，內容如下：
1. **上一版 track 每一條，今版都要照出**（漏一條 exit 1，除非喺 `tools/retired.json`）。
2. 冇新進展**唔係**除名理由：狀態寫「跟進中」，進展寫「今日無新進展；最後進展（MM-DD）：⋯」。
3. 有新線索直接加落去（**加線索唔使問用戶**），同時加 `tools/track_keys.json` 關鍵詞。
4. **格式一定要 3 欄** `[事件名, 狀態, 今日進展]`；狀態 ≤12 字短標籤。寫 2 欄或者第三欄擺日期會出「undefined」，fatal。
5. **同一條線索每版同一個名**（selfcheck 用名做 key），改名＝舊名消失＝fail。
6. **無新進展門檻（2026-08-31 定案）**：
   | 連續無新進展版數 | 做法 | 使唔使問用戶 |
   |---|---|---|
   | < 20 版 | 照正常跟進 | — |
   | **≥ 20 版** | **直接轉低頻**，加入 `tools/lowfreq.json` | **唔使問** |
   | **> 40 版（至少41版）** | 可以直接除名，加入 `tools/retired.json`；低頻亦要檢查，唔好因低頻而一直保留 | **唔使再問**（Kenny 2026-10-12 確認） |
   | 任何版數但**有已知後續節點** | **一律唔准除名**，改為續低頻 | — |
   「有已知後續」＝有既定未來實日子（開庭／聆訊／再訊／判刑／報告發表／正式開通／合約屆滿）。**優先於 40 版門檻。**
   ⚠ 出現時嘅**預設反應係「查有冇既定未來節點 → 有就轉低頻」，唔係除名**。
7. **★ 交叉核對（fatal）**：`tools/track_keys.json` 存每條線索嘅關鍵詞。**當日新聞卡配到關鍵詞，但 track 寫住「無新進展」＝ exit 1**（同版數門檻無關，低頻名單一樣要守）。砌 track 之前一定要攞當日全部卡同 track 清單逐條對一次。
8. **翻叮唔使問**：見 selfcheck 出「有卡配到 X 嘅關鍵詞但 track 冇呢條線索」，而且唔止一日、唔止一張卡＝事件翻兜 → 移走 `retired.json` 嗰項 ＋ 確認 track_keys ＋ 當版 track 加返。
9. 改 `lowfreq.json`／`retired.json` **唔好郁 index.html**，唔使重驗圖。
10. 命名前綴：`🔥`、`港·`、`中·`、`台·`、`美·`、`美中·`。

詳細背景見 `docs/事件追蹤.md`。

## 9. ★★ 驗圖：強制程式碼 Blocking 檢驗（2026-10-19 升級）
2026-10-19 起，驗圖已由 `tools/selfcheck.js` ＋ `tools/image-verifier.js` 機械化強制執行，唔再依賴人工／AI 自律：
- 執行 selfcheck 嗰陣，會對當版全部 41 條圖片平行發送真實 HTTP GET 請求。
- 嚴格核對 HTTP 200、檔案大小 ≥ 80 bytes、以及合法二進制 magic bytes（JPEG `\xFF\xD8\xFF`、PNG `\x89PNG`、WebP `RIFF...WEBP`、GIF、SVG）。
- 但凡有任何一張圖 404、timeout、或二進制格式無效，`selfcheck.js` 直接報出失敗卡片並 **exit 1 終止**，任何人或 AI 都無法跳步偷雞。
- 通過時，自動將 41 條實測證據寫入 `docs/verification/YYYY-MM-DD-[am|pm].json`。
- 星島系 CDN 特殊行為：`image.hkhl.hk` 錯 hash 都回 200（返回 91 bytes 佔位圖），對此類站點仍須在搜料時核對原文 `og:image` 字串。

## 10. 兩篇簡報
來源數／媒體數以 `tools/rules.json` → `brief` 為準，內容如下：
- **ai：最少 4 個來源、最少 3 間唔同媒體。warb：最少 3 個來源、最少 2 間唔同媒體。**（fatal）
- 來源名寫法 `媒體名 — 標題`，連結唔准重複、一定要 https 單篇。
- `upd` 必須等於今日日期。**唔准抄上一版嗰篇。**
- **插圖一定要係你引用嗰幾篇來源文章其中一篇嘅 og:image。**
- **AI 來源池**：① The Decoder https://the-decoder.com/ ✅ 首選 ② The Register AI https://www.theregister.com/software/ai_ml/ ✅ URL 自帶日期 ③ TechCrunch ✅ 但唔可以成篇都用佢 ④ VentureBeat、Ars Technica、The Verge AI、Wired、MIT Technology Review、Axios、CNBC 科技、The Next Web、The Hacker News、CyberScoop、Fortune／Bloomberg、JURIST ⑤ 中文面：香港01 科技版、大紀元科技、日經亞洲中文版
- **ai 內容**：一定要係最近嘅新發展；除產品公佈外，一定要搜一輪 incident／hack／lawsuit／regulation。

## 11. 來源池
來源可以係任何語言，出稿自己譯做繁體中文。

### 社交平台來源（Kenny 2026-10-11 批准）
- **Threads 搜料對象（2026-10-13 am 起）**：唔以新聞來源池已有嘅傳媒帳戶作 Threads 搜料對象；要按事件、地點、行業及當事人關鍵詞搵「散戶」原帖，例如現場目擊者、受影響市民、事件當事人、從業者及獨立個人。唔只係將同一批傳媒網站換成佢哋嘅 Threads 連結。傳媒報道可另作交叉核實。轉貼新聞、抄標題、冇原始資訊嘅評論唔當第一手料；純娛樂／KOL仍不收。記錄作者類型、與事件關係、第一手內容及身份核對依據，唔以 URL 係 Threads 就聲稱完成呢項人手核實。其他真實性、時間窗、圖片及來源數要求不變；唔夠合格散戶原帖要報實際差額，唔偷偷改用傳媒帳戶填數。
- **現行指示：Kenny 2026-10-14 特別批准追溯 2026-10-13 pm 補稿；由該版起，每個 topic 同兩篇簡報各自以至少一半合格 Threads 原帖作搜料目標，奇數向上取整；達唔到唔會單憑差額阻止出稿。** 只限 13 日 pm 准過死線補稿，仍須完成原文、真實時間、逐圖及其餘自檢；唔自動補其他歷史版。每組同每篇簡報喺 `簡報/每日簡報_YYYYMMDD.md` 記錄「實際採用／目標／差額」及主要排除原因；冇合格帖就寫 0，唔可以湊數。自檢會列出差額提示，其他條數、時間窗、去重、來源、媒體數、圖片與原帖核實要求全部仍係硬規矩。夜報只因其餘硬規矩唔合格先放棄。機器版見 `tools/rules.json` → `social.nextPolicy.targetOnlyFrom`。
- **歷史規則：2026-10-13 am 只用 Threads 作社交來源，停止搜料及採用 Facebook、Instagram；每組及兩篇簡報至少一半合格原帖仍係硬配額。13 日午報及之前唔追溯改。**
- **2026-10-12 Kenny 更新，由當晚 pm 起生效**：每個 topic（hks/hkl/hke/hkp/cn/us/tw/war）至少一半新聞卡須直接採用 Threads、Facebook、IG 合格原帖；奇數向上取整，所以8條組至少4條、3條組至少2條。原有條數不增加，三平台須在全版新聞卡齊備，毋須每組三平台各一條。兩篇簡報各自至少一半採用來源亦須為合格原帖（ai4來源至少2、warb3來源至少2）。機器規則見 `tools/rules.json` → `social`，`tools/selfcheck.js` 強制核對；歷史及12日午報不追溯套用。
- **只有實際採用原帖永久連結先計入 Threads 目標**；只搜尋、當線索、交叉查證後改用傳媒網站出卡，都唔計。逐組先搜合格散戶原帖，再以其他可核實來源補新聞；缺帖要記實際差額同排除原因，唔可以將傳媒報道冒充原帖，亦唔可以降低時間或驗圖門檻。2026-10-12 pm 嘅三平台 50% 硬配額只屬歷史規則。
- **Threads、Facebook、Instagram（IG）加入所有相關組別及兩篇簡報嘅來源池**，可用作搜料、第一手資料及合格新聞卡來源；按題材分組，唔限於傳統傳媒帳戶。每次出稿主動搜相關公開原帖，操作見 `docs/source-notes/social-platforms.md`。
- 採用前實際讀取原帖全文及相關圖片／影片，核對發帖者身份、原帖永久連結、首次發放時間及時區。轉載、截圖或剪輯要追返原始來源；聲稱、指控及商業宣傳須清楚歸屬，唔當獨立證實嘅事實。重大爭議內容要交叉查證。
- **原有時間窗、去重、禁用來源、hke 獨立來源配額、簡報媒體數及逐圖核實規矩全部照守**。禁用機構及政府／官媒嘅社交帳戶同樣禁用，唔可以借平台域名繞過限制；純娛樂／KOL內容仍不收。
- 卡嘅來源名寫實際作者或機構，平台記喺核實紀錄；同一作者／機構跨平台只算一個來源，唔將 Threads、Facebook、IG 當三間媒體。個人或企業帳戶唔自動算簡報嘅媒體數，亦唔自動變成 hke 合資格獨立來源。
- 直接出卡仍須有可核實嘅首次發放時間、原帖 `og:image` 及可實際讀取嘅圖片，沿用第 7、9 節。登入牆、相對時間不足以確定硬窗、通用平台 logo、已刪帖或圖片無法核實，只作線索，另找可核實報道出卡；唔估時間、唔砌圖片 URL、唔為平台改自檢門檻。

### 傳媒來源

- **香港 hks／hkl**：香港01（/zone/1 港聞、/channel/6 突發、/channel/2 社會、/zone/23 教育、/zone/10 18區、/channel/421 天氣，可直接掃 /article/<id>；⚠ **/latest 會回舊 cache，唔可以做第一入口**）、星島（**第一入口 https://www.stheadline.com/realtimenews**、/breaking-news、/voice-topics/ 申訴王、/realtime-property/、/lifetips/、/society/；⚠ /rss 回舊 cache）、有線新聞 https://www.i-cable.com/（首頁）、法庭線 thewitnesshk.com、大紀元
  **★★ 2026-09-19 新加（全部實測合格）**：
  • **Dimsum Daily** https://www.dimsumdaily.hk/ ⭐ **週末／凌晨最強嘅一張牌**（星期六 00:02、00:08 有稿，09:00–10:36 出咗 10 篇）；
    **第一入口用 wp-json，唔好掃 HTML 首頁**：`https://www.dimsumdaily.hk/wp-json/wp/v2/posts?categories=72&per_page=30&after=<YYYY-MM-DD>T21:00:00&_fields=date,link,title`
    （`72`＝local 港聞、`73`＝breaking-news、`190`＝property、`133`＝medicine、`111`＝finance；**掃 local 就自動隔走娛樂／加密貨幣噪音**）；
    wp-json 個 `date` 欄**直接就係 HKT**，最準；單篇 `https://www.dimsumdaily.hk/<英文-slug>/`；
    ⚠ 單篇 `article:published_time` 標 `+00:00` 而**真係 UTC 要 +8**（同 edigest 個伏相反）；⚠ 另有個 `itemprop="datePublished"` 係 HKT 錯標，唔好讀佢；
    og:image 喺 `cdn.dimsumdaily.hk/wp-content/uploads/…`，直連，第二步驗圖有效；英文，出稿自己譯。
    ⚠⚠ **佢係二手改寫型日報，同香港01／星島大量撞單** → 同組唔好連 hk01／星島一齊收同一單，selfcheck 個「疑似同一單事」⚠ 會多咗，要特別留意去重。
  • **The Standard** https://www.thestandard.com.hk/breaking-news/ — **hks／hkl 用得**（只係第 4 節嘅 hke 經濟組先禁用佢）；
    列表靜態 HTML 已經夾住最新約 20 個 article ID（`grep -oE '3[0-9]{5}'` 就攞到，唔使行 JS）；單篇 `https://www.thestandard.com.hk/news/article/<純ID>`（**淨係純 ID 就得**）；
    JSON-LD `datePublished` 係 `+0800` **本身就係 HKT**；og:image 喺 `image.hkstandard.com.hk/f/1200p0/…`。
    ⚠⚠ **兩個伏位**：① **全站任何路徑都回 HTTP 200**（連亂打 ID 都係）→ **HTTP code 完全唔可以做存在性檢查**，一定要睇有冇 `og:title` ＋ `datePublished` 先算數；
    ② `image.hkstandard.com.hk` **錯 hash 一樣回 200**（同 `image.hkhl.hk` 一樣係星島系）→ **第 9 節第二步驗圖對佢無效，只可以靠第一步逐字比對**。
    ⚠ 平日白天強，**凌晨得一篇 00:00 自動排程稿**，唔好靠佢補隔夜。
  • **香港01 補位版面**：`/zone/6` 體育（康文體育卡，亞運期間好旺，星期六 09:00／10:00 都有新稿）、`/zone/19` 好食玩飛（消費卡）、`/zone/14`。
    列表內嵌 `"articleId"` ＋ `"publishTime"`（Unix 秒）。❌ `/channel/8`、`/channel/430` **404 唔存在，唔好再試**。
  • **大紀元香港**：**第一入口用 https://www.epochtimes.com/b5/nsc413.htm**（一版 60+ 條單篇連結，唔使再靠 WebSearch）；
    單篇 `https://www.epochtimes.com/b5/<YY>/<M>/<D>/n<8位ID>.htm` —— **URL 自帶日期，一眼篩得出窗內嗰啲**，零編碼問題。
    ⚠ 版面混住舊存稿，**一定要用 URL 入面嘅日期段篩**，唔好當順序就係新舊。
  • **法庭線 The Witness**：第一入口改用 `https://thewitnesshk.com/wp-json/wp/v2/posts?per_page=15&_fields=date,link,title`（比掃首頁快同準）；
    `date` ＝ HKT，單篇 `article:published_time` ＝ `+08:00` 真 HKT；og:image 喺 `thewitnesshk.com/wp-content/uploads/`（⚠ 圖嘅年月可以同出稿日唔同，唔好當錯日期）。
    ⚠ 平日 13:00–21:00 強，**週末朝早通常零篇**。
  • **集誌社**（唔止政治，有劏房／房屋深度稿，hkl 用得）：`https://thecollectivehk.com/wp-json/wp/v2/posts?per_page=10&_fields=date,link,title`；`date` ＝ HKT。日產 3–5 篇，**週末通常零篇**，深度稿為主唔好當即時新聞。
  ⚠ **有條件可用**：綠豆 greenbean.media（日產 1–3 篇、多 podcast／專欄、時區伏見第 7 節、og:image 檔名含未 encode 中文要自己 percent-encode）；
    誌 HK Feature hkfeature.com（`wp-json` 格式乾淨、`date` ＝ HKT、法庭同社會深度稿啱 hks，但**日產約 1 篇／1–3 日**，執到先算）。
  ⚠ **獨立媒體 inmediahk 只可以做線索雷達**：單篇／feed／wp-json 全部 403，**但 `https://www.inmediahk.net/rss.xml` 回 200**（15 條，`pubDate` 係 **UTC 要 +8**）→
    **攞題目做線索、去第二間搵返同一單出卡**；佢本身讀唔到 og:image，**唔可以入卡**。
  ❌ **2026-09-19 試過唔合格**：HOY TV hoy.tv（`/news` 等全部 404，而且同 i-CABLE 同一集團冇獨立價值）、龍週 Kowloon Post（週報＋PDF 版面貼文，最新停喺 9/10，日產＝0）、
    端傳媒（訂閱制付費牆，香港即時新聞極少，夾唔到 12 小時硬窗；**保留佢做 hke 合資格獨立來源就夠**）。
  ★★ **週末／凌晨補料次序（2026-09-19 星期六實測）**：
     **① Dimsum Daily（wp-json `categories=72`）→ ② 香港01 /zone/6＋/zone/19 → ③ 大紀元 nsc413 → ④ The Standard breaking-news**。
     頭三個實測當日都有新貨；法庭線、集誌社、綠豆、誌 週末朝早全部零篇，唔好喺度浪費時間。
- **香港政治 hkp**：① 香港01 政情 https://www.hk01.com/channel/310（日產 10–15 篇，最大來源）② 星島 https://www.stheadline.com/politics ③ 星島社論 /daily-editorial/（每日 07:00，午報啱使）④ 集誌社 https://thecollectivehk.com/（URL 由首頁抄，唔好自己砌）⑤ The Standard https://www.thestandard.com.hk/breaking-news/ ⑥ hk01 01觀點 /zone/12。⚠ 獨媒單篇 403 只可攞題目
- **香港經濟 hke**：見第 4 節（有專屬規矩）
- **中國 cn**（2026-09-19 起每版 8 條）：星島 /realtime-china/、/china-politics/、香港01 /zone/5、大紀元、希望之聲，加埋以下兩個 **2026-09-19 新加（實測合格）**：
  • **聯合早報 zaobao.com.sg**（新加坡報業控股，唔係中共官媒）：第一入口 `https://www.zaobao.com.sg/realtime/china`（靜態 HTML，一版約 24 條單篇連結，星期六 12:40 前已有 17 條當日稿；`/rss/` 路徑 404 唔好試）；
    單篇 `https://www.zaobao.com.sg/news/china/story<YYYYMMDD>-<7位ID>`（**URL 自帶日期，直接篩窗**）；
    JSON-LD `datePublished` 係 `+08:00` **本身就係 HKT，唔使換算**；`isAccessibleForFree:true`，正文讀得到；
    og:image 喺 `cassette.sphdigital.com.sg/image/zaobao/<hash>`（同海峽時報一樣冇副檔名，**照抄**）；⚠ **簡體中文，出稿一定要轉繁體**。
  • **DW 中文 dw.com/zh**：第一入口 `https://rss.dw.com/rdf/rss-chi-all`（全題材 55 條，`<dc:date>` 帶 `Z` ＝ **UTC 要 +8**，要自己篩中國題材）；
    單篇一律寫 `https://www.dw.com/zh/a-<8位ID>`（**唔要中文 slug 同 `?maca=` 尾巴**）；JSON-LD `datePublished` 帶 `Z` ＝ **UTC 要 +8**；
    og:image 喺 `static.dw.com/image/<ID>_6.jpg`；⚠ 簡體中文，要轉繁體；⚠ og 標籤係 `content` 排喺 `property` 前面（同 hk01 一樣），grep 要照顧次序。
- **美國 us**：世界日報（美東 +12）、香港01 /zone/4、星島 /realtime-world/、大紀元、AP、NPR、CBS、CNBC、Guardian、BBC、Politico、The Hill、France24
- **台灣 tw**：ETtoday（https://www.ettoday.net/news/news-list-YYYY-MM-DD-0.htm 帶日期）、UDN 單篇、自由時報單篇、NOWnews、星島兩岸熱話 /china-taiwan/（SETN 唔好用）
- **美伊 war**：① Al Arabiya English ② Times of Israel ③ Iran International（liveblog 唔可以做卡）④ i24NEWS ⑤ 後備：半島單篇、The National、愛爾蘭時報、日經亞洲、gCaptain。已試唔得：jpost 列表、apnews hub、MEE、arabnews 列表、**Reuters（2026-09-19 實測全站 401）**

禁用清單以 `tools/rules.json` → `ban` 為準，內容如下：
**禁用（selfcheck fatal）**：東網 on.cc、TVB、大公、文匯、中央社／CNA／Focus Taiwan（⚠ **指台灣嘅 cna.com.tw／focustaiwan；新加坡 Channel NewsAsia channelnewsasia.com 唔同嘢，用得**）、政府網／新聞公報、RTHK、巴士的報 bastillepost、am730、香港商報 hkcd、星島美國／加拿大。**任何一組唔可以 100% 單一來源。**

**已試唔得**：HKFP、光傳媒、Yahoo HK、SCMP、now、Channel C、信報（robots 封）、明報（403）。

**已知伏位**：hk01 /channel/307、/channel/24 已 404；hk01 未定義嘅 /channel/N 會靜靜哋回首頁 shell 唔會報錯；星島單篇要純 ID 路徑；BBC 中文／RFI 中文／聯合早報可能俾網絡政策封（⚠ **DW 中文 2026-09-19 實測入到，RSS `https://rss.dw.com/rdf/rss-chi-all` 回 200**，已唔再當被封）。
★ **hk01 單篇 meta 係 `content` 排喺 `property` 前面**（`<meta content="…" property="og:image"/>`），寫 grep 要照顧呢個次序，
  唔可以淨係 `grep 'property="og:image"'` 開頭配（會抽到空值，誤以為原文冇 og:image）。
★ 隔夜時段實測難點：星期日凌晨最乾、平日凌晨都會乾——唔夠料先掃第二層版面（申訴王、樓市動向、生活百科、政情、教育），唔好即刻報缺料。

## 12. ⚠「疑似同一單事」點處理
selfcheck 出呢個 ⚠ **唔可以照出街，一定要打開兩條比對內容**：
- **冇新進展**（另一家媒體照報一次／換角度重寫，事實冇變）→ **換走**，只留最新最全嗰條
- **有實質新進展**（狀態升級／傷亡數字更新／案情突破／局勢轉變）→ **留低**，並喺當日簡報寫明點解留

判斷準則：**呢張卡有冇講咗上一版冇嘅實質新事實？** 天氣、災情、戰事、疫情、選情、搜救、法庭案件呢啲**滾動事件**最易誤殺，唔好機械式照斬。

## 13. `_updated` 寫法
`YYYY-MM-DD HH:MM HKT（午報）` 或 `YYYY-MM-DD HH:MM HKT（夜報）`
時間用**真讀過本機時鐘**嗰個值，唔准估。

## 14. ⚙️ Web app 設定（2026-09-07 起）
- 左欄下半有「⚙️ 設定」盒：Kenny 輸入想幾點睇到午報／夜報（`hh:mm` 或 `hhmm` 都收）。
- 儲存去本資料夾 `settings.json`（`{"amView":"10:00","pmView":"22:00","updated":...}`），經 `serve_news.ps1` 嘅 `GET/POST …/api/settings` 寫檔；冇 server 就 fallback localStorage。`settings.json` 唔入 git（範本 `settings.example.json`）。
- **server 行為（2026-09-21 起）**：只 serve `index.html`、root 嘅 `*.png`／`*.svg`／`*.ico`、`data/index.json`、`data/YYYY-MM-DD.json` 同 `/api/settings`，其他路徑一律 404（`data/` 入面除咗嗰兩種檔名格式，其他一律 404，唔係成個 folder 任讀）；POST 只收 JSON object，key 只准 `amView`／`pmView`（`HH:MM`）／`updated`，唔合格回 400；每次 POST 後嘅 `sync_open_times.ps1` 同一分鐘內只跑一次；`server_log.txt` 超過 500 行自動只留最後 250 行。
- 排程任務 `daily-news-am`／`daily-news-pm-draft`／`daily-news-pm-refresh` 開工時讀 `settings.json`：死線＝睇報時間 −15 分鐘，開工＝睇報時間 −90 分鐘（由 `sync_open_times.ps1` 同步更新 Antigravity sidecars，見 docs/codex-schedule.md）。
- **出稿時唔准郁**設定盒嗰組 HTML／CSS／JS（`setbox`、`parseHM`、`saveSettings`、`loadSettings`），亦唔好郁 `settings.json`。
- **自動開網頁**：Windows 排程 `DailyNews-Open-AM`／`DailyNews-Open-PM` 喺睇報時間跑 `open_news.ps1`（開 http://localhost:8080/）。每次 POST settings 後 server 會背景跑 `sync_open_times.ps1` 重新註冊兩個 task 嘅時間並同步更新 Antigravity sidecars 嘅 cron 時間（唔使 admin，即時生效）。
- 改咗 `serve_news.ps1` 要重啟 `DailyNewsServer` 排程工作先生效；另外要先殺舊 process，否則 8080 會俾舊 server 霸住。


## 晚報最後刷新（2026-10-03 批准）

閱讀前 90 分鐘起草；閱讀前 15 分鐘增量刷新及核對更正；目標閱讀前 5 分鐘定稿。22:00 閱讀時即 20:30／21:45／21:55。只有最後核實成功才可標示定稿；無新消息也記錄查核結果。兩階段處理同一日 pm，保留 am、不補歷史，通知最多一次；失敗不能假稱刷新完成。實際排程由 Antigravity sidecars（`daily-news-pm-draft`、`daily-news-pm-refresh`）負責。

晚報即日新聞時間上限跟 pmView 減5分鐘；22:00 閱讀即21:55。草稿及刷新須先完成啟用關卡；正常重跑跳過已定稿，更正須獲授權並留舊版本。
