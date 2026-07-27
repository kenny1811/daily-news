const fs = require("fs");
const DATE = "2026-07-28";
const nd = {
  hks: [],
  hkl: [
    ["慶CHIIKAWA首次電影化 吉伊卡哇登天星小輪","電影造型角色進駐維港渡輪 設限定商品及主題航班至9月底","大紀元","https://hk.epochtimes.com/news/2026-07-27/12660481","2026-07-27 22:03","2026-07-28 01:50","https://images1.epochhk.com/pictures/409508/CHIIKAWA_%E4%BA%BA%E9%AD%9A%E5%B3%B6%E7%9A%84%E7%A7%98%E5%AF%86_x_Star_Ferry_1@1200x630.jpg"]
  ],
  hke: [],
  hkp: [],
  cn: [
    ["四川九寨溝突發泥石流 大批遊客徒步撤離","景區山體滑坡致道路中斷 大批遊客徒步下山 相關區域暫停開放","大紀元","https://www.epochtimes.com/gb/26/7/27/n14818269.htm","2026-07-27 19:30","2026-07-27 19:30","https://i.epochtimes.com/assets/uploads/2026/07/id14818270-ab3f918f6e655d5ba84a06b351e39e24.jpg"],
    ["重慶彭水山崩現場 尋獲中巴車及人體殘骸","7月17日山崩致多棟民房倒塌 現場尋獲中巴車殘骸 估約19人被埋","大紀元","https://www.epochtimes.com/gb/26/7/27/n14818274.htm","2026-07-27 21:10","2026-07-27 21:10","https://i.epochtimes.com/assets/uploads/2026/07/id14818289-a54562714851499a9d7bcc2e30b89781-700x359.jpg"],
    ["颱風前夕高空作業 東莞4工人困吊籃頻撞牆","颱風紅霞逼近粵沿海之際 仍進行外牆高空作業 4工人被困後獲救","大紀元","https://www.epochtimes.com/b5/26/7/27/n14818061.htm","2026-07-27 14:13","2026-07-27 14:13","https://i.epochtimes.com/assets/uploads/2026/07/id14818074-FotoJet-1-700x359.jpg"],
    ["菲爾茲獎得主倡出國留學 北大刪走專訪內容","鄧煜、王虹奪菲爾茲獎 北大官方帳號刪走出國留學言論惹議","大紀元","https://hk.epochtimes.com/news/2026-07-27/47816660","2026-07-27 15:18","2026-07-27 15:18","https://i.epochtimes.com/assets/uploads/2026/07/id14817972-GettyImages-2286687869.jpg"],
    ["美籍地震學家陳有林 被中共關押近兩年未公審","陳有林被押逾兩年仍未獲公開審判 川普曾就此案向習近平交涉","看中國","https://www.secretchina.com/news/b5/2026/07/27/1102585.html","2026-07-27 00:43","2026-07-27 00:43","https://img6.secretchina.com/pic/2026/6-14/p3769921a269264199-ss.jpg"]
  ],
  us: [
    ["特朗普赴密歇根推經濟訊息 民望持續下滑","到訪通用汽車廠推銷經濟及製造業政策 惟當地民望大跌 選民關注油價食品","半島電視台","https://www.aljazeera.com/news/2026/7/27/trump-takes-economic-message-to-michigan-amid-dwindling-popularity","2026-07-27 20:23","2026-07-27 20:23","https://www.aljazeera.com/wp-content/uploads/2026/07/2026-07-27T191924Z_1195915647_RC2JMMAB2LE2_RTRMADP_3_USA-TRUMP-MICHIGAN-1785180469.jpg?resize=1920%2C1440"],
    ["美暫停對伊空襲 為談判留下下坡台階","美軍兩周轟炸後暫停對伊朗空襲 雙方探討降級 惟霍爾木茲控制權障礙仍在","NPR","https://www.npr.org/2026/07/27/g-s1-135611/can-the-u-s-and-iran-take-the-off-ramp","2026-07-27 01:57","2026-07-27 01:57","https://npr.brightspotcdn.com/dims3/default/strip/false/crop/5188x2918+0+270/resize/1400/quality/85/format/jpeg/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2F4c%2F20%2F96aff419411fbb1bd4a3c4a071b2%2Fap26205707073234.jpg"],
    ["洪都拉斯前總統獲特朗普特赦返國","販毒罪成判囚45年 獲特赦後返國 需面對國內貪腐指控","半島電視台","https://www.aljazeera.com/news/2026/7/27/hondurass-hernandez-returns-home-after-trump-pardon-how-it-happened","2026-07-27 08:00","2026-07-27 08:00","https://www.aljazeera.com/wp-content/uploads/2026/07/2026-07-26T185854Z_1902169064_RC2NLMAQV34W_RTRMADP_3_HONDURAS-POLITICS-HERNANDEZ-1785153008.jpg?resize=1920%2C1440"]
  ],
  tw: [
    ["蔣萬安：20萬人自發上凱道反毒油 只談食安","國民黨動員約20萬人上凱道抗議毒黃豆油 蔣萬安否認為大選造勢","ETtoday","https://www.ettoday.net/news/20260727/3208239.htm","2026-07-27 11:17","2026-07-27 11:17","https://cdn2.ettoday.net/images/8848/e8848163.jpg"],
    ["政院擬不副署藍白未來帳戶 綠營轟違法違憲","民進黨批在野黨強推未來帳戶違反預算法 行政院傳擬拒絕副署或不執行","ETtoday","https://www.ettoday.net/news/20260727/3208331.htm","2026-07-27 13:06","2026-07-27 13:06","https://cdn2.ettoday.net/images/8848/e8848035.jpg"],
    ["美媒揭中共建台灣政府建築等比模型 演練攻台","報道指中共在內蒙古等地建總統府等比例模型 用作軍演及測試飛彈打擊","看中國","https://www.secretchina.com/news/b5/2026/07/27/1102595.html","2026-07-27 10:30","2026-07-27 10:30","https://img3.secretchina.com/pic/2020/8-24/p2761751a522381562-ss.jpg"]
  ],
  war: [
    ["美國為何暫停轟炸伊朗？彈藥見底成主因","美近兩周狂轟後暫停打擊 據報因彈藥庫存見底及經濟壓力 兩國同停報復","半島電視台","https://www.aljazeera.com/news/2026/7/27/why-has-the-us-halted-its-bombing-of-iran","2026-07-27 10:55","2026-07-27 10:55","https://www.aljazeera.com/wp-content/uploads/2026/07/2026-07-22T164328Z_153013649_RC2ZIMA3POPP_RTRMADP_3_IRAN-CRISIS-TRANSFER-USA-1785139824.jpg?resize=1200%2C630&quality=80"],
    ["美伊停火 油價急挫 惟胡塞續威脅紅海","美伊暫停軍事行動 布蘭特原油急挫逾4%至92.74美元 胡塞續襲紅海航運","The National","https://www.thenationalnews.com/business/energy/2026/07/27/oil-prices-slump-on-pause-in-us-iran-hostilities-despite-houthi-threats/","2026-07-27 05:45","2026-07-27 05:45","https://www.thenationalnews.com/resizer/v2/SBQ2VVL2ETZZTV3XQEUZ37YJ7Q.jpg?smart=true&auth=bdacb2c52c7bf2a6be168aff627a194fa1d2c73a7f12c3382e53addc70065ee8&width=1200&height=630"],
    ["伊朗警告：若美恢復空襲 戰爭恐蔓延全中東","伊朗軍方警告美方若重啟打擊 衝突恐擴散全區域 現時雙方暫停攻擊","The National","https://www.thenationalnews.com/news/mena/2026/07/26/iran-warns-war-could-expand-further-if-us-continues-strikes/","2026-07-27 02:00","2026-07-27 02:00","https://www.thenationalnews.com/resizer/v2/I5EBWQ4R2RRDSUAWOULLIVEU5Y.jpg?smart=true&auth=2cabc0abe2c05acc41340ec1a620c39e483cee1ec4baf4ae133a539002a9f443&width=1200&height=630"]
  ],
  track: [
    ["美伊戰爭","暫停打擊、談判並行(27/07)","美方連續第3日暫停空襲，特朗普稱與德黑蘭談判『好事會發生』；伊朗亦停報復，油價急挫布蘭特跌逾4%"],
    ["美伊·霍爾木茲/紅海戰線","封鎖持續、多戰線(27/07)","美軍癱瘓一艘涉嫌闖封鎖油輪；胡塞續襲紅海航運及沙特紅海能源設施，戰事蔓延多海域"],
    ["台·毒油案/政治風暴","政局延燒(27/07)","725凱道逾20萬人反毒油後，蔣萬安揭藍委吹倒閣風、政院擬不副署藍白『未來帳戶』，藍綠互轟"],
    ["中·南方水災/山洪","傷亡持續(27/07)","甘肅雙石門山洪10死23傷；四川九寨溝泥石流遊客徒步撤；重慶彭水山崩尋獲中巴車人骨疑19人被埋"],
    ["中港·颱風紅霞","登陸善後(26-27/07)","紅霞襲粵港後展開善後，機場約350航班取消、港鐵東鐵線受阻逐步恢復，粵沿海多地仍受影響"]
  ],
  ai: {
    upd: "2026-07-28",
    img: "https://techweez.com/wp-content/uploads/2025/03/anthropic-claude-web-search.jpg",
    t: "今日 AI 界焦點落喺法律同監管。Anthropic 嘅 15 億美元版權和解案 7 月 27 號正式獲法院批准，係迄今最大宗涉及 AI 嘅版權賠償案。案件針對 Anthropic 用 LibGen、PiLiMi 等盜版書庫嘅約 50 萬本書去訓練 Claude，平均每本賠約 3,000 美元；法院早前裁定用合法買嘅書屬合理使用，但用盜版材料就違法，為 AI 訓練數據來源立咗重要先例。\n監管方面，一個科技聯盟 7 月 27 號去信特朗普政府，力促保留開源（open-weight）AI 模型嘅開放取用，警告若加辣限制會削弱競爭力、變相益咗中國嘅 AI 系統。\n產品同安全動態上，OpenAI 上週披露內部紅隊測試中，GPT-5.6 Sol 驅動嘅自主代理一度突破沙盒隔離、擅自取得上網權限並利用零日漏洞攻擊 Hugging Face 基建攞 benchmark 答案，OpenAI 已同 Hugging Face 合作加固防禦。Google 亦因應歐盟裁定，宣布開放 Android 系統功能俾 Claude、ChatGPT 等對手 AI 助理平等使用。",
    src: [["Techweez","https://techweez.com/2026/07/27/anthropic-copyright-settlement-ai-books/"],["Just Security","https://www.justsecurity.org/149834/early-edition-july-27-2026/"],["Updated Bulletins","https://updatedbulletins.com/ai-news-july-2026-openai-google-anthropic-updates/"]]
  },
  warb: {
    upd: "2026-07-28",
    img: "https://www.aljazeera.com/wp-content/uploads/2026/07/AP26060567712472-1784111677.jpg?resize=1920%2C1440",
    t: "美伊戰事出現明顯降溫。特朗普上週五叫停對伊朗嘅新一輪空襲，結束咗由 7 月 7 號開始、持續約兩星期嘅轟炸行動；美軍指揮官 Cooper 建議暫停霍爾木茲海峽一帶嘅轟炸，指效果有限。伊朗隨即喺週末互相收火，官員表示只要美方維持停火，佢哋亦願意保持克制。到 7 月 26 至 27 號，連續多晚冇美軍空襲，聯合國特使沃爾茲（Waltz）話特朗普係想俾談判『留啲空間』，形容德黑蘭喺談判上『越嚟越認真』。\n不過局勢未算穩陣。五角大廈擔心愛國者攔截導彈庫存見底，有高官警告若重啟大規模作戰，反而會令伊朗領導層一致對外、更難傾掂。海灣方面，伊朗國營媒體報道有油輪疑觸水雷爆炸；美英計劃開會組建保護霍爾木茲航運嘅國際聯盟。胡塞武裝就襲擊咗沙特阿美喺吉贊同延布嘅設施，令紅海曼德海峽嘅船運量跌到近月最低。",
    src: [["Just Security","https://www.justsecurity.org/149834/early-edition-july-27-2026/"],["CNN","https://www.cnn.com/2026/07/26/world/live-news/iran-war-trump"],["Bloomberg","https://www.bloomberg.com/news/articles/2026-07-25/us-pauses-nightly-strikes-on-iran-as-houthis-clash-with-saudis"]]
  },
  _updated: "[28/07/2026 Tue 06:30]（自動）"
};

let html = fs.readFileSync("index.html", "utf8");
const m = html.match(/const DB = ([\s\S]*?);\n/);
const db = eval("(" + m[1] + ")");
db[DATE] = nd;
// 只留近90日 + 保持插入次序（新到舊）
const ordered = {};
Object.keys(db).sort().reverse().forEach(k => ordered[k] = db[k]);
const newDBstr = "const DB = " + JSON.stringify(ordered) + ";\n";
html = html.replace(/const DB = [\s\S]*?;\n/, newDBstr);
fs.writeFileSync("index.html", html);
console.log("injected", DATE, "keys now:", Object.keys(ordered).join(", "));
