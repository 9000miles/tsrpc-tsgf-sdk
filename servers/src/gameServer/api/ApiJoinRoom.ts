import { ReqJoinRoom, ResJoinRoom } from "../../shared/gameClient/protocols/PtlJoinRoom";
import { GameApiCall } from "../GameServer";

export async function ApiJoinRoom(call: GameApiCall<ReqJoinRoom, ResJoinRoom>) {
    let ret = await call.getGameServer().roomMgr.joinRoom(call.conn.currPlayer, call.req);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({
        roomInfo: ret.data,
    });
}