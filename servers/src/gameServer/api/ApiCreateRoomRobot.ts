
import { ReqCreateRoomRobot, ResCreateRoomRobot } from "../../shared/gameClient/protocols/PtlCreateRoomRobot";
import { GameApiCall } from "../GameServer";

export default async function (call: GameApiCall<ReqCreateRoomRobot, ResCreateRoomRobot>) {
    let ret = await call.getGameServer().roomMgr.createRoomRobot(call.conn.currPlayer, call.req.createPa, call.req.teamId);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({
        robotInfo: ret.data,
    });
}