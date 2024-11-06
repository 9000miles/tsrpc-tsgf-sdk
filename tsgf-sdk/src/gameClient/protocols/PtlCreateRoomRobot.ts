import { IPlayerInfo, IPlayerInfoPara } from "../../tsgf/player/IPlayerInfo";

export interface ReqCreateRoomRobot {
    createPa:IPlayerInfoPara;
    /**同时指定加入的队伍ID*/
    teamId?: string;
}

export interface ResCreateRoomRobot {
    /**创建的机器人id*/
    robotInfo: IPlayerInfo;
}