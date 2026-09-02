@echo off
echo ========================================================
echo   Deploying Krishan Lal's Portfolio to GitHub Pages
echo ========================================================
echo.

git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/krishanS28/portfolio.git

echo Pushing code to https://github.com/krishanS28/portfolio.git ...
git push -u origin main

echo.
echo ========================================================
echo   Push Complete!
echo.
echo   Ab bas GitHub repo par:
echo   1. Settings -> Pages mein jayein
echo   2. Branch: main select karein aur Save par click karein
echo.
echo   Aapki site live ho jayegi:
echo   https://krishanS28.github.io/portfolio/
echo ========================================================
pause
