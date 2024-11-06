import { IMatchResult } from "../../tsgf/match/Models";


/**
 * 查询完整匹配结果
 * 会等到有结果了才返回!
 * 注意: 同时只能只有一个玩家进行查询等待,一般使用通知来获取结果即可
 */
export interface ReqQueryMatch {
    
}

export interface ResQueryMatch {
    /**匹配结果, 同时房间中的对应玩家也会收到通知*/
    matchResult: IMatchResult;
}
