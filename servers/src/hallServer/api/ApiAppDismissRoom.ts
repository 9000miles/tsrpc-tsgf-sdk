
import { HallApiCall } from "../HallServer";
import { ReqAppDismissRoomT, ResAppDismissRoom } from "../../shared/hallClient/protocols/PtlAppDismissRoom";

export default async function (call: HallApiCall<ReqAppDismissRoomT, ResAppDismissRoom>) {
    let reqData = call.req.data;
    let ret = await call.getHallServer().gameClusterTerminal.dismissRoom(reqData.roomId)
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({
        roomOnlineInfo: ret.data,
    });
}