# Daily News watchdog - runs every 5 min; restarts the server task if :8080 is dead
$dir=Split-Path -Parent $MyInvocation.MyCommand.Path
$log=Join-Path $dir 'server_log.txt'
try{
  $r=Invoke-WebRequest 'http://localhost:8080/' -UseBasicParsing -TimeoutSec 10
  if($r.StatusCode -eq 200){ exit 0 }
}catch{ }
("{0} watchdog: server down, restarting task" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))|Add-Content -Path $log -Encoding UTF8
Stop-ScheduledTask -TaskName 'DailyNewsServer' -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Start-ScheduledTask -TaskName 'DailyNewsServer'
