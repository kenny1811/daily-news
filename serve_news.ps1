# Daily News local server v2 - self-healing HttpListener on port 8080
$ErrorActionPreference='Continue'
$dir=Split-Path -Parent $MyInvocation.MyCommand.Path
$log=Join-Path $dir 'server_log.txt'
function Log($m){("{0} {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'),$m)|Add-Content -Path $log -Encoding UTF8}
if((Test-Path $log) -and ((Get-Item $log).Length -gt 500KB)){Remove-Item $log -Force}
$mime=@{'.html'='text/html; charset=utf-8';'.htm'='text/html; charset=utf-8';'.png'='image/png';'.ico'='image/x-icon';'.svg'='image/svg+xml';'.jpg'='image/jpeg';'.jpeg'='image/jpeg';'.txt'='text/plain; charset=utf-8';'.json'='application/json'}

$listener=$null
Log 'server script started'
while($true){
  # (re)start listener whenever it is missing or dead
  if((-not $listener) -or (-not $listener.IsListening)){
    try{ if($listener){$listener.Close()} }catch{}
    $listener=$null
    try{
      $listener=New-Object System.Net.HttpListener
      $listener.Prefixes.Add('http://+:8080/')
      $listener.Start()
      Log 'listener started on :8080'
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
    if($path -match '\.\.'){ $res.StatusCode=400; $res.Close(); continue }
    $file=Join-Path $dir ($path.TrimStart('/') -replace '/','\')

    # --- web app API: GET/POST settings (stored in settings.json next to index.html) ---
    if($path -match '/api/settings$'){
      $sf=Join-Path $dir 'settings.json'
      $cur=@{}
      if(Test-Path $sf){ try{ ([IO.File]::ReadAllText($sf)|ConvertFrom-Json).PSObject.Properties|ForEach-Object{ $cur[$_.Name]=$_.Value } }catch{} }
      if($req.HttpMethod -eq 'POST'){
        $sr=New-Object IO.StreamReader($req.InputStream,[Text.Encoding]::UTF8)
        $body=$sr.ReadToEnd(); $sr.Close()
        $new=$null
        if($body.Length -le 8192){ try{ $new=$body|ConvertFrom-Json }catch{ $new=$null } }
        if(-not $new){
          $res.StatusCode=400
          $msg=[Text.Encoding]::UTF8.GetBytes('{"error":"bad json"}')
          $res.ContentType='application/json; charset=utf-8'
          $res.OutputStream.Write($msg,0,$msg.Length); $res.Close(); continue
        }
        $new.PSObject.Properties|ForEach-Object{ $cur[$_.Name]=$_.Value }
        $json=$cur|ConvertTo-Json -Depth 5
        [IO.File]::WriteAllText($sf,$json,(New-Object Text.UTF8Encoding($false)))
        Log ('settings saved: '+($json -replace '\s+',' '))
        # re-sync the DailyNews-Open-AM/PM Windows tasks to the new view times (background, non-admin)
        try{ Start-Process "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -ArgumentList ('-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}"' -f (Join-Path $dir 'sync_open_times.ps1')) -WindowStyle Hidden }catch{ Log ('sync launch failed: '+$_.Exception.Message) }
      }
      $out=$cur|ConvertTo-Json -Depth 5
      if(-not $out){ $out='{}' }
      $bytes=[Text.Encoding]::UTF8.GetBytes($out)
      $res.ContentType='application/json; charset=utf-8'
      $res.Headers.Add('Cache-Control','no-cache')
      $res.ContentLength64=$bytes.Length
      $res.OutputStream.Write($bytes,0,$bytes.Length)
      $res.Close(); continue
    }

    if(Test-Path $file -PathType Leaf){
      $ext=[IO.Path]::GetExtension($file).ToLower()
      $ct=$mime[$ext]; if(-not $ct){$ct='application/octet-stream'}
      $bytes=[IO.File]::ReadAllBytes($file)
      $res.ContentType=$ct
      $res.Headers.Add('Cache-Control','no-cache')
      $res.ContentLength64=$bytes.Length
      $res.OutputStream.Write($bytes,0,$bytes.Length)
    }else{
      $res.StatusCode=404
      $msg=[Text.Encoding]::UTF8.GetBytes('404')
      $res.OutputStream.Write($msg,0,$msg.Length)
    }
    $res.Close()
  }catch{
    try{ $ctx.Response.Close() }catch{}
  }
}
