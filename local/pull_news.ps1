param([ValidateSet('am','pm')][string]$Edition='am',[switch]$OpenChrome)
# Daily News local pull - downloads latest index.html from GitHub raw
$ErrorActionPreference='Stop'
[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12
$dir=Split-Path -Parent $MyInvocation.MyCommand.Path
$log=Join-Path $dir 'pull_log.txt'
function Log($m){("{0} {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'),$m)|Add-Content -Path $log -Encoding UTF8}
if((Test-Path $log) -and ((Get-Item $log).Length -gt 200KB)){Remove-Item $log -Force}

$base='https://raw.githubusercontent.com/kenny1811/daily-news/main'
$today=Get-Date -Format 'yyyy-MM-dd'
$tmp=Join-Path $dir 'index.new.html'
$dest=Join-Path $dir 'index.html'
$ok=$false; $got=$false

# retry up to 10 times, 3 min apart, until today's edition is in the file
for($i=1;$i -le 10;$i++){
  try{
    Invoke-WebRequest -Uri "$base/index.html" -OutFile $tmp -UseBasicParsing -TimeoutSec 60
    $got=$true
    $c=[IO.File]::ReadAllText($tmp,[Text.Encoding]::UTF8)
    if($Edition -eq 'am'){
      $fresh=($c -match ('"'+[regex]::Escape($today)+'":'))          # DB has today's key
    }else{
      $fresh=($c -match ('"_updated":"'+[regex]::Escape($today)+' (1[5-9]|2[0-3]):'))  # evening _updated
    }
    if($fresh){$ok=$true;break}
    Log ("try {0}: downloaded, but {1} edition for {2} not published yet" -f $i,$Edition,$today)
  }catch{
    Log ("try {0}: download failed - {1}" -f $i,$_.Exception.Message)
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
  if(!(Test-Path $p)){ try{ Invoke-WebRequest -Uri "$base/$f" -OutFile $p -UseBasicParsing -TimeoutSec 30 }catch{} }
}

if($OpenChrome){
  try{ Start-Process 'chrome.exe' 'http://localhost:8080/' }
  catch{ Start-Process 'http://localhost:8080/' }
}
