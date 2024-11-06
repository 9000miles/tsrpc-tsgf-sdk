import { IRoomInfo } from "../room/IRoomInfo";

/**网络状态*/
export enum ENetworkState {
    /**离线*/
    OFFLINE = 0,
    /**在线*/
    ONLINE = 1,
}

/**
 * 玩家信息
*/
export interface IPlayerInfo {
    /**玩家ID*/
    playerId: string;
    /**显示名*/
    showName: string;
    /**当前房间中所在的队伍id*/
    teamId?: string;
    /**自定义玩家状态*/
    customPlayerStatus: number;
    /**自定义玩家信息*/
    customPlayerProfile: string;
    /**网络状态*/
    networkState: ENetworkState;
    /**是否机器人*/
    isRobot: boolean;
    /**当前所在房间控制的机器人id列表(机器人玩家id)*/
    roomRobotIds?: string[];
}

/**玩家信息参数*/
export interface IPlayerInfoPara {
    /**玩家显示名(昵称), 没传默认使用服务端授权时传入的 showName */
    showName?: string;
    /**自定义玩家状态, 没传默认为 0*/
    customPlayerStatus?: number;
    /**自定义玩家信息, 没传默认为 ''*/
    customPlayerProfile?: string;
}

/**玩家自定义信息的变更信息*/
export interface IChangeCustomPlayerProfile {
    changePlayerId: string;
    customPlayerProfile: string;
    oldCustomPlayerProfile: string;
    roomInfo: IRoomInfo;
}
/**玩家自定义状态的变更信息*/
export interface IChangeCustomPlayerStatus {
    changePlayerId: string;
    customPlayerStatus: number;
    oldCustomPlayerStatus: number;
    roomInfo: IRoomInfo;
}
/**玩家队伍的变更信息*/
export interface IChangePlayerTeam {
    changePlayerId: string;
    teamId?: string;
    oldTeamId?: string;
    roomInfo: IRoomInfo;
}