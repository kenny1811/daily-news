const fs=require("fs");
const db=JSON.parse(fs.readFileSync("/tmp/db.json","utf8"));
// 統一成 7 欄位: [標題,撮要,來源,url,發放,更新,圖]
for(const day of Object.keys(db)){
  for(const k of ["hk","cn","us","tw","war"]){
    if(!db[day][k]) continue;
    db[day][k]=db[day][k].map(it=>{ const a=[...it]; while(a.length<7)a.push(""); return a; });
  }
}
fs.writeFileSync("/tmp/db7.json",JSON.stringify(db));
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
  /* 左月曆 */
  .side{flex:0 0 240px;position:sticky;top:18px}
  .cal{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px}
  .cal .hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
  .cal .hd b{font-size:15px}
  .cal button.nav{background:#21262d;border:1px solid var(--border);color:var(--txt);border-radius:8px;width:30px;height:30px;font-size:15px;cursor:pointer}
  .cal button.nav:hover{background:#2d333b}
  .grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;text-align:center}
  .grid .wd{color:var(--muted);font-size:11px;padding:3px 0}
  .grid .day{padding:7px 0;border-radius:8px;font-size:13px;color:#586069}
  .grid .day.has{color:var(--txt);background:#1f2733;cursor:pointer;font-weight:600}
  .grid .day.has:hover{background:#2b3a4d}
  .grid .day.sel{background:var(--accent);color:#04101f;font-weight:700}
  .grid .day.today{outline:1px solid var(--accent)}
  .side .tip{color:var(--muted);font-size:11px;margin-top:10px;text-align:center}
  /* 右內容 */
  .main{flex:1;min-width:0}
  header{padding:0 2px 8px}
  header h1{font-size:22px;margin:0}
  header .date{color:var(--muted);font-size:13px;margin-top:2px}
  header .row2{display:flex;gap:14px;flex-wrap:wrap;margin-top:2px}
  header .win{color:var(--accent);font-size:12px}
  header .upd{color:var(--muted);font-size:12px}
  .sec{margin:18px 0 6px}
  .sec h2{font-size:16px;margin:0 0 12px;padding-left:10px;border-left:4px solid var(--accent);display:inline-block}
  .hk h2{border-color:var(--hk)}.cn h2{border-color:var(--cn)}.us h2{border-color:var(--us)}.tw h2{border-color:var(--tw)}.war h2{border-color:var(--war)}
  .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:14px}
  .card{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden;display:flex;flex-direction:column;text-decoration:none;color:inherit;transition:.15s}
  .card:hover{border-color:var(--accent);transform:translateY(-2px)}
  .thumb{aspect-ratio:16/9;width:100%;background:#0f1620;position:relative;overflow:hidden}
  .thumb img{width:100%;height:100%;object-fit:cover;display:block}
  .thumb.ph{display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1b2330,#141a24)}
  .thumb.ph span{color:#4a5768;font-size:13px;font-weight:600;letter-spacing:1px}
  .cbody{padding:11px 13px 13px;display:flex;flex-direction:column;gap:5px}
  .ctitle{font-weight:700;font-size:15.5px;line-height:1.35}
  .cmeta{color:#6e7b8a;font-size:11.5px}
  .cdesc{color:var(--muted);font-size:13.5px}
  .csrc{margin-top:2px;font-size:12px;color:var(--accent)}
  .csrc:after{content:" \\2197";font-size:10px}
  .war .card{border-color:#3d2020}
  .war .thumb.ph{background:linear-gradient(135deg,#2a1414,#1a0f0f)}
  /* 事件追蹤 */
  .track{background:#101418;border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-top:12px}
  .track h2{font-size:15px;margin:0 0 8px;padding-left:10px;border-left:4px solid #58a6ff}
  .trow{padding:7px 0;border-bottom:1px dashed var(--border)}
  .trow:last-child{border-bottom:none}
  .badge{display:inline-block;font-size:11px;padding:1px 8px;border-radius:20px;background:#21262d;color:var(--muted);margin-left:6px}
  .tnote{color:var(--muted);font-size:13px}
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
    <div class="tip">藍色日子＝有新聞，ㄢ一下睇返</div>
  </div>
  <div class="main">
    <header>
      <h1>📰 每日新聞</h1>
      <div class="date" id="curDate"></div>
      <div class="row2"><span class="win">涵蓋過去 24 小時內最新新聞</span><span class="upd" id="curUpd"></span></div>
    </header>
    <div id="news"></div>
    <footer>每日新聞 · 目錄頁</footer>
  </div>
</div>
<script>
${DBTEXT}
const SEC=[["hk","🇭🇰 香港 · 社會民生"],["cn","🇨🇳 中國大陸"],["us","🇺🇸 美國"],["tw","🇹🇼 台灣"],["war","🔥 專題 · 美伊戰爭（2026）"]];
const WD=["日","一","二","三","四","五","六"];
const pad=n=>String(n).padStart(2,"0");
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
function todayHK(){return new Date().toLocaleString("en-CA",{timeZone:"Asia/Hong_Kong",year:"numeric",month:"2-digit",day:"2-digit"}).slice(0,10);}
const TODAY=todayHK();
const keys=Object.keys(DB).sort();
let selDate=DB[TODAY]?TODAY:(keys[keys.length-1]||TODAY);
let viewY=+selDate.slice(0,4),viewM=+selDate.slice(5,7);
function card(it){
  const t=it[0],de=it[1],src=it[2],url=it[3],pub=it[4]||"",upd=it[5]||"",img=it[6]||"";
  const thumb=img?('<div class="thumb"><img loading="lazy" src="'+esc(img)+'" onerror="this.onerror=null;var p=this.parentNode;p.classList.add(\\'ph\\');p.innerHTML=\\'<span>'+esc(src)+'</span>\\'"></div>'):('<div class="thumb ph"><span>'+esc(src)+'</span></div>');
  const times='🕒 發放：'+esc(pub)+(upd?' ｜ 更新：'+esc(upd):'');
  return '<a class="card" href="'+esc(url)+'" target="_blank" rel="noopener">'+thumb+
    '<div class="cbody"><div class="ctitle">'+esc(t)+'</div><div class="cmeta">'+times+'</div><div class="cdesc">'+esc(de)+'</div><div class="csrc">'+esc(src)+'</div></div></a>';
}
function renderNews(dd){
  const box=document.getElementById("news");
  const data=DB[dd];
  const dt=new Date(dd+"T00:00:00");
  document.getElementById("curDate").textContent=dd.slice(0,4)+"年"+(+dd.slice(5,7))+"月"+(+dd.slice(8,10))+"日（週"+WD[dt.getDay()]+"）· 香港時間";
  document.getElementById("curUpd").textContent=data&&data._updated?("最後更新："+data._updated):"";
  if(!data){box.innerHTML='<div class="empty">呢日暫時未有新聞紀錄 🗒️</div>';return;}
  let h="";
  for(const [k,title] of SEC){
    const arr=data[k]||[];if(!arr.length)continue;
    h+='<div class="sec '+k+'"><h2>'+title+'</h2><div class="cards">'+arr.map(card).join("")+'</div></div>';
  }
  if((data.track||[]).length){
    h+='<div class="track"><h2>🧭 事件追蹤（持續更新）</h2>';
    for(const r of data.track){h+='<div class="trow"><b>'+esc(r[0])+'</b><span class="badge">'+esc(r[1])+'</span><div class="tnote">'+esc(r[2])+'</div></div>';}
    h+='</div>';
  }
  box.innerHTML=h;
}
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
function pick(dd){selDate=dd;viewY=+dd.slice(0,4);viewM=+dd.slice(5,7);renderCal();renderNews(dd);}
function shiftMonth(n){viewM+=n;if(viewM<1){viewM=12;viewY--}if(viewM>12){viewM=1;viewY++}renderCal();}
renderCal();renderNews(selDate);
</script>
</body>
</html>`;
fs.writeFileSync("index.html",page);
const s=page.match(/<script>([\s\S]*?)<\/script>/)[1];
require("vm").compileFunction(s);
console.log("built + inline JS OK; days:",Object.keys(db));
