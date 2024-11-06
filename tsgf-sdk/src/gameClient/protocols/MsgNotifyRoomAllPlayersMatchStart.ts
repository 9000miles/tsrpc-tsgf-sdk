import { IMatchParamsFromRoomAllPlayer } from "../../tsgf/match/Models";
import { IRoomInfo } from "../../tsgf/room/IRoomInfo";

/**
 * 有玩家在房间中发起匹配请求
*/
export interface MsgNotifyRoomAllPlayersMatchStart {
    /**当前房间信息*/
    roomInfo: IRoomInfo;
    /**发起的匹配请求id, 可用于取消请求*/
    matchReqId:string;
    /**发起玩家id*/
    reqPlayerId:string;
    /**发起的匹配参数*/
    matchParams: IMatchParamsFromRoomAllPlayer;
}
