---
title: 让 Windows 用上 mac OS 26 同款图标
published: 2026-03-30
description: 哎呦我大玻璃图标
draft: false
alias: "win-icon/让-windows-用上-mac-os-26-同款图标"
tags:
  - 系统
  - 美化
category: 技术
---

## 前言
我很喜欢 mac OS 的图标设计，于是研究出了一个方法可以把 mac OS 的图标引入到 Windows 使用。

## 工具网站
### HQ ICON
::github{repo="YuKongA/HQ-ICON"}
[作者自己域名](https://icon.yukonga.top/) 或 [Github Page](https://yukonga.github.io/HQ-ICON/)  
这个网站可以从 App Store 获取高清应用图标

::: important 注意
由于 Apple 有时会对 Android UA 进行限制，Android 设备查询时可能只会返回一个名称完全匹配的结果。如遇此问题，可以尝试使用 [App](https://github.com/YuKongA/HQ-ICON_Compose/releases) 版本绕过这个限制。
:::

### PNG 转 ICO
[PNG转ICO - 在线转换图标文件](https://www.aconvert.com/cn/icon/png-to-ico/)
简单的图片转换网站，支持多分辨率 (最高512×512) 的 ICO 格式转换

## 操作过程
### 下载图标
在 HQ ICON 中搜索对应软件的图标，点击图标即可下载
#### 筛选条件
查询类型  一般选 iOS  
查询数量  按个人喜好选择  
国家地区  CN 搜不到的切 US 或其他国家地区  
裁切方式  推荐官方圆角  
图像格式  PNG  
图像尺寸  1024px  
### 转换图标文件
打开 PNG 转 ICO 网站  
图标类型：多分辨率图标  
图标尺寸：16x16 至 256x256 全部勾选  
然后将转换好的文件下载下来  

## 修改桌面图标
右键桌面上的任意图标，点击属性 - 快捷方式 - 更改图标  
然后选择对应转换好的图标文件即可

