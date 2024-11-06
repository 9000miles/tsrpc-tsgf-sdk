/*!
 * TSGF SDK Base v1.4.0
 * -----------------------------------------
 * Copyright (c) zum.
 * MIT License
 * https://gitee.com/fengssy/ts-gameframework
 */
import { BaseHttpClient } from 'tsrpc-base-client';
import { BaseHttpClientOptions } from 'tsrpc-base-client';
import { BaseServiceType } from 'tsrpc-proto';
import { BaseWsClient } from 'tsrpc-base-client';
import { BaseWsClientOptions } from 'tsrpc-base-client';
import { ServiceProto } from 'tsrpc-proto';

/**
 * 抽象的HTTP客户端,根据具体的环境,接入对应的客户端,让引用类型的地方不需要判断
 * @typeParam ServiceType
 */
export declare class AHttpClient<ServiceType extends BaseServiceType> {
    client: BaseHttpClient<ServiceType>;
    constructor(proto: ServiceProto<ServiceType>, options?: Partial<BaseHttpClientOptions>);
}

/**
 * 数组元素满足条件的数量
 *
 * @typeParam Item
 * @param arr
 * @param filter
 * @returns
 */
export declare function arrCount<Item>(arr: Item[], filter: (item: Item) => boolean): number;

/**
 * 分组
 *
 * @typeParam Item
 * @param arr
 * @param grouper
 * @returns
 */
export declare function arrGroup<Item, GroupBy>(arr: Item[], grouper: (v: Item) => GroupBy): Map<GroupBy, Item[]>;

/**
 *合并数组中对象元素中的数组!
 *
 * @typeParam ArrItem
 * @typeParam ItemArrItem
 * @param arr
 * @param itemArrGet 获取元素中的数组
 * @param mergeProc 合并操作(返回false表示不继续),merge为最终合并的数组, 需要自行往里面操作(连接或者去重等)
 * @returns
 */
export declare function arrItemArrMerge<ArrItem, ItemArrItem>(arr: ArrItem[], itemArrGet: (item: ArrItem) => ItemArrItem[], mergeProc: (merge: ItemArrItem[], currItem: ItemArrItem[]) => void | false): ItemArrItem[];

/**
 * 连接数组中对象元素中的数组!
 *
 * @typeParam ArrItem
 * @typeParam ItemArrItem
 * @param arr
 * @param itemArrGet 获取元素中的数组
 * @returns
 */
export declare function arrItemArrMergeConcat<ArrItem, ItemArrItem>(arr: ArrItem[], itemArrGet: (item: ArrItem) => ItemArrItem[]): ItemArrItem[];

/**
 * 原数组直接删除符合条件的元素，返回删除的数量
 *
 * @typeParam T
 * @param arr
 * @param itemCanRemove
 * @returns
 */
export declare function arrRemoveItems<T>(arr: Array<T>, itemCanRemove: (item: T) => boolean): number;

/**
 * 应用skip+limit到数组实现
 * @template T
 * @param arr
 * @param [skip]
 * @param [limit]
 * @returns skip limit to slice
 */
export declare function arrSkipAndLimit<T>(arr: T[], skip?: number, limit?: number): T[];

/**
 * 数组元素值累加
 *
 * @typeParam Item
 * @param arr
 * @param mapper
 * @returns
 */
export declare function arrSum<Item>(arr: Item[], mapper: (item: Item) => number): number;

/**
 * 给数组的每个元素更新值
 *
 * @param out
 * @param set
 */
export declare function arrUpdateItems<Item>(out: Item[], set: (oldVal: Item, index: number) => Item): void;

/**
 * 提取数组中最符合条件的元素 O(n)
 *
 * @typeParam T
 * @param arr
 * @param compareFn 数组中每个元素对比，返回最符合条件的元素
 * @param filter 先筛选,通过筛选的元素再进行提取最符合的
 * @returns
 */
export declare function arrWinner<T>(arr: Iterable<T>, compareFn: (winner: T, next: T) => T, filter?: (item: T) => boolean): T | null;

/**
 * 抽象的Websocket客户端,根据具体的环境,接入对应的客户端,让引用类型的地方不需要判断
 * @typeParam ServiceType
 */
export declare class AWsClient<ServiceType extends BaseServiceType> {
    client: BaseWsClient<ServiceType>;
    constructor(proto: ServiceProto<ServiceType>, options?: Partial<BaseWsClientOptions>);
}

/**玩家请求基类*/
declare interface BasePlayerRequest {
    /**有需要鉴权的接口,则需要传递玩家token*/
    playerToken?: string;
}

/**玩家请求响应基类*/
declare interface BasePlayerResponse {
}

/**
 * 异步延时
 *
 * @param ms
 * @returns
 */
export declare function delay(ms: number): Promise<void>;

/**
 * 可取消的异步延时
 *
 * @param ms
 * @returns
 */
export declare function delayCanCancel(ms: number): ICancelableExec<any>;

/**帧同步状态*/
export declare enum EFrameSyncState {
    /**未开始帧同步*/
    STOP = 0,
    /**已开始帧同步*/
    START = 1
}

/**匹配类型*/
export declare enum EMatchFromType {
    /**单个或多个玩家要匹配，进已存在的或新的房间*/
    Player = "Player",
    /**已经创建好的房间，支持匹配来人*/
    RoomJoinUs = "RoomJoinUs",
    /**房间全玩家去匹配全新的房间*/
    RoomAllPlayers = "RoomAllPlayers"
}

/**网络状态*/
export declare enum ENetworkState {
    /**离线*/
    OFFLINE = 0,
    /**在线*/
    ONLINE = 1
}

/**玩家输入帧类型*/
export declare enum EPlayerInputFrameType {
    /**输入操作*/
    Operates = 1,
    /**房间帧同步期间, 玩家进入房间, 系统会插入一个进入房间的输入帧(再收到通知后才有), 额外字段:IPlayerInputFrame.playerInfo:IPlayerInfo*/
    JoinRoom = 2,
    /**房间帧同步期间, 玩家离开房间(或断线不再重连后), 系统会插入一个离开房间的输入帧, 额外字段:IPlayerInputFrame.playerInfo:IPlayerInfo*/
    LeaveRoom = 3,
    /**玩家进入游戏: 房间开始帧同步时,每个在房间的玩家都加入一帧*/
    PlayerEnterGame = 4
}

/**私有房间的加入模式*/
export declare enum EPrivateRoomJoinMode {
    /**知道房间id即可加入*/
    roomIdJoin = 0,
    /**禁止加入*/
    forbidJoin = 1,
    /**使用密码加入*/
    password = 2
}

/**创建房间的方式*/
export declare enum ERoomCreateType {
    /**调用创建房间方法创建的*/
    COMMON_CREATE = 0,
    /**由匹配创建的*/
    MATCH_CREATE = 1
}

/**房间消息接收类型*/
export declare enum ERoomMsgRecvType {
    /**全部玩家*/
    ROOM_ALL = 1,
    /**除自己外的其他玩家*/
    ROOM_OTHERS = 2,
    /**房间中部分玩家*/
    ROOM_SOME = 3
}

/**错误码表*/
export declare enum ErrorCodes {
    /**
     * 通用
     * =======================================
     */
    /**参数错误*/
    ParamsError = 9001,
    /**异常*/
    Exception = 9005,
    /**
     * 房间相关
     * =======================================
     */
    /**不在房间中,无法操作需要在房间中的api*/
    RoomNotIn = 1000,
    /**房间不存在*/
    RoomNotFound = 1001,
    /**房间服务器已经关闭, 需要重新创建*/
    RoomServerClosed = 1002,
    /**服务器爆满, 暂无可用服务器*/
    RoomNoServerAvailable = 1003,
    /**房间现在不允许加入*/
    RoomForbidJoin = 1004,
    /**请先退出之前的房间(调用退出房间)*/
    RoomNeedLeavePrevious = 1005,
    /**房间已经解散*/
    RoomHasDismiss = 1006,
    /**房间人满无法加入*/
    RoomPlayersFull = 1007,
    /**要加入的队伍不存在!*/
    RoomTeamNotFound = 1008,
    /**要加入的队伍已满!*/
    RoomTeamPlayersFull = 1009,
    /**房间中的操作被禁止(一般是权限不足)*/
    RoomPermissionDenied = 1010,
    /**当前需要在同步中才可以操作*/
    RoomNotInSync = 1011,
    /**房间需要密码*/
    RoomMustPassword = 1012,
    /**房间密码不正确*/
    RoomPasswordWrong = 1013,
    /**房间id已存在*/
    RoomIdExists = 1014,
    /**
     * 匹配相关
     * =======================================
     */
    /**未知匹配错误*/
    MatchUnknown = 2000,
    /**请求被取消*/
    MatchRequestCancelled = 2001,
    /**游戏服务器爆满，请稍后再试！*/
    MatchServerBusy = 2002,
    /**匹配查询超时！*/
    MatchQueryTimeout = 2003,
    /**匹配超时！*/
    MatchTimeout = 2004,
    /**匹配相关的操作被禁止*/
    MatchPermissionDenied = 2100,
    /**匹配器标识不存在！*/
    MatchMatcherNotFound = 2101,
    /**
     * 认证相关
     * =======================================
     */
    /**token过期或不存在！(token被平台清理了,可能是太久没用或续期等)*/
    AuthPlayerTokenNotFound = 4001,
    /**token已经失效！(相同的openid重新授权,旧的token就失效了)*/
    AuthPlayerTokenInvalid = 4002,
    /**token已经过期！(刚过期,但还没被平台清理)*/
    AuthPlayerTokenExpire = 4003,
    /**断线重连失败,玩家在断开连接后太久没重连,已经被踢,需要重新登录*/
    AuthReconnectionFail = 4004,
    /**授权被(中间件)禁止*/
    AuthForbid = 4005,
    /**当前操作未授权! 需要先经过认证操作!*/
    AuthUnverified = 4006
}

/**
 * 多事件的订阅和触发
 */
export declare class EventEmitter {
    protected eventHandlers: Map<string, EventHandlers<Function>>;
    constructor();
    /**
     * 注册事件
     * @param event
     * @param handler
     * @param target 事件处理器的this指向
     */
    on(event: string, handler: Function, target?: any): void;
    /**
     * 注销一个事件
     * @param event
     * @param handler
     */
    off(event: string, handler: Function): void;
    /**
     * 触发一个事件的所有处理器,按注册顺序触发
     * @param event
     * @param args
     * @returns true if emit
     */
    emit(event: string, ...args: any[]): boolean;
    /**
     * 移除所有事件和处理器
     */
    removeAllListeners(): void;
}

/**
 * 单事件的多处理器订阅和触发
 */
export declare class EventHandlers<FunctionType extends Function> {
    private handlers;
    /**
     * 构造
     */
    constructor();
    /**
     * Counts event handlers
     * @returns
     */
    count(): number;
    /**
     * 添加处理器
     *
     * @param handler
     */
    addHandler(handler: FunctionType, target?: any): void;
    /**
     * 移出处理器
     *
     * @param handler
     */
    removeHandler(handler: FunctionType): void;
    /**
     * Removes all handlers
     */
    removeAllHandlers(): void;
    /**
     * 触发所有处理器, 有处理器则返回true
     *
     * @param args
     */
    emit(...args: any[]): boolean;
}

/**
 *游戏管理对象
 */
export declare class Game {
    /**单例*/
    static ins: Game;



    /**
     * 初始化
     *
     * @param hallServerUrl
     * @param myPlayerId
     * @param myPlayerToken
     */
    init(hallServerUrl: string, myPlayerId: string, myPlayerToken: string): void;
    dispose(): Promise<void>;
}

/**
 * 基础的游戏服务器api的客户端封装
 */
export declare class GameClient extends AWsClient<gameServiceType> {
    get playerToken(): string;
    get playerId(): string;
    /**当前所在的房间, 各种操作会自动维护本属性值为最新*/
    get currRoomInfo(): IRoomInfo | null;
    protected set currRoomInfo(roomInfo: IRoomInfo | null);
    /**当前玩家信息对象*/
    get currPlayerInfo(): IPlayerInfo | null;
    /**是否启用断线重连*/
    enabledReconnect: boolean;
    /**
     * 断线重连等待秒数
     */
    reconnectWaitSec: number;
    protected reconnectTimerHD: any;
    /**可设置房间中断线后等待重连的毫秒数(认证和重连时使用),默认为60000ms(60秒),设成0表示断线后直接清理(按退出房间处理)不等待重连*/
    roomWaitReconnectTime?: number;
    /**
     * [需启用断线重连:enabledReconnect]每次开始断线重连时触发, [reconnectWaitSec]秒后开始重连
     * @param currTryCount 已经重试了几次了, 首次断线重连则为0
     */
    onReconnectStart?: (currTryCount: number) => void;
    /**
     * 彻底断开触发, 如下情况:
     * 1. 断开连接时没启用断线重连则触发
     * 2. 主动断开时触发, reason='ManualDisconnect'
     * 3. 断线重连失败并不再重连时触发, reason='ReconnectFailed'
     * 4. 认证失败时会断开连接, 同时触发, reason='AuthorizeFailed'
     * @param reason 断开原因
     */
    onDisconnected?: (reason?: string) => void;
    /**当前玩家不管什么原因离开了房间都会触发(主动离开,主动解散,房间被解散等等)*/
    onLeaveRoom?: (roomInfo: IRoomInfo) => void;
    /**当前玩家加入到房间后触发*/
    onJoinRoom?: (roomInfo: IRoomInfo) => void;
    /**断线重连最终有结果时触发(终于连上了,或者返回不继续尝试了)*/
    onReconnectResult?: (succ: boolean, err: string | null) => void;
    /**当接收到房间消息时触发*/
    onRecvRoomMsg?: (roomMsg: IRecvRoomMsg) => void;
    /**【在房间中才能收到】玩家加入当前房间（自己操作的不触发）*/
    onPlayerJoinRoom?: (player: IPlayerInfo, roomInfo: IRoomInfo) => void;
    /**【在房间中才能收到】玩家退出当前房间（自己操作的不触发）*/
    onPlayerLeaveRoom?: (player: IPlayerInfo, roomInfo: IRoomInfo) => void;
    /**【在房间中才能收到】玩家被踢出房间*/
    onKicked?: (roomInfo: IRoomInfo) => void;
    /**【在房间中才能收到】当前房间被解散（自己操作的不触发）*/
    onDismissRoom?: (roomInfo: IRoomInfo) => void;
    /**【在房间中才能收到】房间中开始帧同步了*/
    onStartFrameSync?: (roomInfo: IRoomInfo, startPlayer: IPlayerInfo) => void;
    /**【在房间中才能收到】房间中停止帧同步了*/
    onStopFrameSync?: (roomInfo: IRoomInfo, stopPlayer: IPlayerInfo) => void;
    /**【在房间中才能收到】房间中收到一个同步帧*/
    onRecvFrame?: (syncFrame: IGameSyncFrame, dt: number) => void;
    /**【在房间中才能收到】服务端要求玩家上传状态同步数据 (调用 playerSendSyncState 方法)*/
    onRequirePlayerSyncState?: () => void;
    /**【在房间中才能收到】玩家加入当前房间（自己操作的不触发）*/
    onChangePlayerNetworkState?: (player: IPlayerInfo) => void;
    /**【在房间中才能收到】有玩家修改了自定义属性(只要在房间,自己也会收到)*/
    onChangeCustomPlayerProfile?: (changeInfo: IChangeCustomPlayerProfile) => void;
    /**【在房间中才能收到】有玩家修改了自定义状态(只要在房间,自己也会收到)*/
    onChangeCustomPlayerStatus?: (changeInfo: IChangeCustomPlayerStatus) => void;
    /**【在房间中才能收到】有玩家修改了自定义属性(只要在房间,自己也会收到)*/
    onChangeRoom?: (roomInfo: IRoomInfo) => void;
    /**【在房间中才能收到】有玩家修改了所在队伍(只要在房间,自己也会收到)*/
    onChangePlayerTeam?: (changeInfo: IChangePlayerTeam) => void;
    /**【在房间中才能收到】有玩家发起了全房间玩家匹配(自己也会收到)*/
    onRoomAllPlayersMatchStart?: (matchReqId: string, req_playerId: string, matchParams: IMatchParamsFromRoomAllPlayer) => void;
    /**【在房间中才能收到】全房间玩家匹配有结果了(自己也会收到) */
    onRoomAllPlayersMatchResult?: (errMsg?: string, errCode?: ErrorCodes, matchResult?: IMatchPlayerResultWithServer) => void;
    /**
     *
     * @param _playerToken 服务端调用大厅授权接口，获得玩家授权令牌
     * @param reqTimeout 请求超时毫秒数
     * @param roomWaitReconnectTime 可设置房间中断线后等待重连的毫秒数(认证和重连时使用),默认为60000ms(60秒),设成0表示断线后直接清理(按退出房间处理)不等待重连
     * @param serverUrl
     */
    constructor(serverUrl: string, _playerToken: string, reqTimeout?: number, roomWaitReconnectTime?: number);
    /**
     * Disconnects game client
     * @param reason websocket的关闭原因字符串,可自定义
     * @param code websocket的关闭原因代码, 取值范围: [1000,3000-4999]
     * @returns disconnect
     */
    disconnect(reason?: string): Promise<void>;
    protected clearData(): Promise<void>;
    protected stopReconnect(): void;
    /**
     * Starts reconnect
     * @param currTryCount 当前重试次数
     * @param failReTry 本次失败后是否继续重试
     * @returns reconnect
     */
    protected startReconnect(currTryCount?: number, failReTry?: boolean): Promise<boolean>;
    /**
     * 断线重连, 失败的话要看code, ErrorCodes.AuthReconnectionFail 表示逻辑拒绝,不需要重连
     * @returns
     */
    reconnect(): Promise<IResult<null>>;
    /**
     * 登录到游戏服务器, 失败则断开连接并清理数据
     * @param infoPara
     * @returns
     */
    authorize(infoPara?: IPlayerInfoPara): Promise<IResult<null>>;
    /**
     * [兼容旧版本保留]进房间
     * @param roomId
     * @param teamId 同时加入指定队伍
     * @returns
     * @deprecated 本重载已弃用, 将在下个版本移除!!
     */
    joinRoom(roomId: string, teamId?: string): Promise<IResult<IRoomInfo>>;
    /**
     * 进房间
     * @param joinRoomPara 加入房间参数, 根据房间的加入模式需要传入对应的数据
     * @returns
     */
    joinRoom(joinRoomPara: IJoinRoomPara): Promise<IResult<IRoomInfo>>;
    /**
     * 退出当前房间
     * @returns
     */
    leaveRoom(): Promise<IResult<null>>;
    /**
     * 【仅房主】踢出房间内玩家
     * @param playerId
     * @returns
     */
    kickPlayer(playerId: string): Promise<IResult<null>>;
    /**
     * 【仅房主】解散当前房间
     * @returns
     */
    dismissRoom(): Promise<IResult<null>>;
    /**
     * 修改房间信息(注意,只能房主操作),同时同步更新本地当前房间信息
     *
     * @param changePara
     * @returns
     */
    changeRoom(changePara: IChangeRoomPara): Promise<IResult<IRoomInfo>>;
    /**
     * 修改自己的玩家自定义属性,如果当前在房间中会同时会触发通知(房间中所有玩家)
     *
     * @param customPlayerProfile
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns
     */
    changeCustomPlayerProfile(customPlayerProfile: string, robotPlayerId?: string): Promise<IResult<null>>;
    /**
     * 修改自己的玩家自定义状态,如果当前在房间中会同时会触发通知(房间中所有玩家)
     *
     * @param customPlayerStatus
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns
     */
    changeCustomPlayerStatus(customPlayerStatus: number, robotPlayerId?: string): Promise<IResult<null>>;
    /**
     *变更自己所在队伍
     *
     * @param newTeamId 传undefined表示改为无队伍; 如果有指定队伍, 但房间不存在该队伍id, 则需要房间开启自由队伍选项
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns
     */
    changePlayerTeam(newTeamId?: string, robotPlayerId?: string): Promise<IResult<null>>;
    /**
     * 发送房间消息（自定义消息），可以指定房间里的全部玩家或部分玩家或其他玩家
     *
     * @public
     * @param roomMsg
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns
     */
    sendRoomMsg(roomMsg: IRoomMsg, robotPlayerId?: string): Promise<IResult<null>>;
    /**
     * 开始帧同步
     *
     * @public
     * @returns
     */
    startFrameSync(): Promise<IResult<null>>;
    /**
     * 停止帧同步
     *
     * @public
     * @returns
     */
    stopFrameSync(): Promise<IResult<null>>;
    /**
     * 发送玩家输入帧(加入到下一帧的操作列表)
     *
     * @public
     * @param inpOperates
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns
     */
    playerInpFrame(inpOperates: IPlayerInputOperate[], robotPlayerId?: string): Promise<IResult<null>>;
    /**
     * 请求追帧数据(当前的所有帧数据[+同步状态数据])
     *
     * @public
     * @returns
     */
    requestAfterFrames(): Promise<IResult<IAfterFrames>>;
    /**
     * 自主请求帧数组
     *
     * @public
     * @param beginFrameIndex 起始帧索引(包含)
     * @param endFrameIndex 结束帧索引(包含)
     * @returns
     */
    requestFrames(beginFrameIndex: number, endFrameIndex: number): Promise<IResult<IGameSyncFrame[]>>;
    /**
     * 玩家发送本地的同步状态数据(有启用状态同步的时候才可以用)
     *
     * @public
     * @param stateData
     * @param stateFrameIndex
     * @returns
     */
    playerSendSyncState(stateData: object, stateFrameIndex: number): Promise<IResult<null>>;
    /**
     * 发起房间所有玩家匹配请求
     * 请求成功即返回,同时房间中的所有玩家会收到通知
     * 匹配有结果了还会收到消息通知, 并且可由一个玩家调用QueryMatch等待完整匹配结果
     *
     * @param matchParams
     * @returns 匹配请求id
     */
    requestMatch(matchParams: IMatchParamsFromRoomAllPlayer): Promise<IResult<string>>;
    /**
     * 取消匹配请求
     * 可能发生并发,导致虽然请求成功了,但还是收到了成功结果的通知
     *
     * @returns 匹配请求id
     */
    cancelMatch(): Promise<IResult<null>>;
    /**
     * 查询完整匹配结果
     * 会等到有结果了才返回!
     * 注意: 同时只能只有一个玩家进行查询等待,一般使用通知来获取结果即可
     *
     * @returns
     */
    queryMatch(): Promise<IResult<IMatchResult>>;
    /**
     * 玩家创建房间机器人(退出房间会同步退出)
     * @param createPa
     * @param [teamId]
     * @returns 创建的机器人信息
     */
    createRoomRobot(createPa: IPlayerInfoPara, teamId?: string): Promise<IResult<IPlayerInfo>>;
    /**
     * 玩家的指定房间机器人退出房间(即销毁)
     * @param robotPlayerId
     * @returns 销毁的机器人信息
     */
    roomRobotLeave(robotPlayerId: string): Promise<IResult<IPlayerInfo>>;
}

/**游戏服务器的通讯类型定义*/
export declare type gameServiceType = ServiceType_2;

/**获取全局供应商实现*/
export declare function getGlobalSDKProvider(): ISDKProvider | undefined;

/**
 * 组队房间功能模块
 *
 * - 使用房间功能来实现的组队功能模块, 即: 同时只能在`组队房间`或者`普通房间`中
 * - 只要在组队房间中, 组队房间有的事件, 都将由组队房间接管, 房间事件不会触发
 *
 */
export declare class GroupRoom {
    /**单例*/
    static ins: GroupRoom;
    /**当前保留的组队房间id*/
    /**当前保留的组队房间是否是房主*/
    /**上一个组队房间id,因为触发顺序问题,需要保存一下最后一次的组队房间*/
    /**
     * 当前如果在组队房间中则能获取到房间信息, (即使在房间中,但不是组队房间依旧返回null)
     */
    get currGroupRoom(): IRoomInfo | null;
    /**
     * 所有事件
     */
    readonly events: GroupRoomEvents;

    dispose(): Promise<void>;
    /**
     * 如果之前是组队匹配进入新房间的, 则可以离开房间并回到之前的组队房间
     * @returns group
     */
    backGroup(): Promise<IResult<IRoomInfo>>;
    /**
     * 创建一个组队房间并进入, 之前有在其他房间将自动退出, 成功则 this.currGroupRoom 有值
     *
     * @param playerPara
     * @returns groupRoomId
     */
    createGroup(playerPara: IPlayerInfoPara): Promise<IResult<string>>;
    /**
     * 加入指定组队房间, 成功则 this.currGroupRoom 有值
     *
     * @param playerPara 玩家信息参数
     * @param groupRoomId 组队房间ID
     */
    joinGroup(playerPara: IPlayerInfoPara, groupRoomId: string): Promise<IResult<IRoomInfo>>;
    /**
     * 退出当前组队房间
     * @returns
     */
    leaveGroup(): Promise<IResult<null>>;
    /**
     * 【仅房主】解散当前组队房间
     * @returns
     */
    dismissGroup(): Promise<IResult<null>>;
    /**
     * [**在组队房间中才可以发起**] 发起组队匹配请求(请求成功即返回), 后续匹配成功则组队中所有玩家会自动进入匹配的房间
     *
     * - 成功发起匹配通知: onGroupMatchStart
     * - 匹配结果的通知: onGroupMatchResult
     * - 匹配成功开始进入匹配房间的通知: onGroupMatchEnterRoom
     *
     * 另外: 可由一个玩家(仅一个)调用 queryMatch 等待完整匹配结果(即房间所有玩家各自的匹配结果信息)
     *
     * @param matchParams
     * @returns 匹配请求id
     */
    requestMatch(matchParams: IMatchParamsBase): Promise<IResult<string>>;
    /**
     * [**在组队房间中才可以发起**] 取消组队匹配请求
     *
     * 可能发生并发,导致虽然取消成功了,但还是收到了匹配成功的通知
     *
     * @returns
     */
    cancelMatch(): Promise<IResult<null>>;
    /**
     * [在组队房间中才可以发起] 查询完整的组队匹配结果
     *
     * 会等到有结果了才返回!
     *
     * 注意: 同时只能只有一个玩家进行查询等待,一般使用相关事件来获取结果即可
     *
     * @returns
     */
    queryMatch(): Promise<IResult<IMatchResult>>;
    /**
     * 发送组队内消息（自定义消息），可以指定全部玩家或部分玩家或其他玩家 来接收
     *
     * @public
     * @param roomMsg
     */
    sendGroupMsg(roomMsg: IRoomMsg): Promise<IResult<null>>;
    /**
     * 修改自己的玩家自定义属性,如果当前在房间中会同时会触发通知(房间中所有玩家)
     *
     * @param customPlayerProfile
     */
    changeCustomPlayerProfile(customPlayerProfile: string): Promise<IResult<null>>;
    /**
     * 修改自己的玩家自定义状态,如果当前在房间中会同时会触发通知(房间中所有玩家)
     *
     * @param customPlayerStatus
     */
    changeCustomPlayerStatus(customPlayerStatus: number): Promise<IResult<null>>;
}

export declare class GroupRoomEvents {
    protected eventEmitter: EventEmitter;
    /**
     */
    constructor();
    dispose(): void;

    /**当前玩家不管什么原因离开了组队(主动离开,主动解散,房间被解散等等),都会触发*/
    onLeaveGroup(fn: (roomInfo: IRoomInfo) => void): void;
    offLeaveGroup(fn: (roomInfo: IRoomInfo) => void): void;

    /**当前玩家加入到组队后触发*/
    onJoinGroup(fn: (roomInfo: IRoomInfo) => void): void;
    offJoinGroup(fn: (roomInfo: IRoomInfo) => void): void;

    /**
     * 组队发起了匹配时触发
     * @param fn
     */
    onGroupMatchStart(fn: (matchReqId: string, reqPlayerId: string, matchParams: IMatchParamsFromRoomAllPlayer) => void): void;
    offGroupMatchStart(fn: (matchReqId: string, reqPlayerId: string, matchParams: IMatchParamsFromRoomAllPlayer) => void): void;

    /**
     * 组队匹配有结果了触发
     *
     * 注意: 如果是成功的, 则会自动进入房间 (事件: onGroupMatchEnterRoom )
     * @param fn
     */
    onGroupMatchResult(fn: (errMsg?: string, errCode?: ErrorCodes, matchResult?: IMatchPlayerResultWithServer) => void): void;
    offGroupMatchResult(fn: (errMsg?: string, errCode?: ErrorCodes, matchResult?: IMatchPlayerResultWithServer) => void): void;

    /**
     * 当组队匹配成功并进入房间后触发
     *
     * 如果进入匹配房间失败了就会再尝试回到组队, 可以使用 this.currGroupRoom 来判断是否成功回到组队房间
     *
     * @param fn result.data === Room.ins.currRoomInfo
     */
    onGroupMatchEnterRoom(fn: (result: IResult<IRoomInfo>) => void): void;
    offGroupMatchEnterRoom(fn: (result: IResult<IRoomInfo>) => void): void;

    /**玩家加入当前组队（自己操作的不触发）*/
    onPlayerJoinGroup(fn: (player: IPlayerInfo, roomInfo: IRoomInfo) => void): void;
    offPlayerJoinGroup(fn: (player: IPlayerInfo, roomInfo: IRoomInfo) => void): void;

    /**玩家退出当前组队（自己操作的不触发）*/
    onPlayerLeaveGroup(fn: (player: IPlayerInfo, roomInfo: IRoomInfo) => void): void;
    offPlayerLeaveGroup(fn: (player: IPlayerInfo, roomInfo: IRoomInfo) => void): void;

    /**当前组队被解散（自己操作的不触发）*/
    onDismissGroupRoom(fn: (roomInfo: IRoomInfo) => void): void;
    offDismissGroup(fn: (roomInfo: IRoomInfo) => void): void;

    /**收到组队中玩家发的自定义消息*/
    onRecvGroupMsg(fn: (msg: IRecvRoomMsg) => void): void;
    offRecvGroupMsg(fn: (msg: IRecvRoomMsg) => void): void;

    /**组队中其他玩家的网络状态变更(离线/上线)*/
    onChangePlayerNetworkState(fn: (player: IPlayerInfo) => void): void;
    offChangePlayerNetworkState(fn: (player: IPlayerInfo) => void): void;

    /**有玩家修改了自定义属性(只要在房间,自己也会收到)*/
    onChangeCustomPlayerProfile(fn: (changeInfo: IChangeCustomPlayerProfile) => void): void;
    offChangeCustomPlayerProfile(fn: (changeInfo: IChangeCustomPlayerProfile) => void): void;

    /**有玩家修改了自定义状态(只要在房间,自己也会收到)*/
    onChangeCustomPlayerStatus(fn: (changeInfo: IChangeCustomPlayerStatus) => void): void;
    offChangeCustomPlayerStatus(fn: (changeInfo: IChangeCustomPlayerStatus) => void): void;

    /**组队房间信息有修改*/
    onChangeGroup(fn: (roomInfo: IRoomInfo) => void): void;
    offChangeGroup(fn: (roomInfo: IRoomInfo) => void): void;
}

/**
 * 基础的大厅服务器api的客户端封装
 */
export declare class HallClient extends AHttpClient<hallServiceType> {
    constructor(serverUrl: string, timeout?: number);
    /**
     * 认证并返回尝试恢复玩家房间信息，如果玩家还被保留在房间中,则返回之前所在房间id,需要再调用GameClient的重连方法
     * @param playerId
     * @param playerToken
     * @param updateShowName 可更新玩家显示名
     * @returns player room
     */
    recoverPlayerRoom(playerId: string, playerToken: string, updateShowName?: string): Promise<IResult<IRoomOnlineInfo | null>>;
    /**
     * 创建房间，并获得分配的游戏服务器，得到后用游戏服务器客户端进行连接
     * @param playerToken
     * @param createPa
     * @returns 返回是否有错误消息,null表示成功
     */
    createRoom(playerToken: string, createPa: ICreateRoomPara): Promise<IResult<IRoomOnlineInfo>>;
    /**
     * 获取房间的在线信息，然后需要用游戏服务器客户端连接再加入房间
     * @param playerToken
     * @param createPa
     * @returns 返回是否有错误消息,null表示成功
     */
    getRoomOnlineInfo(playerToken: string, roomId: string): Promise<IResult<IRoomOnlineInfo>>;
    /**
     * 获取或创建符合条件的房间
     * @param playerToken
     * @param createPa
     * @returns 返回是否有错误消息,null表示成功
     */
    getOrCreateRoom(playerToken: string, para: IGetOrCreateRoomPara): Promise<IResult<IGetOrCreateRoomRsp>>;
    /**
     * 请求匹配，返回匹配请求ID，用queryMatch查询匹配结果，建议2秒一次查询
     * @param playerToken
     * @param matchParams
     * @returns 返回是否有错误消息,null表示成功
     */
    requestMatch(playerToken: string, matchParams: IMatchParamsFromPlayer): Promise<IResult<string>>;
    /**
     * 查询匹配结果, null表示结果还没出. 建议2秒一次查询. 因为请求时超时时间已知，所以客户端要做好请求超时判断
     * @param matchReqId
     * @returns 返回结果对象
     */
    queryMatch(playerToken: string, matchReqId: string): Promise<IResult<IMatchResult> | null>;
    /**
     * 取消匹配请求
     * @param matchReqId
     * @returns 返回结果对象
     */
    cancelMatch(playerToken: string, matchReqId: string): Promise<IResult<null>>;
    /**
     * 筛选在线房间列表
     * @param playerToken
     * @param filter
     * @param [skip]
     * @param [limit]
     */
    filterRooms(playerToken: string, filter: IRoomsFilterPara, skip?: number, limit?: number): Promise<IResult<IRoomsFilterRes>>;
    /**
     * 房主直接解散自己的房间
     * @param playerToken
     * @param roomId
     */
    ownDismissRoom(playerToken: string, roomId: string): Promise<IResult<IRoomOnlineInfo>>;
}

export declare type hallServiceType = ServiceType;

/**
 * 对象里是否有属性,通常用于判断将object当作键值对来使用的场景
 *
 * @param object
 * @returns
 */
export declare function hasProperty(object: any): boolean;

/**追帧数据*/
export declare interface IAfterFrames {
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

/**应用加密请求的原始请求对象的基类, 如果有加密外的参数附加, 可以拓展接口补充*/
declare interface IAppEncryptRequest extends IBaseEncryptRequest {
    /**应用ID*/
    appId: string;
}

/**加密请求的基类*/
declare interface IBaseEncryptRequest {
    /**请求数据密文*/
    ciphertext?: string;
    /**请求数据对象, 到了ApiCall层就是解析通过可以使用的*/
    data?: any;
}

/**可取消对象*/
declare interface ICancelable {
    /**
     * 取消执行
     *
     * @returns
     */
    cancel(): Promise<void>;
}

/**可取消的执行对象*/
declare interface ICancelableExec<ResultData> extends ICancelable {
    /**
     * 等待执行结果
     *
     * @returns
     */
    waitResult(): Promise<IResult<ResultData>>;
}

/**玩家自定义信息的变更信息*/
export declare interface IChangeCustomPlayerProfile {
    changePlayerId: string;
    customPlayerProfile: string;
    oldCustomPlayerProfile: string;
    roomInfo: IRoomInfo;
}

/**玩家自定义状态的变更信息*/
export declare interface IChangeCustomPlayerStatus {
    changePlayerId: string;
    customPlayerStatus: number;
    oldCustomPlayerStatus: number;
    roomInfo: IRoomInfo;
}

/**玩家队伍的变更信息*/
export declare interface IChangePlayerTeam {
    changePlayerId: string;
    teamId?: string;
    oldTeamId?: string;
    roomInfo: IRoomInfo;
}

/**修改房间信息的参数*/
export declare interface IChangeRoomPara {
    /**[不修改请不要赋值] 房间名称*/
    roomName?: string;
    /**[不修改请不要赋值] 是否私有房间，私有房间不参与匹配，同时需要给 privateRoomJoinMode 赋值，否则默认为使用房间id即可加入*/
    isPrivate?: boolean;
    /**[不修改请不要赋值] 私有房间的加入模式, 私有房间则需要赋值, 默认为使用房间id即可加入*/
    privateRoomJoinMode?: EPrivateRoomJoinMode;
    /**[不修改请不要赋值] 如果私有房间的加入模式是密码, 则必填本密码字段*/
    privateRoomPassword?: string;
    /**[不修改请不要赋值] 自定义房间属性字符串*/
    customProperties?: string;
}

/**创建房间的参数*/
export declare interface ICreateRoomPara extends ITeamParams {
    /**房间名字，查询房间和加入房间时会获取到*/
    roomName: string;
    /**房主玩家ID，创建后，只有房主玩家的客户端才可以调用相关的管理操作, 如果不想任何人操作,可以直接设置为''*/
    ownerPlayerId: string;
    /**进入房间的最大玩家数量*/
    maxPlayers: number;
    /**是否私有房间，私有房间不参与匹配，同时需要给 privateRoomJoinMode 赋值，默认为使用房间id即可加入*/
    isPrivate: boolean;
    /**私有房间的加入模式, 私有房间则需要赋值, 默认为使用房间id即可加入*/
    privateRoomJoinMode?: EPrivateRoomJoinMode;
    /**如果私有房间的加入模式是密码, 则必填本密码字段*/
    privateRoomPassword?: string;
    /**如果参与匹配,则使用的匹配器标识*/
    matcherKey?: string;
    /**自定义房间属性字符串*/
    customProperties?: string;
    /**房间类型自定义字符串*/
    roomType?: string;
    /**指定房间ID,必须全局唯一, 放空则会自动生成guid*/
    roomId?: string;
    /**保留空房间毫秒数,重新进人再退出后重新计时,放空或为0表示不保留空房间,直接销毁*/
    retainEmptyRoomTime?: number;
    /**是否为房主保留固定位置,即使房主离开后"满房"还是可以加入,即房主离开后房间真实最大人数=maxPlayers-1*/
    retainOwnSeat?: boolean;
    /** 随机要求玩家同步状态给服务端的间隔毫秒（不设置和设0表示不开启）,方便大大缩短追帧时间，但要求客户端实现状态数据全量同步，每隔一段时间要求一个玩家上报自己的全量状态数据，之后的追帧将从本状态开始同步+追帧*/
    randomRequirePlayerSyncStateInvMs?: number;
}

/**
 * 环境相关接口
 */
export declare interface IEnvProvider {
    /**
     * 当前平台实现的Http客户端封装
     * @param proto
     * @param options
     * @returns http client
     */
    getHttpClient: <ServiceType extends BaseServiceType>(proto: ServiceProto<ServiceType>, options?: Partial<BaseHttpClientOptions>) => BaseHttpClient<ServiceType>;
    /**
     * 当前平台实现的websocket客户端封装
     * @param proto
     * @param options
     * @returns websocket client
     */
    getWsClient: <ServiceType extends BaseServiceType>(proto: ServiceProto<ServiceType>, options?: Partial<BaseWsClientOptions>) => BaseWsClient<ServiceType>;
}

/**
 * 事件处理器
 */
export declare interface IEventHandler<FnType extends Function> {
    /**
     * 处理器方法
     */
    handler: FnType;
    /**
     * 执行 `handler` 的所有者, 即 `handler` 里的 `this` 指向
     */
    target?: any;
}

/**固定队伍匹配器 的匹配属性*/
export declare interface IFixedTeamsMatcherParams {
    /**满足最小玩家数但未满足最大玩家数时, 是否继续开启房间招人匹配,直到满员*/
    resultsContinueRoomJoinUsMatch?: boolean;
}

/**指定固定队伍匹配器 的匹配属性*/
export declare interface IFixedTeamsSpecifyMatcherParams {
    /**详细指定玩家的队伍分组*/
    specifyTeamPlayers?: ITeamPlayerIds[];
    /**满足最小玩家数但未满足最大玩家数时, 是否继续开启房间招人匹配,直到满员*/
    resultsContinueRoomJoinUsMatch?: boolean;
}

/**玩家输入(包含多个操作)*/
export declare interface IFramePlayerInput {
    /** 来源的玩家ID */
    playerId: string;
    /**输入帧类型*/
    inputFrameType: EPlayerInputFrameType;
    /**玩家在本帧的操作列表. inputFrameType == EPlayerInputFrameType.Operates 有数据*/
    operates?: IPlayerInputOperate[];
    /**可自行拓展其他字段*/
    [key: string]: any;
}

/**自由队伍匹配器 的匹配属性*/
export declare interface IFreeTeamsMatcherParams {
    /**至少几个队伍,才算匹配成功(创建房间), 不设置视为匹配满
     * 如不配置则需注意: 最大人数如果不能被队伍人数整除, 会导致人数永远无法匹配满!
     * */
    minTeams?: number;
    /**至少几个玩家匹配,才算匹配成功(创建房间), 不设置视为匹配满
     * 如不配置则需注意: 最大人数如果不能被队伍人数整除, 会导致人数永远无法匹配满!
     */
    minPlayers?: number;
    /**[队伍参数] 所有玩家都在同一个队伍*/
    allPlayersSameTeam?: boolean;
    /**[队伍参数] 所有玩家都在指定的队伍id中*/
    allPlayersSameTeamId?: string;
    /**满足最小玩家数但未满足最大玩家数时, 是否继续开启房间招人匹配,直到满员*/
    resultsContinueRoomJoinUsMatch?: boolean;
}

/**游戏同步帧*/
export declare interface IGameSyncFrame {
    /**帧索引*/
    frameIndex: number;
    /** 所有玩家的输入列表 (如果玩家提交输入的频率很高,里面有重复的玩家数据,即同帧时系统不会合并同玩家输入) null则为空帧*/
    playerInputs: IFramePlayerInput[] | null;
    /**可自行拓展其他字段*/
    [key: string]: any;
}

/**获取符合条件的房间或创建一个*/
export declare interface IGetOrCreateRoomPara {
    /**[至少要有一个]匹配房间配型*/
    matchRoomType?: boolean;
    /**[至少要有一个]匹配房间最大玩家数*/
    matchMaxPlayers?: boolean;
    /**最多匹配的房间数量, 放空则默认为3*/
    matchLimitRoomCount?: number;
    /**匹配的信息来源,都匹配不上,也将使用本参数进行创建房间*/
    createRoomPara: ICreateRoomPara;
}

/**获取符合条件的房间或创建一个的结果数据*/
export declare interface IGetOrCreateRoomRsp {
    /**有匹配条件的房间*/
    matchRoomOnlineInfoList?: IRoomOnlineInfo[];
    /**没匹配到但创建了房间的信息*/
    createRoomOnlineInfo?: IRoomOnlineInfo;
}

/**加入房间参数*/
export declare interface IJoinRoomPara {
    roomId: string;
    /**同时指定加入的队伍ID*/
    teamId?: string;
    /**私有房间是密码加入模式时,需要提供密码*/
    password?: string;
}

/**来自单个玩家提交的匹配信息*/
export declare interface IMatchFromPlayer {
    /**要匹配的玩家ID, 一般只传自己,
     * 可以传入其他玩家id, 但其他玩家并不会收到通知,因此其他玩家的后续操作需要自行处理(连接游戏服务器和加入房间等)*/
    playerIds: string[];
}

/**来自房间所有玩家提交的配置信息*/
export declare interface IMatchFromRoomAllPlayers {
}

/**匹配参数*/
export declare type IMatchParams = IMatchParamsFromPlayer | IMatchParamsFromRoomAllPlayer;

/**匹配请求参数基础定义
 * 匹配器+最大玩家数+组队参数 全部一致才会匹配到一起
 */
export declare interface IMatchParamsBase {
    /**匹配自定义类型, 只有相同的才会匹配在一起!*/
    matchType?: string;
    /**匹配器标识(只有相同的才会匹配在一起)，内置的匹配器标识定义: MatcherKeys，也可以使用自定义的(服务器)匹配器*/
    matcherKey: string;
    /**匹配器参数，对应匹配器需要的额外配置*/
    matcherParams: any;
    /**匹配超时秒数, 0或者undefined则默认60秒*/
    matchTimeoutSec?: number;
    /**房间最大玩家数, 只有相同的才会匹配在一起, 如果有队伍, 则队伍的合计最大玩家数要和本值一致!*/
    maxPlayers: number;
    /**组队参数, 只有相同的才会匹配在一起, 是否需要取决于匹配器是否需要*/
    teamParams?: ITeamParams;
}

/**单独玩家发起的匹配参数*/
export declare interface IMatchParamsFromPlayer extends IMatchParamsBase {
    /**发起类型是玩家*/
    matchFromType: EMatchFromType.Player;
    /**匹配发起的玩家信息, 注意,这些玩家不会收到服务器通知*/
    matchFromInfo: IMatchFromPlayer;
}

/**房间全玩家发起的匹配参数*/
export declare interface IMatchParamsFromRoomAllPlayer extends IMatchParamsBase {
    /**发起类型是房间全玩家*/
    matchFromType: EMatchFromType.RoomAllPlayers;
    /**匹配发起的附加信息*/
    matchFromInfo: IMatchFromRoomAllPlayers;
}

/**匹配请求的单个玩家结果*/
export declare interface IMatchPlayerResult {
    /**玩家id*/
    playerId: string;
    /**应该加入的队伍id*/
    teamId?: string;
}

/**给单个玩家的匹配结果(包含要加入的服务器信息)*/
export declare interface IMatchPlayerResultWithServer {
    /**房间所处的游戏服务器地址, 如果为undefined则说明服务器当前不可用*/
    gameServerUrl?: string;
    /**房间id*/
    roomId: string;
    /**应该加入的队伍id*/
    teamId?: string;
}

/**匹配请求的匹配结果*/
export declare interface IMatchResult {
    /**房间所处的游戏服务器地址, 如果为undefined则说明服务器当前不可用*/
    gameServerUrl?: string;
    /**房间id*/
    roomId: string;
    /**本次匹配中各个玩家对应的结果信息*/
    matchPlayerResults: IMatchPlayerResult[];
}

/**
 * Inits sdk
 * @param provider 由 import \{ buildSDKProvider \} from "tsgf-sdk-*" 提供, 如: tsgf-sdk-browser, tsgf-sdk-miniapp
 */
export declare function initSDK(provider: ISDKProvider): void;

/**
 * 初始化全局供应商实现
 * @param provider
 */
export declare function initSDKProvider(provider: ISDKProvider): void;

/**
 * 玩家信息
 */
export declare interface IPlayerInfo {
    /**玩家ID*/
    playerId: string;
    /**显示名*/
    showName: string;
    /**当前房间中所在的队伍id*/
    teamId?: string;
    /**自定义玩家状态*/
    customPlayerStatus: number;
    /**自定义玩家信息*/
    customPlayerProfile: string;
    /**网络状态*/
    networkState: ENetworkState;
    /**是否机器人*/
    isRobot: boolean;
    /**当前所在房间控制的机器人id列表(机器人玩家id)*/
    roomRobotIds?: string[];
}

/**玩家信息参数*/
export declare interface IPlayerInfoPara {
    /**玩家显示名(昵称), 没传默认使用服务端授权时传入的 showName */
    showName?: string;
    /**自定义玩家状态, 没传默认为 0*/
    customPlayerStatus?: number;
    /**自定义玩家信息, 没传默认为 ''*/
    customPlayerProfile?: string;
}

/**玩家输入的操作内容*/
export declare interface IPlayerInputOperate {
    [key: string]: any;
}

/**接收到的房间消息*/
export declare interface IRecvRoomMsg {
    fromPlayerInfo: IPlayerInfo;
    msg: string;
    recvType: ERoomMsgRecvType;
}

/**通用结果对象*/
export declare type IResult<T> = IResultSucc<T> | IResultErr<T>;

/**结果是失败的*/
export declare type IResultErr<T> = {
    succ: false;
    /**结果代码*/
    code: number;
    /**如果是失败的，则有错误消息*/
    err: string;
    data?: T;
};

/**结果是成功的*/
export declare type IResultSucc<T> = {
    /**结果是成功的*/
    succ: true;
    /**结果代码*/
    code: number;
    /**如果是失败的，则有错误消息*/
    err?: string;
    data: T;
};

/**房间信息*/
export declare interface IRoomInfo {
    /**房间ID*/
    roomId: string;
    /**房间名称*/
    roomName: string;
    /**房主玩家ID，创建后，只有房主玩家的客户端才可以调用相关的管理操作*/
    ownerPlayerId: string;
    /**是否私有房间，私有房间不参与匹配*/
    isPrivate: boolean;
    /**私有房间的加入模式*/
    privateRoomJoinMode?: EPrivateRoomJoinMode;
    /**如果参与匹配,则使用的匹配器标识*/
    matcherKey?: string;
    /**创建房间的方式*/
    createType: ERoomCreateType;
    /**进入房间的最大玩家数量*/
    maxPlayers: number;
    /**房间类型自定义字符串*/
    roomType?: string;
    /**自定义房间属性字符串*/
    customProperties?: string;
    /**如果当前房间在匹配 (房间全玩家匹配),则有匹配请求id*/
    allPlayerMatchReqId?: string;
    /**玩家列表*/
    playerList: IPlayerInfo[];
    /**队伍列表,如果创建房间时有传入队伍参数,则会有内容,否则为[]*/
    teamList: ITeamInfo[];
    /**[固定数量的队伍] 直接用数量自动生成所有固定队伍配置, 房间ID将从 '1' 开始到 fixedTeamCount,
     * 还需要传 fixedTeamMinPlayers 和 fixedTeamMaxPlayers, 或者使用 fixedTeamInfoList 完全自定义 */
    fixedTeamCount?: number;
    /**[自由数量的队伍] 指定每支队伍的最少玩家数, 同时还需要指定 freeTeamMaxPlayers*/
    freeTeamMinPlayers?: number;
    /**[自由数量的队伍] 指定每支队伍的最大玩家数, 同时还需要指定 freeTeamMinPlayers*/
    freeTeamMaxPlayers?: number;
    /**同步帧率*/
    frameRate: number;
    /**帧同步状态*/
    frameSyncState: EFrameSyncState;
    /**创建房间时间戳（单位毫秒， new Date(createTime) 可获得时间对象）*/
    createTime: number;
    /**开始游戏时间戳（单位毫秒， new Date(createTime) 可获得时间对象）,0表示未开始*/
    startGameTime: number;
    /**保留空房间毫秒数,重新进人再退出后重新计时,放空或为0表示不保留空房间,直接销毁*/
    retainEmptyRoomTime?: number;
    /**是否为房主保留固定位置,即使房主离开后"满房"还是可以加入,即房主离开后房间真实最大人数=maxPlayers-1*/
    retainOwnSeat: boolean;
    /** 随机要求玩家同步状态给服务端的间隔毫秒（不设置和设0表示不开启）,方便大大缩短追帧时间，但要求客户端实现状态数据全量同步，每隔一段时间要求一个玩家上报自己的全量状态数据，之后的追帧将从本状态开始同步+追帧*/
    randomRequirePlayerSyncStateInvMs?: number;
}

/**房间消息*/
export declare type IRoomMsg = IRoomMsgOtherPlayers | IRoomMsgSomePlayers;

export declare interface IRoomMsgBase {
    /**自定义消息字符串*/
    msg: string;
    recvType: ERoomMsgRecvType;
}

export declare interface IRoomMsgOtherPlayers extends IRoomMsgBase {
    /**消息的接收类型，决定能接收到的玩家范围*/
    recvType: ERoomMsgRecvType.ROOM_ALL | ERoomMsgRecvType.ROOM_OTHERS;
}

export declare interface IRoomMsgSomePlayers extends IRoomMsgBase {
    /**指定玩家ID来接收，需要定义recvPlayerList*/
    recvType: ERoomMsgRecvType.ROOM_SOME;
    /**接收本条消息的玩家ID列表*/
    recvPlayerList: string[];
}

/**房间在线信息, 给未加入房间的客户端的房间基本信息*/
export declare interface IRoomOnlineInfo {
    /**房间ID*/
    roomId: string;
    /**房主玩家ID，创建后，只有房主玩家的客户端才可以调用相关的管理操作*/
    ownerPlayerId: string;
    /**房间名称*/
    roomName: string;
    /**房间类型自定义字符串*/
    roomType?: string;
    /**房间最大玩家数*/
    maxPlayers: number;
    /**房间当前空位数(可加多少个玩家)*/
    emptySeats: number;
    /**是否私有房间，私有房间不参与匹配, 并且要符合 privateRoomJoinMode 的加入方式*/
    isPrivate: boolean;
    /**私有房间的加入模式*/
    privateRoomJoinMode?: EPrivateRoomJoinMode;
    /**游戏服务器的连接地址, 如果为undefined则说明服务器当前不可用*/
    gameServerUrl?: string;
    /**当前游戏服务器在线人数*/
    currGameServerPlayers: number;
}

/**房间列表的筛选参数*/
export declare interface IRoomsFilterPara {
    roomType?: string;
    maxPlayers?: number;
    roomNameLike?: string;
    roomNameFullMatch?: string;
}

/**房间筛选结果*/
export declare interface IRoomsFilterRes {
    /**符合条件并按照范围返回的房间列表*/
    rooms: IRoomOnlineInfo[];
    /**符合的总数量*/
    count: number;
}

/**
 * 全局供应商接口定义
 */
export declare interface ISDKProvider {
    /**环境实现供应商*/
    env: IEnvProvider | null;
}

/**单人匹配器的匹配属性*/
export declare interface ISingleMatcherParams {
    /**至少几个玩家匹配,才算匹配成功(创建房间), 如果要匹配满才开,则将值设置为maxPlayers*/
    minPlayers: number;
    /**生成结果后(满足最小玩家数但未满足最大玩家数时),是否继续开启房间招人匹配,直到满员*/
    resultsContinueRoomJoinUsMatch?: boolean;
}

export declare interface ITeamInfo {
    /**队伍 ID, 房间内唯一*/
    id: string;
    /**队伍名称*/
    name: string;
    /**队伍最小人数*/
    minPlayers: number;
    /**队伍最大人数*/
    maxPlayers: number;
}

/**队伍的配置参数*/
export declare interface ITeamParams {
    /**[固定数量的队伍] 直接用数量自动生成所有固定队伍配置, 房间ID将从 '1' 开始到 fixedTeamCount,
     * 还需要传 fixedTeamMinPlayers 和 fixedTeamMaxPlayers, 或者使用 fixedTeamInfoList 完全自定义 */
    fixedTeamCount?: number;
    /**[固定数量的队伍] 每支队伍最少玩家数(包含), 没传默认为1*/
    fixedTeamMinPlayers?: number;
    /**[固定数量的队伍] 每支队伍最大玩家数(包含), 没传默认为9*/
    fixedTeamMaxPlayers?: number;
    /**[固定数量的队伍] 使用传入的队伍id等信息来定义所有队伍, 并忽略 fixedTeam* 的其他参数*/
    fixedTeamInfoList?: ITeamInfo[];
    /**[自由数量的队伍] 指定每支队伍的最少玩家数, 同时还需要指定 freeTeamMaxPlayers*/
    freeTeamMinPlayers?: number;
    /**[自由数量的队伍] 指定每支队伍的最大玩家数, 同时还需要指定 freeTeamMinPlayers*/
    freeTeamMaxPlayers?: number;
}

/**队伍的玩家id列表*/
export declare interface ITeamPlayerIds {
    /**所属队伍id,如果没有队伍则为 undefined*/
    teamId?: string;
    /**玩家id列表*/
    playerIds: string[];
}

/**内置匹配器标识定义*/
export declare const MatcherKeys: {
    /**单人(无组队,忽视队伍参数), 支持多个玩家一起提交匹配,但匹配结果是没有组队的
     * matcherParams 类型对应为: ISingleMatcherParams*/
    Single: string;
    /**固定队伍匹配器, 所有玩家都在同一个队伍中, 具体哪个队伍由匹配逻辑分配
     * matcherParams 类型对应为: IFixedTeamsMatcherParams*/
    FixedTeams: string;
    /**指定固定队伍匹配器, 可以详细指定每个玩家的所属队伍
     * matcherParams 类型对应为: IFixedTeamsSpecifyMatcherParams*/
    FixedTeamsSpecify: string;
    /**自由队伍匹配器, matcherParams 类型对应为: IFreeTeamsMatcherParams*/
    FreeTeams: string;
};

/**主动告知断开*/
declare interface MsgDisconnect {
}

declare interface MsgNotifyChangeCustomPlayerProfile extends IChangeCustomPlayerProfile {
}

declare interface MsgNotifyChangeCustomPlayerStatus extends IChangeCustomPlayerStatus {
}

declare interface MsgNotifyChangePlayerNetworkState {
    roomInfo: IRoomInfo;
    changePlayerId: string;
    networkState: ENetworkState;
}

declare interface MsgNotifyChangePlayerTeam extends IChangePlayerTeam {
}

declare interface MsgNotifyChangeRoom {
    roomInfo: IRoomInfo;
}

declare interface MsgNotifyDismissRoom {
    roomInfo: IRoomInfo;
}

declare interface MsgNotifyJoinRoom {
    roomInfo: IRoomInfo;
    joinPlayerId: string;
}

declare interface MsgNotifyKicked {
    roomInfo: IRoomInfo;
}

declare interface MsgNotifyLeaveRoom {
    leavePlayerInfo: IPlayerInfo;
    roomInfo: IRoomInfo;
}

/**
 * 房间匹配请求有结果了
 */
declare interface MsgNotifyRoomAllPlayersMatchResult {
    /**当前房间信息*/
    roomInfo: IRoomInfo;
    /**如果匹配结果是失败的则有错误消息*/
    errMsg?: string;
    /**如果匹配结果是失败的则有错误码*/
    errCode?: number;
    /**匹配结果, 如果匹配是成功的，则不为空*/
    matchResult?: IMatchPlayerResultWithServer;
}

/**
 * 有玩家在房间中发起匹配请求
 */
declare interface MsgNotifyRoomAllPlayersMatchStart {
    /**当前房间信息*/
    roomInfo: IRoomInfo;
    /**发起的匹配请求id, 可用于取消请求*/
    matchReqId: string;
    /**发起玩家id*/
    reqPlayerId: string;
    /**发起的匹配参数*/
    matchParams: IMatchParamsFromRoomAllPlayer;
}

declare interface MsgNotifyRoomMsg {
    recvRoomMsg: IRecvRoomMsg;
}

declare interface MsgNotifyStartFrameSync {
    /**开始操作的玩家ID*/
    startPlayerId: string;
    /**当前房间信息*/
    roomInfo: IRoomInfo;
}

declare interface MsgNotifyStopFrameSync {
    /**停止操作的玩家ID*/
    stopPlayerId: string;
    /**当前房间信息*/
    roomInfo: IRoomInfo;
}

/**服务端广播给所有客户端的每帧数据*/
declare interface MsgNotifySyncFrame {
    /**要同步的游戏帧数据*/
    syncFrame: IGameSyncFrame;
    /**间隔上一帧过去的秒数*/
    dt: number;
}

declare interface MsgPlayerInpFrame {
    /**本帧本用户的操作列表*/
    operates: IPlayerInputOperate[];
    /**可以指定是自己的机器人的指令*/
    robotPlayerId?: string;
}

/**玩家发送同步的状态数据*/
declare interface MsgPlayerSendSyncState {
    /**状态的数据*/
    stateData: any;
    /**状态所在帧索引*/
    stateFrameIndex: number;
}

declare interface MsgRequirePlayerSyncState {
}

/**
 *将两个一样长度的数值数组相加,输出到另外一个一样长度的数值数组
 *
 * @param out
 * @param a
 * @param b
 */
export declare function numbersAdd(out: number[], a: number[], b: number[]): void;

/**
 * 解析进程入口参数为一个对象, 格式为 -配置名1=配置值1 -配置名2="带有空格 的配置值", 转为 \{ 配置名1:"配置值1",配置名2:"带有空格 的配置值" \}
 *
 * @param args 进程传入参数列表
 * @param configNamePrefix
 */
export declare function parseProcessArgv(args: string[], configNamePrefix?: string): {
    [configName: string]: string;
};

/**
 * 提取 process.argv 中 "ARGV_" 开头的值 转为配置对象
 *
 * @param env 配置名列表
 */
export declare function parseProcessEnv(env: any): {
    [configName: string]: string;
};

/**使用应用权限，强制解散房间 （原始请求对象）*/
declare interface ReqAppDismissRoom extends IAppEncryptRequest {
}

/**
 * 玩家获取认证信息(原始请求对象)
 */
declare interface ReqAuthorize extends IAppEncryptRequest {
}

/**
 * 玩家认证
 * 需要连接后立即发出请求,否则超时将被断开连接
 * */
declare interface ReqAuthorize_2 extends IPlayerInfoPara {
    /**玩家令牌,登录大厅时获得的 */
    playerToken: string;
    /**可设置房间中断线后等待重连的毫秒数,默认为60000ms(60秒),设成0表示断线后直接清理(按退出房间处理)不等待重连*/
    roomWaitReconnectTime?: number;
}

/**
 * 取消匹配
 */
declare interface ReqCancelMatch extends BasePlayerRequest {
    /**非房间发起的匹配，发起匹配请求中的所有玩家都可以取消*/
    matchReqId: string;
}

/**
 * 取消匹配请求
 * 可能发生并发,导致虽然请求成功了,但还是收到了成功结果的通知
 */
declare interface ReqCancelMatch_2 {
}

/**
 * 修改玩家自定义属性
 * 修改后同房间内的所有玩家都将收到通知
 */
declare interface ReqChangeCustomPlayerProfile {
    customPlayerProfile: string;
    /**可以指定自己的玩家机器人*/
    robotPlayerId?: string;
}

/**
 * 修改玩家自定义状态
 * 修改后房间内(如果在的话)所有玩家(包含自己)会收到通知
 */
declare interface ReqChangeCustomPlayerStatus {
    customPlayerStatus: number;
    /**可以指定自己的玩家机器人*/
    robotPlayerId?: string;
}

declare interface ReqChangePlayerTeam {
    newTeamId?: string;
    /**可以指定自己的玩家机器人*/
    robotPlayerId?: string;
}

/**
 * 修改房间信息
 * 只有房主可以修改
 * 修改后房间内所有玩家都收到通知
 */
declare interface ReqChangeRoom extends IChangeRoomPara {
}

/**
 * 创建房间
 */
declare interface ReqCreateRoom extends BasePlayerRequest, ICreateRoomPara {
}

declare interface ReqCreateRoomRobot {
    createPa: IPlayerInfoPara;
    /**同时指定加入的队伍ID*/
    teamId?: string;
}

/**
 * 解散房间
 *
 * */
declare interface ReqDismissRoom {
    roomId: string;
}

/**玩家筛选房间列表*/
declare interface ReqFilterRooms extends BasePlayerRequest {
    filter: IRoomsFilterPara;
    /**匹配结果跳过数量*/
    skip?: number;
    /**限制返回数量*/
    limit?: number;
}

declare interface ReqGetOrCreateRoom extends BasePlayerRequest, IGetOrCreateRoomPara {
}

/**
 * 获取房间在线信息
 */
declare interface ReqGetRoomOnlineInfo extends BasePlayerRequest {
    roomId: string;
}

/**
 * 加入房间
 * */
declare interface ReqJoinRoom extends IJoinRoomPara {
}

/**
 * 【仅房主】踢出房间内玩家
 *
 * */
declare interface ReqKickPlayer {
    playerId: string;
}

/**
 * 离开房间
 *
 * */
declare interface ReqLeaveRoom {
}

/**房主在大厅解散自己的房间*/
declare interface ReqOwnDismissRoom extends BasePlayerRequest {
    roomId: string;
}

/**
 * 查询匹配
 */
declare interface ReqQueryMatch extends BasePlayerRequest {
    /**匹配请求ID，用于查询匹配结果，建议2秒调用查询一次，直到超时(因为请求时超时时间已知，客户端要加个超时判断)*/
    matchReqId: string;
}

/**
 * 查询完整匹配结果
 * 会等到有结果了才返回!
 * 注意: 同时只能只有一个玩家进行查询等待,一般使用通知来获取结果即可
 */
declare interface ReqQueryMatch_2 {
}

/**
 * 断线重连
 *
 * */
declare interface ReqReconnect {
    /**之前连接上的令牌 */
    playerToken: string;
    /**可设置房间中断线后等待重连的毫秒数,默认为60000ms(60秒),设成0表示断线后直接清理(按退出房间处理)不等待重连*/
    roomWaitReconnectTime?: number;
}

declare interface ReqRecoverPlayerRoom extends BasePlayerRequest {
    playerId: string;
    playerToken: string;
    /**可更新玩家显示名*/
    updateShowName?: string;
}

/**
 * 请求追帧
 *
 * */
declare interface ReqRequestAfterFrames {
    /**使用指定的帧索引开始追帧
     * 不传则默认按下面顺序优先选择:
     * 1. 使用服务端同步状态所在帧索引开始
     * 2. 如果没有同步状态则从头开始
     * */
    startFrameIndex?: number;
}

/**
 * 请求具体的帧数据
 *
 * */
declare interface ReqRequestFrames {
    /**起始帧索引(包含)*/
    beginFrameIndex: number;
    /**结束帧索引(包含)*/
    endFrameIndex: number;
}

/**
 * 请求匹配
 */
declare interface ReqRequestMatch extends BasePlayerRequest {
    /**匹配参数*/
    matchParams: IMatchParamsFromPlayer;
}

/**
 * 发起房间所有玩家匹配请求
 * 请求成功即返回,同时房间中的所有玩家会收到通知
 * 匹配有结果了还会收到消息通知, 并且可由一个玩家调用QueryMatch等待完整匹配结果
 */
declare interface ReqRequestMatch_2 {
    /**匹配参数*/
    matchParams: IMatchParamsFromRoomAllPlayer;
}

declare interface ReqRoomRobotLeave {
    /**自己创建的机器人*/
    robotPlayerId: string;
}

/**
 * 发送房间消息
 *
 * */
declare interface ReqSendRoomMsg {
    roomMsg: IRoomMsg;
    /**可以指定自己的玩家机器人*/
    robotPlayerId?: string;
}

/**
 * 房间内开始帧同步
 *
 * */
declare interface ReqStartFrameSync {
}

/**
 * 房间内停止帧同步
 *
 * */
declare interface ReqStopFrameSync {
}

declare interface ResAppDismissRoom {
    /**解散前的房间在线信息*/
    roomOnlineInfo: IRoomOnlineInfo;
}

declare interface ResAuthorize extends BasePlayerResponse {
    /**平台生成的玩家ID*/
    playerId: string;
    /**所有需要认证的接口、服务器，都需要附带token*/
    playerToken: string;
}

declare interface ResAuthorize_2 {
    /**玩家ID*/
    playerInfo: IPlayerInfo;
}

declare interface ResCancelMatch extends BasePlayerResponse {
}

declare interface ResCancelMatch_2 {
}

declare interface ResChangeCustomPlayerProfile {
}

declare interface ResChangeCustomPlayerStatus {
}

declare interface ResChangePlayerTeam {
    roomInfo: IRoomInfo;
}

declare interface ResChangeRoom {
    /**房间信息*/
    roomInfo: IRoomInfo;
}

declare interface ResCreateRoom extends BasePlayerResponse {
    roomOnlineInfo: IRoomOnlineInfo;
}

declare interface ResCreateRoomRobot {
    /**创建的机器人id*/
    robotInfo: IPlayerInfo;
}

declare interface ResDismissRoom {
    roomInfo: IRoomInfo;
}

declare interface ResFilterRooms extends BasePlayerResponse, IRoomsFilterRes {
}

declare interface ResGetOrCreateRoom extends BasePlayerResponse, IGetOrCreateRoomRsp {
}

declare interface ResGetRoomOnlineInfo extends BasePlayerResponse {
    roomOnlineInfo: IRoomOnlineInfo;
}

declare interface ResJoinRoom {
    roomInfo: IRoomInfo;
}

declare interface ResKickPlayer {
}

declare interface ResLeaveRoom {
}

declare interface ResOwnDismissRoom extends BasePlayerResponse {
    roomOnlineInfo: IRoomOnlineInfo;
}

declare interface ResQueryMatch extends BasePlayerResponse {
    /**当前匹配是否有结果*/
    hasResult: boolean;
    /**如果匹配结果是失败的则有错误消息*/
    errMsg?: string;
    /**如果匹配结果是失败的则有错误码*/
    errCode?: number;
    /**匹配结果, 如果匹配有结果并且是成功的，则不为空*/
    matchResult?: IMatchResult;
}

declare interface ResQueryMatch_2 {
    /**匹配结果, 同时房间中的对应玩家也会收到通知*/
    matchResult: IMatchResult;
}

declare interface ResReconnect {
    /**当前玩家id*/
    playerId: string;
    /**当前所在房间信息,如果没在房间中则为 null*/
    currRoomInfo: IRoomInfo | null;
}

declare interface ResRecoverPlayerRoom extends BasePlayerResponse {
    /**当前玩家在服务器还保留的房间信息*/
    roomOnlineInfo: IRoomOnlineInfo | null;
}

declare interface ResRequestAfterFrames extends IAfterFrames {
}

declare interface ResRequestFrames {
    /**帧数组*/
    frames: IGameSyncFrame[];
}

declare interface ResRequestMatch extends BasePlayerResponse {
    /**匹配请求ID，用于查询匹配结果，建议2秒调用查询一次，直到超时*/
    matchReqId: string;
}

declare interface ResRequestMatch_2 {
    /**匹配请求id*/
    matchReqId: string;
}

declare interface ResRoomRobotLeave {
    robotInfo: IPlayerInfo;
}

declare interface ResSendRoomMsg {
}

declare interface ResStartFrameSync {
}

declare interface ResStopFrameSync {
}

/**通用结果对象的生成类*/
export declare class Result<T> {
    /**
     * 构建一个错误的结果对象
     *
     * @public
     * @typeParam T
     * @param errRet
     * @returns
     */
    static buildErr<T, T2>(errRet: IResult<T2>): IResult<T>;
    /**
     * 构建一个错误的结果对象
     *
     * @public
     * @typeParam T
     * @param errMsg
     * @param code=0
     * @returns
     */
    static buildErr<T>(errMsg: string, code?: number): IResult<T>;
    /**
     * 构建一个成功的结果对象
     *
     * @public
     * @typeParam T
     * @param data
     * @returns
     */
    static buildSucc<T>(data: T): IResult<T>;
    /**
     *将一个类型的成功结果转为另外一个
     *
     * @typeParam TSource
     * @typeParam TTarget
     * @param source 成功的对象, 注意必须传入ifSuccGetData参数!
     * @param ifSuccGetData 如果结果是正确的则需要换一个目标类型的data
     * @returns
     */
    static transition<TSource, TTarget>(source: IResultSucc<TSource>, ifSuccGetData: () => TTarget): IResult<TTarget>;
    /**
     *将一个类型的失败结果转为另外一个
     *
     * @typeParam TSource
     * @typeParam TTarget
     * @param source 失败的对象
     * @returns
     */
    static transition<TSource, TTarget>(source: IResultErr<TSource>): IResult<TTarget>;
    /**
     *将一个类型的结果转为另外一个类型
     *
     * @typeParam TSource
     * @typeParam TTarget
     * @param source 成功的对象, 注意必须传入ifSuccGetData参数!
     * @param ifSuccGetData 如果结果是正确的则需要换一个目标类型的data
     * @returns
     */
    static transition<TSource, TTarget>(source: IResult<TSource>, ifSuccGetData: () => TTarget): IResult<TTarget>;
}

/**
 * 房间功能模块
 *
 * [同时只能在一个房间中]
 *
 * 如果用了 GroupRoom , 则在相关事件中需要使用 if(GroupRoom.ins.currGroupRoom) 来判断当前是在组队房间中
 *
 */
export declare class Room {
    /**单例*/
    static ins: Room;

    constructor(game: Game);
    dispose(): Promise<void>;
    /**
     * 是否启用断线重连,启用则在断开后,reconnectWaitSec秒后重连
     */
    get enabledReconnect(): boolean;
    set enabledReconnect(v: boolean);
    /**
     * 断线重连等待秒数
     */
    get reconnectWaitSec(): number;
    set reconnectWaitSec(v: number);
    /**可设置房间中断线后等待重连的毫秒数(认证和重连时使用),默认为60000ms(60秒),设成0表示断线后直接清理(按退出房间处理)不等待重连*/
    get roomWaitReconnectTime(): number | undefined;
    set roomWaitReconnectTime(v: number | undefined);
    /**
     * 房间的所有事件
     */
    readonly events: RoomEvents;
    /**
     * 获取当前所在房间信息
     */
    get currRoomInfo(): IRoomInfo | null;
    /**
     * 在房间中才有的当前玩家信息对象, 请不要保存本属性, 因为每次数据有更新都会改变引用, 请每次都读取本属性
     */
    get myPlayerInfo(): IPlayerInfo | null;
    /**将事件注册到gameClient中*/
    /**关闭和释放gameClient*/

    /**
     * 使用当前指定的玩家id和token，进行认证并尝试恢复之前所在房间(如果玩家之前在房间中断线的该房间还保留着玩家的信息才可以恢复)
     * @param updateShowName 可同时更新玩家显示名
     */
    recoverPlayerRoom(updateShowName?: string): Promise<IResult<IRoomInfo>>;
    /**
     * 获取房间在线信息（不进入房间也可以获取）
     *
     * @param roomId 房间ID
     */
    getOnlineRoomInfo(roomId: string): Promise<IResult<IRoomOnlineInfo>>;
    /**
     * 筛选在线房间列表（不进入房间也可以获取）
     * @param filter
     * @param [skip]
     * @param [limit]
     */
    filterRooms(filter: IRoomsFilterPara, skip?: number, limit?: number): Promise<IResult<IRoomsFilterRes>>;
    /**
     * 创建一个自定义房间并进入, 成功则可使用 this.currRoomInfo 可获取当前所在的房间信息
     *
     * @param playerPara 玩家信息参数
     * @param roomPara 房间信息参数
     * @param teamId 同时加入的队伍id
     */
    createRoom(playerPara: IPlayerInfoPara, roomPara: ICreateRoomPara, teamId?: string): Promise<IResult<IRoomInfo>>;

    /**
     * 加入指定房间, 成功则可使用 this.currRoomInfo 可获取当前所在的房间信息
     *
     * @param playerPara 玩家信息参数
     * @param roomId 房间ID
     * @param teamId 同时加入的队伍id
     * @deprecated 本重载已弃用, 将在下个版本移除!!
     */
    joinRoom(playerPara: IPlayerInfoPara, roomId: string, teamId?: string): Promise<IResult<IRoomInfo>>;
    /**
     * 加入指定房间, 成功则可使用 this.currRoomInfo 可获取当前所在的房间信息
     *
     * @param playerPara 玩家信息参数
     * @param joinRoomPara 加入房间参数, 根据房间的加入模式需要传入对应的数据
     */
    joinRoom(playerPara: IPlayerInfoPara, joinRoomPara: IJoinRoomPara): Promise<IResult<IRoomInfo>>;
    /**
     * 加入指定游戏服务器的房间, 成功则可使用 this.currRoomInfo 可获取当前所在的房间信息
     *
     * @deprecated 本重载已弃用, 将在下个版本移除!! 请使用 joinRoom
     *
     * @param gameServerUrl 游戏服务器地址
     * @param playerPara 玩家信息参数
     * @param roomId 房间ID
     * @param teamId 同时加入的队伍id
     */
    joinRoomByServer(gameServerUrl: string, playerPara: IPlayerInfoPara, roomId: string, teamId?: string): Promise<IResult<IRoomInfo>>;
    /**
     * 加入指定游戏服务器的房间, 成功则可使用 this.currRoomInfo 可获取当前所在的房间信息
     *
     * @deprecated 本重载已弃用, 将在下个版本移除!! 请使用 joinRoom
     *
     * @param gameServerUrl 游戏服务器地址
     * @param playerPara 玩家信息参数
     * @param para 加入房间参数|房间ID
     * @param teamId 同时加入的队伍id
     */
    joinRoomByServer(gameServerUrl: string, playerPara: IPlayerInfoPara, para: IJoinRoomPara): Promise<IResult<IRoomInfo>>;
    /**
     * 加入或创建指定条件的房间, 服务器存在指定条件并且未满房间, 则优先加入房间, 否则创建同条件的房间, 可能存在创建失败(匹配条件的房间超过服务器限额)
     * @param playerPara
     * @param joinRoomPara
     * @param matchOrCreateRoomPara
     */
    joinOrCreateRoom(playerPara: IPlayerInfoPara, joinRoomPara: IJoinRoomPara, matchOrCreateRoomPara: IGetOrCreateRoomPara): Promise<IResult<IRoomInfo>>;
    /**
     * 退出当前房间
     * @returns
     */
    leaveRoom(): Promise<IResult<null>>;
    /**
     * 【仅房主】踢出房间玩家
     * @param playerId
     */
    kickPlayer(playerId: string): Promise<IResultSucc<unknown> | IResultErr<unknown>>;
    /**
     * 【仅房主】解散当前房间
     * @returns
     */
    dismissRoom(): Promise<IResult<null>>;
    /**
     * 修改房间信息(注意,只能房主操作),同时同步更新本地当前房间信息
     *
     * @param changePara
     */
    changeRoom(changePara: IChangeRoomPara): Promise<IResult<IRoomInfo>>;
    /**
     * 修改自己的玩家自定义属性,如果当前在房间中会同时会触发通知(房间中所有玩家)
     *
     * @param customPlayerProfile
     * @param [robotPlayerId] 可以指定自己的房间机器人
     */
    changeCustomPlayerProfile(customPlayerProfile: string, robotPlayerId?: string): Promise<IResult<null>>;
    /**
     * 修改自己的玩家自定义状态,如果当前在房间中会同时会触发通知(房间中所有玩家)
     *
     * @param customPlayerStatus
     * @param [robotPlayerId] 可以指定自己的房间机器人
     */
    changeCustomPlayerStatus(customPlayerStatus: number, robotPlayerId?: string): Promise<IResult<null>>;
    /**
     *变更自己所在队伍
     *
     * @param newTeamId 传undefined表示改为无队伍; 如果有指定队伍, 但房间不存在该队伍id, 则需要房间开启自由队伍选项
     * @param [robotPlayerId] 可以指定自己的房间机器人
     */
    changePlayerTeam(newTeamId?: string, robotPlayerId?: string): Promise<IResult<null>>;
    /**
     * 发送房间消息（自定义消息），可以指定房间里的全部玩家或部分玩家或其他玩家
     *
     * @public
     * @param roomMsg
     * @param [robotPlayerId] 可以指定自己的房间机器人
     */
    sendRoomMsg(roomMsg: IRoomMsg, robotPlayerId?: string): Promise<IResult<null>>;
    /**
     * 开始帧同步
     *
     * @public
     */
    startFrameSync(): Promise<IResult<null>>;
    /**
     * 停止帧同步
     *
     * @public
     */
    stopFrameSync(): Promise<IResult<null>>;
    /**
     * 发送玩家输入帧(加入到下一帧的操作列表)
     *
     * @public
     * @param inpOperates
     * @param [robotPlayerId] 可以指定自己的房间机器人
     */
    sendFrame(inpOperates: IPlayerInputOperate[], robotPlayerId?: string): Promise<IResult<null>>;
    /**
     * 请求追帧数据(当前的所有帧数据[+同步状态数据])
     *
     * @public
     */
    requestAfterFrames(): Promise<IResult<IAfterFrames>>;
    /**
     * 自主请求帧数组
     *
     * @public
     * @param beginFrameIndex 起始帧索引(包含)
     * @param endFrameIndex 结束帧索引(包含)
     */
    requestFrames(beginFrameIndex: number, endFrameIndex: number): Promise<IResult<IGameSyncFrame[]>>;
    /**
     * 玩家发送本地的同步状态数据(有启用状态同步的时候才可以用)
     *
     * @public
     * @param stateData
     * @param stateFrameIndex
     */
    playerSendSyncState(stateData: object, stateFrameIndex: number): Promise<IResult<null>>;
    /**
     * [在或不在房间中都可以发起匹配] 发起单独的玩家匹配, 成功则返回 [匹配请求id, 即 matchReqId] , 指定匹配结果回调来获得本次匹配请求结果
     *
     * @param matchParamsFromPlayer 匹配参数, 注意,参与匹配的这些玩家不会收到服务器通知
     * @param matchResultCallback 可指定匹配结果回调
     */
    requestMatchFromPlayers(matchParamsFromPlayer: IMatchParamsFromPlayer, matchResultCallback: (matchRet: IResult<IMatchResult>) => void): Promise<IResult<string>>;
    /**
     * [在或不在房间中都可以发起匹配] 发起单独的玩家匹配, 成功则返回 [匹配请求id, 即 matchReqId] , 指定匹配结果回调来获得本次匹配请求结果
     *
     * @param matchParamsFromPlayer 匹配参数, 注意,参与匹配的这些玩家不会收到服务器通知
     * @param matchResultCallback 可指定匹配结果回调
     */
    private requestPlayersMatch;
    /**
     * 开始等待单独的玩家匹配结果, 有结果会触发回调
     *
     * @param matchParamsFromPlayer
     * @param matchReqId 匹配请求id
     */
    /**
     * 取消单独的玩家匹配, 也会触发匹配回调. 同时因为有并发可能, 即在结果已出即将收到时,提交取消成功,但还是会触发匹配成功的回调
     *
     * @param matchReqId 匹配请求id
     */
    cancelMatchFromPlayers(matchReqId: string): Promise<IResult<null>>;
    /**
     * 玩家创建房间机器人(退出房间会同步退出)
     * @param createPa
     * @param [teamId]
     * @returns 创建的机器人信息
     */
    createRoomRobot(createPa: IPlayerInfoPara, teamId?: string): Promise<IResult<IPlayerInfo>>;
    /**
     * 玩家的指定房间机器人退出房间(即销毁)
     * @param robotPlayerId
     * @returns 销毁的机器人信息
     */
    roomRobotLeave(robotPlayerId: string): Promise<IResult<IPlayerInfo>>;
}

export declare class RoomEvents {
    constructor();
    dispose(): Promise<void>;

    /**
     * 彻底断开触发, 如下情况:
     * 1. 断开连接时没启用断线重连则触发
     * 2. 主动断开时触发, reason='ManualDisconnect'
     * 3. 断线重连失败并不再重连时触发, reason='ReconnectFailed'
     * 4. 认证失败时会断开连接, 同时触发, reason='AuthorizeFailed'
     * @param fn reason:断开原因
     */
    onDisconnected(fn: (reason?: string) => void): void;
    offDisconnected(fn: (reason?: string) => void): void;

    /**
     * [需启用断线重连:enabledReconnect]每次开始断线重连时触发, [reconnectWaitSec]秒后开始重连
     * @param fn currTryCount: 已经重试了几次了, 首次断线重连则为0
     * */
    onReconnectStart(fn: (currTryCount: number) => void): void;
    offReconnectStart(fn: (currTryCount: number) => void): void;

    /**断线重连最终有结果时触发(终于连上了,或者返回不继续尝试了)*/
    onReconnectResult(fn: (succ: boolean, err: string | null) => void): void;
    offReconnectResult(fn: (succ: boolean, err: string | null) => void): void;

    /**当前玩家不管什么原因离开了房间(主动离开,主动解散,房间被解散等等),都会触发*/
    onLeaveRoom(fn: (roomInfo: IRoomInfo) => void): void;
    offLeaveRoom(fn: (roomInfo: IRoomInfo) => void): void;

    /**当前玩家加入到房间后触发*/
    onJoinRoom(fn: (roomInfo: IRoomInfo) => void): void;
    offJoinRoom(fn: (roomInfo: IRoomInfo) => void): void;

    /**【在房间中才能收到】当接收到房间消息时触发*/
    onRecvRoomMsg(fn: (roomMsg: IRecvRoomMsg) => void): void;
    offRecvRoomMsg(fn: (roomMsg: IRecvRoomMsg) => void): void;

    /**【在房间中才能收到】玩家加入当前房间（自己操作的不触发）*/
    onPlayerJoinRoom(fn: (player: IPlayerInfo, roomInfo: IRoomInfo) => void): void;
    offPlayerJoinRoom(fn: (player: IPlayerInfo, roomInfo: IRoomInfo) => void): void;

    /**【在房间中才能收到】玩家退出当前房间（自己操作的不触发）*/
    onPlayerLeaveRoom(fn: (player: IPlayerInfo, roomInfo: IRoomInfo) => void): void;
    offPlayerLeaveRoom(fn: (player: IPlayerInfo, roomInfo: IRoomInfo) => void): void;

    /**【在房间中才能收到】被踢出当前房间，需要手动调用leaveRoom*/
    onKicked(fn: (roomInfo: IRoomInfo) => void): void;
    offKicked(fn: (roomInfo: IRoomInfo) => void): void;

    /**【在房间中才能收到】当前房间被解散（自己操作的不触发）*/
    onDismissRoom(fn: (roomInfo: IRoomInfo) => void): void;
    offDismissRoom(fn: (roomInfo: IRoomInfo) => void): void;

    /**【在房间中才能收到】房间中开始帧同步了*/
    onStartFrameSync(fn: (roomInfo: IRoomInfo, startPlayer: IPlayerInfo) => void): void;
    offStartFrameSync(fn: (roomInfo: IRoomInfo, startPlayer: IPlayerInfo) => void): void;

    /**【在房间中才能收到】房间中停止帧同步了*/
    onStopFrameSync(fn: (roomInfo: IRoomInfo, stopPlayer: IPlayerInfo) => void): void;
    offStopFrameSync(fn: (roomInfo: IRoomInfo, stopPlayer: IPlayerInfo) => void): void;

    /**【在房间中才能收到】房间中收到一个同步帧*/
    onRecvFrame(fn: (syncFrame: IGameSyncFrame, dt: number) => void): void;
    offRecvFrame(fn: (syncFrame: IGameSyncFrame, dt: number) => void): void;

    /**【在房间中才能收到】服务端要求玩家上传状态同步数据 (调用 playerSendSyncState 方法)*/
    onRequirePlayerSyncState(fn: () => void): void;
    offRequirePlayerSyncState(fn: () => void): void;

    /**【在房间中才能收到】其他玩家的网络状态变更(离线/上线)*/
    onChangePlayerNetworkState(fn: (player: IPlayerInfo) => void): void;
    offChangePlayerNetworkState(fn: (player: IPlayerInfo) => void): void;

    /**【在房间中才能收到】有玩家修改了自定义属性(只要在房间,自己也会收到)*/
    onChangeCustomPlayerProfile(fn: (changeInfo: IChangeCustomPlayerProfile) => void): void;
    offChangeCustomPlayerProfile(fn: (changeInfo: IChangeCustomPlayerProfile) => void): void;

    /**【在房间中才能收到】有玩家修改了自定义状态(只要在房间,自己也会收到)*/
    onChangeCustomPlayerStatus(fn: (changeInfo: IChangeCustomPlayerStatus) => void): void;
    offChangeCustomPlayerStatus(fn: (changeInfo: IChangeCustomPlayerStatus) => void): void;

    /**【在房间中才能收到】房间信息有修改*/
    onChangeRoom(fn: (roomInfo: IRoomInfo) => void): void;
    offChangeRoom(fn: (roomInfo: IRoomInfo) => void): void;

    /**【在房间中才能收到】有玩家修改了所在队伍(只要在房间,自己也会收到)*/
    onChangePlayerTeam(fn: (changeInfo: IChangePlayerTeam) => void): void;
    offChangePlayerTeam(fn: (changeInfo: IChangePlayerTeam) => void): void;






}

declare interface ServiceType {
    api: {
        "AppDismissRoom": {
            req: ReqAppDismissRoom;
            res: ResAppDismissRoom;
        };
        "Authorize": {
            req: ReqAuthorize;
            res: ResAuthorize;
        };
        "CancelMatch": {
            req: ReqCancelMatch;
            res: ResCancelMatch;
        };
        "CreateRoom": {
            req: ReqCreateRoom;
            res: ResCreateRoom;
        };
        "FilterRooms": {
            req: ReqFilterRooms;
            res: ResFilterRooms;
        };
        "GetOrCreateRoom": {
            req: ReqGetOrCreateRoom;
            res: ResGetOrCreateRoom;
        };
        "GetRoomOnlineInfo": {
            req: ReqGetRoomOnlineInfo;
            res: ResGetRoomOnlineInfo;
        };
        "OwnDismissRoom": {
            req: ReqOwnDismissRoom;
            res: ResOwnDismissRoom;
        };
        "QueryMatch": {
            req: ReqQueryMatch;
            res: ResQueryMatch;
        };
        "RecoverPlayerRoom": {
            req: ReqRecoverPlayerRoom;
            res: ResRecoverPlayerRoom;
        };
        "RequestMatch": {
            req: ReqRequestMatch;
            res: ResRequestMatch;
        };
    };
    msg: {};
}

declare interface ServiceType_2 {
    api: {
        "Authorize": {
            req: ReqAuthorize_2;
            res: ResAuthorize_2;
        };
        "CancelMatch": {
            req: ReqCancelMatch_2;
            res: ResCancelMatch_2;
        };
        "ChangeCustomPlayerProfile": {
            req: ReqChangeCustomPlayerProfile;
            res: ResChangeCustomPlayerProfile;
        };
        "ChangeCustomPlayerStatus": {
            req: ReqChangeCustomPlayerStatus;
            res: ResChangeCustomPlayerStatus;
        };
        "ChangePlayerTeam": {
            req: ReqChangePlayerTeam;
            res: ResChangePlayerTeam;
        };
        "ChangeRoom": {
            req: ReqChangeRoom;
            res: ResChangeRoom;
        };
        "CreateRoomRobot": {
            req: ReqCreateRoomRobot;
            res: ResCreateRoomRobot;
        };
        "DismissRoom": {
            req: ReqDismissRoom;
            res: ResDismissRoom;
        };
        "JoinRoom": {
            req: ReqJoinRoom;
            res: ResJoinRoom;
        };
        "KickPlayer": {
            req: ReqKickPlayer;
            res: ResKickPlayer;
        };
        "LeaveRoom": {
            req: ReqLeaveRoom;
            res: ResLeaveRoom;
        };
        "QueryMatch": {
            req: ReqQueryMatch_2;
            res: ResQueryMatch_2;
        };
        "Reconnect": {
            req: ReqReconnect;
            res: ResReconnect;
        };
        "RequestAfterFrames": {
            req: ReqRequestAfterFrames;
            res: ResRequestAfterFrames;
        };
        "RequestFrames": {
            req: ReqRequestFrames;
            res: ResRequestFrames;
        };
        "RequestMatch": {
            req: ReqRequestMatch_2;
            res: ResRequestMatch_2;
        };
        "RoomRobotLeave": {
            req: ReqRoomRobotLeave;
            res: ResRoomRobotLeave;
        };
        "SendRoomMsg": {
            req: ReqSendRoomMsg;
            res: ResSendRoomMsg;
        };
        "StartFrameSync": {
            req: ReqStartFrameSync;
            res: ResStartFrameSync;
        };
        "StopFrameSync": {
            req: ReqStopFrameSync;
            res: ResStopFrameSync;
        };
    };
    msg: {
        "Disconnect": MsgDisconnect;
        "NotifyChangeCustomPlayerProfile": MsgNotifyChangeCustomPlayerProfile;
        "NotifyChangeCustomPlayerStatus": MsgNotifyChangeCustomPlayerStatus;
        "NotifyChangePlayerNetworkState": MsgNotifyChangePlayerNetworkState;
        "NotifyChangePlayerTeam": MsgNotifyChangePlayerTeam;
        "NotifyChangeRoom": MsgNotifyChangeRoom;
        "NotifyDismissRoom": MsgNotifyDismissRoom;
        "NotifyJoinRoom": MsgNotifyJoinRoom;
        "NotifyKicked": MsgNotifyKicked;
        "NotifyLeaveRoom": MsgNotifyLeaveRoom;
        "NotifyRoomAllPlayersMatchResult": MsgNotifyRoomAllPlayersMatchResult;
        "NotifyRoomAllPlayersMatchStart": MsgNotifyRoomAllPlayersMatchStart;
        "NotifyRoomMsg": MsgNotifyRoomMsg;
        "NotifyStartFrameSync": MsgNotifyStartFrameSync;
        "NotifyStopFrameSync": MsgNotifyStopFrameSync;
        "NotifySyncFrame": MsgNotifySyncFrame;
        "PlayerInpFrame": MsgPlayerInpFrame;
        "PlayerSendSyncState": MsgPlayerSendSyncState;
        "RequirePlayerSyncState": MsgRequirePlayerSyncState;
    };
}

export { }
