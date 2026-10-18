# open_news.ps1 - open the news site in the default browser.
# Called by Windows tasks DailyNews-Open-AM / DailyNews-Open-PM at the view times set in settings.json.
$dir=Split-Path -Parent $MyInvocation.MyCommand.Path
# Self-heal: ensure local port 8080 server is alive before popping up browser
$portOpen=$false
try{
  $tcp=New-Object System.Net.Sockets.TcpClient
  $connect=$tcp.BeginConnect('127.0.0.1',8080,$null,$null)
  if($connect.AsyncWaitHandle.WaitOne(800,$false)){ $tcp.EndConnect($connect); $portOpen=$true }
  $tcp.Close()
}catch{}

if(-not $portOpen){
  $ps="$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
  $serveScript=Join-Path $dir 'serve_news.ps1'
  Start-Process $ps -ArgumentList ('-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}"' -f $serveScript) -WindowStyle Hidden
  Start-Sleep -Milliseconds 600
}

Start-Process 'http://localhost:8080/'
