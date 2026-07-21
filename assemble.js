const fs=require("fs");
const B="https://cdn.hk01.com/di/media/images/dw/";
const db=JSON.parse(fs.readFileSync("/tmp/db.json","utf8"));
const d=db["2026-07-21"];
delete d.hk;
d.hks=[
 ["何伯認圖用摺刀插何太 判囚2月","官指因愛成恨，望他修心養性","香港01","https://www.hk01.com/社會新聞/60351825/","2026-07-21 12:07","2026-07-21 12:46",B+"20260721/1156215781197877248394520.jpeg/uUD2_AhzO6e4KQcYy0HrOxBlMiVOzmMzkuQ8AJLkPAA"],
 ["九巴上層非禮女生 六旬漢認罪","伸手摸前座女生胸，稱事發後已遭解僱","香港01","https://www.hk01.com/社會新聞/60372054/","2026-07-21 12:14","2026-07-21 13:01",B+"20260721/1156222150189780992108425.jpeg/_trdAMvKQL8rWa6Z1taHMNtxLEI4ONWJUQ84ElEPOBI"],
 ["中環證券行員工挪用公款輸1.5億","26歲投資經理入職半年被捕，兩行澄清非涉事","香港01","https://www.hk01.com/財經快訊/60372135/","2026-07-21 15:03","2026-07-21 15:43",B+"20260721/1156251898240569344961035.jpeg/E9SerA0iLBHAGPIA2KIjo6KHpebWCb3u200bl9tNG5c"],
 ["警搗破馬場外圍「走地馬」集團","港島反黑拘78人，利用外圍網站時差投注","香港01","https://www.hk01.com/突發/60372045/","2026-07-21 12:12","2026-07-21 13:15",B+"20260721/1156204563749933056195670.jpeg/JBiXH_pJdn9sqlX7AbLa9xWKNVs3s_kMBqr1swaq9bM"],
 ["一億頭獎六合彩 投注站現人龍","八旬照顧者冀中獎聘工人","香港01","https://www.hk01.com/社會新聞/60372092/","2026-07-21 14:10","2026-07-21 15:12",B+"20260721/1156255511457304576482597.jpeg/ojvxLZZO7CAwwdm-VmDduE1vd_xfeGhmHbBR0B2wUdA"],
 ["書展最後一天 展商推六五折速銷","有家長掃18本補充練習","香港01","https://www.hk01.com/社會新聞/60372118/","2026-07-21 15:17","2026-07-21 15:19",B+"20260721/1156249017340923904549287.jpeg/Xhw6VwLOx20goIFY1dHfQ_mlvjyRbjboCpNH2iyTR9o"],
 ["馬鞍山商場穿梭巴士疑座位藏針","男乘客被刺中，警員趕至調查","香港01","https://www.hk01.com/突發/60372124/","2026-07-21 15:18","",B+"20260721/1156256549262331904193245.jpeg/OCKFGl0e--_0boJGYtEXfmHL_RPprVbIxMFwVOHBcFQ"],
 ["中環找換店遭淋紅油 列刑毀","警翻查閉路電視，鎖定男子擲紅油後逃去","星島","https://www.stheadline.com/breaking-news/3595948/","2026-07-21 11:08","","https://image.hkhl.hk/f/1200p0/0x0/100/none/7c81fcebad17c053e3789c4b70b75b31/2026-07/192020260721NW04.jpg"]
];
d.hkl=[
 ["天文台料周二部分地區雨勢較大","初時有狂風雷暴，之後短暫陽光","香港01","https://www.hk01.com/天氣/60371528/","2026-07-20 23:19","2026-07-20 23:20",B+"20260618/1144263887345422336215809.jpeg/pqT4MZ-81bs6qejxdG9xeqoDSM9BAke3pDmD5IE5g-Q?v=w1280r16_9"],
 ["打風｜天文台改料周日吹西南風","周末有狂風雷暴，市民需留意","香港01","https://www.hk01.com/天氣/60372046/","2026-07-21 12:48","2026-07-21 14:08",B+"20260721/1156239761359245312085392.jpeg/PEWPl4UeTNVkdVZxcmanYEFOZBA8oG9umTkXo5k5F6M"],
 ["西灣河興祥大廈兩日兩夜缺水","中高層水壓不足，住戶：被人遺忘咗","香港01","https://www.hk01.com/突發/60372018/","2026-07-21 11:54","2026-07-21 13:20",B+"20260721/1156223166469640192095173.jpeg/YsDYa7VweaHX4vSIlIxKXTtwh4HiSTz7LGuVNixrlTY"],
 ["青衣長安邨老鼠藥放枱面 2歲童誤服","家人報警送院治理","香港01","https://www.hk01.com/突發/60372082/","2026-07-21 13:17","2026-07-21 14:18",B+"20260721/1156231823563427840874319.jpeg/BvVo_PFs4AwgOCrh1MXewo62O3DEYOV1nGaL_Jxmi_w"],
 ["紅磡崇安街中學 男工人1樓墮地","受傷送院治理","香港01","https://www.hk01.com/突發/60372088/","2026-07-21 13:33","2026-07-21 15:47",B+"20260721/1156229381480255488135076.jpeg/tC-P9MtMv5WYZsvOriShHPw_-j1zkUjbJNxG1STcRtU"],
 ["香港機場上半年客運量升11.7%","半年3280萬人次，日韓內地帶動轉機客回升","大紀元香港","https://hk.epochtimes.com/news/2026-07-20/14311316","2026-07-20 17:16","","https://images1.epochhk.com/pictures/321298/1613548_%E9%A6%99%E6%B8%AF%E6%A9%9F%E5%A0%B4_%E4%BD%99%E9%8B%BC@1200x630.jpeg"],
 ["北都工程人員1.6萬租元朗YOHO一房","業主租金回報約2.7厘","香港01","https://www.hk01.com/地產樓市/60370608/","2026-07-21 12:30","",B+"20220213/569514922707259392482931.jpeg/TspI_61vh8YFo9HSaAHVQEKIQUEm3NFsp_0i2Kf9Itg?v=w1280r16_9"]
];
d.hke=[
 ["告別FIVE GUYS 湊湊火鍋接羅素街舖","較高峰冧價逾六成，核心區舖市回落","香港01","https://www.hk01.com/地產樓市/60372079/","2026-07-21 14:49","",B+"20260721/1156227096280829952148269.jpeg/jJ1gWS4uM3MzYz1S4gf79nHO9jLWdCJMCEOKgQhDioE"],
 ["內地餐飲來港撐市 6月商舖租務彈升16%","成交創近兩年新高","香港01","https://www.hk01.com/地產樓市/60371755/","2026-07-21 10:00","",B+"20260720/1155909561270407168810567.jpeg/RCA3s2wSvtPtFfso4s59xou36mQbxwYirb2Yua29mLk"],
 ["劏場黑洞 先達廣場迷你舖30萬歷史新低","業主「唔知價」賤賣","香港01","https://www.hk01.com/地產樓市/60372033/","2026-07-21 11:59","2026-07-21 14:11",B+"20260721/1156240345743233024981425.jpeg/t-lf4qXZnuy2lnxe1wTC2KwQtFc_t4WJzqd4LM6neCw"],
 ["蔡天鳳前家翁尚文苑銀主盤 315萬沽","微減5萬終售出","香港01","https://www.hk01.com/地產樓市/60372145/","2026-07-21 15:39","2026-07-21 15:43",B+"20260721/1156259234745159680624893.jpeg/DYidKpFdVr-toS-n2_Vb5Fev2qvbORghp_fybKf38mw"]
];
d.hkp=[
 ["香港郵政乾塘 研公私營合作","丘應樺料明年有方案，增自提點拓收入","香港01","https://www.hk01.com/政情/60372084/","2026-07-21 13:30","",B+"20250402/984135071243964416489135.jpeg/NDkfGdxDg1oY7xktL-KW1O8GfTxyv_0CesSaTV_Emk0"],
 ["立法會訪京團 黨校上堂提宏福火","學習借鑑河南水災打破部門壁壘","香港01","https://www.hk01.com/政情/60372058/","2026-07-21 12:36","2026-07-21 12:43",B+"20260721/1156212010178842624659182.png/fhpT-wPxd8eZCuqfB5pgKH1ZMkBKd9DOZVihimVYoYo"],
 ["立法會訪京團 國家行政學院上堂","李慧琼：非走馬看花","香港01","https://www.hk01.com/政情/60371884/","2026-07-20 19:14","2026-07-20 19:19",B+"20260720/1155951090488053760897063.jpeg/hshuO_Wa00a4aDMqNlkYu9MaGdLBZ3-qukK7zLpCu8w"],
 ["羅淑佩通宵睇波後行書展","課金支持葉劉、曾鈺成新書","香港01","https://www.hk01.com/政情/60371866/","2026-07-20 18:53","2026-07-20 18:58",B+"20250720/1023741101783126016495817.jpeg/6LDvEmpj52psoRiMJ_95DVmpzFFqDFbEMBDF7TAQxe0"]
];
d._updated="[21/07/2026 Tue 15:55]（香港拆社會8／民生7／經濟4／政治4）";
fs.writeFileSync("/tmp/db.json",JSON.stringify(db));

// 改 build2.js：SEC 4 group + zoom auto-fill + 顏色
let b=fs.readFileSync("build2.js","utf8");
b=b.replace(
 'const SEC=[["hk","🇭🇰 香港 · 社會．民生．政治．經濟"],["cn","🇨🇳 中國大陸"],["us","🇺🇸 美國"],["tw","🇹🇼 台灣"],["war","🔥 專題 · 美伊戰爭（2026）"]];',
 'const SEC=[["hk","🇭🇰 香港"],["hks","🇭🇰 香港 · 社會"],["hkl","🇭🇰 香港 · 民生"],["hke","🇭🇰 香港 · 經濟"],["hkp","🇭🇰 香港 · 政治"],["cn","🇨🇳 中國大陸"],["us","🇺🇸 美國"],["tw","🇹🇼 台灣"],["war","🔥 專題 · 美伊戰爭（2026）"]];'
);
b=b.replace(
 '.hk h2{border-color:var(--hk)}.cn h2{border-color:var(--cn)}',
 '.hk h2{border-color:var(--hk)}.hks h2{border-color:#f0883e}.hkl h2{border-color:#2dd4bf}.hke h2{border-color:#3fb950}.hkp h2{border-color:#d2a8ff}.cn h2{border-color:var(--cn)}'
);
b=b.replace(
 '.cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}@media(max-width:1500px){.cards{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:1120px){.cards{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:680px){.cards{grid-template-columns:1fr}}',
 '.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:12px}'
);
fs.writeFileSync("build2.js",b);
console.log("assembled. 香港 group:",["hks","hkl","hke","hkp"].map(k=>k+"="+d[k].length).join(" "),"| SEC改:",b.includes('"hks"'),"| zoom改:",b.includes("auto-fill,minmax(340px"));
