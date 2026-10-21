@echo off
rem mcpfax -> Zapier hochladen (einmalig: Deploy-Key unter https://developer.zapier.com/partner-settings/deploy-keys erstellen)
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js fehlt. Bitte von https://nodejs.org installieren und erneut starten. & pause & exit /b 1)
echo [1/4] Pakete installieren ...
call npm install --no-audit --no-fund || goto :err
echo [2/4] Bei Zapier anmelden (Deploy-Key einfuegen, wenn gefragt) ...
call npx -y zapier-platform-cli@16.5.0 login --sso || goto :err
if not exist .zapierapprc (
  echo [3/4] Mit der bestehenden Integration "mcpfax" verknuepfen ...
  call npx -y zapier-platform-cli@16.5.0 link || goto :err
)
echo [4/4] App pruefen und hochladen ...
call npx -y zapier-platform-cli@16.5.0 validate || goto :err
call npx -y zapier-platform-cli@16.5.0 push || goto :err
echo.
echo Fertig. Die neue Version ist in https://developer.zapier.com sichtbar.
pause
exit /b 0
:err
echo.
echo Fehler - bitte die Meldung oben an Claude schicken.
pause
exit /b 1
