import { IRoomsFilterPara, IRoomsFilterRes } from "../../../tsgf/room/IRoomInfo";
import { EClusterClientType } from "../../cluster/Models";

/**房间列表筛选*/
export interface ReqTerminalFilterRoom {
    filter: IRoomsFilterPara;
    /**匹配结果跳过数量*/
    skip?: number;
    /**限制返回数量*/
    limit?: number;
}

export interface ResTerminalFilterRoom extends IRoomsFilterRes{
}

export const conf = {
    /**限制本接口的客户端类型*/
    clientType: EClusterClientType.Terminal,
}