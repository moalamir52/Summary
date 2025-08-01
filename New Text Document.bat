@echo off
setlocal

:: قراءة اسم المجلد الحالي تلقائيًا
for %%I in (.) do set "PROJECT_NAME=%%~nxI"

echo ≡🌐 Starting Vite deployment for: %PROJECT_NAME%

:: تأكد أنك على الفرع الرئيسي
git checkout main
git pull origin main

:: تعديل base داخل vite.config.js
echo 📁 Updating vite.config.js base path...

powershell -Command "(Get-Content vite.config.js) -replace 'base: .+?', 'base: \"/%PROJECT_NAME%/\",' | Set-Content vite.config.js"

:: تثبيت الاعتمادات
echo 📦 Installing dependencies...
call npm install

:: تنفيذ build
echo 🏗️ Building project...
call npm run build

:: نسخ مجلد dist إلى الجذر
echo 📂 Copying dist/ contents to project root...
xcopy /E /Y /I dist\* .\ >nul

:: إضافة التغييرات ودفعها إلى GitHub
echo 🔁 Committing and pushing to GitHub...
git add .
git commit -m "Vite auto-deploy: build updated for GitHub Pages"
git push origin main

:: حذف فروع قديمة لو وجدت
echo 🧹 Cleaning up old branches...
git push origin --delete gh-pages 2>nul
git push origin --delete master 2>nul

echo ✅ Deployment complete. Visit:
echo https://moalamir52.github.io/%PROJECT_NAME%/

pause
