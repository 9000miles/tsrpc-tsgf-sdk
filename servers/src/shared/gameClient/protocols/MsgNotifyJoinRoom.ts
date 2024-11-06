
import { IPlayerInfo } from "../../tsgf/player/IPlayerInfo";
import { IRoomInfo } from "../../tsgf/room/IRoomInfo";

export interface MsgNotifyJoinRoom {
    roomInfo: IRoomInfo;
    joinPlayerId: string;
}
