import { Game } from "./Game";
import { Room, RoomEvents } from "./Room";
import { EMatchFromType, IMatchParamsBase, IMatchParamsFromRoomAllPlayer, IMatchPlayerResultWithServer, IMatchResult } from "./tsgf/match/Models";
import { IChangeCustomPlayerProfile, IChangeCustomPlayerStatus, IPlayerInfo, IPlayerInfoPara } from "./tsgf/player/IPlayerInfo";
import { ErrorCodes, IResult, Result } from "./tsgf/Result";
import { ICreateRoomPara, IRoomInfo } from "./tsgf/room/IRoomInfo";
import { logger } from "./tsgf/logger";
import { Factory } from "./Factory";
import { IRecvRoomMsg, IRoomMsg } from "./tsgf/room/IRoomMsg";
import { EventEmitter } from "./tsgf/EventEmitter";

export class GroupRoomEvents {
    protected eventEmitter: EventEmitter;

    /**
     */
    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    public dispose() {
        this.eventEmitter.removeAllListeners();
    }

    /**
     * @internal
     */
    __emitLeaveGroup(roomInfo: IRoomInfo): void { this.eventEmitter.emit('LeaveGroup', ...arguments); }
    /**当前玩家不管什么原因离开了组队(主动离开,主动解散,房间被解散等等),都会触发*/
    public onLeaveGroup(fn: (roomInfo: IRoomInfo) => void): void { this.eventEmitter.on('LeaveGroup', fn); }
    public offLeaveGroup(fn: (roomInfo: IRoomInfo) => void): void { this.eventEmitter.off('LeaveGroup', fn); }

    /**
     * @internal
     */
    __emitJoinGroup(roomInfo: IRoomInfo): void { this.eventEmitter.emit('JoinGroup', ...arguments); }
    /**当前玩家加入到组队后触发*/
    public onJoinGroup(fn: (roomInfo: IRoomInfo) => void): void { this.eventEmitter.on('JoinGroup', fn); }
    public offJoinGroup(fn: (roomInfo: IRoomInfo) => void): void { this.eventEmitter.off('JoinGroup', fn); }


    /**
     * @internal
     */
    __emitGroupMatchStart(matchReqId: string, reqPlayerId: string, matchParams: IMatchParamsFromRoomAllPlayer) { this.eventEmitter.emit('GroupMatchStart', ...arguments); }
    /**
     * 组队发起了匹配时触发
     * @param fn 
     */
    public onGroupMatchStart(fn: (matchReqId: string, reqPlayerId: string, matchParams: IMatchParamsFromRoomAllPlayer) => void) { this.eventEmitter.on('GroupMatchStart', fn); }
    public offGroupMatchStart(fn: (matchReqId: string, reqPlayerId: string, matchParams: IMatchParamsFromRoomAllPlayer) => void) { this.eventEmitter.off('GroupMatchStart', fn); }

    /**
     * @internal
     */
    __emitGroupMatchResult(errMsg?: string, errCode?: ErrorCodes, matchResult?: IMatchPlayerResultWithServer) { this.eventEmitter.emit('GroupMatchResult', ...arguments); }
    /**
     * 组队匹配有结果了触发
     * 
     * 注意: 如果是成功的, 则会自动进入房间 (事件: onGroupMatchEnterRoom )
     * @param fn 
     */
    public onGroupMatchResult(fn: (errMsg?: string, errCode?: ErrorCodes, matchResult?: IMatchPlayerResultWithServer) => void) { this.eventEmitter.on('GroupMatchResult', fn); }
    public offGroupMatchResult(fn: (errMsg?: string, errCode?: ErrorCodes, matchResult?: IMatchPlayerResultWithServer) => void) { this.eventEmitter.off('GroupMatchResult', fn); }

    /**
     * @internal
     */
    __emitGroupMatchEnterRoom(result: IResult<IRoomInfo>) { this.eventEmitter.emit('GroupMatchEnterRoom', ...arguments); }
    /**
     * 当组队匹配成功并进入房间后触发
     * 
     * 如果进入匹配房间失败了就会再尝试回到组队, 可以使用 this.currGroupRoom 来判断是否成功回到组队房间
     * 
     * @param fn result.data === Room.ins.currRoomInfo
     */
    public onGroupMatchEnterRoom(fn: (result: IResult<IRoomInfo>) => void) { this.eventEmitter.on('GroupMatchEnterRoom', fn); }
    public offGroupMatchEnterRoom(fn: (result: IResult<IRoomInfo>) => void) { this.eventEmitter.off('GroupMatchEnterRoom', fn); }


    /**
     * @internal
     */
    __emitPlayerJoinGroup(player: IPlayerInfo, roomInfo: IRoomInfo): void { this.eventEmitter.emit('PlayerJoinGroup', ...arguments); }
    /**玩家加入当前组队（自己操作的不触发）*/
    public onPlayerJoinGroup(fn: (player: IPlayerInfo, roomInfo: IRoomInfo) => void): void { this.eventEmitter.on('PlayerJoinGroup', fn); }
    public offPlayerJoinGroup(fn: (player: IPlayerInfo, roomInfo: IRoomInfo) => void): void { this.eventEmitter.off('PlayerJoinGroup', fn); }

    /**
     * @internal
     */
    __emitPlayerLeaveGroup(player: IPlayerInfo, roomInfo: IRoomInfo): void { this.eventEmitter.emit('PlayerLeaveGroup', ...arguments); }
    /**玩家退出当前组队（自己操作的不触发）*/
    public onPlayerLeaveGroup(fn: (player: IPlayerInfo, roomInfo: IRoomInfo) => void): void { this.eventEmitter.on('PlayerLeaveGroup', fn); }
    public offPlayerLeaveGroup(fn: (player: IPlayerInfo, roomInfo: IRoomInfo) => void): void { this.eventEmitter.off('PlayerLeaveGroup', fn); }

    /**
     * @internal
     */
    __emitDismissGroup(roomInfo: IRoomInfo): void { this.eventEmitter.emit('DismissGroup', ...arguments); }
    /**当前组队被解散（自己操作的不触发）*/
    public onDismissGroupRoom(fn: (roomInfo: IRoomInfo) => void): void { this.eventEmitter.on('DismissGroup', fn); }
    public offDismissGroup(fn: (roomInfo: IRoomInfo) => void): void { this.eventEmitter.off('DismissGroup', fn); }


    /**
     * @internal
     */
    __emitRecvGroupMsg(msg: IRecvRoomMsg) { this.eventEmitter.emit('RecvGroupMsg', ...arguments); }
    /**收到组队中玩家发的自定义消息*/
    public onRecvGroupMsg(fn: (msg: IRecvRoomMsg) => void) { this.eventEmitter.on('RecvGroupMsg', fn); }
    public offRecvGroupMsg(fn: (msg: IRecvRoomMsg) => void) { this.eventEmitter.off('RecvGroupMsg', fn); }


    /**
     * @internal
     */
    __emitChangePlayerNetworkState(player: IPlayerInfo): void { this.eventEmitter.emit('RequirePlayerSyncState', ...arguments); }
    /**组队中其他玩家的网络状态变更(离线/上线)*/
    public onChangePlayerNetworkState(fn: (player: IPlayerInfo) => void): void { this.eventEmitter.on('RequirePlayerSyncState', fn); }
    public offChangePlayerNetworkState(fn: (player: IPlayerInfo) => void): void { this.eventEmitter.off('RequirePlayerSyncState', fn); }

    /**
     * @internal
     */
    __emitChangeCustomPlayerProfile(changeInfo: IChangeCustomPlayerProfile): void { this.eventEmitter.emit('ChangeCustomPlayerProfile', ...arguments); }
    /**有玩家修改了自定义属性(只要在房间,自己也会收到)*/
    public onChangeCustomPlayerProfile(fn: (changeInfo: IChangeCustomPlayerProfile) => void): void { this.eventEmitter.on('ChangeCustomPlayerProfile', fn); }
    public offChangeCustomPlayerProfile(fn: (changeInfo: IChangeCustomPlayerProfile) => void): void { this.eventEmitter.off('ChangeCustomPlayerProfile', fn); }

    /**
     * @internal
     */
    __emitChangeCustomPlayerStatus(changeInfo: IChangeCustomPlayerStatus): void { this.eventEmitter.emit('ChangeCustomPlayerStatus', ...arguments); }
    /**有玩家修改了自定义状态(只要在房间,自己也会收到)*/
    public onChangeCustomPlayerStatus(fn: (changeInfo: IChangeCustomPlayerStatus) => void): void { this.eventEmitter.on('ChangeCustomPlayerStatus', fn); }
    public offChangeCustomPlayerStatus(fn: (changeInfo: IChangeCustomPlayerStatus) => void): void { this.eventEmitter.off('ChangeCustomPlayerStatus', fn); }

    /**
     * @internal
     */
    __emitChangeGroup(roomInfo: IRoomInfo): void { this.eventEmitter.emit('ChangeGroup', ...arguments); }
    /**组队房间信息有修改*/
    public onChangeGroup(fn: (roomInfo: IRoomInfo) => void): void { this.eventEmitter.on('ChangeGroup', fn); }
    public offChangeGroup(fn: (roomInfo: IRoomInfo) => void): void { this.eventEmitter.off('ChangeGroup', fn); }


}

/**
 * 组队房间功能模块
 * 
 * - 使用房间功能来实现的组队功能模块, 即: 同时只能在`组队房间`或者`普通房间`中
 * - 只要在组队房间中, 组队房间有的事件, 都将由组队房间接管, 房间事件不会触发
 *
 */
export class GroupRoom {

    /**单例*/
    public static ins: GroupRoom;

    private _game: Game;
    private _room: Room;

    /**当前保留的组队房间id*/
    private _currGroupRoomId: string | null = null;
    /**当前保留的组队房间是否是房主*/
    private _currGroupRoomIsOwn = false;
    /**上一个组队房间id,因为触发顺序问题,需要保存一下最后一次的组队房间*/
    private _lastGroupRoomId: string | null = null;

    /**
     * 当前如果在组队房间中则能获取到房间信息, (即使在房间中,但不是组队房间依旧返回null)
     */
    public get currGroupRoom(): IRoomInfo | null {
        if (!this._currGroupRoomId || !this._room.currRoomInfo) return null;
        if (this._room.currRoomInfo.roomId !== this._currGroupRoomId) return null;
        return this._room.currRoomInfo;
    };

    /**
     * 所有事件
     */
    public readonly events = new GroupRoomEvents();

    /**
     * @internal
     */
    constructor(game: Game, room: Room) {
        this._game = game;
        this._room = room;

        //hook, 区分组队房间和非组队房间, 消息各自走自己的事件
        this._hookRoomEmitHandler('__emitJoinRoom',
            (roomInfo: IRoomInfo) => this.events.__emitJoinGroup(roomInfo));
        this._hookRoomEmitHandler('__emitRecvRoomMsg',
            (msg: IRecvRoomMsg) => this.events.__emitRecvGroupMsg(msg));
        this._hookRoomEmitHandler('__emitPlayerJoinRoom',
            (player: IPlayerInfo, roomInfo: IRoomInfo) => this.events.__emitPlayerJoinGroup(player, roomInfo));
        this._hookRoomEmitHandler('__emitPlayerLeaveRoom',
            (player: IPlayerInfo, roomInfo: IRoomInfo) => this.events.__emitPlayerLeaveGroup(player, roomInfo));
        this._hookRoomEmitHandler('__emitChangeRoom',
            (roomInfo: IRoomInfo) => this.events.__emitChangeGroup(roomInfo));
        this._hookRoomEmitHandler('__emitChangePlayerNetworkState',
            (player: IPlayerInfo) => this.events.__emitChangePlayerNetworkState(player));
        this._hookRoomEmitHandler('__emitChangeCustomPlayerProfile',
            (changeInfo: IChangeCustomPlayerProfile) => this.events.__emitChangeCustomPlayerProfile(changeInfo));
        this._hookRoomEmitHandler('__emitChangeCustomPlayerStatus',
            (changeInfo: IChangeCustomPlayerStatus) => this.events.__emitChangeCustomPlayerStatus(changeInfo));
        this._hookRoomEmitHandler('__emitRoomAllPlayersMatchStart',
            (matchReqId: string, reqPlayerId: string, matchParams: IMatchParamsFromRoomAllPlayer) => this.events.__emitGroupMatchStart(matchReqId, reqPlayerId, matchParams));
        //下面的劫持过来后需要定制处理
        this._hookRoomEmitHandler('__emitRoomAllPlayersMatchResult', this._procRoomAllPlayersMatchResult);
        //下面是定制房间事件
        let emitLeaveRoomOld = this._room.events.__emitLeaveRoom;
        this._room.events.__emitLeaveRoom = (roomInfo: IRoomInfo) => {
            if (this._lastGroupRoomId === roomInfo.roomId) {
                this._currGroupRoomId = null;
                this.events.__emitLeaveGroup(roomInfo);
            } else {
                //离开的不是组队房间,则照常触发
                emitLeaveRoomOld.call(this._room.events, roomInfo);
            }
        };
        let emitDismissRoomOld = this._room.events.__emitDismissRoom;
        this._room.events.__emitDismissRoom = (roomInfo: IRoomInfo) => {
            if (this._lastGroupRoomId === roomInfo.roomId) {
                //因为可能触发顺序, 导致 this._currGroupRoomId 先被置空, 就用 _lastGroupRoomId 来判断
                this.events.__emitDismissGroup(roomInfo);
            } else {
                //解散的不是组队房间,则照常触发
                emitDismissRoomOld.call(this._room.events, roomInfo);
            }
        };
    }

    public async dispose(): Promise<void> {
        if (this._currGroupRoomId && this._currGroupRoomIsOwn) {
            // 如果已经在自己创建的组队房间中,则直接解散之前的
            this.dismissGroup();
        }

        this.events.dispose();
        //@ts-ignore
        this.eventEmitter = undefined;
        //@ts-ignore
        this._game = undefined;
    }

    protected _hookRoomEmitHandler(key: keyof RoomEvents, bindGroupHandler: Function): void {
        let oldFn = this._room.events[key];
        let t = this;
        this._room.events[key] = async function () {
            const args = arguments;
            if (t.currGroupRoom) {
                bindGroupHandler.apply(t, args);
            } else {
                //@ts-ignore
                oldFn?.apply(t._room.events, args);
            }
        };
    }


    private async _procRoomAllPlayersMatchResult(errMsg?: string, errCode?: ErrorCodes, matchResult?: IMatchPlayerResultWithServer): Promise<void> {
        //触发组队房间匹配结果事件
        this.events.__emitGroupMatchResult(errMsg, errCode, matchResult);

        //匹配不成功忽略
        if (!matchResult) return;

        //组队房间匹配成功了, 实现自动进入房间的逻辑
        let currGroupRoomId = this._currGroupRoomId!;
        let playerPara = Factory.buildPlayerParaFromInfo(this._room.__gameClient!.currPlayerInfo!);

        //使用保留房间的方式离开房间,便于之后再回到组队房间
        let leaveRet = await this._room.leaveRoom();
        if (!leaveRet.succ) {
            //离开组队房间还失败...这一般不可能, 除非通讯错误等
            //就当作还在组队房间
            this._currGroupRoomId = currGroupRoomId;
            this.events.__emitGroupMatchEnterRoom(Result.transition(leaveRet));
            return;
        }
        //因为离开操作会让标志被清理, 这里重新设置一下
        this._currGroupRoomId = currGroupRoomId;

        //离开组队房间后,进入匹配房间
        let joinRet = await this._room.joinRoomByServer(matchResult.gameServerUrl!, playerPara, {
            roomId: matchResult.roomId,
            teamId: matchResult.teamId
        });
        if (!joinRet.succ) {
            //进入匹配房间失败了
            //准备回到组队房间
            let backGroupRoomRet = await this.joinGroup(playerPara, currGroupRoomId);
            if (!backGroupRoomRet.succ) {
                //回到组队房间还失败.那没办法了
                logger.error('匹配成功,进入匹配房间失败:', joinRet, '尝试回到组队房间还失败:', backGroupRoomRet);
            }
            this.events.__emitGroupMatchEnterRoom(Result.transition(joinRet));
            return;
        }
        this.events.__emitGroupMatchEnterRoom(joinRet);
    }

    /**
     * 如果之前是组队匹配进入新房间的, 则可以离开房间并回到之前的组队房间
     * @returns group 
     */
    public async backGroup(): Promise<IResult<IRoomInfo>> {
        if (!this._currGroupRoomId) return Result.buildErr('已经离开组队房间', ErrorCodes.RoomNotIn);
        if (this._room.currRoomInfo && this._room.currRoomInfo.roomId === this._currGroupRoomId) {
            //当前已经在组队房间了,直接返回成功
            return Result.buildSucc(this._room.currRoomInfo);
        }
        let playerPara = Factory.buildPlayerParaFromInfo(this._room.__gameClient!.currPlayerInfo!);

        let ret = await this.joinGroup(playerPara, this._currGroupRoomId);
        return ret;
    }

    /**
     * 创建一个组队房间并进入, 之前有在其他房间将自动退出, 成功则 this.currGroupRoom 有值
     *
     * @param playerPara
     * @returns groupRoomId
     */
    public async createGroup(playerPara: IPlayerInfoPara): Promise<IResult<string>> {

        if (this._currGroupRoomId && this._currGroupRoomIsOwn) {
            // 如果之前有在自己另外创建的组队房间中,则直接解散之前的(使用大厅房主接口,不管当前连接是否连着,最稳妥)
            Game.ins.__hallClient.ownDismissRoom(Game.ins.__myPlayerToken, this._currGroupRoomId);
        }

        let roomPara: ICreateRoomPara = {
            isPrivate: true,
            maxPlayers: 99,
            ownerPlayerId: this._game.__myPlayerId,
            roomName: '自定义组队房间',
            retainEmptyRoomTime: 5 * 60000,// 组队房间保留空房间5个小时, 方便全房间玩家匹配到其他房间去玩了还能回来
        };
        let ret = await this._game.__hallClient.createRoom(this._game.__myPlayerToken, roomPara);
        if (!ret.succ) return Result.transition(ret);

        this._currGroupRoomId = ret.data.roomId;
        this._currGroupRoomIsOwn = true;
        this._lastGroupRoomId = ret.data.roomId;

        let joinRet = await this._room.joinRoom(playerPara, { roomId: this._currGroupRoomId });
        return Result.transition(joinRet, () => ret.data!.roomId);
    }

    /**
     * 加入指定组队房间, 成功则 this.currGroupRoom 有值
     *
     * @param playerPara 玩家信息参数
     * @param groupRoomId 组队房间ID
     */
    public async joinGroup(playerPara: IPlayerInfoPara, groupRoomId: string): Promise<IResult<IRoomInfo>> {

        if (this._currGroupRoomId && this._currGroupRoomId !== groupRoomId && this._currGroupRoomIsOwn) {
            // 如果之前有在自己另外创建的组队房间中,则直接解散之前的(使用大厅房主接口,不管当前连接是否连着,最稳妥)
            Game.ins.__hallClient.ownDismissRoom(Game.ins.__myPlayerToken, this._currGroupRoomId);
        }

        this._currGroupRoomId = groupRoomId;//因为加入房间消息可能在下面返回前就收到了,所以提前设置好,发现失败后再移除
        this._currGroupRoomIsOwn = false;
        let ret = await this._room.joinRoom(playerPara, { roomId: groupRoomId });
        if (!ret.succ) {
            this._currGroupRoomId = null;
        } else {
            this._lastGroupRoomId = ret.data.roomId;
        }
        return Result.transition(ret, () => ret.data!);
    }

    /**
     * 退出当前组队房间
     * @returns 
     */
    public async leaveGroup(): Promise<IResult<null>> {
        if (!this.currGroupRoom) return Result.buildErr('当前不在组队房间中!', ErrorCodes.RoomNotIn);
        let ret = await this._room.leaveRoom();
        return ret;
    }
    /**
     * 【仅房主】解散当前组队房间
     * @returns  
     */
    public async dismissGroup(): Promise<IResult<null>> {
        if (!this.currGroupRoom) return Result.buildErr('当前不在组队房间中!', ErrorCodes.RoomNotIn);
        let ret = await this._room.dismissRoom();
        return ret;
    }


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
    public async requestMatch(matchParams: IMatchParamsBase): Promise<IResult<string>> {
        if (!this.currGroupRoom) return Result.buildErr('当前不在组队房间中!', ErrorCodes.RoomNotIn);
        let matchP = matchParams as IMatchParamsFromRoomAllPlayer;
        matchP.matchFromType = EMatchFromType.RoomAllPlayers;
        matchP.matchFromInfo = {};
        let ret = await this._room.__gameClient!.requestMatch(matchP);
        return ret;
    }

    /**
     * [**在组队房间中才可以发起**] 取消组队匹配请求
     * 
     * 可能发生并发,导致虽然取消成功了,但还是收到了匹配成功的通知
     *
     * @returns
     */
    public async cancelMatch(): Promise<IResult<null>> {
        if (!this.currGroupRoom) return Result.buildErr('当前不在组队房间中!', ErrorCodes.RoomNotIn);
        let ret = await this._room.__gameClient!.cancelMatch();
        return ret;
    }

    /**
     * [在组队房间中才可以发起] 查询完整的组队匹配结果
     * 
     * 会等到有结果了才返回!
     * 
     * 注意: 同时只能只有一个玩家进行查询等待,一般使用相关事件来获取结果即可
     *
     * @returns
     */
    public async queryMatch(): Promise<IResult<IMatchResult>> {
        if (!this.currGroupRoom) return Result.buildErr('当前不在组队房间中!', ErrorCodes.RoomNotIn);
        let ret = await this._room.__gameClient!.queryMatch();
        return ret;
    }




    /**
     * 发送组队内消息（自定义消息），可以指定全部玩家或部分玩家或其他玩家 来接收
     *
     * @public
     * @param roomMsg 
     */
    public async sendGroupMsg(roomMsg: IRoomMsg): Promise<IResult<null>> {
        if (!this.currGroupRoom) return Result.buildErr('当前不在组队房间中!', ErrorCodes.RoomNotIn);
        let ret = await this._room.sendRoomMsg(roomMsg);
        return ret;
    }

    /**
     * 修改自己的玩家自定义属性,如果当前在房间中会同时会触发通知(房间中所有玩家)
     *
     * @param customPlayerProfile
     */
    public async changeCustomPlayerProfile(customPlayerProfile: string): Promise<IResult<null>> {
        if (!this.currGroupRoom) return Result.buildErr('当前不在组队房间中!', ErrorCodes.RoomNotIn);
        let ret = await this._room.changeCustomPlayerProfile(customPlayerProfile);
        return ret;
    }

    /**
     * 修改自己的玩家自定义状态,如果当前在房间中会同时会触发通知(房间中所有玩家)
     *
     * @param customPlayerStatus
     */
    public async changeCustomPlayerStatus(customPlayerStatus: number): Promise<IResult<null>> {
        if (!this.currGroupRoom) return Result.buildErr('当前不在组队房间中!', ErrorCodes.RoomNotIn);
        let ret = await this._room.changeCustomPlayerStatus(customPlayerStatus);
        return ret;
    }

}
