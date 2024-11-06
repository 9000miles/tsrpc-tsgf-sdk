
import { serviceProto as hallServiceProto, ServiceType } from "./protocols/serviceProto";
import { IResult, Result } from "../tsgf/Result";
import { AHttpClient } from "../tsgf/AClient";
import { IMatchParamsFromPlayer, IMatchResult } from "../tsgf/match/Models";
import { ReqCreateRoom } from "./protocols/PtlCreateRoom";
import { ICreateRoomPara, IGetOrCreateRoomPara, IGetOrCreateRoomRsp, IRoomOnlineInfo, IRoomsFilterPara, IRoomsFilterRes } from "../tsgf/room/IRoomInfo";
import { logger } from "../tsgf/logger";

export type hallServiceType = ServiceType;

/**
 * 基础的大厅服务器api的客户端封装
 */
export class HallClient extends AHttpClient<hallServiceType>{

    constructor(serverUrl: string, timeout?: number) {
        super(hallServiceProto, {
            server: serverUrl,
            json: true,
            logger: logger,
            timeout,
        });

        this.client.flows.preCallApiFlow.push((v) => {
            return v;
        });
    }

    /**
     * 认证并返回尝试恢复玩家房间信息，如果玩家还被保留在房间中,则返回之前所在房间id,需要再调用GameClient的重连方法
     * @param playerId 
     * @param playerToken 
     * @param updateShowName 可更新玩家显示名 
     * @returns player room 
     */
    public async recoverPlayerRoom(playerId: string, playerToken: string, updateShowName?: string): Promise<IResult<IRoomOnlineInfo | null>> {
        const ret = await this.client.callApi("RecoverPlayerRoom", {
            playerId: playerId,
            playerToken: playerToken,
            updateShowName: updateShowName,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err.code ?? 1) as number);
        }
        return Result.buildSucc(ret.res.roomOnlineInfo);
    }

    /**
     * 创建房间，并获得分配的游戏服务器，得到后用游戏服务器客户端进行连接
     * @param playerToken 
     * @param createPa 
     * @returns 返回是否有错误消息,null表示成功
     */
    public async createRoom(playerToken: string, createPa: ICreateRoomPara): Promise<IResult<IRoomOnlineInfo>> {
        let para: ReqCreateRoom = createPa as ReqCreateRoom;
        para.playerToken = playerToken;
        const ret = await this.client.callApi("CreateRoom", para);
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err.code ?? 1) as number);
        }
        return Result.buildSucc(ret.res.roomOnlineInfo);
    }
    /**
     * 获取房间的在线信息，然后需要用游戏服务器客户端连接再加入房间
     * @param playerToken 
     * @param createPa 
     * @returns 返回是否有错误消息,null表示成功
     */
    public async getRoomOnlineInfo(playerToken: string, roomId: string): Promise<IResult<IRoomOnlineInfo>> {
        const ret = await this.client.callApi("GetRoomOnlineInfo", {
            playerToken: playerToken,
            roomId: roomId
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err.code ?? 1) as number);
        }
        return Result.buildSucc(ret.res.roomOnlineInfo);
    }
    /**
     * 获取或创建符合条件的房间
     * @param playerToken 
     * @param createPa 
     * @returns 返回是否有错误消息,null表示成功
     */
    public async getOrCreateRoom(playerToken: string, para: IGetOrCreateRoomPara): Promise<IResult<IGetOrCreateRoomRsp>> {
        const ret = await this.client.callApi("GetOrCreateRoom", {
            ...para,
            playerToken,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err.code ?? 1) as number);
        }
        return Result.buildSucc(ret.res);
    }

    /**
     * 请求匹配，返回匹配请求ID，用queryMatch查询匹配结果，建议2秒一次查询
     * @param playerToken 
     * @param matchParams 
     * @returns 返回是否有错误消息,null表示成功
     */
    public async requestMatch(playerToken: string, matchParams: IMatchParamsFromPlayer): Promise<IResult<string>> {
        const ret = await this.client.callApi("RequestMatch", {
            playerToken: playerToken,
            matchParams: matchParams,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err.code ?? 1) as number);
        }
        return Result.buildSucc(ret.res.matchReqId);
    }
    /**
     * 查询匹配结果, null表示结果还没出. 建议2秒一次查询. 因为请求时超时时间已知，所以客户端要做好请求超时判断
     * @param matchReqId 
     * @returns 返回结果对象
     */
    public async queryMatch(playerToken: string, matchReqId: string): Promise<IResult<IMatchResult> | null> {
        const ret = await this.client.callApi("QueryMatch", {
            playerToken: playerToken,
            matchReqId: matchReqId,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err.code ?? 1) as number);
        }
        if (!ret.res.hasResult) return null;
        if (ret.res.errMsg) {
            return Result.buildErr(ret.res.errMsg, ret.res.errCode);
        }
        if (ret.res.matchResult) {
            return Result.buildSucc(ret.res.matchResult);
        }
        return Result.buildErr("未知结果！");
    }
    /**
     * 取消匹配请求
     * @param matchReqId 
     * @returns 返回结果对象
     */
    public async cancelMatch(playerToken: string, matchReqId: string): Promise<IResult<null>> {
        const ret = await this.client.callApi("CancelMatch", {
            playerToken: playerToken,
            matchReqId: matchReqId,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err.code ?? 1) as number);
        }
        return Result.buildSucc(null);
    }

    /**
     * 筛选在线房间列表
     * @param playerToken 
     * @param filter 
     * @param [skip] 
     * @param [limit] 
     */
    public async filterRooms(playerToken: string, filter: IRoomsFilterPara, skip?: number, limit?: number): Promise<IResult<IRoomsFilterRes>> {
        const ret = await this.client.callApi("FilterRooms", {
            playerToken,
            filter,
            skip,
            limit,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err.code ?? 1) as number);
        }
        return Result.buildSucc(ret.res);
    }
    
    /**
     * 房主直接解散自己的房间
     * @param playerToken 
     * @param roomId 
     */
    public async ownDismissRoom(playerToken: string, roomId: string): Promise<IResult<IRoomOnlineInfo>> {
        const ret = await this.client.callApi("OwnDismissRoom", {
            playerToken: playerToken,
            roomId: roomId
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err.code ?? 1) as number);
        }
        return Result.buildSucc(ret.res.roomOnlineInfo);
    }
}