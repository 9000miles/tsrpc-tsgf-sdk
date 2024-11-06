import { WsClient } from "tsrpc";
import { IGameServerCfg } from "../../../ServerConfig";
import { ErrorCodes, IResult, Result } from "../../tsgf/Result";
import { IRoomInfo } from "../../tsgf/room/IRoomInfo";
import { ClusterNodeClient } from "../cluster/ClusterNodeClient";
import { EClusterClientType } from "../cluster/Models";
import { IGameServerInfoInServer } from "../game/Models";
import { IRoomRegInfo } from "../room/Models";
import { ERoomRegChangedType } from "../room/RoomHelper";
import { ServiceType as GameClusterServiceType, serviceProto as gameClusterServiceProto } from "./protocols/serviceProto";

export class GameClusterNodeClient extends ClusterNodeClient<GameClusterServiceType, IGameServerInfoInServer>{
    protected get nodeClient(): WsClient<GameClusterServiceType> | undefined {
        return this.clusterClient as WsClient<GameClusterServiceType> | undefined;
    }

    constructor(
        gameServerCfg: IGameServerCfg,
        getGameServerCfg: () => Promise<IGameServerCfg>,
        getServerClientCount: () => number
    ) {
        super(gameClusterServiceProto, gameServerCfg.clusterWSUrl, EClusterClientType.Node, gameServerCfg.clusterNodeId, gameServerCfg.clusterKey,
            async () => {
                let cfg = await getGameServerCfg();
                let serverInfo: IGameServerInfoInServer = {
                    serverNodeId: gameServerCfg.clusterNodeId,
                    serverName: cfg.serverName,
                    serverUrl: cfg.serverUrl,
                    clientCount: getServerClientCount(),
                    extendData: cfg.extendData,
                    allotRules: gameServerCfg.allotRules,
                };
                return serverInfo
            });
    }

    public async extractRoom(roomId: string): Promise<IResult<{ regInfo: IRoomRegInfo, roomInfo: IRoomInfo }>> {
        if (!this.nodeClient) return Result.buildErr('当前服务器断开！请稍后再试！', ErrorCodes.AuthUnverified);

        let ret = await this.nodeClient.callApi('NodeExtractRoom', { roomId });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc({
            regInfo: ret.res.roomRegInfo,
            roomInfo: ret.res.roomInfo,
        });
    }
    public async updateRoom(
        roomRegInfo: IRoomRegInfo,
        changedType: ERoomRegChangedType,
        playerId?: string,
        teamId?: string,
        oldTeamId?: string
    ): Promise<IResult<null>> {
        if (!this.nodeClient) return Result.buildErr('当前服务器断开！请稍后再试！', ErrorCodes.AuthUnverified);

        let ret = await this.nodeClient.callApi('NodeUpdateRoom', {
            roomRegInfo,
            changedType,
            playerId,
            teamId,
            oldTeamId,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc(null);
    }
    public async dismissRoom(roomId: string): Promise<IResult<IRoomRegInfo>> {
        if (!this.nodeClient) return Result.buildErr('当前服务器断开！请稍后再试！', ErrorCodes.AuthUnverified);

        let ret = await this.nodeClient.callApi('NodeDismissRoom', { roomId });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc(ret.res.roomRegInfo);
    }
}