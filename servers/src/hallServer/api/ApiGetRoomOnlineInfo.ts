import { ReqGetRoomOnlineInfo, ResGetRoomOnlineInfo } from "../../shared/hallClient/protocols/PtlGetRoomOnlineInfo";
import { HallApiCall } from "../HallServer";

export async function ApiGetRoomOnlineInfo(call: HallApiCall<ReqGetRoomOnlineInfo, ResGetRoomOnlineInfo>) {
    let ret = await call.getHallServer().gameClusterTerminal.getRoomOnlineInfo(call.req.roomId);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({
        roomOnlineInfo: ret.data,
    });
}