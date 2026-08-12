const fs=require("fs");
let s=fs.readFileSync("index.html","utf8");
const start=s.indexOf("const DB");
const eq=s.indexOf("{",start);
let depth=0,end=-1;
for(let i=eq;i<s.length;i++){const c=s[i];if(c==="{")depth++;else if(c==="}"){depth--;if(depth===0){end=i;break;}}}
const DB=eval("("+s.slice(eq,end+1)+")");
const K="2026-08-12";
if(!DB[K]||!DB[K].am){console.error("am missing!");process.exit(1);}

const pm={
hks:[
["城門隧道旅遊巴撞壆1死1傷","71歲司機駕駛途中昏迷送院不治，車上47幼童無恙","香港01","https://www.hk01.com/article/60379309","2026-08-12 16:22","2026-08-12 18:07","https://cdn.hk01.com/di/media/images/dw/20260812/1164254305113346048104639.jpeg/4G_tJglvGPn75cjtISbSnPAcXSLHrcD8ms1VNqDNVTY?v=w1280r16_9"],
["珠海學院挪用公款案再拘兩人","涉洗黑錢，為被捕財務總監妻子及男友人，今晨提堂","香港01","https://www.hk01.com/article/60379291","2026-08-12 15:44","2026-08-12 16:32","https://cdn.hk01.com/di/media/images/2322362/org/b65bf37880b0fde9b68800d66097a7c7.JPG/tggI6qikjEEobgfo4kC_eNvnIsFLTm-es7O8YLOzvGA?v=w1280r16_9"],
["西環的士司機被殺案須重審","陪審團未能達成裁決，被告稱不信自己是疑犯","香港01","https://www.hk01.com/article/60379328","2026-08-12 16:46","2026-08-12 17:29","https://cdn.hk01.com/di/media/images/dw/20260812/1164262696854491136320179.jpeg/tkXORkubsv1KFwTBnBrM5Gojcpa2BeaiwYOf-8GDn_s?v=w1280r16_9"],
["大學女生墮假公安騙局變幫兇","19歲女被招攬冒充特務，呃港男程式員300萬元","星島","https://www.stheadline.com/breaking-news/3603566","2026-08-12 14:56","2026-08-12 14:56","https://image.hkhl.hk/f/1200p0/0x0/ur/sthl_square/9b04ba8ffc06a41b1440f248160840bf/2026-08/collage_22.jpg"],
["婦墮刷單騙局一日失逾120萬","騙徒訛稱送保溫杯誘刷單，警一周接逾30宗同類案","星島","https://www.stheadline.com/breaking-news/3603583","2026-08-12 14:41","2026-08-12 14:41","https://image.hkhl.hk/f/1200p0/0x0/100/none/72974a2bc0654f97c3e40211528da8ca/2026-08/a_4.jpg"],
["三賊爆竊大埔雜貨店掠1.8萬","天眼拍下賊人飲忌廉食香蕉，另掠車匙損毀鏡頭","香港01","https://www.hk01.com/article/60379253","2026-08-12 14:36","2026-08-12 15:10","https://cdn.hk01.com/di/media/images/dw/20260812/1164227865974149120932716.jpeg/72JqnU76hWkj8k4R0QkRen_vZB9DawrD3G2zAdxtswE?v=w1280r16_9"],
["譚香文控鄰居群組誹謗案開審","前區議員指業主群組言論無事實根據，對方稱屬實","香港01","https://www.hk01.com/article/60379344","2026-08-12 17:01","2026-08-12 17:03","https://cdn.hk01.com/di/media/images/dw/20260812/1164254525679341568960847.jpeg/F6xEbLhUWz61PKa6kLBvdgCK2TCD1ew4ZBFX1EERV9Q?v=w1280r16_9"],
["布袋澳魚排起火爆炸排主受傷","西貢魚排兩度爆炸，消防兩喉兩煙帽隊救熄","星島","https://www.stheadline.com/breaking-news/3603477","2026-08-12 09:11","2026-08-12 09:11","https://image.hkhl.hk/f/1200p0/0x0/ur/sthl_square/50474913d66ddd1a66a697c9cb372053/2026-08/8_1_24.jpg"]
],
hkl:[
["拖板用逾5年不換恐起火","Panasonic提醒3至5年要換，異常發熱等6大先兆須檢查","香港01","https://www.hk01.com/article/60379170","2026-08-12 16:36","2026-08-12 16:36","https://cdn.hk01.com/di/media/images/dw/20260812/1164249335672606720524960.png/mr8cJ3Ci4roBAtSKadO7TbvB7nyf3HxviclomonJaJo?v=w1280r16_9"],
["政府促承建商修復瑪麗新大樓𨋢","28部𨋢僅4部運作，故障頻生致新大樓未能啟用，醫護稱個個被困過","The Standard","https://www.thestandard.com.hk/news/article/339745/Govt-demands-repairs-at-Queen-Mary-Hospital-new-block-after-lift-incidents","2026-08-12 18:07","2026-08-12 18:07","https://image.hkstandard.com.hk/f/1200p0/0x0/100/none/7cf8bd885a468087b3adfacded87f1be/2026-08/ha_QM_0.jpg"],
["建管條例修訂擬設授權票上限","政府展開一個月諮詢，獲授權代表限親屬或屋苑業主","香港01","https://www.hk01.com/article/60379369","2026-08-12 17:44","2026-08-12 17:44","https://cdn.hk01.com/di/media/images/dw/20260213/1099062012236795904813590.jpeg/Ik0IyVFXF7Aftr2YWvOfpjsN8Iy2qvfE9Z5QAs-eUAI?v=w1280r16_9"],
["元朗鄉中生覆核成功變超狀","孫菀青稱喜出望外，溫書借AI解MC題，將讀港大醫科","香港01","https://www.hk01.com/article/60379320","2026-08-12 17:37","2026-08-12 17:40","https://cdn.hk01.com/di/media/images/dw/20260812/1164249599792123904823094.jpeg/FwXaLBmzkuVuSQepTKYcPaHOHp03As3yX4wodl-MKHY?v=w1280r16_9"],
["博主斥機場派英文指引惹爭議","內地客投訴員工不諳普通話，機管局提醒相關公司","香港01","https://www.hk01.com/article/60378957","2026-08-12 09:15","2026-08-12 12:13","https://cdn.hk01.com/di/media/images/dw/20260812/1164183343034535936189506.jpeg/rNJHe1vFnj4RZSeYz12UYYD9hfRrWMyoAMO3LADDtyw?v=w1280r16_9"],
["桌球名將韋德成港人擬辦學校","白旋風經人才計劃來港，冀培育新秀兼與老友敘舊","香港01","https://www.hk01.com/article/60379183","2026-08-12 11:55","2026-08-12 14:32","https://cdn.hk01.com/di/media/images/dw/20260812/1164193588842598400087396.jpeg/CSagvdWBTWawZB6ABlTLZSGSd5M740BPQ24100NuNdM?v=w1280r16_9"],
["深水埗兩邨宣傳反私煙新標籤","跨部門到白田邨李鄭屋邨介紹完稅標籤及罰則","星島","https://www.stheadline.com/breaking-news/3603633","2026-08-12 16:45","2026-08-12 16:45","https://image.hkhl.hk/f/1200p0/0x0/100/none/3dc6ad8972f2cdfe55f5f2c8c6a1405c/2026-08/001_9.png"],
["元朗收容所涉無牌養136隻狗","漁護署突擊巡查檢控一女子，9月2日屯門提堂","星島","https://www.stheadline.com/breaking-news/3603564","2026-08-12 13:53","2026-08-12 13:53","https://image.hkhl.hk/f/1200p0/0x0/100/none/0409ec4a10e7910a6ff033e47b7b6d71/2026-08/9_6.JPG"]
],
hke:[
["騰訊次季多賺9%勝預期","收入2048億升11%，AI帶動資本開支528億急增176%","香港01","https://www.hk01.com/article/60379212","2026-08-12 16:40","2026-08-12 16:40","https://cdn.hk01.com/di/media/images/dw/20260725/1157725755937918976621589.jpeg/wcAUzcMzMcGE6wo5RgBzazmfdsu1rmADjqc0yY6nNMk?v=w1280r16_9"],
["長建中期多賺389%創新高","售英國電網資產帶動純利212.5億，中期息75仙增2.7%","The Standard","https://www.thestandard.com.hk/finance/article/339743/CKI-interim-profit-surges-389pc-to-new-high-dividend-up-27pc","2026-08-12 17:35","2026-08-12 17:35","https://image.hkstandard.com.hk/f/1200p0/0x0/100/none/6691b61243b2f949b9481ecaf1ee009d/2026-08/DBNL0109CKHHWL008.jpg"],
["龍百味怡和街店一年即結業","兩餸飯敗走銅鑼灣，衛訊接租月租20萬跌13%","香港01","https://www.hk01.com/article/60379135","2026-08-12 10:41","2026-08-12 10:41","https://cdn.hk01.com/di/media/images/dw/20260812/1164178410050686976783459.jpeg/VDB69gTAg6tiEgmlk3e9F5GW1DB98TYXEDF6VBAxelQ?v=w1280r16_9"]
],
hkp:[
["新皇崗口岸交通系統測試暢順","逾200人測試落馬洲大橋交通系統，明日千人通關演練","香港01","https://www.hk01.com/article/60379381","2026-08-12 17:55","2026-08-12 18:10","https://cdn.hk01.com/di/media/images/dw/20260812/1164266851027390464971628.jpeg/tqRJkSKB7E1KXk7cPfR9t7NqH_6LvIAlw1YVNsNWFTY?v=w1280r16_9"],
["社工進修要求拖逾兩年","註冊局內部有微言，質疑委員會推展緩慢","香港01","https://www.hk01.com/article/60379151","2026-08-12 17:07","2026-08-12 17:20","https://cdn.hk01.com/di/media/images/dw/20240907/909077864773586944903627.jpeg/IapT_pKYXFU7Up-oHXRsAcYftIf9ytRd3eeoU93nqFM?v=w1280r16_9"],
["新聞處長訪亞太廣播聯盟","謝振中訪吉隆坡促長期合作，機械人大賽本月在港舉行","The Standard","https://www.thestandard.com.hk/news/article/339742/ISD-Director-John-Tse-visits-Asia-Pacific-Broadcasting-Union-to-boost-long-term-collab","2026-08-12 17:27","2026-08-12 17:27","https://image.hkstandard.com.hk/f/1200p0/0x0/100/none/30806b018eca6a8329cb4b23884e2ef7/2026-08/773606602_1622866736066721_5495797469107907788_n.jpg"]
],
cn:[
["前總理朱鎔基北京病逝","1998至2003年掌國務院，鐵腕推動經濟改革，享年98歲","香港01","https://www.hk01.com/article/60379349","2026-08-12 18:00","2026-08-12 18:03","https://cdn.hk01.com/di/media/images/dw/20260812/1164271029770522624348095.jpeg/0hZUiEfeaCR6GHuY4JqEgix62LL2p04G_7auPP-2rjw?v=w1280r16_9"],
["TikTok完成美資重組獲解禁","甲骨文等美資入主，白宮撤銷聯邦裝置禁令","星島","https://www.stheadline.com/realtime-china/3603557/","2026-08-12 13:29","2026-08-12 16:20","https://image.hkhl.hk/f/1200p0/0x0/100/none/780888a393f6fc2496cc7aa3c18b82cf/2026-08/20260812_NEWS_TikTok.png"],
["中國電動車月銷佔比首破六成","7月數據，汽車出口連續兩月破百萬輛","香港01","https://www.hk01.com/article/60379334","2026-08-12 18:00","2026-08-12 18:00","https://cdn.hk01.com/di/media/images/dw/20260812/1164255205257121792032546.jpeg/3FvTd2555xGMcd_LunGRuTelizmxIbrJ99wNy_fcDcs?v=w1280r16_9"]
],
us:[
["特朗普借FCC低調封殺中國產品","禁無人機路由器入口，中方五招反擊","香港01","https://www.hk01.com/article/60379125","2026-08-12 18:00","2026-08-12 18:00","https://cdn.hk01.com/di/media/images/dw/20260812/1164154678909341696850673.jpeg/pgh0SYFxl_ZSbJ3HwHZIflYGlHxsO2Hj4rcgZeK3IGU?v=w1280r16_9"],
["民主黨威州州長初選克勞利勝出","密爾瓦基郡長以0.4百分點險勝韓裔對手","世界日報","https://www.worldjournal.com/wj/story/121469/9687118","2026-08-12 15:48","2026-08-12 15:48","https://pgw.worldjournal.com/gw/photo.php?u=https://uc.udn.com.tw/photo/t3/2026/08/12/35223734.jpg&M=1&x=&y=&sw=&sh=&sl=W&fw=800&exp=3600"],
["美與40國警告未通報試射導彈","中國裁軍大使斥無端指責政治操弄","香港01","https://www.hk01.com/article/60379128","2026-08-12 10:03","2026-08-12 10:03","https://cdn.hk01.com/di/media/images/dw/20251227/1081515297304743936825431.jpeg/a-NoMFwvM8YX9n18UE2fyUii_wxrItcNeaUKA3mlCgM?v=w1280r16_9"]
],
tw:[
["陳玉軒宅搜出158公斤黃金鉅款","涉詐慈濟10.6億顧問費，贓款移贓物庫","ETtoday","https://www.ettoday.net/news/20260812/3217731.htm","2026-08-12 11:02","2026-08-12 11:02","https://cdn2.ettoday.net/images/8864/e8864722.jpg"],
["長崎原爆儀式矮化台灣代表缺席","座位遭排外交使節區外，矢板明夫批評","自由時報","https://news.ltn.com.tw/news/politics/breakingnews/5536621","2026-08-12 06:36","2026-08-12 06:36","https://img.ltn.com.tw/Upload/news/600/2026/08/12/phpcGd7jz.png"],
["找槍手代住院詐保狠撈2663萬","桃園3家族17人涉案，13保險公司受害","ETtoday","https://www.ettoday.net/news/20260812/3217724.htm","2026-08-12 10:50","2026-08-12 10:50","https://cdn2.ettoday.net/images/8871/e8871336.jpg"]
],
war:[
["美情報指伊朗重心轉霍爾木茲","評估指棄核計劃，軍方警告奪峽代價高昂","Al Arabiya","https://english.alarabiya.net/News/middle-east/2026/08/12/us-intelligence-says-iran-shifted-priority-from-nuclear-program-to-hormuz-report","2026-08-12 16:17","2026-08-12 16:24","https://vid.alarabiya.net/images/2026/08/06/c214604f-455f-4f21-b65e-0a89b06091a5/c214604f-455f-4f21-b65e-0a89b06091a5_16x9_600x338.JPG"],
["伊朗堅持海峽重開四條件","美須停戰解凍資產，巴國內長訪德黑蘭","半島電視台","https://www.aljazeera.com/news/2026/8/12/iran-holds-firm-on-hormuz-conditions-as-pakistans-naqvi-visits-tehran","2026-08-12 10:29","2026-08-12 10:29","https://www.aljazeera.com/wp-content/uploads/2026/08/afp_6a7b74a67381-1786475686.jpg?resize=1920%2C1440"],
["無人機襲伊庫爾德反對派營地","埃爾比勒附近三營地遇襲，暫無傷亡報告","Al Arabiya","https://english.alarabiya.net/News/middle-east/2026/08/12/four-drones-hit-iranian-kurdish-opposition-camps-near-iraq-s-erbil-sources-say","2026-08-12 15:45","2026-08-12 15:47","https://vid.alarabiya.net/images/2026/07/17/2de4798e-46b3-4730-a6ac-31393d8b5f6c/2de4798e-46b3-4730-a6ac-31393d8b5f6c_16x9_600x338.jpg"]
],
track:[
["🔥 美伊戰爭（2026）","談判拉鋸","美情報指伊朗戰略重心由核計劃轉移至霍爾木茲海峽；伊朗堅持重開海峽四條件，巴基斯坦內長訪德黑蘭；埃爾比勒伊朗庫爾德反對派營地遭無人機襲擊"],
["港·宏福苑大火獨立調查","修例諮詢展開","政府就建築物管理條例修訂展開一個月諮詢，擬設授權票上限、獲授權代表限親屬或屋苑業主，回應宏福苑圍標及授權票爭議；調查報告料十月下旬提交"],
["港·施政報告2026","9月16日發表","今日無新進展；最後進展（08-11）：星島大棋盤引消息指施政報告大機會9月16日發表"],
["港·颱風白海豚","制度檢討升溫","今日無新進展；最後進展（08-12早）：勞工處長承認暑熱警告制度有問號，天文台公開濕球黑球指數，工傷中暑保障成焦點"],
["港·尖沙咀酒吧血案","候訊還柙","今日無新進展；最後進展（08-09）：40歲無業男被控謀殺，再訊還柙候審"],
["港·新皇崗口岸開通","明日千人演練","運輸署聯同機電署測試落馬洲大橋交通監察系統及公共運輸交匯處，逾200人參與大致暢順，為8月13日千人演練作最後準備"],
["港·黎智英案","11月30日聆訊","今日無新進展；1.27億財產充公案11月30日高院聆訊，排期兩日"],
["台·統促黨違憲解散案","待憲法法庭","今日無新進展；最後進展（08-07）：內政部已正式向憲法法庭遞狀聲請解散統促黨"],
["港·露宿婆婆遭淋煙灰水","8月17日再訊","今日無新進展；29歲侍應被控兩項普通襲擊，8月17日再訊（KCCC2082/2026）"],
["港·東涌鐵騎士捲巴士車底亡","待開審日期","今日無新進展；最後進展（08-08）：龍運車長暫控危險駕駛引致他人死亡，待開審日期"],
["港·黃大仙上邨斬人案","傷者命危","今日無新進展；最後進展（08-09）：25歲男遭鄰居狂劈逾30刀命危留醫ICU，施襲者返家墮樓亡"],
["港·碧瑤灣斬人案","案件調查中","今日無新進展；最後進展（08-12早）：被捕人家中半歲貓證實有兩處傷口，手術後情況穩定"]
],
ai:{
upd:"2026-08-12",
img:"https://the-decoder.com/wp-content/uploads/2026/07/claude_logo_money.png",
t:"OpenAI推出網絡安全專用模型GPT-5.6-Cyber，為授權漏洞研究及滲透測試大幅放寬安全限制：高風險網絡任務完成率達95%，遠高於標準模型的1.5%，並新設「Daybreak Red」級別開放予Accenture、Cisco、Palo Alto Networks等夥伴。安全界警告此舉恐同時加快惡意分子開發攻擊工具。同日研究員披露，借助AI代理發現SharePoint未經驗證遠端執行漏洞（CVE-2026-55040，CVSS 9.1）。\nMeta去年12月收購中國AI代理初創Manus的交易正式拆局：北京年初立案調查並禁止外資入股，Meta放棄爭辯，Manus將於8月24日刪除收購後產生的用戶數據並恢復獨立營運，反映中方嚴防本土AI企業落入美企手中。\n此外，Anthropic與比特幣礦企Riot Platforms簽署20年、價值91億美元的數據中心協議，在德州取得191兆瓦電力，計及延長選項總值可達161億美元；另有報道指其一款未發佈模型在數學重大未解難題上取得進展。",
src:[["The Hacker News — OpenAI Launches GPT-5.6-Cyber with Reduced Safeguards for Exploit Development","https://thehackernews.com/2026/08/openai-launches-gpt-56-cyber-with.html"],["The Hacker News — Researchers Disclose AI-Assisted SharePoint Exploit Chain Reaching Unauthenticated RCE","https://thehackernews.com/2026/08/researchers-disclose-ai-assisted.html"],["The Register — Zuck's Chinese agentic prey escapes, will resume standalone ops","https://www.theregister.com/ai-and-ml/2026/08/12/zucks-chinese-agentic-prey-escapes-will-resume-standalone-ops/5286598"],["The Decoder — Anthropic signs $9.1 billion data center deal with Bitcoin miner Riot Platforms","https://the-decoder.com/anthropic-signs-9-1-billion-data-center-deal-with-bitcoin-miner-riot-platforms/"],["TechCrunch — An unreleased Anthropic model made progress on one of math's biggest unsolved problems","https://techcrunch.com/2026/08/11/an-unreleased-anthropic-model-made-progress-on-one-of-maths-biggest-unsolved-problems/"]]
},
warb:{
upd:"2026-08-12",
img:"https://vid.alarabiya.net/images/2026/08/06/c214604f-455f-4f21-b65e-0a89b06091a5/c214604f-455f-4f21-b65e-0a89b06091a5_16x9_600x338.JPG",
t:"NBC引述美軍情報評估指，伊朗在核設施遇襲受損後，已將戰略重心由核計劃轉移至控制霍爾木茲海峽；軍方內部警告若強行奪取海峽，行動將「漫長、代價高昂且致命」，特朗普政府則反駁海峽「完全在美國海軍掌控之下」。同時德黑蘭在談判中立場強硬，堅持解凍資產等條件，調解方稱協議仍有進展。\n戰線未止：伊拉克埃爾比勒附近的伊朗庫爾德反對派營地遭四架無人機襲擊；美軍向一艘駛往伊朗的巴拿馬旗「突破封鎖」貨船開火；紅海方面，巴基斯坦譴責胡塞襲擊商船致三名巴籍船員喪生，另有報道指革命衛隊軍官正督導胡塞升級軍事行動。\n《華爾街日報》再爆，以色列情報指伊朗擬以肩托導彈襲擊特朗普座機，特勤局7月北約峰會後在安卡拉安排他改乘C-32A軍機離境；巴基斯坦內政部長同日抵達德黑蘭商討地區安全。",
src:[["Al Arabiya English — US intelligence says Iran shifted priority from nuclear program to Hormuz: Report","https://english.alarabiya.net/News/middle-east/2026/08/12/us-intelligence-says-iran-shifted-priority-from-nuclear-program-to-hormuz-report"],["Al Arabiya English — Four drones hit Iranian Kurdish opposition camps near Iraq's Erbil, sources say","https://english.alarabiya.net/News/middle-east/2026/08/12/four-drones-hit-iranian-kurdish-opposition-camps-near-iraq-s-erbil-sources-say"],["Al Arabiya English — Pakistan condemns Houthi attack after three nationals killed aboard Red Sea vessel","https://english.alarabiya.net/News/middle-east/2026/08/12/pakistan-condemns-houthi-attack-after-three-nationals-killed-aboard-red-sea-vessel"],["Times of Israel — Israeli intel on Iranian plot said to have spurred decision to sneak Trump off Air Force One","https://www.timesofisrael.com/israeli-intel-on-iranian-plot-said-to-have-spurred-decision-to-sneak-trump-off-air-force-one/"],["Times of Israel — Iran digs in on demands over Hormuz as mediators assert progress made toward deal","https://www.timesofisrael.com/iran-digs-in-on-demands-over-hormuz-as-mediators-assert-progress-made-toward-deal/"],["Iran International — US fires on Iran-bound blockade runner as mediators say deal is close","https://www.iranintl.com/en/liveblog/202608084952"]]
},
_updated:"2026-08-12 18:50 HKT（晚報）"
};

DB[K].pm=pm;
const ordered={};
Object.keys(DB).sort().reverse().forEach(k=>ordered[k]=DB[k]);
const out="const DB = "+JSON.stringify(ordered)+";";
s=s.slice(0,start)+out+s.slice(end+2);
fs.writeFileSync("index.html",s);
// verify
const s2=fs.readFileSync("index.html","utf8");
const st2=s2.indexOf("const DB");const eq2=s2.indexOf("{",st2);
let d2=0,e2=-1;for(let i=eq2;i<s2.length;i++){const c=s2[i];if(c==="{")d2++;else if(c==="}"){d2--;if(d2===0){e2=i;break;}}}
const chk=JSON.parse(s2.slice(eq2,e2+1));
console.log("PARSE OK. pm counts:",["hks","hkl","hke","hkp","cn","us","tw","war"].map(g=>g+"="+chk["2026-08-12"].pm[g].length).join(" "),"track="+chk["2026-08-12"].pm.track.length,"ai len="+chk["2026-08-12"].pm.ai.t.length,"warb len="+chk["2026-08-12"].pm.warb.t.length);
console.log("am intact:",chk["2026-08-12"].am.hks.length===8);
