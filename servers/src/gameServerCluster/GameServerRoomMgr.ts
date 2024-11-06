import { ErrorCodes, IResult, Result } from "../shared/tsgf/Result";
import { ICreateRoomPara, IGetOrCreateRoomPara, IRoomInfo, IRoomOnlineInfo, IRoomsFilterPara, IRoomsFilterRes } from "../shared/tsgf/room/IRoomInfo";
import { arrSkipAndLimit } from "../shared/tsgf/Utils";
import { GameServerHelper } from "../shared/tsgfServer/game/GameServerHelper";
import { IGameServerInfoInServer } from "../shared/tsgfServer/game/Models";
import { ReqNodeUpdateRoom } from "../shared/tsgfServer/gameCluster/protocols/PtlNodeUpdateRoom";
import { IRoomRegInfo } from "../shared/tsgfServer/room/Models";
import { ERoomRegChangedType, IRoomRegChanged, RoomHelper } from "../shared/tsgfServer/room/RoomHelper";
import { GameServerClusterMgr } from "./GameServerClusterMgr";

interface WaitExtractRoom {
    /**定时器句柄*/
    waitHD: any;
    /**房间完整信息*/
    roomInfo: IRoomInfo;
}

/**游戏服务器的房间管理*/
export class GameServerRoomMgr {

    protected clusterMgr: GameServerClusterMgr;

    /**所有房间的字典*/
    protected rooms: Map<string, IRoomRegInfo> = new Map();
    /**游戏服务器下的房间集合*/
    protected serverRooms: Map<string, Map<string, IRoomRegInfo>> = new Map();
    /**所有等待游戏服务器提取的房间信息*/
    protected waitExtractRooms: Map<string, WaitExtractRoom> = new Map();

    constructor(clusterMgr: GameServerClusterMgr) {
        this.clusterMgr = clusterMgr;
    }

    public getRoomRegInfo(roomId: string): IRoomRegInfo | null {
        let regInfo = this.rooms.get(roomId);
        if (!regInfo) return null;
        return regInfo;
    }
    public getRoomOnlineInfo(roomId: string): IRoomOnlineInfo | null {
        let roomRegInfo = this.rooms.get(roomId);
        if (!roomRegInfo) return null;

        return this.clusterMgr.buildRoomOnlineInfo(roomRegInfo);
    }

    protected createRoomByGameServer(
        appId: string,
        createRoomPara: ICreateRoomPara,
        allotGameServerInfo: IGameServerInfoInServer
    ): IResult<IRoomOnlineInfo> {
        let createInfo = RoomHelper.buildRoomInfo(appId, allotGameServerInfo, createRoomPara);

        this.rooms.set(createInfo.regInfo.roomId, createInfo.regInfo);
        let serverRooms = this.serverRooms.get(allotGameServerInfo.serverNodeId);
        if (!serverRooms) {
            serverRooms = new Map();
            this.serverRooms.set(allotGameServerInfo.serverNodeId, serverRooms);
        }
        serverRooms.set(createInfo.regInfo.roomId, createInfo.regInfo);
        //将房间信息放到等待提取
        let waitExtractHd = setTimeout(() => {
            this.dismissRoom(createInfo.regInfo.roomId);
        }, 5000);
        this.waitExtractRooms.set(createInfo.regInfo.roomId, {
            roomInfo: createInfo.roomInfo,
            waitHD: waitExtractHd,
        });

        // 推送变更给所有侦听器
        RoomHelper.getRedisClient(true).then(client => {
            client.publishObject('RoomRegInfoChanged', {
                changedType: ERoomRegChangedType.Create,
                regInfo: createInfo.regInfo,
            } as IRoomRegChanged);
        });

        return Result.buildSucc(createInfo.roomOnlineInfo);
    }
    /**
     * Creates room
     * @param appId 
     * @param createRoomPara 
     * @returns room 
     */
    public async createRoom(appId: string, createRoomPara: ICreateRoomPara): Promise<IResult<IRoomOnlineInfo>> {
        if (createRoomPara.roomId && this.rooms.get(createRoomPara.roomId)) {
            return Result.buildErr('roomId已存在！', ErrorCodes.RoomIdExists);
        }

        let allotGameServerInfo = await this.allotGameServer(createRoomPara);
        if (!allotGameServerInfo) {
            return Result.buildErr('服务器爆满！', ErrorCodes.RoomNoServerAvailable);
        }
        return this.createRoomByGameServer(appId, createRoomPara, allotGameServerInfo);
    }

    /**
     * 让集群创建房间后，游戏服务器来提取房间信息（只能提取一次），超时未提取释放也会返回为null
     * @param roomId 
     * @returns room 
     */
    public extractRoom(roomId: string): { roomInfo: IRoomInfo, regInfo: IRoomRegInfo } | null {
        let regInfo = this.rooms.get(roomId);
        if (!regInfo) return null;
        let waitExInfo = this.waitExtractRooms.get(roomId);
        if (!waitExInfo) return null;
        clearTimeout(waitExInfo.waitHD);
        this.waitExtractRooms.delete(roomId);
        let roomInfo = waitExInfo.roomInfo;
        return {
            regInfo,
            roomInfo,
        };
    }

    /**
     * Updates room info
     * @param roomRegInfo 
     * @returns true if room info 
     */
    public updateRoomInfo(updateInfo: ReqNodeUpdateRoom): boolean {
        let regInfo = this.rooms.get(updateInfo.roomRegInfo.roomId);
        if (!regInfo) return false;

        Object.assign(regInfo, updateInfo.roomRegInfo);

        // 推送变更给所有侦听器
        RoomHelper.getRedisClient(true).then(client => {
            client.publishObject('RoomRegInfoChanged', {
                changedType: updateInfo.changedType,
                regInfo: regInfo,
                joinRoomPlayerId: updateInfo.playerId,
                leaveRoomPlayerId: updateInfo.playerId,
                changePlayerId: updateInfo.playerId,
                teamId: updateInfo.teamId,
                newTeamId: updateInfo.teamId,
                oldTeamId: updateInfo.oldTeamId,
            } as IRoomRegChanged);
        });
        return true;
    }

    /**
     * （清理）解散指定房间
     * @param roomId 
     * @param [clearServerRooms] 
     * @returns  
     */
    public dismissRoom(roomId: string, clearServerRooms = true): IRoomRegInfo | null {
        let regInfo = this.rooms.get(roomId);
        if (!regInfo) return null;
        this.rooms.delete(roomId);
        let waitExInfo = this.waitExtractRooms.get(roomId);
        if (waitExInfo) {
            clearTimeout(waitExInfo.waitHD);
            this.waitExtractRooms.delete(roomId);
        }
        if (clearServerRooms) {
            let serverRooms = this.serverRooms.get(regInfo.gameServerNodeId);
            if (serverRooms) serverRooms.delete(roomId);
        }

        RoomHelper.getRedisClient(true).then(client => {
            client.publishObject('RoomRegInfoChanged', {
                changedType: ERoomRegChangedType.Delete,
                regInfo: regInfo,
            } as IRoomRegChanged);
        });

        return regInfo;
    }
    /**
     * （清理）解散服务器下所有房间
     * @param serverNodeId 
     * @returns  
     */
    public dismissServerRooms(serverNodeId: string) {
        let serverRooms = this.serverRooms.get(serverNodeId);
        if (!serverRooms) return;
        this.serverRooms.delete(serverNodeId);
        for (let [roomId, regInfo] of serverRooms) {
            this.dismissRoom(roomId, false);
        }
        serverRooms.clear();
    }

    protected async allotGameServer(createRoomPara: ICreateRoomPara): Promise<IGameServerInfoInServer | null> {
        let nodeInfos = this.clusterMgr.getNodeInfos();
        let result = await this.clusterMgr.allotGameServerByInfos(nodeInfos, (snid) => {
            let rooms = this.serverRooms.get(snid)?.values();
            if (!rooms) return Promise.resolve([]);
            return Promise.resolve([...rooms]);
        }, createRoomPara);
        return result;
    }


    /**
     * 按规则匹配一个服务器下的房间,没有则自动分配一个合适的服务器用来创建房间, 没有合适的返回null
     * @param getOrCreateRoomPara 指定分配规则标识, 放空则分配最少客户端的服务器
     * @returns match 开头的为匹配到的房间对应所属服务器
     */
    public async getOrAllotGameServer(
        appId: string, getOrCreateRoomPara: IGetOrCreateRoomPara
    ): Promise<IResult<{
        matchRoomOnlineInfoList?: IRoomOnlineInfo[],
        createRoomOnlineInfo?: IRoomOnlineInfo,
    }>> {

        if (!getOrCreateRoomPara.matchLimitRoomCount || getOrCreateRoomPara.matchLimitRoomCount <= 0) {
            getOrCreateRoomPara.matchLimitRoomCount = 3;
        }

        let serverList = this.clusterMgr.getNodeInfos();
        let getServerRooms = async (snid: string) => {
            let rooms = this.serverRooms.get(snid)?.values();
            if (!rooms) return Promise.resolve([]);
            return Promise.resolve([...rooms]);
        };
        //先遍历看是否存在匹配的房间可用
        let matchRoomOnlineInfoList: IRoomOnlineInfo[] = [];
        for (const s of serverList) {
            // 检查现有房间符合规则的数量
            let rooms = await getServerRooms(s.info.serverNodeId);
            // 筛选本服务器下匹配条件的房间
            let matchRooms = rooms.filter(r => {
                //满人的房间先剔除
                if (r.emptySeats <= 0) return false;
                //其他看筛选条件
                if (getOrCreateRoomPara.matchRoomType
                    && getOrCreateRoomPara.createRoomPara.roomType !== r.roomType) return false;
                if (getOrCreateRoomPara.matchMaxPlayers
                    && getOrCreateRoomPara.createRoomPara.maxPlayers !== r.maxPlayers) return false;
                //都符合,则匹配
                return true;
            });
            if (matchRooms.length) {
                let limit = getOrCreateRoomPara.matchLimitRoomCount - matchRoomOnlineInfoList.length;
                if (matchRooms.length > limit) {
                    matchRooms = matchRooms
                        // 排序一下, 空位多的放前面
                        .sort((a, b) => b.emptySeats - a.emptySeats)
                        .slice(0, limit);
                }
                matchRoomOnlineInfoList.push(
                    ...matchRooms.map(r => GameServerHelper.buildRoomOnlineInfo(r, s.info)));

                if (matchRoomOnlineInfoList.length >= getOrCreateRoomPara.matchLimitRoomCount) {
                    //要的数量已满
                    break;
                }
            }
        }
        if (matchRoomOnlineInfoList.length) {
            // 有匹配到的房间
            return Result.buildSucc({ matchRoomOnlineInfoList, });
        }

        let createRet = await this.createRoom(appId, getOrCreateRoomPara.createRoomPara);
        if (!createRet.succ) {
            return Result.transition(createRet);
        }
        return Result.buildSucc({ createRoomOnlineInfo: createRet.data });
    }

    /**
     * Filters rooms by list
     * @param regInfos 
     * @param filter 
     * @param [skip] 
     * @param [limit] 
     * @returns rooms by list 
     */
    public filterRoomsByList(regInfos: IterableIterator<IRoomRegInfo>, filter: IRoomsFilterPara, skip?: number, limit?: number): IRoomsFilterRes {
        let matchRegInfos: IRoomRegInfo[] = [];
        for (let regInfo of regInfos) {
            if (filter.roomType !== undefined && filter.roomType !== regInfo.roomType) continue;
            if (filter.maxPlayers !== undefined && filter.maxPlayers !== regInfo.maxPlayers) continue;
            if (filter.roomNameFullMatch !== undefined && filter.roomNameFullMatch !== regInfo.roomName) continue;
            if (filter.roomNameLike !== undefined && !regInfo.roomName.includes(filter.roomNameLike)) continue;
            matchRegInfos.push(regInfo);
        }
        let rooms = arrSkipAndLimit(matchRegInfos, skip, limit).map(r => this.clusterMgr.buildRoomOnlineInfo(r));
        return {
            count: matchRegInfos.length,
            rooms,
        }
    }
    /**
     * Filters rooms
     * @param filter 
     * @param [skip] 
     * @param [limit] 
     * @returns rooms 
     */
    public filterRooms(filter: IRoomsFilterPara, skip?: number, limit?: number): IRoomsFilterRes {
        return this.filterRoomsByList(this.rooms.values(), filter, skip, limit);
    }
}