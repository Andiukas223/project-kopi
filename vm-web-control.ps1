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

function Invoke-DockerCompose {
  param([string[]]$Arguments)
  Push-Location $ProjectRoot
  try {
    & docker compose @Arguments
    if ($LASTEXITCODE -ne 0) {
      throw "docker compose $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
    }
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

function Show-Menu {
  while ($true) {
    Clear-Host
    Write-Host "Viva Medical Service IS - local web control" -ForegroundColor White
    Write-Host "Project: $ProjectRoot" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "1. Turn on"
    Write-Host "2. Turn off"
    Write-Host "3. Restart"
    Write-Host "4. Status"
    Write-Host "5. Logs"
    Write-Host "6. Open browser"
    Write-Host "7. Quit"
    Write-Host ""

    $choice = Read-Host "Choose action"
    try {
      switch ($choice) {
        "1" { Start-Web }
        "2" { Stop-Web }
        "3" { Restart-Web }
        "4" { Show-Status }
        "5" { Show-Logs }
        "6" { Open-Web }
        "7" { return }
        default { Write-WarnLine "unknown option" }
      }
    }
    catch {
      Write-WarnLine $_.Exception.Message
    }

    Write-Host ""
    Read-Host "Press Enter to continue"
  }
}

switch ($Action) {
  "menu" { Show-Menu }
  "on" { Start-Web }
  "off" { Stop-Web }
  "restart" { Restart-Web }
  "status" { Show-Status }
  "logs" { Show-Logs }
  "open" { Open-Web }
  "quit" { return }
}
