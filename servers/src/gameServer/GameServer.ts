

import { ApiCallWs, MsgCallWs, WsConnection, WsServer } from "tsrpc";
import { GameConnMgr } from "./GameConnMgr";
import * as path from "path";
import { v4 } from "uuid";
import { serviceProto as GameServiceProto, ServiceType as GameServiceType } from "../shared/gameClient/protocols/serviceProto";
import { GetRedisClient } from "../shared/tsgfServer/redisHelper";
import { logger } from "../shared/tsgf/logger";
import { GameServerAppRoomMgr } from "./GameServerAppRoomMgr";
import { MatchRequestTerminal } from "../shared/tsgfServer/match/MatchRequestTerminal";
import { IGameServerCfg } from "../ServerConfig";
import { GameServerHelper } from "../shared/tsgfServer/game/GameServerHelper";
import { IResult } from "../shared/tsgf/Result";
import { IRoomInfo } from "../shared/tsgf/room/IRoomInfo";
import { GameClusterNodeClient } from "../shared/tsgfServer/gameCluster/GameClusterNodeClient";

/**
 * 游戏服务器API专用的ApiCall类型，可用于获取Game服务对象
 * @date 2022/4/26 - 16:21:57
 *
 * @typedef {GameApiCall}
 * @typeParam req
 * @typeParam res
 */
export type GameApiCall<req, res> = ApiCallWs<req, res, GameServiceType> & {
    getGameServer: () => GameServer;
};
/**
 * 游戏服务器Msg专用的MsgCall类型，可用于获取Game服务对象
 * @date 2022/4/26 - 16:21:57
 *
 * @typedef {GameMsgCall}
 * @typeParam msg
 */
export type GameMsgCall<msg> = MsgCallWs<msg, GameServiceType> & {
    getGameServer: () => GameServer;
};

/**游戏服务端的客户端连接*/
export type ClientConnection = WsConnection<GameServiceType>;

/**游戏的websocket服务类型*/
export type GameWsServer = WsServer<GameServiceType>;

export class GameServer {

    public server: WsServer<GameServiceType>;

    private getRedisClient: GetRedisClient;
    private getGameServerCfg: () => Promise<IGameServerCfg>;

    public gameConnMgr: GameConnMgr;
    public roomMgr: GameServerAppRoomMgr;

    public matchReqTerminal: MatchRequestTerminal;
    public gameClusterClient: GameClusterNodeClient;

    constructor(
        getRedisClient: GetRedisClient,
        currGameServerCfg: IGameServerCfg,
        getGameServerCfg: () => Promise<IGameServerCfg>
    ) {
        this.getRedisClient = getRedisClient;
        this.getGameServerCfg = getGameServerCfg;

        //固定值的使用 tmpGameServerCfg, 每次都获取配置的则用 this.getGameServerCfg()
        this.server = new WsServer(GameServiceProto, {
            port: currGameServerCfg.port,
            json: false,
            logger: logger,
        });
        //让Call能获取到本服务实例
        this.server.flows.preApiCallFlow.push((v: GameApiCall<any, any>) => {
            v.getGameServer = () => this;
            return v;
        });
        this.server.flows.preMsgCallFlow.push((v: GameMsgCall<any>) => {
            v.getGameServer = () => this;
            return v;
        });
        //设置游戏服务连接ID
        this.server.flows.postConnectFlow.push(async v => {
            v.connectionId = v4();
            return v;
        });
        
        //集群
        this.gameClusterClient = new GameClusterNodeClient(
            currGameServerCfg, this.getGameServerCfg, () => this.server!.connections.length);
        this.gameClusterClient.onAssignTask = (taskId, taskData) => {
            switch (taskId) {
                case 'DismissRoom':
                    let roomId = taskData as string;
                    this.procTaskDismissRoom(roomId);
                    break;
            }
        };

        //游戏服务器各管理模块启动
        this.matchReqTerminal = new MatchRequestTerminal(this.getRedisClient, true);
        this.gameConnMgr = new GameConnMgr(this.server, this.getGameServerCfg);
        this.roomMgr = new GameServerAppRoomMgr(this.server, this.gameConnMgr, this.gameClusterClient, this.matchReqTerminal, currGameServerCfg.clusterNodeId);

    }

    public async start(): Promise<void> {
        await this.server.autoImplementApi(path.resolve(__dirname, 'api'));
        await this.server.start();
        this.server.logger?.log("GameServer: 服务启动成功!");

        await this.matchReqTerminal.start();

        let joinErr = await this.gameClusterClient.joinCluster();
        if (joinErr) {
            this.server.logger?.log("GameServer: 加入集群服务器失败:" + joinErr + ". 即将停止服务!");
            await this.stop();
            return;
        } else {
            this.server.logger?.log("GameServer: 加入集群服务器成功!");
        }
    }

    public async stop(): Promise<void> {
        await this.gameClusterClient.disconnectCluster();
        await this.matchReqTerminal.stop();
        await this.server.stop();
    }

    private async procTaskDismissRoom(roomId: string): Promise<IResult<IRoomInfo>> {
        return await this.roomMgr.dismissRoom(undefined, roomId);
    }

}