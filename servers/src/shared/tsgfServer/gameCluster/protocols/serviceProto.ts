import { ServiceProto } from 'tsrpc-proto';
import { MsgAssignTask } from './MsgAssignTask';
import { MsgCancelTask } from './MsgCancelTask';
import { MsgClusterSyncNodeInfo } from './MsgClusterSyncNodeInfo';
import { ReqClusterLogin, ResClusterLogin } from './PtlClusterLogin';
import { ReqNodeDismissRoom, ResNodeDismissRoom } from './PtlNodeDismissRoom';
import { ReqNodeExtractRoom, ResNodeExtractRoom } from './PtlNodeExtractRoom';
import { ReqNodeUpdateRoom, ResNodeUpdateRoom } from './PtlNodeUpdateRoom';
import { ReqTerminalCreateRoom, ResTerminalCreateRoom } from './PtlTerminalCreateRoom';
import { ReqTerminalDismissRoom, ResTerminalDismissRoom } from './PtlTerminalDismissRoom';
import { ReqTerminalFilterRoom, ResTerminalFilterRoom } from './PtlTerminalFilterRoom';
import { ReqTerminalGetOrCreateRoom, ResTerminalGetOrCreateRoom } from './PtlTerminalGetOrCreateRoom';
import { ReqTerminalGetRoomOnlineInfo, ResTerminalGetRoomOnlineInfo } from './PtlTerminalGetRoomOnlineInfo';

export interface ServiceType {
    api: {
        "ClusterLogin": {
            req: ReqClusterLogin,
            res: ResClusterLogin
        },
        "NodeDismissRoom": {
            req: ReqNodeDismissRoom,
            res: ResNodeDismissRoom
        },
        "NodeExtractRoom": {
            req: ReqNodeExtractRoom,
            res: ResNodeExtractRoom
        },
        "NodeUpdateRoom": {
            req: ReqNodeUpdateRoom,
            res: ResNodeUpdateRoom
        },
        "TerminalCreateRoom": {
            req: ReqTerminalCreateRoom,
            res: ResTerminalCreateRoom
        },
        "TerminalDismissRoom": {
            req: ReqTerminalDismissRoom,
            res: ResTerminalDismissRoom
        },
        "TerminalFilterRoom": {
            req: ReqTerminalFilterRoom,
            res: ResTerminalFilterRoom
        },
        "TerminalGetOrCreateRoom": {
            req: ReqTerminalGetOrCreateRoom,
            res: ResTerminalGetOrCreateRoom
        },
        "TerminalGetRoomOnlineInfo": {
            req: ReqTerminalGetRoomOnlineInfo,
            res: ResTerminalGetRoomOnlineInfo
        }
    },
    msg: {
        "AssignTask": MsgAssignTask,
        "CancelTask": MsgCancelTask,
        "ClusterSyncNodeInfo": MsgClusterSyncNodeInfo
    }
}

export const serviceProto: ServiceProto<ServiceType> = {
    "version": 9,
    "services": [
        {
            "id": 7,
            "name": "AssignTask",
            "type": "msg"
        },
        {
            "id": 8,
            "name": "CancelTask",
            "type": "msg"
        },
        {
            "id": 9,
            "name": "ClusterSyncNodeInfo",
            "type": "msg"
        },
        {
            "id": 10,
            "name": "ClusterLogin",
            "type": "api"
        },
        {
            "id": 3,
            "name": "NodeDismissRoom",
            "type": "api",
            "conf": {
                "clientType": "Node"
            }
        },
        {
            "id": 6,
            "name": "NodeExtractRoom",
            "type": "api",
            "conf": {
                "clientType": "Node"
            }
        },
        {
            "id": 4,
            "name": "NodeUpdateRoom",
            "type": "api",
            "conf": {
                "clientType": "Node"
            }
        },
        {
            "id": 5,
            "name": "TerminalCreateRoom",
            "type": "api",
            "conf": {
                "clientType": "Terminal"
            }
        },
        {
            "id": 11,
            "name": "TerminalDismissRoom",
            "type": "api",
            "conf": {
                "clientType": "Terminal"
            }
        },
        {
            "id": 15,
            "name": "TerminalFilterRoom",
            "type": "api",
            "conf": {
                "clientType": "Terminal"
            }
        },
        {
            "id": 12,
            "name": "TerminalGetOrCreateRoom",
            "type": "api",
            "conf": {
                "clientType": "Terminal"
            }
        },
        {
            "id": 13,
            "name": "TerminalGetRoomOnlineInfo",
            "type": "api",
            "conf": {
                "clientType": "Terminal"
            }
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
        },
        "PtlNodeDismissRoom/ReqNodeDismissRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlNodeDismissRoom/ResNodeDismissRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomRegInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../room/Models/IRoomRegInfo"
                    }
                }
            ]
        },
        "../../room/Models/IRoomRegInfo": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "appId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "roomName",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 3,
                    "name": "roomType",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 4,
                    "name": "ownerPlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 5,
                    "name": "maxPlayers",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 6,
                    "name": "emptySeats",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 7,
                    "name": "createTime",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 8,
                    "name": "expireTime",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 9,
                    "name": "isPrivate",
                    "type": {
                        "type": "Union",
                        "members": [
                            {
                                "id": 0,
                                "type": {
                                    "type": "Literal",
                                    "literal": 0
                                }
                            },
                            {
                                "id": 1,
                                "type": {
                                    "type": "Literal",
                                    "literal": 1
                                }
                            }
                        ]
                    }
                },
                {
                    "id": 10,
                    "name": "privateRoomJoinMode",
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/EPrivateRoomJoinMode"
                    },
                    "optional": true
                },
                {
                    "id": 11,
                    "name": "privateRoomPassword",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 12,
                    "name": "teamsPlayerIds",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../../tsgf/room/IRoomInfo/ITeamPlayerIds"
                        }
                    }
                },
                {
                    "id": 13,
                    "name": "gameServerNodeId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "../../../tsgf/room/IRoomInfo/EPrivateRoomJoinMode": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": 0
                },
                {
                    "id": 1,
                    "value": 1
                },
                {
                    "id": 2,
                    "value": 2
                }
            ]
        },
        "../../../tsgf/room/IRoomInfo/ITeamPlayerIds": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "teamId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "playerIds",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "String"
                        }
                    }
                }
            ]
        },
        "PtlNodeExtractRoom/ReqNodeExtractRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlNodeExtractRoom/ResNodeExtractRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomRegInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../room/Models/IRoomRegInfo"
                    }
                },
                {
                    "id": 1,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "../../../tsgf/room/IRoomInfo/IRoomInfo": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "roomName",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "ownerPlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 3,
                    "name": "isPrivate",
                    "type": {
                        "type": "Boolean"
                    }
                },
                {
                    "id": 4,
                    "name": "privateRoomJoinMode",
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/EPrivateRoomJoinMode"
                    },
                    "optional": true
                },
                {
                    "id": 5,
                    "name": "matcherKey",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 6,
                    "name": "createType",
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/ERoomCreateType"
                    }
                },
                {
                    "id": 7,
                    "name": "maxPlayers",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 8,
                    "name": "roomType",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 9,
                    "name": "customProperties",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 10,
                    "name": "allPlayerMatchReqId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 11,
                    "name": "playerList",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../../tsgf/player/IPlayerInfo/IPlayerInfo"
                        }
                    }
                },
                {
                    "id": 12,
                    "name": "teamList",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../../tsgf/room/IRoomInfo/ITeamInfo"
                        }
                    }
                },
                {
                    "id": 13,
                    "name": "fixedTeamCount",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 14,
                    "name": "freeTeamMinPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 15,
                    "name": "freeTeamMaxPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 16,
                    "name": "frameRate",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 17,
                    "name": "frameSyncState",
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/EFrameSyncState"
                    }
                },
                {
                    "id": 18,
                    "name": "createTime",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 19,
                    "name": "startGameTime",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 20,
                    "name": "retainEmptyRoomTime",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 21,
                    "name": "retainOwnSeat",
                    "type": {
                        "type": "Boolean"
                    }
                },
                {
                    "id": 22,
                    "name": "randomRequirePlayerSyncStateInvMs",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "../../../tsgf/room/IRoomInfo/ERoomCreateType": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": 0
                },
                {
                    "id": 1,
                    "value": 1
                }
            ]
        },
        "../../../tsgf/player/IPlayerInfo/IPlayerInfo": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "playerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "showName",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "teamId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 3,
                    "name": "customPlayerStatus",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 4,
                    "name": "customPlayerProfile",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 5,
                    "name": "networkState",
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/player/IPlayerInfo/ENetworkState"
                    }
                },
                {
                    "id": 6,
                    "name": "isRobot",
                    "type": {
                        "type": "Boolean"
                    }
                },
                {
                    "id": 7,
                    "name": "roomRobotIds",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "String"
                        }
                    },
                    "optional": true
                }
            ]
        },
        "../../../tsgf/player/IPlayerInfo/ENetworkState": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": 0
                },
                {
                    "id": 1,
                    "value": 1
                }
            ]
        },
        "../../../tsgf/room/IRoomInfo/ITeamInfo": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "id",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "name",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "minPlayers",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 3,
                    "name": "maxPlayers",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "../../../tsgf/room/IRoomInfo/EFrameSyncState": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": 0
                },
                {
                    "id": 1,
                    "value": 1
                }
            ]
        },
        "PtlNodeUpdateRoom/ReqNodeUpdateRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomRegInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../room/Models/IRoomRegInfo"
                    }
                },
                {
                    "id": 1,
                    "name": "changedType",
                    "type": {
                        "type": "Reference",
                        "target": "../../room/RoomHelper/ERoomRegChangedType"
                    }
                },
                {
                    "id": 2,
                    "name": "playerId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 3,
                    "name": "oldTeamId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 4,
                    "name": "teamId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "../../room/RoomHelper/ERoomRegChangedType": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": 1
                },
                {
                    "id": 1,
                    "value": 2
                },
                {
                    "id": 2,
                    "value": 3
                },
                {
                    "id": 3,
                    "value": 4
                },
                {
                    "id": 4,
                    "value": 5
                },
                {
                    "id": 5,
                    "value": 6
                }
            ]
        },
        "PtlNodeUpdateRoom/ResNodeUpdateRoom": {
            "type": "Interface"
        },
        "PtlTerminalCreateRoom/ReqTerminalCreateRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/ICreateRoomPara"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "appId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "createType",
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/ERoomCreateType"
                    }
                }
            ]
        },
        "../../../tsgf/room/IRoomInfo/ICreateRoomPara": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/ITeamParams"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "roomName",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "ownerPlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "maxPlayers",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 3,
                    "name": "isPrivate",
                    "type": {
                        "type": "Boolean"
                    }
                },
                {
                    "id": 4,
                    "name": "privateRoomJoinMode",
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/EPrivateRoomJoinMode"
                    },
                    "optional": true
                },
                {
                    "id": 5,
                    "name": "privateRoomPassword",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 6,
                    "name": "matcherKey",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 7,
                    "name": "customProperties",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 8,
                    "name": "roomType",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 9,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 10,
                    "name": "retainEmptyRoomTime",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 11,
                    "name": "retainOwnSeat",
                    "type": {
                        "type": "Boolean"
                    },
                    "optional": true
                },
                {
                    "id": 12,
                    "name": "randomRequirePlayerSyncStateInvMs",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "../../../tsgf/room/IRoomInfo/ITeamParams": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "fixedTeamCount",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "fixedTeamMinPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "fixedTeamMaxPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 3,
                    "name": "fixedTeamInfoList",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../../tsgf/room/IRoomInfo/ITeamInfo"
                        }
                    },
                    "optional": true
                },
                {
                    "id": 4,
                    "name": "freeTeamMinPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 5,
                    "name": "freeTeamMaxPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "PtlTerminalCreateRoom/ResTerminalCreateRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomOnlineInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                    }
                }
            ]
        },
        "../../../tsgf/room/IRoomInfo/IRoomOnlineInfo": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 9,
                    "name": "ownerPlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "roomName",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "roomType",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 3,
                    "name": "maxPlayers",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 4,
                    "name": "emptySeats",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 5,
                    "name": "isPrivate",
                    "type": {
                        "type": "Boolean"
                    }
                },
                {
                    "id": 6,
                    "name": "privateRoomJoinMode",
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/EPrivateRoomJoinMode"
                    },
                    "optional": true
                },
                {
                    "id": 7,
                    "name": "gameServerUrl",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 8,
                    "name": "currGameServerPlayers",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "PtlTerminalDismissRoom/ReqTerminalDismissRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlTerminalDismissRoom/ResTerminalDismissRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomOnlineInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                    }
                }
            ]
        },
        "PtlTerminalFilterRoom/ReqTerminalFilterRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "filter",
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/IRoomsFilterPara"
                    }
                },
                {
                    "id": 1,
                    "name": "skip",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "limit",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "../../../tsgf/room/IRoomInfo/IRoomsFilterPara": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomType",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "maxPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "roomNameLike",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 3,
                    "name": "roomNameFullMatch",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlTerminalFilterRoom/ResTerminalFilterRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/IRoomsFilterRes"
                    }
                }
            ]
        },
        "../../../tsgf/room/IRoomInfo/IRoomsFilterRes": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "rooms",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                        }
                    }
                },
                {
                    "id": 1,
                    "name": "count",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "PtlTerminalGetOrCreateRoom/ReqTerminalGetOrCreateRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/IGetOrCreateRoomPara"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "appId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "../../../tsgf/room/IRoomInfo/IGetOrCreateRoomPara": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "matchRoomType",
                    "type": {
                        "type": "Boolean"
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "matchMaxPlayers",
                    "type": {
                        "type": "Boolean"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "matchLimitRoomCount",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 3,
                    "name": "createRoomPara",
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/ICreateRoomPara"
                    }
                }
            ]
        },
        "PtlTerminalGetOrCreateRoom/ResTerminalGetOrCreateRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/IGetOrCreateRoomRsp"
                    }
                }
            ]
        },
        "../../../tsgf/room/IRoomInfo/IGetOrCreateRoomRsp": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "matchRoomOnlineInfoList",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                        }
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "createRoomOnlineInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                    },
                    "optional": true
                }
            ]
        },
        "PtlTerminalGetRoomOnlineInfo/ReqTerminalGetRoomOnlineInfo": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlTerminalGetRoomOnlineInfo/ResTerminalGetRoomOnlineInfo": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomOnlineInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                    }
                }
            ]
        }
    }
};