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
    Enable-ScheduledTask -TaskName $e.n | Out-Null
    Log ("sync: {0} -> {1}" -f $e.n,$e.t)
  }catch{ Log ("sync: {0} FAILED: {1}" -f $e.n,$_.Exception.Message) }
}

# Sync Antigravity scheduled sidecar (amView - 90m, pmView - 90m)
function OffsetHM([string]$hm,[int]$deltaMinutes){
  $parts=$hm.Split(':')
  $total=(([int]$parts[0])*60 + [int]$parts[1] + $deltaMinutes) % 1440
  if($total -lt 0){ $total += 1440 }
  return @{ H=[int][math]::Floor($total / 60); M=($total % 60) }
}
$sidecarRoot=Join-Path $env:USERPROFILE '.gemini\config\sidecars'
$amStart=OffsetHM $am -90
$pmStart=OffsetHM $pm -90

$sp=Join-Path (Join-Path $sidecarRoot 'daily-news') 'sidecar.json'
if(Test-Path -LiteralPath $sp){
  try{
    $so=[IO.File]::ReadAllText($sp,[Text.Encoding]::UTF8)|ConvertFrom-Json
    if($amStart.M -eq $pmStart.M){
      $cron=('CRON_TZ=Asia/Hong_Kong {0} {1},{2} * * *' -f $amStart.M,$amStart.H,$pmStart.H)
    }else{
      $cron=('CRON_TZ=Asia/Hong_Kong {0},{1} {2},{3} * * *' -f $amStart.M,$pmStart.M,$amStart.H,$pmStart.H)
    }
    if($so.args -and $so.args.Count -ge 1 -and $so.args[0] -ne $cron){
      $so.args[0]=$cron
      $jsonOut=($so|ConvertTo-Json -Depth 10) + "`n"
      [IO.File]::WriteAllText($sp,$jsonOut,(New-Object Text.UTF8Encoding($false)))
      Log ("sync sidecar: daily-news -> {0}" -f $cron)
    }
  }catch{ Log ("sync sidecar: daily-news FAILED: {0}" -f $_.Exception.Message) }
}
