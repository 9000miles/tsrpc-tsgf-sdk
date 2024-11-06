
import { EApiCryptoMode } from "../../tsgf/apiCrypto/Models";
import { IMatchParamsFromPlayer,  } from "../../tsgf/match/Models";
import { BasePlayerRequest, BasePlayerResponse, BaseConf } from "./base";

/**
 * 请求匹配
*/
export interface ReqRequestMatch extends BasePlayerRequest {
    /**匹配参数*/
    matchParams: IMatchParamsFromPlayer;
}

export interface ResRequestMatch extends BasePlayerResponse {
    /**匹配请求ID，用于查询匹配结果，建议2秒调用查询一次，直到超时*/
    matchReqId: string;
}

export const conf: BaseConf = {
    cryptoMode: EApiCryptoMode.None,
}