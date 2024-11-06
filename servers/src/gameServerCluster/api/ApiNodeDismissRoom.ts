import { GameClusterApiCall } from "../GameServerClusterMgr";
import { ReqNodeDismissRoom, ResNodeDismissRoom } from "../../shared/tsgfServer/gameCluster/protocols/PtlNodeDismissRoom";
import { ErrorCodes } from "../../shared/tsgf/Result";

export default async function (call: GameClusterApiCall<ReqNodeDismissRoom, ResNodeDismissRoom>) {
    let roomRegInfo = call.getGameClusterServer().roomMgr.dismissRoom(call.req.roomId);
    if (!roomRegInfo) {
        return await call.error('roomId未找到', { code: ErrorCodes.RoomNotFound });
    }
    return await call.succ({
        roomRegInfo
    });
}