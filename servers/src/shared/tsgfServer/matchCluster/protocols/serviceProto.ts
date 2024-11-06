import { ServiceProto } from 'tsrpc-proto';
import { MsgAssignTask } from './MsgAssignTask';
import { MsgCancelTask } from './MsgCancelTask';
import { MsgClusterSyncNodeInfo } from './MsgClusterSyncNodeInfo';
import { ReqClusterLogin, ResClusterLogin } from './PtlClusterLogin';

export interface ServiceType {
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

export const serviceProto: ServiceProto<ServiceType> = {
    "version": 1,
    "services": [
        {
            "id": 0,
            "name": "AssignTask",
            "type": "msg"
        },
        {
            "id": 1,
            "name": "CancelTask",
            "type": "msg"
        },
        {
            "id": 2,
            "name": "ClusterSyncNodeInfo",
            "type": "msg"
        },
        {
            "id": 3,
            "name": "ClusterLogin",
            "type": "api"
        }
    ],
    "types": {
        "MsgAssignTask/MsgAssignTask": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../cluster/Models/MsgAssignTask"
                    }
                }
            ]
        },
        "../../cluster/Models/MsgAssignTask": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "taskId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "taskData",
                    "type": {
                        "type": "Any"
                    }
                }
            ]
        },
        "MsgCancelTask/MsgCancelTask": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../cluster/Models/MsgCancelTask"
                    }
                }
            ]
        },
        "../../cluster/Models/MsgCancelTask": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "taskId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "MsgClusterSyncNodeInfo/MsgClusterSyncNodeInfo": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../cluster/Models/MsgClusterSyncNodeInfo"
                    }
                }
            ]
        },
        "../../cluster/Models/MsgClusterSyncNodeInfo": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "nodeInfo",
                    "type": {
                        "type": "Any"
                    }
                }
            ]
        },
        "PtlClusterLogin/ReqClusterLogin": {
            "type": "Reference",
            "target": "../../cluster/Models/ReqClusterLogin"
        },
        "../../cluster/Models/ReqClusterLogin": {
            "type": "Union",
            "members": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../cluster/Models/ReqClusterLoginByTerminal"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "../../cluster/Models/ReqClusterLoginByNode"
                    }
                }
            ]
        },
        "../../cluster/Models/ReqClusterLoginByTerminal": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "clientType",
                    "type": {
                        "type": "Literal",
                        "literal": "Terminal"
                    }
                },
                {
                    "id": 1,
                    "name": "terminalId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "terminalKey",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "../../cluster/Models/EClusterClientType": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": "Node"
                },
                {
                    "id": 1,
                    "value": "Terminal"
                }
            ]
        },
        "../../cluster/Models/ReqClusterLoginByNode": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "clientType",
                    "type": {
                        "type": "Literal",
                        "literal": "Node"
                    }
                },
                {
                    "id": 1,
                    "name": "nodeId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "clusterKey",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 3,
                    "name": "nodeInfo",
                    "type": {
                        "type": "Any"
                    }
                }
            ]
        },
        "PtlClusterLogin/ResClusterLogin": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../cluster/Models/ResClusterLogin"
                    }
                }
            ]
        },
        "../../cluster/Models/ResClusterLogin": {
            "type": "Interface"
        }
    }
};