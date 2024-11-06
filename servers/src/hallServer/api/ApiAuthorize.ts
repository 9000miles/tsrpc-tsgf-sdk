import { ErrorCodes, Result } from "../../shared/tsgf/Result";
import { PlayerAuthHelper } from "../../shared/tsgfServer/auth/PlayerAuthHelper";
import { ReqAuthorizeT, ResAuthorize } from "../../shared/hallClient/protocols/PtlAuthorize";
import { HallApiCall } from "../HallServer";

export async function ApiAuthorize(call: HallApiCall<ReqAuthorizeT, ResAuthorize>) {
    let reqData = call.req.data;
    if (reqData.authTokenDay > 120) {
        return await call.error('authTokenDay 范围1~120！', { code: ErrorCodes.ParamsError });
    }
    let ret = await PlayerAuthHelper.authorize(call.req.appId, reqData.openId, reqData.showName, reqData.authTokenDay);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    await call.succ({
        playerId: ret.data.playerId,
        playerToken: ret.data.playerToken,
    });
}