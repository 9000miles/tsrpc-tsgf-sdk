import { IAfterFrames } from "../../tsgf/room/IGameFrame";

/**
 * 请求追帧
 * 
 * */
export interface ReqRequestAfterFrames {
    /**使用指定的帧索引开始追帧
     * 不传则默认按下面顺序优先选择:
     * 1. 使用服务端同步状态所在帧索引开始
     * 2. 如果没有同步状态则从头开始
     * */
    startFrameIndex?:number;
}

export interface ResRequestAfterFrames extends IAfterFrames{
    
}