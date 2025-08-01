@echo off
setlocal ENABLEEXTENSIONS

echo.
echo 🚀 Starting Vite project deployment from: %CD%
echo.

:: Step 1: Ensure main branch is active or rename
git checkout main
IF %ERRORLEVEL% NEQ 0 (
    echo ⚠️ 'main' branch not found. Renaming current branch to 'main'...
    git branch -m main
    git push -u origin main --force
) ELSE (
    echo ✅ On 'main' branch
)

:: Step 2: Fix homepage (manual step assumed already done)
echo.
echo 📁 Building Vite project...
call npm install
call npm run build

:: Step 3: Copy dist contents to root
echo.
echo 📂 Copying dist/* to root...
xcopy /E /Y /I dist\* .\ >nul
IF %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Failed to copy from dist
) ELSE (
    echo ✅ dist copied to root
)

:: Step 4: Push to GitHub
echo.
echo 💾 Committing and pushing to GitHub...
git add .
git commit -m "Vite deploy: dist copied to root"
git push origin main

:: Step 5: Clean old branches if exist
echo.
echo 🧹 Cleaning up old branches...
git push origin --delete gh-pages
git push origin --delete master
git remote prune origin

echo.
echo ✅ Deployment complete for Vite project!
echo 🌐 Visit your GitHub Pages URL to confirm it’s working.
pause
