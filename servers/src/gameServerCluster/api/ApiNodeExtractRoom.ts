import { ErrorCodes } from "../../shared/tsgf/Result";
import { ReqNodeExtractRoom, ResNodeExtractRoom } from "../../shared/tsgfServer/gameCluster/protocols/PtlNodeExtractRoom";
import { GameClusterApiCall } from "../GameServerClusterMgr";

export default async function (call: GameClusterApiCall<ReqNodeExtractRoom, ResNodeExtractRoom>) {
    let roomData = call.getGameClusterServer().roomMgr.extractRoom(call.req.roomId);
    if (!roomData) {
        return await call.error('提取房间信息失败：不存在的房间ID！', { code: ErrorCodes.RoomNotFound });
    }
    return await call.succ({
        roomRegInfo: roomData.regInfo,
        roomInfo: roomData.roomInfo,
    });
}