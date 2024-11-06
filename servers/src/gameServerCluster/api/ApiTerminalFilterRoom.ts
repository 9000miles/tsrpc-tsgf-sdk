import { ReqTerminalFilterRoom, ResTerminalFilterRoom } from "../../shared/tsgfServer/gameCluster/protocols/PtlTerminalFilterRoom";
import { GameClusterApiCall } from "../GameServerClusterMgr";

export default async function (call: GameClusterApiCall<ReqTerminalFilterRoom, ResTerminalFilterRoom>) {
    let filterRes = call.getGameClusterServer().roomMgr.filterRooms(call.req.filter, call.req.skip, call.req.limit);
    return await call.succ({
        ...filterRes,
    });
}