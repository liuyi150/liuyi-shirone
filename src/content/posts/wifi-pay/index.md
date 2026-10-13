---
title: "用 OpenWrt 实现同 Wifi 双密码不同响应"
published: 2026-04-04
description: 其实也可以用来做 Pay Wall
draft: false
alias: "wifi-pay/用-openwrt-实现同-wifi-双密码不同响应"
tags:
  - 网络
category: 技术
---

## 引言
最近入手了个路由器，用来接校园网的宽带（神秘校园网只允许一个设备同时接入..）  
正当我在想Wifi名的时候，突然想整个活，于是便设置成了Ciallo～ (∠・ω )⌒☆，密码也是喜闻乐见的0d000721。
但设置好后突然感觉不对：这不是相当于公开了我花钱办的宽带了吗🤔于是便想改  
但最后思来想去还是不想放弃这个Wifi名称，于是便设法实现了使用两个不同密码连接会有不同响应的Wifi。具体来说，同一个名为Ciallo～ (∠・ω )⌒☆的网络，使用0d000721连接就只会弹一个带图片的网址，而使用另外一个密码连接才能正常上网。
## 准备工作
想要实现上述效果，需要：
一台已刷OpenWrt的路由器（关于路由器的选购与刷机这里不赘述）  
基础Shell操作知识  
正常的网络连接  

::: important 搞机有风险，操作需谨慎🥹
本教程使用的OpenWrt版本为25.XX，不建议在更早的版本上使用本教程，因为不同版本间的差异较大，可能会无法使用或造成故障。
:::

### 创建Wifi
我们创建需要使用不同密码连接的Wifi。
点击任意radio的添加按钮打开网络扫描，在弹出的框中翻到最下面，
在ESSID框中输入要使用的Wifi名称。
切换到无线安全，将加密改为WPA2-PSK，之后在密钥中输入真实的密码（之后能够正常联网的密码）
点击保存，最后点击最下面的保存并应用，等待设置更新。
### 升级dnsmasq-full
首先由于我使用的是OpenNDS来做弹出的页面，所以需要将dnsmasq包升级为完整版。  
在Shell中输入以下命令：
```Shell
apk update && apk add dnsmasq-full
```
看到形如 OK: XXX MiB in XXX packages 的结果即可  

### 配置Multi-PSK
使用Shell编辑/etc/config/wireless，以下是一个示例：
```Shell
config wifi-device 'radio0'
    ......
config wifi-iface 'default_radio0'
    ......
config wifi-device 'radio1'
    ......
config wifi-iface 'wifinet3'
    option device 'radio1'
    option network 'lan'
    option mode 'ap'
    option ssid 'hyw'
    option encryption 'psk2'
    option key 'ThisIsTheTruePassword'
config wifi-iface 'wifinet2'
    option device 'radio1'
    option network 'wwan'
    option ssid 'ExampleWifi'
    ......
```
可以看到，在config wifi-iface 'default_radio1'配置块中有我们刚刚创建的Wifi，在config wifi-iface 'wifinet2'配置块中有我们刚刚连接的Wifi。  
接下来对配置文件做以下更改：
#### 启用MultiPSK
在创建的Wifi的配置块中加入option multi_psk '1'
之后你的配置应该像这样：
```Shell
config wifi-iface 'wifinet3'
    option device 'radio1'
    option network 'lan'
    option mode 'ap'
    option ssid 'hyw'
    option encryption 'psk2'
    option key 'ThisIsTheTruePassword'
    option multi_psk '1'
```
#### 添加wifi-vlan块
在文件底部添加以下配置：
```Shell
config wifi-vlan
  option name 'g_v'
  option network 'guest'
  option vid '10'
  option iface 'wifinet3'
```
注意：
这里的wifinet3为我们创建的wifi的wifi-iface的名字，见上面的示例配置。
这里的name可以任取但是不能太长，具体限制在不同设备上
可能不同，但建议只使用3~4个字符。
vid的10和network的guest均可自定义，不过之后需要保证配置能够对的上。
#### 添加wifi-station块
继续在文件底部添加以下配置：
```Shell
config wifi-station
    option key '0d000721'
    option vid '10'
    option iface 'wifinet3'
```
注意：
这里的key即为假密码，即无法正常上网的密码。
这里的vid和iface要和上面匹配。
编辑完成，保存文件进行下一步。
### 添加设备与接口
打开OpenWrt管理面板，进入网络>接口，切换到设备页面，点击最下面的添加设备配置。
在弹出的窗口中，将设备类型选为网桥设备,
设备名称设为br-guest（可以自己改），选中允许启动空网桥，然后点击保存。
接着切换回接口页面，点击下面的添加新接口，
将名称设置为guest（注意和上面的匹配），将协议设置为静态地址，将设备选为br-guest（和上面创建的匹配）,然后点击创建接口。
接着在弹出的窗口中，将IPv4 地址设置为192.168.72.1（可以任意设置，但要和你正常使用的主网络不同），将IPv4 子网掩码设置为255.255.255.0。
然后点击上面的防火墙设置，点击创建/分配防火墙区域，在最下面的自定义框中输入guest_zone（可以自己起名）然后按回车。
最后点击上面的DHCP 服务器，然后点击配置 DHCP 服务器按钮，不用变更配置。
最后点击保存关闭配置窗口，点击最下面的保存并应用，等待设置更新。
### 安装OpenNDS
OpenNDS的作用本来一般是提供上网认证界面，但这里我们使用它来做弹出图片的效果。
打开Shell，输入以下命令：
```Shell
apk update && apk add opennds
```
之后编辑/etc/config/opennds，找到option gatewayinterface行
（我设备上是第308行，可以使用查找功能查找），
将其取消注释并把后面的值换成上面配置的设备的名称。
更换之后配置应该如下：
```Shell
...
# GateWayInterface
# Default br-lan
# Use this option to set the device opennds will bind to.
# The value may be an interface section in /etc/config/network or adevice name such as br-lan.
# The selected interface must be allocated an IPv4 address.
# In OpenWrt this is normally br-lan, in generic Linux it might besomething else.
#
option gatewayinterface 'br-guest'
##################################################################
...
```
保存文件，进行下一步。
### 配置弹出页面
编辑/usr/lib/opennds/theme_click-to-continue-basic.sh，
将里面的内容全部删除，替换成下面的：
```Shell
#!/bin/sh
cat /etc/opennds/htdocs/splash.html
exit 0
```
之后保存文件。
然后编辑/etc/opennds/htdocs/splash.html（即上面配置的文件），将原有内容（如果有）全部删除，替换成你想要的内容。
在使用假密码登录时，OpenNDS会拦截链接并把/etc/opennds/htdocs/splash.html里面的HTML提供给登录者作为登录界面，所以这里可以自由发挥。
值得注意的是，由于使用假密码连接的时候没有网络连接，所以如果想要插入图片的话不能使用图床，因为无法访问。这里我为了方便直接使用了Base64硬编码图片到splash.html里。
另外，由于存在缓冲区大小限制，splash.html不能太长，所以如果要使用Base64添加图片的话需要对图片进行充分压缩。
以下是我的配置：
```HTML
<!DOCTYPE html>
<html>
<head>
    <title>Ciallo～ (∠・ω )⌒☆</title>
</head>
<body>
    <h1>Ciallo～ (∠・ω )⌒☆</h1><br>
    <img width="300px" id="ciallo" alt="ciallo" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAgCAIAAADvz6...(太长了省略)" />
</body>
</html>
```
保存文件，至此配置已经全部完成。
### 重启服务
使用以下命令重启服务：
```Shell
/etc/init.d/network restart
wifi reload
/etc/init.d/dnsmasq restart
/etc/init.d/opennds restart
```
之后应该就可以看到创建的Ciallo～ (∠・ω )⌒☆Wifi了。
### 遇到问题？
由于本人之前也没有接触过OpenWrt，在尝试实现这个效果的过程中也是在摸索，
所以如果各位遇到了一些问题我可能无法进行有效的解答。不过这里有些我
遇到过的问题，供大家参考。

在配置完OpenNDS并重启后无法访问LuCI？
这一般是因为OpenNDS没有被正确配置（即gatewayinterface没有与前面
创建的设备匹配），导致它将所有网络连接全部拦截。

遇到这种情况时，使用Shell登录，并执行/etc/init.d/opennds stop
来停止OpenNDS，之后应该就能恢复LuCI访问。
为了解决问题，请参照上面的步骤正确配置之后，再运行/etc/init.d/opennds start
恢复OpenNDS，看看是否正常工作。

重启服务后找不到添加的Wifi？
这可能是因为你的wifi-vlan块中的name过长，
请参照上面的步骤将其改短后再执行wifi reload看看。

