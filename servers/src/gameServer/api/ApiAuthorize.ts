import { GameApiCall } from "../GameServer";
import { apiErrorThenClose } from "../../shared/tsgfServer/ApiBase";
import { ReqAuthorize, ResAuthorize } from "../../shared/gameClient/protocols/PtlAuthorize";
import { IPlayerInfo } from "../../shared/tsgf/player/IPlayerInfo";

export async function ApiAuthorize(call: GameApiCall<ReqAuthorize, ResAuthorize>) {
    let ret = await call.getGameServer().gameConnMgr.connAuthorize(call.conn, call.req.playerToken, call.req, call.req.roomWaitReconnectTime);
    if (!ret.succ) {
        return await apiErrorThenClose(call, ret.err, { code: ret.code });
    }
    await call.succ({
        playerInfo: ret.data.playerInfo
    });
}