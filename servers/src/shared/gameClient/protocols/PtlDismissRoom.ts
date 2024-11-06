
import { IRoomInfo } from "../../tsgf/room/IRoomInfo";

/**
 * 解散房间
 * 
 * */
export interface ReqDismissRoom {
    roomId: string;
}

export interface ResDismissRoom {
    roomInfo: IRoomInfo;
}