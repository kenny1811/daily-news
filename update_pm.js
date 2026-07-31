const fs=require("fs");
let s=fs.readFileSync("index.html","utf8");
const m=s.match(/const DB\s*=\s*(\{[\s\S]*?\});/);
if(!m){console.error("NO DB MATCH");process.exit(1);}
const DB=eval("("+m[1]+")");
const K="2026-07-31";
const old=DB[K];
const d=Object.assign({},old);

// 由舊 DB 攞返原本嗰張卡（保留真 og:image），match URL 含 sub
function keep(group, sub){
  const c=(old[group]||[]).find(x=>x[3] && x[3].includes(sub));
  if(!c) throw new Error("keep not found: "+group+" "+sub);
  return c;
}

d.hks=[
  keep("hks","60375463"),
  keep("hks","60375486"),
  keep("hks","60375477"),
  keep("hks","3599464"),
  keep("hks","3599460"),
  ["中英街背包藏貓入境 15歲少年被捕","海關沙頭角截查，同行中年婦一併被拘","香港01","https://www.hk01.com/article/60375687","2026-07-31 17:59","2026-07-31 18:01","https://cdn.hk01.com/di/media/images/dw/20260731/1159918494280585216817426.jpeg/EHGMKEFO6uLpIpJUOF0Gq1kbN2GNow5zCEIcxghCHMY"],
  ["落馬洲村屋雪櫃藏9貓屍 租客被控","28歲男涉虐畜，官下令還押候訊","法庭線","https://thewitnesshk.com/%e6%b6%89%e8%90%bd%e9%a6%ac%e6%b4%b2%e6%9d%91%e5%b1%8b%e9%9b%aa%e6%ab%83%e8%97%8f9%e5%85%b7%e8%b2%93%e5%b1%8d-28%e6%ad%b2%e7%a7%9f%e5%ae%a2%e8%a2%ab%e6%8e%a7%e8%99%90%e7%95%9c-%e5%ae%98%e4%b8%8b/","2026-07-31 15:15","2026-07-31 15:15","https://thewitnesshk.com/wp-content/uploads/2026/07/0214_05_link_01-copy.jpg"],
  ["深水埗警搗5非法賭檔拘56人","揭集團包食宿聘內地人來港助經營","香港01","https://www.hk01.com/article/60375623","2026-07-31 16:50","2026-07-31 16:54","https://cdn.hk01.com/di/media/images/dw/20260731/1159890984964722688826703.jpeg/ZIcFXiAjG3ZlSEzqlUzO6FetBtbkO3fO5azIwMysyMA"]
];

d.hkl=[
  keep("hkl","60375493"),
  keep("hkl","60375491"),
  keep("hkl","60375515"),
  keep("hkl","3599251"),
  keep("hkl","3599521"),
  keep("hkl","3599202"),
  ["父母不滿社署為童接種疫苗申保護令","質疑社署越權，循法律途徑爭撫養安排","香港01","https://www.hk01.com/article/60375684","2026-07-31 17:45","2026-07-31 17:56","https://cdn.hk01.com/di/media/images/dw/20260731/1159917494404911104836950.jpeg/NmdGZlNZ9oM-2ycj0C2LbIzknjQhUtVjPzQh0Bo0IdA"],
  ["新皇崗口岸開通 內地餐飲帶旺人氣","港人稱北上消費更方便，或增外遊意欲","星島","https://www.stheadline.com/society/3599353","2026-07-31 07:00","2026-07-31 07:00","https://image.hkhl.hk/f/1200p0/0x0/100/none/74711a2056421d7054dc004709e4f6fa/2026-07/WhatsApp_Image_2026-07-30_at_9_52_07_PM.jpeg"]
];

d.hke=[
  ["港第二季GDP增4.3% 料下半年穩健","港府公布次季GDP增4.3%，料下半年續穩","香港01","https://www.hk01.com/article/60375647","2026-07-31 16:51","2026-07-31 16:51","https://cdn.hk01.com/di/media/images/dw/20250722/1024295713200148480156427.jpeg/qPkTa2HVMpKm5a_HMy3rl26BcEcBkpsAusyTVbrMk1U"],
  ["本港次季負資產宗數大減 按季縮62%","負資產減至4356宗，反映樓價回穩","香港01","https://www.hk01.com/article/60375655","2026-07-31 17:05","2026-07-31 17:34","https://cdn.hk01.com/di/media/images/dw/20240122/826047257462706176835920.jpeg/Yfa5OT9rZgwJeT5kuZIZH2wgP-yXPx_L_lffHv5X3x4"],
  ["AI股大反彈 韓股曾升18% 傳日韓干預","AI股全線反彈，市場傳日韓干預匯市","星島","https://www.stheadline.com/stock-market/3599497","2026-07-31 10:25","2026-07-31 14:35","https://image.hkhl.hk/f/1200p0/0x0/100/none/d09e2a1ea8d1dcaf15d3423310d84066/2026-07/iStock-1096399496_1.jpg"]
];

d.hkp=[
  ["鄧銘心向特首陳情 風災打卡有苦衷","議員解釋風災打卡背後苦衷，籲勿誤解","香港01","https://www.hk01.com/article/60375591","2026-07-31 17:16","2026-07-31 17:16","https://cdn.hk01.com/di/media/images/dw/20260731/1159908938477473792970634.jpeg/BdAu75KDGzqBzLfox0eqhIFYr04srZQLL2QBoy9kAaM"],
  ["高級警司警總非禮下屬 囚5月3周","周毅剛非禮女下屬罪成，官斥行為大膽","香港01","https://www.hk01.com/article/60375357","2026-07-31 15:09","2026-07-31 16:42","https://cdn.hk01.com/di/media/images/dw/20260731/1159902402657128448834027.jpeg/H2OJuMQHm2ut42zzNMwDwNiEjrQ5tBn3hKe5QISnuUA"],
  ["譚鎮國倡發展口岸經濟引客來港","議員倡以口岸經濟引流內地旅客來港消費","星島","https://www.stheadline.com/society/3599359","2026-07-31 07:00","2026-07-31 07:00","https://image.hkhl.hk/f/1200p0/0x0/100/none/5ebc03217bfa24978be092be92a8c834/2026-07/NI260717LG014_0.jpg"]
];

d.cn=[
  ["中國7月PMI跌破50 製造業萎縮","官方三大PMI齊穿榮枯線，景氣轉差","大紀元","https://www.epochtimes.com/gb/26/7/31/n14820895.htm","2026-07-31 14:56","2026-07-31 15:27","https://i.epochtimes.com/assets/uploads/2025/04/id14493604-GettyImages-2210947966.jpg"],
  ["五礦前總經理國文清落馬 栗戰書舊部","退休兩年後被查，涉嚴重違紀違法","大紀元","https://www.epochtimes.com/gb/26/7/31/n14820862.htm","2026-07-31 13:35","2026-07-31 13:35","https://i.epochtimes.com/assets/uploads/2026/07/id14820868-7e78240d05bcf69be2261d00f0d64320.jpg"],
  ["中企啟676億回購潮 關稅戰後最大救市","676億人民幣回購穩市，冀提振投資信心","香港01","https://www.hk01.com/article/60375470","2026-07-31 11:00","2026-07-31 11:00","https://cdn.hk01.com/di/media/images/dw/20260707/1151150541917655040810753.jpeg/kHDy3mVfS0ckOjYfj5nbsx4BZqA48F8r45qapuOamqY"]
];

d.us=[
  ["共和黨押後特朗普司法部長提名投票","參院委員會質疑基金爭議，暫緩表決","半島電視台","https://www.aljazeera.com/news/2026/7/30/republicans-delay-vote-on-trumps-us-attorney-general-pick-amid-concerns","2026-07-31 07:36","2026-07-31 08:07","https://www.aljazeera.com/wp-content/uploads/2026/07/afp_6a6b5bca4c74-1785420746.jpg?resize=1920%2C1440"],
  ["共和黨削醫保後 中期選舉打醫保牌","曾投票削醫保者轉扮捍衛者拉票","NPR","https://www.npr.org/2026/07/31/nx-s1-5870960/republican-ads-healthcare-medicaid-2026-midterms","2026-07-31 17:00","2026-07-31 17:00","https://npr.brightspotcdn.com/dims3/default/strip/false/crop/5616x3159+0+293/resize/1400/quality/85/format/jpeg/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2Fcd%2F15%2F6a752a8e4ac8ab4c30c6366c0097%2Fgettyimages-2235234083.jpg"],
  keep("us","4826005")
];

d.tw=[
  ["台美食展開幕 賴清德盼2030觀光破兆","賴清德冀2030觀光產值突破一兆元","大紀元","https://www.epochtimes.com/gb/26/7/31/n14820967.htm","2026-07-31 17:10","2026-07-31 17:10","https://i.epochtimes.com/assets/uploads/2026/07/id14820979-2607310423092378.jpg"],
  keep("tw","60375336"),
  ["台國安人士:統促黨危害國安應解散","內政部下月擬聲請憲法法庭解散統促黨","大紀元","https://www.epochtimes.com/gb/26/7/31/n14820925.htm","2026-07-31 16:58","2026-07-31 16:58","https://i.epochtimes.com/assets/uploads/2026/07/id14820356-864678.jpg"]
];

d.war=[
  ["伊朗襲科威特美軍基地 報復美空襲","IRGC無人機襲賈比爾基地，報復美方空襲","半島電視台","https://www.aljazeera.com/news/2026/7/31/irgc-strikes-us-targets-in-kuwait-a-day-after-us-hits-iran-latest-events","2026-07-31 17:09","2026-07-31 17:09","https://www.aljazeera.com/wp-content/uploads/2026/07/afp_6a6c41bacc49-1785479610.jpg?resize=1920%2C1440"],
  ["伊朗戰事削弱特朗普以實力促和承諾","NPR指持續開戰與外交穩定目標相悖","NPR","https://www.npr.org/2026/07/30/nx-s1-5902024/trump-promised-to-bring-peace-through-strength-the-war-in-iran-undermines-that","2026-07-31 04:30","2026-07-31 04:30","https://media.npr.org/include/images/facebook-default-wide-s1400-c85.jpg"],
  keep("war","us-hits-multiple-targets")
];

d.track=[
  ["天文台取消黃雨警告 未來兩三日續狂風雷暴","天文台取消黃色暴雨警告，未來數日續有狂風雷暴","香港01","https://www.hk01.com/article/60375441","2026-07-31 15:05","2026-07-31 15:05","https://cdn.hk01.com/di/media/images/dw/20260731/1159844603822608384643150.jpeg/v6jqX5BH1NYbO_yRauBJG6QP-Pp06F6ayRWSMskVkjI"],
  ["尖沙咀血案再多2人落網 累計9人被捕","尖沙咀血案再拘兩尼泊爾男，累計9人被捕","香港01","https://www.hk01.com/article/60375439","2026-07-31 09:13","2026-07-31 10:00","https://cdn.hk01.com/di/media/images/dw/20260731/1159788824277028864465128.jpeg/T-zFQJM1_NQ3CBJSowHArXH4-IJS43VcRB1AO0QdQDs"],
  ["日本央行維持利率 官員拒評干預匯市","日央行維持利率不變，官員拒評干預匯市","星島","https://www.stheadline.com/macroeconomics/3599519","2026-07-31 11:35","2026-07-31 11:35","https://image.hkhl.hk/f/1200p0/0x0/100/none/3f1a5e1fdefc810d08dd9fb1827be3a3/2026-07/BOJ.png"]
];

d.warb={
  upd:"2026-07-31",
  img:"https://www.aljazeera.com/wp-content/uploads/2026/07/afp_6a6c41bacc49-1785479610.jpg?resize=1920%2C1440",
  t:"7月31日，伊朗伊斯蘭革命衛隊（IRGC）以無人機襲擊科威特Ahmad Al-Jaber空軍基地，聲稱擊中機庫、衛星通訊系統同裝備倉庫，以報復美國早前空襲伊朗多處目標，包括格什姆島（Qeshm）。\n據報格什姆島嘅美軍空襲造成3人死亡；而早前伊朗襲擊科威特一間中國公司設施，亦造成一名工人死亡。截至報道時，美國尚未就今次科威特遇襲作出回應，具體損毀同傷亡數字未明，CNN亦指美方報告當日並無發動新一輪空襲。\n衝突地理範圍持續擴大：胡塞武裝宣布喺紅海實施海上封鎖，烏克蘭喺裏海發動襲擊，伊拉克、約旦以至埃及都有交火，埃及更係首次被捲入。\n暫時未見停火跡象。分析認為美伊「以牙還牙」式軍事打擊短期內會持續，同時海灣國家（包括卡塔爾）斡旋嘅外交努力仍然並行，戰事有進一步區域化嘅風險。",
  src:[["半島電視台","https://www.aljazeera.com/news/2026/7/31/irgc-strikes-us-targets-in-kuwait-a-day-after-us-hits-iran-latest-events"],["CNN","https://www.cnn.com/2026/07/31/world/live-news/iran-war-trump"]]
};
// ai 無新進展 -> 保留

d._updated="2026-07-31 18:15 HKT（晚間更新）";
DB[K]=d;

const ordered={};
Object.keys(DB).sort().reverse().forEach(k=>ordered[k]=DB[k]);
const out="const DB = "+JSON.stringify(ordered)+";";
s=s.replace(/const DB\s*=\s*\{[\s\S]*?\};/,()=>out);
fs.writeFileSync("index.html",s);
console.log("WROTE OK. warb len:",d.warb.t.length,"| ai len:",d.ai&&d.ai.t&&d.ai.t.length,"| ai.upd:",d.ai&&d.ai.upd);
console.log("counts hks",d.hks.length,"hkl",d.hkl.length,"hke",d.hke.length,"hkp",d.hkp.length,"cn",d.cn.length,"us",d.us.length,"tw",d.tw.length,"war",d.war.length,"track",d.track.length);
