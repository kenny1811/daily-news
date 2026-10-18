---
name: cn-quota-and-sources
description: 中國組 cn 2026-09-19 起每版 8 條；同日新加聯合早報同 DW 中文做 cn 來源（兩個都係簡體要轉繁體）
metadata:
  type: project
---

Kenny 2026-09-19 要求中國新聞每版由 3 條加到 8 條（`tools/selfcheck.js` MINS.cn=8，CLAUDE.md 第 6 節 Sub3 已改）。
同日順便加咗兩個 cn 來源（詳細用法寫喺 CLAUDE.md 第 11 節）：
- 聯合早報 `zaobao.com.sg/realtime/china`：單篇 `/news/china/story<YYYYMMDD>-<ID>`，datePublished +08:00＝HKT，og:image 喺 cassette.sphdigital.com.sg。
- DW 中文：RSS `rss.dw.com/rdf/rss-chi-all`，單篇 `/zh/a-<ID>`，時間 UTC 要 +8。

**Why:** 原有 cn 來源池（星島、hk01 /zone/5、大紀元、希望之聲）12 小時窗要湊 8 條、又唔可以單一來源，週末凌晨易缺料。
**How to apply:** 兩個都係簡體中文，出卡一定要轉繁體。如果報告仍然話 cn 唔夠，下一步候選係 RFA 普通話、法廣 RFI 中文（可能被封）。
