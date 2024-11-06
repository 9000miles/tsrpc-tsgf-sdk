import { IPlayerInfoPara, IPlayerInfo } from "../../tsgf/player/IPlayerInfo";

/**
 * 玩家认证
 * 需要连接后立即发出请求,否则超时将被断开连接
 * */
export interface ReqAuthorize extends IPlayerInfoPara{
    /**玩家令牌,登录大厅时获得的 */
    playerToken: string;
    /**可设置房间中断线后等待重连的毫秒数,默认为60000ms(60秒),设成0表示断线后直接清理(按退出房间处理)不等待重连*/
    roomWaitReconnectTime?: number;
}

export interface ResAuthorize {
    /**玩家ID*/
    playerInfo: IPlayerInfo;
}