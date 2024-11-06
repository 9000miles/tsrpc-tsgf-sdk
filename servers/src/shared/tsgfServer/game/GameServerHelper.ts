import { IGameServerInfo } from "../../hallClient/Models";
import { ICancelable } from "../../tsgf/ICancelable";
import { ICreateRoomPara, IGetOrCreateRoomPara, IRoomOnlineInfo } from "../../tsgf/room/IRoomInfo";
import { arrWinner } from "../../tsgf/Utils";
import { ClusterMgr, IClusterNodeInfo } from "../cluster/ClusterMgr";
import { IRedisClient } from "../redisHelper";
import { IRoomRegInfo } from "../room/Models";
import { RoomHelper } from "../room/RoomHelper";
import { IGameServerInfoInServer } from "./Models";

/**游戏服务器跨服操作类*/
export class GameServerHelper {

    private static getRedisClient: (reuseClient: boolean) => Promise<IRedisClient>;
    public static init(getRedisClient: (reuseClient: boolean) => Promise<IRedisClient>) {
        GameServerHelper.getRedisClient = getRedisClient;
    }

    public static readonly clusterTypeKey = 'GameServer';

    /**
     * 从redis中获取所有游戏服务器的分布式信息。分布式时，大厅服务器和游戏服务器管理节点，可能不在一个服务实例上，所以使用本方法来跨服获取
     *
     * @public
     * @typeParam NodeInfo
     * @param clusterTypeKey 集群类型标识，用在各种场合进行区分的。需要和构造ClussterMgr时的值一致
     * @returns
     */
    public static async getAllServersClusterInfoFromRedis(): Promise<IClusterNodeInfo<IGameServerInfoInServer>[]> {
        let list = await ClusterMgr.getNodeInfosFromRedis<IGameServerInfoInServer>(GameServerHelper.clusterTypeKey, GameServerHelper.getRedisClient);
        return list;
    }


    /**
     * Builds online room info
     * @param roomRegInfo 
     * @param gameServerInfo 
     * @returns online room info 
     */
    public static buildRoomOnlineInfo(roomRegInfo: IRoomRegInfo, gameServerInfo?: IGameServerInfo): IRoomOnlineInfo {
        return {
            roomId: roomRegInfo.roomId,
            ownerPlayerId: roomRegInfo.ownerPlayerId,
            roomName: roomRegInfo.roomName,
            roomType: roomRegInfo.roomType,
            maxPlayers: roomRegInfo.maxPlayers,
            emptySeats: roomRegInfo.emptySeats,
            privateRoomJoinMode: roomRegInfo.privateRoomJoinMode,
            isPrivate: roomRegInfo.isPrivate === 1,
            gameServerUrl: gameServerInfo?.serverUrl || '',
            currGameServerPlayers: gameServerInfo?.clientCount ?? 0,
        };
    }


}