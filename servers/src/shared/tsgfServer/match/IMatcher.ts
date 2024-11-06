import { MatcherRequests } from "./MatcherRequests";
import { IMatcherExecResult, IMatchRequest } from "./Models";

/**匹配器接口*/
export interface IMatcher {
    /**匹配器标识*/
    matcherKey: string;

    /**
     * 当收到新的匹配请求, 这里应优先匹配快过期的
     *
     * @param allReqs 同匹配器的所有匹配请求
     * @param currMatchReq 当前匹配请求
     * @returns
     */
    onNewMatchReq(currMatchReq: IMatchRequest, allReqs: IMatchRequest[]): IMatcherExecResult;

    /**
     * 同匹配器下只要还存在请求，则会定时轮询, 这里应优先匹配快过期的
     *
     * @param allReqs 同匹配器的所有匹配请求
     * @returns
     */
    onPollMatcherReqs(allReqs: IMatchRequest[]): IMatcherExecResult;
}