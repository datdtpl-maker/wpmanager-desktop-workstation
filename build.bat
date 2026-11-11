@echo off
title Build WP Profile Manager Desktop
cd /d "%~dp0"

echo [1/4] Installing dependencies...
python -m pip install -r requirements.txt pyinstaller

echo [2/4] Building WP-Profile-Manager Application...
python -m PyInstaller --noconfirm --onedir --windowed --name="WP-Profile-Manager" --icon="app.ico" --add-data="public;public" --add-data="app.ico;." main.py

echo [3/4] Creating application bundle...
python make_zip.py

echo [4/4] Building Setup-WP-Profile-Manager Installer...
python -m PyInstaller --noconfirm --onefile --windowed --name="Setup-WP-Profile-Manager" --icon="app.ico" --add-data="app_bundle.zip;." --add-data="app.ico;." installer.py

echo ========================================================
echo BUILD SUCCESSFUL!
echo App executable: dist\WP-Profile-Manager\WP-Profile-Manager.exe
echo Installer:     dist\Setup-WP-Profile-Manager.exe
echo ========================================================
pause
