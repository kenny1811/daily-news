const fs=require("fs");
const db=JSON.parse(fs.readFileSync("/tmp/db.json","utf8"));
const DBTEXT="const DB = "+JSON.stringify(db,null,2)+";";

const page=`<!DOCTYPE html>
<html lang="zh-HK">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>每日新聞 · 目錄</title>
<style>
  :root{--bg:#0d1117;--card:#161b22;--border:#242c38;--txt:#e6edf3;--muted:#8b949e;--accent:#58a6ff;--hk:#f0883e;--cn:#f85149;--us:#3fb950;--tw:#d2a8ff;--war:#ff7b72}
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  html,body{height:auto;overflow:visible}
  body{margin:0;background:var(--bg);color:var(--txt);font-family:-apple-system,"PingFang HK","Noto Sans HK","Microsoft JhengHei",sans-serif;line-height:1.6;font-size:16px}
  .wrap{display:flex;gap:16px;max-width:1080px;margin:0 auto;padding:16px 16px 140px;align-items:flex-start}
  .side{flex:0 0 300px;position:sticky;top:16px}
  .cal{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px}
  .cal .hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
  .cal .hd b{font-size:16px}
  .cal button.nav{background:#21262d;border:1px solid var(--border);color:var(--txt);border-radius:8px;width:32px;height:32px;font-size:16px;cursor:pointer}
  .cal button.nav:hover{background:#2d333b}
  .grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center}
  .grid .wd{color:var(--muted);font-size:12px;padding:4px 0}
  .grid .day{padding:8px 0;border-radius:8px;font-size:14px;color:#586069;cursor:default}
  .grid .day.has{color:var(--txt);background:#1f2733;cursor:pointer;font-weight:600}
  .grid .day.has:hover{background:#2b3a4d}
  .grid .day.sel{background:var(--accent);color:#04101f;font-weight:700}
  .grid .day.today{outline:1px solid var(--accent)}
  .side .tip{color:var(--muted);font-size:12px;margin-top:10px;text-align:center}
  .main{flex:1;min-width:0}
  header{padding:2px 2px 10px}
  header h1{font-size:20px;margin:0}
  header .date{color:var(--muted);font-size:13px;margin-top:2px}
  header .win{color:var(--accent);font-size:12px}
  header .upd{color:var(--muted);font-size:12px;margin-top:2px}
  section{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px 16px;margin:12px 0}
  h2{font-size:16px;margin:0 0 8px;padding-left:10px;border-left:4px solid var(--accent)}
  .hk h2{border-color:var(--hk)}.cn h2{border-color:var(--cn)}.us h2{border-color:var(--us)}.tw h2{border-color:var(--tw)}.war h2{border-color:var(--war)}
  .item{padding:8px 0;border-bottom:1px dashed var(--border)}
  .item:last-child{border-bottom:none}
  .item .t{font-weight:600}
  .item .meta{color:var(--muted);font-size:12px;margin-top:1px}
  .item .meta .pub{color:#6e7b8a}
  .item .d{color:var(--muted);font-size:14px;margin-top:2px}
  a.src{color:var(--accent);text-decoration:none;font-size:13px}
  a.src:after{content:" \\2197";font-size:11px}
  .war{border-color:#3d2020;background:#1a1010}
  .track{background:#101418}
  .track .row{padding:8px 0;border-bottom:1px dashed var(--border)}
  .track .row:last-child{border-bottom:none}
  .badge{display:inline-block;font-size:11px;padding:1px 8px;border-radius:20px;background:#21262d;color:var(--muted);margin-left:6px}
  .empty{color:var(--muted);text-align:center;padding:40px 10px}
  footer{color:var(--muted);font-size:12px;padding:14px 2px;text-align:center}
  @media(max-width:760px){.wrap{flex-direction:column}.side{flex:none;width:100%;position:static}}
</style>
</head>
<body>
<div class="wrap">
  <div class="side">
    <div class="cal">
      <div class="hd">
        <button class="nav" onclick="shiftMonth(-1)">‹</button>
        <b id="calTitle"></b>
        <button class="nav" onclick="shiftMonth(1)">›</button>
      </div>
      <div class="grid" id="calGrid"></div>
    </div>
    <div class="tip">藍色日子＝有新聞，ㄢ一下睇返</div>
  </div>
  <div class="main">
    <header>
      <h1>📰 每日新聞</h1>
      <div class="date" id="curDate"></div>
      <div class="win">涵蓋約 30 小時內最新新聞</div>
      <div class="upd" id="curUpd"></div>
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
function todayHK(){const s=new Date().toLocaleString("en-CA",{timeZone:"Asia/Hong_Kong",year:"numeric",month:"2-digit",day:"2-digit"});return s.slice(0,10);}
const TODAY=todayHK();
const keys=Object.keys(DB).sort();
let selDate=DB[TODAY]?TODAY:(keys[keys.length-1]||TODAY);
let viewY=+selDate.slice(0,4),viewM=+selDate.slice(5,7);
function renderNews(dd){
  const box=document.getElementById("news");
  const data=DB[dd];
  const dt=new Date(dd+"T00:00:00");
  document.getElementById("curDate").textContent=dd.slice(0,4)+"年"+(+dd.slice(5,7))+"月"+(+dd.slice(8,10))+"日（週"+WD[dt.getDay()]+"）· 香港時間";
  const upd=document.getElementById("curUpd");
  upd.textContent=data&&data._updated?("最後更新："+data._updated):"";
  if(!data){box.innerHTML='<div class="empty">呢日暗時未有新聞紀錄 🗒️</div>';return;}
  let h="";
  for(const [k,title] of SEC){
    const arr=data[k]||[];if(!arr.length)continue;
    h+='<section class="'+k+'"><h2>'+title+'</h2>';
    for(const it of arr){
      const t=it[0],de=it[1],src=it[2],url=it[3],pub=it[4]||"";
      h+='<div class="item"><div class="t">'+t+'</div>';
      h+='<div class="meta"><span class="pub">🕒 發放：'+pub+'</span></div>';
      h+='<div class="d">'+de+' · <a class="src" href="'+url+'" target="_blank" rel="noopener">'+src+'</a></div></div>';
    }
    h+='</section>';
  }
  if((data.track||[]).length){
    h+='<section class="track"><h2>🧭 事件追蹤（持續更新）</h2>';
    for(const r of data.track){h+='<div class="row"><b>'+r[0]+'</b><span class="badge">'+r[1]+'</span><br><span class="d" style="color:var(--muted);font-size:14px">'+r[2]+'</span></div>';}
    h+='</section>';
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
  for(let dnum=1;dnum<=days;dnum++){
    const key=viewY+"-"+pad(viewM)+"-"+pad(dnum);
    const cls=["day"];
    if(DB[key])cls.push("has");
    if(key===selDate)cls.push("sel");
    if(key===TODAY)cls.push("today");
    const click=DB[key]?" onclick=\\"pick('"+key+"')\\"":"";
    h+='<div class="'+cls.join(" ")+'"'+click+'>'+dnum+"</div>";
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
// validate
const back=eval("("+page.match(/const DB = ({[\s\S]*?});\n/)[1]+")");
console.log("index rebuilt; days:",Object.keys(back),"20/7 updated:",back["2026-07-20"]._updated);
