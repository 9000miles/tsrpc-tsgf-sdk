
import { IPlayerInfo } from "../../tsgf/player/IPlayerInfo";
import { IRoomInfo } from "../../tsgf/room/IRoomInfo";

export interface MsgNotifyLeaveRoom {
    leavePlayerInfo: IPlayerInfo;
    roomInfo: IRoomInfo;
}
