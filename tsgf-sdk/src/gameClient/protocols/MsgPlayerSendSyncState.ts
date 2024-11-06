
/**玩家发送同步的状态数据*/
export interface MsgPlayerSendSyncState {
    /**状态的数据*/
    stateData: any;
    /**状态所在帧索引*/
    stateFrameIndex: number;
}

// export const conf = {}