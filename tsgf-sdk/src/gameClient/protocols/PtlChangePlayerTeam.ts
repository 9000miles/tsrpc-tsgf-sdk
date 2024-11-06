import { IRoomInfo } from "../../tsgf/room/IRoomInfo";

export interface ReqChangePlayerTeam {
    newTeamId?:string;
    /**可以指定自己的玩家机器人*/
    robotPlayerId?: string;
}

export interface ResChangePlayerTeam {
    roomInfo:IRoomInfo;
}
