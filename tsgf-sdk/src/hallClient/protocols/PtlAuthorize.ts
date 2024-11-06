import { EApiCryptoMode, IAppEncryptRequest, IAppEncryptRequestT, IBaseEncryptRequestData } from "../../tsgf/apiCrypto/Models";
import { BasePlayerRequest, BasePlayerResponse, BaseConf } from "./base";

/**
 * 玩家获取认证信息(原始请求对象)
*/
export interface ReqAuthorize extends IAppEncryptRequest {
}
/**
 * 玩家获取认证信息(服务端解密后的请求对象)
 * */
export interface ReqAuthorizeT extends IAppEncryptRequestT<ReqAuthorizeData> {
}

export interface ReqAuthorizeData extends IBaseEncryptRequestData{
    /**应用自定义玩家ID，由app自定义唯一标识（app内唯一）。只能由数字、字母、下划线、连接线组成*/
    openId: string;

    /**玩家的显示名*/
    showName: string;
    /**认证有效天数,1 ~ 120*/
    authTokenDay :number;
}

export interface ResAuthorize extends BasePlayerResponse {
    /**平台生成的玩家ID*/
    playerId:string;
    /**所有需要认证的接口、服务器，都需要附带token*/
    playerToken:string;
}

export const conf: BaseConf = {
    skipPlayerAuth: true,
    cryptoMode: EApiCryptoMode.AppReqDes,
};