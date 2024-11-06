import { ReqFilterRooms, ResFilterRooms } from "../../shared/hallClient/protocols/PtlFilterRooms";
import { HallApiCall } from "../HallServer";

export default async function (call: HallApiCall<ReqFilterRooms, ResFilterRooms>) {
    let filterRet = await call.getHallServer().gameClusterTerminal
        .filterRooms(call.req.filter, call.req.skip, call.req.limit);
    if (!filterRet.succ) {
        return await call.error(filterRet.err, { code: filterRet.code });
    }
    return await call.succ({
        ...filterRet.data,
    });
}