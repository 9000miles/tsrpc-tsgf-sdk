
import { ReqCancelMatch, ResCancelMatch } from "../../shared/hallClient/protocols/PtlCancelMatch";
import { HallApiCall } from "../HallServer";

export async function ApiCancelMatch(call: HallApiCall<ReqCancelMatch, ResCancelMatch>) {
    let ret = await call.getHallServer().matchRequestTerminal
        .cancelMatch(call.conn.currPlayer.authInfo.appId, call.req.matchReqId, call.conn.currPlayer.playerInfo.playerId);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({});
}