import { ERoomCreateType, ICreateRoomPara, IRoomOnlineInfo } from "../../../tsgf/room/IRoomInfo";
import { EClusterClientType } from "../../cluster/Models";

/**终端请求创建房间*/
export interface ReqTerminalCreateRoom extends ICreateRoomPara {
    appId: string;
    createType: ERoomCreateType;
}
export interface ResTerminalCreateRoom {
    roomOnlineInfo: IRoomOnlineInfo;
}


export const conf = {
    /**限制本接口的客户端类型*/
    clientType: EClusterClientType.Terminal,
}