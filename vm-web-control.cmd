@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
set "PS_EXE=powershell.exe"
where "%PS_EXE%" >nul 2>nul
if errorlevel 1 (
  set "PS_EXE=pwsh.exe"
  where "%PS_EXE%" >nul 2>nul
  if errorlevel 1 (
    echo [vm-web] Could not find powershell.exe or pwsh.exe in PATH.
    set "EXIT_CODE=1"
    goto :done
  )
)

"%PS_EXE%" -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%vm-web-control.ps1" %*
set "EXIT_CODE=%ERRORLEVEL%"

:done
endlocal & exit /b %EXIT_CODE%
