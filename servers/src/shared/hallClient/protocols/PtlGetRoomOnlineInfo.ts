import { EApiCryptoMode } from "../../tsgf/apiCrypto/Models";
import { IRoomOnlineInfo } from "../../tsgf/room/IRoomInfo";
import { BasePlayerRequest, BasePlayerResponse, BaseConf } from "./base";

/**
 * 获取房间在线信息
*/
export interface ReqGetRoomOnlineInfo extends BasePlayerRequest {
    roomId: string;
}

export interface ResGetRoomOnlineInfo extends BasePlayerResponse {
    roomOnlineInfo: IRoomOnlineInfo;
}

export const conf: BaseConf = {
    cryptoMode : EApiCryptoMode.None,
};