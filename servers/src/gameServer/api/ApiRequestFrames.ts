
import { ReqRequestFrames, ResRequestFrames } from "../../shared/gameClient/protocols/PtlRequestFrames";
import { ErrorCodes } from "../../shared/tsgf/Result";
import { GameApiCall } from "../GameServer";

export async function ApiRequestFrames(call: GameApiCall<ReqRequestFrames, ResRequestFrames>) {
    if (call.req.beginFrameIndex < 0) {
        return await call.error('beginFrameIndex需要大于等于0 ！', { code: ErrorCodes.ParamsError });
    }
    if (call.req.endFrameIndex < call.req.beginFrameIndex) {
        return await call.error('endFrameIndex需要大于等于beginFrameIndex！', { code: ErrorCodes.ParamsError });
    }
    let gameServer = call.getGameServer();
    let gameRoom = await gameServer.roomMgr.getGameRoom(call.conn.currPlayer);
    if (!gameRoom) {
        return await call.error('玩家不在房间中！', { code: ErrorCodes.RoomNotIn });
    }
    if(!gameRoom.game.inSync){
        return await call.error('当前不在同步中！', { code: ErrorCodes.RoomNotInSync });
    }
    let frames = gameRoom.game.requestFrames(call.req.beginFrameIndex, call.req.endFrameIndex);
    return await call.succ({
        frames: frames,
    });
}