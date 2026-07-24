const fs=require("fs");
const html=fs.readFileSync("index.html","utf8");
const db=eval("("+html.match(/const DB = ({[\s\S]*?});\n/)[1]+")");
const d=db["2026-07-24"];
const H="https://cdn.hk01.com/di/media/images/dw/";
d.hks.push(
 ["九巴排車員撞斃車長 不小心駕駛罪成","脫危駕罪，還押候判","香港01","https://www.hk01.com/社會新聞/60373182/","2026-07-24 11:32","2026-07-24 11:42",H+"20230907/776380711102844928983264.jpeg/BPaFca0wagJvnsUvJC43X2iA-ktf0_jTit1YMKDdWDA"],
 ["旺角通菜街火 3貓2狗葬火海","女戶主涉偷電被捕","香港01","https://www.hk01.com/突發/60373156/","2026-07-24 10:59","2026-07-24 11:37",H+"20260724/1157288761206247424143627.jpeg/yJbXLk4_wIVf7Kpp9Sslvr1jCjPzijnkf8uKqX_Liqk"],
 ["海關落馬洲拘男 肩包走私一隻狗","市值1.5萬元，27歲抵港男被捕","香港01","https://www.hk01.com/突發/60373174/","2026-07-24 11:19","",H+"20260724/1157283555710078976985342.jpeg/rWgMghdym8dgH0plYUiBjt0eidI4qcFJwudFWcLnRVk"],
 ["紅磡劏房外41歲男遇襲","同鄉揮刀錘施襲逃走，傷者頭手傷送院","香港01","https://www.hk01.com/突發/60373094/","2026-07-24 05:25","2026-07-24 06:57",H+"20260724/1157192171166633984524607.jpeg/KQ5UJq7qs6r8K5mRcFLxubGfpsFFWpP9AbTH5wG0x-c"]
);
d.hkl.push(
 ["風球紅霞｜天文台料今發一號波","料今進入本港800公里，周六晚至周日早最接近","香港01","https://www.hk01.com/天氣/60373069/","2026-07-24 08:43","2026-07-24 09:20",H+"20260724/1157252540958511104195736.jpeg/47uC0EucZaPpf0BeJCiTQmbEhV9HTbqS6xvO6usbzuo"],
 ["的士小巴氣價8月勁減","每公升減$0.91，大連排氣站$3.65","香港01","https://www.hk01.com/社會新聞/60373180/","2026-07-24 11:43","",H+"20240514/867078637353046016495106.jpeg/zpJ451EYfcxLMaQ-pUcDFXWOW4bTzV1MLm8H_QtvB_0"],
 ["汲水門大橋6車相撞","往機場快線一度封閉，下層開放","香港01","https://www.hk01.com/突發/60373106/","2026-07-24 08:08","2026-07-24 08:37",H+"20260724/1157237308236238848362897.jpeg/ZEmSEyZCcxhWFEApM242sh7K7RrKlZH0ZRA9AmUQPQI"],
 ["荃灣站馬騮闖路軌被捕捉","列車服務一度受阻","香港01","https://www.hk01.com/突發/60373137/","2026-07-24 10:05","2026-07-24 11:18",H+"20260724/1157278730490482688670428.jpeg/g7vr-QmmvrLH5FtQGfUhczPif-qpLH8ala5bj5WuW48"],
 ["屯門泳灘八旬泳客遇溺不治","昏迷送院搶救，同日不治","香港01","https://www.hk01.com/突發/60373097/","2026-07-24 07:13","2026-07-24 07:38",H+"20250827/1037291453837217792986412.jpeg/73pRPfSy6e3yrWX3k76wvkWfgH5iwdaVUfOZMnTzmTI"]
);
d.hkp.push(
 ["機場無人駕駛首次不設後備司機","議員倡訂營運時間，勿無休止測試","香港01","https://www.hk01.com/政情/60372924/","2026-07-23 16:22","2026-07-23 20:26",H+"20260723/1156952148362137600057298.jpeg/17Xq-u9sec2TszFFAMH6H_r098BaTBeKiUljgKNJY4A"],
 ["羅淑佩相隔年半旅行遊新疆","上山下湖感受牧民生活","香港01","https://www.hk01.com/政情/60372848/","2026-07-23 13:10","",H+"20260723/1156949693175959552627413.jpeg/_Fc10mq_I_4uKFvb2plEAHOoaRCz3nbE4LqH0-C6h9M"]
);
d._updated="[24/07/2026 Fri 11:55]（午間補足條數）";
const out=html.replace(/const DB = {[\s\S]*?};\n/,"const DB = "+JSON.stringify(db,null,1)+";\n");
fs.writeFileSync("index.html",out);
require("vm").compileFunction(out.match(/<script>([\s\S]*?)<\/script>/)[1]);
fs.copyFileSync("index.html","archive/20260724.html");
for(const k of ["hks","hkl","hke","hkp"]) console.log(k,"=",d[k].length);
