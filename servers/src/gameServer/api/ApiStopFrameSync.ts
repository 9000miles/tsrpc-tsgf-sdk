
import { ReqStopFrameSync, ResStopFrameSync } from "../../shared/gameClient/protocols/PtlStopFrameSync";
import { GameApiCall } from "../GameServer";

export async function ApiStopFrameSync(call: GameApiCall<ReqStopFrameSync, ResStopFrameSync>) {
    let gameServer = call.getGameServer();
    let gameRoom = await gameServer.roomMgr.getGameRoom(call.conn.currPlayer);
    if (!gameRoom) return await call.error('玩家不在房间中！');
    
    gameRoom.stopGameFrameSync(call.conn.currPlayer);
    //不用等待直接返回成功
    return await call.succ({});
}