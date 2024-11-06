
import { IMatchParamsBase, IMatchParamsFromPlayer, EMatchFromType, IMatchResult, IMatchPlayerResult, IMatchFromRoomAllPlayers } from "../../tsgf/match/Models";
import { ErrorCodes, IResult } from "../../tsgf/Result";
import { ICreateRoomPara, ITeamPlayerIds } from "../../tsgf/room/IRoomInfo";
import { arrSum } from "../../tsgf/Utils";
import { buildGuid } from "../ServerUtils";

export interface IMatchFromRoomJoinUsOnServer {
    /**要人的房间ID*/
    roomId: string;
    /**当前应有玩家数量(匹配管理器会自动更新), 包含匹配进来(但可能还没连到服务器)和自主进入的玩家*/
    currPlayerCount: number;
    /**按队伍分组所有玩家(包含已经在房间的和匹配即将进房间的), 如果没队伍则只有一个元素,teamId=''*/
    teamsPlayerIds: ITeamPlayerIds[];
}
export interface IMatchParamsFromRoomJoinUsOnServer extends IMatchParamsBase {
    /**发起类型是房间招人*/
    matchFromType: EMatchFromType.RoomJoinUs;
    /**匹配发起的玩家信息*/
    matchFromInfo: IMatchFromRoomJoinUsOnServer;
}

//定义掩码数据结构加速队伍匹配计算
interface ITeamMatchPlayerMask {

}


export interface IMatchParamsFromPlayerOnServer extends IMatchParamsFromPlayer {
}


/**房间全玩家发起匹配的来源信息(服务端)*/
export interface IMatchFromRoomAllPlayersOnServer extends IMatchFromRoomAllPlayers {
    /**房间中的所有玩家id*/
    playerIds: string[];
    /**按队伍分组所有玩家(包含已经在房间的和匹配即将进房间的), 如果没队伍则只有一个元素,teamId=''*/
    teamsPlayerIds: ITeamPlayerIds[];
}
/**房间全玩家发起匹配的参数(服务端)*/
export interface IMatchParamsFromRoomAllPlayerOnServer extends IMatchParamsBase {
    /**发起类型是房间全玩家*/
    matchFromType: EMatchFromType.RoomAllPlayers;
    /**匹配发起的附加信息*/
    matchFromInfo: IMatchFromRoomAllPlayersOnServer;
}

/**来自玩家的匹配参数*/
export type IMatchRequestParamsFromPlayer =
    IMatchParamsFromPlayerOnServer
    | IMatchParamsFromRoomAllPlayerOnServer;

/**匹配请求发起的参数*/
export type IMatchRequestParams = IMatchParamsFromRoomJoinUsOnServer | IMatchRequestParamsFromPlayer;


/**匹配请求的基础字段(匹配参数被匹配服务器初始化后会附加的字段)*/
export type IMatchRequestBase = {
    /**匹配请求ID，到服务端时生成唯一ID*/
    matchReqId: string;
    /**请求匹配时间(毫秒级时间戳)*/
    requestTime: number;
    /**开始匹配时间(毫秒级时间戳)，只有匹配服务器收到请求后才有值*/
    startMatchTime: number;

    /**
     * 匹配请求分组标识, 所有因素组成这个分组标识, 不同的标识匹配不互通! 
     * 组成格式为: 匹配自定义类型_匹配器标识_maxPlayers_队伍相关配置
     * */
    matchReqGroupKey: string;
};

/**所有种类的匹配请求(服务器初始化后的)*/
export type IMatchRequest = IMatchRequestParams & IMatchRequestBase;
/**仅来自玩家的匹配请求(服务器初始化后的)*/
export type IMatchRequestFromPlayer = IMatchRequestParamsFromPlayer & IMatchRequestBase;

/**匹配操作类型*/
export enum EMatchProcType {
    /**发起匹配*/
    RequestMatch = 1,
    /**取消匹配*/
    CancelMatch = 2,
}
/**请求匹配操作*/
interface IRequestMatchProc {
    procType: EMatchProcType.RequestMatch;
    /**匹配请求ID, 匹配请求数据需调用 MatchRequestHelper 来获取全局匹配请求最新的数据 (防止请求先被取消,队列才收到)*/
    matchReqId: string;
}
/**取消匹配操作*/
interface ICancelMatchProc {
    procType: EMatchProcType.CancelMatch;
    matchReqId: string;
}

/**匹配操作*/
export type IMatchProc = IRequestMatchProc | ICancelMatchProc;


/**匹配器执行结果*/
export interface IMatcherExecResult {
    /**匹配是否有结果了*/
    hasResult: boolean;
    /**匹配结果错误时放错误消息*/
    resultErrMsg?: string | null;
    /**匹配结果错误时放错误码 */
    resultErrCode?: ErrorCodes;

    /**匹配结果中有创建房间的结果*/
    resultCreateRoom?: IMatcherExecResultCreateRoom[];
    /**匹配结果中要加入房间的结果*/
    resultJoinRoom?: IMatcherExecResultJoinRoom[];
}

/**匹配请求的玩家结果数据,一个匹配请求一个对象, 包含多个玩家结果*/
export interface IMatchRequestPlayerResults {
    matchReqId: string;
    matchPlayerResults: IMatchPlayerResult[];
}

/**匹配器执行结果有创建房间的操作*/
export interface IMatcherExecResultCreateRoom {
    /**创建房间的参数*/
    createRoomPara: ICreateRoomPara;
    /**匹配请求玩家结果数据*/
    matchRequestPlayerResults: IMatchRequestPlayerResults[];
    /**是否开启房间招人匹配(可能有的情况:原先就是房间招人匹配但没招满;玩家匹配满足最小人数但还没招满;)*/
    roomJoinUsMatch: boolean;
}
/**匹配器执行结果有加入房间的操作*/
export interface IMatcherExecResultJoinRoom {
    /**要加入的房间*/
    joinRoomId: string;
    /**匹配请求玩家结果数据*/
    matchRequestPlayerResults: IMatchRequestPlayerResults[];
    /**匹配结果表示要加入的那个房间, 是否应该继续招人匹配, 还是停止招人匹配*/
    roomJoinUsMatch: boolean;
}

/**匹配结果通知消息*/
export interface IMatchResultNotify {
    /**匹配请求*/
    request: IMatchRequest,

    /**匹配结果，失败的错误码*/
    result: IResult<IMatchResult>;
}

/**
 * 根据匹配参数生成匹配参数的分组标识
 *
 * @param params
 * @returns
 */
export function buildMatchGroupKey(params: IMatchRequestParams): string {
    //固定的参数
    let key = `${params.matchType ?? ''}_${params.matcherKey}_${params.maxPlayers}`;

    //开始队伍的部分
    if (params.teamParams) {
        if (params.teamParams.fixedTeamInfoList) {
            key += '_FixedTeam:'
                + params.teamParams.fixedTeamInfoList
                    .map(t => `${t.id}-${t.minPlayers}-${t.maxPlayers}`)
                    .join('|');
        } else if (params.teamParams.fixedTeamCount) {
            key += '_FixedTeam:';
            let sp = '';
            for (let i = 0; i < params.teamParams.fixedTeamCount; i++) {
                key += sp;
                sp = '|';
                key += `${i + 1}-${params.teamParams.fixedTeamMinPlayers}-${params.teamParams.fixedTeamMaxPlayers}`
            }
        } else if (params.teamParams.freeTeamMinPlayers && params.teamParams.freeTeamMaxPlayers) {
            key += `_FreeTeam:${params.teamParams.freeTeamMinPlayers}-${params.teamParams.freeTeamMaxPlayers}`;
        }
    }

    //返回
    return key;
}

/**
 * 初始化匹配参数,转为匹配请求
 *
 * @param matchParams
 * @returns
 */
export function initMatchRequest(matchParams: IMatchRequestParams, limit = true): IMatchRequest {
    let req: IMatchRequest = matchParams as IMatchRequest;
    req.matchReqId = buildGuid('MatchReq_');
    req.requestTime = Date.now();
    req.matchReqGroupKey = buildMatchGroupKey(matchParams);
    if (!req.matchTimeoutSec) req.matchTimeoutSec = 60;//设置默认60秒
    if (limit) {
        //默认需要限制参数
        if (req.matchTimeoutSec > 60) req.matchTimeoutSec = 60;//设置默认60秒
    }
    if (req.matchFromType === EMatchFromType.RoomJoinUs) {
        if (!req.matchFromInfo.teamsPlayerIds) {
            req.matchFromInfo.teamsPlayerIds = [{ teamId: '', playerIds: [] }];
        }
    }else{

    }
    return req;
}
/**
 * 根据一个来源的匹配请求以及房间相关信息,构造一个房间招人的匹配请求
 *
 * @param roomMatchReq
 * @param roomId
 * @param teamsPlayerIds
 * @returns
 */
export function buildRoomJoinUsMatchRequest(roomMatchReq: IMatchRequest, roomId: string, teamsPlayerIds: ITeamPlayerIds[]): IMatchRequest {
    let attr = Object.assign({}, roomMatchReq.matcherParams);
    let teamParams = roomMatchReq.teamParams ? Object.assign({}, roomMatchReq.teamParams) : undefined;
    let reqParams: IMatchRequestParams = {
        matchTimeoutSec: 999999,
        matcherKey: roomMatchReq.matcherKey,
        maxPlayers: roomMatchReq.maxPlayers,
        matcherParams: attr,
        matchFromType: EMatchFromType.RoomJoinUs,
        matchFromInfo: {
            roomId: roomId,
            currPlayerCount: arrSum(teamsPlayerIds, t => t.playerIds.length),
            teamsPlayerIds: teamsPlayerIds.slice(),
        },
        teamParams: teamParams,
    };
    //招人匹配不需要限制参数
    let req: IMatchRequest = initMatchRequest(reqParams, false);
    return req;
}