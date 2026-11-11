@echo off
title WP Profile Manager Server
cd /d "%~dp0"

echo [1/2] Dang kiem tra va khoi dong may chu WP Profile Manager...
powershell -Command "if (-not (Get-NetTCPConnection -LocalPort 3890 -ErrorAction SilentlyContinue)) { Start-Process -FilePath 'node' -ArgumentList 'server.js' -WorkingDirectory '%~dp0' -WindowStyle Hidden }"

timeout /t 1 /nobreak >nul

echo [2/2] Dang mo giao dien Desktop...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://localhost:3890" --user-data-dir="%~dp0app_data\ui_session" --window-size=1280,820

exit
