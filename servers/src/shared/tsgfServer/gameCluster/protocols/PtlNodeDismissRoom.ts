import { EClusterClientType } from "../../cluster/Models";
import { IRoomRegInfo } from "../../room/Models";

/**游戏服务器上房间解散，则同步给集群*/
export interface ReqNodeDismissRoom {
    roomId: string;
}
export interface ResNodeDismissRoom {
    roomRegInfo: IRoomRegInfo;
}
export const conf = {
    /**限制本接口的客户端类型*/
    clientType: EClusterClientType.Node,
}