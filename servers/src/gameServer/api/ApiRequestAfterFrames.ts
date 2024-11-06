
import { ReqRequestAfterFrames, ResRequestAfterFrames } from "../../shared/gameClient/protocols/PtlRequestAfterFrames";
import { ErrorCodes } from "../../shared/tsgf/Result";
import { GameApiCall } from "../GameServer";

export async function ApiRequestAfterFrames(call: GameApiCall<ReqRequestAfterFrames, ResRequestAfterFrames>) {
    
    let gameServer = call.getGameServer();
    let gameRoom = await gameServer.roomMgr.getGameRoom(call.conn.currPlayer);
    if (!gameRoom) {
        return await call.error('玩家不在房间中！', { code: ErrorCodes.RoomNotIn });
    }
    if(!gameRoom.game.inSync){
        return await call.error('当前不在同步中！', { code: ErrorCodes.RoomNotInSync });
    }
    let afterFrames = gameRoom.game.buildAfterFrames(call.req.startFrameIndex);
    return await call.succ(afterFrames);
}