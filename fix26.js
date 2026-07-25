const fs=require("fs");
const html=fs.readFileSync("index.html","utf8");
const db=eval("("+html.match(/const DB = ({[\s\S]*?});\n/)[1]+")");
const P="https://cdn.hk01.com/di/media/images/dw/";
const U=id=>"https://www.hk01.com/article/"+id;
const d=db["2026-07-26"];
d.hks=[
["天后老婦橫過馬路 南亞漢截車護送","網民讚有心，籲體諒長者或有認知問題","香港01",U("60373670"),"2026-07-26 04:21","2026-07-26 07:15",P+"20260726/1157903546318852096358921.jpeg/kpBHBfFI88xwezA-l9Rjkhnk3KWBBYb49WWtafVlrWk?v=w1280r16_9"],
["尖沙咀樓上吧男子被圍毆昏迷","打風期間消遣生事，警追緝6男女","香港01",U("60373667"),"2026-07-26 02:33","2026-07-26 07:31",P+"20260726/1157875690960326656296548.jpeg/txoePF6BxW6dGoF3Uihzz9IzYI_xqyM4WU_99WNP_fU?v=w1280r16_9"],
["赤鱲角電單車越線撞冧路牌 鐵騎士不治","疑失控撞路牌，昏迷送院搶救死亡","香港01",U("60373633"),"2026-07-25 20:54","2026-07-26 01:37",P+"20260725/1157816198868504576579086.jpeg/CmzO8VViSp1ZJ2Tq7i08PQwI6FKGauZaiEhJdIhISXQ"],
["青衣城漢持鋸追趕男子","事前疑港鐵站口角結怨，途人閃避","香港01",U("60373625"),"2026-07-25 20:53","2026-07-25 21:42",P+"20260725/1157803271390236672812647.jpeg/Xwldec_8wDH7dPJzRH2g5jaL7SJ7XexJEvnPrRL5z60"]
];
d.hkl=[
["紅霞直播｜天文台改發8號風球","至少維持至中午12時，各區現場直擊","香港01",U("60373069"),"2026-07-26 06:28","2026-07-26 07:20",P+"20260726/1157952956264353792296351.jpeg/db2M1ownWPxWXtANbLBZzV_OgpAhoOR0ldfXe5XX13s"],
["9號風球改掛8號 動漫節開唔開？","一文看惡劣天氣下各項活動安排","香港01",U("60373666"),"2026-07-26 07:16","",P+"20260723/1157067857063186432405829.jpeg/fmS9S8GBXJV_CX9ePFcbNme65KFBMGxhGkYRbj9GEW4?v=w1280r16_9"],
["港鐵：露天路段需較長時間恢復全綫","風球下交通消息，巴士渡輪陸續復開","香港01",U("60373524"),"2026-07-26 06:29","2026-07-26 07:31",P+"20260725/1157679103512416256589234.jpeg/AjYp4RpgDcs5ZKpuMGE6m_KZIjIX6pE7XVAlWV1QJVk"],
["醫管局轄下診所暫停服務","急症室維持正常，門診改期另行通知","香港01",U("60373583"),"2026-07-26 06:07","2026-07-26 07:35",P+"20260726/1157925293030117376279608.jpeg/NoDl4Zc-0i_uTsPWRgdCwyeO3tpbVhJkNL-5PTS_uT0?v=w1280r16_9"],
["水浸黑點杏花邨擺防水閘堆沙包","居民無懼水災再現，商戶落閘防患","香港01",U("60373637"),"2026-07-25 21:20","",P+"20260725/1157790608207646720692350.jpeg/-C82k_WEIiAwLD6cNDshmq9c956dHmD2yfnVUsn51VI?v=w1280r16_9"],
["港燈8月每度電收57.3仙 升36%","燃料調整費急升，半數住戶獲8仙補助","香港01",U("60373659"),"2026-07-25 23:39","2026-07-25 23:53",P+"20260522/1134551447090761728324867.jpeg/JOL2DatUkRAPKQzuemQJxjZc7s_XK12WrTNoxa0zaMU?v=w1280r16_9"],
["九號風球下 港鐵多站服務暫停","城巴B7、S1及龍運線恢復有限度服務","星島","https://www.stheadline.com/society/3597441/","2026-07-25 13:51","","https://image.hkhl.hk/f/1200p0/0x0/100/none/b40492b832be74de58a488b531f3c6a5/2026-07/808604860445110354.png"],
["機場多班航班取消延誤","國泰櫃位大排長龍，旅客滯留機場","星島","https://www.stheadline.com/society/3597564/","2026-07-25 20:23","","https://image.hkhl.hk/f/1200p0/0x0/lr/sthl_square/34a3fa37c0ceb7a29f7c94df2e5d2cd8/2026-07/KakaoTalk_20260725_201458512_05.jpg"]
];
d.hkp=[
["夏寶龍與議員長談5小時","明言立法會非人大，90席不算多","香港01",U("60373614"),"2026-07-25 20:04","2026-07-25 23:16",P+"20260725/1157797716110086144248670.jpeg/SUfC64z6RyBujzAytYeJSekwjjS2LeTWztTaQM7U2kA"],
["李慧琼：北京研修收穫滿滿","稱閉環管理屬慣例，非特殊安排","香港01",U("60373520"),"2026-07-25 16:00","",P+"20260725/1157702495036772352520798.jpeg/y1tJVu_M1Fpcq734Qk6lsndVDSXtp3D_zDSVlsw0lZY?v=w1280r16_9"]
];
d._updated="[26/07/2026 Sun 08:12]（人手重整：補回插圖、修正發放時間、補政治組）";
const out=html.replace(/const DB = {[\s\S]*?};\n/,"const DB = "+JSON.stringify(db,null,1)+";\n");
fs.writeFileSync("index.html",out);
require("vm").compileFunction(out.match(/<script>([\s\S]*?)<\/script>/)[1]);
fs.copyFileSync("index.html","archive/20260726.html");
for(const k of ["hks","hkl","hke","hkp","cn","us","tw","war"]) console.log(k,d[k].length,"缺圖",d[k].filter(x=>!x[6]).length,"缺時間",d[k].filter(x=>!x[4]).length);
