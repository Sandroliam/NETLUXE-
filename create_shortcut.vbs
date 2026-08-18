Set ws = CreateObject("WScript.Shell")
Set sc = ws.CreateShortcut(ws.SpecialFolders("Desktop") & "\Sandro Liam.lnk")
sc.TargetPath = "C:\Users\MegabyteDo\Documents\NETLUXE"
sc.WorkingDirectory = "C:\Users\MegabyteDo\Documents\NETLUXE"
sc.Description = "Espace de travail Sandro Liam - NETLUXE"
sc.Save