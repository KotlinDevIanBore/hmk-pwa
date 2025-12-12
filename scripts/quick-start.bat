@echo off
REM HMK PWA - Quick Start Script (Windows CMD)
REM Simple wrapper to run the PowerShell setup script

echo ========================================
echo   HMK PWA - Quick Setup Launcher
echo ========================================
echo.

echo Running setup script...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0setup.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Setup failed or was cancelled.
    pause
    exit /b 1
)

pause

