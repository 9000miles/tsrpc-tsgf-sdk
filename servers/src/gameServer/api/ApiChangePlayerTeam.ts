import { ApiCall } from "tsrpc";
import { ReqChangePlayerTeam, ResChangePlayerTeam } from "../../shared/gameClient/protocols/PtlChangePlayerTeam";
import { GameApiCall } from "../GameServer";

export async function ApiChangePlayerTeam(call: GameApiCall<ReqChangePlayerTeam, ResChangePlayerTeam>) {
    
    let ret = await call.getGameServer().roomMgr
        .changePlayerTeam(call.conn.currPlayer, call.req.newTeamId, call.req.robotPlayerId);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({
        roomInfo: ret.data
    });
}