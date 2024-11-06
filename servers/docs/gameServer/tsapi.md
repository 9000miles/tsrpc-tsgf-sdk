
# TSRPC API 接口文档

## 通用说明

- 所有请求方法均为 `POST`
- 所有请求均需加入以下 Header :
    - `Content-Type: application/json`

## 目录

- [玩家认证](#/Authorize)
- [取消匹配请求](#/CancelMatch)
- [修改玩家自定义属性](#/ChangeCustomPlayerProfile)
- [修改玩家自定义状态](#/ChangeCustomPlayerStatus)
- [ChangePlayerTeam](#/ChangePlayerTeam)
- [修改房间信息](#/ChangeRoom)
- [CreateRoomRobot](#/CreateRoomRobot)
- [解散房间](#/DismissRoom)
- [加入房间](#/JoinRoom)
- [离开房间](#/LeaveRoom)
- [查询完整匹配结果](#/QueryMatch)
- [断线重连](#/Reconnect)
- [请求追帧](#/RequestAfterFrames)
- [请求具体的帧数据](#/RequestFrames)
- [发起房间所有玩家匹配请求](#/RequestMatch)
- [RoomRobotLeave](#/RoomRobotLeave)
- [发送房间消息](#/SendRoomMsg)
- [房间内开始帧同步](#/StartFrameSync)
- [房间内停止帧同步](#/StopFrameSync)

---

## 玩家认证 <a id="/Authorize"></a>

需要连接后立即发出请求,否则超时将被断开连接

**路径**
- POST `/Authorize`

**请求**
```ts
interface ReqAuthorize {
    /** 玩家令牌,登录大厅时获得的 */
    playerToken: string,
    /** 玩家显示名(昵称), 没传默认使用服务端授权时传入的 showName */
    showName?: string,
    /** 自定义玩家状态, 没传默认为 0 */
    customPlayerStatus?: number,
    /** 自定义玩家信息, 没传默认为 '' */
    customPlayerProfile?: string
}
```

**响应**
```ts
interface ResAuthorize {
    /** 玩家ID */
    playerInfo: {
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
    }
}
```

---

## 取消匹配请求 <a id="/CancelMatch"></a>

可能发生并发,导致虽然请求成功了,但还是收到了成功结果的通知

**路径**
- POST `/CancelMatch`

**请求**
```ts
interface ReqCancelMatch {

}
```

**响应**
```ts
interface ResCancelMatch {

}
```

---

## 修改玩家自定义属性 <a id="/ChangeCustomPlayerProfile"></a>

修改后同房间内的所有玩家都将收到通知

**路径**
- POST `/ChangeCustomPlayerProfile`

**请求**
```ts
interface ReqChangeCustomPlayerProfile {
    customPlayerProfile: string,
    /** 可以指定自己的玩家机器人 */
    robotPlayerId?: string
}
```

**响应**
```ts
interface ResChangeCustomPlayerProfile {

}
```

---

## 修改玩家自定义状态 <a id="/ChangeCustomPlayerStatus"></a>

修改后房间内(如果在的话)所有玩家(包含自己)会收到通知

**路径**
- POST `/ChangeCustomPlayerStatus`

**请求**
```ts
interface ReqChangeCustomPlayerStatus {
    customPlayerStatus: number,
    /** 可以指定自己的玩家机器人 */
    robotPlayerId?: string
}
```

**响应**
```ts
interface ResChangeCustomPlayerStatus {

}
```

---

## ChangePlayerTeam <a id="/ChangePlayerTeam"></a>

**路径**
- POST `/ChangePlayerTeam`

**请求**
```ts
interface ReqChangePlayerTeam {
    newTeamId?: string,
    /** 可以指定自己的玩家机器人 */
    robotPlayerId?: string
}
```

**响应**
```ts
interface ResChangePlayerTeam {
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

---

## 修改房间信息 <a id="/ChangeRoom"></a>

只有房主可以修改
修改后房间内所有玩家都收到通知

**路径**
- POST `/ChangeRoom`

**请求**
```ts
interface ReqChangeRoom {
    /** [不修改请不要赋值] 房间名称 */
    roomName?: string,
    /** [不修改请不要赋值] 房主玩家ID，创建后，只有房主玩家的客户端才可以调用相关的管理操作 */
    ownerPlayerId?: string,
    /** [不修改请不要赋值] 是否私有房间，即不参与匹配, 但可以通过房间ID加入 */
    isPrivate?: boolean,
    /** [不修改请不要赋值] 是否不允许加人(任何方式都无法加入) */
    isForbidJoin?: boolean,
    /** [不修改请不要赋值] 自定义房间属性字符串 */
    customProperties?: string
}
```

**响应**
```ts
interface ResChangeRoom {
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

---

## CreateRoomRobot <a id="/CreateRoomRobot"></a>

**路径**
- POST `/CreateRoomRobot`

**请求**
```ts
interface ReqCreateRoomRobot {
    /** 玩家信息参数 */
    createPa: {
        /** 玩家显示名(昵称), 没传默认使用服务端授权时传入的 showName */
        showName?: string,
        /** 自定义玩家状态, 没传默认为 0 */
        customPlayerStatus?: number,
        /** 自定义玩家信息, 没传默认为 '' */
        customPlayerProfile?: string
    },
    /** 同时指定加入的队伍ID */
    teamId?: string
}
```

**响应**
```ts
interface ResCreateRoomRobot {
    /** 创建的机器人id */
    robotInfo: {
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
    }
}
```

---

## 解散房间 <a id="/DismissRoom"></a>

**路径**
- POST `/DismissRoom`

**请求**
```ts
interface ReqDismissRoom {
    roomId: string
}
```

**响应**
```ts
interface ResDismissRoom {
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

---

## 加入房间 <a id="/JoinRoom"></a>

**路径**
- POST `/JoinRoom`

**请求**
```ts
interface ReqJoinRoom {
    roomId: string,
    /** 同时指定加入的队伍ID */
    teamId?: string
}
```

**响应**
```ts
interface ResJoinRoom {
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

---

## 离开房间 <a id="/LeaveRoom"></a>

**路径**
- POST `/LeaveRoom`

**请求**
```ts
interface ReqLeaveRoom {
    /** 保留空房间(默认为false),即离开后如果没人了是否保留本房间一段时间,用于后续再次进入,一般用于组队房间 */
    retainEmptyRoom?: boolean
}
```

**响应**
```ts
interface ResLeaveRoom {

}
```

---

## 查询完整匹配结果 <a id="/QueryMatch"></a>

会等到有结果了才返回!
注意: 同时只能只有一个玩家进行查询等待,一般使用通知来获取结果即可

**路径**
- POST `/QueryMatch`

**请求**
```ts
interface ReqQueryMatch {

}
```

**响应**
```ts
interface ResQueryMatch {
    /** 匹配结果, 同时房间中的对应玩家也会收到通知 */
    matchResult: {
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

---

## 断线重连 <a id="/Reconnect"></a>

**路径**
- POST `/Reconnect`

**请求**
```ts
interface ReqReconnect {
    /** 之前连接上的连接ID */
    playerToken: string
}
```

**响应**
```ts
interface ResReconnect {
    /** 当前玩家id */
    playerId: string,
    /** 当前所在房间信息,如果没在房间中则为 null */
    currRoomInfo: {
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
    } | null
}
```

---

## 请求追帧 <a id="/RequestAfterFrames"></a>

**路径**
- POST `/RequestAfterFrames`

**请求**
```ts
interface ReqRequestAfterFrames {
    /**
    * 使用指定的帧索引开始追帧
    * 不传则默认按下面顺序优先选择:
    * 1. 使用服务端同步状态所在帧索引开始
    * 2. 如果没有同步状态则从头开始
    */
    startFrameIndex?: number
}
```

**响应**
```ts
interface ResRequestAfterFrames {
    /** 状态同步的数据(如果没启用状态同步则可忽略) */
    stateData: any,
    /** 状态同步所在帧索引, 即追帧的索引(afterFrames)从下一帧开始, 如果没启用状态同步则可忽略,同时值为-1 */
    stateFrameIndex: number,
    /** 要追帧数组, 允许仅包含输入帧, 但要求顺序, 并且范围为[afterStartFrameIndex ~ afterEndFrameIndex] */
    afterFrames: {
        /** 帧索引 */
        frameIndex: number,
        /** 所有玩家的输入列表 (如果玩家提交输入的频率很高,里面有重复的玩家数据,即同帧时系统不会合并同玩家输入) null则为空帧 */
        playerInputs: {
            /** 来源的玩家ID */
            playerId: string,
            /** 输入帧类型 */
            inputFrameType: 1 | 2 | 3 | 4,
            /** 玩家在本帧的操作列表. inputFrameType == EPlayerInputFrameType.Operates 有数据 */
            operates?: { [key: string]: any }[],
            [key: string]: any
        }[] | null,
        [key: string]: any
    }[],
    /** 追帧数组起始帧索引(包含) */
    afterStartFrameIndex: number,
    /** 追帧数组的截止帧索引(包含) */
    afterEndFrameIndex: number,
    /** 服务端同步帧率(每秒多少帧) */
    serverSyncFrameRate: number
}
```

---

## 请求具体的帧数据 <a id="/RequestFrames"></a>

**路径**
- POST `/RequestFrames`

**请求**
```ts
interface ReqRequestFrames {
    /** 起始帧索引(包含) */
    beginFrameIndex: number,
    /** 结束帧索引(包含) */
    endFrameIndex: number
}
```

**响应**
```ts
interface ResRequestFrames {
    /** 帧数组 */
    frames: {
        /** 帧索引 */
        frameIndex: number,
        /** 所有玩家的输入列表 (如果玩家提交输入的频率很高,里面有重复的玩家数据,即同帧时系统不会合并同玩家输入) null则为空帧 */
        playerInputs: {
            /** 来源的玩家ID */
            playerId: string,
            /** 输入帧类型 */
            inputFrameType: 1 | 2 | 3 | 4,
            /** 玩家在本帧的操作列表. inputFrameType == EPlayerInputFrameType.Operates 有数据 */
            operates?: { [key: string]: any }[],
            [key: string]: any
        }[] | null,
        [key: string]: any
    }[]
}
```

---

## 发起房间所有玩家匹配请求 <a id="/RequestMatch"></a>

请求成功即返回,同时房间中的所有玩家会收到通知
匹配有结果了还会收到消息通知, 并且可由一个玩家调用QueryMatch等待完整匹配结果

**路径**
- POST `/RequestMatch`

**请求**
```ts
interface ReqRequestMatch {
    /** 匹配参数 */
    matchParams: {
        matchFromType: "RoomAllPlayers",
        /** 匹配发起的附加信息 */
        matchFromInfo: {},
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
    }
}
```

**响应**
```ts
interface ResRequestMatch {
    /** 匹配请求id */
    matchReqId: string
}
```

---

## RoomRobotLeave <a id="/RoomRobotLeave"></a>

**路径**
- POST `/RoomRobotLeave`

**请求**
```ts
interface ReqRoomRobotLeave {
    /** 自己创建的机器人 */
    robotPlayerId: string
}
```

**响应**
```ts
interface ResRoomRobotLeave {
    /** 玩家信息 */
    robotInfo: {
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
    }
}
```

---

## 发送房间消息 <a id="/SendRoomMsg"></a>

**路径**
- POST `/SendRoomMsg`

**请求**
```ts
interface ReqSendRoomMsg {
    /** 房间消息 */
    roomMsg: {
        /** 消息的接收类型，决定能接收到的玩家范围 */
        recvType: 1 | 2,
        /** 自定义消息字符串 */
        msg: string
    } | {
        recvType: 3,
        /** 接收本条消息的玩家ID列表 */
        recvPlayerList: string[],
        /** 自定义消息字符串 */
        msg: string
    },
    /** 可以指定自己的玩家机器人 */
    robotPlayerId?: string
}
```

**响应**
```ts
interface ResSendRoomMsg {

}
```

---

## 房间内开始帧同步 <a id="/StartFrameSync"></a>

**路径**
- POST `/StartFrameSync`

**请求**
```ts
interface ReqStartFrameSync {

}
```

**响应**
```ts
interface ResStartFrameSync {

}
```

---

## 房间内停止帧同步 <a id="/StopFrameSync"></a>

**路径**
- POST `/StopFrameSync`

**请求**
```ts
interface ReqStopFrameSync {

}
```

**响应**
```ts
interface ResStopFrameSync {

}
```

