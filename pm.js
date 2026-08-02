const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const m=html.match(/const DB = ([\s\S]*?);\n/);
const db=eval("("+m[1]+")");
const D='2026-08-02';
const t=db[D];
const find=(g,u)=>{const c=(t[g]||[]).find(x=>x[3].indexOf(u)>=0); if(!c)throw new Error('not found '+g+' '+u); return c;};

const hks=[
["大美督三鐵賽男子遇溺　送院不治","59歲選手泳段失蹤，消防搜救七小時尋回","香港01","https://www.hk01.com/article/60376033","2026-08-02 15:31","2026-08-02 16:22","https://cdn.hk01.com/di/media/images/dw/20260802/1160622003099537408015329.jpeg/kQWCC5sZvHS70NKJStUHzcMd07rIv0YqnBPwVpwT8FY"],
["尖沙咀血案　800警掃黑幫場拘90人","帶頭施襲頭目落網，全案累計12人被捕","香港01","https://www.hk01.com/article/60376062","2026-08-02 17:47","2026-08-02 17:56","https://cdn.hk01.com/di/media/images/dw/20260802/1160637751859613696675321.jpeg/MYXqg8dkR3tQXV0b1eav2jSS2uOpw6G-rW1kJq1tZCY?v=w1280r16_9"],
["遇溺三鐵選手生前從事警務工作","外號大隻佬，過往多次參加同類賽事","星島日報","https://www.stheadline.com/breaking-news/3600182/","2026-08-02 16:00","2026-08-02 16:33","https://image.hkhl.hk/f/1200p0/0x0/100/none/b87e7e6b2488631eebcfd85d75e83380/2026-08/20260802_v2.png"],
["荃灣漢涉偷拍　揮雨傘打傷四人","女事主男友及兩途人上前制止同遭襲擊","香港01","https://www.hk01.com/article/60376043","2026-08-02 16:39","2026-08-02 17:28","https://cdn.hk01.com/di/media/images/dw/20260802/1160638581539082240034976.jpeg/9dGGXLF4QNxpuWi7x4oOPHRzTZpb9DvTt330ZLd99GQ"],
["油麻地兩歲童爬窗　父母涉虐兒被捕","尼泊爾裔夫婦先後睡着，社署派社工跟進","香港01","https://www.hk01.com/article/60376039","2026-08-02 15:59","2026-08-02 15:59","https://cdn.hk01.com/di/media/images/dw/20260801/1160271496195608576351089.jpeg/zxSoWcdQbD-ZUvDsgOz-IueG0D3rnZBFc8BY-3PAWPs?v=w1280r16_9"],
["屏山坑尾村17歲少女燒炭身亡","警方指疑受長期病患困擾，正調查死因","星島日報","https://www.stheadline.com/breaking-news/3600161/","2026-08-02 14:50","2026-08-02 14:50","https://image.hkhl.hk/f/1200p0/0x0/100/none/72b11376b70c058aebff7b724bb0ada4/2026-08/8888_1.jpg"],
["啟德地盤兩幫工人爆衝突互毆","有人擸架生開打安全帽甩脫，工頭喝止","星島日報","https://www.stheadline.com/breaking-news/3600147/","2026-08-02 13:31","2026-08-02 13:31","https://image.hkhl.hk/f/1200p0/0x0/100/none/63581bdba2bc57b473378745d4a61da6/2026-08/8888_0.jpg"],
["紅隧口客貨車失控撞欄翻側","男司機手腳擦傷，清醒送院治理","星島日報","https://www.stheadline.com/breaking-news/3600077/","2026-08-02 07:43","2026-08-02 07:43","https://image.hkhl.hk/f/1200p0/0x0/ur/sthl_square/d11e318a51150fb0949adc96cfa748ce/2026-08/WhatsApp_Image_2026-08-02_at_00_21_16.jpeg"]
];
const hkl=[
["黃雨新界5處水浸　渠務署出動龍吸水","北區大埔七小時錄得逾100毫米雨量","香港01","https://www.hk01.com/article/60376026","2026-08-02 16:42","2026-08-02 16:48","https://cdn.hk01.com/di/media/images/dw/20260802/1160600635570130944518497.jpeg/WlupLgQQzYOEg870yiGj6C8mVmIWFJsYQ85dx0POXcc?v=w1280r16_9"],
["洪水淹信芯園太陽花田　料損失十萬","水深及頸，信哥與夥計冒險搶救花苗","香港01","https://www.hk01.com/article/60376038","2026-08-02 16:28","2026-08-02 17:26","https://cdn.hk01.com/di/media/images/dw/20260802/1160638191967932416657348.jpeg/cBpUlXS64SIM4b4Fw2Ld6FuICKlLa95-QZdJTUGXSU0"],
["葵涌爆水管　寶星中心一帶停食水","水務署設水車派樽裝水，爭取凌晨修妥","星島日報","https://www.stheadline.com/breaking-news/3600149/","2026-08-02 14:08","2026-08-02 14:08","https://image.hkhl.hk/f/1200p0/0x0/100/none/967a5bb419df71b5c49f25ee06c9c9be/2026-08/page_6.jpg"],
["雙颱風藤原效應　鯨魚恐被海豚吞併","本港周五起受外圍影響，氣溫升至33度","香港01","https://www.hk01.com/article/60375947","2026-08-02 07:03","2026-08-02 15:42","https://cdn.hk01.com/di/media/images/dw/20260802/1160513677489606656967014.jpeg/NzkV1K-PdzGWyhfbJIQJkWdTCrXXL-zFdLgGR3S4Bkc"],
["林超英嘆今年熱到險破戒開冷氣","促改用濕球黑球溫度，保障戶外工作者","香港01","https://www.hk01.com/article/60376000","2026-08-02 12:31","2026-08-02 14:06","https://cdn.hk01.com/di/media/images/dw/20260802/1160579939041284096279856.jpeg/pfcJ6lZBMZsphCILPV_MjmcKyn0fCq8toUelzKFHpcw"],
["食環署清潔工新雨衣被指落雨滲水","測試舊款一分鐘濕透，署方稱正了解核實","香港01","https://www.hk01.com/article/60375964","2026-08-02 10:21","2026-08-02 10:45","https://cdn.hk01.com/di/media/images/dw/20260802/1160531186771038208207654.jpeg/iJrrUfeS2q5joBqg9Hqx-hyforgjx4tmh6fNIYenzSE?v=w1280r16_9"],
["跑手挑戰10小時跑步機完成100公里","啟德超馬接力賽本月下旬舉行，先行試跑","香港01","https://www.hk01.com/article/60376035","2026-08-02 16:43","2026-08-02 16:50","https://cdn.hk01.com/di/media/images/dw/20260802/1160609789412118528923071.jpeg/awGPNbpIgCJCxDlw8-NHHSCdcbs03DjjiB-Flr0fhZY?v=w1280r16_9"],
find('hkl','60375547')
];
const hke=[
["陳茂波：上半年經濟增長5.1%勝預期","連續14季增長，政府將上調全年經濟增長預測","香港01","https://www.hk01.com/article/60376007","2026-08-02 13:16","2026-08-02 13:21","https://cdn.hk01.com/di/media/images/dw/20260802/1160575754572926976890135.jpeg/8XvIQdGK2cWbjnI_-B976MLkgIsBdsgj8ag9uPGoPbg?v=w1280r16_9"],
["7月物業註冊量料6700宗　按月回落近三成","住宅約5400宗按月挫33%，反映6月股市回調","星島日報","https://www.stheadline.com/realtime-property/3600091/","2026-08-02 09:15","2026-08-02 09:15","https://image.hkhl.hk/f/1200p0/0x0/ll/sthl_square/53141e6724caf0b22bfdc86dc9939e95/2026-08/PIC_ONLY_0925_8_.jpg"],
["新地芊御兩周累售297伙　套現近16億","第三輪再錄38宗成交，特色戶呎價逼近兩萬元","香港01","https://www.hk01.com/article/60375977","2026-08-02 12:00","2026-08-02 12:06","https://cdn.hk01.com/di/media/images/dw/20260802/1160546363717455872834762.jpeg/GI7b8KbDL_86A3de96ExU4zM9fEgfWi94LO1l-CztZc?v=w1280r16_9"]
];
const hkp=[
["李家超：處理校園欺凌盡量唔好咁高壓","教師倡參考內地公安介入，特首強調教育為重","香港01","https://www.hk01.com/article/60376052","2026-08-02 17:11","2026-08-02 17:11","https://cdn.hk01.com/di/media/images/dw/20260802/1160633738388836352205974.jpeg/I2-qaHIR3yl9vKbUkvU4UkgqITOQZH_rJGgWfiRoFn4?v=w1280r16_9"],
["青年呻難搵工　李家超研航天科技創就業","諮詢會青年反映初級職位大減、技能與市場錯配","香港01","https://www.hk01.com/article/60376002","2026-08-02 13:01","2026-08-02 13:51","https://cdn.hk01.com/di/media/images/dw/20260802/1160566739717591040249657.jpeg/yEu821fwI_2i0bIqmbLhdXPkldqPVwM1jFNAtqVTQLY?v=w1280r16_9"],
["施政報告諮詢　市民最關注房屋土地","屯門逾130名市民出席，26人就五大範疇獻策","星島日報","https://www.stheadline.com/politics/3600134/","2026-08-02 12:39","2026-08-02 12:39","https://image.hkhl.hk/f/1200p0/0x0/ul/sthl_square/402dccf5104ef641bf48df646585e2a0/2026-08/177A17DC16F24E5D864E24E99C0DE87B_O.jpeg"]
];
const track=[
["尖沙咀血案　3男落網　800警掃黑拘90人","包括帶領施襲頭目，警大規模掃蕩黑幫場所","香港01","https://www.hk01.com/article/60376062","2026-08-02 17:47","2026-08-02 17:56","https://cdn.hk01.com/di/media/images/dw/20260802/1160637751859613696675321.jpeg/MYXqg8dkR3tQXV0b1eav2jSS2uOpw6G-rW1kJq1tZCY?v=w1280r16_9"],
["黃雨新界5處水浸　渠務署出動龍吸水排洪","北區降雨近100毫米，逾60隊應急隊伍出動","香港01","https://www.hk01.com/article/60376026","2026-08-02 16:42","2026-08-02 16:48","https://cdn.hk01.com/di/media/images/dw/20260802/1160600635570130944518497.jpeg/WlupLgQQzYOEg870yiGj6C8mVmIWFJsYQ85dx0POXcc?v=w1280r16_9"],
["李家超謝市民踴躍參與施政報告首場諮詢","屯門地區諮詢會舉行，稱會認真研究每份意見","星島日報","https://www.stheadline.com/politics/3600152/","2026-08-02 14:20","2026-08-02 14:20","https://image.hkhl.hk/f/1200p0/0x0/100/none/145b0bc8e5c889721c5a7e487fadc7f6/2026-08/q.jpg"]
];
const cn=[
["廣東兩女嬰錯抱　人生互換37年","1989年清遠產房抱錯，DNA揭真相索償260萬","香港01","https://www.hk01.com/article/60375970","2026-08-02 10:39","2026-08-02 13:04","https://cdn.hk01.com/di/media/images/dw/20260802/1160572300441948160842793.jpeg/ocHaKQKjxtosbLfGBu3MVUWde4oRYu6CpiQ4AKYkOAA"],
["領空對峙　中國飛行員：只想戰鬥","建軍節官媒發片，海軍驅離外軍機對話曝光","香港01","https://www.hk01.com/article/60375922","2026-08-01 22:37","2026-08-01 22:39","https://cdn.hk01.com/di/media/images/dw/20260801/1160352928536465408521780.jpeg/vxPn9TOWtoQWRX0R_hr2RI7Ed8Cl2CeWLno82S56PNk?v=w1280r16_9"],
["台北團體抗議中國民族團結法","藏人自焚一個月，中銀外集會促國際施壓北京","台灣英文新聞","https://www.taiwannews.com.tw/en/news/6413201","2026-08-02 16:19","2026-08-02 16:19","https://image.taiwannews.com.tw/2026%2F08%2F02%2F99be7ccc0eca4349b7319f421ffbc7d7.jpg"]
];
const us=[
["愛達荷州快餐店槍擊　3死7傷","槍手當場身亡，動機未明，警方仍在調查","星島日報","https://www.stheadline.com/realtime-world/3600113/","2026-08-02 11:23","2026-08-02 11:24","https://image.hkhl.hk/f/1200p0/0x0/100/none/e623ac9da7673a9969754ba3a93d083c/2026-08/WhatsApp_Image_2026-08-02_at_11_14_17.jpeg"],
["前OpenAI研究員基金押注AI股爆倉","24歲基金經理孖展重注，單月勁蝕近七成","星島日報","https://www.stheadline.com/realtime-world/3600079/","2026-08-02 08:30","2026-08-02 08:30","https://image.hkhl.hk/f/1200p0/0x0/100/none/c90847b765b08c63740ee5b452dd21d3/2026-08/926_.jpg"],
find('us','60375855')
];
const tw=[
["台灣魚雷缺貨　靠德製舊裝備頂住","美製MK-48交付延誤，海軍暫用老舊魚雷維持戰力","台灣英文新聞","https://www.taiwannews.com.tw/en/news/6413216","2026-08-02 17:17","2026-08-02 17:17","https://image.taiwannews.com.tw/2026%2F07%2F16%2Ff444a4cc36944f4b8d53d7d0c4b09542.jpg"],
["台外長承諾深化台日合作關係","強化台日關係，共同維護印太區域和平穩定","台灣英文新聞","https://www.taiwannews.com.tw/en/news/6413184","2026-08-02 15:25","2026-08-02 15:25","https://image.taiwannews.com.tw/2026%2F08%2F02%2Fadc36c300b834b6c8ea355a3dcef4256.jpg"],
find('tw','n14821465')
];
const war=[
["特朗普宣布取消對伊朗攻擊","稱協議框架已談妥，沙特王儲致電力勸重返談判","香港01","https://www.hk01.com/article/60375961","2026-08-02 10:13","2026-08-02 15:32","https://cdn.hk01.com/di/media/images/dw/20260508/1129242592161042432963452.jpeg/CreesfZSSCOXk-ht-dJjsKNenM_6lyKUSOgSGkjoEho?v=w1280r16_9"],
["土耳其伊拉克續簽輸油管協議","霍爾木茲封鎖後，續約保每日75萬桶原油通道","半島電視台","https://www.aljazeera.com/news/2026/8/1/turkiye-and-iraq-sign-one-year-oil-pipeline-deal-amid-global-shift","2026-08-02 00:43","2026-08-02 00:43","https://www.aljazeera.com/wp-content/uploads/2020/05/f87529b63a9248febe70e8a94a5d0734_18.jpeg?resize=1200%2C675"],
find('war','iran-warns-against-fire-of-war')
];
const ai={upd:"2026-08-02",img:"https://media.thenextweb.com/2026/08/openai-astra-model-ten-math-proofs-non-sofic-groups.avif",t:"OpenAI 喺美東時間 8 月 1 日、香港時間今日凌晨公布下一代重點模型「Astra」，而且唔係用發布會亮相，係直接掟出十條開放數學同理論電腦科學難題嘅完整證明，每一條都懸空咗超過十年。公司只形容 Astra 係「下一個重大模型」，設計上可以協調多個代理連續運算幾個鐘甚至幾日，未有公開發布時間表，外界普遍估計就係 GPT-6。\n成果清單相當硬：首次明確構造出「非索菲群」，了結 1999 年提出嘅懸案；推翻 Connes 剛性猜想；證明 Ehrhart 體積猜想；解決三條 Erdős 問題，包括涉及 Ramsey 數嘅第 183 題；自 1978 年以來首次改進球堆積密度；再加上量子雙人博弈嘅平行重複定理，同 permanent 嘅電路複雜度下界。十條證明全部附有可機器驗證嘅 Lean 4 憑證並上載 GitHub，任何人可以獨立覆核，唔使信 OpenAI 或者佢部機。OpenAI 估算，按現行 API 價錢，十條證明嘅 token 成本大約只係 2000 美元。\n數學界反應兩極。OpenAI 數學研究主管 Sébastien Bubeck 形容結果「優美」，曼徹斯特大學嘅 Thomas Bloom 話係「大新聞」，比之前嘅單位距離反例更重要；但 Bloom 同時反駁 AI 取代數學家嘅講法，指模型係踩住成個世紀嘅數學理論先行到呢一步。學界六月發表嘅《萊頓宣言》亦早已批評 AI 公司用新聞稿而唔係同行評審去公布研究成果，今次爭議再度升溫。",src:[["The Next Web","https://thenextweb.com/news/openai-astra-model-ten-math-proofs-non-sofic-groups"],["The Decoder","https://the-decoder.com/openai-announces-its-next-major-model-astra-by-dropping-ten-previously-unsolved-math-solutions/"]]};
const warb={upd:"2026-08-02",img:"https://www.aljazeera.com/wp-content/uploads/2026/08/afp_6a6eb30a1916-1785639690.jpg?resize=1200%2C630",t:"戰事今日出現開打以來最大轉折。特朗普喺 Truth Social 宣布，取消原定對伊朗嘅「大規模軍事攻擊」，聲稱「協議嘅框架已經談妥」。佢開出嘅條件係霍爾木茲海峽要「即時、完全、徹底開放」，同埋終結伊朗核威脅，並強調取消令以能夠迅速達成協議為前提。佢話美國同以色列本來已經「上膛待發」，週末原定出手打伊朗能源設施，係伊朗同中東多國要求佢暫緩，佢先按住唔郁。\n據 Axios 報道，沙特王儲穆罕默德·本·薩勒曼週六致電特朗普，力勸佢取消行動、重返談判桌。伊朗外長阿拉格齊就向沙特同行表明，任何美國或以色列嘅攻擊都會換嚟「對等回應」。德黑蘭官方暫時未正式回應取消一事，但半官方通訊社引述未具名軍方人士，直指特朗普嘅講法「不過係一個新嘅謊言」，明顯唔收貨。\n與此同時，美國國務院向中東十個國家嘅美國公民發出安全警示，顯示華府對局勢反覆仍然戒備。戰事自今年二月開打，最新民調顯示約三分之二美國人反對繼續軍事行動，白宮壓力唔細。霍爾木茲海峽能否真正重開、伊朗會唔會認落呢個「框架」，將會係未來幾日協議成敗嘅關鍵。",src:[["半島電視台","https://www.aljazeera.com/news/2026/8/2/trump-cancels-iran-strike-says-deal-perimeters-reached"],["NPR","https://www.npr.org/2026/08/02/nx-s1-5917113/trump-says-hes-cancelling-iran-strikes-deal-pending"]]};

db[D]={hks,hkl,hke,hkp,cn,us,tw,war,track,ai,warb,_updated:"2026-08-02 18:20 HKT（晚間更新）"};
const out={};
Object.keys(db).sort().reverse().forEach(k=>out[k]=db[k]);
const s=JSON.stringify(out,null,0);
const nh=html.replace(/const DB = ([\s\S]*?);\n/, ()=>"const DB = "+s+";\n");
fs.writeFileSync('index.html',nh);
console.log('written, DB bytes',s.length);
