#Requires -RunAsAdministrator
# One-time setup for the new local newsroom folder (2026-09-07 move)
# 1) remove the old GitHub pull tasks (old folder is being deleted)
# 2) re-register DailyNewsServer so it serves THIS folder on :8080
$ErrorActionPreference='Continue'
$dir=Split-Path -Parent $MyInvocation.MyCommand.Path

foreach($t in 'DailyNews-AM','DailyNews-PM','DailyNewsPush'){
  Unregister-ScheduledTask -TaskName $t -Confirm:$false -ErrorAction SilentlyContinue
  Write-Host ("removed task: {0}" -f $t)
}

# server: autostart_server.ps1 unregisters + re-registers DailyNewsServer pointing at $dir
& (Join-Path $dir 'autostart_server.ps1')

Write-Host ''
Write-Host ("Serving from: {0}" -f $dir)
Write-Host 'Open http://localhost:8080/ to confirm. Done.'
