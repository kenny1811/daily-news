---
name: edigest-timezone-trap
description: 經濟一週 edigest 單篇頁 article:published_time 個 +00:00 其實係 HKT 標錯，要用 wp-json date_gmt +8
metadata:
  type: project
---

2026-09-10 午報實測：edigest 單篇頁 `article:published_time` 寫 `2026-09-10T06:33:59+00:00`，但 `https://www.edigest.hk/wp-json/wp/v2/posts?include=<ID>&_fields=id,date,date_gmt` 回 `date_gmt: 2026-09-09T22:33:59`，即單篇頁嗰個「+00:00」係標錯咗嘅 HKT；照 CLAUDE.md「UTC +8」機械再加 8 會變 14:33，超過當時時間。

**Why:** 照字面 +8 會將窗內稿誤判做超窗（或者反過來將超窗稿當窗內）。

**How to apply:** edigest 卡嘅發放時間一律用 wp-json `date_gmt` +8（＝單篇頁面顯示值）；有懷疑就 curl wp-json 核對。相關：[[subagent-wait-watchdog]]
