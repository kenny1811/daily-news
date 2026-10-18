---
name: ettoday-ogimage-trap
description: ETtoday og:image 檔名用 e 開頭，d 開頭嗰個變體一樣回 200，只有第一步對字串先捉到
metadata:
  type: project
---

ETtoday 單篇嘅 og:image 檔名係 `e` 開頭（例：`https://cdn2.ettoday.net/images/8271/e8271383.jpg`）。subagent 好易交返 `d` 開頭嗰個變體（`d8271383.jpg`）。

**Why:** 兩個檔名都存在、都回 HTTP 200，所以驗圖第二步（fetch 張圖睇 404）完全捉唔到，只有第一步「WebFetch 篇文章對 og:image 字串」先揭到。2026-09-18 夜報一次過中咗兩條 tw 卡。

**How to apply:** 收到 ETtoday 卡嗰陣，睇住 og:image 檔名係咪 `e` 開頭；唔係就一定要開返篇文對字串。呢個亦係 [[subagent-wait-watchdog]] 提過嘅「subagent 交返嚟嘅嘢要自己驗」嘅同一類問題——驗圖兩步唔可以慳，見 CLAUDE.md 第 9 節。
