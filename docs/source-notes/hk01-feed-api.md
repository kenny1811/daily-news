---
name: hk01-feed-api
description: 香港01 有乾淨 feed API，比掃分類頁 HTML 快同準，出稿摸候選卡用佢
metadata:
  node_type: memory
  type: reference
  originSessionId: e76c4607-3212-4ad2-ac79-617ca06af264
  modified: 2026-09-25T01:10:18.473Z
---

香港01 嘅分類頁除咗 HTML，仲有一個未寫入 CLAUDE.md 嘅 feed API：

- `https://web-data.api.hk01.com/v2/feed/zone/<N>?offset=0&limit=40`
- `https://web-data.api.hk01.com/v2/feed/category/<N>?offset=0&limit=40`

回乾淨 JSON，帶 `articleId`、`publishTime`（Unix 秒）、`lastModifyTime`、`title`，
直接就篩得出時間窗，唔使 grep HTML。

**點解值得記**：掃 HTML 分類頁只夾到 6–40 條，而且 `/channel/N` 要 `-L` 先跟到 redirect，
容易以為條版面冇料。2026-09-25 午報 Sub1 實測 feed API 又快又準。

相關：[[ogimage-curl-fetch-traps]]、[[weekend-overnight-source-order]]
