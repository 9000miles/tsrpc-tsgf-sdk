import { ReqCancelMatch, ResCancelMatch } from "../../shared/gameClient/protocols/PtlCancelMatch";
import { GameApiCall } from "../GameServer";

export async function ApiCancelMatch(call: GameApiCall<ReqCancelMatch, ResCancelMatch>) {

    let ret = await call.getGameServer().roomMgr
        .cancelMatch(call.conn.currPlayer);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({
        matchResult: ret.data
    });
}