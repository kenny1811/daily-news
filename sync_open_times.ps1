# sync_open_times.ps1 - (re)register DailyNews-Open-AM / DailyNews-Open-PM Windows tasks
# so they fire at amView / pmView from settings.json (defaults 10:00 / 22:00).
# Runs as the current user, no admin needed. Called by serve_news.ps1 after every settings POST,
# and can be run by hand.
$ErrorActionPreference='Stop'
$dir=Split-Path -Parent $MyInvocation.MyCommand.Path
$log=Join-Path $dir 'server_log.txt'
function Log($m){("{0} {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'),$m)|Add-Content -Path $log -Encoding UTF8}
$am='10:00'; $pm='22:00'
$sf=Join-Path $dir 'settings.json'
if(Test-Path $sf){
  try{
    $j=[IO.File]::ReadAllText($sf)|ConvertFrom-Json
    $hmRe='^([01][0-9]|2[0-3]):[0-5][0-9]$'
    if($j.amView -notmatch $hmRe -or $j.pmView -notmatch $hmRe){ throw 'Invalid amView or pmView' }
    $am=$j.amView; $pm=$j.pmView
  }catch{ Log ("sync: settings.json invalid: {0}" -f $_.Exception.Message); exit 1 }
}
$ps="$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$settings=New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 5)
$action=New-ScheduledTaskAction -Execute $ps -Argument ('-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}\open_news.ps1"' -f $dir)
$failed=$false
foreach($e in @(@{n='DailyNews-Open-AM';t=$am},@{n='DailyNews-Open-PM';t=$pm})){
  try{
    $task=Get-ScheduledTask -TaskName $e.n -ErrorAction SilentlyContinue
    if($task -and $task.State -eq 'Disabled'){
      Enable-ScheduledTask -TaskName $e.n -ErrorAction Stop | Out-Null
      Log ("sync: {0} re-enabled from Disabled" -f $e.n)
    }
    $currentTime=if($task -and $task.Triggers.Count){ ([DateTime]$task.Triggers[0].StartBoundary).ToString('HH:mm') }else{ '' }
    $currentAction=if($task -and $task.Actions.Count){ $task.Actions[0].Arguments }else{ '' }
    if($currentTime -eq $e.t -and $currentAction -eq $action.Arguments){
      Log ("sync: {0} already {1}" -f $e.n,$e.t)
      continue
    }
    $tr=New-ScheduledTaskTrigger -Daily -At $e.t
    if($task){ Set-ScheduledTask -TaskName $e.n -Action $action -Trigger $tr -ErrorAction Stop | Out-Null }
    else{ Register-ScheduledTask -TaskName $e.n -Action $action -Trigger $tr -Settings $settings -ErrorAction Stop | Out-Null }
    Enable-ScheduledTask -TaskName $e.n -ErrorAction Stop | Out-Null
    $verified=Get-ScheduledTask -TaskName $e.n -ErrorAction Stop
    if(([DateTime]$verified.Triggers[0].StartBoundary).ToString('HH:mm') -ne $e.t){ throw 'trigger verification failed' }
    if($verified.State -eq 'Disabled'){ throw 'task is still Disabled' }
    Log ("sync: {0} -> {1}" -f $e.n,$e.t)
  }catch{ $failed=$true; Log ("sync: {0} FAILED: {1}" -f $e.n,$_.Exception.Message) }
}
if($failed){ exit 1 }
exit 0
