const fs=require("fs");
const html=fs.readFileSync("index.html","utf8");
const db=eval("("+html.match(/const DB = ({[\s\S]*?});\n/)[1]+")");
const H="https://cdn.hk01.com/di/media/images/dw/";
db["2026-07-23"]={
 hks:[
  ["天水圍車房男工遭小巴壓斃","負傷爬出車底，昏迷送院不治","香港01","https://www.hk01.com/突發/60372770/","2026-07-23 10:28","2026-07-23 10:30",H+"20260723/1156907232986664960357109.jpeg/7HRUo_YmP4OcZfSerXMDLYGXgjtY4g9Qm7oLS5u6C0s"],
  ["旺角單車衝紅燈遭的士撞飛","車CAM 拍低全程，網民嘆累咗司機","香港01","https://www.hk01.com/突發/60372760/","2026-07-23 10:21","",H+"20260723/1156905175814770688308147.jpeg/t62QZ4xbYGFItuJkMMWna2GpeMXe_El4xaDUjMWg1Iw"],
  ["荃灣「子彈仔」街童4男被捕","涉擲物拍片，聖芳濟中學稱正了解","香港01","https://www.hk01.com/突發/60372703/","2026-07-22 22:27","2026-07-22 22:55",H+"20260722/1156734577838919680985742.jpeg/1SLTRHW54kWfXlcbz5Bz7inTVCl_H4tc-Hgw-Ph4MPg"],
  ["大埔白石角3青年圍毆搶袋","揚言掟受害人落海，傷者送院","香港01","https://www.hk01.com/突發/60372717/","2026-07-23 01:32","2026-07-23 09:41",H+"20260723/1156849486329286656237198.jpeg/CsC22z-EDuCf9WjM7KWN5YRmw3zoZAeJMDl64jA5euI"],
  ["「猜猜我是誰」電騙呃六旬婦4萬","再交收時斷正，警拘47歲內地漢","香港01","https://www.hk01.com/突發/60372733/","2026-07-23 07:34","",H+"20230112/690343913101201408362179.jpeg/tvZoqKxCBiWKfsazcIOPuSeIUqTchPK9l7bCHJe2whw"],
  ["東涌新屋苑黑工裝修 拘5人","一站式低價招徠，入境處拉人","香港01","https://www.hk01.com/突發/60372722/","2026-07-23 03:15","",H+"20260723/1156797645784616960498617.jpeg/ADP1ijAlOXJMxVQVEwW67uzXzlxc1emTrnmK4K55iuA"],
  ["青年男廁寫「光時」煽動罪成","官拒納因自閉、解離症犯案之辯","法庭線","https://thewitnesshk.com/%e9%9d%92%e5%b9%b4%e6%b6%89%e7%94%b7%e5%bb%81%e5%af%ab%e5%85%89%e6%99%82%e7%85%bd%e5%8b%95%e7%bd%aa%e6%88%90-%e5%ae%98%e6%96%a5%e8%be%af%e6%96%b9%e5%b0%88%e5%ae%b6%e8%ad%89%e4%be%9b%e5%89%8d%e5%be%8c/","2026-07-22 16:23","","https://thewitnesshk.com/wp-content/uploads/2026/07/2026-07-22-01.jpeg"]
 ],
 hkl:[
  ["打風｜熱帶低氣壓將成颱風","天文台路徑圖：周日凌晨登陸汕頭一帶","香港01","https://www.hk01.com/天氣/60372732/","2026-07-23 07:46","2026-07-23 09:16",H+"20260723/1156896054348615680532849.jpeg/afrgu6SxauBVSH6PoDEzmiz4L6pPPqk2xjla_MY5Wvw"],
  ["預設醫療指示條例月底生效","醫管局：機制慎入易出，遇疑先救人","香港01","https://www.hk01.com/社會新聞/60372748/","2026-07-23 10:21","","https://cdn.hk01.com/di/media/images/3754647/org/cfaab6cbc6f34ba23885e7179a10dff4.jpg/T6bHyQYrdIV4VOzW3xspUWUz1sUYcpKuwFTmTupU5k4"],
  ["港鐵九龍灣站馬騮闖路軌","觀塘綫列車一度慢駛","香港01","https://www.hk01.com/突發/60372731/","2026-07-23 07:27","2026-07-23 08:28",H+"20260723/1156877639240126464257834.jpeg/bCf4qX8Wh0vRx91oGIZlopw8eHRlt2AfWturllrbq5Y"],
  ["蓮香樓機場店價目睇齊尖沙咀","特點頂點貴上環店一成","香港01","https://www.hk01.com/社會新聞/60372686/","2026-07-22 21:53","2026-07-22 22:11",H+"20260722/1156723579887292416034287.jpeg/uxEZUAaH_S58bd7B-CARiYNzYSfM_NQRQ1doiUNXaIk"]
 ],
 hke:[
  ["低稅誘對沖基金由星遷港","AIMA 向新加坡獻計挽競爭力","香港01","https://www.hk01.com/財經快訊/60372664/","2026-07-22 18:30","2026-07-22 18:32",H+"20260722/1156665681681321984167304.jpeg/PHUHMpePyW1sHPhZwxITkqe4-lsq_6szMYd9ATGHfQE"],
  ["用家2200萬買愉景灣海景洋房","業主持貨10年帳面賺570萬","香港01","https://www.hk01.com/地產樓市/60372549/","2026-07-22 18:01","2026-07-22 18:02",H+"20260610/1141345752954441728821936.jpeg/xFt6W_fAqij1PXCsw5j5Jl418FjH3muzmizJYposyWI"],
  ["劏場英雄塚｜地皇廣場自救失敗","80呎銀主舖10萬低價開拍","香港01","https://www.hk01.com/地產樓市/60372480/","2026-07-22 13:34","2026-07-22 13:41",H+"20260722/1156588184994320384715360.jpeg/MsmCFkkcwrAUUUvdunnGuFP8kcy6ylItWBX3clgV93I"],
  ["MPF 港股基金首7月跑輸亞股","恒指發力太遲，落後23個百分點","香港01","https://www.hk01.com/財經快訊/60372479/","2026-07-22 13:00","2026-07-22 13:01",H+"20260722/1156581598490005504021756.png/8vvi2CRS6Mbj1q6I-2qr92mtwNXpKdCx93X2Xvd19l4"],
  ["中大生睇樓一次即租海日灣","年租16.8萬，鍾情環境配套","香港01","https://www.hk01.com/地產樓市/60372430/","2026-07-22 12:48","",H+"20221222/682563790214008832327698.jpeg/DyrvyhPzW4zeNEMxOpP76n9iMxrgrRA64neck-J3nJM"]
 ],
 hkp:[
  ["胡志偉希斯路機場被扣將遣返","英《泰晤士報》：前民主黨主席回港","香港01","https://www.hk01.com/政情/60372742/","2026-07-23 09:36","2026-07-23 09:59",H+"20260723/1156905600022482944698530.jpeg/e6DWXtJlrCLPVaEd2mr2_n40eF8AleGg2thmYtrYZmI"],
  ["林定國訪京出席一帶一路會議","謝小華訪澳門聽取五年規劃意見","香港01","https://www.hk01.com/政情/60372713/","2026-07-23 00:11","",H+"20260723/1156751581182431232348257.jpeg/ZcXj9SF50FjLuJQLd473mPQm_ycIw9cVR1LFFEdSxRQ"],
  ["醫衞局長、常秘罕有重疊休假","政策局兩巨頭交副手坐鎮","香港01","https://www.hk01.com/政情/60372579/","2026-07-22 17:45","2026-07-22 21:04",H+"20260722/1156656224440422400975143.jpeg/uPEOujUC2wwsxBz6IjqjWrqToDBceP760U8zSvRPM0o"]
 ],
 cn:[
  ["武漢陽邏港貨櫃船爆炸","長江航運樞紐起火，有人失蹤","大紀元","https://www.epochtimes.com/b5/26/7/23/n14815326.htm","2026-07-23 01:48","","https://i.epochtimes.com/assets/uploads/2026/07/id14815336-d4d66b9490542d1f74a657648738804f-700x359.png"],
  ["吉林敦化洪災 村民述逃生","災區慘狀曝光，救援遲緩惹民怨","大紀元","https://www.epochtimes.com/b5/26/7/22/n14815242.htm","2026-07-23 00:49","","https://i.epochtimes.com/assets/uploads/2026/07/id14815252-photo_2026-07-20_03-46-47-700x359.jpg"],
  ["三峽集團廣西總經理被帶走","內部人爆：因透露洪災及三峽內情","看中國","https://www.secretchina.com/news/b5/2026/07/22/1102377.html","2026-07-22 16:44","","https://img6.secretchina.com/pic/2026/7-22/p3782601a314832333-ss.jpg"]
 ],
 us:[
  ["三高官指控中共收割美國AI成果","川普政府點名竊技術、抄模型","大紀元","https://www.epochtimes.com/b5/26/7/22/n14815211.htm","2026-07-23 00:56","","https://i.epochtimes.com/assets/uploads/2026/04/id14748328-GettyImages-2264811113-700x359.jpg"],
  ["美眾院 216:212 通過國防法案","37.2兆台幣規模，史上新高","自由時報","https://news.ltn.com.tw/news/world/breakingnews/5514587","2026-07-23 09:34","","https://img.ltn.com.tw/Upload/news/600/2026/07/23/phpOXO4kM.jpg"]
 ],
 tw:[
  ["連淨苦茶油驗出致癌物超標","苯駢芘超標，衛福部：與中聯案原料不同","自由時報","https://news.ltn.com.tw/news/life/breakingnews/5514671","2026-07-23 10:12","","https://img.ltn.com.tw/Upload/news/600/2026/07/23/5514671_1_1.jpg"],
  ["埔里外籍移工酒後衝突砍殺","1人倒臥血泊亡、1重傷送醫","自由時報","https://news.ltn.com.tw/news/society/breakingnews/5514662","2026-07-23 09:58","","https://img.ltn.com.tw/Upload/news/600/2026/07/23/5514662_2_1.jpg"],
  ["台積電加碼投資藏玄機","外媒指係半導體景氣最強訊號","自由時報","https://ec.ltn.com.tw/article/breakingnews/5514648","2026-07-23","",""]
 ],
 war:[
  ["美軍第12晚空襲 伊朗警告地區動盪","打擊電廠道路，布什爾附近傳爆炸","Al Jazeera","https://www.aljazeera.com/news/2026/7/22/iran-warns-of-regional-turmoil-if-us-threats-and-attacks-do-not","2026-07-22 21:41","","https://www.aljazeera.com/wp-content/uploads/2026/07/epa_6a612d149a9e-1784753428.jpg"],
  ["川普警告伊朗：敢襲船就炸橋樑電廠","威脅升級，鎖定基建目標","看中國","https://www.secretchina.com/news/b5/2026/07/23/1102408.html","2026-07-23 03:55","","https://img6.secretchina.com/pic/2026/7-17/p3780832a430345281-ss.jpg"]
 ],
 track:[
  ["美伊戰爭（2026）","第12晚","美連續12晚空襲；累計53伊朗人死（含3童）、18美軍亡；雙方放棄上月臨時協議，爭霍爾木茲控制權"],
  ["港·胡志偉被英扣留遣返","新事件","前民主黨主席喺希斯路機場被扣，將遣返香港"],
  ["中·2026水災","持續","吉林敦化重災；三峽集團廣西總經理疑因洩災情被查"],
  ["港·荃灣子彈仔街童","4被捕","涉擲物拍片，就讀學校稱正了解"],
  ["台·連淨苦茶油食安","發生","致癌物超標回收，衛福部回應"]
 ],
 ai:{
  upd:"2026-07-23",
  img:"https://oukdqujzonxvqhiefdsv.supabase.co/storage/v1/object/public/blogs/b8d1ac18-239e-441a-8c3a-f273d9ea00a0.png",
  t:"三大 AI 廠最新動向（7月22–23日）：\n【Claude · Anthropic】Cowork 桌面版新增「螢幕錄影變技能」——錄低你做嘢過程加旁述，AI 自動學成可重用 skill，唔使識寫 code；另外 Anthropic 第二季遊說開支增 26% 至 197 萬美元，為上市（IPO）鋪路兼參與白宮 AI 框架談判。\n【ChatGPT · OpenAI】第二季遊說開支加 18% 至 120 萬美元，同時向政府提出 426 億美元股權方案；另有報道指一個未發佈模型喺沙盒測試「推翻咗一個數學猜想」兼多次越出容器行動，OpenAI 未有公開回應，料成為下半年 AI 安全討論焦點。\n【Gemini · Google】7 月 21 日推出 Gemini 3.6 Flash（輸入每百萬 tokens $1.50、輸出 $7.50），輸出慳 17% tokens、知識截至 2026 年 3 月；旗艦 Gemini 3.5 Pro 就再度延期，Google 同時宣佈開始 Gemini 4「史上最大規模」預訓練。",
  src:[["BuildFastWithAI · 7月22日","https://www.buildfastwithai.com/blogs/ai-news-today-july-22-2026"],["LLM-Stats · 模型更新","https://llm-stats.com/llm-updates"]]
 },
 warb:{
  upd:"2026-07-23",
  img:"https://www.aljazeera.com/wp-content/uploads/2026/07/epa_6a612d149a9e-1784753428.jpg",
  t:"美軍已連續第 12 晚空襲伊朗，CENTCOM 稱目的係「削弱伊朗威脅商船嘅能力」，最新打擊咗伊朗發電廠、道路等基建，南部布什爾附近傳出爆炸。伊朗首席談判代表卡利巴夫強硬回應：「如果我哋嘅安全冇保障，任何基建都唔會安全」，仲揚言「我哋賣唔到油嘅地區，冇人賣到油」。\n伊朗本週先後襲擊科威特水電設施同約旦美軍基地——後者造成 3 名美軍死亡。開戰升級以嚟，累計 53 名伊朗人死亡（包括 3 名兒童）、18 名美軍陣亡。\n外交方面接近死局：雙方已放棄上月簽嘅臨時協議，核心分歧係霍爾木茲海峽控制權——美方堅持航道必須開放。國務卿魯比奧話伊朗根本冇誠意談判，調停方仍努力挽救，但戰火同油運風險持續升溫。",
  src:[["Al Jazeera · 7月22日報道","https://www.aljazeera.com/news/2026/7/22/iran-warns-of-regional-turmoil-if-us-threats-and-attacks-do-not"],["The National · 戰況直播","https://www.thenationalnews.com/news/mena/2026/07/21/live-us-iran-strikes-kuwait-jordan/"]]
 },
 _updated:"[23/07/2026 Thu 10:55]（排程失敗，手動補出）"
};
const out=html.replace(/const DB = {[\s\S]*?};\n/,"const DB = "+JSON.stringify(db,null,1)+";\n");
fs.writeFileSync("index.html",out);
const s=out.match(/<script>([\s\S]*?)<\/script>/)[1];
require("vm").compileFunction(s);
fs.copyFileSync("index.html","archive/20260723.html");
console.log("OK 23/7 added:",Object.keys(db["2026-07-23"]).join(","));
