import { ReqRoomRobotLeave, ResRoomRobotLeave } from "../../shared/gameClient/protocols/PtlRoomRobotLeave";
import { GameApiCall } from "../GameServer";

export default async function (call: GameApiCall<ReqRoomRobotLeave, ResRoomRobotLeave>) {
    let ret = await call.getGameServer().roomMgr
        .roomRobotLeave(call.conn.currPlayer, call.req.robotPlayerId);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    return await call.succ({
        robotInfo: ret.data,
    });
}