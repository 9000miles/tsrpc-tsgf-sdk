import { EApiCryptoMode } from "../../tsgf/apiCrypto/Models";
import { IGetOrCreateRoomPara, IGetOrCreateRoomRsp } from "../../tsgf/room/IRoomInfo";
import { BasePlayerRequest, BasePlayerResponse, BaseConf } from "./base";

export interface ReqGetOrCreateRoom extends BasePlayerRequest, IGetOrCreateRoomPara {
}

export interface ResGetOrCreateRoom extends BasePlayerResponse, IGetOrCreateRoomRsp {
}

export const conf: BaseConf = {
    cryptoMode: EApiCryptoMode.None,
};