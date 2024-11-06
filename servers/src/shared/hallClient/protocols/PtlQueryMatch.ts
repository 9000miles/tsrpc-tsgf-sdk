
import { EApiCryptoMode } from "../../tsgf/apiCrypto/Models";
import { IMatchResult } from "../../tsgf/match/Models";
import { BasePlayerRequest, BasePlayerResponse, BaseConf } from "./base";

/**
 * 查询匹配
*/
export interface ReqQueryMatch extends BasePlayerRequest {
    /**匹配请求ID，用于查询匹配结果，建议2秒调用查询一次，直到超时(因为请求时超时时间已知，客户端要加个超时判断)*/
    matchReqId: string;
}

export interface ResQueryMatch extends BasePlayerResponse {
    /**当前匹配是否有结果*/
    hasResult: boolean;
    /**如果匹配结果是失败的则有错误消息*/
    errMsg?: string;
    /**如果匹配结果是失败的则有错误码*/
    errCode?: number;
    /**匹配结果, 如果匹配有结果并且是成功的，则不为空*/
    matchResult?: IMatchResult;
}

export const conf: BaseConf = {
    cryptoMode: EApiCryptoMode.None,
}