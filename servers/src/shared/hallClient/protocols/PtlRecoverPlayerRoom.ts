
import { EApiCryptoMode } from "../../tsgf/apiCrypto/Models";
import { IRoomOnlineInfo } from "../../tsgf/room/IRoomInfo";
import { BasePlayerRequest, BasePlayerResponse, BaseConf } from "./base";


export interface ReqRecoverPlayerRoom extends BasePlayerRequest {
    playerId: string;
    playerToken: string;
    /**可更新玩家显示名*/
    updateShowName?: string;
}

export interface ResRecoverPlayerRoom extends BasePlayerResponse {
    /**当前玩家在服务器还保留的房间信息*/
    roomOnlineInfo: IRoomOnlineInfo | null;
}

export const conf: BaseConf = {
    cryptoMode: EApiCryptoMode.None,
};