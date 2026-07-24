const fs = require('fs');
const norm = (s) => {
  if (!s) return "";
  s = String(s).trim();
  // ISO with T: 2026-07-25T04:03:04+08:00 -> 2026-07-25 04:03
  let m = s.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
  if (m) return m[1] + " " + m[2];
  return s;
};
const row = (r) => [r[0], r[1], r[2], r[3], norm(r[4]), norm(r[5]), r[6] || ""];

const entry = {
  hks: [
    ["珍惜生命｜牛池灣彩雲邨19歲男墮樓 送院不治","彩雲邨19歲男子高處墮下，送院搶救不治","香港01","https://www.hk01.com/%E7%AA%81%E7%99%BC/60373473/%E7%8F%8D%E6%83%9C%E7%94%9F%E5%91%BD-%E7%89%9B%E6%B1%A0%E7%81%A3%E5%BD%A9%E9%9B%B2%E9%82%A819%E6%AD%B2%E7%94%B7%E5%A2%AE%E6%A8%93-%E9%80%81%E9%99%A2%E4%B8%8D%E6%B2%BB","2026-07-25T04:03:04+08:00","2026-07-25T04:03:07+08:00","https://cdn.hk01.com/di/media/images/dw/20260725/1157532278402846720917043.jpeg/uFOzyi-I0jzUYpt-8JlW7T_f7yBkrno0b_a82lX2vNo?v=w1280r16_9"],
    ["港鐵MMA 觀塘綫兩男疑爭位爆衝突 叉頸出拳打到眼鏡飛脫","觀塘綫兩男爭位口角動手，叉頸出拳纏鬥","星島","https://www.stheadline.com/breaking-news/3597359/","2026-07-25T01:31:53+0800","2026-07-25T01:32:53+0800","https://image.hkhl.hk/f/1200p0/0x0/100/none/d7c164dfaec9f8be5b4520a5ca92b33e/2026-07/2026-07-24_19_13_53.png"],
    ["警方港島海陸空高調巡邏 跨部門打擊暑期間爆竊","警海陸空高調巡邏，跨部門打擊暑期爆竊","星島","https://www.stheadline.com/breaking-news/3597292/","2026-07-24T21:57:35+0800","","https://image.hkhl.hk/f/1200p0/0x0/100/none/00a207f6f1d24b2c8931ea30d508c6f4/2026-07/collage_65.jpg"],
    ["男子涉偽基站 發逾千短訊詐騙被捕","上水男車內藏偽基站發千短訊，騙百萬被捕","大紀元香港","https://hk.epochtimes.com/news/2026-07-24/88564183","2026-07-24T19:08:00+0800","2026-07-24T21:03:08+0800","https://images1.epochhk.com/pictures/409354/WhatsApp_Image_2026-07-24_at_174238@1200x630.jpeg"],
    ["尖沙咀女子遭私家車撞 腳部疑被輾送院","尖沙咀女途人俾私家車撞倒，腳疑被輾送院","香港01","https://www.hk01.com/%E7%AA%81%E7%99%BC/60373447/%E5%B0%96%E6%B2%99%E5%92%80%E5%A5%B3%E5%AD%90%E6%8D%B1%E7%A7%81%E5%AE%B6%E8%BB%8A%E6%92%9E-%E8%85%B3%E9%83%A8%E7%96%91%E8%A2%AB%E8%BC%BE%E9%81%8E-%E7%94%B1%E6%95%91%E8%AD%B7%E5%93%A1%E7%A9%A9%E5%AE%9A%E5%82%B7%E5%8B%A2%E5%86%8D%E9%80%81%E9%99%A2","2026-07-24T21:54:30+08:00","","https://cdn.hk01.com/di/media/images/dw/20260724/1157441734150459392021789.jpeg/5DSvyvq7RXww1sqENjqWECgqF47X-N80_Lioxdm4qMU?v=w1280r16_9"],
    ["屯門泳灘八旬翁遇溺 送院搶救終不治","屯門加多利灣八旬翁游水遇溺，同日不治","香港01","https://www.hk01.com/%E7%AA%81%E7%99%BC/60373097/%E5%B1%AF%E9%96%80%E5%8A%A0%E5%A4%9A%E5%88%A9%E7%81%A3%E6%B3%B3%E7%81%98%E5%85%AB%E6%97%AC%E7%94%B7%E6%B3%B3%E5%AE%A2%E9%81%87%E6%BA%BA-%E6%98%8F%E8%BF%B7%E9%80%81%E9%99%A2%E6%90%B6%E6%95%91-%E5%90%8C%E6%97%A5%E4%B8%8D%E6%B2%BB","2026-07-24T07:13:14+08:00","","https://cdn.hk01.com/di/media/images/dw/20250827/1037291453837217792986412.jpeg/73pRPfSy6e3yrWX3k76wvkWfgH5iwdaVUfOZMnTzmTI?v=w1280r16_9"],
    ["校巴撞斃八旬翁 司機被控危駕致他人死亡","涉薄扶林道撞死八旬翁，校巴司機被控危駕","星島","https://www.stheadline.com/society/3597156/","2026-07-24T15:35:52+08:00","","https://image.hkhl.hk/f/1200p0/0x0/ul/sthl_square/98ca4280a5801b4754bebeae282b4152/2026-07/KakaoTalk_20260129_143648626_01.jpg"],
    ["20歲侍應認非禮強姦弱智堂妹3罪還押","20歲侍應認非禮強姦智力邊緣堂妹，候判","星島","https://www.stheadline.com/society/3597138/","2026-07-24T15:01:32+08:00","","https://image.hkhl.hk/f/1200p0/0x0/ul/sthl_square/1dbb40af36710de141458ca22d1094ac/2026-07/KakaoTalk_20250411_122046817_01_0.jpg"],
    ["深水埗玩具店爭執 阿叔飛腳踢青年","深水埗玩具店為陀螺爭執，阿叔飛腳青年還擊","香港01","https://www.hk01.com/%E7%AA%81%E7%99%BC/60373470/%E6%B7%B1%E6%B0%B4%E5%9F%97%E7%8E%A9%E5%85%B7%E5%BA%97%E5%94%AE%E9%99%80%E8%9E%BA%E7%88%86%E8%A1%9D%E7%AA%81-%E9%98%BF%E5%8F%94%E8%B5%B7%E9%A3%9B%E8%85%B3%E7%8C%9B%E8%B8%A2-%E9%9D%92%E5%B9%B4%E7%96%91%E9%82%84%E6%93%8A-%E6%9C%89%E7%89%87","2026-07-25T03:21:51+08:00","","https://cdn.hk01.com/di/media/images/dw/20260725/1157523567399669760289065.jpeg/zM_ENG5y0VvhZxtZEqKtsKTbpYcNi8ROQGcGEUBnBhE?v=w1280r16_9"]
  ],
  hkl: [
    ["颱風「紅霞」天文台今晚發一號戒備信號 廣東鐵路周日或全線停運","紅霞逼近，天文台今晚掛一號戒備信號","星島","https://www.stheadline.com/realtime-china/3597164/","2026-07-24T16:07:18+08:00","","https://image.hkhl.hk/f/1200p0/0x0/100/none/f69748077264c7888859668dd7d2022c/2026-07/KF_-Sam_3__0.png"],
    ["青嶼幹線汲水門六車連環撞 往機場快線封 下層開放","青嶼幹線六車連環相撞，機場快線一度封","星島","https://www.stheadline.com/breaking-news/3597009/","2026-07-24T08:19:08+08:00","","https://image.hkhl.hk/f/1200p0/0x0/100/none/514e6e56fdb2b467058b083cd52a2c6f/2026-07/A_4.jpg"],
    ["天氣酷熱｜天文台料天晴局部地區有驟雨 正午多區升至33℃或以上","天文台料局部有驟雨，多區正午升逾33度","星島","https://www.stheadline.com/society/3597005/","2026-07-24T07:46:31+08:00","2026-07-24T12:11:57+08:00","https://image.hkhl.hk/f/1200p0/0x0/ul/sthl_square/5ab152f7b377df50febb8593a97786f5/2026-07/06840687968451516308641.jpg"],
    ["大欖隧道入口私家車「自炒」四輪朝天 女司機自行爬出拒吹波被捕","大欖隧道私家車自炒翻車，女司機拒吹波被捕","星島","https://www.stheadline.com/breaking-news/3597002/","2026-07-24T07:17:07+08:00","","https://image.hkhl.hk/f/1200p0/0x0/100/none/3a0de9214e044b3cb7ed370d06688955/2026-07/2026-07-24_00_08_06.png"],
    ["西灣河爆水管路陷 一度停食水晚上復","西灣河太富街爆水管路陷，一度停食水","香港01","https://www.hk01.com/%E7%AA%81%E7%99%BC/60373456/%E8%A5%BF%E7%81%A3%E6%B2%B3%E5%A4%AA%E5%AF%8C%E8%A1%97%E7%88%86%E6%B0%B4%E7%AE%A1%E8%B7%AF%E9%99%B7-%E4%B8%80%E5%BA%A6%E5%BD%B1%E9%9F%BF%E6%A8%93%E5%AE%87%E9%A3%9B%E6%B0%B4%E4%BE%9B%E6%87%89-%E6%99%9A%E4%B8%8A%E5%B7%B2%E6%81%A2%E5%BE%A9%E4%BE%9B%E6%B0%B4","2026-07-24T22:49:41+08:00","","https://cdn.hk01.com/di/media/images/dw/20260724/1157456334765953024798015.jpeg/PYaojfzemCRxWQguX1b0XPtkYYaSXGlN6dVLz-nVS88?v=w1280r16_9"],
    ["中電8月燃料費加至45仙 下月推回扣","中電8月燃料費調高至45仙，推特別回扣","星島","https://www.stheadline.com/society/3597297/","2026-07-24T22:34:26+08:00","","https://image.hkhl.hk/f/1200p0/0x0/ur/sthl_square/58210e23982dd3488002be6989944102/2026-07/BY250423CPH07.jpg"],
    ["屯門南延綫料2030落成 往屯門站5分鐘","屯門南延綫料2030落成，往屯門站僅5分鐘","星島","https://www.stheadline.com/society/3597108/","2026-07-24T14:41:03+08:00","","https://image.hkhl.hk/f/1200p0/0x0/ul/sthl_square/690fc84632786203424f78bacdd29996/2026-07/KakaoTalk_20260724_120506332_17_0.jpg"],
    ["市建局2826萬購花墟洗衣街地舖","市建局2826萬購洗衣街地舖，呎價高鄰舖","香港01","https://www.hk01.com/%E5%9C%B0%E7%94%A2%E6%A8%93%E5%B8%82/60372781/%E5%B8%82%E5%BB%BA%E5%B1%80%E8%8A%B1%E5%A2%9F%E9%87%8D%E5%BB%BA%E6%96%B0%E5%8B%95%E4%BD%9C-2826%E8%90%AC%E8%B3%BC%E6%B4%97%E8%A1%A3%E8%A1%97%E5%8D%83%E4%BA%8C%E5%91%8E%E5%9C%B0%E8%88%96-%E5%91%8E%E5%83%B9%E9%AB%98%E9%81%8E%E9%84%B0%E8%88%96","2026-07-24T07:00:43+08:00","","https://cdn.hk01.com/di/media/images/dw/20260723/1156923319103000576820753.jpeg/8LW6DPs2Cy5B199miHiSCbwjbGUZWq3RbK1_T2ytf08?v=w1280r16_9"]
  ],
  hke: [
    ["恒指收跌247點 再失二萬五關 阿里跌4% 中銀升6%破頂","恒指收跌247點失二萬五關，中銀逆市升6%破頂","星島","https://www.stheadline.com/stock-market/3597025","2026-07-24T09:25:07+08:00","","https://image.hkhl.hk/f/1200p0/0x0/lr/sthl_square/9418fc0dd5e70aec9cf6f8adae7de70c/2026-07/0724HSI.png"],
    ["智元創新啟動香港上市計劃 曾傳目標估值400至500億元","智元創新啟動來港上市，傳估值400至500億元","星島","https://www.stheadline.com/realtime-finance/3597282","2026-07-24T21:15:26+08:00","","https://image.hkhl.hk/f/1200p0/0x0/ul/sthl_square/0796ef69e5e25753820ec45cd794c01d/2026-07/XxjpsgC000259_20260718_PEPFN0A001_0.JPG"],
    ["美國新關稅對港影響不大 馬時亨料今年出口增逾20%","馬時亨料美新關稅影響有限，今年出口增逾兩成","星島","https://www.stheadline.com/realtime-finance/3597216","2026-07-24T17:58:57+08:00","","https://image.hkhl.hk/f/1200p0/0x0/ul/sthl_square/a8f1d8070bf34ff9c7dfc0251616f9f6/2026-07/0724TD.png"],
    ["富邦銀行夥3商場推消費獎賞 最高回贈可達25%","富邦夥三商場推消費獎賞，最高回贈兩成半","星島","https://www.stheadline.com/realtime-finance/3597199","2026-07-24T17:11:38+08:00","","https://image.hkhl.hk/f/1200p0/0x0/100/none/cc6c449ac3d744f40e65d6f871e26206/2026-07/KF_1_-_2026-07-24T171042_544.png"]
  ],
  hkp: [
    ["立法會議員北京研修班結業 李慧琼：配合政府破解深層矛盾","立會議員研修班結業，李慧琼稱配合政府破解矛盾","星島","https://www.stheadline.com/politics/3597296","2026-07-24T22:29:19+08:00","","https://image.hkhl.hk/f/1200p0/0x0/100/none/196590a0bfa8dd4d68c6a7446a4cd926/2026-07/754980068_1050916960814069_8254003702420463573_n.jpg"],
    ["立法會訪京 夏寶龍與全體議員座談交流 肯定立法會工作","夏寶龍與立會議員座談，勉議員持續認真履職","星島","https://www.stheadline.com/politics/3597152","2026-07-24T21:20:09+08:00","","https://image.hkhl.hk/f/1200p0/0x0/100/none/0afddae57d119bb7cffce06a5bcb3fdf/2026-07/W020260724736319945872_0.jpg"],
    ["高官任命｜黃嘉華8.10出任民航處處長 接替廖志勇","黃嘉華八月十日接任民航處處長，接替廖志勇","星島","https://www.stheadline.com/politics/3597186","2026-07-24T16:42:10+08:00","","https://image.hkhl.hk/f/1200p0/0x0/100/none/0fd2b9eb80a5b710640669651a830fc9/2026-07/222222222222222222222.jpeg"],
    ["林定國率代表團赴京出席聯席會議 提12項建議深化一帶一路合作","林定國率團赴京，提十二項建議深化一帶一路","星島","https://www.stheadline.com/politics/3597194","2026-07-24T17:20:47+08:00","","https://image.hkhl.hk/f/1200p0/0x0/100/none/1cadc1688fe515d2af4feb42466e14e9/2026-07/754660235_2022932482427162_5398019216532936635_n_1.jpg"],
    ["陳祖恒再獲委任生產力促進局主席 孫東冀推動新型工業化","陳祖恒再獲委任生產力局主席，推新型工業化","星島","https://www.stheadline.com/politics/3597104","2026-07-24T13:10:31+08:00","","https://image.hkhl.hk/f/1200p0/0x0/100/none/7b3ad8622695fae1b32e5a0356f558d9/2026-07/KakaoTalk_20250607_143410303_02.jpg"]
  ],
  cn: [
    ["颱風「紅霞」逼近 廣東鐵路將全線停運","颱風紅霞逼近，廣東鐵路全線停運防暴雨","大紀元","https://www.epochtimes.com/b5/26/7/24/n14816854.htm","2026-07-24 23:42","","https://i.epochtimes.com/assets/uploads/2026/07/id14816897-GettyImages-2236659063.jpg"],
    ["美媒披露中共發展AI內幕以及對經濟的衝擊","美媒踢爆中共發展AI內幕，衝擊經濟","大紀元","https://www.epochtimes.com/b5/26/7/24/n14816851.htm","2026-07-25 01:06","","https://i.epochtimes.com/assets/uploads/2026/06/id14793475-856323.jpg"],
    ["重慶山體崩塌增至11死50失聯10傷 網民質疑","重慶彭水塌方增至11死50人失聯，網民質疑","看中國","https://www.secretchina.com/news/b5/2026/07/24/1102452.html","2026-07-24 01:47","","https://img6.secretchina.com/pic/2026/7-17/p3780941a126061603-ss.jpg"]
  ],
  us: [
    ["以總理將赴美會晤川普 出席格雷厄姆葬禮","以色列總理將赴美見川普，出席參議員葬禮","大紀元","https://www.epochtimes.com/b5/26/7/24/n14816909.htm","2026-07-24 23:46","","https://i.epochtimes.com/assets/uploads/2026/03/id14723117-GettyImages-2209045059.jpg"],
    ["中俄向伊朗提供武器？川普回應","傳中俄供武器畀伊朗，川普親自回應","大紀元","https://www.epochtimes.com/b5/26/7/24/n14816925.htm","2026-07-25 01:50","","https://i.epochtimes.com/assets/uploads/2026/07/id14816945-AFP__20260723__C3244KK__v1__MidRes__UsPoliticsTrumpDodgersBaseball.jpg"]
  ],
  tw: [
    ["張景森「不認同卓榮泰」宣布退黨！民進黨回應","張景森唔認同卓榮泰，宣布退出民進黨","ETtoday","https://www.ettoday.net/news/20260724/3206990.htm","2026-07-24 12:49","","https://cdn2.ettoday.net/images/8467/e8467421.jpg"],
    ["父屍塞行李箱丟水溝！新北男弒親案輕判4月","新北男弒親塞屍行李箱，竟只輕判四個月","ETtoday","https://www.ettoday.net/news/20260724/3207020.htm","2026-07-24 13:38","","https://cdn2.ettoday.net/images/8334/e8334888.jpg"],
    ["發電廠大型變壓器起火、人員受困！南消攜森霸電力實兵演練","發電廠變壓器起火困人，消防聯手演練","ETtoday","https://www.ettoday.net/news/20260724/3207028.htm","2026-07-24 13:44","","https://cdn2.ettoday.net/images/8845/e8845315.jpg"]
  ],
  war: [
    ["US attacks Iran for 13th consecutive night","美軍連續第13晚空襲伊朗，局勢持續升溫","Al Jazeera","https://www.aljazeera.com/video/newsfeed/2026/7/24/us-attacks-iran-for-13th-consecutive-night","2026-07-24 08:39","","https://www.aljazeera.com/wp-content/uploads/2026/07/image-1784882357.jpg?resize=1920%2C937&quality=80"],
    ["US launches 13th night of strikes as Iran warns of escalation in the Gulf","美發動第13輪空襲，伊朗警告封鎖海灣","Al Jazeera","https://www.aljazeera.com/video/newsfeed/2026/7/24/us-launches-13th-night-of-strikes-as-iran-warns-of-escalation-in-the-gulf","2026-07-24 02:25","","https://www.aljazeera.com/wp-content/uploads/2026/07/image-1784859900.jpg?resize=1920%2C1080&quality=80"],
    ["US attacks Iran as Houthis allow Chinese ships to pass: What's the latest?","美續襲伊朗，胡塞放行中國商船通過","Al Jazeera","https://www.aljazeera.com/news/2026/7/24/us-attacks-iran-as-houthis-allow-chinese-ships-to-pass-whats-the-latest","2026-07-24 07:59","","https://www.aljazeera.com/wp-content/uploads/2026/07/afp_6a63084154b4-1784875073.jpg?resize=1920%2C1440"]
  ],
  track: [
    ["美伊戰爭","進行中","美軍連續第13晚空襲伊朗，川普放話威脅發動空前『大規模攻擊』"],
    ["胡塞紅海襲擊","升級中","胡塞武裝襲兩艘沙特油輪但放行中國船隻，國際油價一度破百"],
    ["川習會","籌備中","川普稱習近平擬9月24日訪美，白宮指AI技術遭竊將成議題"],
    ["重慶彭水塌方","救援中","山體崩塌增至11死50失聯10傷，網民質疑官方傷亡數字偏低"],
    ["颱風紅霞襲華南","逼近中","廣東鐵路將全線停運嚴防暴雨，多地戒備"],
    ["台灣725大遊行","對決中","藍綠同日各開全代會造勢，國民黨主打決戰新北"]
  ],
  ai: {
    upd: "2026-07-25",
    img: "https://dxj7eshgz03ln.cloudfront.net/production/publication/logo/1475/8f402391-cd29-43a4-9695-35d930a59660.png",
    t: "今日AI界最大件事係Anthropic喺7月24號正式推出Claude Opus 5，定價每百萬input token 5美元、output 25美元，只係Fable 5嘅一半價錢，喺Frontier-Bench v0.1攞到43.3分（Fable 5得33.7分），即日成為Claude Max同API嘅預設模型。OpenAI同日將ChatGPT語音功能推上桌面版，macOS同Windows嘅Plus／Pro／Business用戶可以一路聽一路講，同時指揮多個agent。\n商業方面，Alphabet公佈第二季業績，Google Cloud收入按年升82%至247.7億美元，Gemini月活躍用戶衝上9.5億，資本開支倍增到449億美元。國防AI公司Anduril傳緊新一輪融資，估值或高達1000億美元。\n監管上，美國眾議院提出兩黨「AI Kill Switch」法案，賦予國土安全部強制模型停機嘅權力，違者每日罰2000萬美元；印度德里高院就OpenAI版權案，裁定ChatGPT訓練屬「合理使用」。另外亦有安全隱憂，有研究員披露ChatGPT Workspace Agent有CSRF漏洞，釣魚連結可自動整個有全公司權限嘅流氓agent。",
    src: [["AI Weekly","https://aiweekly.co/ai-news-today"],["ThursdAI July 2026","https://thursdai.news/releases/2026-07"]]
  },
  warb: {
    upd: "2026-07-25",
    img: "https://www.aljazeera.com/wp-content/uploads/2026/07/image-1784882357.jpg?resize=1920%2C937&quality=80",
    t: "美國對伊朗嘅空襲踏入第13個連續夜晚。7月24號，美軍喺阿瓦士（Ahvaz）附近發動導彈襲擊，造成4死5傷，打擊範圍仲包括霍拉馬巴德、賈斯克、阿巴斯港同格什姆島。伊朗隨即報復，向約旦嘅美軍Al-Azraq空軍基地開火，並以無人機襲擊伊拉克埃爾比勒國際機場，機場一度關閉後已經重開。\n海灣局勢升溫，巴林同科威特因為攔截伊朗導彈而拉響警報，兩國都成功攔截到來襲飛彈。美國總統特朗普表示正考慮對伊朗發動「大規模攻擊」，而伊朗外長阿拉格奇就警告話「無腦嘅侵略」無助達成協議，顯示外交談判依然僵持。國防部長赫格塞斯早前亦透露，戰事至今已耗費375億美元。停火暫時未見進展，海灣多國持續戒備，霍爾木茲海峽航運風險仍然高企。",
    src: [["Al Jazeera Iran war live 7/24","https://www.aljazeera.com/news/liveblog/2026/7/24/iran-war-live-trump-weighs-massive-attack-on-iran"],["Al Jazeera Iran war live 7/22","https://www.aljazeera.com/news/liveblog/2026/7/22/iran-war-live-us-launches-new-attacks-hegseth-says-war-has-cost-37-5bn"]]
  },
  _updated: "[25/07/2026 Sat 06:04]（自動）"
};

// normalize 7-col rows
["hks","hkl","hke","hkp","cn","us","tw","war"].forEach(k => { entry[k] = entry[k].map(row); });

const html = fs.readFileSync('index.html','utf8');
const marker = 'const DB = {\n';
const idx = html.indexOf(marker);
if (idx < 0) { console.error('MARKER NOT FOUND'); process.exit(1); }
const insertAt = idx + marker.length;
// serialize new key with 1-space base indent to match file style
let js = JSON.stringify({"2026-07-25": entry}, null, 1);
// js is like {\n "2026-07-25": {...}\n} ; strip outer braces
js = js.replace(/^\{\n/, '').replace(/\n\}$/, '');
const block = js + ',\n';
const out = html.slice(0, insertAt) + block + html.slice(insertAt);
fs.writeFileSync('index.html', out);
console.log('inserted, new length', out.length);
