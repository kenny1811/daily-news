---
name: ogimage-curl-fetch-traps
description: 驗圖第一步用 curl 讀 og:image 嘅三個站別伏位（星島要 -L、Dimsum 要非瀏覽器 UA、grep 要帶引號）
metadata:
  type: project
---

驗圖第一步（fetch 文章對字串）用 `curl` 讀 og:image 時，實測三個伏位：

1. **星島 stheadline.com 單篇一定要 `curl -L`** —— 唔跟 302 只會攞到 746 bytes 空殼，睇落好似「原文冇 og:image」。
2. **Dimsum Daily 用瀏覽器 UA（Mozilla/5.0…Chrome）會回 403**；用 `curl/8.4.0` 或者完全唔設 `-A` 反而 200。WebFetch 對佢無效（轉 markdown 之後 meta 唔見咗）。
3. **grep 要配 `og:image"`（連埋收結引號）**，唔可以淨係 `og:image`；否則 DW、衛報呢啲站會先抽到 `og:image:type`／`og:image:width`，結果攞到 `image/jpeg` 或者 `1200`。

**Why:** 呢三個 case 都唔會報錯，只會靜靜哋回空值，好易誤判做「原文冇 og:image」而白白換走一張正確嘅圖，或者相反放過一張錯圖。

**How to apply:** 驗圖腳本統一用
`curl -sL -m 30 "$url" | grep -oE '<meta[^>]*og:image"[^>]*>' | head -1 | grep -oE 'https://[^"]+'`，
Dimsum Daily 嗰批唔好加 `-A`。相關：[[ettoday-ogimage-trap]]、[[wordpress-published-time-trap]]
