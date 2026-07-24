const fs=require("fs");
const html=fs.readFileSync("index.html","utf8");
const db=eval("("+html.match(/const DB = ({[\s\S]*?});\n/)[1]+")");
const d=db["2026-07-25"];
const T=[
 ["美軍連續第13晚空襲伊朗","局勢持續升溫，未見停火跡象"],
 ["美發動第13輪空襲 伊朗警告封鎖海灣","德黑蘭放話升級，海灣航運受關注"],
 ["美續襲伊朗 胡塞放行中國商船","胡塞稱中國船可通行，戰況最新匯總"]
];
d.war.forEach((it,i)=>{ if(T[i]){ it[0]=T[i][0]; it[1]=T[i][1]; } });
d._updated="[25/07/2026 Sat 07:12]（美伊卡標題譯做中文）";
const out=html.replace(/const DB = {[\s\S]*?};\n/,"const DB = "+JSON.stringify(db,null,1)+";\n");
fs.writeFileSync("index.html",out);
require("vm").compileFunction(out.match(/<script>([\s\S]*?)<\/script>/)[1]);
fs.copyFileSync("index.html","archive/20260725.html");
d.war.forEach(it=>console.log(it[0],"|",it[1]));
