param(
  [ValidateSet("menu", "on", "off", "restart", "status", "logs", "open", "quit")]
  [string]$Action = "menu"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$AppUrl = "http://localhost:8080/"

function Write-Step {
  param([string]$Message)
  Write-Host "[vm-web] $Message" -ForegroundColor Cyan
}

function Write-Ok {
  param([string]$Message)
  Write-Host "[ok] $Message" -ForegroundColor Green
}

function Write-WarnLine {
  param([string]$Message)
  Write-Host "[warn] $Message" -ForegroundColor Yellow
}

function Assert-ExitCode {
  param(
    [int]$ExitCode,
    [string]$Command
  )

  if ($ExitCode -ne 0) {
    throw "$Command failed with exit code $ExitCode"
  }
}

function Invoke-DockerCompose {
  param([string[]]$Arguments)

  Push-Location -LiteralPath $ProjectRoot
  try {
    & docker compose @Arguments
    Assert-ExitCode -ExitCode $LASTEXITCODE -Command "docker compose $($Arguments -join ' ')"
  }
  finally {
    Pop-Location
  }
}

function Start-Web {
  Write-Step "checking Docker Compose project"
  Write-Step "building and starting nginx web container"
  Invoke-DockerCompose @("up", "-d", "--build")
  Write-Ok "web is available at $AppUrl"
  Show-Status
}

function Stop-Web {
  Write-Step "stopping web container"
  Invoke-DockerCompose @("down")
  Write-Ok "web container stopped"
}

function Restart-Web {
  Write-Step "restarting web stack"
  Stop-Web
  Start-Web
}

function Show-Status {
  Write-Step "current Docker Compose status"
  Invoke-DockerCompose @("ps")
}

function Show-Logs {
  Write-Step "latest web logs"
  Invoke-DockerCompose @("logs", "--tail", "80", "web")
}

function Open-Web {
  Write-Step "opening $AppUrl"
  Start-Process $AppUrl
}

function Get-MenuItems {
  @(
    [pscustomobject]@{ Choice = "1"; Label = "Turn on"; Action = "on" }
    [pscustomobject]@{ Choice = "2"; Label = "Turn off"; Action = "off" }
    [pscustomobject]@{ Choice = "3"; Label = "Restart"; Action = "restart" }
    [pscustomobject]@{ Choice = "4"; Label = "Status"; Action = "status" }
    [pscustomobject]@{ Choice = "5"; Label = "Logs"; Action = "logs" }
    [pscustomobject]@{ Choice = "6"; Label = "Open browser"; Action = "open" }
    [pscustomobject]@{ Choice = "7"; Label = "Quit"; Action = "quit" }
  )
}

function Show-MenuHeader {
  Clear-Host
  Write-Host "Viva Medical Service IS - local web control" -ForegroundColor White
  Write-Host "Project: $ProjectRoot" -ForegroundColor DarkGray
  Write-Host ""
}

function Show-MenuOptions {
  Get-MenuItems | ForEach-Object {
    Write-Host "$($_.Choice). $($_.Label)"
  }
  Write-Host ""
}

function Read-MenuAction {
  $choice = Read-Host "Choose action"
  $selectedItem = Get-MenuItems | Where-Object { $_.Choice -eq $choice } | Select-Object -First 1

  if ($null -eq $selectedItem) {
    Write-WarnLine "unknown option"
    return $null
  }

  return $selectedItem.Action
}

function Wait-ForMenuInput {
  Write-Host ""
  Read-Host "Press Enter to continue"
}

function Invoke-WebAction {
  param([string]$SelectedAction)

  switch ($SelectedAction) {
    "menu" { Show-Menu }
    "on" { Start-Web }
    "off" { Stop-Web }
    "restart" { Restart-Web }
    "status" { Show-Status }
    "logs" { Show-Logs }
    "open" { Open-Web }
    "quit" { return }
  }
}

function Invoke-WebActionSafely {
  param([string]$SelectedAction)

  if ([string]::IsNullOrWhiteSpace($SelectedAction)) {
    return
  }

  try {
    Invoke-WebAction -SelectedAction $SelectedAction
  }
  catch {
    Write-WarnLine $_.Exception.Message
  }
}

function Show-Menu {
  while ($true) {
    Show-MenuHeader
    Show-MenuOptions

    $selectedAction = Read-MenuAction
    if ($selectedAction -eq "quit") {
      return
    }

    Invoke-WebActionSafely -SelectedAction $selectedAction
    Wait-ForMenuInput
  }
}

Invoke-WebAction -SelectedAction $Action
