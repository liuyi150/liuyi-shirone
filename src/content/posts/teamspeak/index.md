---
title: 真的是最好用的语音软件吗 — TeamSpeak 从部署到使用
description: 带你了解最好用的语音软件
published: 2026-02-15
image: https://raw.githubusercontent.com/gucrin/RyuChan-Pic/main/img/1.5889197846586983E9.jpeg
draft: false
series: self-hosted-voice
seriesOrder: 1
alias: "teamspeak/teamspeak"
tags:
  - 语音
  - 自托管
category: 技术
---

## 前言
前段时间把 MC 小服开起来之后，我和朋友们就开始了愉快的开荒时期。而玩游戏时语音软件是必不可少的，而我，一个喜欢折腾的小女孩，是肯定不会错过这次机会滴，而本次折腾的目标就是… TeamSpeak！

## 介绍
TeamSpeak 是一款硬核的实时语音工具。于 2001 年发布。它以**极低延迟**、**超高语音质量**和**极低系统占用**闻名。相较于 Discord （国内的YY、Kook、Oopz 等），TS **无广**而且**界面简洁**，是和朋友开黑的不二之选。

## 部署服务端

::: tip TIP
请根据您服务器实际运行的系统选择对应的安装包，本文章基于 Windows 系统讲解！
:::


首先前往 [官网](https://www.teamspeak.com/en/downloads/) 下载 Server 端。例如 Windows 平台的 Server 64-bit 3.13.7，下载完成后进行安装即可。

首次启动服务器，应有一个如下图所示的窗口!
![服务器密钥](./IMG_20260216_000037.jpg)
请 ==一定一定一定保存好 Server Admin Privilege Key== ，这个密钥 ==只会出现这一次== ，后面我们还需要使用它！

接下来回到 TeamSpeak 的客户端，连接上你的服务器，首次连接客户端会提示你输入 Priviledge Key，那我们就把刚刚保存好的 Key 给输入进去，这样你就是这个服务器唯一的管理员了乀(ˉεˉ乀)
```yaml
services:
  teamspeak:
    image: teamspeak
    restart: always
    ports:
      - 9987:9987/udp
      - 10011:10011
      - 30033:30033
    environment:
      TS3SERVER_DB_PLUGIN: ts3db_mariadb
      TS3SERVER_DB_SQLCREATEPATH: create_mariadb
      TS3SERVER_DB_HOST: db
      TS3SERVER_DB_USER: root
      TS3SERVER_DB_PASSWORD: example
      TS3SERVER_DB_NAME: teamspeak
      TS3SERVER_DB_WAITUNTILREADY: 30
      TS3SERVER_LICENSE: accept
  db:
    image: mariadb
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: example
      MYSQL_DATABASE: teamspeak
```

🎉恭喜你，属于你自己的 TeamSpeak 服务器已经部署完成！

## 使用
当然是先告诉你的朋友你的 TeamSpeak 服务器的 IP 地址啊，个人推荐绑个域名更好记也更好看一些(*/∇＼*)
然后就是根据使用习惯调整软件设置了，TS 的语音设置十分详细各位可以自行摸索一下～

一些小技巧：
1. 创建分割线可以使用 cspacer0，这样分割线的文本就会居中了
2. 服务器横幅可以改成固定比例调整大小，这样图片就会根据你的窗口大小来自适应了
