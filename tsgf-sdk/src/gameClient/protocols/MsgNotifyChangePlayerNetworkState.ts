import { ENetworkState } from "../../tsgf/player/IPlayerInfo";
import { IRoomInfo } from "../../tsgf/room/IRoomInfo";

export interface MsgNotifyChangePlayerNetworkState {
    roomInfo: IRoomInfo;
    changePlayerId: string;
    networkState: ENetworkState;
}
