import { IPlayerInfo } from "../../shared/tsgf/player/IPlayerInfo";
import { ERoomMsgRecvType } from "../../shared/tsgf/room/IRoomMsg";
import { ReqSendRoomMsg, ResSendRoomMsg } from "../../shared/gameClient/protocols/PtlSendRoomMsg";
import { ClientConnection, GameApiCall } from "../GameServer";

export async function ApiSendRoomMsg(call: GameApiCall<ReqSendRoomMsg, ResSendRoomMsg>) {
    let gameServer = call.getGameServer();
    let roomInfo = await gameServer.roomMgr.getRoomInfo(call.conn.currPlayer);
    if (!roomInfo) return await call.error('玩家不在房间中！');
    let fromPlayerInfo: IPlayerInfo | undefined;
    if (call.req.robotPlayerId) {
        fromPlayerInfo = call.conn.currPlayer.roomRobotPlayers.get(call.req.robotPlayerId);
        if (!fromPlayerInfo) {
            return await call.error('非可控玩家!');
        }
    } else {
        fromPlayerInfo = call.conn.currPlayer.playerInfo;
    }
    let playerInfos: IPlayerInfo[];
    let roomMsg = call.req.roomMsg;
    switch (roomMsg.recvType) {
        case ERoomMsgRecvType.ROOM_ALL:
            playerInfos = roomInfo.playerList;
            break;
        case ERoomMsgRecvType.ROOM_OTHERS:
            playerInfos = roomInfo.playerList.filter(p => p.playerId !== fromPlayerInfo!.playerId);
            break;
        case ERoomMsgRecvType.ROOM_SOME:
            if (!roomMsg.recvPlayerList || roomMsg.recvPlayerList.length <= 0) {
                return await call.error('指定玩家接收，则需要定义recvPlayerList字段');
            }
            let pidList: string[] = roomMsg.recvPlayerList;
            playerInfos = roomInfo!.playerList.filter(p => pidList.includes(p.playerId));
            break;
    }
    if (playerInfos.length > 0) {
        let connList: ClientConnection[] = [];
        for (let playerInfo of playerInfos) {
            let conn = gameServer.gameConnMgr.getPlayerConn(playerInfo.playerId);
            if (!conn) continue;
            connList.push(conn);
        }
        gameServer.server.broadcastMsg("NotifyRoomMsg", {
            recvRoomMsg: {
                msg: roomMsg.msg,
                recvType: roomMsg.recvType,
                fromPlayerInfo: fromPlayerInfo,
            }
        }, connList);
    }
    return await call.succ({});
}