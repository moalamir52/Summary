@echo off
echo --- Running test_deploy.bat ---
echo Current Directory: %CD%

echo.
set /p DUMMY_VAR=">> Please enter something and press Enter: "
echo.

echo --- Now running git status ---
git status
echo --- Finished test_deploy.bat ---
pause