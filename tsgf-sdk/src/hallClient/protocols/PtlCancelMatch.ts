import { EApiCryptoMode } from "../../tsgf/apiCrypto/Models";
import { BasePlayerRequest, BasePlayerResponse, BaseConf } from "./base";

/**
 * 取消匹配
*/
export interface ReqCancelMatch extends BasePlayerRequest {
    /**非房间发起的匹配，发起匹配请求中的所有玩家都可以取消*/
    matchReqId: string;
}

export interface ResCancelMatch extends BasePlayerResponse {
}

export const conf: BaseConf = {
    cryptoMode:EApiCryptoMode.None,
}