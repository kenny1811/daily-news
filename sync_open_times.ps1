# sync_open_times.ps1 - (re)register DailyNews-Open-AM / DailyNews-Open-PM Windows tasks
# so they fire at amView / pmView from settings.json (defaults 10:00 / 22:00).
# Runs as the current user, no admin needed. Called by serve_news.ps1 after every settings POST,
# and can be run by hand.
$ErrorActionPreference='Continue'
$dir=Split-Path -Parent $MyInvocation.MyCommand.Path
$log=Join-Path $dir 'server_log.txt'
function Log($m){("{0} {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'),$m)|Add-Content -Path $log -Encoding UTF8}
$am='10:00'; $pm='22:00'
$sf=Join-Path $dir 'settings.json'
if(Test-Path $sf){
  try{
    $j=[IO.File]::ReadAllText($sf)|ConvertFrom-Json
    if($j.amView -match '^\d{2}:\d{2}$'){ $am=$j.amView }
    if($j.pmView -match '^\d{2}:\d{2}$'){ $pm=$j.pmView }
  }catch{ Log ("sync: settings.json unreadable: {0}" -f $_.Exception.Message) }
}
$ps="$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$settings=New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 5)
$action=New-ScheduledTaskAction -Execute $ps -Argument ('-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}\open_news.ps1"' -f $dir)
foreach($e in @(@{n='DailyNews-Open-AM';t=$am},@{n='DailyNews-Open-PM';t=$pm})){
  try{
    $tr=New-ScheduledTaskTrigger -Daily -At $e.t
    Register-ScheduledTask -TaskName $e.n -Action $action -Trigger $tr -Settings $settings -Force | Out-Null
    Log ("sync: {0} -> {1}" -f $e.n,$e.t)
  }catch{ Log ("sync: {0} FAILED: {1}" -f $e.n,$_.Exception.Message) }
}
