# Daily News 新聞排程（Antigravity Sidecar）

2026-10-28 起依 Kenny 指示全面交接返 Antigravity sidecar `daily-news` 負責一日兩次（午報 am 及晚報 pm）編採；Codex automations 保持停用，避免重複。香港時間：

| 排程來源 | 顯示名稱 | 初始時間 | 工作 |
|---|---|---|---|
| Antigravity sidecar `daily-news` | Daily News (每日新聞編採) | 08:30, 20:30 (`30 8,20 * * *`) | 一日兩次：上午出午報 am，晚間出晚報 pm |

Codex automations（`automation`、`automation-2`、`automation-3`、`automation-4`）保持停用，唔出稿。

實際時間跟 `settings.json`：
- 午報開工＝`amView` 減 90 分鐘（預設 08:30），死線減 15 分鐘（09:45）。
- 晚報開工＝`pmView` 減 90 分鐘（預設 20:30），死線減 15 分鐘（21:45）。
- 新聞時間窗仍然固定跟 `tools/rules.json`，唔隨睇報時間放寬。

每次喺網頁修改 `settings.json`（POST `/api/settings`）時，server 等 `sync_open_times.ps1` 完成並確認 Windows 開報排程 `DailyNews-Open-AM`／`DailyNews-Open-PM`；同步失敗會回錯、還原舊設定並再試還原開報 task，若 task 還原都失敗會明講。Codex desktop 排程冇受支援嘅本機網頁 API，**POST 唔會即時改 Codex 開工時間**。目前仍由 `automation-3` 每日 15:00 檢查及同步；當日 15:00 後改睇報時間，需喺 Codex chat 用 `automation_update` 即時同步，否則新編採時間唔會即日生效。網頁唔可以聲稱只憑儲存就已調整 Codex。

所有執行都用 `D:\Projects\Daily News`。先讀 `AGENTS.md`、來源筆記索引、`settings.json`，再讀最近已出嘅 edition。日期鎖定一次：午報用香港當日；夜報凌晨 00–02 點用前一日。已有同日同版且 finalized 就跳過。遲過截稿才喚醒就報告錯過，唔自動補歷史稿。午報候選先跑 `node tools/morning-edition.js publish <日期> <候選檔>`，唔可以先寫 `data/` 後驗；兩版疑似撞卡要喺候選 `duplicateReviews` 逐對寫明編採核對結論。

自動出稿流程及原有午報缺料例外見 `AGENTS.md`。每次寫簡報紀錄、檢查及驗圖、只 stage 今次出稿檔案再 commit。已有不相關修改要保留。

Windows 本地伺服器由 HKCU Run 啟動項 `DailyNewsServer`（搭配 `start_server.vbs`）與 Windows 原生排程 `DailyNews-Open-AM`／`PM` 負責網站常駐及自動開報。

## 晚報出稿流程

1. 晚報按 `settings.json` 的 `pmView` 於閱讀前 90 分鐘啟動，讀取當日已發布版、`data/index.json`、`AGENTS.md`、來源筆記及規則；增量搜料及核實最新消息、更正、圖片、來源及時間。即使無新消息也須完成最後查核。
2. 將核實後的完整候選 `{pm:{...},lastSourceCheckedAt:<真實ISO時間>,duplicateReviews:[...]}` 寫到 `scratch`，以 `node tools/evening-edition.js finalize <當日YYYY-MM-DD> <候選檔>` 驗證並原子更新同日 `pm`；不得覆蓋 `am`、補歷史或建立第二個 edition。`finalize` 以 `settings.json` 計算閱讀前15分鐘死線，過時拒絕；已有 pm 而狀態檔遺失亦拒絕覆寫。
3. 只有自檢成功才稱定稿，目標閱讀前 15–5 分鐘。`finalize` 拒絕重入；成功出稿保持安靜，不重複通知。失敗只報實際阻礙，不能聲稱已刷新。
4. `scratch/pm-refresh/enabled.json` 只以 `status="active"`、`taskId="automation-2"` 作啟用閘門；`syncTaskId="automation-3"` 供排程核對。舊 `draftTaskId`／`refreshTaskId`、`stage` 流程唔再使用。
5. 當日新聞來源上限固定由 `tools/rules.json` 定義，夜報為 21:55；改 `pmView` 只會改開工與睇報時間，唔會放寬新聞時間窗。
6. 正常重跑已定稿即跳過。有明確授權的同日更正才可執行 `correct <日期> <候選檔> --authorized-correction <理由>`；工具保存舊版本並重新自檢，另記錄更正理由。不得用更正模式補歷史。
