
import { IMatcher } from "./IMatcher";
import { MatcherRequests } from "./MatcherRequests";
import { buildRoomJoinUsMatchRequest, EMatchProcType, IMatcherExecResult, IMatchFromRoomJoinUsOnServer, IMatchProc, IMatchRequest } from "./Models";
import { MatchRequestHelper } from "./MatchRequestHelper";
import { ErrorCodes, IResult, Result } from "../../tsgf/Result";
import { EMatchFromType, IMatchResult } from "../../tsgf/match/Models";
import { ERoomRegChangedType, IRoomInfoPack, IRoomRegChanged, RoomHelper } from "../room/RoomHelper";
import { arrRemoveItems, arrSum } from "../../tsgf/Utils";
import { logger } from "../../tsgf/logger";
import { ERoomCreateType, ICreateRoomPara, ITeamPlayerIds } from "../../tsgf/room/IRoomInfo";
import { IRoomRegInfo, teamPlayerIdsAdd, teamPlayerIdsAddSingle, teamPlayerIdsSubtractSingle } from "../room/Models";
import { IGameServerInfoInServer } from "../game/Models";
import { GameServerHelper } from "../game/GameServerHelper";
import { GameClusterTerminal } from "../gameCluster/GameClusterTerminal";

/**应用匹配请求处理器*/
export class AppMatchRequestHandler {

    public appId: string;
    /**本应用的所有匹配器，按匹配器标识字典*/
    public matchers: Map<string, IMatcher> = new Map<string, IMatcher>();
    /**本应用的所有匹配器下的匹配请求*/
    public allMatcherReqs: Map<string, MatcherRequests> = new Map<string, MatcherRequests>();
    /**本应用的所有匹配请求*/
    public allReqs: Map<string, IMatchRequest> = new Map<string, IMatchRequest>();
    /**公共的请求处理工具*/
    public reqHelper: MatchRequestHelper;

    /**本应用下的房间注册信息缓存, 由父级服务进行维护*/
    public roomRegInfos: Map<string, IRoomRegInfo> = new Map<string, IRoomRegInfo>();
    /**房间招人的匹配,一个房间只能存在一个匹配请求*/
    public roomJoinUsReq: Map<string, IMatchRequest> = new Map<string, IMatchRequest>();

    public gameClusterTerminal: GameClusterTerminal;

    protected pollMatchReqHd: any = null;
    protected pollProcTimeoutMatchReqHd: any = null;

    /**
     *
     * @param appId
     * @param reqHelper 公共的请求工具类
     * @param allotGameServer 设置一个分配游戏服务器的方法
     */
    constructor(appId: string, reqHelper: MatchRequestHelper, gameClusterTerminal: GameClusterTerminal) {
        this.appId = appId;
        this.reqHelper = reqHelper;
        this.reqHelper.listenMatchProc(this.appId, async (proc) => {
            await this.onNewAppMatchProc(proc);
        });
        this.gameClusterTerminal = gameClusterTerminal;
        this.startPollProcTimeoutReqs();
    }
    /**
     * 清除数据
     *
     * @public
     */
    public dispose() {
        this.reqHelper.stopListenMatchProc(this.appId);
        this.stopPollReqs();
        this.startPollProcTimeoutReqs();
    }

    public roomRegInfoChanged(regRoomChanged: IRoomRegChanged) {
        let roomJoinUsReq = this.roomJoinUsReq.get(regRoomChanged.regInfo.roomId);
        switch (regRoomChanged.changedType) {
            case ERoomRegChangedType.Create:
                this.roomRegInfos.set(regRoomChanged.regInfo.roomId, regRoomChanged.regInfo);
                break;
            case ERoomRegChangedType.ChangeInfo:
                this.roomRegInfos.set(regRoomChanged.regInfo.roomId, regRoomChanged.regInfo);
                break;
            case ERoomRegChangedType.Delete:
                this.roomRegInfos.delete(regRoomChanged.regInfo.roomId);
                if (roomJoinUsReq) {
                    //如果存在房间招人匹配,则同步删除匹配!
                    this.removeMatchRequestAndResult(roomJoinUsReq);
                }
                break;
            case ERoomRegChangedType.PlayerJoinRoom:
                if (roomJoinUsReq) {
                    //如果存在房间招人匹配,更新人数
                    let fromInfo = roomJoinUsReq.matchFromInfo as IMatchFromRoomJoinUsOnServer;
                    teamPlayerIdsAddSingle(fromInfo.teamsPlayerIds,
                        regRoomChanged.joinRoomPlayerId, regRoomChanged.teamId);
                    fromInfo.currPlayerCount = arrSum(fromInfo.teamsPlayerIds, t => t.playerIds.length);
                }
                break;
            case ERoomRegChangedType.PlayerLeaveRoom:
                if (roomJoinUsReq) {
                    //如果存在房间招人匹配,更新人数
                    let fromInfo = roomJoinUsReq.matchFromInfo as IMatchFromRoomJoinUsOnServer;
                    teamPlayerIdsSubtractSingle(fromInfo.teamsPlayerIds,
                        regRoomChanged.leaveRoomPlayerId, regRoomChanged.teamId);
                    fromInfo.currPlayerCount = arrSum(fromInfo.teamsPlayerIds, t => t.playerIds.length);
                }
                break;
            case ERoomRegChangedType.PlayerChangeTeam:
                if (roomJoinUsReq) {
                    //如果存在房间招人匹配,更新人数
                    let fromInfo = roomJoinUsReq.matchFromInfo as IMatchFromRoomJoinUsOnServer;
                    teamPlayerIdsSubtractSingle(fromInfo.teamsPlayerIds,
                        regRoomChanged.changePlayerId, regRoomChanged.oldTeamId);
                    teamPlayerIdsAddSingle(fromInfo.teamsPlayerIds,
                        regRoomChanged.changePlayerId, regRoomChanged.newTeamId);
                    fromInfo.currPlayerCount = arrSum(fromInfo.teamsPlayerIds, t => t.playerIds.length);
                }
                break;
        }
    }


    /**停止定时轮询请求*/
    protected stopPollReqs() {
        if (this.pollMatchReqHd) clearTimeout(this.pollMatchReqHd);
        this.pollMatchReqHd = null;
    }
    /**开始轮询所有请求*/
    protected startPollAllReqs() {
        this.stopPollReqs();
        this.pollMatchReqHd = setTimeout(async () => await this.pollAllReqs(), 1000);
    }
    /**执行轮询所有请求（给匹配器执行自己匹配器下的请求集合）*/
    protected async pollAllReqs(): Promise<void> {
        //处理一遍超时的
        await this.pollProcTimeoutReqs();

        if (this.allMatcherReqs.size > 0) {
            for (let [matcherKey, matcherReqs] of this.allMatcherReqs) {
                let matcher = this.matchers.get(matcherKey);
                if (!matcher || matcherReqs.length <= 0) continue;
                logger.log('AppMatchRequestMgr', `pollAllReqs: ${matcher.matcherKey},matcherReqsCount:${matcherReqs.length}`);
                let result = matcher.onPollMatcherReqs(matcherReqs.slice());
                await this.procMatcherExecResult(result, matcherReqs);
            }
        }
        //重新开始定时轮询
        this.startPollAllReqs();
    }

    /**新匹配请求添加进本管理器*/
    protected async addNewMatchReq(matchReq: IMatchRequest): Promise<MatcherRequests> {
        //更新请求相关字段
        matchReq.startMatchTime = Date.now();
        //添加到所有请求集合中
        this.allReqs.set(matchReq.matchReqId, matchReq);
        //添加到同匹配器下的请求集合中
        let matcherAllReqs = this.allMatcherReqs.get(matchReq.matcherKey);
        if (!matcherAllReqs) {
            matcherAllReqs = new MatcherRequests(matchReq.matcherKey);
            this.allMatcherReqs.set(matcherAllReqs.matcherKey, matcherAllReqs);
        }
        matcherAllReqs.push(matchReq);

        if (matchReq.matchFromType === EMatchFromType.RoomJoinUs) {
            //如果是房间招人匹配,特殊处理一下
            let existsJoinUsReq = this.roomJoinUsReq.get(matchReq.matchFromInfo.roomId);
            if (existsJoinUsReq) {
                //居然存在同房间还有其他的招人匹配!正常不应该,但出现了就设置为失败
                await this.faildMatchRequest(existsJoinUsReq, `被其他房间招人匹配覆盖！`, ErrorCodes.MatchRequestCancelled, matcherAllReqs);
            }
            //放在房间招人字典里,统一管理
            this.roomJoinUsReq.set(matchReq.matchFromInfo.roomId, matchReq);
        }

        return matcherAllReqs;
    }

    protected stopPollProcTimeoutReqs() {
        if (this.pollProcTimeoutMatchReqHd) clearTimeout(this.pollProcTimeoutMatchReqHd);
        this.pollProcTimeoutMatchReqHd = null;
    }
    protected startPollProcTimeoutReqs() {
        this.stopPollProcTimeoutReqs();
        this.pollProcTimeoutMatchReqHd = setTimeout(async () => await this.pollProcTimeoutReqs(), 1000);
    }
    /**处理超时的匹配(设置结果并移出管理)*/
    protected async pollProcTimeoutReqs(): Promise<void> {
        if (this.allMatcherReqs.size > 0) {
            let now = Date.now();
            let timeoutReqIds: IMatchRequest[] = [];
            for (let matcherKey of this.allMatcherReqs.keys()) {
                let matcherReqs = this.allMatcherReqs.get(matcherKey);
                let matcher = this.matchers.get(matcherKey);
                if (!matcher || !matcherReqs || matcherReqs.length <= 0) continue;
                for (let i = 0; i < matcherReqs.length; i++) {
                    let req = matcherReqs[i];
                    if (!req.matchTimeoutSec) continue;
                    if (req.startMatchTime + req.matchTimeoutSec * 1000 < now) {
                        //这个请求已经超时
                        timeoutReqIds.push(req);
                    }
                }
            }
            if (timeoutReqIds.length > 0) {
                await this.faildMatchRequests(timeoutReqIds, '匹配超时！', ErrorCodes.MatchTimeout);
            }
        }

        //重新开始定时轮询
        this.startPollProcTimeoutReqs();
    }

    /**当收到新匹配请求的处理*/
    protected async onNewAppMatchProc(matchProc: IMatchProc) {
        if (matchProc.procType === EMatchProcType.RequestMatch) {
            //收到新的匹配请求
            return await this.onNewAppMatchReq(matchProc.matchReqId);
        } else if (matchProc.procType === EMatchProcType.CancelMatch) {
            //收到取消匹配操作
            return await this.onCancelMatchReq(matchProc.matchReqId);
        }
    }
    protected async onNewAppMatchReq(matchReqId: string) {
        let matchReq = await this.reqHelper.getMatchRequest(this.appId, matchReqId);
        if (!matchReq) {
            //全局请求数据已经被删除,则忽略
            logger.warn('AppMatchRequestMgr', '匹配请求已经被删除!', this.appId, matchReqId);
            return;
        }
        let matcher = this.matchers.get(matchReq.matcherKey);
        if (!matcher) {
            //没实现的匹配器,设置匹配失败结果
            return await this.faildMatchRequest(matchReq, `没有对应的匹配器实现${matchReq.matcherKey}`, ErrorCodes.MatchMatcherNotFound);
        }
        if (matchReq.matchFromType === EMatchFromType.RoomJoinUs) {
            //如果是房间招人匹配, 则需要提交房间id
            if (!matchReq.matchFromInfo.roomId) {
                return await this.faildMatchRequest(matchReq, `matchFromInfo.roomId不能为空！`, ErrorCodes.ParamsError);
            }
        }

        //验证都通过了,加入匹配请求!
        let matcherAllReqs = await this.addNewMatchReq(matchReq);

        //停止定时轮询
        this.stopPollReqs();

        //匹配器执行得到结果
        logger.log('AppMatchRequestMgr', `onNewMatchReq:${matcher.matcherKey},matcherReqsCount:${matcherAllReqs.length}`);
        let ret = matcher.onNewMatchReq(matchReq, matcherAllReqs.slice());
        await this.procMatcherExecResult(ret, matcherAllReqs, matchReq);

        //重新开始定时轮询
        this.startPollAllReqs();

    }
    protected async onCancelMatchReq(matchReqId: string) {
        let matchReq: IMatchRequest | undefined | null = this.allReqs.get(matchReqId);
        if (!matchReq) {
            //如果不在本地，则尝试读取redis中的
            matchReq = await this.reqHelper.getMatchRequest(this.appId, matchReqId);
            if (!matchReq) {
                //还是没有，则忽略掉，当作已经完成取消！
                return;
            }
        }
        let matcherReqs = this.allMatcherReqs.get(matchReq.matcherKey);
        if (!matcherReqs) {
            matcherReqs = new MatcherRequests(matchReq.matcherKey);
            this.allMatcherReqs.set(matcherReqs.matcherKey, matcherReqs);
        }

        let result = Result.buildErr<IMatchResult>('请求被取消', ErrorCodes.MatchRequestCancelled);
        this.setMatchRequestResult(matchReq, result, matcherReqs);
    }



    /**
     * 处理匹配器执行结果
     *
     * @protected
     * @param result
     * @param matcherAllReqs 匹配器下的所有匹配请求, 只有在新的匹配请求且没对应匹配器时，才没得传！
     * @param currReq 针对单个匹配请求触发时
     * @returns
     */
    protected async procMatcherExecResult(result: IMatcherExecResult, matcherAllReqs?: MatcherRequests, currReq?: IMatchRequest): Promise<void> {
        if (result.resultErrCode || result.resultErrMsg) {
            result.resultErrMsg = result.resultErrMsg ?? '匹配失败';
            result.resultErrCode = result.resultErrCode ?? ErrorCodes.MatchUnknown;
            //有错误，并且有指定请求，才设置当前请求为失败
            if (currReq) {
                this.faildMatchRequest(currReq, result.resultErrMsg, result.resultErrCode);
                return;
            }
            if (matcherAllReqs) {
                for (let req of matcherAllReqs) {
                    this.faildMatchRequest(req, result.resultErrMsg, result.resultErrCode);
                }
                return;
            }
            return;
        }
        if (!result.hasResult) {
            //没结果直接返回
            return;
        }

        if (!matcherAllReqs) {
            //正常这里要传当前匹配器下的所有请求,如果没有
            logger.error(`AppMatchRequestMgr.procMatcherExecResult 都有结果了，还没传匹配器下所有匹配请求！`);
            return;
        }

        if (result.resultCreateRoom) {
            //匹配结果有创建房间
            for (let createRoomResult of result.resultCreateRoom) {
                if (createRoomResult.matchRequestPlayerResults.length <= 0) continue;
                let createRoomRet = await this.gameClusterTerminal.createRoom(
                    this.appId, createRoomResult.createRoomPara, ERoomCreateType.MATCH_CREATE);
                if (!createRoomRet.succ) {
                    createRoomResult.matchRequestPlayerResults.forEach(async reqPlayerResult => {
                        let req = matcherAllReqs.find(r => r.matchReqId === reqPlayerResult.matchReqId);
                        if (!req) return;
                        await this.faildMatchRequest(req, createRoomRet.err!, createRoomRet.code);
                    });
                    return;
                }

                let roomOnlineInfo = createRoomRet.data;

                let matchTeamsPlayerIds: ITeamPlayerIds[] = [];
                let firstReq!: IMatchRequest;
                //分派请求结果, 同时匹配结果的玩家信息转成队伍玩家的结构
                for (let reqPlayerResult of createRoomResult.matchRequestPlayerResults) {
                    let req = matcherAllReqs.find(r => r.matchReqId === reqPlayerResult.matchReqId);
                    if (!req) continue;
                    if (!firstReq) firstReq = req;

                    for (let playerRet of reqPlayerResult.matchPlayerResults) {
                        teamPlayerIdsAddSingle(matchTeamsPlayerIds, playerRet.playerId, playerRet.teamId);
                    }
                    let matchResult: IMatchResult = {
                        roomId: roomOnlineInfo.roomId,
                        gameServerUrl: roomOnlineInfo.gameServerUrl,
                        matchPlayerResults: reqPlayerResult.matchPlayerResults,
                    };
                    await this.succMatchRequest(req, matchResult, matcherAllReqs);
                }

                if (createRoomResult.roomJoinUsMatch) {
                    //创建好的房间,如果还需要继续招人匹配
                    //则构建匹配请求数据,并加入本管理(将在下个轮询或者下个新匹配时触发)
                    let useReq = firstReq;
                    let roomJoinUsReq =
                        buildRoomJoinUsMatchRequest(useReq, roomOnlineInfo.roomId, matchTeamsPlayerIds);
                    await this.addNewMatchReq(roomJoinUsReq);
                }
            }
        }

        if (result.resultJoinRoom) {
            //匹配结果有加入房间
            for (let joinRoomResult of result.resultJoinRoom) {
                //找到要加入的房间的注册信息
                let getRoomOLInfo = await this.gameClusterTerminal.getRoomOnlineInfo(joinRoomResult.joinRoomId);
                if (!getRoomOLInfo.succ) {
                    joinRoomResult.matchRequestPlayerResults.forEach(async reqPlayerResult => {
                        let req = matcherAllReqs.find(r => r.matchReqId === reqPlayerResult.matchReqId);
                        if (!req) return;
                        //房间已经被解散, 但因为对玩家来说是加入一个现有房间, 所以还是返回服务器爆满
                        await this.faildMatchRequest(req, getRoomOLInfo.err!, getRoomOLInfo.code);
                    });
                    return;
                }
                //要追加到房间的队伍玩家列表
                let matchTeamsPlayerIds: ITeamPlayerIds[] = [];

                //分派请求结果, 同时匹配结果的玩家信息转成队伍玩家的结构
                for (let reqPlayerResult of joinRoomResult.matchRequestPlayerResults) {
                    let req = matcherAllReqs.find(r => r.matchReqId === reqPlayerResult.matchReqId);
                    if (!req) continue;
                    for (let playerRet of reqPlayerResult.matchPlayerResults) {
                        teamPlayerIdsAddSingle(matchTeamsPlayerIds, playerRet.playerId, playerRet.teamId);
                    }
                    let matchResult: IMatchResult = {
                        roomId: joinRoomResult.joinRoomId,
                        gameServerUrl: getRoomOLInfo.data.gameServerUrl,
                        matchPlayerResults: reqPlayerResult.matchPlayerResults,
                    };
                    await this.succMatchRequest(req, matchResult, matcherAllReqs);
                }

                let roomJoinUsMatch = this.roomJoinUsReq.get(joinRoomResult.joinRoomId);
                if (roomJoinUsMatch) {
                    //这个房间存在招人匹配,则需要额外处理
                    let fromInfo = roomJoinUsMatch.matchFromInfo as IMatchFromRoomJoinUsOnServer;
                    //将结果中增加的匹配玩家,追加到这个房间的队伍玩家数据中
                    teamPlayerIdsAdd(fromInfo.teamsPlayerIds, matchTeamsPlayerIds);
                    if (!joinRoomResult.roomJoinUsMatch) {
                        //加入的房间,要求停止招人匹配,执行清除数据
                        this.removeMatchRequestAndResult(roomJoinUsMatch);
                    }
                }
            }
        }

    }

    /**
     * 设置匹配请求结果,并移除本地数据
     *
     * @protected
     * @param matchReq
     * @param result
     * @param matcherAllReqs 如果有获取好的匹配器所有请求,则传入
     * @returns
     */
    protected async setMatchRequestResult(matchReq: IMatchRequest, result: IResult<IMatchResult>, matcherAllReqs?: IMatchRequest[]): Promise<boolean> {
        if (!matcherAllReqs) {
            matcherAllReqs = this.allMatcherReqs.get(matchReq.matcherKey);
        }
        if (matcherAllReqs) {
            //匹配器请求中移除
            arrRemoveItems(matcherAllReqs, r => r.matchReqId === matchReq.matchReqId);
        }
        //从所有请求中移除
        this.allReqs.delete(matchReq.matchReqId);
        //如果是房间招人的匹配,则同步删除房间招人匹配列表
        if (matchReq.matchFromType === EMatchFromType.RoomJoinUs) {
            this.roomJoinUsReq.delete(matchReq.matchFromInfo.roomId);
        }
        //设置redis中的匹配结果
        return await this.reqHelper.setMatchRequestResult(this.appId, matchReq, result);
    }

    /**
     * 移除匹配请求数据(本地和redis), 只有在不需要结果的情况下,才直接删除(比如已经拿到结果 或者 系统类型取消如房间招人匹配)
     *
     * @protected
     * @param matchReq
     * @param matcherAllReqs 如果有获取好的匹配器所有请求,则传入
     * @returns
     */
    protected async removeMatchRequestAndResult(matchReq: IMatchRequest, matcherAllReqs?: IMatchRequest[]): Promise<void> {
        if (!matcherAllReqs) {
            matcherAllReqs = this.allMatcherReqs.get(matchReq.matcherKey);
        }
        if (matcherAllReqs) {
            //匹配器请求中移除
            arrRemoveItems(matcherAllReqs, r => r.matchReqId === matchReq.matchReqId);
        }
        //从所有请求中移除
        this.allReqs.delete(matchReq.matchReqId);
        //如果是房间招人的匹配,则同步删除房间招人匹配列表
        if (matchReq.matchFromType === EMatchFromType.RoomJoinUs) {
            this.roomJoinUsReq.delete(matchReq.matchFromInfo.roomId);
        }
        //删除redis中的数据
        return await this.reqHelper.removeMatchRequestAndResult(this.appId, matchReq.matchReqId);
    }

    /**
     * 设置匹配请求为失败
     *
     * @public
     * @param matchReq
     * @param errMsg
     * @param errCode 错误码请看 IMatcherExecResult 的注释
     * @param matcherAllReqs 如果有获取好的匹配器所有请求,则传入
     * @returns
     */
    public async faildMatchRequest(matchReq: IMatchRequest, errMsg: string, errCode: number, matcherAllReqs?: IMatchRequest[]): Promise<void> {
        await this.setMatchRequestResult(matchReq, Result.buildErr(errMsg, errCode), matcherAllReqs);
    }
    /**
     * 设置多个匹配请求为失败
     *
     * @public
     * @param matcherReqs
     * @param errMsg
     * @param errCode 错误码请看 IMatcherExecResult 的注释
     * @param matcherAllReqs 如果有获取好的匹配器所有请求,则传入
     * @returns
     */
    public async faildMatchRequests(matcherReqs: Array<IMatchRequest>, errMsg: string, errCode: number, matcherAllReqs?: IMatchRequest[]): Promise<void> {
        for (let req of matcherReqs) {
            await this.setMatchRequestResult(req, Result.buildErr(errMsg, errCode), matcherAllReqs);
        }
    }
    /**
     * 设置匹配请求为成功
     *
     * @public
     * @param matchReq
     * @param result
     * @param matcherAllReqs 如果有获取好的匹配器所有请求,则传入
     * @returns
     */
    public async succMatchRequest(matchReq: IMatchRequest, result: IMatchResult, matcherAllReqs?: IMatchRequest[]): Promise<void> {
        await this.setMatchRequestResult(matchReq, Result.buildSucc(result), matcherAllReqs);
    }
    /**
     * 设置多个匹配请求为成功
     *
     * @public
     * @param matcherReqs
     * @param result
     * @param matcherAllReqs 如果有获取好的匹配器所有请求,则传入
     * @returns
     */
    public async succMatchRequests(matcherReqs: Array<IMatchRequest>, result: IMatchResult, matcherAllReqs?: IMatchRequest[]): Promise<void> {
        for (let req of matcherReqs) {
            await this.setMatchRequestResult(req, Result.buildSucc(result), matcherAllReqs);
        }
    }
}