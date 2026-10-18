# Daily News 新聞排程（Antigravity Sidecar）

2026-10-18 起，資料夾改名為 `D:\Projects\Daily News`，AI 編採由 Antigravity 嘅三個每日排程 sidecar 負責（舊 Codex `automation`、`automation-2`、`automation-3`、`automation-4` 已停用 `PAUSED`），香港時間：

| Sidecar ID | 顯示名稱 | 初始時間 | 工作 |
|---|---|---|---|
| `daily-news-am` | Daily News AM (午報) | 08:30 | 出當日 am，預設 09:45 截稿 |
| `daily-news-pm-draft` | Daily News PM Draft (夜報起稿) | 20:30 | 閱讀前 90 分鐘起稿當日 pm（`node tools/evening-edition.js stage`） |
| `daily-news-pm-refresh` | Daily News PM Refresh (晚報刷新) | 21:45 | 閱讀前 15 分鐘最後增量刷新及定稿（`node tools/evening-edition.js finalize`） |

實際時間跟 `settings.json`：午報開工＝`amView` 減 90 分鐘；夜報起稿＝`pmView` 減 90 分鐘；晚報刷新＝`pmView` 減 15 分鐘（目標閱讀前 5 分鐘定稿）。新聞時間窗仍然固定跟 `tools/rules.json`，唔隨睇報時間放寬。

每次喺網頁修改 `settings.json`（POST `/api/settings`）或手動執行 `sync_open_times.ps1` 時，script 除咗更新 Windows 排程 `DailyNews-Open-AM`／`DailyNews-Open-PM` 之外，亦會自動更新 `C:\Users\Kenny\.gemini\config\sidecars\` 入面三個 sidecar 嘅 `CRON_TZ=Asia/Hong_Kong` 時間。

所有執行都用 `D:\Projects\Daily News`。先完整讀 `AGENTS.md`、來源筆記索引、`settings.json`，再讀最近已出嘅 edition。日期鎖定一次：午報用香港當日；夜報凌晨 00–02 點用前一日。已有同日同版就跳過。遲過截稿才喚醒就報告錯過，唔自動補歷史稿。

自動出稿流程及原有午報缺料例外見 `AGENTS.md`。每次寫簡報紀錄、檢查及驗圖、只 stage 今次出稿檔案再 commit。已有不相關修改要保留。

Windows `DailyNewsServer`、`DailyNews-Open-AM`／`PM` 繼續負責網站及自動開報，唔負責 AI 編採。

## 晚報兩階段流程與啟用關卡

Kenny 於 2026-10-03 批准：閱讀前 90 分鐘起稿，閱讀前 15 分鐘作最後增量刷新，目標閱讀前 5 分鐘定稿。`pmView=22:00` 時分別是 20:30、21:45、21:55。

1. **`daily-news-pm-draft`（夜報起稿）**：在 `D:\Projects\Daily News` 按 `settings.json` 的 `pmView`，於閱讀前 90 分鐘起稿當日 `pm`。先讀 `AGENTS.md`、`docs/source-notes/README.md`、`tools/rules.json`、`data/index.json` 與當日 edition；保留原新聞來源及編輯規則。只把完整候選 `{pm:{...}}` 寫到 `scratch`，再執行 `node tools/evening-edition.js stage <當日YYYY-MM-DD> <候選檔>`。不要寫 `data`、不 commit、不發定稿通知；如當日已 finalized，跳過。失敗只報實際阻礙。
2. **`daily-news-pm-refresh`（晚報刷新）**：在同一專案按 `pmView` 於閱讀前 15 分鐘啟動，讀取當日 `pm` 草稿、當日已發布版、`data/index.json`、`AGENTS.md`、來源筆記及規則；增量核對最新消息、更正、圖片、來源及時間。即使無新消息也須完成最後查核。將核實後的完整候選 `{pm:{...},lastSourceCheckedAt:<真實ISO時間>}` 寫到 `scratch`，以 `node tools/evening-edition.js finalize <當日YYYY-MM-DD> <候選檔>` 驗證並原子更新同日 `pm`；不得覆蓋 `am`、補歷史或建立第二個 edition。只有自檢成功才稱定稿，目標閱讀前 5 分鐘。`finalize` 拒絕重入；成功保持安靜，不重複通知。失敗只報實際阻礙，不能聲稱已刷新。

`scratch/pm-refresh/enabled.json` 記錄 `status="active"`、`draftTaskId="daily-news-pm-draft"`、`refreshTaskId="daily-news-pm-refresh"`、`syncTaskId="sync_open_times.ps1"`。

當日來源上限由 `selfcheck` 根據 `settings.json` 的 `pmView` 減 5 分鐘計算；`pmView=22:00` 時是 21:55。歷史版仍按原固定規則。刷新開始於閱讀前 15 分鐘，實際查核時間要記錄，不要將啟動時間冒充完成時間。

通知由外層任務負責，通常成功出稿保持安靜，只有原任務要求的阻礙訊息才主動報告。

正常重跑已定稿即跳過。有明確授權的同日更正才可執行 `correct <日期> <候選檔> --authorized-correction <理由>`；工具保存舊版本並重新自檢，另記錄更正理由。不得用更正模式補歷史。
最終候選 JSON 頂層須有 `pm` 與 `lastSourceCheckedAt`（真實最後來源查核的 ISO 時間）。不得填啟動或預計時間；helper 只接受不在未來且距定稿不超過 15 分鐘的時間，另記錄 `validatedAt`。
