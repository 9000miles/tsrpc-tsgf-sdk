import { IPlayerInfo } from "../player/IPlayerInfo";

/**房间消息接收类型*/
export enum ERoomMsgRecvType {
    /**全部玩家*/
    ROOM_ALL = 1,
    /**除自己外的其他玩家*/
    ROOM_OTHERS = 2,
    /**房间中部分玩家*/
    ROOM_SOME = 3,
}

export interface IRoomMsgBase {
    /**自定义消息字符串*/
    msg: string;
    recvType: ERoomMsgRecvType;
}
export interface IRoomMsgOtherPlayers extends IRoomMsgBase {
    /**消息的接收类型，决定能接收到的玩家范围*/
    recvType: ERoomMsgRecvType.ROOM_ALL | ERoomMsgRecvType.ROOM_OTHERS;
}
export interface IRoomMsgSomePlayers extends IRoomMsgBase {
    /**指定玩家ID来接收，需要定义recvPlayerList*/
    recvType: ERoomMsgRecvType.ROOM_SOME;
    /**接收本条消息的玩家ID列表*/
    recvPlayerList: string[];
}

/**房间消息*/
export type IRoomMsg = IRoomMsgOtherPlayers | IRoomMsgSomePlayers;

/**接收到的房间消息*/
export interface IRecvRoomMsg{
    fromPlayerInfo: IPlayerInfo;
    msg: string;
    recvType: ERoomMsgRecvType;
}

/*
let a: IRoomMsg = {
    recvType: ERoomMsgRecvType.ROOM_SOME,
    msg: "",
    recvPlayerList: []
};
let b: IRoomMsg = {
    recvType: ERoomMsgRecvType.ROOM_ALL,
    msg: "",
};

let c!: IRoomMsg;
if (c.recvType == ERoomMsgRecvType.ROOM_SOME) {
    c.recvPlayerList.length;
}
*/

