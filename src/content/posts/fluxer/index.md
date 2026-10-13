---
title: 自建 Discord 来了！Fluxer 部署教程
description: 带你了解最新的语音软件
published: 2026-08-07
image: https://fluxer.app/blog/assets/how-i-built-fluxer-cover-960.avif
draft: false
series: self-hosted-voice
seriesOrder: 3
alias: "fluxer/自建-discord-来了fluxer-部署教程"
tags:
  - 语音
  - 自托管
category: 技术
---

# 开始使用
使用 Docker Compose 运行你自己的 Fluxer 实例。本指南将带你从一台全新的服务器开始，部署一个完整可用的自托管实例，包括：Web 应用、API 服务、网关服务（Gateway）、管理后台、媒体文件上传、搜索功能、存储系统、语音信令服务，所有服务都会通过一个公网域名统一访问。
# 你将运行的内容
该自托管技术栈由一个 Docker Compose 项目组成：
 * **Caddy** 负责终止公共 HTTP(S) 流量，或接收来自 Cloudflare Tunnel 的流量。
 * **App proxy（应用代理）** 用于提供 Fluxer Web 客户端服务，并注入实例的引导数据（bootstrap data）。
 * **API** 处理账户、身份验证、社区、消息、文件上传、管理员 API 以及实例发现。
 * **Admin dashboard（管理员仪表盘）** 是必需的，并在 `/admin` 路径下提供服务。
 * **Gateway（网关）** 处理 WebSocket 会话、在线状态、事件调度、推送分发（push fanout）以及实时事件。
 * **Messages service（消息服务）** 构建消息响应并提供历史消息服务。
 * **Media proxy（媒体代理）** 处理附件上传的中继、媒体元数据、缩略图以及对象读取。
 * **Static proxy（静态代理）** 在同一主机名下提供 Fluxer 字体、图标、表情符号、徽章、默认头像和语音客户端资源。
 * **LiveKit** 处理语音与视频信令以及 WebRTC 媒体。
 * **Postgres、Valkey、NATS、Meilisearch** 和 **SeaweedFS** 提供数据、缓存、事件、搜索以及兼容 S3 的对象存储。
应用包由自托管的 app-proxy 镜像提供；共享静态资源由独立的 `static-proxy` 容器提供。该技术栈不依赖 Fluxer 的公共静态资源主机。
# 环境要求
 * 一台可以运行 Docker Engine 的 Linux 服务器或虚拟机。
 * Docker Engine 以及 Docker Compose 插件。
 * 实例的主机名，例如 `chat.example.com`。
 * 需开放公共入站端口 `80/tcp` 和 `443/tcp`，或者使用 Cloudflare Tunnel 将主机名路由至 Caddy 容器。
 * 生产环境下的语音与视频媒体服务，需要开放通往 `7881/tcp` 和 `7882/udp` 的公共路径。
 * 至少 2 个 vCPU、4 GB 内存和 20 GB 磁盘空间。对于小型活跃社区，建议使用 4 个 vCPU 和 8 GB 及以上内存。
 * 该技术栈在空闲时占用几 GB 内存，启动阶段是负载最高的时刻，因为所有服务镜像会同时进行初始化。
## 步骤 1：安装 Docker
根据适用于你 Linux 发行版的 Docker 官方指南安装 Docker Engine：
 * [安装 Docker Engine](https://docs.docker.com/engine/install/)
 * [安装 Compose 插件](https://docs.docker.com/compose/install/linux/)
 * [Linux 安装后续步骤](https://docs.docker.com/engine/install/linux-postinstall/)

确认所安装的 Docker 版本：
```bash
docker --version
docker compose version
```
请使用 Docker Engine 24 或更高版本以及 Compose v2 插件。
## 步骤 2：下载技术栈
创建一个工作目录并下载技术栈文件：
```bash
mkdir fluxer
cd fluxer

base=https://raw.githubusercontent.com/fluxerapp/fluxer/main/deploy/self-hosting
curl -fsSLO "$base/docker-compose.yml"
curl -fsSLO "$base/Caddyfile"
curl -fsSLO "$base/livekit.yaml"
curl -fsSL "$base/.env.example" -o .env
```
你现在应该包含以下文件：
```text
Caddyfile
docker-compose.yml
livekit.yaml
.env
```
## 步骤 3：配置 .env
在 `.env` 文件顶部设置公共主机名。
对于由 Caddy 直接获取证书的普通公共服务器：
```bash
FLUXER_DOMAIN=chat.example.com
FLUXER_PUBLIC_SCHEME=https
FLUXER_PUBLIC_PORT=443
FLUXER_CADDY_SITE_ADDRESS=chat.example.com
FLUXER_VAPID_EMAIL=admin@example.com
```
对于由 Cloudflare 终止 HTTPS 并将 HTTP 转发至 Caddy 的 Cloudflare Tunnel 配置：
```bash
FLUXER_DOMAIN=chat.example.com
FLUXER_PUBLIC_SCHEME=https
FLUXER_PUBLIC_PORT=443
FLUXER_CADDY_SITE_ADDRESS=:80
FLUXER_VAPID_EMAIL=admin@example.com
```
`FLUXER_PUBLIC_SCHEME` 和 `FLUXER_PUBLIC_PORT` 描述用户在浏览器中看到的协议与端口。`FLUXER_CADDY_SITE_ADDRESS` 描述 Caddy 在技术栈内部监听的地址。

生成所需的密钥：
```bash
for key in POSTGRES_PASSWORD MEILI_MASTER_KEY FLUXER_S3_SECRET_KEY \
  FLUXER_SUDO_MODE_SECRET FLUXER_CONNECTION_INITIATION_SECRET \
  FLUXER_GATEWAY_RPC_AUTH_TOKEN FLUXER_MEDIA_PROXY_SECRET_KEY \
  FLUXER_ADMIN_SECRET_KEY_BASE FLUXER_ADMIN_OAUTH_CLIENT_SECRET \
  LIVEKIT_API_SECRET; do
  sed -i "s|^$key=.*|$key=$(openssl rand -hex 32)|" .env
done

sed -i "s|^FLUXER_MEDIA_PROXY_UPLOAD_RELAY_SECRET_BASE64=.*|FLUXER_MEDIA_PROXY_UPLOAD_RELAY_SECRET_BASE64=$(openssl rand -base64 32)|" .env

VAPID=$(docker run --rm node:24-alpine npx --yes web-push generate-vapid-keys --json)
pub=$(printf '%s' "$VAPID" | grep -o '"publicKey":"[^"]*"' | cut -d'"' -f4)
priv=$(printf '%s' "$VAPID" | grep -o '"privateKey":"[^"]*"' | cut -d'"' -f4)
sed -i "s|^FLUXER_VAPID_PUBLIC_KEY=.*|FLUXER_VAPID_PUBLIC_KEY=$pub|" .env
sed -i "s|^FLUXER_VAPID_PRIVATE_KEY=.*|FLUXER_VAPID_PRIVATE_KEY=$priv|" .env
```
除非明确知道需要修改，否则请保持以下默认设置：
 * `LIVEKIT_API_KEY=fluxer`；密钥为 `LIVEKIT_API_SECRET`。
 * `FLUXER_S3_ACCESS_KEY=fluxer`；密钥为 `FLUXER_S3_SECRET_KEY`。
 * 电子邮件功能初始状态为禁用。后续可通过 `.env` 和管理员仪表盘启用 SMTP。
::: warning 保持 `.env` 的私密性
`​.env` 包含该实例的所有密钥。请勿将其提交到代码库、粘贴到技术支持工单中或放入截图内。
:::

## 步骤 4：发布主机名
为主机名创建 DNS 记录：
 * 从 `chat.example.com` 指向服务器 IPv4 地址的 `A` 记录。
 * （可选）从 `chat.example.com` 指向服务器 IPv6 地址的 `AAAA` 记录。
保持 `FLUXER_CADDY_SITE_ADDRESS=chat.example.com`。当端口 `80/tcp` 和 `443/tcp` 可以访问服务器时，Caddy 将自动申请并续订证书。
## 步骤 5：开放防火墙
如果你使用的是直接暴露在公网上的服务器，请允许以下入站流量：
 * `22/tcp` 或你的 SSH 端口。
 * 用于 Caddy 的 `80/tcp` 和 `443/tcp`。
 * 用于 LiveKit 媒体的 `7881/tcp` 和 `7882/udp`。
如果你对 Web 流量使用了 Cloudflare Tunnel，可以在云服务商的防火墙处拦截入站的 `80/tcp` 和 `443/tcp`。同时保持 LiveKit 媒体端口关闭，除非你意图开放语音/视频媒体或正在使用 TURN 服务器。

::: warning 优先使用云服务商防火墙
Docker 发布的端口可能会绕过 UFW 等主机防火墙，因为 Docker 会安装自己的数据包过滤规则。请优先使用云服务商的防火墙或安全组来制定面向互联网的安全策略。
:::

## 步骤 6：启动技术栈
启动 Fluxer：
```bash
docker compose up -d
```
如果你使用了上述的 Cloudflare 覆盖配置，请同时启动这两个文件：
```bash
docker compose -f docker-compose.yml -f cloudflared.compose.yml up -d
```
观察启动状态：
```bash
docker compose ps
docker compose logs -f api
```
首次启动可能需要几分钟时间，因为需要下载镜像并初始化服务。`seaweedfs-init` 在创建对象存储桶后会退出，这是正常现象。
## 步骤 7：验证实例
在 Shell 中设置你的域名：
```Shell
export FLUXER_DOMAIN=chat.example.com
```
检查每一个公共 HTTP 入口点：
```Shell
for path in /_health /api/_health /gateway/_health /media/_health /admin/_health; do
  curl -fsS -o /tmp/fluxer-check -w "$path %{http_code}\n" "https://$FLUXER_DOMAIN$path"
done
```
预期结果：
```Shell
/_health 200
/api/_health 200
/gateway/_health 200
/media/_health 200
/admin/_health 200
```
检查实例发现（instance discovery）：
```Shell
curl -fsS "https://$FLUXER_DOMAIN/api/.well-known/fluxer" | jq '.features.self_hosted, .endpoints.admin, .endpoints.gateway, .endpoints.media, .endpoints.static_cdn'
```
你应该看到 `true`、以 `/admin` 结尾的管理员 URL、以 `/gateway` 结尾的网关 URL、以 `/media` 结尾的媒体 URL，以及与实例源（origin）相同的静态资源 URL。
检查 Web 应用、管理员登录页面、应用包以及静态资源容器：
```Shell
curl -fsSI "https://$FLUXER_DOMAIN" | sed -n '1,8p'
curl -fsSI "https://$FLUXER_DOMAIN/admin/login" | sed -n '1,8p'

asset=$(curl -fsS "https://$FLUXER_DOMAIN" | grep -o 'src="[^"]*/assets/[^"]*"' | head -n1 | cut -d'"' -f2)
case "$asset" in
  http*) curl -fsSI "$asset" | sed -n '1,8p' ;;
  /*) curl -fsSI "https://$FLUXER_DOMAIN$asset" | sed -n '1,8p' ;;
esac

curl -fsSI "https://$FLUXER_DOMAIN/fonts/ibm-plex.css?v=3" | sed -n '1,8p'
curl -fsSI "https://$FLUXER_DOMAIN/web/favicon-32x32.png" | sed -n '1,8p'
```
如果你使用了 Cloudflare Tunnel 并遇到了 HTTP 530 错误，这说明 Tunnel 连接器当前未建立连接，或者公共主机名路由指向了错误的服务。
## 步骤 8：创建所有者账户
打开 Web 应用：
```bash
https://chat.example.com
```
注册第一个账户。在自托管实例上，第一个被接受注册的账户将获得通配符管理员权限（wildcard admin access）。使用该账户进行首次管理员登录：
```bash
https://chat.example.com/admin
```

在管理员仪表盘中完成初始设置。至少需要审查以下内容：
 * 品牌标识与实例名称。
 * 注册模式：开放、审核或关闭。
 * 电子邮件发送。
 * 验证码策略（如果你开放了公共注册）。
 * 单一社区模式（如果你希望使用一个默认社区，而非由用户创建多个社区）。
 * 语音区域与 LiveKit 可达性（如果你启用了语音功能）。
## 电子邮件
电子邮件默认处于禁用状态。要启用 SMTP，请在 `.env` 中设置以下变量，并重启 `api`、`worker` 和 `admin` 服务：
```bash
FLUXER_EMAIL_ENABLED=true
FLUXER_EMAIL_PROVIDER=smtp
FLUXER_EMAIL_FROM_EMAIL=noreply@example.com
FLUXER_EMAIL_FROM_NAME=Fluxer
FLUXER_EMAIL_SMTP_HOST=smtp.example.com
FLUXER_EMAIL_SMTP_PORT=587
FLUXER_EMAIL_SMTP_USERNAME=example
FLUXER_EMAIL_SMTP_PASSWORD=example-secret
FLUXER_EMAIL_SMTP_SECURE=true
```
随后在 `/admin/instance-config` 页面测试 SMTP 配置。
## 语音与视频
Fluxer 使用 LiveKit 处理语音和视频。Caddy 将 /livekit 路由至 LiveKit 的 HTTP/WebSocket 信令端口，但浏览器的媒体流通过 WebRTC 传输：
 * `7882/udp` 是正常的媒体路径。
 * `7881/tcp` 是 TCP 回退路径。
 * `7880/tcp` 保持私有，位于 Caddy 后端用于信令传输。
在开放了 `7881/tc` 和 `7882/udp` 的 VPS 上，LiveKit 通常可以自动检测公网 IP。在 NAT、Cloudflare Tunnel 或受限网络环境下，请添加 TURN 服务器并为其配置 LiveKit。
## 备份
在升级前和定期计划中备份以下项目：
 * `.env`
 * `postgres-data`
 * `seaweedfs-data`

如需进行冷备份：
```bash
docker compose stop api worker gateway admin app-proxy media-proxy static-proxy livekit
docker run --rm -v fluxer_postgres-data:/data -v "$PWD/backups:/backup" alpine tar czf /backup/postgres-data.tgz -C /data .
docker run --rm -v fluxer_seaweedfs-data:/data -v "$PWD/backups:/backup" alpine tar czf /backup/seaweedfs-data.tgz -C /data .
docker compose up -d
```
对于生产环境，优先使用 Postgres 原生转储（dump）加上对象存储备份，这样无需停止实例运行。
## 升级
默认的镜像标签为 `v1`，它会跟踪最新的兼容版本：
```bash
docker compose pull
docker compose up -d
```
`fluxer-static` 镜像属于默认技术栈的一部分，因此静态资源的更新会通过相同的拉取和重启流程同步完成。
要锁定特定版本，请将 `.env` 中的 `FLUXER_IMAGE_TAG` 设置为你希望使用的版本标签，然后执行拉取并重启。