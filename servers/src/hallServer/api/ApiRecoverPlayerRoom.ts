import { ReqRecoverPlayerRoom, ResRecoverPlayerRoom } from "../../shared/hallClient/protocols/PtlRecoverPlayerRoom";
import { ErrorCodes } from "../../shared/tsgf/Result";
import { IRoomOnlineInfo } from "../../shared/tsgf/room/IRoomInfo";
import { PlayerAuthHelper } from "../../shared/tsgfServer/auth/PlayerAuthHelper";
import { GameServerHelper } from "../../shared/tsgfServer/game/GameServerHelper";
import { RoomHelper } from "../../shared/tsgfServer/room/RoomHelper";
import { HallApiCall } from "../HallServer";

export default async function (call: HallApiCall<ReqRecoverPlayerRoom, ResRecoverPlayerRoom>) {
    let reqData = call.req;
    if (!reqData.playerId) {
        return await call.error('playerId 不能为空！', { code: ErrorCodes.ParamsError });
    }
    if (!reqData.playerToken) {
        return await call.error('playerToken 不能为空！', { code: ErrorCodes.ParamsError });
    }
    let ret = await PlayerAuthHelper.verificationFromId(reqData.playerId, reqData.playerToken, reqData.updateShowName);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    let roomOnlineInfo: IRoomOnlineInfo | null = null;
    if (ret.data.currRoomId) {
        let getRoomRet = await call.getHallServer().gameClusterTerminal.getRoomOnlineInfo(ret.data.currRoomId)
        if (!getRoomRet.succ) {
            return await call.error(getRoomRet.err, { code: ret.code });
        }
        roomOnlineInfo = getRoomRet.data;
    }
    await call.succ({
        roomOnlineInfo,
    });
}