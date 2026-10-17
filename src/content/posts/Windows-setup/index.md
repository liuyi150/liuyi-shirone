---
title: 个人向 Windows 11 系统设置指南
published: 2026-10-16
description: 从跳过 OOBE、重装系统、卸载预装软件，到安全中心、隐私选项、快速启动和电源计划，按操作顺序整理的个人向 Windows 11 设置清单。
image: http://image.coolapk.com/feed_cover/2024/0306/02/13728628_f488ff91_3995_3019_520@1284x577.jpeg
tags:
  - Windows11
  - 系统优化
  - 电脑玩家
  - 笔记本电脑
category: 系统折腾
draft: false
alias: "windows-setup"
---

::: warning 本文由 DeepSeek v4.1 Falsh 润色制作
正文与各节命令经 AI 润色整理；涉及注册表、防火墙与系统服务的操作，请先按第 14 节创建还原点再动手。
:::

网上少见 Windows 11 的系统设置教程，这里结合自己的使用体验整理一份清单，按从装机到日常使用的顺序排列。

先说两点：

- 本文是个人向记录，部分选项见仁见智，请按自己的需求取舍。
- 厂商预装的系统比微软官网镜像（原版）更臃肿，所以本文以厂商版为例。

## 1. 跳过 OOBE 和微软账户登录

OOBE 指系统首次开机时的引导设置界面。新设备可以先跳过它，进系统后再登录微软账户。

- 预装 Windows 11 的新设备，联网激活后可能影响退换货，建议先跳过 OOBE，以后登录。
- 早期版本 Windows 10（1803–1903）在 OOBE 登录账户有概率造成占用过高。Windows 11 少见这个问题，可以直接登录，省去进系统后再登录一次的麻烦。
- Windows 11 默认联网即激活设备，跳过 OOBE 也就一并跳过了微软账户登录。
- 用户名不要用中文，否则部分软件会莫名报错，例如 Steam。

![用户名不要用中文](https://image.coolapk.com/feed/2024/0306/02/13728628_6dc57957_3996_7061_760@572x142.png.m.jpg)

习惯用中文名字的话，用拼音代替。

OOBE 界面按 `Shift + F10` 可以调出命令提示符，执行下面的命令，重启后就能选“我没有 Internet 连接 → 继续执行受限设置”，用本地账户进系统：

```cmd
oobe\bypassnro
```

22H2 之后的版本移除了它，可以改用下面这条直接创建本地账户：

```cmd
start ms-cxh:localonly
```

## 2. 跳过引导流程的更新页面

预装了 22H2 或更低版本 Windows 11 的用户，引导流程最后一步会出现更新页面。这一步直接跳过即可。

## 3. 重装一次系统

进桌面后，用“重置此电脑”重新安装一次系统。新机首次激活后几天内容易出现卡顿、绿屏，激活后重装一次就能解决。

打开 设置 → 系统 → 恢复 → 重置此电脑，有两种方式：

- 云下载：删除硬盘内全部文件，并从网络下载系统，不改动硬盘分区。
- 本地重新安装：使用本地隐藏分区安装系统，不改动硬盘分区。

两者效果基本一致，云下载理论上更彻底。

也可以在管理员终端里直接唤起重置向导，少点几层菜单：

```cmd
systemreset -cleanpc
```

![重置选项](https://image.coolapk.com/feed/2024/0306/02/13728628_3d89c62c_3996_7066_561@1436x703.png.m.jpg)

我的 G15 5511（11800H）、ENVY X360（1230U）和 ROG 幻（AMD 6800）都有这个现象，应该不是个例。重装后的系统与预装版本完全一致，可以放心操作。

## 4. 升级到企业版

重装完成后，把家庭中文版升级为企业版（商业版），更新节奏会更稳定。

打开 设置 → 系统 → 系统信息 → 相关内容 → 产品密钥和激活，用密钥升级；也可以使用版本转换工具直接更改。

![使用密钥激活](https://image.coolapk.com/feed/2024/0306/02/13728628_b1d54301_3996_7074_305@1416x517.png.m.jpg)

从发布顺序看，家庭版通常先收到更新，企业版稍后推送，个人感觉相当于家庭版用户先替企业版试错。

注意：撰写本文时，企业版 23H2 尚未正式推送。

不想点设置页面的话，在管理员终端里用 `changepk.exe` 走同样的流程，密钥自己填：

```cmd
changepk.exe /productkey XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
```

升级完成后用 `slmgr.vbs` 确认版本与激活状态：

```cmd
slmgr.vbs /dlv
```

![企业版的 22H2](https://image.coolapk.com/feed/2024/0306/02/13728628_bfcf0697_3996_7076_882@1389x376.png.m.jpg)

## 5. 断网，卸载迈克菲和多余应用

先断开网络，再用 Geek Uninstaller 卸载不需要的预装软件。断网是为了阻止 Windows 更新在后台下载补丁。

- 惠普和华硕的预装系统一般带两个 McAfee 组件，建议全部卸载。
- 卸载主程序时若提示重新启动，先不要重启，让 Geek Uninstaller 清理残留文件。
- 其余可卸载的多为微软自带的 UWP 应用，例如地图、家庭、提示、录音机和小组件。小组件是否保留看需求：它对我只是广告推送页，但有人用它显示手机链接和远程遥控。

![比如“提示”和“录音机”](https://image.coolapk.com/feed/2024/0306/02/13728628_7a656f56_3996_7084_211@600x891.png.m.jpg)

预装的 UWP 应用可以在管理员 PowerShell 里批量清掉。先看一眼都有哪些：

```powershell
Get-AppxPackage -AllUsers |
  Select-Object Name, PackageFullName |
  Sort-Object Name | Format-Table -AutoSize
```

再按需删除（`$names` 换成你要清的应用）：

```powershell
$names = 'BingMaps','BingWeather','ZuneMusic','ZuneVideo','Clipchamp','MicrosoftTeams',
         'WindowsFeedbackHub','MicrosoftSolitaireCollection','Microsoft.People',
         'Microsoft.MixedReality.Portal'
Get-AppxPackage -AllUsers | Where-Object Name -in $names | Remove-AppxPackage -AllUsers

# 同时移除预置包，避免新建用户后又被装回来
Get-AppxProvisionedPackage -Online |
  Where-Object DisplayName -match 'Bing|Zune|Clipchamp|Teams|Feedback|Solitaire|People|MixedReality' |
  Remove-AppxProvisionedPackage -Online
```

迈克菲这类传统程序仍建议用 Geek Uninstaller（能连服务、计划任务和注册表一起清）。想用命令行的话，先列出来再卸载：

```powershell
winget list --name McAfee
winget uninstall --name "McAfee"
```

## 6. 设置 Windows 安全中心（新手请谨慎）

关闭实时防护能减少扫描开销，但电脑会处于无防护状态。不清楚用途就不要修改，或先创建还原点（见第 14 节）。

- 应用和浏览器控制 → 智能应用控制设置：“评估”改为“关闭”。智能应用控制会扫描正在启动的应用，拖慢启动速度。官方说明称只有重装才能重新打开，实际可以通过修改注册表强行启用。
- 病毒和威胁防护 → 病毒和威胁防护设置：暂时关闭实时保护、云提供的保护、自动提交样本和篡改防护。
- 病毒和威胁防护 → 添加或删除排除项：把硬盘分区（C、D、E、F）按需加入排除项。
- 防火墙和网络保护：关闭 Windows 防火墙，否则打开游戏时会弹窗。
- 按 Win+R 输入 `gpedit.msc` 打开本地组策略编辑器，找到 计算机配置 → 管理模板 → Windows 组件 → Windows 安全中心 → 通知 → 隐藏所有通知，把“未配置”改为“已启用”。这样安全中心不再弹出通知。

![智能应用控制](https://image.coolapk.com/feed/2024/0306/02/13728628_954e2185_3996_7092_48@1920x1130.png.m.jpg)
![病毒和威胁防护设置](https://image.coolapk.com/feed/2024/0306/02/13728628_3606fc9b_3996_71_62@1920x1200.png.m.jpg)
![添加排除项](https://image.coolapk.com/feed/2024/0306/02/13728628_588888f9_3996_711_667@689x532.png.m.jpg)
![关闭防火墙](https://image.coolapk.com/feed/2024/0306/02/13728628_bd81221a_3996_7114_288@1920x1200.png.m.jpg)
![组策略编辑器](https://image.coolapk.com/feed/2024/0306/02/13728628_4184561f_4000_9011_709@1920x1200.png.m.jpg)

上面几项的等价命令（管理员终端；篡改防护开着时 `Set-MpPreference` 会失败，先在界面里关掉）：

```powershell
# 关闭实时保护、云提供的保护、自动提交样本
Set-MpPreference -DisableRealtimeMonitoring $true
Set-MpPreference -MAPSReporting Disabled -SubmitSamplesConsent NeverSend

# 按分区添加排除项
Add-MpPreference -ExclusionPath 'C:\', 'D:\', 'E:\'

# 关闭三个方向的 Windows 防火墙
Set-NetFirewallProfile -Profile Domain, Private, Public -Enabled False
```

```cmd
:: 安全中心 → 通知：隐藏所有通知（等价于组策略里的“已启用”）
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows Defender Security Center\Notifications" /v DisableNotifications /t REG_DWORD /d 1 /f

:: 智能应用控制：0 = 关闭，1 = 评估，2 = 开启
reg add "HKLM\SYSTEM\CurrentControlSet\Control\CI\Policy" /v VerifiedAndReputablePolicyState /t REG_DWORD /d 0 /f
```

按以上设置，电脑基本处于无防护状态。请根据需要恢复安全中心的防护，或改用第三方杀毒软件。

不建议移除或屏蔽安全中心：它已集成在系统中，移除会导致系统不稳定；屏蔽可能让部分软件的运行环境异常，即使之后恢复，也有概率继续报错。

## 7. 修复 DirectX 组件

部分应用依赖 DirectX 组件，即使不通过游戏平台启动也可能报错。用 DirectX Repair 工具修复一次即可，工具下载与常用运行库清单我整理在 [Windows 常用软件](/posts/cyrjtj/1/) 里。

![DirectX Repair 工具](https://image.coolapk.com/feed/2024/0306/02/13728628_3cec3a9f_4000_9017_367@756x726.png.m.jpg)

不想装第三方工具的话，系统自带的组件修复命令能解决大部分“缺少组件/DLL”的报错，先修映像再修系统文件，完成后重启：

```cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

如果报错的是 VC++ 运行库或 .NET 桌面运行时缺失，用 winget 直接补齐：

```powershell
winget install --id Microsoft.VCRedist.2015+.x64
winget install --id Microsoft.DotNet.DesktopRuntime.8
```

## 8. 系统设置逐项检查

以下各项按“设置路径：操作”的形式排列，按需调整。

- 系统 → 屏幕 → 显示卡 → 默认图形设置：打开三个选项。集显性能较弱时效果有限。
- 系统 → 通知：按需设置。我的做法是打开请勿打扰，时间段设为 0:00 到 23:59。
- 系统 → 电源和电池：按需设置。
- 系统 → 存储 → 存储感知：勾选清理临时文件，自动用户内容清除设为“开”，“配置清理计划”按需设置。
- 系统 → 就近共享：关闭。
- 系统 → 远程桌面：关闭。
- 系统 → 剪贴板：按需设置。这个功能会保留截图，也能避免截图被意外清除。
- 蓝牙和其他设备 → 触摸板：取消勾选“连接鼠标时让触摸板保持打开状态”，避免误触。
- 个性化 → 锁屏界面：关闭“在锁屏界面上获取花絮、提示、技巧等”。
- 个性化 → 开始：按需设置。
- 个性化 → 任务栏：关闭任务栏项里的“聊天”。搜索项不必处理，按 Win 键唤出开始菜单后直接输入即可调用搜索。
- 个性化 → 主题 → 相关设置 → 桌面图标设置：按需设置；想换成 macOS 风格图标可以照 [让 Windows 用上 mac OS 26 同款图标](/posts/win-icon/让-windows-用上-mac-os-26-同款图标/) 来做。
- 应用 → 启动：关闭不需要的启动项。
- 辅助功能 → 键盘 → 粘滞键：关闭所有选项。
- 隐私和安全性 → 常规：关闭所有选项。
- 隐私和安全性 → 诊断和反馈：关闭所有选项，反馈频率设为“从不”。
- 隐私和安全性 → 活动历史记录：关闭“在此设备上存储我的活动历史记录”，并清除此账户的活动历史记录。
- Windows 更新 → 高级选项：关闭所有选项；在“其他选项”的传递优化中关闭“允许从其他电脑下载”。
- 文件资源管理器（按 Win+E 打开）→ 查看：勾选“项目复选框”“文件扩展名”“隐藏的项目”。

![默认图形设置](https://image.coolapk.com/feed/2024/0306/02/13728628_6883a7a9_4000_902_794@765x783.png.m.jpg)
![请勿打扰](https://image.coolapk.com/feed/2024/0306/02/13728628_9785463e_4000_9023_644@1412x1041.png.m.jpg)
![电源和电池](https://image.coolapk.com/feed/2024/0306/02/13728628_43108c11_4000_9029_301@1415x1040.png.m.jpg)
![存储感知](https://image.coolapk.com/feed/2024/0306/02/13728628_63be7215_4000_9032_765@678x970.png.m.jpg)
![就近共享](https://image.coolapk.com/feed/2024/0306/02/13728628_5e49835a_4000_9037_760@692x452.png.m.jpg)
![远程桌面](https://image.coolapk.com/feed/2024/0306/02/13728628_a0582218_4000_9045_733@1393x441.png.m.jpg)
![触摸板](https://image.coolapk.com/feed/2024/0306/02/13728628_963ea049_4000_9052_997@1405x353.png.m.jpg)
![开始菜单设置](https://image.coolapk.com/feed/2024/0306/02/13728628_6bd32526_4004_4353_603@1406x984.png.m.jpg)
![任务栏设置](https://image.coolapk.com/feed/2024/0306/02/13728628_3c78a3d4_4004_4363_810@1403x1029.png.m.jpg)
![桌面图标设置](https://image.coolapk.com/feed/2024/0306/02/13728628_6a07bc28_4004_4369_747@661x816.png.m.jpg)
![关闭启动项](https://image.coolapk.com/feed/2024/0306/02/13728628_59599fda_4004_4379_540@762x970.png.m.jpg)
![粘滞键选项](https://image.coolapk.com/feed/2024/0306/02/13728628_de4d76c8_4004_4382_146@1422x734.png.m.jpg)
![常规](https://image.coolapk.com/feed/2024/0306/02/13728628_45a2398b_4004_4392_148@1423x944.png.m.jpg)
![诊断和反馈](https://image.coolapk.com/feed/2024/0306/02/13728628_919cb2b4_4004_4394_660@1408x1048.png.m.jpg)
![传递优化](https://image.coolapk.com/feed/2024/0306/02/13728628_209173fa_4004_4399_654@1407x861.png.m.jpg)
![显示隐藏的项目](https://image.coolapk.com/feed/2024/0306/02/13728628_abd9157f_4004_4406_487@1920x1200.jpeg.m.jpg)

上面绝大部分开关都能用命令一次设完，省得一层层点（管理员终端，改完注销或重启生效）：

```cmd
:: 隐私和安全性 → 常规：关闭广告 ID、应用启动跟踪、建议内容、静默安装应用
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo" /v Enabled /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v Start_TrackProgs /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" /v SubscribedContent-338389Enabled /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" /v SilentInstalledAppsEnabled /t REG_DWORD /d 0 /f

:: 系统 → 就近共享：关闭
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\System" /v EnableMmx /t REG_DWORD /d 0 /f

:: 系统 → 远程桌面：关闭
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 1 /f

:: 个性化 → 任务栏：关闭“聊天”
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v TaskbarMn /t REG_DWORD /d 0 /f

:: 个性化 → 锁屏界面：关闭花絮、提示、技巧
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" /v RotatingLockScreenOverlayEnabled /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" /v SubscribedContent-338387Enabled /t REG_DWORD /d 0 /f

:: 隐私和安全性 → 诊断和反馈：反馈频率设为“从不”
reg add "HKCU\Software\Microsoft\Siuf\Rules" /v NumberOfSIUFInPeriod /t REG_DWORD /d 0 /f

:: 隐私和安全性 → 活动历史记录：不存储、不上传
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\System" /v EnableActivityFeed /t REG_DWORD /d 0 /f
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\System" /v PublishUserActivities /t REG_DWORD /d 0 /f
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\System" /v UploadUserActivities /t REG_DWORD /d 0 /f

:: Windows 更新 → 传递优化：不从其它电脑下载（0 = 只走 HTTP）
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\DeliveryOptimization" /v DODownloadMode /t REG_DWORD /d 0 /f

:: 辅助功能 → 粘滞键：关闭全部快捷方式（506 = 全关）
reg add "HKCU\Control Panel\Accessibility\StickyKeys" /v Flags /t REG_SZ /d 506 /f

:: 文件资源管理器：项目复选框、文件扩展名、隐藏的项目、打开“此电脑”
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v AutoCheckSelect /t REG_DWORD /d 1 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v HideFileExt /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v Hidden /t REG_DWORD /d 1 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v LaunchTo /t REG_DWORD /d 1 /f
```

文件资源管理器还有两处设置：点右侧“…”→ 选项，把“打开文件资源管理器时打开”设为“此电脑”；下方“隐私”中的三个选项（显示最近使用的文件、显示常用文件夹、显示来自 Office.com 的文件）按需勾选，然后保存。

![设置文件资源管理器起始页](https://image.coolapk.com/feed/2024/0306/02/13728628_00dfe624_4008_1915_95@645x857.png.m.jpg)

## 9. 精简显卡右键菜单，恢复 Windows 10 样式

第一步，按显卡品牌去掉右键菜单里的多余项（NVIDIA app 与驱动的下载链接见 [Windows 常用软件](/posts/cyrjtj/1/)）。

| 显卡 | 操作 |
| --- | --- |
| AMD（A 卡） | 按 Win+R 输入 `regedit` 打开注册表编辑器，把图中路径下的 `ApplicationId` 重命名为 `0ApplicationId`。 |
| NVIDIA（N 卡） | 打开 NVIDIA 控制面板，在左上角“桌面”菜单中取消勾选“显示通知托盘图标”和“添加桌面上下文菜单”。 |
| Intel（I 卡） | 打开 Intel 显卡控制中心，在设置里隐藏桌面上下文菜单和通知托盘图标。 |

![注册表](https://image.coolapk.com/feed/2024/0306/02/13728628_7adbf341_4008_1921_7@1920x1200.png.m.jpg)
![NVIDIA 控制面板](https://image.coolapk.com/feed/2024/0306/02/13728628_a6696ff4_4008_1929_758@384x156.png.m.jpg)

AMD 那一步的注册表路径会随驱动版本变化，交给 PowerShell 自己找更稳：把匹配到的 `ApplicationId` 改名后，右键菜单里的 AMD 项就不再出现。

```powershell
Get-ChildItem 'HKLM:\SOFTWARE\Classes\PackagedCom\Package' |
  Where-Object PSChildName -like 'AdvancedMicroDevicesInc*' |
  ForEach-Object {
    $server = Join-Path $_.PSPath 'Server\0'
    if (Get-ItemProperty -Path $server -Name ApplicationId -ErrorAction SilentlyContinue) {
      Rename-ItemProperty -Path $server -Name ApplicationId -NewName 0ApplicationId
    }
  }
```

第二步，把 Windows 11 的右键菜单换回 Windows 10 样式。打开 CMD 或终端，执行下面的命令：

```cmd
reg add "HKCU\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32" /f /ve
```

命令的作用是清除该 CLSID 的默认值，让系统使用旧版右键菜单。执行后重启资源管理器或重启电脑即可生效。

不想重启电脑的话，重启一次资源管理器就够了：

```cmd
taskkill /f /im explorer.exe & start explorer
```

## 10. 停用休眠文件，关闭快速启动

系统装在 SSD 上时，建议关闭快速启动。

以管理员身份打开终端，执行：

```cmd
powercfg -h off
```

`-h off` 会关闭休眠并删除休眠文件，快速启动同时失效。

如果该方法无效，可以执行 `powercfg /h on` 让“快速启动”选项重新出现，再打开 控制面板 → 电源选项 → 选择电源按钮的功能，手动关闭快速启动。

其它几条相关命令：

```cmd
:: 查看本机支持与当前生效的睡眠状态（S1–S4、快速启动）
powercfg /a

:: 只关快速启动，保留休眠功能
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Power" /v HiberbootEnabled /t REG_DWORD /d 0 /f

:: 真正的完全关机（快速启动开着时，“关机”只是混合关机）
shutdown /s /f /t 0
```

为什么建议关闭：

系统工作状态分为 S1 到 S4 四种，快速启动属于 S4。关机后设备并未完全断电，而是处于极低功耗状态，关机前内存中的数据会写入硬盘，下次开机时再读回内存。硬件层面它仍属于关机，系统层面则多了“写入内存转储、开机读回”这一步。

关闭快速启动的收益是减少 SSD 读写。开启后每次开关机都会产生大量读写，转储文件约为内存大小的 50%–75%，还会占用 C 盘空间，机制与休眠相同。另外，系统出现故障时，单纯的开关机可能无法解决问题，仍需重启或使用命令行完全关机。

如果设备配置较低，且目前没有出现故障，则不建议关闭。

## 11. 关闭不需要的设备服务

使用“Windows 11 轻松使用”工具可以关闭不需要的设备服务。关闭系统服务前，建议先按第 14 节创建还原点，以便出现问题时回退。

![“Windows 11 轻松使用”工具](https://image.coolapk.com/feed/2024/0306/02/13728628_d4c6401f_4008_1933_805@1181x636.png.m.jpg)

手工翻服务列表容易误伤，先用命令看清哪些在跑，再逐个处理：

```powershell
# 列出正在运行的服务（服务名比显示名可靠）
Get-Service | Where-Object Status -eq 'Running' |
  Sort-Object DisplayName | Format-Table -AutoSize Name, DisplayName

# 例：停用诊断跟踪服务，并设为手动启动以便随时恢复
Stop-Service -Name 'DiagTrack' -Force
Set-Service  -Name 'DiagTrack' -StartupType Manual
```

## 12. Edge 浏览器设置

禁止 Edge 自动更新：按 Win+R 输入 `services.msc` 打开服务页面，找到两个 Microsoft Edge 更新服务，把启动类型都改为“禁用”。

服务页面里那两个 Edge 更新服务也能用命令一次改完（管理员终端）：

```cmd
sc stop edgeupdate
sc config edgeupdate start= disabled
sc stop edgeupdatem
sc config edgeupdatem start= disabled
sc stop MicrosoftEdgeElevationService
sc config MicrosoftEdgeElevationService start= disabled
```

![禁止 Edge 自动更新](https://image.coolapk.com/feed/2024/0306/02/13728628_d83e0509_4008_194_943@1440x966.jpeg.m.jpg)

设置完成后效果如下。

![效果](https://image.coolapk.com/feed/2024/0306/02/13728628_c0ea60b9_4008_1944_923@1264x416.png.m.jpg)

另外关闭 Edge 中影响性能的选项。

影响性能的那几项也能直接写进注册表（启动增强、关闭后继续在后台运行）：

```cmd
reg add "HKLM\SOFTWARE\Policies\Microsoft\Edge" /v StartupBoostEnabled /t REG_DWORD /d 0 /f
reg add "HKLM\SOFTWARE\Policies\Microsoft\Edge" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f
```

![Edge 设置](https://image.coolapk.com/feed/2024/0306/02/13728628_537c2d4b_4008_1954_821@1920x1200.png.m.jpg)

## 13. 检查第三方软件设置

逐个检查已安装的第三方软件，关闭不需要的功能、弹窗和广告。两篇现成的例子：[给 Steam 加点得劲魔法❤️ — Steam 优化小技巧](/posts/steam-extension/steam-extension/) 是改软件本身的设置，[去除 获取打开此'ms-gamebar'链接的应用 的弹窗](/posts/tanchaung/no/) 是清系统层面的骚扰弹窗。

## 14. 设置系统还原

建议开启系统还原。它能在软件故障时把系统回退到某个时间点，作为应急手段。

打开 设置 → 系统 → 系统信息 → 高级系统设置 → 系统保护。

![系统保护](https://image.coolapk.com/feed/2024/0306/02/13728628_9e4ac18d_4008_1961_917@682x840.png.m.jpg)

系统还原点即使系统无法进入也可以使用。

![确认系统还原](https://image.coolapk.com/feed/2024/0306/02/13728628_db3454e8_4008_1969_145@943x836.png.m.jpg)

需要注意：系统还原不会删除个人文件，但会卸载自还原点之后安装的软件。

命令行版更省事：开保护、立刻建一个还原点，顺手解除“24 小时只能建一个”的限制。

```powershell
# 为 C 盘开启系统保护，其它分区换盘符即可
Enable-ComputerRestore -Drive 'C:\'

# 立刻创建一个还原点
Checkpoint-Computer -Description 'tweak-before' -RestorePointType MODIFY_SETTINGS

# 默认每 24 小时才能建一个还原点，反复折腾时把限制关掉
Set-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\SystemRestore' `
  -Name SystemRestorePointCreationFrequency -Value 0 -Type DWord
```

## 15. 不建议新手做的操作

- 修改系统文件和注册表。
- 使用第三方杀毒软件更改系统设置。
- 关闭“用户账户控制设置”（UAC）。
- 下载来源不明的软件。
- 随意改动硬盘分区。
- 使用第三方软件修改引导文件。
- 更换系统默认字体。

## 16. 其他经验

- 网上常见的“优化教程”多建议关闭系统动画来提升性能，实际收益有限。目前被证实有效的调整主要是两项：

  一是关闭 VBS 和基于 VBS 的 HVCI。代价是失去部分常驻安全防护，并且无法使用虚拟化功能，例如 WSA、模拟器、虚拟机和 Windows 沙盒，部分软件的运行也会受影响。

  二是双击 F11 让资源管理器提速。原理可能是打断资源管理器的索引维护，并在全屏模式下调整硬件资源调用。

  至于高性能、卓越性能等电源计划，只要不把视频线接在集显上、不在不插电源时运行大型游戏，调整它的意义不大。软件测试中平衡模式确实存在一定延迟，但实际使用中几乎感知不到。对移动设备来说，高功耗的电源计划还会让 CPU 长时间高负载，最终撞温度墙降频，并不划算。

- 在控制面板中关闭“提高鼠标精准度”。早期鼠标使用内置橡胶轮，现在多为光电组件，该选项没有保留必要。

- AMD 平台可以尝试在设备管理器 → 系统设备中停用“高精度时间计时器”。据称能提升游戏帧数，实测差距约 1–2 帧。

也可以直接用 PowerShell 找出来停用，省得在设备管理器里一层层翻：

```powershell
Get-PnpDevice -Class System |
  Where-Object FriendlyName -match '高精度|High Precision' |
  Disable-PnpDevice -Confirm:$false
```

这一节里能用命令完成的几项，一并放在这里（均在管理员终端执行）：

```cmd
:: 关闭内存完整性（HVCI）
reg add "HKLM\SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity" /v Enabled /t REG_DWORD /d 0 /f

:: 关闭 Hyper-V 启动层（VBS 依赖它），用模拟器/虚拟机的人别执行
bcdedit /set hypervisorlaunchtype off

:: 确认启动配置已写入
bcdedit /enum {current}
```

```cmd
:: 查看本机全部电源计划与 GUID
powercfg /list

:: 切回平衡模式
powercfg /setactive SCHEME_BALANCED
```

```cmd
:: 关闭“提高鼠标精准度”，等价于把鼠标曲线三个值清零
reg add "HKCU\Control Panel\Mouse" /v MouseSpeed /t REG_SZ /d 0 /f
reg add "HKCU\Control Panel\Mouse" /v MouseThreshold1 /t REG_SZ /d 0 /f
reg add "HKCU\Control Panel\Mouse" /v MouseThreshold2 /t REG_SZ /d 0 /f
```

## 17. 选 Windows 10 还是 Windows 11

目前手边有 4 台设备，3 台笔记本、1 台台式机，Windows 10 和 Windows 11 都在使用。

如果你喜欢 Windows 11 的界面，又希望保留 Windows 10 的操作逻辑，可以靠美化包和第三方工具实现。Windows 10 现已支持大小核调度，兼容性没有问题，实在不行还有补丁可选。AMD 平台出厂预装 Windows 11 的设备，没必要大费周章回退 Windows 10。

![Windows 10 和 11 都有的问题](https://image.coolapk.com/feed/2024/0306/02/13728628_5d3a4b7c_4011_4717_227@1432x556.jpeg.m.jpg)

以上均为个人使用经验，仅供参考。