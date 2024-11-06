import { ErrorCodes } from "../../shared/tsgf/Result";
import { ReqTerminalGetRoomOnlineInfo, ResTerminalGetRoomOnlineInfo } from "../../shared/tsgfServer/gameCluster/protocols/PtlTerminalGetRoomOnlineInfo";
import { GameClusterApiCall } from "../GameServerClusterMgr";

export default async function (call: GameClusterApiCall<ReqTerminalGetRoomOnlineInfo, ResTerminalGetRoomOnlineInfo>) {
    
    let roomOnlineInfo = call.getGameClusterServer().roomMgr.getRoomOnlineInfo(call.req.roomId);
    if (!roomOnlineInfo) {
        return await call.error('roomId未找到', { code: ErrorCodes.RoomNotFound });
    }
    return await call.succ({
        roomOnlineInfo,
    });
}