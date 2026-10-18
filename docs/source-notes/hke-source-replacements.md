---
name: hke-source-replacements
description: 香港財經時報已剔除；hke 其餘兩格改用 Hong Kong Business／鉅亨網／Mingtiandi，各有唔同時區處理
metadata:
  type: project
---

2026-09-18 Kenny 拍板剔除香港財經時報 businesstimes.com.hk（全站 Cloudflare bot 牆，curl 同真人瀏覽器都過唔到），改用三個實測合格嘅替代填 hke「其餘兩格」：

- **Hong Kong Business** hongkongbusiness.hk — 首選。香港本地經濟，日產 8+ 篇，`article:published_time` 係 `+0800`，**本身就係 HKT，唔使換算**。英文要譯。
- **鉅亨網** news.cnyes.com（港股版 `/news/cat/hk_stock`）— `published_time` 帶 `Z` ＝ UTC，**要 +8**。繁體中文。
- **Mingtiandi** mingtiandi.com — 香港／亞太地產英文，香港題材唔係日日有，**週末完全停更**。⚠ 2026-09-19 更正：`article:published_time` 個 `+00:00` **本身就係 HKT 唔使換算**，反而同頁 JSON-LD `datePublished` 先係真 UTC 要 +8。

**Why:** hke 禁用香港01／星島／The Standard／etnet 之後，「其餘兩格」得返 edigest（週末停更）同集誌社，池太淺；businesstimes 死咗之後連續兩版要靠集誌社頂。

**How to apply:** 詳細寫法（單篇 URL 格式、og:image CDN）已入 CLAUDE.md 第 4 節③，Sub2 嘅指示要原文貼晒。同日試過唔合格、唔好再試：hket（驗證牆）、FT 中文（付費牆）、智通財經同 AASTOCKS（冇任何時間 meta）、RFA 粵語（已停運）。時區處理同 [[edigest-timezone-trap]] 一樣要逐間記清楚，通用法則見 [[wordpress-published-time-trap]]。2026-09-19 再擴池（海峽時報、新加坡CNA、Asia Times、Fortune、Semafor、Dimsum Daily、Asia Financial、DW 中文），路透社 reuters.com 全站 401 已剔除；補料次序見 [[weekend-overnight-source-order]]。
