import { EClusterClientType } from "../../cluster/Models";
import { IRoomRegInfo } from "../../room/Models";
import { ERoomRegChangedType } from "../../room/RoomHelper";

/**游戏服务器上房间信息有变动，同步给集群*/
export interface ReqNodeUpdateRoom {
    roomRegInfo: IRoomRegInfo;
    changedType: ERoomRegChangedType;
    playerId?: string;
    oldTeamId?: string;
    teamId?: string;
}
export interface ResNodeUpdateRoom {
    
}
export const conf = {
    /**限制本接口的客户端类型*/
    clientType: EClusterClientType.Node,
}