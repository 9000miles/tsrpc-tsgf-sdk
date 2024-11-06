
import { IRoomOnlineInfo } from "../../../tsgf/room/IRoomInfo";
import { EClusterClientType } from "../../cluster/Models";
import { IRoomRegInfo } from "../../room/Models";

/**终端要求解散房间*/
export interface ReqTerminalDismissRoom {
    roomId: string;
}
export interface ResTerminalDismissRoom {
    roomOnlineInfo: IRoomOnlineInfo;
}
export const conf = {
    /**限制本接口的客户端类型*/
    clientType: EClusterClientType.Terminal,
}