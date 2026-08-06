#!/usr/bin/env node
// 用法： node tools/stamp.js <YYYY-MM-DD> <am|pm>
//
// 解決「_updated 寫咗一個未發生嘅時間」呢個連續三次嘅錯（08-04 早／08-04 晚／08-06 晚）。
//
// 正確流程（一定要照呢個次序）：
//   1. 砌好 DB（_updated 隨便填，例如 "PENDING"）
//   2. node tools/selfcheck.js <date> <mode>      → 一定要 exit 0
//   3. git add -A && git commit                   ← 先 commit，未 push
//   4. node tools/stamp.js <date> <mode>          ← 本檔：由 git log 攞真時間、改 _updated、重抄 archive、amend
//   5. git push                                   ← 最後先 push（所以 amend 唔使 force）
//
// 點解要 amend 而唔係第二次 commit：amend 之後 index.html 入面嘅 _updated 同 commit 時間
// 係同一個 commit，唔會再出現「網頁寫 18:35 但 commit 係 18:22」呢種對唔上嘅情況。
// amend 本身會刷新 committer time，所以會自動 loop 到 HH:MM 唔再變為止（最多 4 次）。

const fs = require("fs");
const { execSync } = require("child_process");

const date = process.argv[2];
const mode = (process.argv[3] || "").toLowerCase();
if (!date || !["am", "pm"].includes(mode)) {
  console.error("用法: node tools/stamp.js YYYY-MM-DD am|pm");
  process.exit(1);
}
const label = mode === "am" ? "早報" : "晚報";
const sh = (c) => execSync(c, { encoding: "utf8" }).trim();

// git 嘅 committer time 一律當 UTC 讀（容器 TZ 係 UTC），+8 = HKT
function commitHKT() {
  const iso = sh("git log -1 --format=%cI"); // e.g. 2026-08-06T10:24:20+00:00
  const t = new Date(iso);
  t.setUTCHours(t.getUTCHours() + 8);
  const p = (n) => String(n).padStart(2, "0");
  return {
    hm: `${t.getUTCFullYear()}-${p(t.getUTCMonth() + 1)}-${p(t.getUTCDate())} ${p(t.getUTCHours())}:${p(t.getUTCMinutes())}`,
    full: `${t.getUTCFullYear()}-${p(t.getUTCMonth() + 1)}-${p(t.getUTCDate())} ${p(t.getUTCHours())}:${p(t.getUTCMinutes())}:${p(t.getUTCSeconds())}`,
  };
}

function writeUpdated(stamp) {
  const lines = fs.readFileSync("index.html", "utf8").split("\n");
  const i = lines.findIndex((l) => l.startsWith("const DB"));
  if (i < 0) { console.error("✖ 搵唔到 const DB"); process.exit(1); }
  const db = JSON.parse(lines[i].replace(/^const DB = /, "").replace(/;\s*$/, ""));
  const day = db[date];
  if (!day) { console.error("✖ DB 冇 " + date); process.exit(1); }
  const twoEd = !!(day.am || day.pm);
  const d = twoEd ? day[mode] : day;
  if (!d) { console.error("✖ DB[" + date + "] 冇 " + mode + " 呢版"); process.exit(1); }
  const val = `${stamp} HKT（${label}）`;
  if (d._updated === val) return false;      // 已經啱，唔使再改
  d._updated = val;
  const out = {};
  Object.keys(db).sort().reverse().forEach((k) => (out[k] = db[k]));
  lines[i] = "const DB = " + JSON.stringify(out) + ";";
  fs.writeFileSync("index.html", lines.join("\n"));
  fs.copyFileSync("index.html", "archive/" + date.replace(/-/g, "") + ".html");
  return true;
}

// 確認未 push（amend 一個已經 push 咗嘅 commit 要 force push，唔安全）
try {
  const ahead = sh("git rev-list --count @{u}..HEAD");
  if (ahead === "0") {
    console.error("✖ HEAD 已經同遠端一樣（即係已經 push 咗）。stamp 一定要喺 push 之前跑，唔好 amend 已 push 嘅 commit。");
    process.exit(1);
  }
} catch (e) { /* 冇 upstream 就照跑 */ }

let stamp = commitHKT();
for (let n = 1; n <= 4; n++) {
  const changed = writeUpdated(stamp.hm);
  if (!changed) {
    console.log(`✅ _updated = ${stamp.hm} HKT（${label}）　commit ${sh("git log -1 --format=%h")} @ ${stamp.full} HKT`);
    console.log("   （已對齊 commit 時間，可以 push）");
    process.exit(0);
  }
  execSync("git add -A && git commit -q --amend --no-edit");
  const after = commitHKT();
  if (after.hm === stamp.hm) {
    console.log(`✅ _updated = ${stamp.hm} HKT（${label}）　commit ${sh("git log -1 --format=%h")} @ ${after.full} HKT`);
    console.log("   （已對齊 commit 時間，可以 push）");
    process.exit(0);
  }
  stamp = after; // amend 令 commit time 跨咗分鐘，再嚟一次
}
console.error("✖ 試咗 4 次都對唔齊分鐘（極罕見）。請手動確認 _updated 同 git log。");
process.exit(1);
