---
title: 去除 获取打开此'ms-gamebar'链接的应用 的弹窗
description: 这个好烦啊
published: 2026-04-19
draft: false
alias: "tanchaung/no"
tags:
  - 游戏
  - 美化
category: 游戏
---

## 前言
如果你删过了系统自带的原生xbox组件，那你很大概率见过这个弹窗  
为什么会出现这个弹窗？  
我受够了 Win11 自带的 Xbox 组件。它的本意是好的，在接入手柄的时候，它会在后台默默启动，然后你可以使用手柄上的按键快捷截图。但有些时候，我们需要安静的游戏时间，或者要顾及电脑性能，所以决定删掉 Xbox 组件。  
这就是噩梦的开端。你一定会发现，每次接入 Xbox 手柄时，系统都会弹出一个弹窗，进程名叫 OpenWith.exe。它的功能就是弹出“你要如何打开这个文件 / 选取应用”的对话框。  
问题不是这个进程本身带来的，它只是 Windows 自带的兜底机制。背后的原因就是你删掉的 Xbox 组件：底层硬件服务在手柄接入时，依然试图在后台默默通过协议唤醒组件；因为它找不到被删除的软件，无法处理这个协议，所以弹窗出现了。  
## 极简 Debug 过程
为了找出具体是哪条协议在作祟，常规的系统事件查看器（Event Viewer）是无效的，因为在系统底层逻辑里，唤醒操作本身没有报错，只是应用层没有响应。  
通过使用 Process Monitor (Procmon) 抓取手柄接入瞬间的底层日志，得出了以下结论：  
手柄接入时，svchost.exe (即插即用服务) 会向 Explorer.exe 发出指令，疯狂查询当前用户注册表下的 HKCU\Software\Classes\ms-gamebar 协议。很多人（包括我）最初的直觉是进注册表把 ms-gamebar 彻底删掉。但这是一个陷阱——你删得越干净，系统越是找不到处理程序，就越会触发防呆机制，强制弹出 OpenWith.exe 让你手动选应用。  
## 结论与解决方案
既然系统的底层逻辑是“必须找到一个程序来处理这个协议”，堵不如疏，我们直接给它造一个伪装的空协议。
将系统的呼叫重定向到 %SystemRoot%\System32\systray.exe。这是一个极其小巧的 Windows 古董内置组件，不带参数运行时，它会瞬间静默退出，不会有任何界面和后台残留。系统以为任务完成了，弹窗也就彻底消失了。  
新建一个文本文档，将以下代码复制进去，保存并重命名为 FakeGameBar.bat。直接双击运行一次，即可永久解决。  
```bat
@echo off
title Final Fix for Gamepad Popup - Black Hole Protocol
color 0A
echo Injecting fake protocol handler...
:: Create a black hole for ms-gamebar protocol
reg add "HKCU\Software\Classes\ms-gamebar" /f /ve /d "URL:ms-gamebar" >nul
reg add "HKCU\Software\Classes\ms-gamebar" /f /v "URL Protocol" /d "" >nul
reg add "HKCU\Software\Classes\ms-gamebar" /f /v "NoOpenWith" /d "" >nul
reg add "HKCU\Software\Classes\ms-gamebar\shell\open\command" /f /ve /d "\"%SystemRoot%\System32\systray.exe\"" >nul
:: Create a black hole for ms-gamingoverlay protocol
reg add "HKCU\Software\Classes\ms-gamingoverlay" /f /ve /d "URL:ms-gamingoverlay" >nul
reg add "HKCU\Software\Classes\ms-gamingoverlay" /f /v "URL Protocol" /d "" >nul
reg add "HKCU\Software\Classes\ms-gamingoverlay" /f /v "NoOpenWith" /d "" >nul
reg add "HKCU\Software\Classes\ms-gamingoverlay\shell\open\command" /f /ve /d "\"%SystemRoot%\System32\systray.exe\"" >nul
echo Injection complete! Protocol routed to void.
echo Please plug in your controller to test.
pause
```