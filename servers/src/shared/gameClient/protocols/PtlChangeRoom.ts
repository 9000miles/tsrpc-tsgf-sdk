import { IChangeRoomPara, IRoomInfo } from "../../tsgf/room/IRoomInfo";

/**
 * 修改房间信息
 * 只有房主可以修改
 * 修改后房间内所有玩家都收到通知
*/
export interface ReqChangeRoom extends IChangeRoomPara {
}

export interface ResChangeRoom {
    /**房间信息*/
    roomInfo: IRoomInfo;
}