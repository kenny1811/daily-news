---
name: weekend-overnight-source-order
description: 週末／凌晨補料嘅來源次序（香港組同經濟組各一張），2026-09-19 星期六實測
metadata: 
  node_type: memory
  type: project
  originSessionId: f9c5d977-5c51-4750-a22e-e90ac03fad9e
  modified: 2026-09-19T02:42:31.809Z
---

2026-09-19 星期六朝早實測，週末同凌晨補料唔好亂掃，跟呢個次序：

**香港 hks／hkl**：① Dimsum Daily（`wp-json/wp/v2/posts?categories=72`，週六 00:02 同 09:00–10:36 有 10 篇）→ ② 香港01 `/zone/6` 體育＋`/zone/19` 好食玩飛 → ③ 大紀元 `epochtimes.com/b5/nsc413.htm`（URL 自帶日期）→ ④ The Standard breaking-news（平日白天強、凌晨只得一篇 00:00 排程稿）。
法庭線、集誌社、綠豆、誌 HK Feature 週末朝早全部零篇，唔好喺度浪費時間。

**經濟 hke**：① 海峽時報財經 RSS ② 新加坡 CNA 財經 ③ 經濟一週 edigest（**週末照出，星期六 20–27 篇**，舊記錄寫「週末停更」係錯）④ Asia Times ⑤ Fortune。
Semafor、Hong Kong Business、Mingtiandi 週末停更；鉅亨網港股收市後停更，週末最多收到一條清晨稿。

**Why:** 2026-09-19 午報試過 hkl 補位只搵到一篇專欄稿、hke 三條全部 edigest 踩爆「唔可以 100% 單一來源」同「最少一條合資格獨立來源」兩條 fatal 規矩——唔係冇料，係掃錯門口。

**How to apply:** 開 subagent 之前就將呢個次序寫入佢嘅指示。⚠ Dimsum Daily 係二手改寫型日報，同香港01／星島大量撞單，收咗佢就要特別小心去重。詳細用法（wp-json 參數、時區、og:image CDN）已入 CLAUDE.md 第 4 節②同第 11 節。相關：[[wordpress-published-time-trap]]、[[hke-source-replacements]]
