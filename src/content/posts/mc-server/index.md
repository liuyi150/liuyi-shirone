---
title: MC 服务器启动脚本的编写是如何影响玩家联机的
description: 解决了玩家无法通过 IPv6 公网访问服务器
published: 2026-02-09
image: https://raw.githubusercontent.com/gucrin/RyuChan-Pic/main/img/1.5889197846586983E9.jpeg
draft: false
alias: "mc-server/how-to-fix-ipv6-1"
tags:
  - 网络
category: 技术
---

大家好我是 Gucrin，这是本博客的第一篇文章，打算写个简单点的先试试水~

#### 事件起因
我用自己组的 NAS 开了个 MC 服务器，邀请了朋友来玩，我们互相之间直接使用游戏客户端开的存档里 **对局域网开放** 是可以正常联机的。但是朋友无法通过 IPv6 连接到我的服务器，令我百思不得其解🤔

#### 排查过程
很明显，和网络环境是没有关系的，因为我们之间是可以正常联机，说明问题出在服务器配置方面。于是我询问了 Gemini，得到的回复是:

> **即使你系统支持 IPv6，Java 在运行时有时会由于默认设置，优先使用 IPv4 栈（IPv4 Preferred），从而导致它虽然启动了，但根本不理会从 IPv6 进来的握手请求。**

所以问题就很明显了😉

#### 解决方案
只需要略微修改服务器的启动脚本即可，这里给大家贴一下我的启动脚本。

```javascript
@echo off

:: ==========================================

:: Purpur Server Startup Script (Modular) - Fixed

:: ==========================================


:: 1. JVM 参数：内存 + GC 优化 + D 属性

set JAVA_OPTS=-Xmx4G -Xms4G ^

 -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 ^

 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch ^

 -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M ^

 -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 ^

 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 ^

 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 ^

 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 ^

 -Djava.net.preferIPv4Stack=false -Djava.net.preferIPv6Addresses=true



:: 2. 核心文件

set SERVER_JAR=purpur-1.21.11-2560.jar



:: 3. 服务器参数

set SERVER_ARGS=nogui


:: 4. 执行启动

chcp 65001

echo 服务器启动中...

java %JAVA_OPTS% -jar %SERVER_JAR% %SERVER_ARGS%


pause
```

原理： 强制 Java 允许并优先处理 IPv6 连接，使其行为与客户端联机模块保持一致。
