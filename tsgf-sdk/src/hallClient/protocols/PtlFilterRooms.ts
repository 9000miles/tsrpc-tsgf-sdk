import { EApiCryptoMode } from "../../tsgf/apiCrypto/Models";
import { IRoomsFilterPara, IRoomsFilterRes } from "../../tsgf/room/IRoomInfo";
import { BaseConf, BasePlayerRequest, BasePlayerResponse } from "./base";

/**玩家筛选房间列表*/
export interface ReqFilterRooms extends BasePlayerRequest {
    filter: IRoomsFilterPara;
    /**匹配结果跳过数量*/
    skip?: number;
    /**限制返回数量*/
    limit?: number;
}

export interface ResFilterRooms extends BasePlayerResponse, IRoomsFilterRes {
}

export const conf: BaseConf = {
    cryptoMode: EApiCryptoMode.None,
};