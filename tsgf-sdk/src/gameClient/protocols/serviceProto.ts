import { ServiceProto } from 'tsrpc-proto';
import { MsgDisconnect } from './MsgDisconnect';
import { MsgNotifyChangeCustomPlayerProfile } from './MsgNotifyChangeCustomPlayerProfile';
import { MsgNotifyChangeCustomPlayerStatus } from './MsgNotifyChangeCustomPlayerStatus';
import { MsgNotifyChangePlayerNetworkState } from './MsgNotifyChangePlayerNetworkState';
import { MsgNotifyChangePlayerTeam } from './MsgNotifyChangePlayerTeam';
import { MsgNotifyChangeRoom } from './MsgNotifyChangeRoom';
import { MsgNotifyDismissRoom } from './MsgNotifyDismissRoom';
import { MsgNotifyJoinRoom } from './MsgNotifyJoinRoom';
import { MsgNotifyKicked } from './MsgNotifyKicked';
import { MsgNotifyLeaveRoom } from './MsgNotifyLeaveRoom';
import { MsgNotifyRoomAllPlayersMatchResult } from './MsgNotifyRoomAllPlayersMatchResult';
import { MsgNotifyRoomAllPlayersMatchStart } from './MsgNotifyRoomAllPlayersMatchStart';
import { MsgNotifyRoomMsg } from './MsgNotifyRoomMsg';
import { MsgNotifyStartFrameSync } from './MsgNotifyStartFrameSync';
import { MsgNotifyStopFrameSync } from './MsgNotifyStopFrameSync';
import { MsgNotifySyncFrame } from './MsgNotifySyncFrame';
import { MsgPlayerInpFrame } from './MsgPlayerInpFrame';
import { MsgPlayerSendSyncState } from './MsgPlayerSendSyncState';
import { MsgRequirePlayerSyncState } from './MsgRequirePlayerSyncState';
import { ReqAuthorize, ResAuthorize } from './PtlAuthorize';
import { ReqCancelMatch, ResCancelMatch } from './PtlCancelMatch';
import { ReqChangeCustomPlayerProfile, ResChangeCustomPlayerProfile } from './PtlChangeCustomPlayerProfile';
import { ReqChangeCustomPlayerStatus, ResChangeCustomPlayerStatus } from './PtlChangeCustomPlayerStatus';
import { ReqChangePlayerTeam, ResChangePlayerTeam } from './PtlChangePlayerTeam';
import { ReqChangeRoom, ResChangeRoom } from './PtlChangeRoom';
import { ReqCreateRoomRobot, ResCreateRoomRobot } from './PtlCreateRoomRobot';
import { ReqDismissRoom, ResDismissRoom } from './PtlDismissRoom';
import { ReqJoinRoom, ResJoinRoom } from './PtlJoinRoom';
import { ReqKickPlayer, ResKickPlayer } from './PtlKickPlayer';
import { ReqLeaveRoom, ResLeaveRoom } from './PtlLeaveRoom';
import { ReqQueryMatch, ResQueryMatch } from './PtlQueryMatch';
import { ReqReconnect, ResReconnect } from './PtlReconnect';
import { ReqRequestAfterFrames, ResRequestAfterFrames } from './PtlRequestAfterFrames';
import { ReqRequestFrames, ResRequestFrames } from './PtlRequestFrames';
import { ReqRequestMatch, ResRequestMatch } from './PtlRequestMatch';
import { ReqRoomRobotLeave, ResRoomRobotLeave } from './PtlRoomRobotLeave';
import { ReqSendRoomMsg, ResSendRoomMsg } from './PtlSendRoomMsg';
import { ReqStartFrameSync, ResStartFrameSync } from './PtlStartFrameSync';
import { ReqStopFrameSync, ResStopFrameSync } from './PtlStopFrameSync';

export interface ServiceType {
    api: {
        "Authorize": {
            req: ReqAuthorize,
            res: ResAuthorize
        },
        "CancelMatch": {
            req: ReqCancelMatch,
            res: ResCancelMatch
        },
        "ChangeCustomPlayerProfile": {
            req: ReqChangeCustomPlayerProfile,
            res: ResChangeCustomPlayerProfile
        },
        "ChangeCustomPlayerStatus": {
            req: ReqChangeCustomPlayerStatus,
            res: ResChangeCustomPlayerStatus
        },
        "ChangePlayerTeam": {
            req: ReqChangePlayerTeam,
            res: ResChangePlayerTeam
        },
        "ChangeRoom": {
            req: ReqChangeRoom,
            res: ResChangeRoom
        },
        "CreateRoomRobot": {
            req: ReqCreateRoomRobot,
            res: ResCreateRoomRobot
        },
        "DismissRoom": {
            req: ReqDismissRoom,
            res: ResDismissRoom
        },
        "JoinRoom": {
            req: ReqJoinRoom,
            res: ResJoinRoom
        },
        "KickPlayer": {
            req: ReqKickPlayer,
            res: ResKickPlayer
        },
        "LeaveRoom": {
            req: ReqLeaveRoom,
            res: ResLeaveRoom
        },
        "QueryMatch": {
            req: ReqQueryMatch,
            res: ResQueryMatch
        },
        "Reconnect": {
            req: ReqReconnect,
            res: ResReconnect
        },
        "RequestAfterFrames": {
            req: ReqRequestAfterFrames,
            res: ResRequestAfterFrames
        },
        "RequestFrames": {
            req: ReqRequestFrames,
            res: ResRequestFrames
        },
        "RequestMatch": {
            req: ReqRequestMatch,
            res: ResRequestMatch
        },
        "RoomRobotLeave": {
            req: ReqRoomRobotLeave,
            res: ResRoomRobotLeave
        },
        "SendRoomMsg": {
            req: ReqSendRoomMsg,
            res: ResSendRoomMsg
        },
        "StartFrameSync": {
            req: ReqStartFrameSync,
            res: ResStartFrameSync
        },
        "StopFrameSync": {
            req: ReqStopFrameSync,
            res: ResStopFrameSync
        }
    },
    msg: {
        "Disconnect": MsgDisconnect,
        "NotifyChangeCustomPlayerProfile": MsgNotifyChangeCustomPlayerProfile,
        "NotifyChangeCustomPlayerStatus": MsgNotifyChangeCustomPlayerStatus,
        "NotifyChangePlayerNetworkState": MsgNotifyChangePlayerNetworkState,
        "NotifyChangePlayerTeam": MsgNotifyChangePlayerTeam,
        "NotifyChangeRoom": MsgNotifyChangeRoom,
        "NotifyDismissRoom": MsgNotifyDismissRoom,
        "NotifyJoinRoom": MsgNotifyJoinRoom,
        "NotifyKicked": MsgNotifyKicked,
        "NotifyLeaveRoom": MsgNotifyLeaveRoom,
        "NotifyRoomAllPlayersMatchResult": MsgNotifyRoomAllPlayersMatchResult,
        "NotifyRoomAllPlayersMatchStart": MsgNotifyRoomAllPlayersMatchStart,
        "NotifyRoomMsg": MsgNotifyRoomMsg,
        "NotifyStartFrameSync": MsgNotifyStartFrameSync,
        "NotifyStopFrameSync": MsgNotifyStopFrameSync,
        "NotifySyncFrame": MsgNotifySyncFrame,
        "PlayerInpFrame": MsgPlayerInpFrame,
        "PlayerSendSyncState": MsgPlayerSendSyncState,
        "RequirePlayerSyncState": MsgRequirePlayerSyncState
    }
}

export const serviceProto: ServiceProto<ServiceType> = {
    "version": 70,
    "services": [
        {
            "id": 13,
            "name": "Disconnect",
            "type": "msg"
        },
        {
            "id": 40,
            "name": "NotifyChangeCustomPlayerProfile",
            "type": "msg"
        },
        {
            "id": 34,
            "name": "NotifyChangeCustomPlayerStatus",
            "type": "msg"
        },
        {
            "id": 33,
            "name": "NotifyChangePlayerNetworkState",
            "type": "msg"
        },
        {
            "id": 42,
            "name": "NotifyChangePlayerTeam",
            "type": "msg"
        },
        {
            "id": 35,
            "name": "NotifyChangeRoom",
            "type": "msg"
        },
        {
            "id": 16,
            "name": "NotifyDismissRoom",
            "type": "msg"
        },
        {
            "id": 17,
            "name": "NotifyJoinRoom",
            "type": "msg"
        },
        {
            "id": 55,
            "name": "NotifyKicked",
            "type": "msg"
        },
        {
            "id": 18,
            "name": "NotifyLeaveRoom",
            "type": "msg"
        },
        {
            "id": 48,
            "name": "NotifyRoomAllPlayersMatchResult",
            "type": "msg"
        },
        {
            "id": 49,
            "name": "NotifyRoomAllPlayersMatchStart",
            "type": "msg"
        },
        {
            "id": 19,
            "name": "NotifyRoomMsg",
            "type": "msg"
        },
        {
            "id": 23,
            "name": "NotifyStartFrameSync",
            "type": "msg"
        },
        {
            "id": 24,
            "name": "NotifyStopFrameSync",
            "type": "msg"
        },
        {
            "id": 25,
            "name": "NotifySyncFrame",
            "type": "msg"
        },
        {
            "id": 26,
            "name": "PlayerInpFrame",
            "type": "msg"
        },
        {
            "id": 27,
            "name": "PlayerSendSyncState",
            "type": "msg"
        },
        {
            "id": 28,
            "name": "RequirePlayerSyncState",
            "type": "msg"
        },
        {
            "id": 14,
            "name": "Authorize",
            "type": "api"
        },
        {
            "id": 47,
            "name": "CancelMatch",
            "type": "api"
        },
        {
            "id": 41,
            "name": "ChangeCustomPlayerProfile",
            "type": "api"
        },
        {
            "id": 37,
            "name": "ChangeCustomPlayerStatus",
            "type": "api"
        },
        {
            "id": 43,
            "name": "ChangePlayerTeam",
            "type": "api"
        },
        {
            "id": 38,
            "name": "ChangeRoom",
            "type": "api"
        },
        {
            "id": 51,
            "name": "CreateRoomRobot",
            "type": "api"
        },
        {
            "id": 20,
            "name": "DismissRoom",
            "type": "api"
        },
        {
            "id": 15,
            "name": "JoinRoom",
            "type": "api"
        },
        {
            "id": 54,
            "name": "KickPlayer",
            "type": "api"
        },
        {
            "id": 21,
            "name": "LeaveRoom",
            "type": "api"
        },
        {
            "id": 50,
            "name": "QueryMatch",
            "type": "api"
        },
        {
            "id": 6,
            "name": "Reconnect",
            "type": "api"
        },
        {
            "id": 32,
            "name": "RequestAfterFrames",
            "type": "api"
        },
        {
            "id": 29,
            "name": "RequestFrames",
            "type": "api"
        },
        {
            "id": 44,
            "name": "RequestMatch",
            "type": "api"
        },
        {
            "id": 52,
            "name": "RoomRobotLeave",
            "type": "api"
        },
        {
            "id": 22,
            "name": "SendRoomMsg",
            "type": "api"
        },
        {
            "id": 30,
            "name": "StartFrameSync",
            "type": "api"
        },
        {
            "id": 31,
            "name": "StopFrameSync",
            "type": "api"
        }
    ],
    "types": {
        "MsgDisconnect/MsgDisconnect": {
            "type": "Interface"
        },
        "MsgNotifyChangeCustomPlayerProfile/MsgNotifyChangeCustomPlayerProfile": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IChangeCustomPlayerProfile"
                    }
                }
            ]
        },
        "../../tsgf/player/IPlayerInfo/IChangeCustomPlayerProfile": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "changePlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "customPlayerProfile",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "oldCustomPlayerProfile",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 3,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/IRoomInfo": {
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
                    "id": 20,
                    "name": "privateRoomJoinMode",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/EPrivateRoomJoinMode"
                    },
                    "optional": true
                },
                {
                    "id": 14,
                    "name": "matcherKey",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 5,
                    "name": "createType",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/ERoomCreateType"
                    }
                },
                {
                    "id": 6,
                    "name": "maxPlayers",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 7,
                    "name": "roomType",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 8,
                    "name": "customProperties",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 19,
                    "name": "allPlayerMatchReqId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 9,
                    "name": "playerList",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/player/IPlayerInfo/IPlayerInfo"
                        }
                    }
                },
                {
                    "id": 15,
                    "name": "teamList",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/room/IRoomInfo/ITeamInfo"
                        }
                    }
                },
                {
                    "id": 16,
                    "name": "fixedTeamCount",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 17,
                    "name": "freeTeamMinPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 18,
                    "name": "freeTeamMaxPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 10,
                    "name": "frameRate",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 11,
                    "name": "frameSyncState",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/EFrameSyncState"
                    }
                },
                {
                    "id": 12,
                    "name": "createTime",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 13,
                    "name": "startGameTime",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 21,
                    "name": "retainEmptyRoomTime",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 22,
                    "name": "retainOwnSeat",
                    "type": {
                        "type": "Boolean"
                    }
                },
                {
                    "id": 23,
                    "name": "randomRequirePlayerSyncStateInvMs",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
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
        "../../tsgf/room/IRoomInfo/ERoomCreateType": {
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
        "../../tsgf/player/IPlayerInfo/IPlayerInfo": {
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
                    "id": 9,
                    "name": "customPlayerProfile",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 8,
                    "name": "networkState",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/ENetworkState"
                    }
                },
                {
                    "id": 7,
                    "name": "isRobot",
                    "type": {
                        "type": "Boolean"
                    }
                },
                {
                    "id": 10,
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
        "../../tsgf/player/IPlayerInfo/ENetworkState": {
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
        "../../tsgf/room/IRoomInfo/EFrameSyncState": {
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
        "MsgNotifyChangeCustomPlayerStatus/MsgNotifyChangeCustomPlayerStatus": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IChangeCustomPlayerStatus"
                    }
                }
            ]
        },
        "../../tsgf/player/IPlayerInfo/IChangeCustomPlayerStatus": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "changePlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "customPlayerStatus",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "oldCustomPlayerStatus",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 3,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "MsgNotifyChangePlayerNetworkState/MsgNotifyChangePlayerNetworkState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                },
                {
                    "id": 1,
                    "name": "changePlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "networkState",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/ENetworkState"
                    }
                }
            ]
        },
        "MsgNotifyChangePlayerTeam/MsgNotifyChangePlayerTeam": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IChangePlayerTeam"
                    }
                }
            ]
        },
        "../../tsgf/player/IPlayerInfo/IChangePlayerTeam": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "changePlayerId",
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
                },
                {
                    "id": 2,
                    "name": "oldTeamId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 3,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "MsgNotifyChangeRoom/MsgNotifyChangeRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "MsgNotifyDismissRoom/MsgNotifyDismissRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "MsgNotifyJoinRoom/MsgNotifyJoinRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 1,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                },
                {
                    "id": 2,
                    "name": "joinPlayerId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "MsgNotifyKicked/MsgNotifyKicked": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "MsgNotifyLeaveRoom/MsgNotifyLeaveRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 2,
                    "name": "leavePlayerInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IPlayerInfo"
                    }
                },
                {
                    "id": 1,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "MsgNotifyRoomAllPlayersMatchResult/MsgNotifyRoomAllPlayersMatchResult": {
            "type": "Interface",
            "properties": [
                {
                    "id": 3,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                },
                {
                    "id": 0,
                    "name": "errMsg",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 1,
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
                        "target": "../../tsgf/match/Models/IMatchPlayerResultWithServer"
                    },
                    "optional": true
                }
            ]
        },
        "../../tsgf/match/Models/IMatchPlayerResultWithServer": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "gameServerUrl",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
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
                    "name": "teamId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "MsgNotifyRoomAllPlayersMatchStart/MsgNotifyRoomAllPlayersMatchStart": {
            "type": "Interface",
            "properties": [
                {
                    "id": 3,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                },
                {
                    "id": 0,
                    "name": "matchReqId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "reqPlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "matchParams",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/match/Models/IMatchParamsFromRoomAllPlayer"
                    }
                }
            ]
        },
        "../../tsgf/match/Models/IMatchParamsFromRoomAllPlayer": {
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
                        "literal": "RoomAllPlayers"
                    }
                },
                {
                    "id": 1,
                    "name": "matchFromInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/match/Models/IMatchFromRoomAllPlayers"
                    }
                }
            ]
        },
        "../../tsgf/match/Models/IMatchParamsBase": {
            "type": "Interface",
            "properties": [
                {
                    "id": 5,
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
                    "id": 1,
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
                    "id": 4,
                    "name": "teamParams",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/ITeamParams"
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
        "../../tsgf/match/Models/EMatchFromType": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": "Player"
                },
                {
                    "id": 1,
                    "value": "RoomJoinUs"
                },
                {
                    "id": 2,
                    "value": "RoomAllPlayers"
                }
            ]
        },
        "../../tsgf/match/Models/IMatchFromRoomAllPlayers": {
            "type": "Interface"
        },
        "MsgNotifyRoomMsg/MsgNotifyRoomMsg": {
            "type": "Interface",
            "properties": [
                {
                    "id": 3,
                    "name": "recvRoomMsg",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomMsg/IRecvRoomMsg"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomMsg/IRecvRoomMsg": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "fromPlayerInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IPlayerInfo"
                    }
                },
                {
                    "id": 1,
                    "name": "msg",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "recvType",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomMsg/ERoomMsgRecvType"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomMsg/ERoomMsgRecvType": {
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
                }
            ]
        },
        "MsgNotifyStartFrameSync/MsgNotifyStartFrameSync": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "startPlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "MsgNotifyStopFrameSync/MsgNotifyStopFrameSync": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "stopPlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "MsgNotifySyncFrame/MsgNotifySyncFrame": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "syncFrame",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IGameFrame/IGameSyncFrame"
                    }
                },
                {
                    "id": 1,
                    "name": "dt",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "../../tsgf/room/IGameFrame/IGameSyncFrame": {
            "type": "Interface",
            "properties": [
                {
                    "id": 1,
                    "name": "frameIndex",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 0,
                    "name": "playerInputs",
                    "type": {
                        "type": "Union",
                        "members": [
                            {
                                "id": 0,
                                "type": {
                                    "type": "Array",
                                    "elementType": {
                                        "type": "Reference",
                                        "target": "../../tsgf/room/IGameFrame/IFramePlayerInput"
                                    }
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
            ],
            "indexSignature": {
                "keyType": "String",
                "type": {
                    "type": "Any"
                }
            }
        },
        "../../tsgf/room/IGameFrame/IFramePlayerInput": {
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
                    "name": "inputFrameType",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IGameFrame/EPlayerInputFrameType"
                    }
                },
                {
                    "id": 2,
                    "name": "operates",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/room/IGameFrame/IPlayerInputOperate"
                        }
                    },
                    "optional": true
                }
            ],
            "indexSignature": {
                "keyType": "String",
                "type": {
                    "type": "Any"
                }
            }
        },
        "../../tsgf/room/IGameFrame/EPlayerInputFrameType": {
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
                }
            ]
        },
        "../../tsgf/room/IGameFrame/IPlayerInputOperate": {
            "type": "Interface",
            "indexSignature": {
                "keyType": "String",
                "type": {
                    "type": "Any"
                }
            }
        },
        "MsgPlayerInpFrame/MsgPlayerInpFrame": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "operates",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/room/IGameFrame/IPlayerInputOperate"
                        }
                    }
                },
                {
                    "id": 1,
                    "name": "robotPlayerId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "MsgPlayerSendSyncState/MsgPlayerSendSyncState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "stateData",
                    "type": {
                        "type": "Any"
                    }
                },
                {
                    "id": 1,
                    "name": "stateFrameIndex",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "MsgRequirePlayerSyncState/MsgRequirePlayerSyncState": {
            "type": "Interface"
        },
        "PtlAuthorize/ReqAuthorize": {
            "type": "Interface",
            "extends": [
                {
                    "id": 3,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IPlayerInfoPara"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "playerToken",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "roomWaitReconnectTime",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "../../tsgf/player/IPlayerInfo/IPlayerInfoPara": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "showName",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "customPlayerStatus",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "customPlayerProfile",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlAuthorize/ResAuthorize": {
            "type": "Interface",
            "properties": [
                {
                    "id": 1,
                    "name": "playerInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IPlayerInfo"
                    }
                }
            ]
        },
        "PtlCancelMatch/ReqCancelMatch": {
            "type": "Interface"
        },
        "PtlCancelMatch/ResCancelMatch": {
            "type": "Interface"
        },
        "PtlChangeCustomPlayerProfile/ReqChangeCustomPlayerProfile": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "customPlayerProfile",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "robotPlayerId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlChangeCustomPlayerProfile/ResChangeCustomPlayerProfile": {
            "type": "Interface"
        },
        "PtlChangeCustomPlayerStatus/ReqChangeCustomPlayerStatus": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "customPlayerStatus",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "robotPlayerId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlChangeCustomPlayerStatus/ResChangeCustomPlayerStatus": {
            "type": "Interface"
        },
        "PtlChangePlayerTeam/ReqChangePlayerTeam": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "newTeamId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "robotPlayerId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlChangePlayerTeam/ResChangePlayerTeam": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "PtlChangeRoom/ReqChangeRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IChangeRoomPara"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/IChangeRoomPara": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomName",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "isPrivate",
                    "type": {
                        "type": "Boolean"
                    },
                    "optional": true
                },
                {
                    "id": 5,
                    "name": "privateRoomJoinMode",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/EPrivateRoomJoinMode"
                    },
                    "optional": true
                },
                {
                    "id": 6,
                    "name": "privateRoomPassword",
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
                }
            ]
        },
        "PtlChangeRoom/ResChangeRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "PtlCreateRoomRobot/ReqCreateRoomRobot": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "createPa",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IPlayerInfoPara"
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
        "PtlCreateRoomRobot/ResCreateRoomRobot": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "robotInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IPlayerInfo"
                    }
                }
            ]
        },
        "PtlDismissRoom/ReqDismissRoom": {
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
        "PtlDismissRoom/ResDismissRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "PtlJoinRoom/ReqJoinRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IJoinRoomPara"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/IJoinRoomPara": {
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
                    "name": "teamId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "password",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlJoinRoom/ResJoinRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 2,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "PtlKickPlayer/ReqKickPlayer": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "playerId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlKickPlayer/ResKickPlayer": {
            "type": "Interface"
        },
        "PtlLeaveRoom/ReqLeaveRoom": {
            "type": "Interface"
        },
        "PtlLeaveRoom/ResLeaveRoom": {
            "type": "Interface"
        },
        "PtlQueryMatch/ReqQueryMatch": {
            "type": "Interface"
        },
        "PtlQueryMatch/ResQueryMatch": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "matchResult",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/match/Models/IMatchResult"
                    }
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
        "PtlReconnect/ReqReconnect": {
            "type": "Interface",
            "properties": [
                {
                    "id": 2,
                    "name": "playerToken",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 3,
                    "name": "roomWaitReconnectTime",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "PtlReconnect/ResReconnect": {
            "type": "Interface",
            "properties": [
                {
                    "id": 1,
                    "name": "playerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 0,
                    "name": "currRoomInfo",
                    "type": {
                        "type": "Union",
                        "members": [
                            {
                                "id": 0,
                                "type": {
                                    "type": "Reference",
                                    "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
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
        "PtlRequestAfterFrames/ReqRequestAfterFrames": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "startFrameIndex",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "PtlRequestAfterFrames/ResRequestAfterFrames": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IGameFrame/IAfterFrames"
                    }
                }
            ]
        },
        "../../tsgf/room/IGameFrame/IAfterFrames": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "stateData",
                    "type": {
                        "type": "Any"
                    }
                },
                {
                    "id": 1,
                    "name": "stateFrameIndex",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "afterFrames",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/room/IGameFrame/IGameSyncFrame"
                        }
                    }
                },
                {
                    "id": 5,
                    "name": "afterStartFrameIndex",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 6,
                    "name": "afterEndFrameIndex",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 4,
                    "name": "serverSyncFrameRate",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "PtlRequestFrames/ReqRequestFrames": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "beginFrameIndex",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "endFrameIndex",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "PtlRequestFrames/ResRequestFrames": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "frames",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/room/IGameFrame/IGameSyncFrame"
                        }
                    }
                }
            ]
        },
        "PtlRequestMatch/ReqRequestMatch": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "matchParams",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/match/Models/IMatchParamsFromRoomAllPlayer"
                    }
                }
            ]
        },
        "PtlRequestMatch/ResRequestMatch": {
            "type": "Interface",
            "properties": [
                {
                    "id": 4,
                    "name": "matchReqId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlRoomRobotLeave/ReqRoomRobotLeave": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "robotPlayerId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlRoomRobotLeave/ResRoomRobotLeave": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "robotInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IPlayerInfo"
                    }
                }
            ]
        },
        "PtlSendRoomMsg/ReqSendRoomMsg": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomMsg",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomMsg/IRoomMsg"
                    }
                },
                {
                    "id": 1,
                    "name": "robotPlayerId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "../../tsgf/room/IRoomMsg/IRoomMsg": {
            "type": "Union",
            "members": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomMsg/IRoomMsgOtherPlayers"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomMsg/IRoomMsgSomePlayers"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomMsg/IRoomMsgOtherPlayers": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomMsg/IRoomMsgBase"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "recvType",
                    "type": {
                        "type": "Union",
                        "members": [
                            {
                                "id": 0,
                                "type": {
                                    "type": "Literal",
                                    "literal": 1
                                }
                            },
                            {
                                "id": 1,
                                "type": {
                                    "type": "Literal",
                                    "literal": 2
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomMsg/IRoomMsgBase": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "msg",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "recvType",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomMsg/ERoomMsgRecvType"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomMsg/IRoomMsgSomePlayers": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomMsg/IRoomMsgBase"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "recvType",
                    "type": {
                        "type": "Literal",
                        "literal": 3
                    }
                },
                {
                    "id": 1,
                    "name": "recvPlayerList",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "String"
                        }
                    }
                }
            ]
        },
        "PtlSendRoomMsg/ResSendRoomMsg": {
            "type": "Interface"
        },
        "PtlStartFrameSync/ReqStartFrameSync": {
            "type": "Interface"
        },
        "PtlStartFrameSync/ResStartFrameSync": {
            "type": "Interface"
        },
        "PtlStopFrameSync/ReqStopFrameSync": {
            "type": "Interface"
        },
        "PtlStopFrameSync/ResStopFrameSync": {
            "type": "Interface"
        }
    }
};