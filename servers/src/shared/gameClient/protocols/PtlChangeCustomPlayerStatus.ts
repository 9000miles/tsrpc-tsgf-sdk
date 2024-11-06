
/**
 * 修改玩家自定义状态
 * 修改后房间内(如果在的话)所有玩家(包含自己)会收到通知
*/
export interface ReqChangeCustomPlayerStatus {
    customPlayerStatus:number;
    /**可以指定自己的玩家机器人*/
    robotPlayerId?: string;
}

export interface ResChangeCustomPlayerStatus {
    
}