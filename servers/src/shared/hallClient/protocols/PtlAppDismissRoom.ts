import { EApiCryptoMode, IAppEncryptRequest, IAppEncryptRequestT, IBaseEncryptRequestData } from "../../tsgf/apiCrypto/Models";
import { IRoomOnlineInfo } from "../../tsgf/room/IRoomInfo";
import { BaseConf } from "./base";



/**使用应用权限，强制解散房间 （原始请求对象）*/
export interface ReqAppDismissRoom extends IAppEncryptRequest {
}
/**派发游戏服务器任务(服务端解密后的请求对象)*/
export interface ReqAppDismissRoomT extends IAppEncryptRequestT<ReqAppDismissRoomData> {
}
/**请求的数据对象*/
export interface ReqAppDismissRoomData extends IBaseEncryptRequestData {
    roomId: string;
}

export interface ResAppDismissRoom {
    /**解散前的房间在线信息*/
    roomOnlineInfo: IRoomOnlineInfo;
}

export const conf: BaseConf = {
    skipPlayerAuth: true,
    cryptoMode: EApiCryptoMode.AppReqDes,
};