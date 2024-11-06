
/**
 * 模拟应用简单实现用户体系对接玩家体系
*/
export interface ReqPlayerAuth {
    showName: string;
    openId:string;
}

export interface ResPlayerAuth {
    playerId: string;
    playerToken: string;
}
