$env:Path = "C:\Program Files\nodejs;" + $env:Path
$env:node = "C:\Program Files\nodejs\node.exe"

cd "C:\Users\wang.qing\.openclaw\workspace\07-工具开发\floating-todo"

# 先安装依赖（不包括electron）
npm install auto-launch

# 然后单独安装 electron
npm install electron --ignore-scripts

# 运行应用
npm start
