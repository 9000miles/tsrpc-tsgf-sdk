import { IRoomInfo } from "../../tsgf/room/IRoomInfo";

export interface MsgNotifyStopFrameSync {
    /**停止操作的玩家ID*/
    stopPlayerId: string;
    /**当前房间信息*/
    roomInfo: IRoomInfo;
}
