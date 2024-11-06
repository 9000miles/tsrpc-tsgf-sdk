import { ServiceProto } from 'tsrpc-proto';
import { ReqAppDismissRoom, ResAppDismissRoom } from './PtlAppDismissRoom';
import { ReqAuthorize, ResAuthorize } from './PtlAuthorize';
import { ReqCancelMatch, ResCancelMatch } from './PtlCancelMatch';
import { ReqCreateRoom, ResCreateRoom } from './PtlCreateRoom';
import { ReqFilterRooms, ResFilterRooms } from './PtlFilterRooms';
import { ReqGetOrCreateRoom, ResGetOrCreateRoom } from './PtlGetOrCreateRoom';
import { ReqGetRoomOnlineInfo, ResGetRoomOnlineInfo } from './PtlGetRoomOnlineInfo';
import { ReqOwnDismissRoom, ResOwnDismissRoom } from './PtlOwnDismissRoom';
import { ReqQueryMatch, ResQueryMatch } from './PtlQueryMatch';
import { ReqRecoverPlayerRoom, ResRecoverPlayerRoom } from './PtlRecoverPlayerRoom';
import { ReqRequestMatch, ResRequestMatch } from './PtlRequestMatch';

export interface ServiceType {
    api: {
        "AppDismissRoom": {
            req: ReqAppDismissRoom,
            res: ResAppDismissRoom
        },
        "Authorize": {
            req: ReqAuthorize,
            res: ResAuthorize
        },
        "CancelMatch": {
            req: ReqCancelMatch,
            res: ResCancelMatch
        },
        "CreateRoom": {
            req: ReqCreateRoom,
            res: ResCreateRoom
        },
        "FilterRooms": {
            req: ReqFilterRooms,
            res: ResFilterRooms
        },
        "GetOrCreateRoom": {
            req: ReqGetOrCreateRoom,
            res: ResGetOrCreateRoom
        },
        "GetRoomOnlineInfo": {
            req: ReqGetRoomOnlineInfo,
            res: ResGetRoomOnlineInfo
        },
        "OwnDismissRoom": {
            req: ReqOwnDismissRoom,
            res: ResOwnDismissRoom
        },
        "QueryMatch": {
            req: ReqQueryMatch,
            res: ResQueryMatch
        },
        "RecoverPlayerRoom": {
            req: ReqRecoverPlayerRoom,
            res: ResRecoverPlayerRoom
        },
        "RequestMatch": {
            req: ReqRequestMatch,
            res: ResRequestMatch
        }
    },
    msg: {

    }
}

export const serviceProto: ServiceProto<ServiceType> = {
    "version": 35,
    "services": [
        {
            "id": 11,
            "name": "AppDismissRoom",
            "type": "api",
            "conf": {
                "skipPlayerAuth": true,
                "cryptoMode": "AppReqDes"
            }
        },
        {
            "id": 0,
            "name": "Authorize",
            "type": "api",
            "conf": {
                "skipPlayerAuth": true,
                "cryptoMode": "AppReqDes"
            }
        },
        {
            "id": 1,
            "name": "CancelMatch",
            "type": "api",
            "conf": {
                "cryptoMode": "None"
            }
        },
        {
            "id": 2,
            "name": "CreateRoom",
            "type": "api",
            "conf": {
                "cryptoMode": "None"
            }
        },
        {
            "id": 12,
            "name": "FilterRooms",
            "type": "api",
            "conf": {
                "cryptoMode": "None"
            }
        },
        {
            "id": 8,
            "name": "GetOrCreateRoom",
            "type": "api",
            "conf": {
                "cryptoMode": "None"
            }
        },
        {
            "id": 7,
            "name": "GetRoomOnlineInfo",
            "type": "api",
            "conf": {
                "cryptoMode": "None"
            }
        },
        {
            "id": 13,
            "name": "OwnDismissRoom",
            "type": "api",
            "conf": {
                "cryptoMode": "None"
            }
        },
        {
            "id": 4,
            "name": "QueryMatch",
            "type": "api",
            "conf": {
                "cryptoMode": "None"
            }
        },
        {
            "id": 6,
            "name": "RecoverPlayerRoom",
            "type": "api",
            "conf": {
                "cryptoMode": "None"
            }
        },
        {
            "id": 5,
            "name": "RequestMatch",
            "type": "api",
            "conf": {
                "cryptoMode": "None"
            }
        }
    ],
    "types": {
        "PtlAppDismissRoom/ReqAppDismissRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/apiCrypto/Models/IAppEncryptRequest"
                    }
                }
            ]
        },
        "../../tsgf/apiCrypto/Models/IAppEncryptRequest": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/apiCrypto/Models/IBaseEncryptRequest"
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
        "../../tsgf/apiCrypto/Models/IBaseEncryptRequest": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "ciphertext",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "data",
                    "type": {
                        "type": "Any"
                    },
                    "optional": true
                }
            ]
        },
        "PtlAppDismissRoom/ResAppDismissRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomOnlineInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/IRoomOnlineInfo": {
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
                    "id": 10,
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
                    "id": 9,
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
                        "target": "../../tsgf/room/IRoomInfo/EPrivateRoomJoinMode"
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
        "../../tsgf/room/IRoomInfo/EPrivateRoomJoinMode": {
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
        "PtlAuthorize/ReqAuthorize": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/apiCrypto/Models/IAppEncryptRequest"
                    }
                }
            ]
        },
        "PtlAuthorize/ResAuthorize": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                }
            ],
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
                    "name": "playerToken",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "base/BasePlayerResponse": {
            "type": "Interface"
        },
        "PtlCancelMatch/ReqCancelMatch": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "matchReqId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "base/BasePlayerRequest": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "playerToken",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlCancelMatch/ResCancelMatch": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                }
            ]
        },
        "PtlCreateRoom/ReqCreateRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 2,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerRequest"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/ICreateRoomPara"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/ICreateRoomPara": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/ITeamParams"
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
                    "id": 9,
                    "name": "privateRoomJoinMode",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/EPrivateRoomJoinMode"
                    },
                    "optional": true
                },
                {
                    "id": 10,
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
                    "id": 4,
                    "name": "customProperties",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 5,
                    "name": "roomType",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 7,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 11,
                    "name": "retainEmptyRoomTime",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 12,
                    "name": "retainOwnSeat",
                    "type": {
                        "type": "Boolean"
                    },
                    "optional": true
                },
                {
                    "id": 13,
                    "name": "randomRequirePlayerSyncStateInvMs",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/ITeamParams": {
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
                            "target": "../../tsgf/room/IRoomInfo/ITeamInfo"
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
        "../../tsgf/room/IRoomInfo/ITeamInfo": {
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
        "PtlCreateRoom/ResCreateRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "roomOnlineInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                    }
                }
            ]
        },
        "PtlFilterRooms/ReqFilterRooms": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "filter",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomsFilterPara"
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
        "../../tsgf/room/IRoomInfo/IRoomsFilterPara": {
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
        "PtlFilterRooms/ResFilterRooms": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomsFilterRes"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/IRoomsFilterRes": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "rooms",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
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
        "PtlGetOrCreateRoom/ReqGetOrCreateRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 2,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerRequest"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IGetOrCreateRoomPara"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/IGetOrCreateRoomPara": {
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
                    "id": 3,
                    "name": "matchLimitRoomCount",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "createRoomPara",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/ICreateRoomPara"
                    }
                }
            ]
        },
        "PtlGetOrCreateRoom/ResGetOrCreateRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 2,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IGetOrCreateRoomRsp"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/IGetOrCreateRoomRsp": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "matchRoomOnlineInfoList",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                        }
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "createRoomOnlineInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                    },
                    "optional": true
                }
            ]
        },
        "PtlGetRoomOnlineInfo/ReqGetRoomOnlineInfo": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerRequest"
                    }
                }
            ],
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
        "PtlGetRoomOnlineInfo/ResGetRoomOnlineInfo": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "roomOnlineInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                    }
                }
            ]
        },
        "PtlOwnDismissRoom/ReqOwnDismissRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerRequest"
                    }
                }
            ],
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
        "PtlOwnDismissRoom/ResOwnDismissRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "roomOnlineInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                    }
                }
            ]
        },
        "PtlQueryMatch/ReqQueryMatch": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "matchReqId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlQueryMatch/ResQueryMatch": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "hasResult",
                    "type": {
                        "type": "Boolean"
                    }
                },
                {
                    "id": 3,
                    "name": "errMsg",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 4,
                    "name": "errCode",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "matchResult",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/match/Models/IMatchResult"
                    },
                    "optional": true
                }
            ]
        },
        "../../tsgf/match/Models/IMatchResult": {
            "type": "Interface",
            "properties": [
                {
                    "id": 1,
                    "name": "gameServerUrl",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 0,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "matchPlayerResults",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/match/Models/IMatchPlayerResult"
                        }
                    }
                }
            ]
        },
        "../../tsgf/match/Models/IMatchPlayerResult": {
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
                    "name": "teamId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlRecoverPlayerRoom/ReqRecoverPlayerRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerRequest"
                    }
                }
            ],
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
                    "name": "playerToken",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "updateShowName",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlRecoverPlayerRoom/ResRecoverPlayerRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 3,
                    "name": "roomOnlineInfo",
                    "type": {
                        "type": "Union",
                        "members": [
                            {
                                "id": 0,
                                "type": {
                                    "type": "Reference",
                                    "target": "../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                                }
                            },
                            {
                                "id": 1,
                                "type": {
                                    "type": "Literal",
                                    "literal": null
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "PtlRequestMatch/ReqRequestMatch": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "matchParams",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/match/Models/IMatchParamsFromPlayer"
                    }
                }
            ]
        },
        "../../tsgf/match/Models/IMatchParamsFromPlayer": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/match/Models/IMatchParamsBase"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "matchFromType",
                    "type": {
                        "type": "Literal",
                        "literal": "Player"
                    }
                },
                {
                    "id": 1,
                    "name": "matchFromInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/match/Models/IMatchFromPlayer"
                    }
                }
            ]
        },
        "../../tsgf/match/Models/IMatchParamsBase": {
            "type": "Interface",
            "properties": [
                {
                    "id": 6,
                    "name": "matchType",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 0,
                    "name": "matcherKey",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 4,
                    "name": "matcherParams",
                    "type": {
                        "type": "Any"
                    }
                },
                {
                    "id": 2,
                    "name": "matchTimeoutSec",
                    "type": {
                        "type": "Number"
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
                    "id": 5,
                    "name": "teamParams",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/ITeamParams"
                    },
                    "optional": true
                }
            ]
        },
        "../../tsgf/match/Models/EMatchFromType": {
            "type": "Enum",
            "members": [
                {
                    "id": 3,
                    "value": "Player"
                },
                {
                    "id": 4,
                    "value": "RoomJoinUs"
                },
                {
                    "id": 5,
                    "value": "RoomAllPlayers"
                }
            ]
        },
        "../../tsgf/match/Models/IMatchFromPlayer": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
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
        "PtlRequestMatch/ResRequestMatch": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "matchReqId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        }
    }
};