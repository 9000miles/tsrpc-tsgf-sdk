import { ErrorCodes } from "../../shared/tsgf/Result";
import { ReqTerminalGetOrCreateRoom, ResTerminalGetOrCreateRoom } from "../../shared/tsgfServer/gameCluster/protocols/PtlTerminalGetOrCreateRoom";
import { GameClusterApiCall } from "../GameServerClusterMgr";

export default async function (call: GameClusterApiCall<ReqTerminalGetOrCreateRoom, ResTerminalGetOrCreateRoom>) {
    
    if (!call.req.matchRoomType && !call.req.matchMaxPlayers) {
        return await call.error('match参数至少要有一个!', { code: ErrorCodes.ParamsError });
    }
    let getOrAllotRet = await call.getGameClusterServer().roomMgr.getOrAllotGameServer(call.req.appId,call.req);
    if (!getOrAllotRet.succ) {
        return await call.error(getOrAllotRet.err, { code: getOrAllotRet.code });
    }
    if (getOrAllotRet.data.matchRoomOnlineInfoList?.length) {
        // 匹配到现有房间
        return await call.succ({
            matchRoomOnlineInfoList: getOrAllotRet.data.matchRoomOnlineInfoList,
        });
    }
    if (getOrAllotRet.data.createRoomOnlineInfo) {
        // 成功创建房间
        return await call.succ({
            createRoomOnlineInfo: getOrAllotRet.data.createRoomOnlineInfo,
        });
    }
    return await call.error('结果异常！', { code: ErrorCodes.Exception });
}