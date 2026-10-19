# Daily News 新聞排程（Antigravity Sidecar）

2026-10-18 起，資料夾改名為 `D:\Projects\Daily News`。2026-10-19 依 Kenny 指示將排程全面整合，由單一 Antigravity sidecar `daily-news` 負責一日兩次（午報 am 及晚報 pm）編採，香港時間：

| Sidecar ID | 顯示名稱 | 初始時間 | 工作 |
|---|---|---|---|
| `daily-news` | Daily News (每日新聞編採) | 08:30, 20:30 (`30 8,20 * * *`) | 一日兩次：上午出午報 am，晚間出晚報 pm |

實際時間跟 `settings.json`：
- 午報開工＝`amView` 減 90 分鐘（預設 08:30），死線減 15 分鐘（09:45）。
- 晚報開工＝`pmView` 減 90 分鐘（預設 20:30），死線減 15 分鐘（21:45）。
- 新聞時間窗仍然固定跟 `tools/rules.json`，唔隨睇報時間放寬。

每次喺網頁修改 `settings.json`（POST `/api/settings`）或手動執行 `sync_open_times.ps1` 時，script 除咗更新 Windows 排程 `DailyNews-Open-AM`／`DailyNews-Open-PM` 之外，亦會自動更新 `C:\Users\Kenny\.gemini\config\sidecars\daily-news\sidecar.json` 嘅 `CRON_TZ=Asia/Hong_Kong` 時間。

所有執行都用 `D:\Projects\Daily News`。先完整讀 `AGENTS.md`、來源筆記索引、`settings.json`，再讀最近已出嘅 edition。日期鎖定一次：午報用香港當日；夜報凌晨 00–02 點用前一日。已有同日同版且 finalized 就跳過。遲過截稿才喚醒就報告錯過，唔自動補歷史稿。

自動出稿流程及原有午報缺料例外見 `AGENTS.md`。每次寫簡報紀錄、檢查及驗圖、只 stage 今次出稿檔案再 commit。已有不相關修改要保留。

Windows 本地伺服器由 HKCU Run 啟動項 `DailyNewsServer`（搭配 `start_server.vbs`）與 Windows 原生排程 `DailyNews-Open-AM`／`PM` 負責網站常駐及自動開報，唔依賴 Antigravity background task handle。

## 晚報出稿流程

1. 晚報按 `settings.json` 的 `pmView` 於閱讀前 90 分鐘啟動，讀取當日已發布版、`data/index.json`、`AGENTS.md`、來源筆記及規則；增量搜料及核實最新消息、更正、圖片、來源及時間。即使無新消息也須完成最後查核。
2. 將核實後的完整候選 `{pm:{...},lastSourceCheckedAt:<真實ISO時間>}` 寫到 `scratch`，以 `node tools/evening-edition.js finalize <當日YYYY-MM-DD> <候選檔>` 驗證並原子更新同日 `pm`；不得覆蓋 `am`、補歷史或建立第二個 edition。
3. 只有自檢成功才稱定稿，目標閱讀前 15–5 分鐘。`finalize` 拒絕重入；成功出稿保持安靜，不重複通知。失敗只報實際阻礙，不能聲稱已刷新。
4. `scratch/pm-refresh/enabled.json` 記錄 `status="active"`、`taskId="daily-news"`、`syncTaskId="sync_open_times.ps1"`。
5. 當日來源上限由 `selfcheck` 根據 `settings.json` 的 `pmView` 減 5 分鐘計算；`pmView=22:00` 時是 21:55。
6. 正常重跑已定稿即跳過。有明確授權的同日更正才可執行 `correct <日期> <候選檔> --authorized-correction <理由>`；工具保存舊版本並重新自檢，另記錄更正理由。不得用更正模式補歷史。
