
import { IMatchParamsFromRoomAllPlayer } from "../../tsgf/match/Models";

/**
 * 发起房间所有玩家匹配请求
 * 请求成功即返回,同时房间中的所有玩家会收到通知
 * 匹配有结果了还会收到消息通知, 并且可由一个玩家调用QueryMatch等待完整匹配结果
*/
export interface ReqRequestMatch {
    /**匹配参数*/
    matchParams: IMatchParamsFromRoomAllPlayer;
}
export interface ResRequestMatch {
    /**匹配请求id*/
    matchReqId: string;
}