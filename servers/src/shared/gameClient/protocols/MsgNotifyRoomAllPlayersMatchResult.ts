import { IMatchPlayerResultWithServer } from "../../tsgf/match/Models";
import { IResult } from "../../tsgf/Result";
import { IRoomInfo } from "../../tsgf/room/IRoomInfo";

/**
 * 房间匹配请求有结果了
 */
export interface MsgNotifyRoomAllPlayersMatchResult {
    /**当前房间信息*/
    roomInfo: IRoomInfo;
    /**如果匹配结果是失败的则有错误消息*/
    errMsg?: string;
    /**如果匹配结果是失败的则有错误码*/
    errCode?: number;
    /**匹配结果, 如果匹配是成功的，则不为空*/
    matchResult?: IMatchPlayerResultWithServer;
}
