param([ValidateSet('am','pm')][string]$Edition='am',[switch]$OpenChrome)
# Daily News local pull - downloads latest index.html from the GitHub API (authenticated).
# Why the API and not raw.githubusercontent.com: raw's quota is counted PER IP and is shared
# by everyone on the same NordVPN exit node, so it returns 429 Too Many Requests at random
# (this killed the 2026-08-17 pm pull: 10/10 tries got 429). The API counts quota PER TOKEN
# (5000/hr), so a shared exit IP can no longer starve us.
# The token is read from token.txt in this folder. token.txt is NEVER stored in the repo.
$ErrorActionPreference='Stop'
[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12
$dir=Split-Path -Parent $MyInvocation.MyCommand.Path
$log=Join-Path $dir 'pull_log.txt'
function Log($m){("{0} {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'),$m)|Add-Content -Path $log -Encoding UTF8}
if((Test-Path $log) -and ((Get-Item $log).Length -gt 200KB)){Remove-Item $log -Force}

$tokFile=Join-Path $dir 'token.txt'
if(!(Test-Path $tokFile)){Log 'FATAL: token.txt not found - cannot download'; exit 1}
$tok=((Get-Content $tokFile -Raw) -replace '\s','')
if($tok.Length -lt 20){Log 'FATAL: token.txt looks empty or malformed'; exit 1}
$hdr=@{
  Authorization="Bearer $tok"
  Accept='application/vnd.github.raw'
  'User-Agent'='daily-news-pull'
  'X-GitHub-Api-Version'='2022-11-28'
}
$api='https://api.github.com/repos/kenny1811/daily-news/contents'

$today=Get-Date -Format 'yyyy-MM-dd'
$tmp=Join-Path $dir 'index.new.html'
$dest=Join-Path $dir 'index.html'
$ok=$false; $got=$false

# retry up to 10 times, 3 min apart, until today's edition is in the file
for($i=1;$i -le 10;$i++){
  try{
    Invoke-WebRequest -Uri "$api/index.html?ref=main" -Headers $hdr -OutFile $tmp -UseBasicParsing -TimeoutSec 60
    $got=$true
    $c=[IO.File]::ReadAllText($tmp,[Text.Encoding]::UTF8)
    if($Edition -eq 'am'){
      $fresh=($c -match ('"'+[regex]::Escape($today)+'"\s*:'))          # DB has today's key
    }else{
      $fresh=($c -match ('"_updated"\s*:\s*"'+[regex]::Escape($today)+' (1[5-9]|2[0-3]):'))  # evening _updated (tolerate spaces around colon)
    }
    if($fresh){$ok=$true;break}
    Log ("try {0}: downloaded, but {1} edition for {2} not published yet" -f $i,$Edition,$today)
  }catch{
    $sc=''
    try{ if($_.Exception.Response){$sc=[int]$_.Exception.Response.StatusCode} }catch{}
    Log ("try {0}: download failed (HTTP {1}) - {2}" -f $i,$sc,$_.Exception.Message)
  }
  if($i -lt 10){Start-Sleep -Seconds 180}
}

if($got){
  Copy-Item $tmp $dest -Force
  $arc=Join-Path $dir 'archive'
  if(!(Test-Path $arc)){New-Item -ItemType Directory -Path $arc | Out-Null}
  Copy-Item $tmp (Join-Path $arc ((Get-Date -Format 'yyyyMMdd')+'.html')) -Force
  Log ("installed index.html (todays {0} edition present: {1})" -f $Edition,$ok)
}else{
  Log 'all downloads failed, keeping previous index.html'
}

# favicons: download once if missing
foreach($f in 'favicon.svg','favicon.ico','favicon-32.png','favicon-16.png','apple-touch-icon.png'){
  $p=Join-Path $dir $f
  if(!(Test-Path $p)){ try{ Invoke-WebRequest -Uri ("$api/"+$f+'?ref=main') -Headers $hdr -OutFile $p -UseBasicParsing -TimeoutSec 30 }catch{} }
}

if($OpenChrome){
  # shell-open via the default browser association - behaves exactly like clicking a link,
  # so it lands in your normal Chrome session (direct chrome.exe launch can pick the wrong profile)
  Start-Process 'http://localhost:8080/'
}
