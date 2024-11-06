import { IGetOrCreateRoomPara, IGetOrCreateRoomRsp } from "../../../tsgf/room/IRoomInfo";
import { EClusterClientType } from "../../cluster/Models";

export interface ReqTerminalGetOrCreateRoom extends IGetOrCreateRoomPara {
    appId: string;
}

export interface ResTerminalGetOrCreateRoom extends IGetOrCreateRoomRsp {

}

export const conf = {
    /**限制本接口的客户端类型*/
    clientType: EClusterClientType.Terminal,
}