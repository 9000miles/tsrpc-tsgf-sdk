import { IGameServerInfo } from "../../hallClient/Models";
import { ICancelable } from "../../tsgf/ICancelable";
import { EFrameSyncState, EPrivateRoomJoinMode, ERoomCreateType, ICreateRoomPara, IRoomInfo, IRoomOnlineInfo, ITeamInfo } from "../../tsgf/room/IRoomInfo";
import { GameServerHelper } from "../game/GameServerHelper";
import { IRedisClient } from "../redisHelper";
import { buildGuid } from "../ServerUtils";
import { IRoomRegInfo } from "./Models";


/**房间注册信息和房间信息的结合体*/
export interface IRoomInfoPack {
    regInfo: IRoomRegInfo;
    roomInfo: IRoomInfo;
    roomOnlineInfo: IRoomOnlineInfo;
}
/*
export interface IRoomRegChanged {
    regInfo: IRoomGameServerRegInfo;
    isCreateOrChange: boolean;
    isDelete: boolean;
}
*/
export enum ERoomRegChangedType {
    Create = 1,
    Delete = 2,
    PlayerJoinRoom = 3,
    PlayerLeaveRoom = 4,
    PlayerChangeTeam = 5,
    /**变更房间信息,如私有密码等*/
    ChangeInfo = 6,
}
export interface IRoomRegChangedBase {
    regInfo: IRoomRegInfo;
}
export interface IRoomRegCreate extends IRoomRegChangedBase {
    changedType: ERoomRegChangedType.Create;
}
export interface IRoomRegDelete extends IRoomRegChangedBase {
    changedType: ERoomRegChangedType.Delete;
}
export interface IRoomRegChangeInfo extends IRoomRegChangedBase {
    changedType: ERoomRegChangedType.ChangeInfo;
}
export interface IRoomRegPlayerJoinRoom extends IRoomRegChangedBase {
    changedType: ERoomRegChangedType.PlayerJoinRoom;
    joinRoomPlayerId: string;
    teamId?: string;
}
export interface IRoomRegPlayerLeaveRoom extends IRoomRegChangedBase {
    changedType: ERoomRegChangedType.PlayerLeaveRoom;
    leaveRoomPlayerId: string;
    teamId?: string;
}
export interface IRoomRegPlayerChangeTeam extends IRoomRegChangedBase {
    changedType: ERoomRegChangedType.PlayerChangeTeam;
    changePlayerId: string;
    oldTeamId?: string;
    newTeamId?: string;
}
export type IRoomRegChanged = IRoomRegCreate | IRoomRegChangeInfo | IRoomRegDelete
    | IRoomRegPlayerJoinRoom | IRoomRegPlayerLeaveRoom | IRoomRegPlayerChangeTeam;

/**房间公共操作（跨服务器）*/
export class RoomHelper {

    public static getRedisClient: (reuseClient: boolean) => Promise<IRedisClient>;

    public static init(getRedisClient: (reuseClient: boolean) => Promise<IRedisClient>) {
        RoomHelper.getRedisClient = getRedisClient;
    }

    /**
     * 构建创建房间的相关信息（房间注册信息和初始的房间信息）
     *
     * @public
     * @param appId
     * @param gameServerNodeId
     * @param para
     * @returns
     */
    public static buildRoomInfo(appId: string, gameServerInfo: IGameServerInfo, para: ICreateRoomPara)
        : IRoomInfoPack {
        let roomId = para.roomId || buildGuid('Room_');

        let fixedTeamList: ITeamInfo[] | null = null;
        if (para.fixedTeamInfoList && para.fixedTeamInfoList.length) {
            //指定的队伍信息列表
            fixedTeamList = para.fixedTeamInfoList;
        } else if (para.fixedTeamCount) {
            //指定固定的队伍数量来生成
            fixedTeamList = [];
            for (let i = 0; i < para.fixedTeamCount; i++) {
                let id = (i + 1).toString();
                fixedTeamList.push({
                    id: (i + 1).toString(),
                    name: '队伍' + id,
                    minPlayers: para.fixedTeamMinPlayers ?? 1,
                    maxPlayers: para.fixedTeamMaxPlayers ?? para.maxPlayers,
                });
            }
        }

        let regInfo: IRoomRegInfo = {
            appId: appId,
            roomId: roomId,
            roomName: para.roomName,
            roomType: para.roomType,
            maxPlayers: para.maxPlayers,
            emptySeats: para.maxPlayers,
            expireTime: 0,
            ownerPlayerId: para.ownerPlayerId,
            gameServerNodeId: gameServerInfo.serverNodeId,
            createTime: Date.now(),
            teamsPlayerIds: [],
            isPrivate: para.isPrivate ? 1 : 0,
        };
        let roomInfo: IRoomInfo = {
            roomId: roomId,
            roomName: para.roomName,

            roomType: para.roomType,
            createType: ERoomCreateType.COMMON_CREATE,
            maxPlayers: para.maxPlayers,
            customProperties: para.customProperties,
            ownerPlayerId: para.ownerPlayerId,
            isPrivate: para.isPrivate,
            matcherKey: para.matcherKey,

            playerList: [],
            teamList: fixedTeamList ?? [],
            fixedTeamCount: fixedTeamList?.length,
            freeTeamMinPlayers: para.freeTeamMinPlayers,
            freeTeamMaxPlayers: para.freeTeamMaxPlayers,

            frameRate: 30,
            frameSyncState: EFrameSyncState.STOP,
            createTime: Date.now(),
            startGameTime: 0,
            retainEmptyRoomTime: para.retainEmptyRoomTime,
            retainOwnSeat: para.retainOwnSeat ?? false,

            randomRequirePlayerSyncStateInvMs: para.randomRequirePlayerSyncStateInvMs,
        }

        if (para.isPrivate) {
            // 私有房间, 先默认房间id可加入的模式
            roomInfo.privateRoomJoinMode = EPrivateRoomJoinMode.roomIdJoin;
            regInfo.privateRoomJoinMode = EPrivateRoomJoinMode.roomIdJoin;
            if (para.privateRoomJoinMode === EPrivateRoomJoinMode.password && para.privateRoomPassword) {
                // 有指定密码
                roomInfo.privateRoomJoinMode = EPrivateRoomJoinMode.password;
                regInfo.privateRoomJoinMode = EPrivateRoomJoinMode.password;
                regInfo.privateRoomPassword = para.privateRoomPassword;
            }
        }

        let roomOnlineInfo = GameServerHelper.buildRoomOnlineInfo(regInfo, gameServerInfo);

        return {
            regInfo,
            roomInfo,
            roomOnlineInfo,
        };
    }


    /**
     * 开始侦听全局的房间注册信息变更事件(跨服务器), 返回取消侦听的对象,需要自行保存!
     *
     * @deprecated 准备废弃！
     * @public
     * @param listen
     * @returns
     */
    public static async startListenRoomRegInfoChanged(listen: (changedInfo: IRoomRegChanged) => void): Promise<ICancelable> {
        let subscribeClient = await this.getRedisClient(false);
        await subscribeClient.subscribeObject<IRoomRegChanged>("RoomRegInfoChanged", listen);
        return {
            async cancel(): Promise<void> {
                await subscribeClient.disconnect();
            }
        };
    }


    /**
     * 根据房间情况，算出剩余空位数返回
     * @param roomInfo 
     * @returns room empty seats 
     */
    public static getRoomEmptySeats(roomInfo: IRoomInfo): number {
        let v = roomInfo.maxPlayers - roomInfo.playerList.length;

        if (roomInfo.ownerPlayerId && roomInfo.retainOwnSeat && !roomInfo.playerList.find(p => p.playerId === roomInfo.ownerPlayerId)
        ) {
            v--;
        }

        return v;
    }

}