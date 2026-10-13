---
title: Apple Music 也被破解了！音质最好的音乐平台免费下载？
published: 2026-03-14
description: Apple Music 音源下载与解密
draft: false
alias: "amdl/amdl"
tags:
  - 音乐
  - 逆向
category: 技术
---

::: note 提示
本教程仅供技术交流与学习研究，请勿用于商业用途或侵犯版权。请在下载后 24 小时内删除。
:::


## 前言
本教程利用 Termux 在 Android 上运行 Linux 环境，并部署 AppleMusicDecrypt 项目。

特点：
- **支持无损 (ALAC)、杜比全景声 (Atmos) 下载**
- **无需 Apple Music 订阅即可解密 （利用公共实例)**
- **支持简体中文元数据，自动保存歌词（LRC)**

## 准备工作
### 下载 Termux
::github{repo="termux/termux-app"}
或者：[F-Droid 下载](https://f-droid.org/en/packages/com.termux/)

#### 授予存储权限
打开 Termux，输入以下命令并允许权限：
```terminal
termux-setup-storage
```

### 安装 Debian
#### 更新软件源
```terminal
pkg update -y
```

#### 安装 Proot-distro
```terminal
pkg install proot-distro -y
```

#### 安装 Debian
```terminal
pd i debian
```

## 安装基础环境
### 进入 Debian 环境
```terminal
pd login debian
```

#### 安装 git 和 Python 环境管理器
```bash
apt update && apt install pipx git -y && pipx install poetry && pipx ensurepath && source ~/.bashrc
```

## 部署 AppleMusicDecrypt
### 克隆项目源码
```terminal
git clone https://github.com/WorldObservationLog/AppleMusicDecrypt
```
#### 切换到项目目录
```terminal
cd AppleMusicDecrypt
```

#### 编译安装依赖

::: important 重要
执行此命令后，屏幕可能会长时间没有输出，或者滚动大量代码。这是正在从源码编译 MP4Box，非常耗时，通常需要 10 到 20 分钟。请保持手机常亮，千万不要关闭 Termux。如果长时间完全无反应，可以考虑 Ctrl+C 停止后重试。
:::


```bash
bash ./tools/install-deps.sh
```

#### 安装 Python 依赖
```terminal
poetry env use /usr/bin/python3 && poetry install
```

### 生成配置文件
```terminal
cp config.example.toml config.toml
```
#### 修改配置文件
```terminal title="使用公共解密服务器"
sed -i 's/url = "127.0.0.1:8080"/url = "wm.wol.moe"/g' config.toml
sed -i 's/secure = false/secure = true/g' config.toml
```
```terminal title="设置保存路径"
sed -i 's|dirPathFormat = "downloads/{album_artist}/{album}"|dirPathFormat = "/sdcard/Music/AppleMusic"|g' config.toml
sed -i 's|playlistDirPathFormat = "/sdcard/Music/playlists/{playlistName}"|playlistDirPathFormat = "/sdcard/Music/AppleMusic"|g' config.toml
```
```terminal title="设置文件名格式"
sed -i 's|songNameFormat = "{disk}-{tracknum:02d} {title}"|songNameFormat = "{title} - {artist}"|g' config.toml
```
```terminal title="设置元数据语言为简体中文"
sed -i 's/language = "zh-Hant-HK"/language = "zh-Hans-CN"/g' config.toml
```

### 设置 “一键启动” 捷径
为了以后使用方便，我们设置一个别名，以后只需要输入 AppleMusic 就能启动程序。
#### 退出 Debian 环境
```terminal
exit
```
#### 写入启动命令到配置文件
```echo
echo "alias am='pd login debian -- bash -c \"cd ~/AppleMusicDecrypt && poetry run python main.py\"'" >> ~/.bashrc
```
#### 刷新配置
```bash
source ~/.bashrc
```

## 启动项目
打开 Termux，输入：
```terminal
am
```
看到出现 > 符号，就说明启动成功了！


常用下载命令：
1. 下载歌曲/专辑/歌单 （默认 ALAC 无损) ：
```terminal
dl https://music.apple.com/example
```
2. 下载指定音质 （如杜比全景声) ：
```terminal title="alac=无损, aac=有损, ec3=杜比全景声"
dl -c ec3 https://music.apple.com/example
```

3. 强制指定语言 （防止乱码) ：
```terminal
dl -l zh-Hans-CN https://music.apple.com/example
```

4. 查询音质信息 （不下载，只看有哪些格式) ：
```terminal
qa https://music.apple.com/example
```

5. 退出程序：
```terminal
exit
```

## 对歌曲的后期处理
下载器会自动生成 .lrc 歌词文件，但很多播放器不自动识别。我们可以使用 “音乐标签” 这款 App 将歌词写入音乐文件内部。

1. 下载并打开“音乐标签”App。
2. 进入 /sdcard/Music/AppleMusic 目录。
3. 选中需要处理的歌曲（可全选）。
4. 点击“编辑” -> 找到“歌词”栏。
5. 点击导入图标，选择同名的 .lrc 文件。
6. 保存。

这样处理后，即使你删除了 .lrc 文件，Poweramp、foobar2000 等播放器也能正常显示歌词。

## 常见问题 (FAQ)
Q1: 执行 bash ./tools/install-deps.sh 时一直没反应，是不是卡死了？

A: 不一定是卡死。这是在编译 MP4Box，在 Android 手机上非常慢。请保持耐心等待 10-20 分钟。如果 CPU 没有占用或者 Termux 闪退，才需要重来。

Q2: 下载时卡在 Decrypting... 不动？

A: 这通常是公共服务器 拥堵或短暂故障。按 Ctrl+C 停止，重启 Termux 再次输入 am 重试即可。如果终端下方显示的 Decrypt Speed: xx.xx 数字在跳动，那就是正常的，请耐心等待。

Q3: 为什么有的歌没有歌词？

A: 取决于 Apple Music 官方数据。如果在 Apple Music App 里播放这首歌也没有歌词，那下载器自然也抓不到。可以尝试用 -l en-US 或 -l ja 指定其他地区语言试一试。
