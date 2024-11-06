import { ReqChangeCustomPlayerStatus, ResChangeCustomPlayerStatus } from "../../shared/gameClient/protocols/PtlChangeCustomPlayerStatus";
import { GameApiCall } from "../GameServer";

export async function ApiChangeCustomPlayerStatus(call: GameApiCall<ReqChangeCustomPlayerStatus, ResChangeCustomPlayerStatus>) {
    
    let ret = await call.getGameServer().roomMgr
        .changeCustomPlayerStatus(call.conn.currPlayer, call.req.customPlayerStatus, call.req.robotPlayerId);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({
        roomInfo: ret.data
    });
}