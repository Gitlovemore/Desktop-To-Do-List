$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("C:\Users\wang.qing\.openclaw\workspace\07-工具开发\floating-todo\FloatingTodo.lnk")
$Shortcut.TargetPath = "C:\Program Files\nodejs\node.exe"
$Shortcut.Arguments = "."
$Shortcut.WorkingDirectory = "C:\Users\wang.qing\.openclaw\workspace\07-工具开发\floating-todo"
$Shortcut.Description = "Floating Todo - 桌面待办清单"
$Shortcut.Save()
Write-Host "OK"
