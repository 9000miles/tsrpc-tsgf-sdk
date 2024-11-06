import { IGameSyncFrame } from "../../tsgf/room/IGameFrame";

/**
 * 请求具体的帧数据
 * 
 * */
export interface ReqRequestFrames {
    /**起始帧索引(包含)*/
    beginFrameIndex: number;
    /**结束帧索引(包含)*/
    endFrameIndex: number;
}

export interface ResRequestFrames {
    /**帧数组*/
    frames: IGameSyncFrame[]
}