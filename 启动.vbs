Set WshShell = CreateObject("WScript.Shell")
exePath = CreateObject("Scripting.FileSystemObject").GetAbsolutePathName("node_modules\electron\dist\electron.exe")
WshShell.Run exePath & " .", 0, False
