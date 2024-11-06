import { ReqChangeCustomPlayerProfile, ResChangeCustomPlayerProfile } from "../../shared/gameClient/protocols/PtlChangeCustomPlayerProfile";
import { GameApiCall } from "../GameServer";

export async function ApiChangeCustomPlayerProfile(call: GameApiCall<ReqChangeCustomPlayerProfile, ResChangeCustomPlayerProfile>) {
    let ret = await call.getGameServer().roomMgr
        .changeCustomPlayerProfile(call.conn.currPlayer, call.req.customPlayerProfile, call.req.robotPlayerId);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({
        roomInfo: ret.data
    });
}