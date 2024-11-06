import { WsClient } from "tsrpc";
import { ErrorCodes, IResult, Result } from "../../tsgf/Result";
import { ERoomCreateType, ICreateRoomPara, IGetOrCreateRoomPara, IGetOrCreateRoomRsp, IRoomOnlineInfo, IRoomsFilterPara, IRoomsFilterRes } from "../../tsgf/room/IRoomInfo";
import { ClusterNodeClient } from "../cluster/ClusterNodeClient";
import { EClusterClientType } from "../cluster/Models";
import { IGameServerInfoInServer } from "../game/Models";
import { IRoomRegInfo } from "../room/Models";
import { ServiceType as GameClusterServiceType, serviceProto as gameClusterServiceProto } from "./protocols/serviceProto";

export class GameClusterTerminal extends ClusterNodeClient<GameClusterServiceType, IGameServerInfoInServer>{

    protected get terminalClient(): WsClient<GameClusterServiceType> | undefined {
        return this.clusterClient as WsClient<GameClusterServiceType> | undefined;
    }

    constructor(
        clusterServerUrl: string, terminalId: string, terminalKey: string
    ) {
        super(gameClusterServiceProto, clusterServerUrl, EClusterClientType.Terminal, terminalId, terminalKey);
    }



    public async createRoom(appId: string, createRoomPara: ICreateRoomPara, createType: ERoomCreateType): Promise<IResult<IRoomOnlineInfo>> {
        if (!this.terminalClient) return Result.buildErr('当前服务器断开！请稍后再试！', ErrorCodes.AuthUnverified);

        let ret = await this.terminalClient.callApi('TerminalCreateRoom', {
            ...createRoomPara,
            appId,
            createType,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc(ret.res.roomOnlineInfo);
    }
    /**
     * 要求集群解散房间
     * @param roomId 
     * @returns room 
     */
    public async dismissRoom(roomId: string): Promise<IResult<IRoomOnlineInfo>> {
        if (!this.terminalClient) return Result.buildErr('当前服务器断开！请稍后再试！', ErrorCodes.AuthUnverified);

        let ret = await this.terminalClient.callApi('TerminalDismissRoom', { roomId });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc(ret.res.roomOnlineInfo);
    }
    /**
     * 获取房间在线信息
     * @param roomId 
     * @returns room 
     */
    public async getRoomOnlineInfo(roomId: string): Promise<IResult<IRoomOnlineInfo>> {
        if (!this.terminalClient) return Result.buildErr('当前服务器断开！请稍后再试！', ErrorCodes.AuthUnverified);

        let ret = await this.terminalClient.callApi('TerminalGetRoomOnlineInfo', { roomId });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc(ret.res.roomOnlineInfo);
    }

    /**
     * Gets or create room
     * @param appId 
     * @param getOrCreateRoomPara 
     * @returns or create room 
     */
    public async getOrCreateRoom(appId: string, getOrCreateRoomPara: IGetOrCreateRoomPara): Promise<IResult<IGetOrCreateRoomRsp>> {
        if (!this.terminalClient) return Result.buildErr('当前服务器断开！请稍后再试！', ErrorCodes.AuthUnverified);

        let ret = await this.terminalClient.callApi('TerminalGetOrCreateRoom', { 
            ...getOrCreateRoomPara,
            appId,
         });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc(ret.res);
    }
    
    /**
     * Filters rooms
     * @param filter 
     * @param [skip] 
     * @param [limit] 
     * @returns rooms 
     */
    public async filterRooms(
        filter: IRoomsFilterPara,
        skip?: number,
        limit?: number
    ): Promise<IResult<IRoomsFilterRes>> {
        if (!this.terminalClient) return Result.buildErr('当前服务器断开！请稍后再试！', ErrorCodes.AuthUnverified);

        let ret = await this.terminalClient.callApi('TerminalFilterRoom', { filter,skip,limit });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc(ret.res);
    }
}