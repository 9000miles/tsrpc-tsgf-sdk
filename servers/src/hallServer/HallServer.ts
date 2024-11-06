
import * as path from "path";
import { ApiCall, HttpConnection, HttpServer, HttpServerOptions } from "tsrpc";
import { serviceProto as hallServiceProto, ServiceType as HallServiceType } from "../shared/hallClient/protocols/serviceProto";
import { IRedisClient } from "../shared/tsgfServer/redisHelper";
import { MatchRequestTerminal } from "../shared/tsgfServer/match/MatchRequestTerminal";
import { BaseConf } from "../shared/hallClient/protocols/base";
import { IPlayer } from "../shared/tsgfServer/auth/Models";
import { IApiCrypto } from "../shared/tsgfServerEDB/apiCrypto/IApiCrypto";
import { AppCrypto } from "../shared/tsgfServerEDB/apiCrypto/AppCrypto";
import { PlayerAuthHelper } from "../shared/tsgfServer/auth/PlayerAuthHelper";
import { ENetworkState, IPlayerInfo } from "../shared/tsgf/player/IPlayerInfo";
import { ErrorCodes } from "../shared/tsgf/Result";
import { IGameServerInfoInServer } from "../shared/tsgfServer/game/Models";
import { GameServerHelper } from "../shared/tsgfServer/game/GameServerHelper";
import { GameClusterTerminal } from "../shared/tsgfServer/gameCluster/GameClusterTerminal";
import { IHallServerCfg } from "../ServerConfig";
import { logger } from "../shared/tsgf/logger";


/**
 * 大厅服务器API专用的ApiCall类型，可用于获取大厅服务对象
 * @date 2022/4/26 - 16:21:57
 *
 * @typedef {HallApiCall}
 * @typeParam req
 * @typeParam res
 */
export type HallApiCall<req, res> = ApiCall<req, res, HallServiceType> & {
    getHallServer: () => HallServer;
};


/**
 * 大厅服务器，可直接部署多台（本服务中的所有功能都是直接支持多台部署），由nginx这样的组件来实现负载均衡。
 * @date 2022/4/26 - 15:06:38
 *
 * @class HallServer
 * @typedef {HallServer}
 */
export class HallServer {
    public server: HttpServer<HallServiceType>;
    private getRedisClient: (reuseClient: boolean) => Promise<IRedisClient>;

    public gameClusterTerminal: GameClusterTerminal;
    public matchRequestTerminal: MatchRequestTerminal;

    /**api加解密实现字典*/
    private apiCryptoImpls: { [key: string]: IApiCrypto } = {
        "AppReqDes": new AppCrypto(),
    };

    constructor(
        getRedisClient: (reuseClient: boolean) => Promise<IRedisClient>,
        hallServerCfg: IHallServerCfg,
        getHallServerCfg: () => Promise<IHallServerCfg>
    ) {
        this.getRedisClient = getRedisClient;
        this.server = new HttpServer(hallServiceProto, 
            {
                port: hallServerCfg.port,
                json: true,
                logger: logger,
            }
        );
        this.server.flows.preRecvDataFlow.push(v => {
            let conn = v.conn as HttpConnection;
            //解决HTTP请求跨域问题
            conn.httpRes.setHeader("Access-Control-Allow-Origin", "*");
            return v;
        })
        this.server.flows.preApiCallFlow.push(async (v: HallApiCall<any, any>) => {
            let conf = v.service.conf as BaseConf;
            if (!conf.skipPlayerAuth) {
                //接口没定义"不认证",则需要进行身份认证
                if (!v.req.playerToken) {
                    v.error("需要 playerToken !", { code: ErrorCodes.ParamsError });
                    return null;
                }
                let vRet = await PlayerAuthHelper.verification(v.req.playerToken);
                if (!vRet.succ) {
                    v.error(vRet.err, { code: vRet.code });
                    return null;
                }
                let authInfo = vRet.data;
                let playerInfo: IPlayerInfo = {
                    playerId: authInfo.playerId,
                    showName: authInfo.showName,
                    customPlayerStatus: 0,
                    customPlayerProfile: '',
                    isRobot: false,
                    networkState: ENetworkState.ONLINE,
                };

                let player: IPlayer = {
                    authInfo: authInfo,
                    playerInfo: playerInfo,
                    roomRobotPlayers: new Map(),
                    roomWaitReconnectTime: 0,// 大厅中这个时间没意义,随意设置为0即可
                };
                v.conn.currPlayer = player;
            }
            let apiCryptoImpl = this.apiCryptoImpls[conf.cryptoMode];
            if (apiCryptoImpl) {
                let ret = await apiCryptoImpl.decryptionReq(v.req);
                if (!ret.succ) {
                    v.error(ret.err, { code: ret.code });
                    return null;
                }
            }
            v.getHallServer = () => this;
            return v;
        });

        this.gameClusterTerminal = new GameClusterTerminal(
            hallServerCfg.gameClusterServerUrl,
            hallServerCfg.gameClusterTerminalId,
            hallServerCfg.gameClusterTerminalKey);
        this.matchRequestTerminal = new MatchRequestTerminal(getRedisClient, false);
    }


    /**
     * 启动服务
     *
     * @public
     * @returns
     */
    public async start(): Promise<void> {
        await this.matchRequestTerminal.start();

        await this.server.autoImplementApi(path.resolve(__dirname, 'api'));
        await this.server.start();
        let joinErr = await this.gameClusterTerminal.joinCluster();
        if (joinErr) {
            logger?.error("HallServer: 游戏集群终端连接失败:" + joinErr + '. 即将停止服务!');
            await this.stop();
            return;
        } else {
            logger?.log("HallServer: 游戏集群终端连接成功!");
        }
    }
    /**停止服务*/
    public async stop(): Promise<void> {
        await this.gameClusterTerminal.disconnectCluster();
        await this.server.stop();
        await this.matchRequestTerminal.stop();
    }


}