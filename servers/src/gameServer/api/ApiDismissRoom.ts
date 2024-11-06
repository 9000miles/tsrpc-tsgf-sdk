import { ReqDismissRoom, ResDismissRoom } from "../../shared/gameClient/protocols/PtlDismissRoom";
import { GameApiCall } from "../GameServer";

export async function ApiDismissRoom(call: GameApiCall<ReqDismissRoom, ResDismissRoom>) {
    let ret = await call.getGameServer().roomMgr.dismissRoom(call.conn.currPlayer, call.req.roomId);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({
        roomInfo: ret.data
    });
}