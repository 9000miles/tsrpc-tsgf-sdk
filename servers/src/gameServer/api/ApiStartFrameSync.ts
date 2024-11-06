
import { ReqStartFrameSync, ResStartFrameSync } from "../../shared/gameClient/protocols/PtlStartFrameSync";
import { GameApiCall } from "../GameServer";

export async function ApiStartFrameSync(call: GameApiCall<ReqStartFrameSync, ResStartFrameSync>) {
    let gameServer = call.getGameServer();
    let gameRoom = await gameServer.roomMgr.getGameRoom(call.conn.currPlayer);
    if (!gameRoom) return await call.error('玩家不在房间中！');

    //开始帧同步,这个不用等待,直接异步开始
    gameRoom.startGameFrameSync(call.conn.currPlayer);

    //不用等待开始,直接返回成功
    return await call.succ({});
}