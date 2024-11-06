


/*============无加密=============*/
import { EApiCryptoMode } from "../../tsgf/apiCrypto/Models";

/**玩家请求基类*/
export interface BasePlayerRequest {
    /**有需要鉴权的接口,则需要传递玩家token*/
    playerToken?: string;
}
/**玩家请求响应基类*/
export interface BasePlayerResponse {
}

/**接口配置信息*/
export interface BaseConf {
    /**本接口是否跳过玩家身份认证，没设置则为不跳过*/
    skipPlayerAuth?: boolean;
    /**加密的模式*/
    cryptoMode: EApiCryptoMode;
}