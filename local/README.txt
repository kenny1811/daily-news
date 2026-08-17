每日新聞 · 本機發佈 — 安裝步驟（2026-08-18 更新）
================================================

檔案全部放入  D:\Projects\Daily News

【0】token.txt（新增，必需）
  拉稿改用 GitHub API（要 token），唔再用 raw.githubusercontent.com。
  原因：raw 嘅下載配額係按「出街 IP」計，你部機經 NordVPN 出街，
  同一個出口節點成千人共用，配額被人用爆之後你就會收到
  429 Too Many Requests —— 2026-08-17 夜報就係咁樣 10 次全撞 429，
  結果部機保留住午報。API 嘅配額係按 token 計（5000/小時），
  唔再受共用 IP 影響。
  token.txt 只存喺呢個資料夾，永遠唔會入 public repo。

  PowerShell：
    Set-Content -Path 'D:\Projects\Daily News\token.txt' -Value '<你嘅 PAT>' -NoNewline

【1】安裝（做一次就得）
  以系統管理員身分開 PowerShell，貼入：

  powershell -ExecutionPolicy Bypass -File "D:\Projects\Daily News\setup_tasks.ps1"

  佢會：開防火牆 8080 → 註冊工作 → 即刻起動 server → 即刻拉一次稿。

【2】三個工作（2026-08-15 改制後）
    DailyNewsServer   開機時自動開 server（session 0，完全冇黑窗）
    DailyNews-AM      每日 10:00 拉午報（靜靜雞，唔開 Chrome）
    DailyNews-PM      每日 21:55 拉夜報 + 自動開 Chrome

【3】睇
  部機自己：       http://localhost:8080/
  meshnet 其他機： http://kenny1811-everest.nord:8080/
     （嗰部 device 對部機要開「Allow remote access」）

【運作原理】
  雲端定時任務 09:00 出午報、21:00 出夜報，push 上 GitHub（純儲存）。
  部機 10:00 / 21:55 用 GitHub API 拉最新 index.html，
  唔經 GitHub Pages / Actions。
  如果拉嗰陣今日嗰版未出，每 3 分鐘重試（最多 10 次）。
  紀錄喺 pull_log.txt —— 失敗會連 HTTP 狀態碼一齊寫落去。

【手動即刻拉】
  powershell -ExecutionPolicy Bypass -File "D:\Projects\Daily News\pull_news.ps1" -Edition pm -OpenChrome
