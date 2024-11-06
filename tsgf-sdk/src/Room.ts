import { Game } from "./Game";
import { GameClient } from "./gameClient/GameClient";
import { EventEmitter } from "./tsgf/EventEmitter";
import { ICancelableExec } from "./tsgf/ICancelable";
import { IMatchFromPlayer, IMatchParamsBase, IMatchParamsFromPlayer, IMatchParamsFromRoomAllPlayer, IMatchPlayerResultWithServer, IMatchResult } from "./tsgf/match/Models";
import { IChangeCustomPlayerProfile, IChangeCustomPlayerStatus, IChangePlayerTeam, IPlayerInfo, IPlayerInfoPara } from "./tsgf/player/IPlayerInfo";
import { ErrorCodes, IResult, Result } from "./tsgf/Result";
import { IAfterFrames, IGameSyncFrame, IPlayerInputOperate } from "./tsgf/room/IGameFrame";
import { IChangeRoomPara, ICreateRoomPara, IGetOrCreateRoomPara, IJoinRoomPara, IRoomInfo, IRoomOnlineInfo, IRoomsFilterPara, IRoomsFilterRes } from "./tsgf/room/IRoomInfo";
import { IRecvRoomMsg, IRoomMsg } from "./tsgf/room/IRoomMsg";
import { delayCanCancel } from "./tsgf/Utils";

export class RoomEvents {
    private _eventEmitter: EventEmitter;

    constructor() {
        this._eventEmitter = new EventEmitter();
    }

    public async dispose(): Promise<void> {
        this._eventEmitter.removeAllListeners();
        //@ts-ignore
        this._eventEmitter = undefined;
    }

    /**
     * @internal
     */
    __emitDisconnected(reason?: string): void { this._eventEmitter.emit('Disconnect', ...arguments); }
    /**
     * 彻底断开触发, 如下情况:
     * 1. 断开连接时没启用断线重连则触发
     * 2. 主动断开时触发, reason='ManualDisconnect'
     * 3. 断线重连失败并不再重连时触发, reason='ReconnectFailed'
     * 4. 认证失败时会断开连接, 同时触发, reason='AuthorizeFailed'
     * @param fn reason:断开原因
     */
    public onDisconnected(fn: (reason?: string) => void): void { this._eventEmitter.on('Disconnected', fn); }
    public offDisconnected(fn: (reason?: string) => void): void { this._eventEmitter.off('Disconnected', fn); }

    /**
     * @internal
     */
    __emitReconnectStart(currTryCount: number): void { this._eventEmitter.emit('ReconnectStart', ...arguments); }
    /**
     * [需启用断线重连:enabledReconnect]每次开始断线重连时触发, [reconnectWaitSec]秒后开始重连
     * @param fn currTryCount: 已经重试了几次了, 首次断线重连则为0
     * */
    public onReconnectStart(fn: (currTryCount: number) => void): void { this._eventEmitter.on('ReconnectStart', fn); }
    public offReconnectStart(fn: (currTryCount: number) => void): void { this._eventEmitter.off('ReconnectStart', fn); }

    /**
     * @internal
     */
    __emitReconnectResult(succ: boolean, err: string | null): void { this._eventEmitter.emit('ReconnectResult', ...arguments); }
    /**断线重连最终有结果时触发(终于连上了,或者返回不继续尝试了)*/
    public onReconnectResult(fn: (succ: boolean, err: string | null) => void): void { this._eventEmitter.on('ReconnectResult', fn); }
    public offReconnectResult(fn: (succ: boolean, err: string | null) => void): void { this._eventEmitter.off('ReconnectResult', fn); }

    /**
     * @internal
     */
    __emitLeaveRoom(roomInfo: IRoomInfo): void { this._eventEmitter.emit('LeaveRoom', ...arguments); }
    /**当前玩家不管什么原因离开了房间(主动离开,主动解散,房间被解散等等),都会触发*/
    public onLeaveRoom(fn: (roomInfo: IRoomInfo) => void): void { this._eventEmitter.on('LeaveRoom', fn); }
    public offLeaveRoom(fn: (roomInfo: IRoomInfo) => void): void { this._eventEmitter.off('LeaveRoom', fn); }

    /**
     * @internal
     */
    __emitJoinRoom(roomInfo: IRoomInfo): void { this._eventEmitter.emit('JoinRoom', ...arguments); }
    /**当前玩家加入到房间后触发*/
    public onJoinRoom(fn: (roomInfo: IRoomInfo) => void): void { this._eventEmitter.on('JoinRoom', fn); }
    public offJoinRoom(fn: (roomInfo: IRoomInfo) => void): void { this._eventEmitter.off('JoinRoom', fn); }


    /**
     * @internal
     */
    __emitRecvRoomMsg(roomMsg: IRecvRoomMsg): void { this._eventEmitter.emit('RecvRoomMsg', ...arguments); }
    /**【在房间中才能收到】当接收到房间消息时触发*/
    public onRecvRoomMsg(fn: (roomMsg: IRecvRoomMsg) => void): void { this._eventEmitter.on('RecvRoomMsg', fn); }
    public offRecvRoomMsg(fn: (roomMsg: IRecvRoomMsg) => void): void { this._eventEmitter.off('RecvRoomMsg', fn); }

    /**
     * @internal
     */
    __emitPlayerJoinRoom(player: IPlayerInfo, roomInfo: IRoomInfo): void { this._eventEmitter.emit('PlayerJoinRoom', ...arguments); }
    /**【在房间中才能收到】玩家加入当前房间（自己操作的不触发）*/
    public onPlayerJoinRoom(fn: (player: IPlayerInfo, roomInfo: IRoomInfo) => void): void { this._eventEmitter.on('PlayerJoinRoom', fn); }
    public offPlayerJoinRoom(fn: (player: IPlayerInfo, roomInfo: IRoomInfo) => void): void { this._eventEmitter.off('PlayerJoinRoom', fn); }

    /**
     * @internal
     */
    __emitPlayerLeaveRoom(player: IPlayerInfo, roomInfo: IRoomInfo): void { this._eventEmitter.emit('PlayerLeaveRoom', ...arguments); }
    /**【在房间中才能收到】玩家退出当前房间（自己操作的不触发）*/
    public onPlayerLeaveRoom(fn: (player: IPlayerInfo, roomInfo: IRoomInfo) => void): void { this._eventEmitter.on('PlayerLeaveRoom', fn); }
    public offPlayerLeaveRoom(fn: (player: IPlayerInfo, roomInfo: IRoomInfo) => void): void { this._eventEmitter.off('PlayerLeaveRoom', fn); }

    /**
     * @internal
     */
    __emitKicked(roomInfo: IRoomInfo): void { this._eventEmitter.emit('Kicked', ...arguments); }
    /**【在房间中才能收到】被踢出当前房间，需要手动调用leaveRoom*/
    public onKicked(fn: (roomInfo: IRoomInfo) => void): void { this._eventEmitter.on('Kicked', fn); }
    public offKicked(fn: (roomInfo: IRoomInfo) => void): void { this._eventEmitter.off('Kicked', fn); }

    /**
     * @internal
     */
    __emitDismissRoom(roomInfo: IRoomInfo): void { this._eventEmitter.emit('DismissRoom', ...arguments); }
    /**【在房间中才能收到】当前房间被解散（自己操作的不触发）*/
    public onDismissRoom(fn: (roomInfo: IRoomInfo) => void): void { this._eventEmitter.on('DismissRoom', fn); }
    public offDismissRoom(fn: (roomInfo: IRoomInfo) => void): void { this._eventEmitter.off('DismissRoom', fn); }

    /**
     * @internal
     */
    __emitStartFrameSync(roomInfo: IRoomInfo, startPlayer: IPlayerInfo): void { this._eventEmitter.emit('StartFrameSync', ...arguments); }
    /**【在房间中才能收到】房间中开始帧同步了*/
    public onStartFrameSync(fn: (roomInfo: IRoomInfo, startPlayer: IPlayerInfo) => void): void { this._eventEmitter.on('StartFrameSync', fn); }
    public offStartFrameSync(fn: (roomInfo: IRoomInfo, startPlayer: IPlayerInfo) => void): void { this._eventEmitter.off('StartFrameSync', fn); }

    /**
     * @internal
     */
    __emitStopFrameSync(roomInfo: IRoomInfo, stopPlayer: IPlayerInfo): void { this._eventEmitter.emit('StopFrameSync', ...arguments); }
    /**【在房间中才能收到】房间中停止帧同步了*/
    public onStopFrameSync(fn: (roomInfo: IRoomInfo, stopPlayer: IPlayerInfo) => void): void { this._eventEmitter.on('StopFrameSync', fn); }
    public offStopFrameSync(fn: (roomInfo: IRoomInfo, stopPlayer: IPlayerInfo) => void): void { this._eventEmitter.off('StopFrameSync', fn); }

    /**
     * @internal
     */
    __emitRecvFrame(syncFrame: IGameSyncFrame, dt: number): void { this._eventEmitter.emit('RecvFrame', ...arguments); }
    /**【在房间中才能收到】房间中收到一个同步帧*/
    public onRecvFrame(fn: (syncFrame: IGameSyncFrame, dt: number) => void): void { this._eventEmitter.on('RecvFrame', fn); }
    public offRecvFrame(fn: (syncFrame: IGameSyncFrame, dt: number) => void): void { this._eventEmitter.off('RecvFrame', fn); }

    /**
     * @internal
     */
    __emitRequirePlayerSyncState(): void { this._eventEmitter.emit('RequirePlayerSyncState', ...arguments); }
    /**【在房间中才能收到】服务端要求玩家上传状态同步数据 (调用 playerSendSyncState 方法)*/
    public onRequirePlayerSyncState(fn: () => void): void { this._eventEmitter.on('RequirePlayerSyncState', fn); }
    public offRequirePlayerSyncState(fn: () => void): void { this._eventEmitter.off('RequirePlayerSyncState', fn); }

    /**
     * @internal
     */
    __emitChangePlayerNetworkState(player: IPlayerInfo): void { this._eventEmitter.emit('RequirePlayerSyncState', ...arguments); }
    /**【在房间中才能收到】其他玩家的网络状态变更(离线/上线)*/
    public onChangePlayerNetworkState(fn: (player: IPlayerInfo) => void): void { this._eventEmitter.on('RequirePlayerSyncState', fn); }
    public offChangePlayerNetworkState(fn: (player: IPlayerInfo) => void): void { this._eventEmitter.off('RequirePlayerSyncState', fn); }

    /**
     * @internal
     */
    __emitChangeCustomPlayerProfile(changeInfo: IChangeCustomPlayerProfile): void { this._eventEmitter.emit('ChangeCustomPlayerProfile', ...arguments); }
    /**【在房间中才能收到】有玩家修改了自定义属性(只要在房间,自己也会收到)*/
    public onChangeCustomPlayerProfile(fn: (changeInfo: IChangeCustomPlayerProfile) => void): void { this._eventEmitter.on('ChangeCustomPlayerProfile', fn); }
    public offChangeCustomPlayerProfile(fn: (changeInfo: IChangeCustomPlayerProfile) => void): void { this._eventEmitter.off('ChangeCustomPlayerProfile', fn); }

    /**
     * @internal
     */
    __emitChangeCustomPlayerStatus(changeInfo: IChangeCustomPlayerStatus): void { this._eventEmitter.emit('ChangeCustomPlayerStatus', ...arguments); }
    /**【在房间中才能收到】有玩家修改了自定义状态(只要在房间,自己也会收到)*/
    public onChangeCustomPlayerStatus(fn: (changeInfo: IChangeCustomPlayerStatus) => void): void { this._eventEmitter.on('ChangeCustomPlayerStatus', fn); }
    public offChangeCustomPlayerStatus(fn: (changeInfo: IChangeCustomPlayerStatus) => void): void { this._eventEmitter.off('ChangeCustomPlayerStatus', fn); }

    /**
     * @internal
     */
    __emitChangeRoom(roomInfo: IRoomInfo): void { this._eventEmitter.emit('ChangeRoom', ...arguments); }
    /**【在房间中才能收到】房间信息有修改*/
    public onChangeRoom(fn: (roomInfo: IRoomInfo) => void): void { this._eventEmitter.on('ChangeRoom', fn); }
    public offChangeRoom(fn: (roomInfo: IRoomInfo) => void): void { this._eventEmitter.off('ChangeRoom', fn); }

    /**
     * @internal
     */
    __emitChangePlayerTeam(changeInfo: IChangePlayerTeam): void { this._eventEmitter.emit('ChangePlayerTeam', ...arguments); }
    /**【在房间中才能收到】有玩家修改了所在队伍(只要在房间,自己也会收到)*/
    public onChangePlayerTeam(fn: (changeInfo: IChangePlayerTeam) => void): void { this._eventEmitter.on('ChangePlayerTeam', fn); }
    public offChangePlayerTeam(fn: (changeInfo: IChangePlayerTeam) => void): void { this._eventEmitter.off('ChangePlayerTeam', fn); }

    /**
     * @internal
     */
    __emitRoomAllPlayersMatchStart(matchReqId: string, reqPlayerId: string, matchParams: IMatchParamsFromRoomAllPlayer): void { this._eventEmitter.emit('RoomAllPlayersMatchStart', ...arguments); }
    /**
     * 【在房间中才能收到】有玩家发起了全房间玩家匹配(自己也会收到)
     * @internal
     */
    public onRoomAllPlayersMatchStart(fn: (matchReqId: string, reqPlayerId: string, matchParams: IMatchParamsFromRoomAllPlayer) => void): void { this._eventEmitter.on('RoomAllPlayersMatchStart', fn); }
    /**
     * @internal
     */
    public offRoomAllPlayersMatchStart(fn: (matchReqId: string, reqPlayerId: string, matchParams: IMatchParamsFromRoomAllPlayer) => void): void { this._eventEmitter.on('RoomAllPlayersMatchStart', fn); }

    /**
     * @internal
     */
    __emitRoomAllPlayersMatchResult(errMsg?: string, errCode?: ErrorCodes, matchResult?: IMatchPlayerResultWithServer): void { this._eventEmitter.emit('RoomAllPlayersMatchResult', ...arguments); }
    /**【在房间中才能收到】全房间玩家匹配有结果了(自己也会收到)
     * @internal
     */
    public onRoomAllPlayersMatchResult(fn: (errMsg?: string, errCode?: ErrorCodes, matchResult?: IMatchPlayerResultWithServer) => void): void { this._eventEmitter.on('RoomAllPlayersMatchResult', fn); }
    /**
     * @internal
     */
    public offRoomAllPlayersMatchResult(fn: (errMsg?: string, errCode?: ErrorCodes, matchResult?: IMatchPlayerResultWithServer) => void): void { this._eventEmitter.on('RoomAllPlayersMatchResult', fn); }

}

/**
 * 房间功能模块
 * 
 * [同时只能在一个房间中] 
 * 
 * 如果用了 GroupRoom , 则在相关事件中需要使用 if(GroupRoom.ins.currGroupRoom) 来判断当前是在组队房间中
 *
 */
export class Room {

    /**单例*/
    public static ins: Room;

    private _game: Game;
    /**
     * @internal
     */
    __gameClient?: GameClient;

    constructor(game: Game) {
        this._game = game;
    }

    public async dispose(): Promise<void> {
        await this.__gameClient?.disconnect();
        this.__gameClient = undefined;
        await this.events.dispose();
        //@ts-ignore
        this._game = undefined;
    }


    private _enabledReconnect: boolean = true;
    /**
     * 是否启用断线重连,启用则在断开后,reconnectWaitSec秒后重连
     */
    public get enabledReconnect(): boolean {
        return this._enabledReconnect;
    }
    public set enabledReconnect(v: boolean) {
        this._enabledReconnect = v;
        if (this.__gameClient) this.__gameClient.enabledReconnect = v;
    }

    private _reconnectWaitSec: number = 2;
    /**
     * 断线重连等待秒数
     */
    public get reconnectWaitSec(): number {
        return this._reconnectWaitSec;
    }
    public set reconnectWaitSec(v: number) {
        this._reconnectWaitSec = v;
        if (this.__gameClient) this.__gameClient.reconnectWaitSec = v;
    }

    protected _roomWaitReconnectTime?: number;
    /**可设置房间中断线后等待重连的毫秒数(认证和重连时使用),默认为60000ms(60秒),设成0表示断线后直接清理(按退出房间处理)不等待重连*/
    public get roomWaitReconnectTime(): number | undefined {
        return this._roomWaitReconnectTime;
    }
    public set roomWaitReconnectTime(v: number | undefined) {
        this._roomWaitReconnectTime = v;
        if (this.__gameClient) this.__gameClient.roomWaitReconnectTime = v;
    }

    /**
     * 房间的所有事件
     */
    public readonly events = new RoomEvents();

    /**
     * 获取当前所在房间信息
    */
    public get currRoomInfo(): IRoomInfo | null {
        return this.__gameClient?.currRoomInfo ?? null;
    }
    /**
     * 在房间中才有的当前玩家信息对象, 请不要保存本属性, 因为每次数据有更新都会改变引用, 请每次都读取本属性
    */
    public get myPlayerInfo(): IPlayerInfo | null {
        return this.__gameClient?.currPlayerInfo ?? null;
    }

    /**将事件注册到gameClient中*/
    private _setGameClientHandler() {
        if (this.__gameClient) {
            this.__gameClient.enabledReconnect = this._enabledReconnect;
            this.__gameClient.reconnectWaitSec = this._reconnectWaitSec;

            this.__gameClient.onJoinRoom = (r) => this.events.__emitJoinRoom(r);
            this.__gameClient.onLeaveRoom = (r) => this.events.__emitLeaveRoom(r);
            this.__gameClient.onDisconnected = (r) => this.events.__emitDisconnected(r);
            this.__gameClient.onDisconnected = (r) => this.events.__emitDisconnected(r);
            this.__gameClient.onReconnectStart = (r) => this.events.__emitReconnectStart(r);
            this.__gameClient.onReconnectResult = (r, r2) => this.events.__emitReconnectResult(r, r2);
            this.__gameClient.onRecvRoomMsg = (msg) => this.events.__emitRecvRoomMsg(msg);
            this.__gameClient.onPlayerJoinRoom = (r, r2) => this.events.__emitPlayerJoinRoom(r, r2);
            this.__gameClient.onPlayerLeaveRoom = (r, r2) => this.events.__emitPlayerLeaveRoom(r, r2);
            this.__gameClient.onKicked = (r) => this.events.__emitKicked(r);
            this.__gameClient.onDismissRoom = (r) => this.events.__emitDismissRoom(r);
            this.__gameClient.onStartFrameSync = (r, r2) => this.events.__emitStartFrameSync(r, r2);
            this.__gameClient.onStopFrameSync = (r, r2) => this.events.__emitStopFrameSync(r, r2);
            this.__gameClient.onRecvFrame = (r, r2) => this.events.__emitRecvFrame(r, r2);
            this.__gameClient.onRequirePlayerSyncState = () => this.events.__emitRequirePlayerSyncState();
            this.__gameClient.onChangePlayerNetworkState = (r) => this.events.__emitChangePlayerNetworkState(r);
            this.__gameClient.onChangeCustomPlayerProfile = (r) => this.events.__emitChangeCustomPlayerProfile(r);
            this.__gameClient.onChangeCustomPlayerStatus = (r) => this.events.__emitChangeCustomPlayerStatus(r);
            this.__gameClient.onChangeRoom = (r) => this.events.__emitChangeRoom(r);
            this.__gameClient.onChangePlayerTeam = (r) => this.events.__emitChangePlayerTeam(r);
            this.__gameClient.onRoomAllPlayersMatchStart = (r, r2, r3) => this.events.__emitRoomAllPlayersMatchStart(r, r2, r3);
            this.__gameClient.onRoomAllPlayersMatchResult = (r, r2, r3) => this.events.__emitRoomAllPlayersMatchResult(r, r2, r3);
        }
    }
    /**关闭和释放gameClient*/
    private async _disposeGameClient(): Promise<void> {
        if (this.__gameClient) {
            await this.__gameClient.disconnect();
            this.__gameClient = undefined;
        }
    }
    /**
     * 创建gameClient并连接和认证
     * @internal
    */
    async __createGameClient(gameServerUrl: string, playerPara: IPlayerInfoPara): Promise<IResult<null>> {

        await this._disposeGameClient();

        this.__gameClient = new GameClient(gameServerUrl, this._game.__myPlayerToken, undefined, this._roomWaitReconnectTime);
        let authRet = await this.__gameClient.authorize(playerPara);
        if (!authRet.succ) {
            await this._disposeGameClient();
            return Result.transition(authRet);
        }

        this._setGameClientHandler();
        return Result.buildSucc(null);
    }

    /**
     * 使用当前指定的玩家id和token，进行认证并尝试恢复之前所在房间(如果玩家之前在房间中断线的该房间还保留着玩家的信息才可以恢复)
     * @param updateShowName 可同时更新玩家显示名
     */
    public async recoverPlayerRoom(updateShowName?: string): Promise<IResult<IRoomInfo>> {
        let ret = await this._game.__hallClient
            .recoverPlayerRoom(this._game.__myPlayerId, this._game.__myPlayerToken, updateShowName);
        //这一步失败，一般是认证没通过
        if (!ret.succ) return Result.transition(ret);

        //如果不在房间中，就没必要恢复房间数据了
        let roomOnlineInfo = ret.data;
        if (!roomOnlineInfo || !roomOnlineInfo.gameServerUrl) {
            return Result.buildErr('当前不在房间中，请到大厅操作！', ErrorCodes.RoomNotIn);
        }

        //开始游戏服务器的重连操作
        await this._disposeGameClient();
        this.__gameClient = new GameClient(roomOnlineInfo.gameServerUrl, this._game.__myPlayerToken, undefined, this._roomWaitReconnectTime);
        let reconnectRet = await this.__gameClient.reconnect();
        if (!reconnectRet.succ) {
            await this._disposeGameClient();
            return Result.transition(reconnectRet);
        }
        this._setGameClientHandler();

        //成功
        return Result.buildSucc(this.__gameClient.currRoomInfo!);
    }

    /**
     * 获取房间在线信息（不进入房间也可以获取）
     *
     * @param roomId 房间ID
     */
    public async getOnlineRoomInfo(roomId: string): Promise<IResult<IRoomOnlineInfo>> {
        let ret = await this._game.__hallClient.getRoomOnlineInfo(this._game.__myPlayerToken, roomId);
        if (!ret.succ) return Result.transition(ret);
        return Result.buildSucc(ret.data);
    }

    /**
     * 筛选在线房间列表（不进入房间也可以获取）
     * @param filter 
     * @param [skip] 
     * @param [limit] 
     */
    public async filterRooms(filter: IRoomsFilterPara, skip?: number, limit?: number): Promise<IResult<IRoomsFilterRes>> {
        let ret = await this._game.__hallClient
            .filterRooms(this._game.__myPlayerToken, filter, skip, limit);
        if (!ret.succ) return Result.transition(ret);
        return Result.buildSucc(ret.data);
    }

    /**
     * 创建一个自定义房间并进入, 成功则可使用 this.currRoomInfo 可获取当前所在的房间信息
     *
     * @param playerPara 玩家信息参数
     * @param roomPara 房间信息参数
     * @param teamId 同时加入的队伍id
     */
    public async createRoom(playerPara: IPlayerInfoPara, roomPara: ICreateRoomPara, teamId?: string): Promise<IResult<IRoomInfo>> {
        let ret = await this._game.__hallClient.createRoom(this._game.__myPlayerToken, roomPara);
        if (!ret.succ) return Result.transition(ret);

        let createRet = await this.__createGameClient(ret.data.gameServerUrl!, playerPara);
        if (!createRet.succ) return Result.transition(createRet);

        let joinRet = await this.__gameClient!.joinRoom({ roomId: ret.data.roomId, teamId });
        if (!joinRet.succ) return Result.transition(joinRet);

        return joinRet;
    }

    /**
     * Determines whether join game server room 
     * @param gameServerUrl 
     * @param playerPara 
     * @param roomId 
     * @param teamId
     * @returns  join result
     * @internal
     */
    async __joinGameServerRoom(gameServerUrl: string, playerPara: IPlayerInfoPara, joinRoomPara: IJoinRoomPara): Promise<IResult<IRoomInfo>> {
        let createRet = await this.__createGameClient(gameServerUrl, playerPara);
        if (!createRet.succ) return Result.transition(createRet);

        let joinRet = await this.__gameClient!.joinRoom(joinRoomPara);
        if (!joinRet.succ) return Result.transition(joinRet);

        return joinRet;
    }
    /**
     * 加入指定房间, 成功则可使用 this.currRoomInfo 可获取当前所在的房间信息
     *
     * @param playerPara 玩家信息参数
     * @param roomId 房间ID
     * @param teamId 同时加入的队伍id
     * @deprecated 本重载已弃用, 将在下个版本移除!!
     */
    public async joinRoom(playerPara: IPlayerInfoPara, roomId: string, teamId?: string): Promise<IResult<IRoomInfo>>;
    /**
     * 加入指定房间, 成功则可使用 this.currRoomInfo 可获取当前所在的房间信息
     *
     * @param playerPara 玩家信息参数
     * @param joinRoomPara 加入房间参数, 根据房间的加入模式需要传入对应的数据
     */
    public async joinRoom(playerPara: IPlayerInfoPara, joinRoomPara: IJoinRoomPara): Promise<IResult<IRoomInfo>>;
    /**
     * 加入指定房间, 成功则可使用 this.currRoomInfo 可获取当前所在的房间信息
     *
     * @param playerPara 玩家信息参数
     * @param roomId 房间ID
     * @param teamId 同时加入的队伍id
     */
    public async joinRoom(playerPara: IPlayerInfoPara, para: IJoinRoomPara | string, teamId?: string): Promise<IResult<IRoomInfo>> {
        let joinRoomPara: IJoinRoomPara;
        if (typeof (para) === 'string') {
            joinRoomPara = {
                roomId: para,
                teamId,
            };
        } else {
            joinRoomPara = para;
        }
        let ret = await this._game.__hallClient.getRoomOnlineInfo(this._game.__myPlayerToken, joinRoomPara.roomId);
        if (!ret.succ) return Result.transition(ret);

        return await this.__joinGameServerRoom(ret.data.gameServerUrl!, playerPara, joinRoomPara);
    }

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
    public async joinRoomByServer(gameServerUrl: string, playerPara: IPlayerInfoPara, roomId: string, teamId?: string): Promise<IResult<IRoomInfo>>;
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
    public async joinRoomByServer(gameServerUrl: string, playerPara: IPlayerInfoPara, para: IJoinRoomPara): Promise<IResult<IRoomInfo>>;
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
    public async joinRoomByServer(gameServerUrl: string, playerPara: IPlayerInfoPara, para: IJoinRoomPara | string, teamId?: string): Promise<IResult<IRoomInfo>> {
        let joinRoomPara: IJoinRoomPara;
        if (typeof (para) === 'string') {
            joinRoomPara = {
                roomId: para,
                teamId,
            };
        } else {
            joinRoomPara = para;
        }
        return await this.__joinGameServerRoom(gameServerUrl, playerPara, joinRoomPara);
    }

    /**
     * 加入或创建指定条件的房间, 服务器存在指定条件并且未满房间, 则优先加入房间, 否则创建同条件的房间, 可能存在创建失败(匹配条件的房间超过服务器限额)
     * @param playerPara 
     * @param joinRoomPara 
     * @param matchOrCreateRoomPara 
     */
    public async joinOrCreateRoom(playerPara: IPlayerInfoPara, joinRoomPara: IJoinRoomPara, matchOrCreateRoomPara: IGetOrCreateRoomPara): Promise<IResult<IRoomInfo>> {

        let getOrCreateRet = await this._game.__hallClient.getOrCreateRoom(this._game.__myPlayerToken, matchOrCreateRoomPara);
        if (!getOrCreateRet.succ) return Result.transition(getOrCreateRet);

        if (getOrCreateRet.data.createRoomOnlineInfo) {
            // 创建了房间, 则直接进入   
            return await this.__joinGameServerRoom(getOrCreateRet.data.createRoomOnlineInfo.gameServerUrl!,
                playerPara, joinRoomPara);
        }
        if (getOrCreateRet.data.matchRoomOnlineInfoList?.length) {
            // 匹配到房间了, 按顺序尝试加入
            for (const room of getOrCreateRet.data.matchRoomOnlineInfoList) {
                let joinRet = await this.__joinGameServerRoom(room.gameServerUrl!, playerPara, joinRoomPara);
                if (joinRet.succ) return joinRet;
            }
            // 都失败了,则客户端自行选择创建房间!
            return await this.createRoom(playerPara, matchOrCreateRoomPara.createRoomPara, joinRoomPara.teamId);
        }
        return Result.buildErr('未知错误: 没有匹配的结果类型!', ErrorCodes.Exception);

    }

    /**
     * 退出当前房间
     * @returns  
     */
    public async leaveRoom(): Promise<IResult<null>> {
        if (!this.__gameClient) return Result.buildErr('当前不在房间中!', ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.leaveRoom();
        return ret;
    }

    /**
     * 【仅房主】踢出房间玩家
     * @param playerId
     */
    public async kickPlayer(playerId: string) {
        if (!this.__gameClient) return Result.buildErr('当前不在房间中!', ErrorCodes.RoomNotIn);
        if (this.__gameClient.currRoomInfo!.ownerPlayerId !== this._game.__myPlayerId)
            return Result.buildErr('只有房主才能踢人!', ErrorCodes.RoomPermissionDenied);
        if (playerId === this._game.__myPlayerId)
            return Result.buildErr('您是房主，不能踢自己!', ErrorCodes.RoomPermissionDenied);
        let ret = await this.__gameClient.kickPlayer(playerId);
        return ret;
    }
    /**
     * 【仅房主】解散当前房间
     * @returns  
     */
    public async dismissRoom(): Promise<IResult<null>> {
        if (!this.__gameClient) return Result.buildErr('当前不在房间中!', ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.dismissRoom();
        return ret;
    }
    /**
     * 修改房间信息(注意,只能房主操作),同时同步更新本地当前房间信息
     *
     * @param changePara
     */
    public async changeRoom(changePara: IChangeRoomPara): Promise<IResult<IRoomInfo>> {
        if (!this.__gameClient) return Result.buildErr('当前不在房间中!', ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.changeRoom(changePara);
        return ret;
    }

    /**
     * 修改自己的玩家自定义属性,如果当前在房间中会同时会触发通知(房间中所有玩家)
     *
     * @param customPlayerProfile
     * @param [robotPlayerId] 可以指定自己的房间机器人
     */
    public async changeCustomPlayerProfile(customPlayerProfile: string, robotPlayerId?: string): Promise<IResult<null>> {
        if (!this.__gameClient) return Result.buildErr('当前不在房间中!', ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.changeCustomPlayerProfile(customPlayerProfile, robotPlayerId);
        return ret;
    }

    /**
     * 修改自己的玩家自定义状态,如果当前在房间中会同时会触发通知(房间中所有玩家)
     *
     * @param customPlayerStatus
     * @param [robotPlayerId] 可以指定自己的房间机器人
     */
    public async changeCustomPlayerStatus(customPlayerStatus: number, robotPlayerId?: string): Promise<IResult<null>> {
        if (!this.__gameClient) return Result.buildErr('当前不在房间中!', ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.changeCustomPlayerStatus(customPlayerStatus, robotPlayerId);
        return ret;
    }
    /**
     *变更自己所在队伍
     *
     * @param newTeamId 传undefined表示改为无队伍; 如果有指定队伍, 但房间不存在该队伍id, 则需要房间开启自由队伍选项
     * @param [robotPlayerId] 可以指定自己的房间机器人
     */
    public async changePlayerTeam(newTeamId?: string, robotPlayerId?: string): Promise<IResult<null>> {
        if (!this.__gameClient) return Result.buildErr('当前不在房间中!', ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.changePlayerTeam(newTeamId, robotPlayerId);
        return ret;
    }

    /**
     * 发送房间消息（自定义消息），可以指定房间里的全部玩家或部分玩家或其他玩家
     *
     * @public
     * @param roomMsg 
     * @param [robotPlayerId] 可以指定自己的房间机器人
     */
    public async sendRoomMsg(roomMsg: IRoomMsg, robotPlayerId?: string): Promise<IResult<null>> {
        if (!this.__gameClient) return Result.buildErr('当前不在房间中!', ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.sendRoomMsg(roomMsg, robotPlayerId);
        return ret;
    }

    /**
     * 开始帧同步
     *
     * @public
     */
    public async startFrameSync(): Promise<IResult<null>> {
        if (!this.__gameClient) return Result.buildErr('当前不在房间中!', ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.startFrameSync();
        return ret;
    }
    /**
     * 停止帧同步
     *
     * @public
     */
    public async stopFrameSync(): Promise<IResult<null>> {
        if (!this.__gameClient) return Result.buildErr('当前不在房间中!', ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.stopFrameSync();
        return ret;
    }

    /**
     * 发送玩家输入帧(加入到下一帧的操作列表)
     *
     * @public
     * @param inpOperates 
     * @param [robotPlayerId] 可以指定自己的房间机器人
     */
    public async sendFrame(inpOperates: IPlayerInputOperate[], robotPlayerId?: string): Promise<IResult<null>> {
        if (!this.__gameClient) return Result.buildErr('当前不在房间中!', ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.playerInpFrame(inpOperates, robotPlayerId);
        return ret;
    }


    /**
     * 请求追帧数据(当前的所有帧数据[+同步状态数据])
     *
     * @public
     */
    public async requestAfterFrames(): Promise<IResult<IAfterFrames>> {
        if (!this.__gameClient) return Result.buildErr('当前不在房间中!', ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.requestAfterFrames();
        return ret;
    }


    /**
     * 自主请求帧数组
     *
     * @public
     * @param beginFrameIndex 起始帧索引(包含)
     * @param endFrameIndex 结束帧索引(包含)
     */
    public async requestFrames(beginFrameIndex: number, endFrameIndex: number): Promise<IResult<IGameSyncFrame[]>> {
        if (!this.__gameClient) return Result.buildErr('当前不在房间中!', ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.requestFrames(beginFrameIndex, endFrameIndex);
        return ret;
    }


    /**
     * 玩家发送本地的同步状态数据(有启用状态同步的时候才可以用)
     *
     * @public
     * @param stateData
     * @param stateFrameIndex
     */
    public async playerSendSyncState(stateData: object, stateFrameIndex: number): Promise<IResult<null>> {
        if (!this.__gameClient) return Result.buildErr('当前不在房间中!', ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.playerSendSyncState(stateData, stateFrameIndex);
        return ret;
    }


    /**
     * [在或不在房间中都可以发起匹配] 发起单独的玩家匹配, 成功则返回 [匹配请求id, 即 matchReqId] , 指定匹配结果回调来获得本次匹配请求结果
     *
     * @param matchParamsFromPlayer 匹配参数, 注意,参与匹配的这些玩家不会收到服务器通知
     * @param matchResultCallback 可指定匹配结果回调
     */
    public async requestMatchFromPlayers(matchParamsFromPlayer: IMatchParamsFromPlayer
        , matchResultCallback: (matchRet: IResult<IMatchResult>) => void): Promise<IResult<string>> {
        return await this.requestPlayersMatch(matchParamsFromPlayer, matchResultCallback).waitResult();
    }
    /**
     * [在或不在房间中都可以发起匹配] 发起单独的玩家匹配, 成功则返回 [匹配请求id, 即 matchReqId] , 指定匹配结果回调来获得本次匹配请求结果
     *
     * @param matchParamsFromPlayer 匹配参数, 注意,参与匹配的这些玩家不会收到服务器通知
     * @param matchResultCallback 可指定匹配结果回调
     */
    private requestPlayersMatch(matchParamsFromPlayer: IMatchParamsFromPlayer
        , matchResultCallback: (matchRet: IResult<IMatchResult>) => void): ICancelableExec<string> {
        let waitCancel: ICancelableExec<IMatchResult> | null = null;
        let task = new Promise<IResult<string>>(async (res) => {
            let ret = await this._game.__hallClient.requestMatch(this._game.__myPlayerToken, matchParamsFromPlayer);
            if (!ret.succ) {
                return res(ret);
            }
            //成功请求匹配, 开始异步等待结果
            waitCancel = this._startWaitMatchResultFromPlayers(matchParamsFromPlayer, ret.data);
            waitCancel.waitResult().then(matchResultCallback);
            //先把请求匹配结果返回
            return res(ret);
        });
        return {
            waitResult() {
                return task;
            },
            async cancel() {
                await waitCancel?.cancel();
            },
        };
    }
    /**
     * 开始等待单独的玩家匹配结果, 有结果会触发回调
     *
     * @param matchParamsFromPlayer
     * @param matchReqId 匹配请求id
     */
    private _startWaitMatchResultFromPlayers(matchParamsFromPlayer: IMatchParamsFromPlayer, matchReqId: string): ICancelableExec<IMatchResult> {
        let timeoutTS = Date.now() + (matchParamsFromPlayer.matchTimeoutSec ?? 60) * 1000 + 2000;
        let isCancel = false;
        let currDelayCancel: ICancelableExec<any> | null = null;
        let task = new Promise<IResult<IMatchResult>>(async res => {
            while (Date.now() < timeoutTS) {
                if (isCancel) {
                    break;
                }
                currDelayCancel = delayCanCancel(500);
                await currDelayCancel.waitResult();
                if (isCancel) {
                    break;
                }
                let ret = await this._game.__hallClient.queryMatch(this._game.__myPlayerToken, matchReqId);
                if (ret) {
                    return res(ret);
                }
            }
            if (isCancel) {
                res(Result.buildErr('匹配取消', ErrorCodes.MatchRequestCancelled));
            } else {
                res(Result.buildErr('匹配超时', ErrorCodes.MatchQueryTimeout));
            }
        });
        return {
            waitResult() {
                return task;
            },
            async cancel() {
                isCancel = true;
                await currDelayCancel?.cancel();
            },
        };
    }
    /**
     * 取消单独的玩家匹配, 也会触发匹配回调. 同时因为有并发可能, 即在结果已出即将收到时,提交取消成功,但还是会触发匹配成功的回调
     *
     * @param matchReqId 匹配请求id
     */
    public async cancelMatchFromPlayers(matchReqId: string): Promise<IResult<null>> {
        let ret = await this._game.__hallClient.cancelMatch(this._game.__myPlayerToken, matchReqId);
        return ret;
    }



    /**
     * 玩家创建房间机器人(退出房间会同步退出)
     * @param createPa 
     * @param [teamId] 
     * @returns 创建的机器人信息
     */
    public async createRoomRobot(createPa: IPlayerInfoPara, teamId?: string): Promise<IResult<IPlayerInfo>> {
        if (!this.__gameClient) return Result.buildErr('当前不在房间中!', ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.createRoomRobot(createPa, teamId);
        return ret;
    }

    /**
     * 玩家的指定房间机器人退出房间(即销毁)
     * @param robotPlayerId 
     * @returns 销毁的机器人信息
     */
    public async roomRobotLeave(robotPlayerId: string): Promise<IResult<IPlayerInfo>> {
        if (!this.__gameClient) return Result.buildErr('当前不在房间中!', ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.roomRobotLeave(robotPlayerId);
        return ret;
    }
}