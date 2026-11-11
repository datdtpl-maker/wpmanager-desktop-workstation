$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "WP Profile Manager.lnk"
$targetScript = "D:\Project Anti\WP-Profile-Manager\start_silent.vbs"
$iconLocation = "C:\Program Files\Google\Chrome\Application\chrome.exe,0"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = "`"$targetScript`""
$Shortcut.WorkingDirectory = "D:\Project Anti\WP-Profile-Manager"
$Shortcut.IconLocation = $iconLocation
$Shortcut.Description = "WP Profile Manager - Desktop Workspace"
$Shortcut.Save()

Write-Host "Created shortcut at $shortcutPath"
