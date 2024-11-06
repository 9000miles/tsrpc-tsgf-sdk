import { IPlayerInfo, IPlayerInfoPara } from "./tsgf/player/IPlayerInfo";

/**
 * Factory
 */
export class Factory {

    /**
     * 用玩家信息构建玩家参数, 用于连接服务器加入房间等操作
     * @param playerInfo 
     * @returns player para
     */
    public static buildPlayerParaFromInfo(playerInfo: IPlayerInfo): IPlayerInfoPara {
        return {
            showName: playerInfo.showName,
            customPlayerProfile: playerInfo.customPlayerProfile,
            customPlayerStatus: playerInfo.customPlayerStatus,
        };
    }
}