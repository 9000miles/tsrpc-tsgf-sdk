import { ApiCall } from "tsrpc";
import { ReqQueryMatch, ResQueryMatch } from "../../shared/hallClient/protocols/PtlQueryMatch";
import { HallApiCall } from "../HallServer";

export async function ApiQueryMatch(call: HallApiCall<ReqQueryMatch, ResQueryMatch>) {
    let ret = await call.getHallServer().matchRequestTerminal
        .queryMatch(call.conn.currPlayer.authInfo.appId, call.req.matchReqId);
    if (ret === null) {
        //失败的结果
        return await call.succ({
            hasResult: false
        });
    }
    if (!ret.succ) {
        return await call.succ({
            hasResult: true,
            errMsg: ret.err,
            errCode: ret.code,
        });
    }
    return await call.succ({
        hasResult: true,
        matchResult: ret.data,
    });
}