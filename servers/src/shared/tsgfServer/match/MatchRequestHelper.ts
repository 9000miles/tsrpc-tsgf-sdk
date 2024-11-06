
import { v4 } from "uuid";
import { IMatchResult } from "../../tsgf/match/Models";
import { IResult } from "../../tsgf/Result";
import { IQueue, RedisQueue } from "../Queue";
import { IRedisClient } from "../redisHelper";
import { IMatcherExecResult, IMatchResultNotify, IMatchRequest, IMatchProc, EMatchProcType } from "./Models";

/**匹配请求通用操作（跨服务器）*/
export class MatchRequestHelper {

    public getRedisClient: (reuseClient: boolean) => Promise<IRedisClient>;

    protected subscribeClient?: IRedisClient;
    protected matchRequestQueue: IQueue;

    constructor(getRedisClient: (reuseClient: boolean) => Promise<IRedisClient>) {
        this.getRedisClient = getRedisClient;
        this.matchRequestQueue = new RedisQueue(this.getRedisClient);
    }

    private static buildMatchRequestModelRedisKey(appId: string, reqId: string): string {
        return `MatchServer:AppMatchRequest:App_${appId}:ReqId_${reqId}:Model`;
    }
    private static buildMatchRequestLockRedisKey(appId: string, reqId: string): string {
        return `MatchServer:AppMatchRequest:App_${appId}:ReqId_${reqId}:Lock`;
    }
    private static buildMatchRequestResultRedisKey(appId: string, reqId: string): string {
        return `MatchServer:AppMatchRequest:App_${appId}:ReqId_${reqId}:Result`;
    }
    private static buildMatchProcQueueRedisKey(appId: string): string {
        return `MatchServer:AppMatchProc:App_${appId}:Queue`;
    }

    /**
     * [匹配服务器] 开始侦听匹配操作队列
     *
     * @public
     * @param appId
     * @param listen
     * @returns
     */
    public listenMatchProc(appId: string, listen: (req: IMatchProc) => void): void {
        let queueKey = MatchRequestHelper.buildMatchProcQueueRedisKey(appId);
        this.matchRequestQueue.listen<IMatchProc>(queueKey, listen);
    }
    /**
     * [匹配服务器] 停止侦听匹配操作队列
     *
     * @public
     * @param appId
     */
    public stopListenMatchProc(appId: string): void {
        let queueKey = MatchRequestHelper.buildMatchProcQueueRedisKey(appId);
        this.matchRequestQueue.stopListen(queueKey);
    }

    /**
     * [大厅服务器、游戏服务器] 推送请求匹配操作到队列
     *
     * @public
     * @param appId
     * @param req
     * @returns
     */
    public async pushRequestMatchProc(appId: string, req: IMatchRequest): Promise<void> {
        let modelKey = MatchRequestHelper.buildMatchRequestModelRedisKey(appId, req.matchReqId);
        let lockKey = MatchRequestHelper.buildMatchRequestLockRedisKey(appId, req.matchReqId);
        let redisTimeoutSec = (req.matchTimeoutSec ?? 60) + 600;//redis的过期时间为匹配请求过期时间再加10分钟
        let client = await this.getRedisClient(true);
        client.setObject(modelKey, req, redisTimeoutSec);
        //设置值为1，通过递减，并发的话值为0的只会有一个，来确保唯一处理结果
        client.setString(lockKey, "1", redisTimeoutSec);

        let queueKey = MatchRequestHelper.buildMatchProcQueueRedisKey(appId);
        let matchProc: IMatchProc = {
            procType: EMatchProcType.RequestMatch,
            matchReqId: req.matchReqId,
        };
        this.matchRequestQueue.push(queueKey, matchProc);
    }
    /**
     * [大厅服务器、游戏服务器] 推送取消匹配操作到队列
     *
     * @public
     * @param appId
     * @param matchReqId
     * @returns
     */
    public async pushCancelMatchProc(appId: string, matchReqId: string): Promise<void> {
        let queueKey = MatchRequestHelper.buildMatchProcQueueRedisKey(appId);
        let matchProc: IMatchProc = {
            procType: EMatchProcType.CancelMatch,
            matchReqId: matchReqId,
        };
        this.matchRequestQueue.push(queueKey, matchProc);
    }

    /**
     * [大厅服务器、游戏服务器、匹配服务器] 获取匹配请求
     *
     * @public
     * @param appId 
     * @param reqId 
     * @returns
     */
    public async getMatchRequest(appId: string, reqId: string): Promise<IMatchRequest | null> {
        let resultKey = MatchRequestHelper.buildMatchRequestModelRedisKey(appId, reqId);
        let ret = await (await this.getRedisClient(true)).getObject<IMatchRequest>(resultKey);
        if (!ret) return null;
        return ret as IMatchRequest;
    }

    /**
     * 设置请求结果，只有返回true才表示设置成功，false则表示其他并发抢去了，请忽略这次匹配结果，防止影响到抢下并发的逻辑
     * 使用 startListenMatchResult 来侦听全局匹配结果的消息
     *
     * @public
     * @param appId
     * @param req
     * @param result
     * @returns
     */
    public async setMatchRequestResult(appId: string, req: IMatchRequest, result: IResult<IMatchResult>): Promise<boolean> {
        let lockKey = MatchRequestHelper.buildMatchRequestLockRedisKey(appId, req.matchReqId);
        let redisClient = await this.getRedisClient(true);
        let inc = await redisClient.decr(lockKey);
        if (inc !== 0) {
            //成功递减为0的才表示抢下并发了，其他值则为并发落后了！
            return false;
        }
        //设置结果对象到redis
        let resultKey = MatchRequestHelper.buildMatchRequestResultRedisKey(appId, req.matchReqId);
        await redisClient.setObject(resultKey, result, 600);

        // 推送结果通知, 不需要等待
        this.pubMatchRequestResult(req, result);
        return true;
    }
    /**
     *推送匹配结果到订阅频道, 让所有订阅结果的地方都能收到, 独立的数据通道,其他redis键删掉也不影响结果频道获取数据
     *
     * @param req
     * @param result
     */
    public async pubMatchRequestResult(req: IMatchRequest, result: IResult<IMatchResult>){
        let redisClient = await this.getRedisClient(true);
        //将结果消息推送到订阅消息
        await redisClient.publishObject<IMatchResultNotify>("MatchRequestsResult", {
            request: req,
            result: result,
        });
    }
    /**
     * 获取匹配请求结果
     *
     * @public
     * @param appId 
     * @param reqId 
     * @returns
     */
    public async getMatchRequestResult(appId: string, reqId: string): Promise<IResult<IMatchResult> | null> {
        let resultKey = MatchRequestHelper.buildMatchRequestResultRedisKey(appId, reqId);
        let ret = await (await this.getRedisClient(true)).getObject<IResult<IMatchResult>>(resultKey);
        if (!ret) return null;
        return ret as IResult<IMatchResult>;
    }

    /**
     * 直接移除匹配请求和结果的redis数据, 由发起请求端调用(如果是终端发起,则终端拿到结果后删除, 如果是匹配服务发起,则匹配服务有结果后调用删除)
     *
     * @public
     * @param appId
     * @param reqId
     * @returns
     */
    public async removeMatchRequestAndResult(appId: string, reqId: string): Promise<void> {
        let removeKeys = [
            MatchRequestHelper.buildMatchRequestModelRedisKey(appId, reqId),
            MatchRequestHelper.buildMatchRequestLockRedisKey(appId, reqId),
            MatchRequestHelper.buildMatchRequestResultRedisKey(appId, reqId),
        ];
        await (await this.getRedisClient(true)).delete(...removeKeys);
    }


    /**
     * [大厅服务器、游戏服务器] 开始侦听全局的匹配请求结果的消息
     *
     * @public
     * @param listen
     * @returns
     */
    public async startListenMatchResult(listen: (notify: IMatchResultNotify) => void): Promise<void> {
        this.stopListenMatchResult();

        this.subscribeClient = await this.getRedisClient(false);
        await this.subscribeClient.subscribeObject<IMatchResultNotify>("MatchRequestsResult", item => listen(item));
    }

    /**
     * [大厅服务器、游戏服务器] 取消侦听全局的匹配请求结果
     *
     * @public
     * @returns
     */
    public async stopListenMatchResult(): Promise<void> {
        if (this.subscribeClient) {
            this.subscribeClient.unsubscribe("MatchRequestsResult");
            this.subscribeClient.disconnect();
            this.subscribeClient = undefined;
        }
    }

}