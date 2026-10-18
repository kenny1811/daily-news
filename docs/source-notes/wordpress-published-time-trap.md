---
name: wordpress-published-time-trap
description: WordPress／Yoast 嘅 article:published_time 個 +00:00 唔可信，要用 wp-json date/date_gmt 對過先知要唔要 +8
metadata: 
  node_type: memory
  type: project
  originSessionId: f9c5d977-5c51-4750-a22e-e90ac03fad9e
  modified: 2026-09-19T02:42:20.367Z
---

2026-09-19 來源勘測實測：同一個 WordPress／Yoast CMS，`article:published_time` 個 `+00:00` 有兩種完全相反嘅行為——

| 站 | meta 值實際等於 | 要唔要 +8 |
|---|---|---|
| Dimsum Daily、Asia Times、Asia Financial | wp-json `date_gmt`（真 UTC） | **要 +8** |
| 經濟一週 edigest、Mingtiandi | wp-json `date`（本地 HKT） | **唔使** |

⚠ Mingtiandi 仲更陰險：`article:published_time` 係 HKT，但**同一頁嘅 JSON-LD `datePublished` 先係真 UTC 要 +8**，兩個欄位差足 8 個鐘。CLAUDE.md 原本寫「Mingtiandi UTC 要 +8」係錯，2026-09-19 已改正。
綠豆 greenbean.media 個 WP 時區設成 UTC+1，meta 標 `+01:00` 但數值等於真 UTC，一樣係 +8。

**Why:** 睇個 offset 標籤就落結論，會將窗內稿誤判超窗（或者反過來），成張卡報廢，而且 selfcheck 捉唔到——佢只驗下限，唔驗個時間讀得啱唔啱。

**How to apply:** 任何 WordPress 來源第一次用之前，行一次 `curl "https://<站>/wp-json/wp/v2/posts?per_page=5&_fields=date,date_gmt,link"`，睇個 meta 值等於 `date` 定 `date_gmt`。呢條 curl 同時係查「日產量／週末凌晨有冇稿」最快嘅方法。相關：[[edigest-timezone-trap]]、[[hke-source-replacements]]、[[weekend-overnight-source-order]]
