
import { ReqCreateRoom, ResCreateRoom } from "../../shared/hallClient/protocols/PtlCreateRoom";
import { ERoomCreateType } from "../../shared/tsgf/room/IRoomInfo";
import { HallApiCall } from "../HallServer";

export async function ApiCreateRoom(call: HallApiCall<ReqCreateRoom, ResCreateRoom>) {
    let ret = await call.getHallServer().gameClusterTerminal.createRoom(
        call.conn.currPlayer.authInfo.appId,
        call.req,
        ERoomCreateType.COMMON_CREATE);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({
        roomOnlineInfo: ret.data,
    });
}