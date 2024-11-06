import { IJoinRoomPara, IRoomInfo } from "../../tsgf/room/IRoomInfo";


/**
 * 加入房间
 * */
export interface ReqJoinRoom extends IJoinRoomPara {
}

export interface ResJoinRoom {
    roomInfo: IRoomInfo;
}