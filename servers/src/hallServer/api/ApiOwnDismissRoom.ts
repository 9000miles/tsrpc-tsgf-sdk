import { ReqOwnDismissRoom, ResOwnDismissRoom } from "../../shared/hallClient/protocols/PtlOwnDismissRoom";
import { ErrorCodes } from "../../shared/tsgf/Result";
import { HallApiCall } from "../HallServer";

export default async function (call: HallApiCall<ReqOwnDismissRoom, ResOwnDismissRoom>) {
    let t = call.getHallServer().gameClusterTerminal;
    let getRet = await t.getRoomOnlineInfo(call.req.roomId);
    if (!getRet.succ) {
        return await call.error(getRet.err, { code: getRet.code });
    }
    let roomOnlineInfo = getRet.data;
    if (roomOnlineInfo.ownerPlayerId !== call.conn.currPlayer.authInfo.playerId) {
        return await call.error('只有房主才可以解散房间！', { code: ErrorCodes.RoomPermissionDenied });
    }
    let ret = await t.dismissRoom(call.req.roomId);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({
        roomOnlineInfo: ret.data,
    });
}