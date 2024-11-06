
import { EMatchFromType, IMatchResult } from "../../tsgf/match/Models";
import { ErrorCodes, IResult, Result } from "../../tsgf/Result";
import { MatchRequestHelper } from "./MatchRequestHelper";
import { IMatchRequestParams, IMatchResultNotify, initMatchRequest } from "./Models";
import { IRedisClient } from "../redisHelper";

export type MatchRequestFinishEvent = (result: IResult<IMatchResult>) => void;

/**匹配请求服务终端，由大厅或游戏服务实例使用。
 * 大厅服务器无状态服务使用
 * 游戏服务器有状态服务使用，让房间中的玩家也可以发起匹配并实时收到匹配结果并广播
 * */
export class MatchRequestTerminal {

    private reqHelper: MatchRequestHelper;
    /**是否启用状态服务，启用则本地不存储当前请求的状态，统一查询redis，HTTP服务部署用的*/
    private useStateServer: boolean;
    /**当前匹配中请求的结果回调，请求ID=>结果回调, 但如果是分布式HTTP服务（无状态），则不能将临时数据保存在服务器*/
    protected matchReqsResultCallback: Map<string, MatchRequestFinishEvent> = new Map<string, MatchRequestFinishEvent>();


    /**
     *
     * @param getRedisClient
     * @param useStateServer 是否启用状态服务部署，无状态则本地不存储当前请求的状态，统一查询redis，HTTP服务部署用的
     */
    constructor(getRedisClient: (reuseClient: boolean) => Promise<IRedisClient>, useStateServer: boolean) {
        this.reqHelper = new MatchRequestHelper(getRedisClient);
        this.useStateServer = useStateServer;
    }

    public async start(): Promise<void> {
        if (this.useStateServer) {
            await this.reqHelper.startListenMatchResult((notify) => {
                this.procGlobalMatchResultNotify(notify);
            });
        }
    }
    public async stop(): Promise<void> {
        if (this.useStateServer) {
            await this.reqHelper.stopListenMatchResult();
        }
    }
    protected procGlobalMatchResultNotify(notify: IMatchResultNotify) {
        let resultCallback = this.matchReqsResultCallback.get(notify.request.matchReqId);
        if (resultCallback) {
            resultCallback(notify.result);
        }
    }



    /**
     * 请求一次匹配, 返回匹配请求ID，用于查询请求结果
     *
     * @public
     * @param appId
     * @param matchParams
     * @param callback 只有状态服务的终端(useStateServer=true),才可以设置结果回调,如大厅服务需要自己轮询查询结果
     * @param limit 是否限制请求参数, 来自服务端构建的则不需要限制, 比如房间招人匹配
     * @returns
     */
    public async requestMatch(appId: string, matchParams: IMatchRequestParams, callback?: (result: IResult<IMatchResult>) => void, limit = true)
        : Promise<IResult<string>> {
        let req = initMatchRequest(matchParams, limit);
        await this.reqHelper.pushRequestMatchProc(appId, req);
        if (this.useStateServer) {
            //如果是有状态服务，则保存到本地，设置回调，接收到后回调
            if (callback) {
                //有设置回调才这样处理
                this.matchReqsResultCallback.set(req.matchReqId, (result) => {
                    this.matchReqsResultCallback.delete(req.matchReqId);
                    // 结果回来了就
                    this.reqHelper.removeMatchRequestAndResult(appId, req.matchReqId);
                    callback(result);
                });
            }
        }
        return Result.buildSucc(req.matchReqId);
    }

    /**
     * [无状态服务专用] 查询匹配结果，如果有结果则完成本次匹配请求（会清理本次请求的所有数据，即下次再查询就获取不到结果了）
     *
     * @public
     * @param appId
     * @param matchReqId
     * @returns 还没有结果则返回null，如果有结果则返回结果的IResult
     */
    public async queryMatch(appId: string, matchReqId: string): Promise<IResult<IMatchResult> | null> {
        if (this.useStateServer) {
            throw Error("有状态服务，不可单独使用查询，因为请求时已经设置了回调，结果将走回调，这里查询不到！");
        }
        let result = await this.reqHelper.getMatchRequestResult(appId, matchReqId);
        if (!result) return null;
        // 查询到结果了, 把匹配请求和结果数据都删除
        await this.reqHelper.removeMatchRequestAndResult(appId, matchReqId);
        return result;
    }
    /**
     * 取消匹配
     *
     * @public
     * @param appId
     * @param matchReqId
     * @returns
     */
    public async cancelMatch(appId: string, matchReqId: string, currPlayerId?: string): Promise<IResult<null>> {

        let req = await this.reqHelper.getMatchRequest(appId, matchReqId);
        if (!req) {
            //匹配请求已经不存在，则直接认为成功
            return Result.buildSucc(null);
        }
        switch (req.matchFromType) {
            case EMatchFromType.RoomJoinUs:
                //return Result.buildErr('房间匹配由房间属性自动启动匹配，不能手动开始匹配或取消！', ErrorCodes.ParamsError);
                break;
            case EMatchFromType.Player: {
                let fromInfo = req.matchFromInfo;
                if (!currPlayerId || !fromInfo.playerIds.includes(currPlayerId)) {
                    return Result.buildErr('只有匹配的玩家才可以取消匹配！', ErrorCodes.MatchPermissionDenied);
                }
                break;
            }
            case EMatchFromType.RoomAllPlayers: {
                let fromInfo = req.matchFromInfo;
                if (!currPlayerId || !fromInfo.playerIds.includes(currPlayerId)) {
                    return Result.buildErr('只有匹配的玩家才可以取消匹配！', ErrorCodes.MatchPermissionDenied);
                }
                break;
            }
        }

        //将取消匹配操作推入队列，让匹配服务器接收处理(清理数据)
        await this.reqHelper.pushCancelMatchProc(appId, matchReqId);
        return Result.buildSucc(null);
    }

}