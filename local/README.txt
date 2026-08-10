每日新聞 · 本機發佈 — 安裝步驟（2026-08-10）
================================================

三個檔案全部放入  D:\Projects\Daily News  之後：

【1】安裝（做一次就得）
  右掣 Start 掣 →「Windows PowerShell (系統管理員)」，貼入：

  powershell -ExecutionPolicy Bypass -File "D:\Projects\Daily News\setup_tasks.ps1"

  佢會：開防火牆 8080 → 註冊 3 個工作 → 即刻起動 server → 即刻拉一次稿。

【2】刪走舊嘢
  工作排程器入面，刪走以前開 kenny1811.github.io 嗰兩個工作
  （「每日新聞（朝）」同「每日新聞（晚）」）——由今日起用新嗰三個：
    DailyNewsServer   登入時自動開 server（背景，冇視窗）
    DailyNews-AM      每日 07:00 拉稿 + 自動開 Chrome
    DailyNews-PM      每日 19:00 拉稿 + 自動開 Chrome

【3】睇
  部機自己：       http://localhost:8080/
  meshnet 其他機： http://<部機嘅Meshnet名>:8080/
     （NordVPN app → Meshnet 度睇到個名，通常係 xxx.nord；
       嗰部 device 對部機要開「Allow remote access」）

【運作原理】
  雲端定時任務照舊 06:00/18:00 出稿 push 上 GitHub（呢步一直冇壞過）。
  部機 07:00/19:00 自己去 raw.githubusercontent.com 拉最新 index.html，
  唔經 GitHub Pages / Actions，所以嗰邊塞死都唔關事。
  如果拉嗰陣今日嗰版仲未出，會每 3 分鐘自動重試（最多 10 次），
  之後先開 Chrome。紀錄喺 pull_log.txt。

【留意】
  · 部機要開機＋login 咗，server 先會行；部機瞓咗手機就睇唔到。
  · 網頁入面嘅搜尋、早晚報切換、事件追蹤全部照舊，功能一樣。
