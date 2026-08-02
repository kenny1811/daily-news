const fs=require('fs');
let html=fs.readFileSync('index.html','utf8');

// 圖片防盜連：唔好送 Referer；同時 decode 路徑上被 encode 咗嘅斜線
const oldLine = '<div class="thumb"><img loading="lazy" src="\'+esc(img)+\'"';
const newLine = '<div class="thumb"><img loading="lazy" referrerpolicy="no-referrer" crossorigin="anonymous" src="\'+esc(imgFix(img))+\'"';
if(html.indexOf(oldLine)<0) throw new Error('搵唔到 img 標籤');
html = html.replace(oldLine, newLine);

// 加 imgFix() helper（路徑上嘅 %2F 解碼返做 /，query string 唔郁）
const anchor='function card(it){';
html = html.replace(anchor,
'function imgFix(u){if(!u)return u;var i=u.indexOf("?"),p=i<0?u:u.slice(0,i),q=i<0?"":u.slice(i);return p.replace(/%2F/gi,"/").replace(/%3A/gi,":")+q;}\n'+anchor);

fs.writeFileSync('index.html',html);
console.log('referrerpolicy:',/referrerpolicy="no-referrer"/.test(html),'| imgFix:',/function imgFix/.test(html));

// 同步改埋所有 archive 快照嘅站名
const dir='archive';
fs.readdirSync(dir).filter(f=>f.endsWith('.html')).forEach(f=>{
  const p=dir+'/'+f; let a=fs.readFileSync(p,'utf8');
  const b=a.replace('<title>每日新聞 · 目錄</title>','<title>門前直樹每日新聞 · 目錄</title>')
           .replace('<footer>每日新聞 · 目錄頁</footer>','<footer>門前直樹每日新聞 · 目錄頁</footer>')
           .replace('<h1>📰 每日新聞</h1>','<h1>📰 門前直樹每日新聞</h1>');
  if(a!==b){fs.writeFileSync(p,b);console.log('改名:',f);}
});
