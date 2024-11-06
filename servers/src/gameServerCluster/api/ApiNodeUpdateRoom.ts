import { GameClusterApiCall } from "../GameServerClusterMgr";
import { ReqNodeUpdateRoom, ResNodeUpdateRoom } from "../../shared/tsgfServer/gameCluster/protocols/PtlNodeUpdateRoom";
import { ErrorCodes } from "../../shared/tsgf/Result";

export default async function (call: GameClusterApiCall<ReqNodeUpdateRoom, ResNodeUpdateRoom>) {
    let ret = call.getGameClusterServer().roomMgr.updateRoomInfo(call.req);
    if (!ret) {
        return await call.error('更新房间信息失败：不存在的房间ID！', { code: ErrorCodes.RoomNotFound });
    }
    return await call.succ({
    });
}