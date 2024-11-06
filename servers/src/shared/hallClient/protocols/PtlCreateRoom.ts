import { EApiCryptoMode } from "../../tsgf/apiCrypto/Models";
import { ICreateRoomPara, IRoomOnlineInfo } from "../../tsgf/room/IRoomInfo";
import { BasePlayerRequest, BasePlayerResponse, BaseConf } from "./base";

/**
 * 创建房间
*/
export interface ReqCreateRoom extends BasePlayerRequest, ICreateRoomPara {
}

export interface ResCreateRoom extends BasePlayerResponse {
    roomOnlineInfo: IRoomOnlineInfo;
}

export const conf: BaseConf = {
    cryptoMode: EApiCryptoMode.None,
};