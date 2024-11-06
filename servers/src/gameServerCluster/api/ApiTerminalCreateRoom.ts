import { GameClusterApiCall } from "../GameServerClusterMgr";
import { ReqTerminalCreateRoom, ResTerminalCreateRoom } from "../../shared/tsgfServer/gameCluster/protocols/PtlTerminalCreateRoom";

export default async function (call: GameClusterApiCall<ReqTerminalCreateRoom, ResTerminalCreateRoom>) {
    let ret = await call.getGameClusterServer().roomMgr.createRoom(call.req.appId, call.req);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({
        roomOnlineInfo: ret.data,
    });
}