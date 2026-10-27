# Registers the Windows Task Scheduler task "DriveDE weekly growth report": Mondays 09:00, only while
# the user is logged on (needs .env.local and the 9222 Chrome), runs a missed start as soon as possible.
# Usage: powershell -ExecutionPolicy Bypass -File scripts\analytics\register-weekly-task.ps1
$repo = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$node = (Get-Command node).Source
$action = New-ScheduledTaskAction -Execute $node -Argument 'scripts\analytics\weekly-report.mjs' -WorkingDirectory $repo
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 09:00
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 1)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName 'DriveDE weekly growth report' -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
schtasks /query /tn 'DriveDE weekly growth report'
