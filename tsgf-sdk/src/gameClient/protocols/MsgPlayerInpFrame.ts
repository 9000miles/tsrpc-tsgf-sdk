import { IPlayerInputOperate } from "../../tsgf/room/IGameFrame";

export interface MsgPlayerInpFrame {
    /**本帧本用户的操作列表*/
    operates: IPlayerInputOperate[];
    /**可以指定是自己的机器人的指令*/
    robotPlayerId?:string;
}
