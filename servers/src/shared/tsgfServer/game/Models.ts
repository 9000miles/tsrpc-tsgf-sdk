import { IGameServerAllotRuleCfg } from "../../../ServerConfig";
import { IGameServerInfo } from "../../hallClient/Models";
import { EPrivateRoomJoinMode } from "../../tsgf/room/IRoomInfo";

/**游戏服务器信息在服务端的数据*/
export interface IGameServerInfoInServer extends IGameServerInfo{
    /**游戏服务器分配规则配置*/
    allotRules?: IGameServerAllotRuleCfg;
}