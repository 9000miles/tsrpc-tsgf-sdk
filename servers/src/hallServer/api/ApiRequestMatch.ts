import { ReqRequestMatch, ResRequestMatch } from "../../shared/hallClient/protocols/PtlRequestMatch";
import { HallApiCall } from "../HallServer";

export async function ApiRequestMatch(call: HallApiCall<ReqRequestMatch, ResRequestMatch>) {
    let ret = await call.getHallServer().matchRequestTerminal
        .requestMatch(call.conn.currPlayer.authInfo.appId, call.req.matchParams);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({
        matchReqId: ret.data
    });
}