import { IPlayerInfo } from "../../tsgf/player/IPlayerInfo";

export interface ReqRoomRobotLeave {
    /**自己创建的机器人*/
    robotPlayerId:string;
}

export interface ResRoomRobotLeave {
    robotInfo:IPlayerInfo;
}