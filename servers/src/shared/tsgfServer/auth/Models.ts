import { IPlayerInfo } from "../../tsgf/player/IPlayerInfo";


/**玩家认证信息*/
export interface IPlayerAuthInfo {
    /**全局唯一的玩家ID*/
    playerId: string;
    /**所属应用ID*/
    appId: string;
    /**应用下的玩家ID（应用自定义玩家ID）*/
    openId: string;
    /**玩家认证令牌*/
    playerToken: string;
    /**显示名称*/
    showName: string;
    /**是否已经失效，一般发生在同玩家在token还没失效的情况下，重复授权，会把之前的token设置为失效状态*/
    invalid: boolean;
    /**过期时间(毫秒级时间戳)*/
    expireDate: number;
    /**当前所在的房间ID*/
    currRoomId?: string;
}

export interface IPlayer {
    /**认证信息*/
    authInfo: IPlayerAuthInfo;
    /**玩家信息*/
    playerInfo: IPlayerInfo;
    /**当前玩家在房间范围内创建的机器人集合(玩家离开房间或下线后,机器人自动离线)*/
    roomRobotPlayers: Map<string, IPlayerInfo>;
    /**房间中断线后等待重连的毫秒数,默认为60000ms(60秒),设成0表示断线后直接清理(按退出房间处理)不等待重连*/
    roomWaitReconnectTime: number;
}