const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const db=eval("("+html.match(/const DB = ([\s\S]*?);\n/)[1]+")");
const D='2026-08-02';const t=db[D];

// 1. 換走 3 條 taiwannews（og:image 係 percent-encoded + 防盜連，載唔到圖）
t.cn[2]=["解放軍報引毛澤東詞句批菲律賓","中菲南海衝突再起，軍報稱加強黃岩島管控合法合理","星島日報","https://www.stheadline.com/realtime-china/3600179/","2026-08-02 15:50","2026-08-02 15:50","https://image.hkhl.hk/f/1200p0/0x0/100/none/d013f7feeffc9fb8f667162884b9cf51/2026-07/1_1__1.jpg"];
t.tw[0]=["魯比奧：反對以脅迫改變台海現狀","美國務卿指不支持現狀被改變，中美衝突將是災難","香港01","https://www.hk01.com/article/60376009","2026-08-02 14:00","2026-08-02 14:00","https://cdn.hk01.com/di/media/images/dw/20220807/632868878027853824870462.jpeg/1kkOyen4ZQTSXfxoueiUf9dl9nc1iPlAJPPxZCTz8WQ?v=w1280r16_9"];
t.tw[1]=["日星萩原利久台北見面會登場","日本演員抵台，數十粉絲機場守候接機","大紀元","https://www.epochtimes.com/b5/26/8/2/n14821730.htm","2026-08-02 10:05","2026-08-02 10:05","https://i.epochtimes.com/assets/uploads/2026/08/id14821731-2608012140491487-700x359.jpg"];

// 2. 事件追蹤改返做「持續跟進嘅同一批線索」，唔好日日換晒
t.track=[
["尖沙咀血案｜800警掃黑幫場所拘90人","7.26酒吧毆鬥致死案：勝和頭目自首，累計12人落網","香港01","https://www.hk01.com/article/60376062","2026-08-02 17:47","2026-08-02 17:56","https://cdn.hk01.com/di/media/images/dw/20260802/1160637751859613696675321.jpeg/MYXqg8dkR3tQXV0b1eav2jSS2uOpw6G-rW1kJq1tZCY?v=w1280r16_9"],
["施政報告2026｜首場地區諮詢會屯門開鑼","逾130市民出席，房屋土地最受關注；李家超回應校園欺凌","星島日報","https://www.stheadline.com/politics/3600152/","2026-08-02 14:20","2026-08-02 14:20","https://image.hkhl.hk/f/1200p0/0x0/100/none/145b0bc8e5c889721c5a7e487fadc7f6/2026-08/q.jpg"],
["華富邨清拆｜58年銀都冰室悄然結業","2031年清拆在即，屋邨老字號逐間告別（今日暫無新進展）","香港01","https://www.hk01.com/article/60375876","2026-08-01 19:31","2026-08-01 20:41","https://cdn.hk01.com/di/media/images/dw/20260801/1160324815278575616450127.jpeg/NSyIe12anj-_NILWJsYUCkuLBfRItdahA2AXPwNgFz8"]
];
t._updated="2026-08-02 18:45 HKT（晚間更新．修訂）";

const out={};Object.keys(db).sort().reverse().forEach(k=>out[k]=db[k]);
fs.writeFileSync('index.html',html.replace(/const DB = ([\s\S]*?);\n/,()=>"const DB = "+JSON.stringify(out)+";\n"));
const enc=[];Object.keys(out).forEach(d=>['hks','hkl','hke','hkp','cn','us','tw','war'].forEach(g=>(out[d][g]||[]).forEach(c=>{if(/%2F|%3A/i.test(c[6]||''))enc.push(d+' '+g+' '+c[0]);})));
console.log('仲有 encode 圖 URL：',enc.length?enc:'冇');
