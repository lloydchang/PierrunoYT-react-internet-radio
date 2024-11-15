@echo off
echo Cleaning up unused files...

:: Remove files from git
echo Removing files from git...
git rm -f src\App.test.js
git rm -f src\logo.svg
git rm -f src\reportWebVitals.js
git rm -f src\setupTests.js
git rm -f src\services\radioAPI.js
git rm -f public\logo192.png
git rm -f public\logo512.png
git rm -f public\manifest.json
git rm -f src\components\Globe.js
git rm -f src\components\GlobeView.js

:: Update index.js to remove reportWebVitals
echo Updating index.js...
powershell -Command "(Get-Content src\index.js) -replace 'import reportWebVitals.*\n', '' -replace 'reportWebVitals\(\);.*\n', '' | Set-Content src\index.js"

:: Update index.html to remove manifest and logo references
echo Updating index.html...
powershell -Command "(Get-Content public\index.html) -replace '<link rel=\"apple-touch-icon\".*\n', '' -replace '<link rel=\"manifest\".*\n', '' | Set-Content public\index.html"

:: Stage the modified files
git add src\index.js
git add public\index.html

echo Cleanup complete!
