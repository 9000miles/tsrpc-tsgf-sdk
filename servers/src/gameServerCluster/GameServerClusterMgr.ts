import { ApiCallWs, MsgCallWs, WsConnection, WsServer, WsServerOptions } from "tsrpc";
import * as path from "path";
import { ClusterMgr, IClusterNodeInfo } from "../shared/tsgfServer/cluster/ClusterMgr";
import { GetRedisClient } from "../shared/tsgfServer/redisHelper";
import { IGameServerInfoInServer } from "../shared/tsgfServer/game/Models";
import { GameServerHelper } from "../shared/tsgfServer/game/GameServerHelper";
import { IClusterNodeCfg, IClusterTerminalCfg } from "../ServerConfig";
import { ICancelable } from "../shared/tsgf/ICancelable";
import { IRoomRegInfo } from "../shared/tsgfServer/room/Models";
import { IResult, Result } from "../shared/tsgf/Result";
import { ServiceType as GameClusterServiceType, serviceProto as gameClusterServiceProto } from "../shared/tsgfServer/gameCluster/protocols/serviceProto";
import { GameServerRoomMgr } from "./GameServerRoomMgr";
import { ICreateRoomPara, IRoomOnlineInfo } from "../shared/tsgf/room/IRoomInfo";
import { arrWinner } from "../shared/tsgf/Utils";
/**
 * 游戏集群服务器API专用的ApiCall类型，可用于获取Game集群服务对象
 * @date 2022/4/26 - 16:21:57
 *
 * @typeParam req
 * @typeParam res
 */
export type GameClusterApiCall<req, res> = ApiCallWs<req, res, GameClusterServiceType> & {
    getGameClusterServer: () => GameServerClusterMgr;
};
/**
 * 游戏集群服务器Msg专用的MsgCall类型，可用于获取Game集群服务对象
 * @date 2022/4/26 - 16:21:57
 *
 * @typedef {GameClusterMsgCall}
 * @typeParam msg
 */
export type GameClusterMsgCall<msg> = MsgCallWs<msg, GameClusterServiceType> & {
    getGameClusterServer: () => GameServerClusterMgr;
};

/**游戏服务端的客户端连接*/
export type ClientConnection = WsConnection<GameClusterServiceType>;

/**游戏的websocket服务类型*/
export type GameWsServer = WsServer<GameClusterServiceType>;

/**游戏服务器管理节点，依赖redis功能*/
export class GameServerClusterMgr extends ClusterMgr<GameClusterServiceType, IGameServerInfoInServer>{

    protected gameServerTaskCancel?: ICancelable;
    public readonly roomMgr: GameServerRoomMgr = new GameServerRoomMgr(this);

    constructor(
        getNodesCfg: () => Promise<IClusterNodeCfg[]>,
        getTerminalCfg: () => Promise<IClusterTerminalCfg[] | undefined>,
        serverOption: Partial<WsServerOptions<GameClusterServiceType>>,
        getRedisClient: GetRedisClient) {
        super(gameClusterServiceProto, GameServerHelper.clusterTypeKey, getNodesCfg, getTerminalCfg, serverOption, getRedisClient);
        //让Call能获取到本服务实例
        this.server.flows.preApiCallFlow.push((v: GameClusterApiCall<any, any>) => {
            v.getGameClusterServer = () => this;
            return v;
        });
        this.server.flows.preMsgCallFlow.push((v: GameClusterMsgCall<any>) => {
            v.getGameClusterServer = () => this;
            return v;
        });
        this.server.flows.postDisconnectFlow.push((v) => {
            if (v.conn.nodeId) {
                this.roomMgr.dismissServerRooms(v.conn.nodeId);
            }
            return v;
        });
    }

    public override async start() {
        //额外注册api目录下的接口
        await this.autoImplementApi(gameClusterServiceProto, path.resolve(__dirname, 'api'));
        await super.start();
    }
    public override async stop() {
        await this.gameServerTaskCancel?.cancel();
        await super.stop();
    }
    /**
     * 通知游戏服务器解散房间
     */
    public async notifyGameServerDismissRoom(roomRegInfo: IRoomRegInfo): Promise<IResult<null>> {
        let ret = await this.assignTask(roomRegInfo.gameServerNodeId, 'DismissRoom', roomRegInfo.roomId);
        if (!ret.succ) return ret;
        return Result.buildSucc(null);
    }



    /**
     * 按规则自动分配一个合适的服务器, 没有合适的返回null
     * @param createRoomPara 指定分配规则标识, 放空则分配最少客户端的服务器
     * @returns game server 
     */
    public async allotGameServerByInfos(allServerNodeList: IClusterNodeInfo<IGameServerInfoInServer>[], getServerRooms: (serverNodeId: string) => Promise<IRoomRegInfo[]>, createRoomPara: ICreateRoomPara): Promise<IGameServerInfoInServer | null> {
        let canAllotNodes: IClusterNodeInfo<IGameServerInfoInServer>[] = [];
        //按在线客户端升序
        allServerNodeList = allServerNodeList.sort((a, b) => a.info.clientCount - b.info.clientCount);
        for (const s of allServerNodeList) {
            // 根据各服务器配置的分配规则进行筛选
            if (s.info.allotRules?.limitRoomCountRules?.length) {
                // 有配置限制房间数规则, 则根据当前创建房间请求匹配规则
                let rules = s.info.allotRules.limitRoomCountRules.filter(r => {
                    // 有配置且不符合的过滤
                    if (r.roomType && r.roomType !== createRoomPara.roomType) return false;
                    if (r.maxPlayers && r.maxPlayers !== createRoomPara.maxPlayers) return false;
                    // 其他的视为匹配的规则
                    return true;
                });
                if (!rules.length) {
                    // 没匹配中的规则,视本服务器不可分配
                    continue;
                }
                // 取限制房间数最小的那个配置
                let minLimit = arrWinner(rules,
                    (winner, item) => winner.limitRoomCount < item.limitRoomCount ? winner : item)!;
                // 检查现有房间符合规则的数量
                let rooms = await getServerRooms(s.info.serverNodeId);
                if (!rooms) continue;
                let currRoomCount = rooms.count(room => {
                    if (minLimit.roomType && minLimit.roomType !== room.roomType) return false;
                    if (minLimit.maxPlayers && minLimit.maxPlayers !== room.maxPlayers) return false;
                    return true;
                });
                if (currRoomCount >= minLimit.limitRoomCount) {
                    // 本创建房间请求匹配的规则,对应现有的房间已经满额了, 本服务器不可分配
                    continue;
                }
            }
            // 上面规则都没配置, 或者都通过了检测, 则可以分配!
            canAllotNodes.push(s);
        }
        if (!canAllotNodes.length) {
            // 没有可以分配的服务器
            return null;
        }

        // 如果多个,则取一个连接数最少的
        let allotGameServer = arrWinner(canAllotNodes, (winner, item) => winner.info.clientCount > item.info.clientCount ? item : winner)!;
        return allotGameServer.info;
    }

    /**
     * 生成房间在线信息，如果房间指向的服务器不可用，则房间在线信息里的服务器连接地址为undefined
     * @param roomRegInfo 
     * @returns room online info 
     */
    public buildRoomOnlineInfo(roomRegInfo: IRoomRegInfo): IRoomOnlineInfo {
        let gameServerInfo = this.getNodeById(roomRegInfo.gameServerNodeId);
        let roomOnlineInfo = GameServerHelper.buildRoomOnlineInfo(roomRegInfo, gameServerInfo?.info);
        return roomOnlineInfo;
    }
}