import { ReqRequestMatch, ResRequestMatch } from "../../shared/gameClient/protocols/PtlRequestMatch";
import { GameApiCall } from "../GameServer";

export async function ApiRequestMatch(call: GameApiCall<ReqRequestMatch, ResRequestMatch>) {

    let ret = await call.getGameServer().roomMgr
        .requestMatch(call.conn.currPlayer, call.req.matchParams);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({
        matchReqId: ret.data
    });
}