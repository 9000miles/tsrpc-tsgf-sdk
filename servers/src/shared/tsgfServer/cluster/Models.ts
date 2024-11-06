
/**集群客户端的类型*/
export enum EClusterClientType {
    /**集群节点*/
    Node = 'Node',
    /**集群终端，用来使用集群服务的*/
    Terminal = 'Terminal',
}


/**终端登录集群rpc*/
export interface ReqClusterLoginByTerminal {
    /**集群客户端类型*/
    clientType: EClusterClientType.Terminal;
    /**终端id*/
    terminalId: string;
    /**终端密钥*/
    terminalKey: string;
}

/**节点登录集群rpc*/
export interface ReqClusterLoginByNode {
    /**集群客户端类型*/
    clientType: EClusterClientType.Node;
    /**如果是节点类型，则需要传节点ID */
    nodeId: string;
    /**集群密钥 */
    clusterKey: string;
    /**节点信息 */
    nodeInfo: any;
}
/**客户端登录集群rpc*/
export type ReqClusterLogin = ReqClusterLoginByTerminal | ReqClusterLoginByNode;
export interface ResClusterLogin {
}


/**管理分配任务给节点*/
export interface MsgAssignTask {
    /**任务唯一ID*/
    taskId:string;
    /**任务数据*/
    taskData:any;
}


/**管理取消已经分配给节点的任务*/
export interface MsgCancelTask {
    /**任务唯一ID*/
    taskId:string;
}

/**节点定时同步自身信息给管理*/
export interface MsgClusterSyncNodeInfo {
    /**节点信息 */
    nodeInfo: any;
}


export interface ClusterServiceType {
    api: {
        "ClusterLogin": {
            req: ReqClusterLogin,
            res: ResClusterLogin
        }
    },
    msg: {
        "AssignTask": MsgAssignTask,
        "CancelTask": MsgCancelTask,
        "ClusterSyncNodeInfo": MsgClusterSyncNodeInfo
    }
}