import { ReqChangeRoom, ResChangeRoom } from "../../shared/gameClient/protocols/PtlChangeRoom";
import { GameApiCall } from "../GameServer";

export async function ApiChangeRoom(call: GameApiCall<ReqChangeRoom, ResChangeRoom>) {
    let ret = await call.getGameServer().roomMgr.changeCurrRoom(call.conn.currPlayer, call.req);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({
        roomInfo: ret.data
    });
}