import { AppMatchRequestHandler } from "../shared/tsgfServer/match/AppMatchRequestHandler";
import { ICancelable } from "../shared/tsgf/ICancelable";
import { logger } from "../shared/tsgf/logger";
import { ErrorCodes } from "../shared/tsgf/Result";
import { ClusterNodeClient } from "../shared/tsgfServer/cluster/ClusterNodeClient";
import { GameServerHelper } from "../shared/tsgfServer/game/GameServerHelper";
import { IAppMatchTaskData } from "../shared/tsgfServer/match/IAppMatchTaskData";
import { IMatchServerInfo } from "../shared/tsgfServer/match/IMatchServerInfo";
import { MatcherSingle } from "../shared/tsgfServer/match/MatcherSingle";
import { MatchRequestHelper } from "../shared/tsgfServer/match/MatchRequestHelper";
import { GetRedisClient } from "../shared/tsgfServer/redisHelper";
import { RoomHelper } from "../shared/tsgfServer/room/RoomHelper";
import { EClusterClientType } from "../shared/tsgfServer/cluster/Models";
import { ServiceType as MatchClusterServiceType, serviceProto as matchClusterServiceProto } from "../shared/tsgfServer/matchCluster/protocols/serviceProto";
import { GameClusterTerminal } from "../shared/tsgfServer/gameCluster/GameClusterTerminal";
import { IMatchServerCfg } from "../ServerConfig";

/**匹配服务器, 由匹配集群分配负责匹配的应用, 具体由应用匹配请求处理器负责处理*/
export class MatchServer extends ClusterNodeClient<MatchClusterServiceType, IMatchServerInfo> {

    // 公共的匹配请求工具实例
    public matchRequestHelper: MatchRequestHelper;
    // 所有分配到本服务实例处理的应用下匹配请求处理器
    public appMatchRequestMgrs: Map<string, AppMatchRequestHandler> = new Map<string, AppMatchRequestHandler>();
    public getRedisClient: GetRedisClient;
    protected roomRegChangedCancel?: ICancelable;
    public gameClusterTerminal: GameClusterTerminal;

    /**有新的应用匹配任务被接受后触发*/
    public onNewAppMatchTask?: (appId: string, mgr: AppMatchRequestHandler) => void;
    /**应用匹配任务被取消后触发*/
    public onCancelAppMatchTask?: (appId: string, mgr: AppMatchRequestHandler) => void;

    //clusterServerUrl: string, serverNodeId: string, clusterKey: string, getRedisClient: GetRedisClient
    constructor(
        getRedisClient: GetRedisClient,
        matchServerCfg: IMatchServerCfg
        //,getMatchServerCfg: () => Promise<IMatchServerCfg>
    ) {

        super(matchClusterServiceProto, matchServerCfg.clusterWSUrl, EClusterClientType.Node, matchServerCfg.clusterNodeId, matchServerCfg.clusterKey, async () => {
            return Promise.resolve({
                serverId: matchServerCfg.clusterNodeId,
                matchAppCount: this.appMatchRequestMgrs.size
            });
        });

        this.getRedisClient = getRedisClient;
        this.matchRequestHelper = new MatchRequestHelper(this.getRedisClient);


        //匹配服务的任务，就是负责处理应用的匹配，所以把应用ID当作任务ID使用
        this.onAssignTask = (taskId, taskData) => {
            let appId = taskId;
            let data = taskData as IAppMatchTaskData;
            let mgr = this.appMatchRequestMgrs.get(appId);
            if (!mgr) {
                mgr = new AppMatchRequestHandler(appId, this.matchRequestHelper, this.gameClusterTerminal);
                this.appMatchRequestMgrs.set(appId, mgr);
            }
            mgr.matchers.clear();

            //先加入内置匹配器
            let matcher = new MatcherSingle();
            mgr.matchers.set(matcher.matcherKey, matcher);

            //再加入自定义匹配器
            //TODO: 未实现自定义匹配器的传递方案/动态加载方案

            this.onNewAppMatchTask?.call(this, appId, mgr);
        };
        this.onCancelTask = (taskId) => {
            let appId = taskId;

            let mgr = this.appMatchRequestMgrs.get(appId);
            if (!mgr) return;

            for (let reqs of mgr.allMatcherReqs.values()) {
                mgr.faildMatchRequests(reqs, '匹配服务器调整，请再次匹配', ErrorCodes.MatchRequestCancelled);
            }

            this.onCancelAppMatchTask?.call(this, appId, mgr);

        };

        this.gameClusterTerminal = new GameClusterTerminal(
            matchServerCfg.gameClusterServerUrl,
            matchServerCfg.gameClusterTerminalId,
            matchServerCfg.gameClusterTerminalKey);
    }


    public async start(): Promise<void> {
        //订阅房间注册信息变更事件,更新到应用匹配管理下的房间注册信息缓存,方便匹配使用
        this.roomRegChangedCancel = await RoomHelper.startListenRoomRegInfoChanged(changedInfo => {
            let mgr = this.appMatchRequestMgrs.get(changedInfo.regInfo.appId);
            if (!mgr) return;
            mgr.roomRegInfoChanged(changedInfo);
        });

        let joinErr = await this.joinCluster();
        if (joinErr) {
            logger?.error("MatchServer: 加入集群服务器失败:" + joinErr + '. 即将停止服务!');
            await this.stop();
            return;
        } else {
            logger?.log("MatchServer: 加入集群服务器成功!");
        }

        joinErr = await this.gameClusterTerminal.joinCluster();
        if (joinErr) {
            logger?.error("MatchServer: 游戏集群终端连接失败:" + joinErr + '. 即将停止服务!');
            await this.stop();
            return;
        } else {
            logger?.log("MatchServer: 游戏集群终端连接成功!");
        }
    }

    public async stop(): Promise<void> {
        await this.roomRegChangedCancel?.cancel();
        await this.disconnectCluster();
    }
}