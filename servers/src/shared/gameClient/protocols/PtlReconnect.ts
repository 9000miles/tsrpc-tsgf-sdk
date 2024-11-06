import { IRoomInfo } from "../../tsgf/room/IRoomInfo";

/**
 * 断线重连
 * 
 * */
export interface ReqReconnect {
    /**之前连接上的令牌 */
    playerToken: string;
    /**可设置房间中断线后等待重连的毫秒数,默认为60000ms(60秒),设成0表示断线后直接清理(按退出房间处理)不等待重连*/
    roomWaitReconnectTime?: number;
}

export interface ResReconnect {
    /**当前玩家id*/
    playerId: string;
    /**当前所在房间信息,如果没在房间中则为 null*/
    currRoomInfo: IRoomInfo | null;
}