@echo off
REM Git Initialization Script for Hope Mobility Kenya PWA
REM Run this after installing Git

echo ============================================
echo Hope Mobility Kenya PWA - Git Setup
echo ============================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo.
    echo Please install Git first:
    echo   1. Visit: https://git-scm.com/download/win
    echo   2. Download and install Git for Windows
    echo   3. Restart your terminal
    echo   4. Run this script again
    echo.
    pause
    exit /b 1
)

echo Git is installed!
echo.

REM Initialize repository
echo Initializing Git repository...
git init
if errorlevel 1 (
    echo ERROR: Failed to initialize repository
    pause
    exit /b 1
)
echo ✓ Repository initialized
echo.

REM Set default branch to main
echo Setting default branch to 'main'...
git branch -M main
echo ✓ Default branch set
echo.

REM Check if user is configured
git config user.name >nul 2>&1
if errorlevel 1 (
    echo.
    echo NOTE: Git user not configured globally.
    echo You may want to set your name and email:
    echo   git config --global user.name "Your Name"
    echo   git config --global user.email "your.email@example.com"
    echo.
)

REM Stage all files
echo Staging all files...
git add .
if errorlevel 1 (
    echo ERROR: Failed to stage files
    pause
    exit /b 1
)
echo ✓ Files staged
echo.

REM Create initial commit
echo Creating initial commit...
git commit -m "feat: initial project setup with presentation and development plan"
if errorlevel 1 (
    echo ERROR: Failed to create commit
    echo.
    echo This might be because Git user is not configured.
    echo Please run:
    echo   git config user.name "Your Name"
    echo   git config user.email "your.email@example.com"
    echo.
    echo Then run:
    echo   git commit -m "feat: initial project setup with presentation and development plan"
    echo.
    pause
    exit /b 1
)
echo ✓ Initial commit created
echo.

REM Show status
echo Current repository status:
echo.
git status
echo.

echo ============================================
echo Git setup complete!
echo ============================================
echo.
echo Your repository has been initialized with:
echo   - Branch: main
echo   - Initial commit with all project files
echo.
echo View commit history:
echo   git log --oneline
echo.
echo Next steps:
echo   1. Connect to remote repository (when ready):
echo      git remote add origin [repository-url]
echo      git push -u origin main
echo.
echo   2. Start developing:
echo      git checkout -b feature/your-feature-name
echo.
echo See SETUP_GIT.md for more information.
echo.
pause

