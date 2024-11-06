import { IPlayerInfo } from "../player/IPlayerInfo";

/**创建房间的方式*/
export enum ERoomCreateType {
    /**调用创建房间方法创建的*/
    COMMON_CREATE = 0,
    /**由匹配创建的*/
    MATCH_CREATE = 1,
}

/**帧同步状态*/
export enum EFrameSyncState {
    /**未开始帧同步*/
    STOP = 0,
    /**已开始帧同步*/
    START = 1,
}

/**私有房间的加入模式*/
export enum EPrivateRoomJoinMode {
    /**知道房间id即可加入*/
    roomIdJoin = 0,
    /**禁止加入*/
    forbidJoin = 1,
    /**使用密码加入*/
    password = 2,
}

/**房间信息*/
export interface IRoomInfo {
    /**房间ID*/
    roomId: string;
    /**房间名称*/
    roomName: string;
    /**房主玩家ID，创建后，只有房主玩家的客户端才可以调用相关的管理操作*/
    ownerPlayerId: string;
    /**是否私有房间，私有房间不参与匹配*/
    isPrivate: boolean;
    /**私有房间的加入模式*/
    privateRoomJoinMode?: EPrivateRoomJoinMode;
    /**如果参与匹配,则使用的匹配器标识*/
    matcherKey?: string;
    /**创建房间的方式*/
    createType: ERoomCreateType;
    /**进入房间的最大玩家数量*/
    maxPlayers: number;
    /**房间类型自定义字符串*/
    roomType?: string;
    /**自定义房间属性字符串*/
    customProperties?: string;

    /**如果当前房间在匹配 (房间全玩家匹配),则有匹配请求id*/
    allPlayerMatchReqId?: string;

    /**玩家列表*/
    playerList: IPlayerInfo[];
    /**队伍列表,如果创建房间时有传入队伍参数,则会有内容,否则为[]*/
    teamList: ITeamInfo[];
    /**[固定数量的队伍] 直接用数量自动生成所有固定队伍配置, 房间ID将从 '1' 开始到 fixedTeamCount, 
     * 还需要传 fixedTeamMinPlayers 和 fixedTeamMaxPlayers, 或者使用 fixedTeamInfoList 完全自定义 */
    fixedTeamCount?: number;
    /**[自由数量的队伍] 指定每支队伍的最少玩家数, 同时还需要指定 freeTeamMaxPlayers*/
    freeTeamMinPlayers?: number;
    /**[自由数量的队伍] 指定每支队伍的最大玩家数, 同时还需要指定 freeTeamMinPlayers*/
    freeTeamMaxPlayers?: number;

    /**同步帧率*/
    frameRate: number;
    /**帧同步状态*/
    frameSyncState: EFrameSyncState;
    /**创建房间时间戳（单位毫秒， new Date(createTime) 可获得时间对象）*/
    createTime: number;
    /**开始游戏时间戳（单位毫秒， new Date(createTime) 可获得时间对象）,0表示未开始*/
    startGameTime: number;

    /**保留空房间毫秒数,重新进人再退出后重新计时,放空或为0表示不保留空房间,直接销毁*/
    retainEmptyRoomTime?: number;
    /**是否为房主保留固定位置,即使房主离开后"满房"还是可以加入,即房主离开后房间真实最大人数=maxPlayers-1*/
    retainOwnSeat: boolean;


    /** 随机要求玩家同步状态给服务端的间隔毫秒（不设置和设0表示不开启）,方便大大缩短追帧时间，但要求客户端实现状态数据全量同步，每隔一段时间要求一个玩家上报自己的全量状态数据，之后的追帧将从本状态开始同步+追帧*/
    randomRequirePlayerSyncStateInvMs?: number;
}

/**队伍的配置参数*/
export interface ITeamParams {

    /**[固定数量的队伍] 直接用数量自动生成所有固定队伍配置, 房间ID将从 '1' 开始到 fixedTeamCount, 
     * 还需要传 fixedTeamMinPlayers 和 fixedTeamMaxPlayers, 或者使用 fixedTeamInfoList 完全自定义 */
    fixedTeamCount?: number;
    /**[固定数量的队伍] 每支队伍最少玩家数(包含), 没传默认为1*/
    fixedTeamMinPlayers?: number;
    /**[固定数量的队伍] 每支队伍最大玩家数(包含), 没传默认为9*/
    fixedTeamMaxPlayers?: number;
    /**[固定数量的队伍] 使用传入的队伍id等信息来定义所有队伍, 并忽略 fixedTeam* 的其他参数*/
    fixedTeamInfoList?: ITeamInfo[];

    /**[自由数量的队伍] 指定每支队伍的最少玩家数, 同时还需要指定 freeTeamMaxPlayers*/
    freeTeamMinPlayers?: number;
    /**[自由数量的队伍] 指定每支队伍的最大玩家数, 同时还需要指定 freeTeamMinPlayers*/
    freeTeamMaxPlayers?: number;

}

/**创建房间的参数*/
export interface ICreateRoomPara extends ITeamParams {
    /**房间名字，查询房间和加入房间时会获取到*/
    roomName: string;
    /**房主玩家ID，创建后，只有房主玩家的客户端才可以调用相关的管理操作, 如果不想任何人操作,可以直接设置为''*/
    ownerPlayerId: string;
    /**进入房间的最大玩家数量*/
    maxPlayers: number;
    /**是否私有房间，私有房间不参与匹配，同时需要给 privateRoomJoinMode 赋值，默认为使用房间id即可加入*/
    isPrivate: boolean;
    /**私有房间的加入模式, 私有房间则需要赋值, 默认为使用房间id即可加入*/
    privateRoomJoinMode?: EPrivateRoomJoinMode;
    /**如果私有房间的加入模式是密码, 则必填本密码字段*/
    privateRoomPassword?: string;

    /**如果参与匹配,则使用的匹配器标识*/
    matcherKey?: string;
    /**自定义房间属性字符串*/
    customProperties?: string;
    /**房间类型自定义字符串*/
    roomType?: string;
    /**指定房间ID,必须全局唯一, 放空则会自动生成guid*/
    roomId?: string;
    /**保留空房间毫秒数,重新进人再退出后重新计时,放空或为0表示不保留空房间,直接销毁*/
    retainEmptyRoomTime?: number;
    /**是否为房主保留固定位置,即使房主离开后"满房"还是可以加入,即房主离开后房间真实最大人数=maxPlayers-1*/
    retainOwnSeat?: boolean;
    
    /** 随机要求玩家同步状态给服务端的间隔毫秒（不设置和设0表示不开启）,方便大大缩短追帧时间，但要求客户端实现状态数据全量同步，每隔一段时间要求一个玩家上报自己的全量状态数据，之后的追帧将从本状态开始同步+追帧*/
    randomRequirePlayerSyncStateInvMs?: number;
}

/**房间列表的筛选参数*/
export interface IRoomsFilterPara {
    roomType?: string;
    maxPlayers?: number;
    roomNameLike?: string;
    roomNameFullMatch?: string;
}
/**房间筛选结果*/
export interface IRoomsFilterRes {
    /**符合条件并按照范围返回的房间列表*/
    rooms: IRoomOnlineInfo[];
    /**符合的总数量*/
    count: number;
}

/**获取符合条件的房间或创建一个*/
export interface IGetOrCreateRoomPara {
    /**[至少要有一个]匹配房间配型*/
    matchRoomType?: boolean;
    /**[至少要有一个]匹配房间最大玩家数*/
    matchMaxPlayers?: boolean;
    /**最多匹配的房间数量, 放空则默认为3*/
    matchLimitRoomCount?: number;
    /**匹配的信息来源,都匹配不上,也将使用本参数进行创建房间*/
    createRoomPara: ICreateRoomPara;
}
/**获取符合条件的房间或创建一个的结果数据*/
export interface IGetOrCreateRoomRsp {
    /**有匹配条件的房间*/
    matchRoomOnlineInfoList?: IRoomOnlineInfo[];
    /**没匹配到但创建了房间的信息*/
    createRoomOnlineInfo?: IRoomOnlineInfo;
}

/**加入房间参数*/
export interface IJoinRoomPara {
    roomId: string;
    /**同时指定加入的队伍ID*/
    teamId?: string;
    /**私有房间是密码加入模式时,需要提供密码*/
    password?: string;
}

/**房间在线信息, 给未加入房间的客户端的房间基本信息*/
export interface IRoomOnlineInfo {
    /**房间ID*/
    roomId: string;
    /**房主玩家ID，创建后，只有房主玩家的客户端才可以调用相关的管理操作*/
    ownerPlayerId: string;
    /**房间名称*/
    roomName: string;
    /**房间类型自定义字符串*/
    roomType?: string;
    /**房间最大玩家数*/
    maxPlayers: number;
    /**房间当前空位数(可加多少个玩家)*/
    emptySeats: number;
    /**是否私有房间，私有房间不参与匹配, 并且要符合 privateRoomJoinMode 的加入方式*/
    isPrivate: boolean;
    /**私有房间的加入模式*/
    privateRoomJoinMode?: EPrivateRoomJoinMode;

    /**游戏服务器的连接地址, 如果为undefined则说明服务器当前不可用*/
    gameServerUrl?: string;
    /**当前游戏服务器在线人数*/
    currGameServerPlayers: number;
}


/**修改房间信息的参数*/
export interface IChangeRoomPara {
    /**[不修改请不要赋值] 房间名称*/
    roomName?: string;
    /**[不修改请不要赋值] 是否私有房间，私有房间不参与匹配，同时需要给 privateRoomJoinMode 赋值，否则默认为使用房间id即可加入*/
    isPrivate?: boolean;
    /**[不修改请不要赋值] 私有房间的加入模式, 私有房间则需要赋值, 默认为使用房间id即可加入*/
    privateRoomJoinMode?: EPrivateRoomJoinMode;
    /**[不修改请不要赋值] 如果私有房间的加入模式是密码, 则必填本密码字段*/
    privateRoomPassword?: string;
    /**[不修改请不要赋值] 自定义房间属性字符串*/
    customProperties?: string;
}


export interface ITeamInfo {
    /**队伍 ID, 房间内唯一*/
    id: string;
    /**队伍名称*/
    name: string;
    /**队伍最小人数*/
    minPlayers: number;
    /**队伍最大人数*/
    maxPlayers: number;
}


/**队伍的玩家id列表*/
export interface ITeamPlayerIds {
    /**所属队伍id,如果没有队伍则为 undefined*/
    teamId?: string;
    /**玩家id列表*/
    playerIds: string[];
}