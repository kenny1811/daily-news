const fs = require("fs");
const DATE = "2026-08-09";
const UPD = process.argv[2] || "2026-08-09 06:35 HKT（早報）";

const S = "星島頭條", H = "香港01", TS = "The Standard";
const st = (sec, id) => `https://www.stheadline.com/${sec}/${id}/`;
const h1 = id => `https://www.hk01.com/article/${id}`;

const am = {
  hks: [
    ["九龍灣停車場男子遇劫失六萬財物", "兩男持硬物襲擊51歲事主搶背囊，警方追緝中", S, st("breaking-news", 3602438), "2026-08-09T02:13:48+08:00", "2026-08-09T02:13:48+08:00", "https://image.hkhl.hk/f/1200p0/0x0/100/none/5d401a1e29db88e70ada71f5d70c7889/2026-08/Sau_mp.jpg"],
    ["黃大仙的士遭撞後炒貨車 肇事車逃去", "途人憂有人被困報警，警追緝不顧而去司機", S, st("breaking-news", 3602415), "2026-08-09T01:14:53+08:00", "2026-08-09T01:14:53+08:00", "https://image.hkhl.hk/f/1200p0/0x0/100/none/777dcad14ebb45deae80990e944008ce/2026-08/WhatsApp_Image_2026-08-08_at_17_29_41.jpeg"],
    ["元朗漢遇女子兜搭 按摩時失七萬金鏈", "58歲事主上樓後始發現頸鏈不翼而飛，已報警", H, h1(60378152), "2026-08-08T22:31:47+08:00", "2026-08-08T22:31:47+08:00", "https://cdn.hk01.com/di/media/images/dw/20260808/1162888218572492800530869.png/HhwmhYvcaxFgvKdOGTHoDWUEY-vDkjoEgQPR6IED0eg?v=w1280r16_9"],
    ["警新界北打擊交通違例 拘三男涉酒駕", "一連兩日行動代號快捕者，三人保釋候九月報到", H, h1(60378170), "2026-08-09T05:36:03+08:00", "2026-08-09T05:36:06+08:00", "https://cdn.hk01.com/di/media/images/dw/20260807/1162351060514246656975403.jpeg/Lm8IkrymS4Dircpc4V--pz0PS5uSFfY8JKEF6CShBeg?v=w1280r16_9"],
    ["尖沙咀數百人排隊等觀光巴士 疑有插隊", "人龍逼爆碼頭一帶，一度起哄警員到場調解", H, h1(60378155), "2026-08-08T23:01:27+08:00", "2026-08-08T23:44:19+08:00", "https://cdn.hk01.com/di/media/images/dw/20260808/1162882145056722944501298.jpeg/S3-K3LUxcLMtiOUiFqUJpJ_A_isBlhbH6Fd01c1XdNU?v=w1280r16_9"],
    ["黃大仙血案 25歲男身中多刀命危留醫", "遭鄰居狂劈逾30刀，深切治療部搶救家人床邊守候", S, st("breaking-news", 3602354), "2026-08-08T18:49:08+08:00", "2026-08-08T18:49:08+08:00", "https://image.hkhl.hk/f/1200p0/0x0/100/none/377cc986cd23d5af3ca22a137bb79637/2026-08/002_4.png"],
    ["黃大仙血案 傷者家犬曾對陌生人吠叫", "單位部分地面鋪膠墊減聲，鄰里噪音爭執成導火線", H, h1(60378148), "2026-08-08T21:36:25+08:00", "2026-08-09T00:53:25+08:00", "https://cdn.hk01.com/di/media/images/dw/20260809/1162924927045603328139872.png/mA9gH6IpP58RMWcLI_NG-XNu2uvcihpEri6a864umvM?v=w1280r16_9"],
    ["酒吧圍毆商人致死 無業男被控謀殺再訊", "尖沙咀掃黑案再上庭，40歲被告還柙候審", S, st("daily-hongkong", 3602437), "2026-08-09T03:00:00+08:00", "2026-08-09T03:00:00+08:00", "https://image.hkhl.hk/f/1200p0/0x0/100/none/fa664329b7f170608bdbebe825654114/2026-08/NEW02P04090826_copy.jpg"],
  ],
  hkl: [
    ["熱浪撲港 上水錄38.5度全日最高", "下沉氣流持續，天文台發酷熱警告，各區開放避暑中心", S, st("breaking-news", 3602428), "2026-08-09T03:00:00+08:00", "2026-08-09T03:00:00+08:00", "https://image.hkhl.hk/f/1200p0/0x0/100/none/a9cf339b42dc35473b837f44a13884d8/2026-08/NEC01P01090826_copy.jpg"],
    ["酷熱下西貢廈門灣逼爆 旅客怨人多", "泳灘及旺角商場同告擠迫，內地客直呼後悔到訪", H, h1(60378160), "2026-08-09T00:12:08+08:00", "2026-08-09T01:22:47+08:00", "https://cdn.hk01.com/di/media/images/dw/20260809/1162932319456071680853691.png/drbSCMgEppAXJ-kyxORW9x9v5vytwej8_OmGkPzphpA?v=w1280r16_9"],
    ["三疫夾擊期 專家籲市民打針勿輕視", "新冠流感及呼吸道合胞病毒同時流行，幼童併發症離世", S, st("breaking-news", 3602429), "2026-08-09T03:00:00+08:00", "2026-08-09T03:00:00+08:00", "https://image.hkhl.hk/f/1200p0/0x0/100/none/ddd96c59917bdd57746e580bf4cad7ad/2026-08/NEC01P05090826_copy.jpg"],
    ["醫生指精神病患對聲敏感易成惡性循環", "呼籲勿貼標籤，強調演變成極端暴力個案屬罕見", H, h1(60378137), "2026-08-08T20:33:57+08:00", "2026-08-08T20:33:57+08:00", "https://cdn.hk01.com/di/media/images/cis/5e5399f106d92a7657dd6c41.jpg/iWXaSYOJ7f9TSVUY3TKbXXmewqFMWdBD_hHU-P4R1Pg?v=w1280r16_9"],
    ["深水埗珠仔街四店結業 熟客感慨", "網購與貴租夾擊，三店月底埋單一店三個月內或關", H, h1(60378142), "2026-08-08T21:51:15+08:00", "2026-08-08T23:17:55+08:00", "https://cdn.hk01.com/di/media/images/dw/20260808/1162900895847944192075842.jpeg/kD6cfCUndyjxdDYbNKmfHkxZQkk6XGMB17NdBdezXQU?v=w1280r16_9"],
    ["大律師警告主租約禁分租 房客易被逐", "短租少於28日或違酒店發牌條例，分租戶欠保障", S, st("breaking-news", 3602432), "2026-08-09T03:00:00+08:00", "2026-08-09T03:00:00+08:00", "https://image.hkhl.hk/f/1200p0/0x0/100/none/8666b1d0cba1e6d05dbc388cf3960549/2026-08/NEC02P06090826_copy.jpg"],
    ["區外客預繳一年租金16.2萬租屯門", "月租13500元一炮過付足一年，反映租務需求熾熱", S, st("breaking-news", 3602412), "2026-08-09T03:00:00+08:00", "2026-08-09T03:00:00+08:00", "https://image.hkhl.hk/f/1200p0/0x0/100/none/494ea47e9522e8c3474f85f991af178e/2026-08/PRO01P08090826.jpg"],
    ["油塘280呎居屋 35萬裝修間出兩房", "一家三口以弧形玻璃取代實牆，神枱櫃融入玄關設計", S, st("renovation", 3601992), "2026-08-09T06:00:30+08:00", "2026-08-09T06:00:30+08:00", "https://image.hkhl.hk/f/1200p0/0x0/100/none/d87c086b1f02967d8a2bb67202dea615/2026-08/20260807_fin___V2.png"],
  ],
  hke: [
    ["文具佬今年七店結業 荔枝角元祖店告終", "連鎖文具店年內七間分店關門，八月佔三間，涉租約問題", H, h1(60378135), "2026-08-08T20:58:48+08:00", "2026-08-08T23:09:05+08:00", "https://cdn.hk01.com/di/media/images/dw/20260808/1162880191710629888301257.jpeg/wSaLzEhA9xMH0CisApOE9lOr3MewHIhvFR07PBUdOzw?v=w1280r16_9"],
    ["九龍北新盤PALO SPRINGS 首日收逾700票", "恒隆項目首批65伙錄約十倍超購，售樓處入場逾五千人次", S, st("breaking-news", 3602410), "2026-08-09T03:00:00+08:00", "2026-08-09T03:00:00+08:00", "https://image.hkhl.hk/f/1200p0/0x0/100/none/7ecb0febb50a1477a301df4d589c0c67/2026-08/PRO01P02090826.jpg"],
    ["閒資應否提早還按揭 買銀債或多賺一厘", "比較提早清還與投資回報，並提醒自存樓契的保管風險", S, st("investment", 3602035), "2026-08-09T06:00:45+08:00", "2026-08-09T06:00:45+08:00", "https://image.hkhl.hk/f/1200p0/0x0/100/none/593dfcc75683dea8c173660e8ce6b354/2026-08/20260808_FIN___1.png"],
  ],
  hkp: [
    ["施政報告2026 霍啟剛倡推體育消費券", "建議發運動幣參考內地做法，並整合政策打造健康香港", H, h1(60378115), "2026-08-08T18:31:12+08:00", "2026-08-08T19:44:41+08:00", "https://cdn.hk01.com/di/media/images/dw/20260115/1088479774243819520371240.png/1JSAVI3nDTL1S-IBOFsSNqtDq6Y98s_ssIcQSrCHEEo?v=w1280r16_9"],
    ["大律師公會倡性罪行被告可匿名", "指媒體散播下無罪推定流於形式，促定罪前保護身份", H, h1(60378120), "2026-08-08T23:39:52+08:00", "2026-08-09T00:22:24+08:00", "https://cdn.hk01.com/di/media/images/dw/20260806/1162082887362023424234190.jpeg/-EQ874ELqT_3KUjNQOr3ql2hFgZw8pcptl-JZrZfiWY?v=w1280r16_9"],
    ["房署稱涉事單位准養犬 巡查未錄噪音", "多次突擊巡查未發現超標，亦無收到其他住戶投訴", S, st("breaking-news", 3602363), "2026-08-08T19:50:37+08:00", "2026-08-08T19:50:37+08:00", "https://image.hkhl.hk/f/1200p0/0x0/100/none/12a1e3f15aeab0cbff483315f38de767/2026-08/004_3.png"],
  ],
  cn: [
    ["中國援古巴五千套家用太陽能設備", "首批物資已交付，古巴副總理致謝北京", H, h1(60378126), "2026-08-08T19:07:45+08:00", "2026-08-08T19:09:08+08:00", "https://cdn.hk01.com/di/media/images/dw/20260808/1162836625625976832847561.jpeg/M5807sDi57l8TwCVqOdTJusIaQFuLJzrI01-PCNNfjw?v=w1280r16_9"],
    ["白海豚逼近 九歲童堤壩上遭捲入海", "浙江溫嶺一家四口私闖管控區，搜救仍在持續", H, h1(60378117), "2026-08-08T21:17:55+08:00", "2026-08-08T23:09:23+08:00", "https://cdn.hk01.com/di/media/images/dw/20260808/1162898742643265536879451.jpeg/Mjm-kw4gLS6y8eOlip7XVIfE07aqXBCiaOLAhGjiwIQ?v=w1280r16_9"],
    ["立秋茶飲爆單 星巴克被打至瑞幸價", "內地茶飲咖啡割喉戰升溫，部分產品低至十元以下", S, st("daily-china", 3602419), "2026-08-09T03:00:00+08:00", "2026-08-09T03:00:00+08:00", "https://image.hkhl.hk/f/1200p0/0x0/100/none/41d926bf99e018490d04d42eb283cac2/2026-08/CHI01P03090826_copy.jpg"],
  ],
  us: [
    ["私營監獄春季收入達十四億美元", "移民拘留人數迫近新高，兩大營運商同期大幅獲利", "全國公共廣播電台", "https://www.npr.org/2026/08/08/nx-s1-5923881/geo-group-corecivic-immigration-detention", "2026-08-08T18:00:00+08:00", "2026-08-08T18:00:00+08:00", "https://npr.brightspotcdn.com/dims3/default/strip/false/crop/8192x4608+0+428/resize/1400/quality/85/format/jpeg/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2Fa5%2Fc4%2F926fbab34feaaf741a1a5dbbebb8%2Fgettyimages-2284072233.jpg"],
    ["聯邦撥款禁購驗毒試紙惹過量憂慮", "減害倡議者警告新政策恐推高濫藥死亡人數", "全國公共廣播電台", "https://www.npr.org/2026/08/08/nx-s1-5874719/federal-funds-cant-be-used-to-give-test-strips-to-drug-users-raising-overdose-fears", "2026-08-08T18:00:00+08:00", "2026-08-08T18:00:00+08:00", "https://npr.brightspotcdn.com/dims3/default/strip/false/crop/1579x888+181+165/resize/1400/quality/85/format/jpeg/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2Fc7%2F25%2Fd800616e4b698d64f58d43138f47%2Ftest-strips-sidewalk.jpg"],
    ["職位增長放緩紓加息憂慮 美股三指齊升", "七月新增職位遜預期，道指納指同上揚，金價急漲", S, st("daily-finance", 3602408), "2026-08-09T03:00:00+08:00", "2026-08-09T03:00:00+08:00", "https://image.hkhl.hk/f/1200p0/0x0/100/none/d5241c625f54cd28746babb8633b7723/2026-08/BUS01P01090826.jpg"],
  ],
  tw: [
    ["中菲民主礁起衝突 美方力挺馬尼拉", "華府批北京借環保名義推單邊主張破壞區域穩定", "ETtoday新聞雲", "https://www.ettoday.net/news/20260809/3215877.htm", "2026-08-09T05:52:00+08:00", "2026-08-09T05:52:01+08:00", "https://cdn2.ettoday.net/images/8064/e8064403.jpg"],
    ["白海豚外圍環流襲台 十九縣市強風特報", "新北升橙色燈號，民眾須慎防八級強陣風", "ETtoday新聞雲", "https://www.ettoday.net/news/20260809/3215875.htm", "2026-08-09T04:40:00+08:00", "2026-08-09T05:11:42+08:00", "https://cdn2.ettoday.net/images/8867/e8867459.jpg"],
    ["豪雨再炸一日 白海豚明日才遠離台灣", "花東防焚風高溫37度，下周西南風南部變天", "NOWnews今日新聞", "https://www.nownews.com/news/6864264", "2026-08-09T04:01:00+08:00", "2026-08-09T04:01:00+08:00", "https://media.nownews.com/nn_media/thumbnail/2024/10/1728886904956-8e1694946bd54048aceb4185b1294a02-1200x800.webp?unShow=false"],
  ],
  war: [
    ["阿聯酋指伊朗導彈襲霍爾木茲油輪", "阿布扎比國油船隻過境時中彈，開戰以來累計十五艘遇襲", "gCaptain", "https://gcaptain.com/uae-says-iran-attacked-vessel-with-missile-in-strait-of-hormuz/", "2026-08-08T21:07:44+08:00", "2026-08-08T21:07:44+08:00", "https://gcaptain.com/wp-content/uploads/2026/08/2026-07-31T061146Z_355163413_RC2ROMAOX291_RTRMADP_3_IRAN-CRISIS-OMAN-HORMUZ-800x522.jpg"],
    ["報道再揭加沙船隊人士遭以方虐待指控", "紐約時報訪約廿名參與者，以色列一直否認相關指控", "以色列時報", "https://www.timesofisrael.com/report-details-further-allegations-that-gaza-flotilla-activists-were-abused-by-israel/", "2026-08-08T19:37:00+08:00", "2026-08-08T19:37:00+08:00", "https://static-cdn.toi-media.com/www/uploads/2026/05/AFP__20260525__B3X88TL__v2__HighRes__AustraliaIsraelPalestiniansConflictAidFlotilla.jpg"],
    ["耶路撒冷安息日咖啡店爭議 數百人集會", "宗教與世俗對立升溫，反對派領袖戈蘭到場聲援", "i24新聞台", "https://www.i24news.tv/en/news/israel/society/artc-hundreds-rally-at-jerusalem-shabbat-cafe-turned-flashpoint-for-religious-secular-tensions", "2026-08-08T19:42:17+08:00", "2026-08-08T19:42:17+08:00", "https://cdn.i24news.tv/uploads/a6/5e/74/59/cc/8f/ce/d2/a2/ed/87/03/35/17/88/24/a65e7459cc8fced2a2ed870335178824.jpg"],
  ],
  track: [
    ["🔥 美伊戰爭（2026）", "談判中", "阿聯酋譴責伊朗導彈襲擊阿布扎比國油油輪，開戰以來旗下15艘船於霍爾木茲遇襲；美方官員稱「好快會有協議」，商業航運一恢復即解除對伊朗港口封鎖"],
    ["港·宏福苑大火獨立調查", "聽證中", "今日無新進展；最後進展（08-07）：聽證會展示專家報告，殉職消防員何偉豪戰衣嚴重火損、氣道有煙灰"],
    ["港·施政報告2026", "諮詢中", "立法會議員霍啟剛倡推體育消費券或運動幣、整合政策打造「健康香港」；9月發表前政界建言持續"],
    ["港·颱風白海豚", "跟進中", "下沉氣流持續，上水錄38.5度全日最高、天文台維持酷熱警告並開放避暑中心；颱風今日料登陸浙閩，浙江溫嶺9歲童觀浪被捲入海失蹤；台灣19縣市發強風特報"],
    ["港·尖沙咀酒吧血案", "候訊", "涉圍毆男商人致死嘅40歲無業男被控謀殺，今日再度提堂還柙候審"],
    ["台·食安毒油風暴", "持續擴大", "今日無新進展；最後進展（08-07）：逾1300噸問題油流入市面，下游名單累增至1322家，知名品牌亦入列"],
    ["港·美取消香港國家緊急狀態", "跟進中", "今日無新進展；最後進展（08-06）：美方讓緊急狀態令屆滿失效，特區政府歡迎，貿易地位有望回復"],
    ["港·竹園南邨棚架吸煙事件", "調查中", "今日無新進展；最後進展（08-06）：房署證實吸煙者非住戶，勞工處試用熱能無人機緝地盤吸煙已發39張告票"],
    ["港·水務署五年換喉", "跟進中", "今日無新進展；最後進展（08-07）：一日兩宗——荃灣工地爆450毫米食水管湧十層樓高水柱、兩商廈停水；北角福蔭道250毫米管道滲漏當晚復水。六日內第四宗爆喉"],
    ["中·中共高層清洗／落馬潮", "跟進中", "今日無新進展；最後進展（08-04）：傳多名高官被查，五中全會前開除黨籍人數或創新高"],
    ["港·長沙灣九巴甩轆事故", "調查中", "今日無新進展；最後進展（08-05）：車輪飛脫波及7歲男童，九巴通宵檢查同款巴士並將約見生產商"],
    ["港·新皇崗口岸開通", "跟進中", "今日無新進展；最後進展（08-07）：陳國基視察港方區後，保安局預告8月13日辦千人交通演練，未來測試兩萬人出入境，最快九月開通"],
    ["港·華富邨清拆", "跟進中", "今日無新進展；最後進展（08-02）：58年銀都冰室結業，2031年清拆在即"],
    ["港·黎智英案", "排期聆訊", "今日無新進展；1.27億財產充公案11月30日高院聆訊，排期兩日"],
    ["台·統促黨違憲解散案", "跟進中", "今日無新進展；最後進展（07-31）：內政部下月聲請憲法法庭解散"],
    ["港·露宿婆婆遭淋煙灰水", "候訊", "今日無新進展；29歲侍應被控兩項普通襲擊，8月17日再訊（KCCC2082/2026）"],
    ["港·東涌鐵騎士捲巴士車底亡", "已落案", "今日無新進展；最後進展（08-08）：60歲龍運巴士車長被暫控危險駕駛引致他人死亡，08-08晨已提堂"],
    ["港·黃大仙上邨斬人案", "調查中", "25歲男遭鄰居狂劈逾30刀命危留醫ICU、施襲者返家墮樓亡；房署稱涉事單位准養伴侶犬、多次突擊巡查未錄超標噪音，死者生前已獲批調遷"],
  ],
  ai: {
    upd: DATE,
    img: "https://the-decoder.com/wp-content/uploads/2026/08/anthropic_logo_wall-2.png",
    t: "Anthropic 8 日公布，8 月 14 日起為 Pro、Max 同 Team 用戶將 Claude Code 預設轉做 Auto Mode，把批准寫檔、執行指令嘅把關交畀 AI 分類器。公司內部測試話分類器攔截到 89% 高危指令，人手覆核只攔到 13.6%，外部審計亦話對提示注入有防護力；不過改動亦令開發者由「寫代碼」進一步變成「審 AI 輸出」，對生產環境高風險改動仍建議人手把關。同日 Claude Code 亦開放跨終端 session 互通，可以互傳訊息、共享脈絡。\n監管同訴訟面亦升溫。馬斯克旗下 xAI 就孟菲斯數據中心燃氣渦輪機被 NAACP 入稟一案，直接挑戰公民訴訟權（citizen suits）嘅憲法基礎；特朗普政府罕有介入撐 xAI，理由係渦輪機為支援國防部嘅 AI 算力供電，關停會「損害國家安全」。呢單官司隨時改寫環保法點樣約束 AI 數據中心。\n保安方面，Google 威脅情報主管 Huntley 公布改版黑客組織命名法，棄用 APT 編號，改用國家指示詞加代號（中國 Castle、伊朗 Ion、北韓 Neptune、俄羅斯 Relic），目前追蹤逾 5,000 個活動群組，方便企業更快辨識威脅。\n研究面，一項逾 2,500 人參與嘅實驗發現，讀者分辨唔到 ChatGPT 同真人寫嘅短篇小說，準確率同亂猜差唔多；未知作者身分時 AI 文本喺質素同投入感評分仲高過真人，但一知道係機器寫，評價即刻反轉。",
    src: [
      ["The Decoder — Anthropic 將 Claude Code 預設轉做 Auto Mode", "https://the-decoder.com/anthropic-sets-claude-code-to-auto-mode-by-default-to-protect-developers-from-bad-approvals/"],
      ["Fortune — 馬斯克 AI 公司加入削弱公民訴訟權之戰", "https://fortune.com/2026/08/08/lazarus-26-years-citizen-suits-musk-xai/"],
      ["TechCrunch — Google 首席黑客獵人解釋黑客組織點改代號", "https://techcrunch.com/2026/08/08/googles-top-hacker-hunter-explains-why-hacking-groups-get-codenames/"],
      ["The Decoder — 讀者對 AI 短篇評分高過真人，直至知道係機器寫", "https://the-decoder.com/readers-rate-ai-generated-short-stories-higher-than-human-ones-until-they-learn-a-machine-wrote-them/"],
      ["The Decoder — Claude Code session 可跨終端互通共享脈絡", "https://the-decoder.com/claude-code-sessions-can-now-talk-to-each-other-and-share-context-across-terminals/"],
    ],
  },
  warb: {
    upd: DATE,
    img: "https://gcaptain.com/wp-content/uploads/2026/08/2026-07-31T061146Z_355163413_RC2ROMAOX291_RTRMADP_3_IRAN-CRISIS-OMAN-HORMUZ-800x522.jpg",
    t: "霍爾木茲海峽航運再度中箭。阿聯酋外交部 8 日下午譴責伊朗以導彈襲擊阿布扎比國家石油公司（ADNOC）一艘油輪，事發時該船正過境海峽，暫時無人傷亡，阿方形容做「等同海盜行為」。ADNOC 前一日已公布，開戰以來共有 15 艘旗下船隻喺海峽水域遇襲、累計 1 死 20 傷，單係本周就有 3 艘中招，反映即使談判進行中，海上襲擊未停。\n談判就見到最實質嘅進展信號。革命衛隊發言人強硬表態，重開海峽要「按伊朗自己嘅機制」同美方接受條件為前提；但美國官員 8 日深夜放風「好快會有協議」，講明一旦商業航運恢復，美方會解除對伊朗港口嘅封鎖，並強調行動係「按表現掛鈎」、視乎德黑蘭落實情況。伊朗方面據報等緊最高國家安全委員會拍板；美方亦有官員提到 30 至 60 日停火有機會喺數日內成形。特朗普連日重申戰爭「好快完」，但過往預測多次落空。\n也門戰線同時惡化，胡塞武裝連日突襲馬里卜、哈德拉毛，發射逾 10 枚導彈同 7 架自殺無人機，造成雙位數死亡，也門政府軍隨即反擊；聯合國特使警告，當地面對自 2022 年停火以來最高嘅全面內戰風險，沙特已將馬里卜劃為「紅線」。\n經濟壓力係伊朗肯談嘅底因：官方數據顯示通脹達 88.6%（南部逾 100%）、失業 9.1%，今年 GDP 料收縮 5.4%，哈爾克島至少一星期無油輪裝載。副外長加里巴巴迪公開反駁黨內反對談判者，形容經濟急需制裁鬆綁。",
    src: [
      ["gCaptain — 阿聯酋指伊朗導彈襲擊霍爾木茲海峽船隻", "https://gcaptain.com/uae-says-iran-attacked-vessel-with-missile-in-strait-of-hormuz/"],
      ["Times of Israel — 阿聯酋：伊朗襲擊阿布扎比國油油輪，無人傷亡", "https://www.timesofisrael.com/liveblog_entry/uae-says-iran-attacked-tanker-of-abu-dhabi-state-oil-company-in-hormuz-no-casualties/"],
      ["Times of Israel — 8 月 8 日直播：美官員稱「預期好快有協議」", "https://www.timesofisrael.com/liveblog-august-08-2026/"],
      ["Iran International — 華府尋找下台階，德黑蘭力保霍爾木茲籌碼", "https://www.iranintl.com/en/liveblog/202608084952"],
      ["Fortune — 伊朗官員憂美國封鎖引發經濟崩潰", "https://fortune.com/2026/08/08/iran-economic-collapse-us-naval-blockade-hormuz-sanctions-relief/"],
    ],
  },
  _updated: UPD,
};

const html = fs.readFileSync("index.html", "utf8");
const m = html.match(/const DB = ([\s\S]*?);\n/);
const db = eval("(" + m[1] + ")");
db[DATE] = { am };
const sorted = {};
Object.keys(db).sort().reverse().forEach(k => sorted[k] = db[k]);
const out = html.replace(m[0], "const DB = " + JSON.stringify(sorted, null, 0) + ";\n");
// 驗 parse
eval("(" + out.match(/const DB = ([\s\S]*?);\n/)[1] + ")");
fs.writeFileSync("index.html", out);
console.log("OK 日子數:", Object.keys(sorted).length, "第一個:", Object.keys(sorted)[0]);
