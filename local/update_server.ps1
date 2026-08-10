#Requires -RunAsAdministrator
# Re-register server task with auto-restart + add 5-min watchdog task
$ErrorActionPreference='Stop'
$dir=Split-Path -Parent $MyInvocation.MyCommand.Path
$ps="$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"

$srvSettings=New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 5 -RestartInterval (New-TimeSpan -Minutes 1)
$a1=New-ScheduledTaskAction -Execute $ps -Argument ('-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}\serve_news.ps1"' -f $dir)
$t1=New-ScheduledTaskTrigger -AtLogOn
Register-ScheduledTask -TaskName 'DailyNewsServer' -Action $a1 -Trigger $t1 -Settings $srvSettings -Force | Out-Null

$wdSettings=New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 4)
$a2=New-ScheduledTaskAction -Execute $ps -Argument ('-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}\watchdog_news.ps1"' -f $dir)
$t2=New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration ([TimeSpan]::MaxValue)
Register-ScheduledTask -TaskName 'DailyNewsWatchdog' -Action $a2 -Trigger $t2 -Settings $wdSettings -Force | Out-Null

Stop-ScheduledTask -TaskName 'DailyNewsServer' -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Start-ScheduledTask -TaskName 'DailyNewsServer'
Start-Sleep -Seconds 3
try{
  $code=(Invoke-WebRequest 'http://localhost:8080/' -UseBasicParsing -TimeoutSec 10).StatusCode
}catch{ $code=$_.Exception.Message }
Write-Host ''
Write-Host ("server test: {0}  (200 = OK)" -f $code)
Write-Host 'DailyNewsServer re-registered (auto-restart x5) + DailyNewsWatchdog every 5 min'
