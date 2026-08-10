#Requires -RunAsAdministrator
# Daily News one-time setup: firewall + url reservation + 3 scheduled tasks
$ErrorActionPreference='Stop'
$dir=Split-Path -Parent $MyInvocation.MyCommand.Path
$ps="$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"

# allow non-admin process to listen on port 8080 (locale-safe SDDL = Everyone)
cmd /c 'netsh http delete urlacl url=http://+:8080/' | Out-Null
cmd /c 'netsh http add urlacl url=http://+:8080/ sddl=D:(A;;GX;;;WD)' | Out-Null

# firewall: allow inbound 8080 (needed for Meshnet devices)
cmd /c 'netsh advfirewall firewall delete rule name="DailyNews8080"' | Out-Null
cmd /c 'netsh advfirewall firewall add rule name="DailyNews8080" dir=in action=allow protocol=TCP localport=8080' | Out-Null

$settings=New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit ([TimeSpan]::Zero)

# 1) server: starts at logon, runs forever
$a1=New-ScheduledTaskAction -Execute $ps -Argument ('-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}\serve_news.ps1"' -f $dir)
$t1=New-ScheduledTaskTrigger -AtLogOn
Register-ScheduledTask -TaskName 'DailyNewsServer' -Action $a1 -Trigger $t1 -Settings $settings -Force | Out-Null

# 2) morning pull 07:00 + open Chrome
$a2=New-ScheduledTaskAction -Execute $ps -Argument ('-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}\pull_news.ps1" -Edition am -OpenChrome' -f $dir)
$t2=New-ScheduledTaskTrigger -Daily -At 07:00
Register-ScheduledTask -TaskName 'DailyNews-AM' -Action $a2 -Trigger $t2 -Settings $settings -Force | Out-Null

# 3) evening pull 19:00 + open Chrome
$a3=New-ScheduledTaskAction -Execute $ps -Argument ('-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}\pull_news.ps1" -Edition pm -OpenChrome' -f $dir)
$t3=New-ScheduledTaskTrigger -Daily -At 19:00
Register-ScheduledTask -TaskName 'DailyNews-PM' -Action $a3 -Trigger $t3 -Settings $settings -Force | Out-Null

Start-ScheduledTask -TaskName 'DailyNewsServer'
Start-Sleep -Seconds 2
& $ps -NoProfile -ExecutionPolicy Bypass -File (Join-Path $dir 'pull_news.ps1')   # first pull now (no Chrome)

Write-Host ''
Write-Host 'DONE. 3 tasks registered: DailyNewsServer / DailyNews-AM (07:00) / DailyNews-PM (19:00)'
Write-Host 'This PC:      http://localhost:8080/'
Write-Host 'Other device: http://<this PCs Meshnet name>:8080/  (see NordVPN app -> Meshnet)'
Write-Host 'Remember to DELETE the old tasks that open kenny1811.github.io'
