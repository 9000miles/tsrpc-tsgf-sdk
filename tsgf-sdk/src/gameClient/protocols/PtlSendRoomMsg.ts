import { IRoomMsg } from "../../tsgf/room/IRoomMsg";

/**
 * 发送房间消息
 * 
 * */
export interface ReqSendRoomMsg {
    roomMsg: IRoomMsg;
    /**可以指定自己的玩家机器人*/
    robotPlayerId?: string;
}

export interface ResSendRoomMsg {

}