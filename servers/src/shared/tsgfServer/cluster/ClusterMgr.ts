import { ApiCall, BaseCall, BaseConnection, BaseServer, BaseServiceType, FlowNode, MsgCall, ServiceProto, TsrpcError, WsServer, WsServerOptions } from "tsrpc";
import { apiErrorThenClose } from "../ApiBase";
import { GetRedisClient, IRedisClient } from "../redisHelper";
import { ErrorCodes, IResult, Result } from "../../tsgf/Result";
import { IClusterNodeCfg, IClusterTerminalCfg } from "../../../ServerConfig";
import { ClusterServiceType, EClusterClientType, MsgClusterSyncNodeInfo, ReqClusterLogin, ReqClusterLoginByTerminal, ResClusterLogin } from "./Models";
import path from 'path';
import fs from 'fs';


declare module 'tsrpc' {
    export interface BaseConnection {
        /**连接到集群的客户端类型*/
        clientType: EClusterClientType;
        /**如果是节点类型，则有节点id*/
        nodeId?: string;
        /**如果是终端类型，则有终端id*/
        terminalId?: string;
    }
}

/**集群节点*/
export interface IClusterNode<NodeInfo> {
    nodeInfo: IClusterNodeInfo<NodeInfo>;
    nodeConn: BaseConnection<ClusterServiceType>;
}
/**集群节点信息*/
export interface IClusterNodeInfo<NodeInfo> {
    clusterNodeId: string;
    info: NodeInfo;
    /**过期时间(毫秒级时间戳)*/
    expires: number;
}


/**
 * 集群管理类
 * @date 2022/4/19 - 16:48:53
 *
 * @class ClusterMgr
 * @typedef {ClusterMgr}
 * @typeParam NodeInfo 节点信息的类型，可自定义
 */
export class ClusterMgr<ServiceType extends ClusterServiceType, NodeInfo extends any>{

    /**获取所有可以加入集群的配置 */
    private getNodesCfg: () => Promise<IClusterNodeCfg[]>;
    private getTerminalCfg: () => Promise<IClusterTerminalCfg[] | undefined>;

    /**集群类型标识*/
    protected clusterTypeKey: string;

    /**服务*/
    protected server: WsServer<ServiceType>;

    /**所有节点，nodeId=>IClusterNode*/
    protected nodes: Map<string, IClusterNode<NodeInfo>> = new Map<string, IClusterNode<NodeInfo>>();

    protected getRedisClient: GetRedisClient;

    protected onNodeConnected?: (node: IClusterNode<NodeInfo>) => void;
    protected onNodeDisconnected?: (nodeId: string) => void;

    private static buildNodesHashKey(clusterTypeKey: string) {
        return `ClusterMgr:${clusterTypeKey}:Nodes`;
    }

    /**
     * Creates an instance of ClusterMgr.
     *
     * @param clusterTypeKey 集群类型标识，用在各种场合进行区分的，需要唯一定义
     * @param getNodesCfg
     * @param serverOption
     */
    constructor(
        clusterServiceProto: ServiceProto<ServiceType>,
        clusterTypeKey: string,
        getNodesCfg: () => Promise<IClusterNodeCfg[]>,
        getTerminalCfg: () => Promise<IClusterTerminalCfg[] | undefined>,
        serverOption: Partial<WsServerOptions<ServiceType>>,
        getRedisClient: GetRedisClient) {
        this.clusterTypeKey = clusterTypeKey;
        this.getNodesCfg = getNodesCfg;
        this.getTerminalCfg = getTerminalCfg;
        this.getRedisClient = getRedisClient;
        this.server = new WsServer(clusterServiceProto, serverOption);

        //所有消息和api请求，都必须在认证通过之后
        this.server.flows.preApiCallFlow.push((call) => {
            if (!this.prefixCheck(call)) {
                apiErrorThenClose(call, 'need Login before do this', { code: ErrorCodes.AuthUnverified });
                return;
            }
            return call;
        });
        this.server.flows.preMsgCallFlow.push((call) => {
            if (!this.prefixCheck(call)) {
                call.logger.error(`need Login before do this (${call.service.name}, msg:${JSON.stringify(call.msg)})`);
                call.conn.close();
                return;
            }
            return call;
        });
        this.server.implementApi("ClusterLogin", async (call) => {
            await this.apiLogin(call);
        });
        this.server.listenMsg("ClusterSyncNodeInfo", async call => {
            await this.msgSyncNodeInfo(call);
        });
        this.server.flows.postDisconnectFlow.push((v) => {
            this.nodeDisconnect(v.conn);
            return v;
        });
    }

    /**
     * 生成api的模块路径（不含文件后缀）
     * @param apiPath 
     * @param svcName 
     * @returns api module path 
     */
    protected buildApiModulePath(apiPath: string, svcName: string): string | null {
        let match = svcName.match(/^(.+\/)*(.+)$/);
        if (!match) {
            return null;
        }
        let handlerPath = match[1] || '';
        let handlerName = match[2];
        // try import
        let modulePath = path.resolve(apiPath, handlerPath, 'Api' + handlerName);
        return modulePath;
    }

    protected async autoImplementApi(serviceProto: ServiceProto<BaseServiceType>, apiPath: string) {
        let output = { succ: [], fail: [] };
        for (let svc of serviceProto.services) {
            //@ts-ignore
            if (this.server._apiHandlers[svc.name]) {
                continue;
            }
            // 如果api文件不存在，则直接忽略！
            let apiModulePath = this.buildApiModulePath(apiPath, svc.name);
            if (!apiModulePath) {
                continue;
            }
            let apiModuleDir = path.dirname(apiModulePath);
            let apiModuleName = path.basename(apiModulePath);
            let matchFiles = fs.readdirSync(apiModuleDir);
            if (!matchFiles?.find(f => f === apiModuleName + path.extname(f))) {
                continue;
            }
            //@ts-ignore
            let { handler } = await this.server.getApiHandler(svc, apiPath, this.server.logger);
            if (!handler) {
                continue;
            }
            //@ts-ignore
            this.server.implementApi(svc.name, handler);
        }
        return output;
    }

    public async start() {
        await this.server.start();
    }
    public async stop() {
        await this.server.stop();
    }

    private prefixCheck(call: BaseCall<ServiceType>): boolean {
        if (call.service.name == "ClusterLogin") {
            return true;
        }
        if (call.conn.clientType === EClusterClientType.Node) {
            if (!call.conn.nodeId) {
                return false;
            }
        }
        if (call.conn.clientType === EClusterClientType.Terminal) {
            if (!call.conn.terminalId) {
                return false;
            }
        }
        let apiClientType: EClusterClientType | undefined = call.service.conf?.clientType;
        if (apiClientType) {
            if (apiClientType !== call.conn.clientType) return false;
        }
        return true;
    }
    private async apiLogin(call: ApiCall<ReqClusterLogin, ResClusterLogin, any>) {
        if (call.req.clientType === EClusterClientType.Terminal) {
            return await this.clientLoginByTerminal(call);
        }
        let req = call.req;
        let cfg = (await this.getNodesCfg()).find(c => c.clusterNodeId === req.nodeId);
        if (!cfg) {
            return await apiErrorThenClose(call, `认证失败！不存在nodeId=${req.nodeId}`);
        }
        if (cfg.clusterKey !== req.clusterKey) {
            return await apiErrorThenClose(call, `认证失败！错误的clusterKey`);
        }
        cfg = undefined;

        let node: IClusterNode<NodeInfo> = {
            nodeInfo: {
                clusterNodeId: req.nodeId,
                info: req.nodeInfo,
                expires: Date.now() + 3 * 60 * 1000,//3分钟过期时间
            },
            nodeConn: call.conn,
        };
        this.nodes.set(node.nodeInfo.clusterNodeId, node);
        this.syncNodeInfoToRedis(node.nodeInfo);

        call.conn.clientType = EClusterClientType.Node;
        call.conn.nodeId = node.nodeInfo.clusterNodeId;

        await call.succ({});

        this.onNodeConnected?.call(this, node);
    }
    private async clientLoginByTerminal(call: ApiCall<ReqClusterLogin, ResClusterLogin, any>) {
        let req = call.req as ReqClusterLoginByTerminal;
        let cfg = (await this.getTerminalCfg())?.find(c => c.terminalId === req.terminalId);
        if (!cfg) {
            return await apiErrorThenClose(call, `认证失败！不存在terminalId=${req.terminalId}`);
        }
        if (cfg.terminalKey !== req.terminalKey) {
            return await apiErrorThenClose(call, `认证失败！错误的clusterKey`);
        }
        cfg = undefined;
        call.conn.clientType = EClusterClientType.Terminal;
        call.conn.terminalId = req.terminalId;
        return await call.succ({});
    }
    private async msgSyncNodeInfo(call: MsgCall<MsgClusterSyncNodeInfo, any>) {
        if (!call.conn.nodeId) return;
        let node = this.nodes.get(call.conn.nodeId);
        if (!node) {
            call.logger.error(`连接错误将被踢出`);
            call.conn.close();
            return;
        }

        node.nodeInfo.info = call.msg.nodeInfo;
        node.nodeInfo.expires = Date.now() + 3 * 60 * 1000;//3分钟过期时间
        this.syncNodeInfoToRedis(node.nodeInfo);
    }
    private nodeDisconnect(conn: BaseConnection<ServiceType>) {
        if (conn.nodeId) {
            this.nodes.delete(conn.nodeId);
            this.delNodeInfoToRedis(conn.nodeId);
            this.onNodeDisconnected?.call(this, conn.nodeId);
        }
    }

    private async syncNodeInfoToRedis(nodeInfo: IClusterNodeInfo<NodeInfo>) {
        await (await this.getRedisClient()).setHashObject(
            ClusterMgr.buildNodesHashKey(this.clusterTypeKey),
            nodeInfo.clusterNodeId, nodeInfo);
    }
    private async delNodeInfoToRedis(nodeId: string) {
        await (await this.getRedisClient()).removeHashValue(`ClusterMgr:${this.clusterTypeKey}:Nodes`, nodeId);
    }

    public getNodeInfos(): IClusterNodeInfo<NodeInfo>[] {
        let infos: IClusterNodeInfo<NodeInfo>[] = [];
        for (let [_, node] of this.nodes) {
            infos.push(node.nodeInfo);
        }
        return infos;
    }
    public getNodeById(nodeId: string): IClusterNodeInfo<NodeInfo> | null {
        return this.nodes.get(nodeId)?.nodeInfo ?? null;
    }

    /**
     * 从redis中获取所有节点列表, 分布式时，大厅服务器和游戏服务器管理节点，可能不是同个实例，所以使用本方法来获取
     *
     * @public
     * @typeParam NodeInfo
     * @param clusterTypeKey 集群类型标识，用在各种场合进行区分的。需要和构造ClussterMgr时的值一致
     * @returns
     */
    public static async getNodeInfosFromRedis<NodeInfo>(
        clusterTypeKey: string,
        getRedisClient: (reuseClient: boolean) => Promise<IRedisClient>): Promise<IClusterNodeInfo<NodeInfo>[]> {
        let hashKey = ClusterMgr.buildNodesHashKey(clusterTypeKey);
        let allKv = await (await getRedisClient(true))
            .getHashObjects<IClusterNodeInfo<NodeInfo>>(hashKey);
        let nodes: IClusterNodeInfo<NodeInfo>[] = [];
        let now = Date.now();
        for (let key in allKv) {
            let nodeInfo = allKv[key];
            if (nodeInfo.expires < now) continue;
            nodes.push(nodeInfo);
        }
        return nodes;
    }
    /**
     * 从redis中获取指定节点信息, 分布式时，大厅服务器和游戏服务器管理节点，可能不是同个实例，所以使用本方法来获取
     *
     * @public
     * @typeParam NodeInfo
     * @param clusterTypeKey 集群类型标识，用在各种场合进行区分的。需要和构造ClussterMgr时的值一致
     * @param clusterNodeId 节点ID
     * @returns
     */
    public static async getNodeInfoFromRedis<NodeInfo>(
        clusterTypeKey: string,
        clusterNodeId: string,
        getRedisClient: (reuseClient: boolean) => Promise<IRedisClient>): Promise<IClusterNodeInfo<NodeInfo> | null> {

        let hashKey = ClusterMgr.buildNodesHashKey(clusterTypeKey);
        let node = await (await getRedisClient(true))
            .getHashObject<IClusterNodeInfo<NodeInfo>>(hashKey, clusterNodeId);
        if (!node) return null;
        if (node.expires < Date.now()) return null;
        return node;
    }


    /**
     * 给节点分配任务
     *
     * @public
     * @typeParam T
     * @param nodeId
     * @param taskId 任务ID需要集群内唯一
     * @param taskData
     * @returns
     */
    public async assignTask<T>(nodeId: string, taskId: string, taskData: T): Promise<IResult<null>> {
        let node = this.nodes.get(nodeId);
        if (!node) return Result.buildErr(`nodeId=${nodeId}不存在！`);
        let ret = await node.nodeConn.sendMsg('AssignTask', {
            taskId: taskId,
            taskData: taskData,
        });
        if (!ret.isSucc) return Result.buildErr(ret.errMsg);
        return Result.buildSucc(null);
    }
    /**
     * 给节点取消已经分配的任务
     *
     * @public
     * @typeParam T
     * @param nodeId
     * @param taskId 任务ID需要集群内唯一
     * @param taskData
     * @returns
     */
    public async cancelTask(nodeId: string, taskId: string): Promise<IResult<null>> {
        let node = this.nodes.get(nodeId);
        if (!node) return Result.buildErr(`节点ID${nodeId}不存在！`);
        let ret = await node.nodeConn.sendMsg('CancelTask', {
            taskId: taskId,
        });
        if (!ret.isSucc) return Result.buildErr(ret.errMsg);
        return Result.buildSucc(null);
    }

}

