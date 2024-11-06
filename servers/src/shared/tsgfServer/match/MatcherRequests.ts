import { IMatchRequest } from "./Models";


/**同匹配器下的所有匹配请求*/
export class MatcherRequests extends Array<IMatchRequest>{
    /**匹配分区标识，不同分区之间数据不互通*/
    protected _matcherKey: string;
    public get matcherKey(): string {
        return this._matcherKey;
    }

    /**集合内的请求字典,请求ID=>请求对象*/
    public readonly requestMap: Map<string, IMatchRequest> = new Map<string, IMatchRequest>();

    constructor(matchZoneKey: string) {
        super();
        this._matcherKey = matchZoneKey;
    }

    /**
     * 加入请求
     * @param matchReq 
     */
    public addRequest(matchReq: IMatchRequest): void {
        this.removeRequest(matchReq.matchReqId);
        this.requestMap.set(matchReq.matchReqId, matchReq);
        this.push(matchReq);
    }
    /**
     * 移除指定请求
     * @param matchReqId 
     */
    public removeRequest(matchReqId: string): void {
        this.requestMap.delete(matchReqId);
        this.remove(c => c.matchReqId == matchReqId);
    }

    /**清除所有请求*/
    public clearAllRequests(): void {
        this.requestMap.clear();
        this.length = 0;
    }
}