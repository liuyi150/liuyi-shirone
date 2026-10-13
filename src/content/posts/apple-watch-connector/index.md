---
title: Android 手机能连 Apple Watch 吗？apple_watch_connector 项目调研
description: 一个想把 Apple Watch 接到 Android / Linux / Windows / macOS 的开源连接器 —— 以及它为什么基本跑不起来
published: 2026-10-12
draft: false
alias: "apple-watch-connector/android-手机能连-apple-watch-吗apple_watch_connector-项目调研"
tags:
  - Android
  - 逆向
category: 技术
---

::: warning 本文由 AI 生成
这篇文是 AI（Pi 编码助手）整理的调研笔记，不是作者本人的实测文章。内容基于 2026-10-12 的仓库快照与一份源码级 + 真机检查，可能有时效性问题，请以仓库最新状态为准。
:::


## 前言

Apple Watch 一直是苹果生态里最"锁"的那一档：它只能用 iPhone 配对、激活、更新系统，Android 手机连接它这件事，十年来基本没有正经方案。所以当 GitHub 上冒出一个写着 "Apple Watch Companion" 的项目时，还挺稀奇的。

::github{repo="LordixDemon/apple_watch_connector"}

简单说：**它是一个跨平台连接器，目标是在 Android（主线）、Linux、Windows、macOS 上连接并操作 Apple Watch。** 仓库 2026-10-09 才创建，249 stars，主力语言 Java，没有 License，官方自称 **experimental RC**。

## 它由什么组成

- **Android Bridge**：核心是一个 APK，内含 `app / hal / protocol-runtime / core` 四个模块和一份 QUIC 的 `.so`。
- **Companion**：另一个独立 APK，负责 UI（配对引导、状态展示）。
- **桌面端**：共用一套 Flutter UI + Rust，Rust 侧版本号 0.1.1。

最关键的机制是：**它不走 Android 的蓝牙 API，而是用 root 直接接管蓝牙 HCI HAL。** 具体做法是让 `app_process` 起一个 `RootBluetoothHalHost`（不是普通的 Android 组件），把系统蓝牙硬件抽象层抢过来，自己发 HCI 命令。正因为这样，它必须关掉系统蓝牙（`settings get global bluetooth_on` 必须为 `0`），否则会和系统的蓝牙栈打架。

版本与验证环境（快照日）：

| 项 | 值 |
| --- | --- |
| Bridge | 0.2.427 / versionCode 627 |
| Companion | 1.0.85+86 |
| Rust workspace | 0.1.1 |
| 验证机型 | Apple Watch Ultra 2、Watch7,5 |
| watchOS | 26.2 (23S303) |

## 配对流程大概长什么样

从 README 的链路看，它复刻的是苹果那套配对协议：

1. 蓝牙控制层协商（`BT_CL`、`probeControlSaInit`、`probeControlIkeAuth` 等一串 probe）
2. 身份验证：走 **PIN（SPAKE2+ / PPK）** 或**光学配对**（用手机摄像头读手表屏幕上的动态图案）
3. 建立加密连接后进入 **Setup / 激活** 流程：IDS bootstrap → 注册表 → 语言 locale → 提交 `isPaired` → PBBridge 激活 → Wi-Fi → PairedSync → 退出 Setup（需要手表表盘可见）
4. 之后是正常重连，退避时间是 15 → 30 → 60 秒

代码里有一个 `PairingSessionRecord`，记录 18 个 checkpoint（从"配对材料已持久化"一直到"运行健康检查通过"）。所以它不是"连上就算完"，而是一整套带断点续传的流程机。

## 但是：它基本跑不起来

这是本文的重点。哪怕不看源码，README 里就写着两行很硬的限制：

> The root HAL implementation currently accepts **OnePlus CPH2653 only**

> Android root HAL access remains restricted to OnePlus CPH2653; testing one phone does not establish support for every Android Bluetooth HAL.

翻了源码，这条限制是**写死在代码里的**，一共有 6 处 fail-closed 判断，且都是"不匹配就直接抛异常"：

- `apple-watch-bridge/hal/src/main/java/.../RootBluetoothHalHost.java:240-244`：判断 `Build.MANUFACTURER == OnePlus` 且 `Build.MODEL == CPH2653`，否则 `throw new HostException("This build is fail-closed to OnePlus CPH2653")`
- `RootBluetoothBondImporter.java:148-154`、`RootBluetoothCarPlayLease.java:106-112`：同样各有一道
- `core/.../HalHostArguments.java:7`：`TARGET = "CPH2653"`，命令行必须带 `--acknowledge-target CPH2653`
- `app/.../BridgeSetupEngine.java:29` 与 `OperationalWatchService.java:329`：在拼 `app_process` 命令行时把上面这个参数写死

另外几个现实问题：

- **必须 root，而且光有 root 不够**：它是以 Magisk 模块形式分发的（priv-app + hidden-API 白名单 + SELinux 规则），release 页只有一个 tag `magisk-0.2.427`，附件里就一个 `apple-watch-bridge-magisk-0.2.427.zip`（5.9 MB），解出来 5 个文件，里面**只有 Bridge 的 APK，没有 Companion**。
- **两个 APK 必须同签名**：它们之间的 IPC 受 signature 权限保护。而仓库里 checked-in 的 release APK 用的是 Android Debug 证书（`CN=Android Debug`），仓库里也没有任何 keystore —— 想用就得两个都用你自己的 key 重新编译。
- **Companion 缺私有资产**：它的 `prepareOpticalAsset` 构建任务需要 4 个仓库里没有的输入（一份从 iOS 固件提取的 `VisualPairing`、两个 research-tools 脚本、一个专用 venv）。好消息是光学配对失败只是让相机配对返回 `ok=false`，PIN 配对还能用；可以把那个任务 `-x` 掉。
- **工具链不轻**：JDK 17、Flutter 3.47.4 / Dart 3.13.3、Rust 1.98.1（edition 2024）、SDK 36、Build Tools 36.1.0、NDK 28.2.13676358、CMake 3.22.1，minSdk 33 / targetSdk 36。官方构建脚本 `tools/build.py android` 还是按 macOS/Linux 的 NDK 目录布局写的，Windows 上基本得靠 WSL2。

## 顺手在 Xiaomi 13 上验了一下

好奇心和字数都允许，所以拿一台有 root 的 Xiaomi 13（fuxi，内核级 root，SukiSU Ultra）做了只读检查。结果是**两堵墙，第二堵还挺深**。

第一堵墙（机型判断）好说，删掉那 6 处判断就行。真正的问题是 HAL 形态对不上：

| 检查 | 这台机器的实际情况 |
| --- | --- |
| VINTF 声明 | `<hal format="hidl">` + `<transport>hwbinder</transport>` + `@1.1::IBluetoothHci/default` |
| 实现库 | `/vendor/lib64/hw/android.hardware.bluetooth@1.1-impl-qti.so`（高通 QTI 实现） |
| 运行时 | `lshal`：`android.hardware.bluetooth@1.1::IBluetoothHci/default` 在跑 |
| AIDL 服务名 | `service list` 里**完全没有** `android.hardware.bluetooth.IBluetoothHci/default` |
| 链接库 | `/system/lib64/` 里蓝牙只有 AIDL 的 `bluetooth.audio-V3-ndk.so`，HCI 一个 AIDL 库都没有 |

而项目是这么取 HAL 的：

```java
// apple-watch-bridge/hal/.../RootBluetoothHalHost.java:42
HAL_INSTANCE = "android.hardware.bluetooth.IBluetoothHci/default";
...
IBluetoothHci.Stub.asInterface(binder);   // 这是 AIDL 生成的类
```

**HIDL 服务注册在 hwservicemanager / hwbinder，AIDL 名字注册在 servicemanager —— 两个命名空间，AIDL 名字永远查不到那个服务。** 所以就算把机型判断全删干净，`waitForHalBinder()` 也会在 10 秒后抛 `"Bluetooth HCI HAL did not appear within 10000 ms"`。

更麻烦的是，Android 17 的系统里已经没有 HIDL 的 Java 库了，所以"改成调 HIDL"也不是换个 API 名字那么轻 —— 得自己写 hwbinder 原生客户端，或者写一个转发到 HIDL 的 AIDL 垫片服务。这已经是 AOSP 级别的工程量了。

## 结论

- 想"照着文档装一下就用"？**目前只有 OnePlus CPH2653 这一台机器可以**，而且还得自己编译 Companion（PIN 配对），root 也躲不掉。
- 其它机型想跑，等于给项目补一个 HAL 适配层：不是改配置，是写代码。
- 最后一句提醒：它有一条 `--commit-is-paired` 路径会**真的往手表里写配对状态**。手表要是还在正常用，别拿它去做实验。

项目本身还是很有意思的——它把一个"苹果不让做的事"从协议层往下拆到了 HCI，光看代码结构就挺长知识。只是它现在的形态，更接近"一台机器的实验记录"，而不是一个人人能用的工具。

---

*本文由 AI（Pi 编码助手）撰写，资料来自仓库 2026-10-12 快照、README 与源码、以及一次只读的真机检查。若有出入，以仓库为准。*
