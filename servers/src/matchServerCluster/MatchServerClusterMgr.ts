
import { ClusterMgr, IClusterNode } from "../shared/tsgfServer/cluster/ClusterMgr";
import { WsServerOptions } from "tsrpc";
import { GetRedisClient, IRedisClient } from "../shared/tsgfServer/redisHelper";
import { IApp } from "../shared/tsgfServerEDB/Models";
import { SimpleAppHelper } from "../shared/tsgfServerEDB/BLL";
import { ICancelableExec } from "../shared/tsgf/ICancelable";
import { IResult, Result } from "../shared/tsgf/Result";
import { IMatchServerInfo } from "../shared/tsgfServer/match/IMatchServerInfo";
import { arrWinner } from "../shared/tsgf/Utils";
import { IClusterNodeCfg, IClusterTerminalCfg } from "../ServerConfig";
import { ServiceType as MatchClusterServiceType, serviceProto as matchClusterServiceProto } from "../shared/tsgfServer/matchCluster/protocols/serviceProto";

/**应用信息以及分配到哪个服务器处理*/
interface AppAssignServer {
    app: IApp;
    serverNodeId: string;
}
/**服务器信息以及下面都有哪些应用*/
interface ServerApps {
    serverNode: IClusterNode<IMatchServerInfo>;
    apps: Map<string, IApp>;
}


/**匹配服务器管理节点， 依赖redis，mysql*/
export class MatchServerClusterMgr extends ClusterMgr<MatchClusterServiceType, IMatchServerInfo>{

    protected getAppCancel: ICancelableExec<IApp[]> | null = null;
    protected initAppsRunning = false;
    /**未分配服务器的应用*/
    protected unassignedApps: IApp[] = [];
    /**已经分配好服务器的应用*/
    protected apps: Map<string, AppAssignServer> = new Map<string, AppAssignServer>();
    /**当前接入的匹配服务器，以及所负责的应用列表*/
    protected servers: Map<string, ServerApps> = new Map<string, ServerApps>();

    constructor(
        getNodesCfg: () => Promise<IClusterNodeCfg[]>,
        getTerminalCfg: () => Promise<IClusterTerminalCfg[] | undefined>,
        serverOption: Partial<WsServerOptions<MatchClusterServiceType>>,
        getRedisClient: GetRedisClient) {
        super(matchClusterServiceProto, "MatchServer", getNodesCfg, getTerminalCfg, serverOption, getRedisClient);

        this.onNodeConnected = (node) => {
            this.onMatchServerConnected(node);
        };
        this.onNodeDisconnected = (nodeId) => {
            this.onMatchServerDisconnected(nodeId);
        };
    }

    public override async start(): Promise<void> {
        await super.start();
        //启动应用初始化
        this.initAppsRunning = true;
        this.initApps();//不用await，让他异步开始执行
    }
    public override async stop(): Promise<void> {
        await super.stop();

        //中止应用初始化
        this.initAppsRunning = false;
        await this.getAppCancel?.cancel();
        this.getAppCancel = null;
    }

    private async onMatchServerConnected(node: IClusterNode<IMatchServerInfo>) {
        //新匹配服务器连上来，加入服务列表
        this.servers.set(node.nodeInfo.clusterNodeId, {
            serverNode: node,
            apps: new Map<string, IApp>(),
        });
        //开始异步处理所有未分配的应用
        this.procAllUnassignedApp();
    }
    private async onMatchServerDisconnected(nodeId: string) {
        //匹配服务器断开, 需要将原本负责的应用转移到其他服务器
        let disconnectedServer = this.servers.get(nodeId);
        //移除服务列表
        this.servers.delete(nodeId);
        if (disconnectedServer) {
            //该服务下所有应用转到未分配应用之下
            disconnectedServer.apps.forEach(app => {
                this.apps.delete(app.appId);
                this.unassignedApps.push(app);
            });
        }
        //开始异步处理所有未分配的应用
        this.procAllUnassignedApp();

    }

    private async initApps(): Promise<boolean> {
        if (!this.initAppsRunning) return false;
        //this.getAppCancel = AppBLL.Ins.selectAll();
        this.getAppCancel = SimpleAppHelper.selectAll();
        let allAppRet = await this.getAppCancel.waitResult();
        if (!this.initAppsRunning) return false;

        if (allAppRet.err) {
            this.server.logger.error("获取所有应用失败：", allAppRet.err, "服务即将停止！");
            await this.stop();
            return false;
        }

        this.apps.clear();
        this.servers.clear();
        this.unassignedApps.push(...allAppRet.data!);
        await this.procAllUnassignedApp();
        return true;
    }

    private async procAllUnassignedApp() {
        let uApp;
        while (uApp = this.unassignedApps.shift()) {
            let ret = await this.appAssignServer(uApp);
            if (!ret.succ) {
                //没分配成功，推入未分配，中断
                this.unassignedApps.push(uApp);
                break;
            }
        }
    }

    private getLeastAppsServer(): ServerApps | null {
        /*
        let minKV: ServerApps | null = null;
        this.servers.forEach((server) => {
            if (!minKV || minKV.apps.size > server.apps.size) minKV = server;
        });
        */
        let minKV = arrWinner(this.servers.values(),
            (winner, item) => winner.apps.size > item.apps.size ? item : winner);
        return minKV;
    }
    private async appAssignServer(app: IApp): Promise<IResult<null>> {
        //如果已经分配过，则取消一下
        let appAS = this.apps.get(app.appId);
        if (appAS) {
            //如果已经分配，则取消一下(一般可能出现在转移上面)
            await this.appCancelAssignServer(appAS);
        }
        //现在的分配规则：负责应用少的服务器优先分配
        let server = this.getLeastAppsServer();
        if (!server) {
            return Result.buildErr('不存在匹配服务器！无法分配！');
        }
        server.apps.set(app.appId, app);
        this.apps.set(app.appId, {
            app: app,
            serverNodeId: server.serverNode.nodeInfo.clusterNodeId,
        });
        return await this.assignTask(server.serverNode.nodeInfo.clusterNodeId, app.appId, app);
    }
    private async appCancelAssignServer(appAS: AppAssignServer): Promise<IResult<null>> {
        //不管是否成功，都删除掉
        this.apps.delete(appAS.app.appId);

        let server = this.servers.get(appAS.serverNodeId);
        if (!server) {
            //之前分配的服务器,已经下线,直接返回失败
            return Result.buildErr('之前分配的服务器已经离线');
        }
        //不管是否成功，都删除掉
        server.apps.delete(appAS.app.appId);

        return await this.cancelTask(server.serverNode.nodeInfo.clusterNodeId, appAS.app.appId);
    }

}