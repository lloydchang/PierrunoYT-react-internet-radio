@echo off
echo Cleaning up unused files...

:: Delete unused files
del /f /q src\App.test.js
del /f /q src\logo.svg
del /f /q src\reportWebVitals.js
del /f /q src\setupTests.js
del /f /q src\services\radioAPI.js
del /f /q public\logo192.png
del /f /q public\logo512.png
del /f /q public\manifest.json

:: Update index.js to remove reportWebVitals
echo Updating index.js...
powershell -Command "(Get-Content src\index.js) -replace 'import reportWebVitals.*\n', '' -replace 'reportWebVitals\(\);.*\n', '' | Set-Content src\index.js"

:: Update index.html to remove manifest and logo references
echo Updating index.html...
powershell -Command "(Get-Content public\index.html) -replace '<link rel=\"apple-touch-icon\".*\n', '' -replace '<link rel=\"manifest\".*\n', '' | Set-Content public\index.html"

echo Cleanup complete!
