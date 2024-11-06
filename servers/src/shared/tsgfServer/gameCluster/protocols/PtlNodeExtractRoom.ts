import { IRoomInfo } from "../../../tsgf/room/IRoomInfo";
import { EClusterClientType } from "../../cluster/Models";
import { IRoomRegInfo } from "../../room/Models";

/**游戏服务器提取房间信息，用于首次使用*/
export interface ReqNodeExtractRoom {
    roomId: string;
}
export interface ResNodeExtractRoom {
    roomRegInfo: IRoomRegInfo;
    roomInfo: IRoomInfo;
}

export const conf = {
    /**限制本接口的客户端类型*/
    clientType: EClusterClientType.Node,
}