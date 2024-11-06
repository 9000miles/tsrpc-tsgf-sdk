import { ReqLeaveRoom, ResLeaveRoom } from "../../shared/gameClient/protocols/PtlLeaveRoom";
import { GameApiCall } from "../GameServer";

export async function ApiLeaveRoom(call: GameApiCall<ReqLeaveRoom, ResLeaveRoom>) {
    let ret = await call.getGameServer().roomMgr.leaveRoom(call.conn.currPlayer);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({
    });
}