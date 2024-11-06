
import { IPlayerInfo } from "../../tsgf/player/IPlayerInfo";
import { IRoomInfo } from "../../tsgf/room/IRoomInfo";

export interface MsgNotifyStartFrameSync {
    /**开始操作的玩家ID*/
    startPlayerId: string;
    /**当前房间信息*/
    roomInfo: IRoomInfo;
}
