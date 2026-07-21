const fs=require("fs");
const db=JSON.parse(fs.readFileSync("/tmp/db.json","utf8"));
const d=db["2026-07-21"];
// 何伯 → 星島；走地馬 → 星島（來源多樣化）
d.hks[0]=["何伯認以摺刀刺傷何太 判囚2個月","官斥典型因愛成恨，何伯因病缺席聆訊","星島","https://www.stheadline.com/society/3595983/","2026-07-21 12:05","","https://image.hkhl.hk/f/1200p0/0x0/100/none/02f13e3b4c66ef2bdbdfad3bc3d663c1/2026-07/20260721_NEWS_ho.png"];
d.hks[3]=["警搗破馬場外圍「走地馬」集團","港島反黑拘78人，利用外圍網站時差投注","星島","https://www.stheadline.com/breaking-news/3595974/","2026-07-21 12:03","","https://image.hkhl.hk/f/1200p0/0x0/100/none/5bc86327495eca8e12f0171f16f0c27a/2026-07/20260721_NEWS_horse.png"];
d._updated="[21/07/2026 Tue 16:05]（來源多樣化：何伯／走地馬轉星島，紅油星島、機場大紀元香港）";
fs.writeFileSync("/tmp/db.json",JSON.stringify(db));
const srcCount={};
for(const g of ["hks","hkl","hke","hkp"]) d[g].forEach(it=>srcCount[it[2]]=(srcCount[it[2]]||0)+1);
console.log("香港來源分佈:",JSON.stringify(srcCount));
