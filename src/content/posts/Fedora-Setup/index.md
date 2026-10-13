---
title: Fedora 新手进！必看教程来了
description: 一起加入 Fedora 的世界吧❤️
published: 2026-03-02
draft: false
alias: "fedora-setup/fedora-setup"
tags:
  - 系统
category: 技术
---

# 前言
👋 嘿，你好！
既然你来到了这里，想必你刚刚安装完 Fedora，正盯着全新的桌面发愁：“接下来该干嘛？” 我也经历过这个阶段。Fedora 在刚安装完后确实需要“推一把”才能达到最佳状态 :)。这就是我编写这份指南的原因，它汇总了我从多个渠道收集的 Fedora 切换经验。

::: note 摘要
这不是官方指南。这只是分享我个人的配置方案和偏好，你可以根据需要选择性跳过。在复制粘贴任何命令之前，请务必先阅读说明。
:::

::: tip 关于命令的小提示
 * 看到开头的 sudo，意味着“以管理员身份运行”，它会要求输入密码。
 * -y 标签意味着“对所有确认提示都回答 Yes”，这样你就不用一直按回车了。
 * 复制粘贴是你的好伙伴，但 运行前请务必确认命令内容。
:::


# 🔥 核心基础设置
#### RPM Fusion - 软件源大补帖
由于法律原因，Fedora 预装的软件非常精简。RPM Fusion 是存放那些“真正有用”的东西的地方（如编解码器、驱动等）。你肯定需要它。

获取 free 仓库 (包含大部分你需要的东西)
```bash
sudo dnf install -y \ https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm
```

获取 nonfree 仓库 (包含 NVIDIA 驱动和部分专有编解码器)
```bash
sudo dnf install -y \ https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm
```

更新所有内容以确保兼容性
```bash
sudo dnf group upgrade core -y
sudo dnf check-update
```

::: note Free 和 Nonfree 有什么区别？
 * Free: 法律上允许自由分发的开源软件。
 * Nonfree: 专有软件（如 NVIDIA 驱动、部分音视频格式），由于授权原因 Fedora 官方无法直接携带。
:::


#### 系统更新 (枯燥但重要)
我知道更新很无聊，但真的请先做这一步。刚安装完的系统通常有很多过时的软件包。
#### 更新所有内容
sudo dnf update -y

#### 如果更新了内核，请重启
sudo reboot

::: tip 建议
养成每周或每月运行一次 sudo dnf update 的习惯。
:::


#### 固件更新
你的硬件可能有更新的固件可用，这对于改善 WiFi 稳定性和电池续航很有帮助。

查看有哪些设备可更新
```bash
sudo fwupdmgr get-devices
```

强制刷新固件数据库
```bash
sudo fwupdmgr refresh --force
```

检查更新
```bash
sudo fwupdmgr get-updates
```

应用更新
```bash
sudo fwupdmgr update
```

::: caution 注意
固件更新后必须重启系统才能生效。
:::


#### 给你的电脑起个名
这纯粹是为了好看，让你更有归属感。挑个酷一点的名字吧！

把 hungry-beast 换成你喜欢的名字
```bash
sudo hostnamectl set-hostname hungry-beast
```

# 📦 获取更多软件
#### Flathub 设置
Fedora 默认只开启了一个“阉割版”的 Flatpak 仓库。Flathub 才是真正的宝库。

移除限制版的 Fedora Flatpak 仓库
```bash
flatpak remote-delete fedora
```

选项 1：完整仓库（最推荐）
可以访问 Flathub 上的所有应用（包括那些非开发者官方维护的社区版应用）：
```bash
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
```

选项 2：仅限验证过的应用
如果你只信任由软件原作者维护的应用：
```bash
flatpak remote-add --if-not-exists --subset=verified flathub https://flathub.org/repo/flathub.flatpakrepo
```

::: warning 警告
很多流行的社区打包应用将不会显示。
:::


# 🎮 显卡驱动
NVIDIA (比较棘手)

::: warning 警告
NVIDIA 在 Linux 上比较复杂。以下方法通常有效，但如果遇到问题，欢迎加入“受害者联盟”。
:::


📋 开始之前：
 * 在 BIOS 中关闭 Secure Boot（或者学习如何给内核模块签名，由你决定 ;)）。
 * 确保系统已 更新并重启过。
 * 准备好备份方案（认真的，搞砸了我不负责）。


#### 安装内核头文件和开发工具
```bash
sudo dnf install -y kernel-devel kernel-headers gcc make dkms acpid \
  libglvnd-glx libglvnd-opengl libglvnd-devel pkgconfig
  ```

::: important RTX 4000 及更新系列显卡特别说明
如果你使用的是 4000 系列或更新的 GPU，Fedora 需要在安装驱动前设置一个宏，以启用开源内核模块。
:::


#### 设置开源内核模块宏 (一次性步骤)
```bash
sudo sh -c 'echo "%_with_kmod_nvidia_open 1" > /etc/rpm/macros.nvidia-kmod'
```

#### 安装驱动程序
```bash
sudo dnf install -y akmod-nvidia xorg-x11-drv-nvidia-cuda
```

现在请耐心等待。认真的，构建模块需要 5–15 分钟。你可以通过此命令查看进度：
```bash
sudo journalctl -f -u akmods
```

完成后请执行：
```bash
sudo reboot
```
检查是否生效

运行 nvidia-smi 如果你看到了 GPU 信息，那就成功了！

# 🎵 多媒体支持
视频编解码器 (解决视频无法播放)
Fedora 由于专利问题基本不带编解码器。以下命令可以修复它。
#### 用功能完整的 ffmpeg 替换“阉割版”
sudo dnf swap -y ffmpeg-free ffmpeg --allowerasing

#### 安装所有 GStreamer 插件
```bash
sudo dnf install -y gstreamer1-plugins-{bad-\*,good-\*,base} \ gstreamer1-plugin-openh264 gstreamer1-libav lame\* \ --exclude=gstreamer1-plugins-bad-free-devel
```

#### 安装多媒体组
```bash
sudo dnf group install -y multimedia
sudo dnf group install -y sound-and-video
```

# 🔧 实用工具
微软字体 (无奈但必须)
没有这些字体，网页和文档看起来会很奇怪。

#### 安装依赖
```bash
sudo dnf install -y curl cabextract xorg-x11-font-utils fontconfig
```

#### 安装字体
```bash
sudo rpm -i --nodigest --nosignature https://downloads.sourceforge.net/project/mscorefonts2/rpms/msttcore-fonts-installer-2.6-1.noarch.rpm
```

#### 更新字体缓存
```bash
sudo fc-cache -fv
```

::: note 碎碎念
是的，我们仍然需要 Arial 和 Times New Roman 字体。这得怪微软)
:::


#### Flatpak 自动更新
你可以让 Flatpak 应用自动保持最新。

[Unit]
Description=Update Flatpak apps automatically

[Service]
Type=oneshot
ExecStart=/usr/bin/flatpak update -y --noninteractive

# ⚡ 性能优化
加快开机速度
这个改动很简单，效果很明显。
```bash
sudo systemctl disable NetworkManager-wait-online.service
```

::: note 为什么？
这个服务在开机时等待网络连接。对于大多数个人用户来说，不需要这种开机时的强制延迟。
:::


# 🧹 保持系统整洁
#### 清理软件包缓存
```bash
sudo dnf clean all
```

#### 移除不再需要的孤立软件包
```bash
sudo dnf autoremove -y
```