@echo off
rem mcpfax -> npm veroeffentlichen (n8n-nodes-mcpfax). Einmalig: Konto auf https://www.npmjs.com anlegen.
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js fehlt. Bitte von https://nodejs.org installieren und erneut starten. & pause & exit /b 1)
echo [1/4] Pakete installieren ...
call npm install --no-audit --no-fund || goto :err
echo [2/4] Bauen ...
call npm run build || goto :err
echo [3/4] Bei npm anmelden (Browser oeffnet sich) ...
call npm whoami >nul 2>nul || call npm login || goto :err
echo [4/4] Veroeffentlichen ...
call npm publish --access public || goto :err
echo.
echo Fertig: https://www.npmjs.com/package/n8n-nodes-mcpfax
pause
exit /b 0
:err
echo.
echo Fehler - bitte die Meldung oben an Claude schicken.
pause
exit /b 1
