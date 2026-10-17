---
title: Windows 11 系统设置指北
published: 2026-10-17
description: Win 11 不好用? 跟我一起操作一下吧!
tags: [Windows11, 系统优化, 电脑玩家, 笔记本电脑]
category: 系统折腾
draft: false
alias: "windows-setup"
---

::: warning 本文由 DeepSeek v4.1 Flash 润色制作
正文与各节命令经 AI 润色整理；涉及注册表、防火墙与系统服务的操作，请先按第 12 节创建还原点再动手。
:::

网上少见 Windows 11 的系统设置教程，这里结合自己的使用体验整理一份清单，按从装机到日常使用的顺序排列。

## 0. 装机前的准备：镜像与启动盘

如果要从零装一台机器，这一步之前还有三件事要定：镜像从哪来、启动盘怎么做、要不要在镜像层面就精简。

### 镜像：优先拉集成累积更新的版本

UUP Dump 这类工具直接向微软更新服务器取包合成 ISO，可选目标版本（家庭/专业/企业）、语言与架构，并把当月累积更新一并打进镜像。好处是装完不用再排一轮补丁队列，补丁体积动辄数 GB 的月份差别很明显。

- 建议直接选择专业版 (Windows 10/11 Pro), 是 Windows 最好用的版本.
- 合成后建议校验 SHA-256，确认文件下载正确

### 制作启动盘：Rufus 与 Ventoy

这里推荐使用 Rufus 或 Ventoy, 简单来说, Rufus 只能安装一个系统, Ventoy 可以安装多个系统.
PE 推荐使用 FirPE
Rufus 的静默安装选项和通用的 `autounattend.xml` 应答文件，可以把“建本地账户、跳过 OOBE 联机、分区、语言”一次性预设好

## 1. 跳过 OOBE 和微软账户登录

OOBE 指系统首次开机时的引导设置界面。新设备可以先跳过它，进系统后再登录微软账户。

- 预装 Windows 11 的新设备，联网激活后可能影响退换货，建议先跳过 OOBE，以后登录。
- 早期版本 Windows 10（1803–1903）在 OOBE 登录账户有概率造成占用过高。Windows 11 少见这个问题，可以直接登录，省去进系统后再登录一次的麻烦。
- Windows 11 默认联网即激活设备，跳过 OOBE 也就一并跳过了微软账户登录。
- 用户名不要用中文，否则部分软件会莫名报错，例如 Steam。习惯用中文名字的话，用拼音代替。

OOBE 界面按 `Shift + F10` 可以调出命令提示符，执行下面的命令，重启后就能选“我没有 Internet 连接 → 继续执行受限设置”，用本地账户进系统：

```cmd
oobe\bypassnro
```

22H2 之后的版本移除了它，可以改用下面这条直接创建本地账户：

```cmd
start ms-cxh:localonly
```

> 更新与核实提示（截至 2026 年 10 月）：`bypassnro` 在 22H2 之后的版本被微软移除，`start ms-cxh:localonly` 属于社区流传的替代做法——两者在 26H2 上是否仍然可用，**需在 26H2 实机核实**。

## 2. 跳过引导流程的更新页面

预装了 22H2 或更低版本 Windows 11 的用户，引导流程最后一步会出现更新页面。这一步直接跳过即可。

## 3. 断网，卸载迈克菲和多余应用

先断开网络，再用 Geek Uninstaller 卸载不需要的预装软件。断网是为了阻止 Windows 更新在后台下载补丁。

- 惠普和华硕的预装系统一般带两个 McAfee 组件，建议全部卸载。
- 卸载主程序时若提示重新启动，先不要重启，让 Geek Uninstaller 清理残留文件。
- 其余可卸载的多为微软自带的 UWP 应用，例如地图、家庭、提示、录音机和小组件。小组件是否保留看需求：它对我只是广告推送页，但有人用它显示手机链接和远程遥控。

预装的 UWP 应用可以在管理员 PowerShell 里按序号挑着卸：先列出当前机器上的全部应用，再输入要卸载的序号（支持 `1,3,5` 这样多选），直接回车退出。

```powershell
$list = @(Get-AppxPackage -AllUsers | Sort-Object Name | ForEach-Object -Begin { $i = 0 } -Process {
    [pscustomobject]@{ No = ++$i; Name = $_.Name; Full = $_.PackageFullName }
})
$list | Select-Object No, Name | Format-Table -AutoSize

$pick = Read-Host '输入要卸载的序号（逗号分隔，回车退出）'
if (-not $pick) { return }

foreach ($k in ($pick -split ',')) {
    $idx = [int]$k.Trim() - 1
    if ($idx -lt 0 -or $idx -ge $list.Count) {
        Write-Host "跳过 $k" -ForegroundColor DarkYellow
        continue
    }
    $name = $list[$idx].Name
    Write-Host "卸载 $name ..." -ForegroundColor Yellow
    Get-AppxPackage -AllUsers -Name $name | Remove-AppxPackage -AllUsers
    Get-AppxProvisionedPackage -Online |
        Where-Object DisplayName -eq $name |
        Remove-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue
}
Write-Host '完成。误删的话可以在 Microsoft Store 里重新装回来。' -ForegroundColor Green
```

> 存成 `.ps1` 再运行的话，请用 **UTF-8 with BOM** 保存（VS Code 右下角切编码，或直接在 PowerShell ISE 里粘贴运行）。Windows PowerShell 5.1 默认按 ANSI 读脚本，中文提示会乱码甚至报语法错。

迈克菲这类传统程序仍建议用 Geek Uninstaller（能连服务、计划任务和注册表一起清）。

### 工具现状（截至 2026 年 10 月）

| 工具 | 状态 | 用途与说明 |
| --- | --- | --- |
| Geek Uninstaller | 仍在更新，最新 1.6.0 | 卸载传统程序并清理残留，依然是首选 |
| Win11Debloat | Release 2026.08.24 | 脚本化批量卸载 90+ 预装应用、关闭遥测与推荐内容，提供图形界面与中文；适合装完系统一次性铺底 |
| Winhance | v26.06.12 | 同类批量配置工具，界面已升级到 WinUI 3；适合想要图形界面而不是脚本参数的人 |
| ZyperWin++ | 待核实 | 卸载/精简类工具，版本与维护状态以项目页为准 |
| Sparkle | 待核实 | 集成清理、DNS、SFC/DISM 等维护项的一站式工具 |
| Dism++ | 最后版本 v10.1.1002.2 | **历史工具，仅作了解**。自 2023 年起实质停更，对新版本 Windows 的组件与清理规则支持有限，不宜再当主力优化工具 |

需要提醒：这类批量工具默认会关掉一部分系统功能（搜索、遥测、Copilot 类组件等），跑完务必按第 6 节逐条复查，别把你实际要用的功能顺手关掉。

## 4. 设置 Windows 安全中心（新手请谨慎）

关闭实时防护能减少扫描开销，但电脑会处于无防护状态。不清楚用途就不要修改，或先创建还原点（见第 12 节）。

- 应用和浏览器控制 → 智能应用控制设置：“评估”改为“关闭”。智能应用控制会扫描正在启动的应用，拖慢启动速度。
- 病毒和威胁防护 → 病毒和威胁防护设置：暂时关闭实时保护、云提供的保护、自动提交样本和篡改防护。
- 病毒和威胁防护 → 添加或删除排除项 → 添加文件夹 → 直接选每个盘的根目录
- 防火墙和网络保护：关闭 Windows 防火墙，否则打开游戏时会弹窗。
- 按 Win+R 输入 `gpedit.msc` 打开本地组策略编辑器，找到 计算机配置 → 管理模板 → Windows 组件 → Windows 安全中心 → 通知 → 隐藏所有通知，把“未配置”改为“已启用”。这样安全中心不再弹出通知。


上面几项的等价脚本（管理员 PowerShell；篡改防护开着时实时保护关不掉，先在界面里手动关一遍）：

```powershell
$menu = [ordered]@{
    '1' = '关闭实时保护'
    '2' = '关闭云提供的保护与自动提交样本'
    '3' = '把 C/D/E/F 盘加入排除项'
    '4' = '关闭 Windows 防火墙（域/专用/公用）'
    '5' = '隐藏安全中心通知'
    '6' = '智能应用控制改为关闭'
}
$menu.GetEnumerator() | ForEach-Object { '{0}. {1}' -f $_.Key, $_.Value }

$pick = Read-Host '输入序号（逗号分隔，回车退出）'
if (-not $pick) { return }

foreach ($k in ($pick -split ',')) {
    switch ($k.Trim()) {
        '1' { Set-MpPreference -DisableRealtimeMonitoring $true }
        '2' { Set-MpPreference -MAPSReporting Disabled -SubmitSamplesConsent NeverSend }
        '3' { Add-MpPreference -ExclusionPath 'C:\', 'D:\', 'E:\', 'F:\' }
        '4' { Set-NetFirewallProfile -Profile Domain, Private, Public -Enabled False }
        '5' { reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows Defender Security Center\Notifications" /v DisableNotifications /t REG_DWORD /d 1 /f | Out-Null }
        '6' { reg add "HKLM\SYSTEM\CurrentControlSet\Control\CI\Policy" /v VerifiedAndReputablePolicyState /t REG_DWORD /d 0 /f | Out-Null }
        default { Write-Host "跳过 $k" -ForegroundColor DarkYellow }
    }
}
```

按以上设置，电脑基本处于无防护状态。请根据需要恢复安全中心的防护，或改用第三方杀毒软件。

不建议移除或屏蔽安全中心：它已集成在系统中，移除会导致系统不稳定；屏蔽可能让部分软件的运行环境异常，即使之后恢复，也有概率继续报错。

## 5. 修复 DirectX 组件

部分应用依赖 DirectX 组件，即使不通过游戏平台启动也可能报错。而系统自带的组件修复命令能解决大部分“缺少组件/DLL”的报错，先修映像再修系统文件，完成后重启：

```cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

如果报错的是 VC++ 运行库或 .NET 桌面运行时缺失，用 winget 直接补齐：

```powershell
winget install --id Microsoft.VCRedist.2015+.x64
winget install --id Microsoft.DotNet.DesktopRuntime.8
```
还是报错? 用 DirectX Repair 工具修复一次即可，下载与常用运行库清单我整理在 [Windows 常用软件](/posts/cyrjtj/1/) 里。

## 6. 系统设置逐项检查

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

上面绝大部分开关都能用命令一次设完，省得一层层点。下面这段是选项式脚本：列出可批量的设置项，输入序号（逗号分隔）或 `a` 全选，回车退出，改完注销或重启生效。

```powershell
function Set-Reg($Path, $Name, $Value, $Type = 'DWord') {
    if (-not (Test-Path $Path)) { New-Item -Path $Path -Force | Out-Null }
    New-ItemProperty -Path $Path -Name $Name -Value $Value -PropertyType $Type -Force | Out-Null
}

$cu = 'HKCU:\Software\Microsoft\Windows\CurrentVersion'
$ops = @(
    @{ Label = '隐私-常规：关闭广告 ID 与启动跟踪'; Do = {
            Set-Reg "$cu\AdvertisingInfo" 'Enabled' 0
            Set-Reg "$cu\Explorer\Advanced" 'Start_TrackProgs' 0
        }
    }
    @{ Label = '隐私-常规：关闭建议内容与静默安装应用'; Do = {
            Set-Reg "$cu\ContentDeliveryManager" 'SubscribedContent-338389Enabled' 0
            Set-Reg "$cu\ContentDeliveryManager" 'SilentInstalledAppsEnabled' 0
        }
    }
    @{ Label = '系统：关闭就近共享'; Do = {
            Set-Reg 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\System' 'EnableMmx' 0
        }
    }
    @{ Label = '系统：关闭远程桌面'; Do = {
            Set-Reg 'HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server' 'fDenyTSConnections' 1
        }
    }
    @{ Label = '个性化：关闭任务栏“聊天”'; Do = {
            Set-Reg "$cu\Explorer\Advanced" 'TaskbarMn' 0
        }
    }
    @{ Label = '个性化：关闭锁屏花絮、提示、技巧'; Do = {
            Set-Reg "$cu\ContentDeliveryManager" 'RotatingLockScreenOverlayEnabled' 0
            Set-Reg "$cu\ContentDeliveryManager" 'SubscribedContent-338387Enabled' 0
        }
    }
    @{ Label = '诊断和反馈：反馈频率设为“从不”'; Do = {
            Set-Reg 'HKCU:\Software\Microsoft\Siuf\Rules' 'NumberOfSIUFInPeriod' 0
        }
    }
    @{ Label = '活动历史记录：不存储、不上传'; Do = {
            Set-Reg 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\System' 'EnableActivityFeed' 0
            Set-Reg 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\System' 'PublishUserActivities' 0
            Set-Reg 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\System' 'UploadUserActivities' 0
        }
    }
    @{ Label = '传递优化：不从其他电脑下载'; Do = {
            Set-Reg 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\DeliveryOptimization' 'DODownloadMode' 0
        }
    }
    @{ Label = '粘滞键：关闭快捷方式'; Do = {
            Set-Reg 'HKCU:\Control Panel\Accessibility\StickyKeys' 'Flags' '506' 'String'
        }
    }
    @{ Label = '资源管理器：复选框、扩展名、隐藏项、打开“此电脑”'; Do = {
            Set-Reg "$cu\Explorer\Advanced" 'AutoCheckSelect' 1
            Set-Reg "$cu\Explorer\Advanced" 'HideFileExt' 0
            Set-Reg "$cu\Explorer\Advanced" 'Hidden' 1
            Set-Reg "$cu\Explorer\Advanced" 'LaunchTo' 1
        }
    }
)

for ($i = 0; $i -lt $ops.Count; $i++) { '{0,2}. {1}' -f ($i + 1), $ops[$i].Label }

$pick = Read-Host '输入序号（逗号分隔、a=全部，回车退出）'
if (-not $pick) { return }

if ($pick.Trim() -eq 'a') {
    $ops | ForEach-Object { & $_.Do }
    Write-Host '已应用全部设置，注销或重启后生效。' -ForegroundColor Green
    return
}

foreach ($k in ($pick -split ',')) {
    $idx = [int]$k.Trim() - 1
    if ($idx -ge 0 -and $idx -lt $ops.Count) {
        & $ops[$idx].Do
        Write-Host "已应用：$($ops[$idx].Label)" -ForegroundColor Green
    }
    else {
        Write-Host "跳过 $k" -ForegroundColor DarkYellow
    }
}
Write-Host '注销或重启后生效。' -ForegroundColor Yellow
```

## 7. 精简显卡右键菜单，恢复 Windows 10 样式

第一步，按显卡品牌去掉右键菜单里的多余项（NVIDIA app 与驱动的下载链接见 [Windows 常用软件](/posts/cyrjtj/1/)）。

| 显卡 | 操作 |
| --- | --- |
| AMD（A 卡） | 按 Win+R 输入 `regedit` 打开注册表编辑器，找到 `PackagedCom\Package` 下对应 AMD 的包，把 `ApplicationId` 重命名为 `0ApplicationId`。 |
| NVIDIA（N 卡） | 打开 NVIDIA 控制面板，在左上角“桌面”菜单中取消勾选“显示通知托盘图标”和“添加桌面上下文菜单”。 |
| Intel（I 卡） | 打开 Intel 显卡控制中心，在设置里隐藏桌面上下文菜单和通知托盘图标。 |


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
第二步，把 Windows 11 的右键菜单换回 Windows 10 样式。下面是一键脚本：建键并清空该 CLSID 的默认值，然后重启资源管理器。不想立刻重启的话，注释掉最后两行，重启电脑同样生效。

```powershell
$key = 'HKCU:\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32'

# 建键并清空默认值，系统就会回退到 Windows 10 的右键菜单
New-Item -Path $key -Force | Out-Null
Set-Item -Path $key -Value ''

# 重启资源管理器生效；不想重启就注释掉下面两行
Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
Start-Process explorer
```

## 8. 停用休眠文件，关闭快速启动

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

## 9. 关闭不需要的设备服务

使用“Windows 11 轻松使用”工具可以关闭不需要的设备服务。关闭系统服务前，建议先按第 12 节创建还原点，以便出现问题时回退。

手工翻服务列表容易误伤，先用脚本看清哪些在自动启动并运行，再按序号停用（停用时把启动类型改成“手动”，随时能改回来）：

```powershell
# 列出正在运行的自动启动服务，按序号停用
$list = @(Get-Service |
    Where-Object { $_.Status -eq 'Running' -and $_.StartType -eq 'Automatic' } |
    Sort-Object DisplayName |
    ForEach-Object -Begin { $i = 0 } -Process {
        [pscustomobject]@{ No = ++$i; Name = $_.Name; Display = $_.DisplayName }
    })

$list | Select-Object No, Name, Display | Format-Table -AutoSize

$pick = Read-Host '输入要停用的服务序号（逗号分隔，回车退出）'
if (-not $pick) { return }

foreach ($k in ($pick -split ',')) {
    $idx = [int]$k.Trim() - 1
    if ($idx -lt 0 -or $idx -ge $list.Count) {
        Write-Host "跳过 $k" -ForegroundColor DarkYellow
        continue
    }
    $svc = $list[$idx]
    try {
        Stop-Service -Name $svc.Name -Force -ErrorAction Stop
        Set-Service -Name $svc.Name -StartupType Manual -ErrorAction Stop
        Write-Host "已停用：$($svc.Display)（启动类型已改为手动）" -ForegroundColor Green
    }
    catch {
        Write-Host "失败：$($svc.Display) — $($_.Exception.Message)" -ForegroundColor Red
    }
}
```

## 10. Edge 浏览器设置

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




另外关闭 Edge 中影响性能的选项。

影响性能的那几项也能直接写进注册表（启动增强、关闭后继续在后台运行）：

```cmd
reg add "HKLM\SOFTWARE\Policies\Microsoft\Edge" /v StartupBoostEnabled /t REG_DWORD /d 0 /f
reg add "HKLM\SOFTWARE\Policies\Microsoft\Edge" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f
```


## 11. 检查第三方软件设置

逐个检查已安装的第三方软件，关闭不需要的功能、弹窗和广告。两篇现成的例子：[给 Steam 加点得劲魔法❤️ — Steam 优化小技巧](/posts/steam-extension/steam-extension/) 是改软件本身的设置，[去除 获取打开此'ms-gamebar'链接的应用 的弹窗](/posts/tanchaung/no/) 是清系统层面的骚扰弹窗。

## 12. 设置系统还原

建议开启系统还原。它能在软件故障时把系统回退到某个时间点，作为应急手段。

打开 设置 → 系统 → 系统信息 → 高级系统设置 → 系统保护。


系统还原点即使系统无法进入也可以使用。


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

## 13. 不建议新手做的操作

- 修改系统文件和注册表。
- 使用第三方杀毒软件更改系统设置。
- 关闭“用户账户控制设置”（UAC）。
- 下载来源不明的软件。
- 随意改动硬盘分区。
- 使用第三方软件修改引导文件。
- 更换系统默认字体。

## 14. 其他经验

- 网上常见的“优化教程”多建议关闭系统动画来提升性能，实际收益有限。目前被证实有效的调整主要是两项：

  一是关闭 VBS 和基于 VBS 的 HVCI。代价是失去部分常驻安全防护，并且无法使用虚拟化功能，例如 WSA、模拟器、虚拟机和 Windows 沙盒，部分软件的运行也会受影响。

  二是双击 F11 让资源管理器提速。原理可能是打断资源管理器的索引维护，并在全屏模式下调整硬件资源调用。

  至于高性能、卓越性能等电源计划，只要不把视频线接在集显上、不在不插电源时运行大型游戏，调整它的意义不大。软件测试中平衡模式确实存在一定延迟，但实际使用中几乎感知不到。对移动设备来说，高功耗的电源计划还会让 CPU 长时间高负载，最终撞温度墙降频，并不划算。

- 在控制面板中关闭“提高鼠标精准度”。早期鼠标使用内置橡胶轮，现在多为光电组件，该选项没有保留必要。

- AMD 平台可以尝试在设备管理器 → 系统设备中停用“高精度时间计时器”。据称能提升游戏帧数，实测差距约 1–2 帧。

这一节里能用命令完成的几项，做成一个可选脚本（管理员 PowerShell；回车退出）：

```powershell
function Set-Reg($Path, $Name, $Value, $Type = 'DWord') {
    if (-not (Test-Path $Path)) { New-Item -Path $Path -Force | Out-Null }
    New-ItemProperty -Path $Path -Name $Name -Value $Value -PropertyType $Type -Force | Out-Null
}

$ops = @(
    @{ Label = '停用“高精度时间计时器”（AMD 平台，约 1-2 帧）'; Do = {
            Get-PnpDevice -Class System |
                Where-Object FriendlyName -match '高精度|High Precision' |
                Disable-PnpDevice -Confirm:$false
        }
    }
    @{ Label = '关闭内存完整性（HVCI），重启后生效'; Do = {
            Set-Reg 'HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity' 'Enabled' 0
        }
    }
    @{ Label = '关闭 Hyper-V 启动层（VBS）：模拟器/虚拟机/WSA 用户不要选'; Do = {
            bcdedit /set hypervisorlaunchtype off | Out-Null
            bcdedit /enum '{current}'
        }
    }
    @{ Label = '电源计划切回平衡'; Do = {
            powercfg /setactive SCHEME_BALANCED
        }
    }
    @{ Label = '关闭“提高鼠标精准度”'; Do = {
            Set-Reg 'HKCU:\Control Panel\Mouse' 'MouseSpeed' '0' 'String'
            Set-Reg 'HKCU:\Control Panel\Mouse' 'MouseThreshold1' '0' 'String'
            Set-Reg 'HKCU:\Control Panel\Mouse' 'MouseThreshold2' '0' 'String'
        }
    }
)

for ($i = 0; $i -lt $ops.Count; $i++) { '{0}. {1}' -f ($i + 1), $ops[$i].Label }

$pick = Read-Host '输入序号（逗号分隔、a=全部，回车退出）'
if (-not $pick) { return }

if ($pick.Trim() -eq 'a') {
    $ops | ForEach-Object { & $_.Do }
    Write-Host '已执行全部操作。' -ForegroundColor Green
    return
}

foreach ($k in ($pick -split ',')) {
    $idx = [int]$k.Trim() - 1
    if ($idx -ge 0 -and $idx -lt $ops.Count) {
        & $ops[$idx].Do
        Write-Host "已执行：$($ops[$idx].Label)" -ForegroundColor Green
    }
    else {
        Write-Host "跳过 $k" -ForegroundColor DarkYellow
    }
}
```

## 15. 选 Windows 10 还是 Windows 11

如果你喜欢 Windows 11 的界面，又希望保留 Windows 10 的操作逻辑，可以靠美化包和第三方工具实现。Windows 10 现已支持大小核调度，兼容性没有问题，实在不行还有补丁可选。AMD 平台出厂预装 Windows 11 的设备，没必要大费周章回退 Windows 10。
