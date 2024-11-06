import { IRoomOnlineInfo } from "../../../tsgf/room/IRoomInfo";
import { EClusterClientType } from "../../cluster/Models";

export interface ReqTerminalGetRoomOnlineInfo {
    roomId: string;
}

export interface ResTerminalGetRoomOnlineInfo {
    roomOnlineInfo: IRoomOnlineInfo;
}

export const conf = {
    /**限制本接口的客户端类型*/
    clientType: EClusterClientType.Terminal,
}