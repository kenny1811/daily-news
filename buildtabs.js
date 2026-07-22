const fs=require("fs");
const db=JSON.parse(fs.readFileSync("/tmp/db.json","utf8"));
const B="https://cdn.hk01.com/di/media/images/dw/";

// ==== 加兩個簡報入 2026-07-21 ====
db["2026-07-21"].ai={
 upd:"2026-07-21",
 img:"https://assets.seobotai.com/cdn-cgi/image/quality=75,w=1536,h=1024/aiapps.com/6a503dec21d1dee3314b9573-1783647664321.jpg",
 t:"三大 AI 廠七月動向速覽：\n【Claude · Anthropic】Claude Fable 5 於 7 月 1 日全球復開放（早前因出口管制暫停 19 日），定位高於 Opus，主打複雜推理與策略；7 月 7 日推出 Claude Cowork，可喺背景自動處理 email、日曆、檔案，離線都繼續行。\n【ChatGPT · OpenAI】7 月 9 日發表 GPT-5.6，一次三款——Sol（頂級推理）、Terra（GPT-5.5 質素、半價）、Luna（快而平）；同日推 ChatGPT Work，結合 Codex 讓非技術用戶整文件、試算表、簡報同網頁 app；全雙工語音 GPT-Live（邊聽邊講、即時翻譯）成為預設語音模型，每週 1.5 億語音用戶。\n【Gemini · Google】Managed Agents 擴展支援背景任務、遠端 MCP、憑證自動更新，做到長時間工作流程；7 月 8 日 Video Remix 開放予 Plus／Pro／Ultra，可改 10 秒短片、重打燈光加特效。\n一句總結：三大廠齊齊由「答問題嘅 chatbot」推向「幫你做嘢嘅 agent」——背景執行、即時語音、自動化工作流程成為新戰場。",
 src:[["AIapps · 7月匯總","https://www.aiapps.com/blog/july-ai-mega-update-major-breakthroughs-launches/"],["LLM-Stats · 模型更新","https://llm-stats.com/llm-updates"]]
};
db["2026-07-21"].warb={
 upd:"2026-07-21",
 img:"https://www.aljazeera.com/wp-content/uploads/2026/07/afp_6a5e5edc0d38-1784569564.jpg?resize=1920%2C1440",
 t:"美伊戰爭持續升級。美軍連日空襲伊朗軍事目標（截至 7 月 21 日已約第 10 晚），美軍中央司令部（CENTCOM）稱行動旨在保護商船航運。伊朗外長阿拉格奇強硬表態「唔會被威脅或逼降」；革命衛隊聲稱擊中美軍駐科威特基地嘅雷達同防空系統，並向科威特、約旦嘅美軍基地及霍爾木茲海峽附近油輪發動導彈襲擊。\n多艘船受損：一船喺阿曼對開中彈後棄船，另一船喺阿聯酋外海受創（船員報平安），伊朗亦公開燃燒中油輪嘅片段。美方公布咗兩名喺約旦基地陣亡嘅美軍名單——係開戰以來首次有駐區美軍死亡。\n特朗普放狠話威脅擴大打擊，包括伊朗核設施；科威特同約旦話成功攔截來襲導彈同無人機。調停方仍努力挽救停火，但戰火未見降溫，霍爾木茲海峽航運同油價風險持續。",
 src:[["Al Jazeera · 戰事直播","https://www.aljazeera.com/news/liveblog/2026/7/21/iran-war-live-us-launches-10th-night-of-strikes-tehran-attacks-kuwait"],["The National","https://www.thenationalnews.com/news/mena/2026/07/21/live-us-iran-strikes-kuwait-jordan/"]]
};

const DBTEXT="const DB = "+JSON.stringify(db,null,1)+";";

const page=`<!DOCTYPE html>
<html lang="zh-HK">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>每日新聞 · 目錄</title>
<style>
  :root{--bg:#0d1117;--card:#161b22;--border:#242c38;--txt:#e6edf3;--muted:#8b949e;--accent:#58a6ff;--hk:#f0883e;--cn:#f85149;--us:#3fb950;--tw:#d2a8ff;--war:#ff7b72}
  *{box-sizing:border-box}
  html,body{height:auto}
  body{margin:0;background:var(--bg);color:var(--txt);font-family:-apple-system,"PingFang HK","Noto Sans HK","Microsoft JhengHei",sans-serif;line-height:1.55;font-size:15px}
  .wrap{display:flex;gap:20px;max-width:1720px;margin:0 auto;padding:18px 22px 120px;align-items:flex-start}
  .side{flex:0 0 240px;position:sticky;top:18px}
  .cal{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px}
  .cal .hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
  .cal .hd b{font-size:15px}
  .cal button.nav{background:#21262d;border:1px solid var(--border);color:var(--txt);border-radius:8px;width:30px;height:30px;font-size:15px;cursor:pointer}
  .grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;text-align:center}
  .grid .wd{color:var(--muted);font-size:11px;padding:3px 0}
  .grid .day{padding:7px 0;border-radius:8px;font-size:13px;color:#586069}
  .grid .day.has{color:var(--txt);background:#1f2733;cursor:pointer;font-weight:600}
  .grid .day.has:hover{background:#2b3a4d}
  .grid .day.sel{background:var(--accent);color:#04101f;font-weight:700}
  .grid .day.today{outline:1px solid var(--accent)}
  .side .tip{color:var(--muted);font-size:11px;margin-top:10px;text-align:center}
  .main{flex:1;min-width:0}
  .tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
  .tab{padding:8px 15px;border-radius:10px;background:var(--card);border:1px solid var(--border);color:var(--muted);cursor:pointer;font-size:14px;font-weight:600}
  .tab:hover{background:#1f2733}
  .tab.on{background:#1f2733;color:var(--txt);border-color:var(--accent)}
  header{padding:0 2px 8px}
  header h1{font-size:20px;margin:0}
  header .date{color:var(--muted);font-size:13px;margin-top:2px}
  header .row2{display:flex;gap:14px;flex-wrap:wrap;margin-top:2px}
  header .win{color:var(--accent);font-size:12px}
  header .upd{color:var(--muted);font-size:12px}
  .sec{margin:18px 0 6px}
  .sec h2{font-size:16px;margin:0 0 12px;padding-left:10px;border-left:4px solid var(--accent);display:inline-block}
  .hk h2{border-color:var(--hk)}.hks h2{border-color:#f0883e}.hkl h2{border-color:#2dd4bf}.hke h2{border-color:#3fb950}.hkp h2{border-color:#d2a8ff}.cn h2{border-color:var(--cn)}.us h2{border-color:var(--us)}.tw h2{border-color:var(--tw)}.war h2{border-color:var(--war)}
  .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px}
  .card{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden;display:flex;flex-direction:column;text-decoration:none;color:inherit}
  .card:hover{border-color:var(--accent)}
  .thumb{aspect-ratio:16/9;background:#0f1620;overflow:hidden}
  .thumb img{width:100%;height:100%;object-fit:cover;display:block}
  .thumb.ph{display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1b2330,#141a24)}
  .thumb.ph span{color:#4a5768;font-size:12px;font-weight:600}
  .cbody{padding:9px 11px 11px;display:flex;flex-direction:column;gap:4px}
  .ctitle{font-weight:700;font-size:14px;line-height:1.32}
  .cmeta{color:#6e7b8a;font-size:11px}
  .cdesc{color:var(--muted);font-size:12.5px}
  .csrc{margin-top:2px;font-size:12px;color:var(--accent)}
  .csrc:after{content:" \\2197";font-size:10px}
  .war .card{border-color:#3d2020}
  .track{background:#101418;border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-top:12px}
  .track h2{font-size:15px;margin:0 0 8px;padding-left:10px;border-left:4px solid #58a6ff}
  .trow{padding:7px 0;border-bottom:1px dashed var(--border)}.trow:last-child{border-bottom:none}
  .badge{display:inline-block;font-size:11px;padding:1px 8px;border-radius:20px;background:#21262d;color:var(--muted);margin-left:6px}
  .tnote{color:var(--muted);font-size:13px}
  /* 簡報 tab */
  .brief{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;max-width:860px}
  .brief .bimg{width:100%;max-height:340px;object-fit:cover;display:block;background:#0f1620}
  .brief .bhd{padding:14px 20px 0}
  .brief h2{font-size:19px;margin:0}
  .brief .bupd{color:var(--muted);font-size:12px;margin-top:3px}
  .brief .btxt{padding:10px 20px 4px;font-size:15px;line-height:1.8}
  .brief .btxt p{margin:0 0 12px}
  .brief .bsrc{padding:4px 20px 18px;font-size:13px;color:var(--muted)}
  .brief .bsrc a{color:var(--accent);text-decoration:none;margin-right:14px}
  .brief .bsrc a:after{content:" \\2197";font-size:10px}
  .empty{color:var(--muted);text-align:center;padding:50px 10px}
  footer{color:var(--muted);font-size:12px;padding:16px 2px;text-align:center}
  @media(max-width:900px){.wrap{flex-direction:column}.side{flex:none;width:100%;position:static}}
</style>
</head>
<body>
<div class="wrap">
  <div class="side">
    <div class="cal">
      <div class="hd"><button class="nav" onclick="shiftMonth(-1)">‹</button><b id="calTitle"></b><button class="nav" onclick="shiftMonth(1)">›</button></div>
      <div class="grid" id="calGrid"></div>
    </div>
    <div class="tip">藍色日子＝有內容，ㄢ一下睇返</div>
  </div>
  <div class="main">
    <div class="tabs">
      <div class="tab" id="tab-news" onclick="setTab('news')">📰 每日新聞</div>
      <div class="tab" id="tab-ai" onclick="setTab('ai')">🤖 AI 動向</div>
      <div class="tab" id="tab-war" onclick="setTab('war')">🔥 美伊戰爭</div>
    </div>
    <div id="panel"></div>
    <footer>每日新聞 · 目錄頁</footer>
  </div>
</div>
<script>
${DBTEXT}
const SEC=[["hk","🇭🇰 香港"],["hks","🇭🇰 香港 · 社會"],["hkl","🇭🇰 香港 · 民生"],["hke","🇭🇰 香港 · 經濟"],["hkp","🇭🇰 香港 · 政治"],["cn","🇨🇳 中國大陸"],["us","🇺🇸 美國"],["tw","🇹🇼 台灣"],["war","🔥 專題 · 美伊戰爭（2026）"]];
const WD=["日","一","二","三","四","五","六"];
const pad=n=>String(n).padStart(2,"0");
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
function todayHK(){return new Date().toLocaleString("en-CA",{timeZone:"Asia/Hong_Kong",year:"numeric",month:"2-digit",day:"2-digit"}).slice(0,10);}
const TODAY=todayHK();
const keys=Object.keys(DB).sort();
let selDate=DB[TODAY]?TODAY:(keys[keys.length-1]||TODAY);
let viewY=+selDate.slice(0,4),viewM=+selDate.slice(5,7);
let curTab="news";
function card(it){
  const t=it[0],de=it[1],src=it[2],url=it[3],pub=it[4]||"",upd=it[5]||"",img=it[6]||"";
  const thumb=img?('<div class="thumb"><img loading="lazy" src="'+esc(img)+'" onerror="this.onerror=null;var p=this.parentNode;p.classList.add(\\'ph\\');p.innerHTML=\\'<span>'+esc(src)+'</span>\\'"></div>'):('<div class="thumb ph"><span>'+esc(src)+'</span></div>');
  const times='🕒 發放：'+esc(pub)+(upd?' ｜ 更新：'+esc(upd):'');
  return '<a class="card" href="'+esc(url)+'" target="_blank" rel="noopener">'+thumb+'<div class="cbody"><div class="ctitle">'+esc(t)+'</div><div class="cmeta">'+times+'</div><div class="cdesc">'+esc(de)+'</div><div class="csrc">'+esc(src)+'</div></div></a>';
}
function renderNews(dd){
  const data=DB[dd];
  let h="";
  if(!data){document.getElementById("panel").innerHTML='<div class="empty">呢日暫時未有新聞紀錄 🗒️</div>';return;}
  const dt=new Date(dd+"T00:00:00");
  h+='<header><h1>📰 每日新聞</h1><div class="date">'+dd.slice(0,4)+"年"+(+dd.slice(5,7))+"月"+(+dd.slice(8,10))+"日（週"+WD[dt.getDay()]+"）· 香港時間</div>";
  h+='<div class="row2"><span class="win">涵蓋過去 24 小時內最新新聞</span>'+(data._updated?'<span class="upd">最後更新：'+esc(data._updated)+'</span>':'')+'</div></header>';
  for(const [k,title] of SEC){
    const arr=data[k]||[];if(!arr.length)continue;
    h+='<div class="sec '+k+'"><h2>'+title+'</h2><div class="cards">'+arr.map(card).join("")+'</div></div>';
  }
  if((data.track||[]).length){
    h+='<div class="track"><h2>🧭 事件追蹤（持續更新）</h2>';
    for(const r of data.track){h+='<div class="trow"><b>'+esc(r[0])+'</b><span class="badge">'+esc(r[1])+'</span><div class="tnote">'+esc(r[2])+'</div></div>';}
    h+='</div>';
  }
  document.getElementById("panel").innerHTML=h;
}
function renderBrief(key,label){
  let d=selDate, data=DB[selDate]&&DB[selDate][key];
  if(!data){ const ks=Object.keys(DB).filter(x=>DB[x]&&DB[x][key]).sort(); if(ks.length){d=ks[ks.length-1];data=DB[d][key];} }
  const box=document.getElementById("panel");
  if(!data){ box.innerHTML='<div class="empty">呢日未有'+esc(label)+'簡報 🗒️</div>'; return; }
  const paras=String(data.t).split("\\n").filter(x=>x.trim()).map(p=>'<p>'+esc(p)+'</p>').join("");
  const img=data.img?'<img class="bimg" src="'+esc(data.img)+'" onerror="this.style.display=\\'none\\'">':'';
  const srcs=(data.src||[]).map(s=>'<a href="'+esc(s[1])+'" target="_blank" rel="noopener">'+esc(s[0])+'</a>').join("");
  box.innerHTML='<div class="brief">'+img+'<div class="bhd"><h2>'+esc(label)+'</h2><div class="bupd">更新：'+esc(data.upd||d)+'　·　約 300 字簡報</div></div><div class="btxt">'+paras+'</div><div class="bsrc">來源：'+srcs+'</div></div>';
}
function renderPanel(){
  document.getElementById("tab-news").classList.toggle("on",curTab==="news");
  document.getElementById("tab-ai").classList.toggle("on",curTab==="ai");
  document.getElementById("tab-war").classList.toggle("on",curTab==="war");
  if(curTab==="news") renderNews(selDate);
  else if(curTab==="ai") renderBrief("ai","🤖 AI 動向（Claude／ChatGPT／Gemini）");
  else renderBrief("warb","🔥 美伊戰爭最新情況");
}
function setTab(t){curTab=t;renderPanel();window.scrollTo(0,0);}
function renderCal(){
  document.getElementById("calTitle").textContent=viewY+"年"+viewM+"月";
  const grid=document.getElementById("calGrid");
  let h=WD.map(w=>'<div class="wd">'+w+'</div>').join("");
  const first=new Date(viewY,viewM-1,1).getDay();
  const days=new Date(viewY,viewM,0).getDate();
  for(let i=0;i<first;i++)h+="<div></div>";
  for(let dn=1;dn<=days;dn++){
    const key=viewY+"-"+pad(viewM)+"-"+pad(dn);
    const cls=["day"];if(DB[key])cls.push("has");if(key===selDate)cls.push("sel");if(key===TODAY)cls.push("today");
    const click=DB[key]?" onclick=\\"pick('"+key+"')\\"":"";
    h+='<div class="'+cls.join(" ")+'"'+click+'>'+dn+"</div>";
  }
  grid.innerHTML=h;
}
function pick(dd){selDate=dd;viewY=+dd.slice(0,4);viewM=+dd.slice(5,7);renderCal();renderPanel();}
function shiftMonth(n){viewM+=n;if(viewM<1){viewM=12;viewY--}if(viewM>12){viewM=1;viewY++}renderCal();}
renderCal();renderPanel();
</script>
</body>
</html>`;
fs.writeFileSync("index.html",page);
const s=page.match(/<script>([\s\S]*?)<\/script>/)[1];
require("vm").compileFunction(s);
console.log("built + inline JS OK; ai/warb added:", "ai" in db["2026-07-21"], "warb" in db["2026-07-21"]);
