import { EApiCryptoMode } from "../../tsgf/apiCrypto/Models";
import { IRoomOnlineInfo } from "../../tsgf/room/IRoomInfo";
import { BaseConf, BasePlayerRequest, BasePlayerResponse } from "./base";

/**房主在大厅解散自己的房间*/
export interface ReqOwnDismissRoom extends BasePlayerRequest {
    roomId: string;
}

export interface ResOwnDismissRoom extends BasePlayerResponse {
    roomOnlineInfo: IRoomOnlineInfo;
}

export const conf: BaseConf = {
    cryptoMode : EApiCryptoMode.None,
};