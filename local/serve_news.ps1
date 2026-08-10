# Daily News local server - serves this folder on port 8080 (all interfaces, incl. NordVPN Meshnet)
$ErrorActionPreference='Continue'
$dir=Split-Path -Parent $MyInvocation.MyCommand.Path
$mime=@{'.html'='text/html; charset=utf-8';'.htm'='text/html; charset=utf-8';'.png'='image/png';'.ico'='image/x-icon';'.svg'='image/svg+xml';'.jpg'='image/jpeg';'.jpeg'='image/jpeg';'.txt'='text/plain; charset=utf-8';'.json'='application/json'}
$listener=New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://+:8080/')
try{ $listener.Start() }catch{
  # port taken or no urlacl - log and exit
  ("{0} cannot start listener: {1}" -f (Get-Date),$_.Exception.Message) | Add-Content (Join-Path $dir 'server_log.txt')
  exit 1
}
while($true){
  try{
    $ctx=$listener.GetContext()
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
  }catch{ }
}
