import { ErrorCodes } from "../../shared/tsgf/Result";
import { ReqTerminalDismissRoom, ResTerminalDismissRoom } from "../../shared/tsgfServer/gameCluster/protocols/PtlTerminalDismissRoom";
import { GameClusterApiCall } from "../GameServerClusterMgr";

export default async function (call: GameClusterApiCall<ReqTerminalDismissRoom, ResTerminalDismissRoom>) {
    // 直接解散集群内的房间信息，再通知游戏服务器（游戏服务器还会再通知回来，返回了找不到的错误，游戏服务器可以忽略）
    let regInfo = call.getGameClusterServer().roomMgr.dismissRoom(call.req.roomId);
    if (!regInfo) {
        return await call.error('roomId未找到', { code: ErrorCodes.RoomNotFound });
    }
    // 通知游戏服务器解散()
    let ret = await call.getGameClusterServer().notifyGameServerDismissRoom(regInfo);
    if (!ret.succ) {
        return await call.error(ret.err, { code: ret.code });
    }
    // 生成房间在线信息
    let roomOnlineInfo = call.getGameClusterServer().buildRoomOnlineInfo(regInfo);
    if (!roomOnlineInfo) {
        return await call.error('roomId未找到', { code: ErrorCodes.RoomNotFound });
    }
    return await call.succ({
        roomOnlineInfo,
    });
}