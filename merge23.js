const fs=require("fs");
// morning version (f881fdd) at /tmp/mchk, noon version at /tmp/orch
const mHtml=fs.readFileSync("/tmp/mchk/index.html","utf8");
const nHtml=fs.readFileSync("/tmp/orch/index.html","utf8");
const mDB=eval("("+mHtml.match(/const DB = ({[\s\S]*?});\n/)[1]+")");
const nDB=eval("("+nHtml.match(/const DB = ({[\s\S]*?});\n/)[1]+")");
const M=mDB["2026-07-23"], N=nDB["2026-07-23"];
const cutoff=new Date("2026-07-22T12:40:00+08:00").getTime(); // 24h before now
const fresh=it=>{ if(!it[4]) return false; const t=new Date(it[4].replace(" ","T")+":00+08:00").getTime(); return t>=cutoff; };

const D={};
// HK groups: morning as base + selected fresh noon extras
D.hks=[...M.hks]; // 7 fresh with imgs
D.hkl=[...M.hkl,
 ["蚊患｜馬鞍山誘蚊指數達22.7%","大埔西4場所被發清除積水通知書","香港01","https://www.hk01.com/18區新聞/60372715/","2026-07-23 00:48","","https://cdn.hk01.com/di/media/images/dw/20260723/1156760175131365376157029.jpeg/4YfosMVRuZj2fNR5CBN0Xn0cxCq3QLjOSnOsRkpzrEY"]
];
D.hke=[...M.hke];
D.hkp=[...M.hkp,
 ["法官陳嘉信再涉司法抄襲","江樂士倡強硬處理，湯家驊斥不尊重制度","星島","https://www.stheadline.com/society/3596660/","2026-07-23 10:40","","https://image.hkhl.hk/f/1200p0/0x0/100/none/2026-07/placeholder.jpg"],
 ["大棋盤｜法官抄襲只須「再培訓」","議員料立法會難跟進","星島","https://www.stheadline.com/politics/3596638/","2026-07-23 09:06","",""]
];
// fix hkp 陳嘉信 img: unknown real og image → leave "" (色塊) instead of guessed URL
D.hkp[3][6]="";
// intl: use noon groups but filter stale/timeless; fallback to morning if group empties
for(const k of ["cn","us","tw","war"]){
  const kept=(N[k]||[]).filter(fresh);
  D[k]=kept.length>=2?kept:M[k];
}
// track: noon (6)
D.track=N.track&&N.track.length?N.track:M.track;
// ai: noon text (longer) + morning img fallback
D.ai=N.ai||M.ai; if(D.ai&&!D.ai.img&&M.ai) D.ai.img=M.ai.img;
D.warb=N.warb||M.warb;
D._updated="[23/07/2026 Thu 12:45]（合併修正：剔舊聞、補發放時間）";

const out=nHtml.replace(/const DB = {[\s\S]*?};\n/,(function(){nDB["2026-07-23"]=D;return "const DB = "+JSON.stringify(nDB,null,1)+";\n";})());
fs.writeFileSync("/tmp/orch/index.html",out);
const s=out.match(/<script>([\s\S]*?)<\/script>/)[1];
require("vm").compileFunction(s);
fs.copyFileSync("/tmp/orch/index.html","/tmp/orch/archive/20260723.html");
// report
for(const k of ["hks","hkl","hke","hkp","cn","us","tw","war"]){
  console.log(k,"=",D[k].length,"缺時間:",D[k].filter(x=>!x[4]).length,"缺圖:",D[k].filter(x=>!x[6]).length);
}
console.log("ai img:",!!D.ai.img,"warb img:",!!D.warb.img);
