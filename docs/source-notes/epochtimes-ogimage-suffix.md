---
name: epochtimes-ogimage-suffix
description: 大紀元 og:image 帶尺寸尾段（多數 -700x359，但有 -594x359 等變體），剝咗都回 200，第二步驗唔到
metadata:
  node_type: memory
  type: reference
  originSessionId: 4e562038-be89-456b-b370-dfdd5a43f102
  modified: 2026-09-23T01:08:27.637Z
---

大紀元（epochtimes.com）單篇嘅 og:image 格式係
`https://i.epochtimes.com/assets/uploads/<年>/<月>/<檔名>-<寬>x359.<jpg|webp>`，
**個尺寸尾段係原文一部分，唔准剝、唔准改**。
⚠ **尾段唔一定係 `-700x359`**（2026-09-26 午報實測）：同一日就見過 `-594x359` 同 `-480x359`。
唔好當 `-700x359` 係固定值去砌 URL 或者當驗證條件——**一律由原文逐字抄**。

伏位：剝咗尾段嘅 URL（`…_111.jpg`）一樣回 **200**，所以第 9 節第二步驗圖捉唔到，**只可以靠第一步逐字比對原文**。

另外：
- 大紀元單篇**冇** `article:published_time`，要讀 JSON-LD `"datePublished"`，值帶 `Z` ＝ **UTC，要 +8**。
- `/gb/` 係簡體版、`/b5/` 係繁體版，兩個都係大紀元，og:image 同時間一樣；用 `/gb/` 就記住標題要自己轉繁。

**Why:** 2026-09-23 午報一個 subagent 交咗剝殼版嘅 5 條大紀元圖，第二步全部 200 過關，係第一步逐字比對先捉到。

**How to apply:** 收大紀元卡一定要做第一步比對。同 [[ettoday-ogimage-trap]]（`e` vs `d` 開頭）係同一類伏位——錯 URL 照回 200。
