import { ITeamParams, ITeamPlayerIds } from "../room/IRoomInfo";

/**匹配类型*/
export enum EMatchFromType {
    /**单个或多个玩家要匹配，进已存在的或新的房间*/
    Player = 'Player',
    /**已经创建好的房间，支持匹配来人*/
    RoomJoinUs = 'RoomJoinUs',
    /**房间全玩家去匹配全新的房间*/
    RoomAllPlayers = 'RoomAllPlayers',
}

/**来自单个玩家提交的匹配信息*/
export interface IMatchFromPlayer {
    /**要匹配的玩家ID, 一般只传自己, 
     * 可以传入其他玩家id, 但其他玩家并不会收到通知,因此其他玩家的后续操作需要自行处理(连接游戏服务器和加入房间等)*/
    playerIds: string[];
}
/**来自房间所有玩家提交的配置信息*/
export interface IMatchFromRoomAllPlayers {
}



/**匹配请求参数基础定义
 * 匹配器+最大玩家数+组队参数 全部一致才会匹配到一起
*/
export interface IMatchParamsBase {
    /**匹配自定义类型, 只有相同的才会匹配在一起!*/
    matchType?: string;
    /**匹配器标识(只有相同的才会匹配在一起)，内置的匹配器标识定义: MatcherKeys，也可以使用自定义的(服务器)匹配器*/
    matcherKey: string;
    /**匹配器参数，对应匹配器需要的额外配置*/
    matcherParams: any;
    /**匹配超时秒数, 0或者undefined则默认60秒*/
    matchTimeoutSec?: number;
    /**房间最大玩家数, 只有相同的才会匹配在一起, 如果有队伍, 则队伍的合计最大玩家数要和本值一致!*/
    maxPlayers: number;

    /**组队参数, 只有相同的才会匹配在一起, 是否需要取决于匹配器是否需要*/
    teamParams?: ITeamParams;
}

/**单独玩家发起的匹配参数*/
export interface IMatchParamsFromPlayer extends IMatchParamsBase {
    /**发起类型是玩家*/
    matchFromType: EMatchFromType.Player;
    /**匹配发起的玩家信息, 注意,这些玩家不会收到服务器通知*/
    matchFromInfo: IMatchFromPlayer;
}
/**房间全玩家发起的匹配参数*/
export interface IMatchParamsFromRoomAllPlayer extends IMatchParamsBase {
    /**发起类型是房间全玩家*/
    matchFromType: EMatchFromType.RoomAllPlayers;
    /**匹配发起的附加信息*/
    matchFromInfo: IMatchFromRoomAllPlayers;
}

/**匹配参数*/
export type IMatchParams = IMatchParamsFromPlayer | IMatchParamsFromRoomAllPlayer;


/**内置匹配器标识定义*/
export const MatcherKeys = {
    /**单人(无组队,忽视队伍参数), 支持多个玩家一起提交匹配,但匹配结果是没有组队的
     * matcherParams 类型对应为: ISingleMatcherParams*/
    Single: 'Single',
    /**固定队伍匹配器, 所有玩家都在同一个队伍中, 具体哪个队伍由匹配逻辑分配
     * matcherParams 类型对应为: IFixedTeamsMatcherParams*/
    FixedTeams: 'FixedTeams',
    /**指定固定队伍匹配器, 可以详细指定每个玩家的所属队伍
     * matcherParams 类型对应为: IFixedTeamsSpecifyMatcherParams*/
    FixedTeamsSpecify: 'FixedTeamsSpecify',
    /**自由队伍匹配器, matcherParams 类型对应为: IFreeTeamsMatcherParams*/
    FreeTeams: 'FreeTeams',
};
/**单人匹配器的匹配属性*/
export interface ISingleMatcherParams {
    /**至少几个玩家匹配,才算匹配成功(创建房间), 如果要匹配满才开,则将值设置为maxPlayers*/
    minPlayers: number;
    /**生成结果后(满足最小玩家数但未满足最大玩家数时),是否继续开启房间招人匹配,直到满员*/
    resultsContinueRoomJoinUsMatch?: boolean;
}
/**固定队伍匹配器 的匹配属性*/
export interface IFixedTeamsMatcherParams {
    /**满足最小玩家数但未满足最大玩家数时, 是否继续开启房间招人匹配,直到满员*/
    resultsContinueRoomJoinUsMatch?: boolean;
}
/**指定固定队伍匹配器 的匹配属性*/
export interface IFixedTeamsSpecifyMatcherParams {
    /**详细指定玩家的队伍分组*/
    specifyTeamPlayers?: ITeamPlayerIds[];

    /**满足最小玩家数但未满足最大玩家数时, 是否继续开启房间招人匹配,直到满员*/
    resultsContinueRoomJoinUsMatch?: boolean;
}
/**自由队伍匹配器 的匹配属性*/
export interface IFreeTeamsMatcherParams {
    /**至少几个队伍,才算匹配成功(创建房间), 不设置视为匹配满
     * 如不配置则需注意: 最大人数如果不能被队伍人数整除, 会导致人数永远无法匹配满!
     * */
    minTeams?: number;
    /**至少几个玩家匹配,才算匹配成功(创建房间), 不设置视为匹配满
     * 如不配置则需注意: 最大人数如果不能被队伍人数整除, 会导致人数永远无法匹配满!
    */
    minPlayers?: number;
    /**[队伍参数] 所有玩家都在同一个队伍*/
    allPlayersSameTeam?: boolean;
    /**[队伍参数] 所有玩家都在指定的队伍id中*/
    allPlayersSameTeamId?: string;
    /**满足最小玩家数但未满足最大玩家数时, 是否继续开启房间招人匹配,直到满员*/
    resultsContinueRoomJoinUsMatch?: boolean;
}

/*
let a: IMatchParams = {
    matchFromType: EMatchFromType.Player,
    matchFromInfo: {
        playerIds:[],
    },
    matcherKey: MatcherKeys.Single,
    maxPlayers: 10,
    matcherParams: {},
};
let b: IMatchParams = {
    matchFromType: EMatchFromType.RoomAllPlayers,
    matchFromInfo: {
    },
    matcherKey: MatcherKeys.Single,
    maxPlayers: 10,
    matcherParams: {
        maxPlayer:1
    },
};
let c!: IMatchParams;
if (c.matchFromType == EMatchFromType.RoomAllPlayers) {
    let room = c.matchFromInfo;
} else if (c.matchFromType == EMatchFromType.Player) {
    let player = c.matchFromInfo;
}
*/


/**匹配请求的单个玩家结果*/
export interface IMatchPlayerResult {
    /**玩家id*/
    playerId: string;
    /**应该加入的队伍id*/
    teamId?: string;
}

/**给单个玩家的匹配结果(包含要加入的服务器信息)*/
export interface IMatchPlayerResultWithServer {
    /**房间所处的游戏服务器地址, 如果为undefined则说明服务器当前不可用*/
    gameServerUrl?: string;
    /**房间id*/
    roomId: string;
    /**应该加入的队伍id*/
    teamId?: string;
}

/**匹配请求的匹配结果*/
export interface IMatchResult {
    /**房间所处的游戏服务器地址, 如果为undefined则说明服务器当前不可用*/
    gameServerUrl?: string;
    /**房间id*/
    roomId: string;
    /**本次匹配中各个玩家对应的结果信息*/
    matchPlayerResults: IMatchPlayerResult[];
}