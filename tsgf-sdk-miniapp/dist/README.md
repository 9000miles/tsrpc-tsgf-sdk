
# TSGF是什么（ts-gameframework）

* **开源** 的 **游戏联机** 全栈式解决方案：`服务端自行部署` + 游戏客户端对接 `tsgf-sdk`
* **黑盒式** 实现游戏联机：客户端对接SDK，不用关心通信和同步逻辑 （模式参考腾讯已下架的 `MGOBE` ）
* **全分布式的**的集群架构设计：可随在线用户增加而横向拓展服务器集群

# 1. 启动服务端


## 一键启动服务端

```
# 切换到 servers 目录下
cd ./servers
# 安装依赖包 + 启动服务器
npm install & npm run dev
```
*（端口：7100，7101，7102，7801，7901 如果被占用将导致启动失败！）*

## 部署配置说明

* 服务器配置文件：tsgf.server.config.json
  * 配置内容参考 `src/ServerConfig.ts`
  * 可指定配置文件：`node dist/index.js -tsgfConfigFile="相对入口文件的其他位置"`
* 生成部署文件
  * `./servers/` 目录下执行 `npm run build`，然后复制出下列目录和文件：

        dist/
        node_modules/ （不用此目录，则需要执行 npm i 下载）
        package.json
        tsgf.server.config.json  （配置参考 `src/ServerConfig.ts`）
* 可以使用 `pm2` 部署为系统服务
* **微信小程序需注意**，因微信平台要求访问的域名是固定的， 并且要求HTTPS和WSS，所以就需要让游戏服务器走统一的反向代理。游戏服务器的地址使用url参数形式进行区分，由反向代理实现代理规则（如nginx）。比如：游戏服务器地址配置为：`wss://game.a.com/?srv=n1&port=p` (`game.a.com` 为 nginx 服务器地址)，nginx是支持根据url参数定义代理规则，实际地址是：`ws://n1.game.a.com:p/`，然后 `n1.game.a.com` 解析为内网IP, 指向游戏服务器

# 2. 客户端对接 SDK

## npm 包：
* tsgf-sdk
核心客户端SDK包，还需要根据客户端所属平台引用对应的实现包：

* tsgf-sdk-miniapp
只有客户端是**小程序**时引用

* tsgf-sdk-browser
其他客户端都引用本包（含**浏览器**、**原生**）

* tsgf-dev-demo-client
demoServer 的客户端封装


## 示例

- [示例合集传送门](https://gitee.com/fengssy/tsgf-demos)

## 版本要求

* tsgf-sdk 1.0.2 要求 tsgf-servers>=1.2.2
* tsgf-sdk 1.3.0 要求 tsgf-servers>=1.3.0
* tsgf-sdk 1.4.0 要求 tsgf-servers>=1.4.0


# 3. 设计简介

## 结构介绍

### 服务器结构图

![拓扑图](https://fengssy.gitee.io/zgame/Games/TSGF/ServerStructure.png?v=1.1.1)

### 玩家使用时序图

![时序图](https://fengssy.gitee.io/zgame/Games/TSGF/SequenceDiagram.png?v=1.1.0)

* **应用** 一个开发者可以有多个应用，一般一个应用对应一个游戏。目前统一使用 **default** 应用标识

* **应用web服务器**  为开发者自己实现用户体系的站点，用于将开发者的用户体系对接到 **TSGF** 的玩家体系

* **大厅服务器** 为 HTTP 服务，可使用常规 web 集群方案进行部署，提供如玩家认证、创建房间、查询房间、匹配操作、分配游戏服务器等功能

* **游戏集群管理服务** 为 websocket 服务，用来管理`游戏服务器`的服务，只能部署一个实例

* **游戏服务器** 为 websocket 服务，可以部署多台（横向拓展），部署实例的数量随着在线玩家数量增加而增加。需要能连接到`游戏集群管理服务`，但实例之间并不进行通讯

* **匹配集群管理服务** 为 websocket 服务，用来管理`匹配服务器`的服务，只能部署一个实例

* **匹配服务器** 为 websocket 服务，可以部署多台（横向拓展），部署实例的数量随着应用增加而增加（单应用场景，只需要部署一个实例即可）。需要能连接到`匹配集群管理服务`，但实例之间并不进行通讯。

* 使用 [TSRPC](https://tsrpc.cn/) 作为通讯框架

  *并用 `TSRPC` 框架自带的代码生成/同步模块，导致 `client` 目录名以及相对路径的固定（乱改可能会导致出错）*

## 自定义服务端逻辑

* 匹配器
    
    - 新建类，建议存放在 `src/shared/tsgfServer/match/`
    - 实现接口 `src/shared/tsgfServer/match/IMatcher.ts` （可参考同目录下的 `MatcherBaseMelee.ts`）
    - 修改代码 `src/shared/matchServer/BaseMatchServer.ts->onAssignTask` ，加入本匹配器类的实例


## 实现自己的应用web服务端

* 即，代替 `demoServer` 服务。负责将应用自己的用户体系对接到 `TSGF` 的玩家体系
* 推荐实现方案:
  * 应用的用户登录后，在应用的web服务器上请求 `TSGF` 大厅的服务端认证接口，获得玩家认证信息（playerId/playerToken等）
  
    *可参考 `src/demoServer/api/ApiPlayerAuth.ts`*
  * 由应用将玩家认证信息返回到客户端，用于客户端的所有需要认证的api


## 匹配功能说明

* 匹配组，只有在相同组才能匹配到一起，决定是否在同一个匹配组的因素有：匹配自定义类型，匹配器标识，maxPlayers，队伍相关配置
* 创建房间时，`ICreateRoomPara.isPrivate` 决定当前房间人不满时是否允许参与匹配（需配置 `ICreateRoomPara.matcherKey）`
* `matcherKey`：匹配器标识定义，不同匹配器的匹配请求之间不会互通。（内置匹配器标识 `MatcherKeys`)
* `matcherParams`：匹配器参数，根据不同的匹配器使用对应的类（请看 `MatcherKeys` 的注释）
* 内置匹配器参数的字段：`resultsContinueRoomJoinUsMatch` 控制匹配成功是创建一个新房间时, 如果人未满，是否允许继续匹配满


## 帧同步设计要求

* 输入操作分离：与“我”无关的逻辑实现

    *其实只要是帧同步游戏，就需要做到上面说的设计*


# 4. 交流群

## QQ群
![QQ群](https://fengssy.gitee.io/zgame/Games/TSGF/TSGF_QQGroupQRCode.png?v=1.1.1)

# 5. 引用

[TSRPC](https://tsrpc.cn/) 作为本框架的通讯层使用

[帧同步联机游戏实战（一）Demo起步](./帧同步联机游戏实战（一）Demo起步.md)