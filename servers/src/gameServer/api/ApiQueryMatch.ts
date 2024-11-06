import { ReqQueryMatch, ResQueryMatch } from "../../shared/gameClient/protocols/PtlQueryMatch";
import { GameApiCall } from "../GameServer";

export async function ApiQueryMatch(call: GameApiCall<ReqQueryMatch, ResQueryMatch>) {
    
    let ret = await call.getGameServer().roomMgr
        .queryMatch(call.conn.currPlayer);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({
        matchResult: ret.data
    });
}