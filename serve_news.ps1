# Daily News local server v3 - self-healing HttpListener on port 8080
# 2026-09-21 hardening: whitelist-only file serving (index.html + root icons + /api/settings, everything else 404),
#   Test-Path -LiteralPath, strict /api/settings POST schema (object with amView/pmView as HH:MM only),
#   sync_open_times spawn throttled to once per minute, server_log.txt rotated by line count (>500 -> keep last 250).
# 2026-09-21 DB split: index.html no longer embeds the whole news DB; it fetches data/index.json + data/YYYY-MM-DD.json
#   at runtime, so the whitelist also allows exactly those two shapes under data/ (nothing else in that folder).
# Usage: serve_news.ps1 [-Port 8080] [-BindHost +]   (smoke test on another port: -Port 8099 -BindHost localhost)
param([int]$Port=8080,[string]$BindHost='+')
$ErrorActionPreference='Continue'
$dir=Split-Path -Parent $MyInvocation.MyCommand.Path
$log=Join-Path $dir 'server_log.txt'
$script:logN=0
function RotateLog{
  try{
    if(Test-Path -LiteralPath $log){
      $lines=@(Get-Content -LiteralPath $log -Encoding UTF8)
      if($lines.Count -gt 500){ $lines[($lines.Count-250)..($lines.Count-1)] | Set-Content -LiteralPath $log -Encoding UTF8 }
    }
  }catch{}
}
function Log($m){
  ("{0} {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'),$m)|Add-Content -LiteralPath $log -Encoding UTF8
  $script:logN++; if(($script:logN % 20) -eq 0){ RotateLog }
}
function SendBytes($res,[int]$code,[string]$ct,[byte[]]$bytes){
  $res.StatusCode=$code
  $res.ContentType=$ct
  $res.Headers.Add('Cache-Control','no-cache')
  $res.ContentLength64=$bytes.Length
  $res.OutputStream.Write($bytes,0,$bytes.Length)
  $res.Close()
}
function SendJson($res,[int]$code,[string]$json){ SendBytes $res $code 'application/json; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes($json)) }
function Send404($res){ SendBytes $res 404 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('404')) }

RotateLog
$mime=@{'.html'='text/html; charset=utf-8';'.png'='image/png';'.ico'='image/x-icon';'.svg'='image/svg+xml';'.json'='application/json; charset=utf-8'}
# Whitelist: only these paths are ever read from disk. Root-level index.html/icons, PLUS the split daily-news
# data files under data/ (2026-09-21: DB moved out of index.html into data/YYYY-MM-DD.json + data/index.json).
# The data/ branch only matches an exact date-named file or index.json directly inside data/ - no wildcard
# subfolder read, no ".." (dot-dot can never match \d{4}-\d{2}-\d{2} or "index"), so no traversal is possible.
$allowRe='^/(index\.html|[A-Za-z0-9_\-]+\.(png|svg|ico)|data/(index\.json|\d{4}-\d{2}-\d{2}\.json))$'
$hmRe='^([01][0-9]|2[0-3]):[0-5][0-9]$'
$knownKeys=@('amView','pmView','updated')
$syncScript=Join-Path $dir 'sync_open_times.ps1'
$ps="$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$lastSync=[DateTime]::MinValue   # time of the last (or next already-scheduled) sync_open_times run
$prefix=('http://{0}:{1}/' -f $BindHost,$Port)

$listener=$null
Log ('server script started ('+$prefix+')')
while($true){
  # (re)start listener whenever it is missing or dead
  if((-not $listener) -or (-not $listener.IsListening)){
    try{ if($listener){$listener.Close()} }catch{}
    $listener=$null
    try{
      $listener=New-Object System.Net.HttpListener
      $listener.Prefixes.Add($prefix)
      $listener.Start()
      Log ('listener started on '+$prefix)
    }catch{
      Log ("cannot start listener: {0}" -f $_.Exception.Message)
      Start-Sleep -Seconds 30
      continue
    }
  }
  try{
    $ctx=$listener.GetContext()
  }catch{
    # listener broke (sleep/resume, network stack reset, disposed) - rebuild it
    Log ("GetContext failed: {0}" -f $_.Exception.Message)
    try{ $listener.Close() }catch{}
    $listener=$null
    Start-Sleep -Seconds 5
    continue
  }
  try{
    $req=$ctx.Request; $res=$ctx.Response
    $path=[Uri]::UnescapeDataString($req.Url.AbsolutePath)
    if($path -eq '/'){ $path='/index.html' }

    # --- web app API: GET/POST settings (stored in settings.json next to index.html) ---
    if($path -eq '/api/settings'){
      $sf=Join-Path $dir 'settings.json'
      $cur=[ordered]@{}
      if(Test-Path -LiteralPath $sf){ try{ ([IO.File]::ReadAllText($sf)|ConvertFrom-Json).PSObject.Properties|ForEach-Object{ $cur[$_.Name]=$_.Value } }catch{} }
      if($req.HttpMethod -eq 'POST'){
        $sr=New-Object IO.StreamReader($req.InputStream,[Text.Encoding]::UTF8)
        $body=$sr.ReadToEnd(); $sr.Close()
        $new=$null; $err=$null; $keys=@()
        if($body.Length -gt 8192){ $err='body too large' }
        else{ try{ $new=$body|ConvertFrom-Json }catch{ $err='bad json' } }
        if(-not $err -and -not ($new -is [System.Management.Automation.PSCustomObject])){ $err='body must be a JSON object' }
        if(-not $err){
          $keys=@($new.PSObject.Properties | ForEach-Object { $_.Name })
          $unknown=@($keys|Where-Object{ $knownKeys -notcontains $_ })
          if($unknown.Count){ $err='unknown key: '+($unknown -join ',') }
          elseif(-not (($keys -contains 'amView') -or ($keys -contains 'pmView'))){ $err='amView or pmView required' }
          else{
            foreach($k in @('amView','pmView')){
              if($keys -contains $k){
                $v=$new.$k
                if((-not ($v -is [string])) -or ($v -notmatch $hmRe)){ $err=$k+' must be HH:MM'; break }
              }
            }
          }
        }
        if($err){ Log ('settings POST rejected: '+$err); SendJson $res 400 ('{"error":"'+$err+'"}'); continue }
        foreach($k in @('amView','pmView')){ if($keys -contains $k){ $cur[$k]=$new.$k } }
        $cur['updated']=[DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
        $json=$cur|ConvertTo-Json -Depth 5
        [IO.File]::WriteAllText($sf,$json,(New-Object Text.UTF8Encoding($false)))
        Log ('settings saved: '+($json -replace '\s+',' '))
        # re-sync the DailyNews-Open-AM/PM Windows tasks (background, non-admin), at most once per minute:
        #   free slot -> run now; inside the minute -> one delayed run at the end of the minute (it reads settings.json
        #   when it fires, so it picks up the latest values); another delayed run already pending -> nothing.
        $now=Get-Date
        $wait=($lastSync.AddSeconds(60)-$now).TotalSeconds
        try{
          if($wait -le 0){
            Start-Process $ps -ArgumentList ('-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}"' -f $syncScript) -WindowStyle Hidden
            $lastSync=$now; Log 'sync launched'
          }elseif($lastSync -le $now){
            $d=[int][math]::Ceiling($wait)
            Start-Process $ps -ArgumentList ('-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds {0}; & ''{1}''"' -f $d,$syncScript) -WindowStyle Hidden
            $lastSync=$now.AddSeconds($d); Log ('sync throttled: scheduled in '+$d+'s')
          }else{ Log 'sync throttled: a delayed run is already pending' }
        }catch{ Log ('sync launch failed: '+$_.Exception.Message) }
      }
      $out=$cur|ConvertTo-Json -Depth 5
      if(-not $out){ $out='{}' }
      SendJson $res 200 $out; continue
    }

    # --- static files: whitelist only ---
    if($path -notmatch $allowRe){ Send404 $res; continue }
    $file=Join-Path $dir $path.TrimStart('/')
    if(Test-Path -LiteralPath $file -PathType Leaf){
      $ext=[IO.Path]::GetExtension($file).ToLower()
      $ct=$mime[$ext]; if(-not $ct){$ct='application/octet-stream'}
      SendBytes $res 200 $ct ([IO.File]::ReadAllBytes($file))
    }else{
      Send404 $res
    }
  }catch{
    try{ $ctx.Response.Close() }catch{}
  }
}
