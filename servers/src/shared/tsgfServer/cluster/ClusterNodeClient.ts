
import { ServiceProto, WsClient } from "tsrpc";
import { logger } from "../../tsgf/logger";
import { ClusterServiceType, EClusterClientType, ReqClusterLogin } from "./Models";

/**
 * 集群节点客户端
 * @date 2022/4/19 - 16:50:02
 *
 * @class ClusterNodeClient
 * @typedef {ClusterNodeClient}
 * @typeParam NodeInfo 节点信息的类型，可自定义
 */
export class ClusterNodeClient<ServiceType extends ClusterServiceType, NodeInfo extends any>{

    public clientType: EClusterClientType;
    private id?: string;
    private key?: string;
    private getNodeInfo?: () => Promise<NodeInfo>;

    private clusterServerUrl: string;
    private clusterCAutoReconnectHD: any;
    public clusterClient?: WsClient<ServiceType>;
    private autoSyncInfoHD: any = 0;

    /**当前所有进行中的任务，任务ID=>任务数据*/
    public allTasks: Map<string, any> = new Map<string, any>();
    /**事件: 当接受了一个新任务(来自集群管理)*/
    public onAssignTask?: (taskId: string, taskData: any) => void;
    /**事件: 当取消了一个任务(来自集群管理)*/
    public onCancelTask?: (taskId: string) => void;

    constructor(clusterServiceProto: ServiceProto<ServiceType>, clusterServerUrl: string, clientType: EClusterClientType.Terminal, terminalId: string, terminalKey: string);
    constructor(clusterServiceProto: ServiceProto<ServiceType>, clusterServerUrl: string, clientType: EClusterClientType.Node, nodeId: string, clusterKey: string, getNodeInfo: () => Promise<NodeInfo>);
    constructor(clusterServiceProto: ServiceProto<ServiceType>, clusterServerUrl: string, clientType: EClusterClientType, id?: string, key?: string, getNodeInfo?: () => Promise<NodeInfo>) {
        this.clusterServerUrl = clusterServerUrl;
        this.clientType = clientType;
        this.id = id;
        this.key = key;
        this.getNodeInfo = getNodeInfo;

        this.clusterClient = new WsClient(clusterServiceProto, {
            server: this.clusterServerUrl,
            json: false,
            logger: logger,
        });
        //断开操作
        this.clusterClient.flows.postDisconnectFlow.push(v => {
            //只要断开, 就清理自动同步定时器
            if (this.autoSyncInfoHD) clearInterval(this.autoSyncInfoHD);
            this.autoSyncInfoHD = 0;

            if (!v.isManual) {
                //如果非手动断开,则自动开始重连
                logger.error('集群服务器-连接断开,等待2秒后自动重连');
                clearTimeout(this.clusterCAutoReconnectHD);
                this.clusterCAutoReconnectHD = setTimeout(() => this.reJoinCluster(true), 2000);
            }

            return v;
        });

        //监听各种需要的消息
        this.clusterClient.listenMsg("AssignTask", (msg) => {
            this.allTasks.set(msg.taskId, msg.taskData);
            this.onAssignTask?.call(this, msg.taskId, msg.taskData);
        });
        this.clusterClient.listenMsg("CancelTask", (msg) => {
            this.allTasks.delete(msg.taskId);
            this.onCancelTask?.call(this, msg.taskId);
        });
    }


    /**
     * 连接集群服务器,失败返回错误消息，连上了之后如果非手动断开，则会自动重连
     * @returns 
     */
    public async joinCluster(): Promise<string | null> {
        if (!this.clusterClient) {
            throw new Error('本对象已经被释放!');
        }
        if (this.clusterClient.isConnected === true) {
            //已经连上的,则直接返回成功
            return null;
        }

        let connectRet = await this.clusterClient.connect();
        if (!connectRet.isSucc) {
            return "连接失败:" + connectRet.errMsg;
        }
        let req: ReqClusterLogin;
        if (this.clientType === EClusterClientType.Node) {
            req = {
                clientType: EClusterClientType.Node,
                nodeId: this.id!,
                clusterKey: this.key!,
                nodeInfo: await this.getNodeInfo?.(),
            };
        } else {
            req = {
                clientType: EClusterClientType.Terminal,
                terminalId: this.id!,
                terminalKey: this.key!,
            };
        }
        let ret = await this.clusterClient.callApi("ClusterLogin", req);
        if (!ret.isSucc) {
            return ret.err.message;
        }

        if (this.clientType === EClusterClientType.Node) {
            //成功连上了,开始自动同步信息给集群
            if (this.autoSyncInfoHD) clearInterval(this.autoSyncInfoHD);
            this.autoSyncInfoHD = setInterval(async () => {
                if (this.clusterClient?.isConnected !== true) {
                    //发现断开,但还进定时器了,则取消自动重连 (正常断开就不会进定时器了)
                    if (this.autoSyncInfoHD) clearInterval(this.autoSyncInfoHD);
                    return;
                }
                //发送信息
                this.clusterClient.sendMsg("ClusterSyncNodeInfo", {
                    nodeInfo: await this.getNodeInfo?.(),
                });
            }, 1000);
        }

        return null;
    }
    /**
     * 当集群断开后用于重新连接集群
     * @param failReTry
     * @returns 
     */
    private async reJoinCluster(failReTry: boolean = true): Promise<boolean> {
        const err = await this.joinCluster();
        // 重连也错误，弹出错误提示
        if (!err) {
            logger.log('集群服务器-重连成功!');
            return true;
        }
        if (failReTry) {
            logger.error('集群服务器-重连失败:' + err + '  2秒后自动重连!');
            clearTimeout(this.clusterCAutoReconnectHD);
            this.clusterCAutoReconnectHD = setTimeout(() => this.reJoinCluster(failReTry), 2000);
        } else {
            logger.error('集群服务器-重连失败:' + err);
        }
        return false;
    }

    public async disconnectCluster(): Promise<void> {
        try {
            clearTimeout(this.clusterCAutoReconnectHD);
            clearInterval(this.autoSyncInfoHD);
            await this.clusterClient?.disconnect();
        } catch { }
    }
}