#Requires -RunAsAdministrator
# DailyNewsServer: run at every boot, invisible (session 0, no console window at all)
$ErrorActionPreference='Stop'
$dir=Split-Path -Parent $MyInvocation.MyCommand.Path
$ps="$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"

$settings=New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit ([TimeSpan]::Zero)
$action=New-ScheduledTaskAction -Execute $ps -Argument ('-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}\serve_news.ps1"' -f $dir)
$trigger=New-ScheduledTaskTrigger -AtStartup
# S4U = run whether user is logged on or not (no password stored) -> session 0, truly windowless
$principal=New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType S4U -RunLevel Limited

Unregister-ScheduledTask -TaskName 'DailyNewsServer' -Confirm:$false -ErrorAction SilentlyContinue
Register-ScheduledTask -TaskName 'DailyNewsServer' -Action $action -Trigger $trigger -Settings $settings -Principal $principal | Out-Null
Start-ScheduledTask -TaskName 'DailyNewsServer'
Start-Sleep -Seconds 3
try{ $code=(Invoke-WebRequest 'http://localhost:8080/' -UseBasicParsing -TimeoutSec 10).StatusCode }
catch{ $code=$_.Exception.Message }
Write-Host ''
Write-Host ("server test: {0}  (200 = OK)" -f $code)
Write-Host 'DailyNewsServer: starts at every boot, fully invisible, no window.'
