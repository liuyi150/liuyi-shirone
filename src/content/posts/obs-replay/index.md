---
title: 比 N 卡回放还好用？OBS Studio 回放配置教程
published: 2026-03-29
description: OBS 真不错
draft: false
alias: "obs-replay/比-n-卡回放还好用obs-studio-回放配置教程"
tags:
  - 游戏
category: 技术
---

## 前言
我在玩游戏的过程中总会打出精彩操作，为了能够保存下来我选择使用 OBS Studio 的回放缓存功能，并配合插件来满足我的使用需求~  
我会在接下来的部分介绍我的 OBS 设置以及插件设置方法，希望能够帮到你  

## 软件及插件下载
### OBS Studio
::github{repo="obsproject/obs-studio"}
也可以前往 [OBS 官网](https://obsproject.com/download) 下载

用于直播和屏幕录制的免费开源软件

### OBS Notifier
::github{repo="DmitriySalnikov/OBSNotifier"}
也可以前往 [OBS 论坛](https://obsproject.com/forum/resources/obs-notifier.1625/) 下载

一款简单的插件，用于在桌面上显示 OBS 的通知

### Replay Buffer - move to folder
::github{repo="YelovSK/replay-buffer-move-to-folder"}
也可以前往 [OBS 论坛](https://obsproject.com/forum/resources/replay-buffer-move-to-folder.2055/) 下载

一款简单的插件，会根据当前活动窗口，将 OBS 回放缓存录制的内容移动到相应的文件夹中

### CoreAudio - AAC
::github{repo="kiki-kiko/iTunes-12.3.1.23"}
只需要下载 AppleApplicationSupport64.msi 和 AppleMobileDeviceSupport6464.msi 即可

来自 Apple 的 ACC 320 Kbps 高音质编码器

## OBS Studio 配置
### 直播设置
音频编码器：CoreAudio AAC  
视频编码器：NVIDIA NVENC H.264  
重新缩放输出：已禁用  

### 录制设置
录像路径：自定义或保持默认  
录像格式：Matroska 视频 (.mkv)  
视频编码器：NVIDIA NVENC H.264  
音频编码器：CoreAudio AAC  
音轨：1 2 3 4 5 6 全选  
重新缩放输出：已禁用  

### 编码器设置
比特率控制：恒定比特率 ( CBR )  
比特率：10000 Kbps  
关键帧间隔 (秒，0 ＝ 自动)：0 s  
预设： P4  
调节：高质量  
多次编码模式：二次编码 (1/4 分辨率)  
配置文件：high  
前向考虑：关闭  
自适应量化：开启  
B 帧：2

### 快捷键设置
在 OBS Studio 的设置 - 快捷键中，可以修改回放缓存的快捷键  
我设置的是 Ctrl + Alt + Shift

### 快捷方式设置
#### 属性
在桌面右键 OBS Studio 图标，选择属性，在目标栏的 obs64.exe 后加入下方的启动参数  
```text
--startreplaybuffer --minimize-to-tray
```
第一条参数是打开软件时启动回放缓存，第二条参数是启动时立即最小化到任务托盘  

#### 兼容性
转到兼容性面板，勾选 以管理员身份运行此程序  

这是为了OBS快捷键能够在游戏内正常生效

## OBS Notifier 设置
### 连接 WebSocket 服务器
打开 OBS Studio，在上方工具栏中选择 工具 - WebSocket 服务器设置  
选择 开启 WebSocket 服务器
然后选择 显示连接信息，复制服务器密码  

回到 OBS Notifier, WebSocket 服务器地址如下填写
```text
localhost:4455
```
服务器密码则是刚刚在 OBS Studio 复制的服务器密码，复制粘贴即可连接到 OBS Studio 了  

### 开机启动和跟随关闭
选择 开机启动，并点击右边的 从OBS开始，OBS Notifier 会生成一个自动启动脚本，并将该脚本的路径自动复制到你的剪贴板  

回到 OBS Studio，在上方工具栏中选择 工具 - 脚本  
点击 + 号，在新弹出的窗口中点击文件地址栏并粘贴进去，删除 obs_notifier_autostart.lua 再回车，即可成功添加脚本  
跟随 OBS Studio 关闭只需要选择 退出OBS时关闭此程序 (设置窗口关闭时)

### 附加参数
这里给一个我正在用的附加参数
```text
BackgroundColor = #DD0031
ForegroundColor = #000000
TextColor = #E4E4E4
SlideDuration = 400
SlideOffset = 180
LineWidth = 6.0
Scale = 1.0
MaxPathChars = 32
ClickThrough = False
ShowQuickActions = false
ShowQuickActionsColoredLine = false
QuickActionsOffset = 8.0
IconHeight = 64.0
IconPath = branding_rsx.ico
```

## Replay Buffer - move to folder 设置
安装后自动启用，可以在 OBS Studio 的工具 - 插件中查看启用情况

## 结语
现在你的 OBS Studio 应该可以承担游戏录制回放的任务了~