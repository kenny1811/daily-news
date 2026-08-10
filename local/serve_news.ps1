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
