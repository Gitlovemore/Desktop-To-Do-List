$nodePath = "C:\Program Files\nodejs\node.exe"
$appPath = "C:\Users\wang.qing\.openclaw\workspace\07-工具开发\floating-todo"
$workingDir = $appPath

# 创建VBS脚本作为快捷方式
$vbsContent = @"
Set WshShell = CreateObject("WScript.Shell")
Set shortcut = WshShell.CreateShortcut("FloatingTodo.lnk")
shortcut.TargetPath = "$nodePath"
shortcut.Arguments = "."
shortcut.WorkingDirectory = "$workingDir"
shortcut.Description = "Floating Todo - 桌面待办清单"
shortcut.IconLocation = "$appPath\assets\tray-icon.png"
shortcut.Save
"@

$vbsPath = "$appPath\创建快捷方式.vbs"
$vbsContent | Out-File -FilePath $vbsPath -Encoding UTF8

# 运行VBS创建快捷方式
Invoke-Expression $vbsPath

# 删除VBS脚本
Remove-Item $vbsPath -Force

Write-Host "快捷方式已创建！"
