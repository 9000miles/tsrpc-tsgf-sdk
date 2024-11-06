
/**玩家输入帧类型*/
export enum EPlayerInputFrameType {
    /**输入操作*/
    Operates = 1,
    /**房间帧同步期间, 玩家进入房间, 系统会插入一个进入房间的输入帧(再收到通知后才有), 额外字段:IPlayerInputFrame.playerInfo:IPlayerInfo*/
    JoinRoom = 2,
    /**房间帧同步期间, 玩家离开房间(或断线不再重连后), 系统会插入一个离开房间的输入帧, 额外字段:IPlayerInputFrame.playerInfo:IPlayerInfo*/
    LeaveRoom = 3,
    /**玩家进入游戏: 房间开始帧同步时,每个在房间的玩家都加入一帧*/
    PlayerEnterGame = 4,
}

/**游戏同步帧*/
export interface IGameSyncFrame {
    /**帧索引*/
    frameIndex: number;
    /** 所有玩家的输入列表 (如果玩家提交输入的频率很高,里面有重复的玩家数据,即同帧时系统不会合并同玩家输入) null则为空帧*/
    playerInputs: IFramePlayerInput[] | null;
    /**可自行拓展其他字段*/
    [key: string]: any;
}

/**玩家输入(包含多个操作)*/
export interface IFramePlayerInput {
    /** 来源的玩家ID */
    playerId: string;
    /**输入帧类型*/
    inputFrameType: EPlayerInputFrameType;
    /**玩家在本帧的操作列表. inputFrameType == EPlayerInputFrameType.Operates 有数据*/
    operates?: IPlayerInputOperate[];
    /**可自行拓展其他字段*/
    [key: string]: any;
}

/**玩家输入的操作内容*/
export interface IPlayerInputOperate {
    [key: string]: any;
}




/**追帧数据*/
export interface IAfterFrames {
    /**状态同步的数据(如果没启用状态同步则可忽略)*/
    stateData: any;
    /**状态同步所在帧索引, 即追帧的索引(afterFrames)从下一帧开始, 如果没启用状态同步则可忽略,同时值为-1*/
    stateFrameIndex: number;
    /**要追帧数组, 允许仅包含输入帧, 但要求顺序, 并且范围为[afterStartFrameIndex ~ afterEndFrameIndex] */
    afterFrames: IGameSyncFrame[];
    /**追帧数组起始帧索引(包含)*/
    afterStartFrameIndex: number;
    /**追帧数组的截止帧索引(包含)*/
    afterEndFrameIndex: number;
    /**服务端同步帧率(每秒多少帧)*/
    serverSyncFrameRate: number;
}