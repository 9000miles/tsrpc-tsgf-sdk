
# TSRPC API 接口文档

## 通用说明

- 所有请求方法均为 `POST`
- 所有请求均需加入以下 Header :
    - `Content-Type: application/json`

## 目录

- [玩家获取认证信息(由应用web服务器在服务端调用)](#/Authorize)
- [取消匹配](#/CancelMatch)
- [创建房间](#/CreateRoom)
- [获取房间注册信息](#/GetRoomRegInfo)
- [查询匹配](#/QueryMatch)
- [RecoverPlayerRoom](#/RecoverPlayerRoom)
- [请求匹配](#/RequestMatch)

---

## 玩家获取认证信息(由应用web服务器在服务端调用) <a id="/Authorize"></a>

**路径**
- POST `/Authorize`

**请求**
```ts
interface ReqAuthorize {
    /** 应用ID */
    appId: string,
    /** 请求数据密文 */
    ciphertext?: string,
    /** 请求数据对象, 到了ApiCall层就是解析通过可以使用的 */
    data?: any
}
```

**响应**
```ts
interface ResAuthorize {
    /** 平台生成的玩家ID */
    playerId: string,
    /** 所有需要认证的接口、服务器，都需要附带token */
    playerToken: string
}
```

**配置**
```ts
{
  "skipAuth": true,
  "cryptoMode": "AppReqDes"
}
```

---

## 取消匹配 <a id="/CancelMatch"></a>

**路径**
- POST `/CancelMatch`

**请求**
```ts
interface ReqCancelMatch {
    /** 非房间发起的匹配，发起匹配请求中的所有玩家都可以取消 */
    matchReqId: string,
    /** 有需要鉴权的接口,则需要传递玩家token */
    playerToken?: string
}
```

**响应**
```ts
interface ResCancelMatch {

}
```

**配置**
```ts
{
  "cryptoMode": "None"
}
```

---

## 创建房间 <a id="/CreateRoom"></a>

**路径**
- POST `/CreateRoom`

**请求**
```ts
interface ReqCreateRoom {
    /** 有需要鉴权的接口,则需要传递玩家token */
    playerToken?: string,
    /** 房间名字，查询房间和加入房间时会获取到 */
    roomName: string,
    /** 房主玩家ID，创建后，只有房主玩家的客户端才可以调用相关的管理操作, 如果不想任何人操作,可以直接设置为'', 所有人都离开房间后自动解散 */
    ownerPlayerId: string,
    /** 进入房间的最大玩家数量 */
    maxPlayers: number,
    /** 是否私有房间，即不参与匹配, 但可以通过房间ID加入 */
    isPrivate: boolean,
    /** 如果参与匹配,则使用的匹配器标识 */
    matcherKey?: string,
    /** 自定义房间属性字符串 */
    customProperties?: string,
    /** 房间类型自定义字符串 */
    roomType?: string,
    /**
    * [固定数量的队伍] 直接用数量自动生成所有固定队伍配置, 房间ID将从 '1' 开始到 fixedTeamCount,
    * 还需要传 fixedTeamMinPlayers 和 fixedTeamMaxPlayers, 或者使用 fixedTeamInfoList 完全自定义
    */
    fixedTeamCount?: number,
    /** [固定数量的队伍] 每支队伍最少玩家数(包含), 没传默认为1 */
    fixedTeamMinPlayers?: number,
    /** [固定数量的队伍] 每支队伍最大玩家数(包含), 没传默认为9 */
    fixedTeamMaxPlayers?: number,
    /** [固定数量的队伍] 使用传入的队伍id等信息来定义所有队伍, 并忽略 fixedTeam* 的其他参数 */
    fixedTeamInfoList?: {
        /** 队伍 ID, 房间内唯一 */
        id: string,
        /** 队伍名称 */
        name: string,
        /** 队伍最小人数 */
        minPlayers: number,
        /** 队伍最大人数 */
        maxPlayers: number
    }[],
    /** [自由数量的队伍] 指定每支队伍的最少玩家数, 同时还需要指定 freeTeamMaxPlayers */
    freeTeamMinPlayers?: number,
    /** [自由数量的队伍] 指定每支队伍的最大玩家数, 同时还需要指定 freeTeamMinPlayers */
    freeTeamMaxPlayers?: number
}
```

**响应**
```ts
interface ResCreateRoom {
    /** 游戏服务器的连接地址 */
    gameServerUrl: string,
    /** 房间信息 */
    roomInfo: {
        /** 房间ID */
        roomId: string,
        /** 房间名称 */
        roomName: string,
        /** 房主玩家ID，创建后，只有房主玩家的客户端才可以调用相关的管理操作 */
        ownerPlayerId: string,
        /** 是否私有房间，即不参与匹配, 但可以通过房间ID加入 */
        isPrivate: boolean,
        /** 是否不允许加人(任何方式都无法加入) */
        isForbidJoin: boolean,
        /** 如果参与匹配,则使用的匹配器标识 */
        matcherKey?: string,
        /** 创建房间的方式 */
        createType: 0 | 1,
        /** 进入房间的最大玩家数量 */
        maxPlayers: number,
        /** 房间类型自定义字符串 */
        roomType?: string,
        /** 自定义房间属性字符串 */
        customProperties?: string,
        /** 如果当前房间在匹配 (房间全玩家匹配),则有匹配请求id */
        allPlayerMatchReqId?: string,
        /** 玩家列表 */
        playerList: {
            /** 玩家ID */
            playerId: string,
            /** 显示名 */
            showName: string,
            /** 当前房间中所在的队伍id */
            teamId?: string,
            /** 自定义玩家状态 */
            customPlayerStatus: number,
            /** 自定义玩家信息 */
            customPlayerProfile: string,
            /** 网络状态 */
            networkState: 0 | 1,
            /** 是否机器人 */
            isRobot: boolean,
            /** 当前所在房间控制的机器人id列表(机器人玩家id) */
            roomRobotIds?: string[]
        }[],
        /** 队伍列表,如果创建房间时有传入队伍参数,则会有内容,否则为[] */
        teamList: {
            /** 队伍 ID, 房间内唯一 */
            id: string,
            /** 队伍名称 */
            name: string,
            /** 队伍最小人数 */
            minPlayers: number,
            /** 队伍最大人数 */
            maxPlayers: number
        }[],
        /**
        * [固定数量的队伍] 直接用数量自动生成所有固定队伍配置, 房间ID将从 '1' 开始到 fixedTeamCount,
        * 还需要传 fixedTeamMinPlayers 和 fixedTeamMaxPlayers, 或者使用 fixedTeamInfoList 完全自定义
        */
        fixedTeamCount?: number,
        /** [自由数量的队伍] 指定每支队伍的最少玩家数, 同时还需要指定 freeTeamMaxPlayers */
        freeTeamMinPlayers?: number,
        /** [自由数量的队伍] 指定每支队伍的最大玩家数, 同时还需要指定 freeTeamMinPlayers */
        freeTeamMaxPlayers?: number,
        /** 同步帧率 */
        frameRate: number,
        /** 帧同步状态 */
        frameSyncState: 0 | 1,
        /** 创建房间时间戳（单位毫秒， new Date(createTime) 可获得时间对象） */
        createTime: number,
        /** 开始游戏时间戳（单位毫秒， new Date(createTime) 可获得时间对象）,0表示未开始 */
        startGameTime: number
    }
}
```

**配置**
```ts
{
  "cryptoMode": "None"
}
```

---

## 获取房间注册信息 <a id="/GetRoomRegInfo"></a>

**路径**
- POST `/GetRoomRegInfo`

**请求**
```ts
interface ReqGetRoomRegInfo {
    roomId: string,
    /** 有需要鉴权的接口,则需要传递玩家token */
    playerToken?: string
}
```

**响应**
```ts
interface ResGetRoomRegInfo {
    /** 房间在服务器上的注册信息 */
    regInfo: {/** 游戏服务器的连接地址 */
        gameServerUrl: string
    }
}
```

**配置**
```ts
{
  "cryptoMode": "None"
}
```

---

## 查询匹配 <a id="/QueryMatch"></a>

**路径**
- POST `/QueryMatch`

**请求**
```ts
interface ReqQueryMatch {
    /** 匹配请求ID，用于查询匹配结果，建议2秒调用查询一次，直到超时(因为请求时超时时间已知，客户端要加个超时判断) */
    matchReqId: string,
    /** 有需要鉴权的接口,则需要传递玩家token */
    playerToken?: string
}
```

**响应**
```ts
interface ResQueryMatch {
    /** 当前匹配是否有结果 */
    hasResult: boolean,
    /** 如果匹配结果是失败的则有错误消息 */
    errMsg?: string,
    /** 如果匹配结果是失败的则有错误码 */
    errCode?: number,
    /** 匹配结果, 如果匹配有结果并且是成功的，则不为空 */
    matchResult?: {
        /** 房间所处的游戏服务器地址 */
        gameServerUrl: string,
        /** 房间id */
        roomId: string,
        /** 本次匹配中各个玩家对应的结果信息 */
        matchPlayerResults: {
            /** 玩家id */
            playerId: string,
            /** 应该加入的队伍id */
            teamId?: string
        }[]
    }
}
```

**配置**
```ts
{
  "cryptoMode": "None"
}
```

---

## RecoverPlayerRoom <a id="/RecoverPlayerRoom"></a>

**路径**
- POST `/RecoverPlayerRoom`

**请求**
```ts
interface ReqRecoverPlayerRoom {
    playerId: string,
    playerToken: string,
    /** 可更新玩家显示名 */
    updateShowName?: string
}
```

**响应**
```ts
interface ResRecoverPlayerRoom {
    /** 全局唯一的玩家ID */
    playerId: string,
    /** 玩家认证令牌 */
    playerToken: string,
    /** 当前所在的房间ID */
    currRoomId?: string
}
```

**配置**
```ts
{
  "cryptoMode": "None"
}
```

---

## 请求匹配 <a id="/RequestMatch"></a>

**路径**
- POST `/RequestMatch`

**请求**
```ts
interface ReqRequestMatch {
    /** 匹配参数 */
    matchParams: {
        matchFromType: "Player",
        /** 匹配发起的玩家信息, 注意,这些玩家不会收到服务器通知 */
        matchFromInfo: {/**
* 要匹配的玩家ID, 一般只传自己,
* 可以传入其他玩家id, 但其他玩家并不会收到通知,因此其他玩家的后续操作需要自行处理(连接游戏服务器和加入房间等)
*/
            playerIds: string[]
        },
        /** 匹配自定义类型, 只有相同的才会匹配在一起! */
        matchType?: string,
        /** 匹配器标识(只有相同的才会匹配在一起)，内置的匹配器标识定义: MatcherKeys，也可以使用自定义的(服务器)匹配器 */
        matcherKey: string,
        /** 匹配器参数，对应匹配器需要的额外配置 */
        matcherParams: any,
        /** 匹配超时秒数, 0或者undefined则默认60秒 */
        matchTimeoutSec?: number,
        /** 房间最大玩家数, 只有相同的才会匹配在一起, 如果有队伍, 则队伍的合计最大玩家数要和本值一致! */
        maxPlayers: number,
        /** 组队参数, 只有相同的才会匹配在一起, 是否需要取决于匹配器是否需要 */
        teamParams?: {
            /**
            * [固定数量的队伍] 直接用数量自动生成所有固定队伍配置, 房间ID将从 '1' 开始到 fixedTeamCount,
            * 还需要传 fixedTeamMinPlayers 和 fixedTeamMaxPlayers, 或者使用 fixedTeamInfoList 完全自定义
            */
            fixedTeamCount?: number,
            /** [固定数量的队伍] 每支队伍最少玩家数(包含), 没传默认为1 */
            fixedTeamMinPlayers?: number,
            /** [固定数量的队伍] 每支队伍最大玩家数(包含), 没传默认为9 */
            fixedTeamMaxPlayers?: number,
            /** [固定数量的队伍] 使用传入的队伍id等信息来定义所有队伍, 并忽略 fixedTeam* 的其他参数 */
            fixedTeamInfoList?: {
                /** 队伍 ID, 房间内唯一 */
                id: string,
                /** 队伍名称 */
                name: string,
                /** 队伍最小人数 */
                minPlayers: number,
                /** 队伍最大人数 */
                maxPlayers: number
            }[],
            /** [自由数量的队伍] 指定每支队伍的最少玩家数, 同时还需要指定 freeTeamMaxPlayers */
            freeTeamMinPlayers?: number,
            /** [自由数量的队伍] 指定每支队伍的最大玩家数, 同时还需要指定 freeTeamMinPlayers */
            freeTeamMaxPlayers?: number
        }
    },
    /** 有需要鉴权的接口,则需要传递玩家token */
    playerToken?: string
}
```

**响应**
```ts
interface ResRequestMatch {
    /** 匹配请求ID，用于查询匹配结果，建议2秒调用查询一次，直到超时 */
    matchReqId: string
}
```

**配置**
```ts
{
  "cryptoMode": "None"
}
```

