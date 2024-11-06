
import { HallApiCall } from "../HallServer";
import { ErrorCodes } from "../../shared/tsgf/Result";
import { ReqGetOrCreateRoom, ResGetOrCreateRoom } from "../../shared/hallClient/protocols/PtlGetOrCreateRoom";

export default async function (call: HallApiCall<ReqGetOrCreateRoom, ResGetOrCreateRoom>) {
    let getOrAllotRet = await call.getHallServer().gameClusterTerminal
        .getOrCreateRoom(call.conn.currPlayer.authInfo.appId, call.req);
    if (!getOrAllotRet.succ) {
        return await call.error(getOrAllotRet.err, { code: getOrAllotRet.code });
    }
    return await call.succ(getOrAllotRet.data);
}