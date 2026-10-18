---
name: brief-json-shape
description: "兩篇簡報（ai／warb）嘅 JSON 結構係 {upd, img, t, src}，正文放喺 t，冇獨立標題欄"
metadata:
  node_type: memory
  type: reference
  originSessionId: 4e562038-be89-456b-b370-dfdd5a43f102
  modified: 2026-09-23T01:08:18.277Z
---

`data/YYYY-MM-DD.json` 入面 `ai` 同 `warb` 兩篇簡報嘅結構係 `{upd, img, t, src}`：

- `t` ＝ **正文**（約 300 字），**唔係標題**。整份簡報冇獨立標題欄。
- `img` ＝ 插圖（要係引用嗰幾篇來源文章其中一篇嘅 og:image）
- `upd` ＝ 今日日期 `YYYY-MM-DD`
- `src` ＝ `[["媒體名 — 標題","https://…單篇URL…"], …]`

**Why:** 2026-09-23 午報派 subagent 寫簡報，佢交返 `{t: 標題, b: 正文}`，照塞落去之後 selfcheck 報「AI 簡報太短（10 字）」——因為佢只數 `t`，而 `t` 入面得個標題。

**How to apply:** 派簡報 subagent 嗰陣，喺交貨格式度直接寫明 `t` 係正文；或者收貨之後自己 map 一次。寫入前對返 `data/<上一版>.json` 嘅 `ai` 個 key 清單最穩陣。見 [[report-only-followups]]。
