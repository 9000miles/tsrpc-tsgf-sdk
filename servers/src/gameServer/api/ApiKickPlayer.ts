import { GameApiCall } from "../GameServer";
import { ReqKickPlayer, ResKickPlayer } from "../../shared/gameClient/protocols/PtlKickPlayer";

export async function ApiKickPlayer(call: GameApiCall<ReqKickPlayer, ResKickPlayer>) {
    const player = call.getGameServer().gameConnMgr.getPlayer(call.req.playerId)
    if (!player) return await call.error('player not found', {code: 404});

    let ret = await call.getGameServer().roomMgr.kickPlayer(player);
    if (!ret.succ) {
        return await call.error(ret.err, {code: ret.code});
    }
    return await call.succ({});
}