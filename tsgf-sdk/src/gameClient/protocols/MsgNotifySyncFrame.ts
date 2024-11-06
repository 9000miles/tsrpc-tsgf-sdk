import { IGameSyncFrame } from "../../tsgf/room/IGameFrame";


/**服务端广播给所有客户端的每帧数据*/
export interface MsgNotifySyncFrame {
    /**要同步的游戏帧数据*/
    syncFrame:IGameSyncFrame;
    /**间隔上一帧过去的秒数*/
    dt:number;
}

