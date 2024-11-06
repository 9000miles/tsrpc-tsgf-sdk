
/**
 * 修改玩家自定义属性
 * 修改后同房间内的所有玩家都将收到通知
*/
export interface ReqChangeCustomPlayerProfile {
    customPlayerProfile:string;
    /**可以指定自己的玩家机器人*/
    robotPlayerId?: string;
}

export interface ResChangeCustomPlayerProfile {
    
}
