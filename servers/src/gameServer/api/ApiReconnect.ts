
import { apiErrorThenClose } from "../../shared/tsgfServer/ApiBase";
import { ReqReconnect, ResReconnect } from "../../shared/gameClient/protocols/PtlReconnect";
import { GameApiCall } from "../GameServer";
import { ErrorCodes } from "../../shared/tsgf/Result";

export async function ApiReconnect(call: GameApiCall<ReqReconnect, ResReconnect>) {
    let gameServer = call.getGameServer();
    let ret = await gameServer.gameConnMgr.connReconnect(call.conn, call.req.playerToken, call.req.roomWaitReconnectTime);
    if (!ret.succ) {
        //拒绝继续重连尝试了,要求重新登录!
        return await apiErrorThenClose(call, ret.err, { code: ErrorCodes.AuthReconnectionFail });
    }

    let roomInfo = await gameServer.roomMgr.getRoomInfo(call.conn.currPlayer);
    await call.succ({
        playerId: call.conn.currPlayer.playerInfo.playerId,
        currRoomInfo: roomInfo
    });
}