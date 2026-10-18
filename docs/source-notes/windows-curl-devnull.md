---
name: windows-curl-devnull
description: "node execSync 行 curl 時 `-o /dev/null` 喺 Windows 會靜靜哋失敗（回空 http_code），要用 `-o NUL`"
metadata: 
  node_type: memory
  type: project
  originSessionId: 2145bf12-2c08-4b44-bdac-3687b286322b
  modified: 2026-09-15T00:55:20.863Z
---

喺呢部 Windows 機用 node `execSync` 跑 curl（驗圖 step 2 攞 http_code）時，`-o /dev/null` 會令 curl 出錯、回空字串；改用 `-o NUL` 就正常回 200/404。Git Bash 直接行 curl 就用 `/dev/null` 或 `NUL` 都得。

**Why:** execSync 用 cmd.exe，冇 /dev/null。2026-09-15 午報 precheck 第一次跑晒全部 img= 空白，改 NUL 後即刻正常。

**How to apply:** 寫驗圖／curl 狀態碼 script 時用 `-o NUL`；如果見到 http_code 全部空白，先懷疑呢個。相關：[[subagent-wait-watchdog]]
