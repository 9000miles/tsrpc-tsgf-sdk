

import { BaseWsClient, BaseWsClientOptions } from "tsrpc-base-client";
import { ServiceProto } from "tsrpc-proto";

import { serviceProto as gameServiceProto, ServiceType } from "./protocols/serviceProto";
import { AWsClient } from "../tsgf/AClient";
import { logger } from "../tsgf/logger";
import { ErrorCodes, IResult, Result } from "../tsgf/Result";
import { IChangeCustomPlayerProfile, IChangeCustomPlayerStatus, IChangePlayerTeam, IPlayerInfoPara, IPlayerInfo } from "../tsgf/player/IPlayerInfo";
import { ReqAuthorize } from "./protocols/PtlAuthorize";
import { IChangeRoomPara, IJoinRoomPara, IRoomInfo } from "../tsgf/room/IRoomInfo";
import { IRecvRoomMsg, IRoomMsg } from "../tsgf/room/IRoomMsg";
import { IAfterFrames, IGameSyncFrame, IPlayerInputOperate } from "../tsgf/room/IGameFrame";
import { IMatchParamsFromRoomAllPlayer, IMatchResult, IMatchPlayerResultWithServer } from "../tsgf/match/Models";

/**游戏服务器的通讯类型定义*/
export type gameServiceType = ServiceType;

/**
 * 基础的游戏服务器api的客户端封装
 */
export class GameClient extends AWsClient<gameServiceType>{

    protected _playerToken: string;
    public get playerToken(): string {
        return this._playerToken;
    }
    protected _playerId: string;
    public get playerId(): string {
        return this._playerId;
    }

    protected _currRoomInfo: IRoomInfo | null = null;
    /**当前所在的房间, 各种操作会自动维护本属性值为最新*/
    public get currRoomInfo(): IRoomInfo | null {
        return this._currRoomInfo;
    }
    protected set currRoomInfo(roomInfo: IRoomInfo | null) {
        this._currRoomInfo = roomInfo;
        this._currPlayerInfo = this._currRoomInfo?.playerList.find(p => p.playerId === this._playerId) ?? null;
    }

    protected _currPlayerInfo: IPlayerInfo | null = null;
    /**当前玩家信息对象*/
    public get currPlayerInfo(): IPlayerInfo | null {
        return this._currPlayerInfo;
    }

    /**是否启用断线重连*/
    public enabledReconnect: boolean = true;
    /**
     * 断线重连等待秒数
     */
    public reconnectWaitSec = 2;
    protected reconnectTimerHD: any;

    /**可设置房间中断线后等待重连的毫秒数(认证和重连时使用),默认为60000ms(60秒),设成0表示断线后直接清理(按退出房间处理)不等待重连*/
    public roomWaitReconnectTime?: number;

    /**
     * [需启用断线重连:enabledReconnect]每次开始断线重连时触发, [reconnectWaitSec]秒后开始重连
     * @param currTryCount 已经重试了几次了, 首次断线重连则为0
     */
    public onReconnectStart?: (currTryCount: number) => void;
    /**
     * 彻底断开触发, 如下情况:
     * 1. 断开连接时没启用断线重连则触发
     * 2. 主动断开时触发, reason='ManualDisconnect'
     * 3. 断线重连失败并不再重连时触发, reason='ReconnectFailed'
     * 4. 认证失败时会断开连接, 同时触发, reason='AuthorizeFailed'
     * @param reason 断开原因
     */
    public onDisconnected?: (reason?: string) => void;
    /**当前玩家不管什么原因离开了房间都会触发(主动离开,主动解散,房间被解散等等)*/
    public onLeaveRoom?: (roomInfo: IRoomInfo) => void;
    /**当前玩家加入到房间后触发*/
    public onJoinRoom?: (roomInfo: IRoomInfo) => void;
    /**断线重连最终有结果时触发(终于连上了,或者返回不继续尝试了)*/
    public onReconnectResult?: (succ: boolean, err: string | null) => void;
    /**当接收到房间消息时触发*/
    public onRecvRoomMsg?: (roomMsg: IRecvRoomMsg) => void;
    /**【在房间中才能收到】玩家加入当前房间（自己操作的不触发）*/
    public onPlayerJoinRoom?: (player: IPlayerInfo, roomInfo: IRoomInfo) => void;
    /**【在房间中才能收到】玩家退出当前房间（自己操作的不触发）*/
    public onPlayerLeaveRoom?: (player: IPlayerInfo, roomInfo: IRoomInfo) => void;
    /**【在房间中才能收到】玩家被踢出房间*/
    public onKicked?: (roomInfo: IRoomInfo) => void;
    /**【在房间中才能收到】当前房间被解散（自己操作的不触发）*/
    public onDismissRoom?: (roomInfo: IRoomInfo) => void;
    /**【在房间中才能收到】房间中开始帧同步了*/
    public onStartFrameSync?: (roomInfo: IRoomInfo, startPlayer: IPlayerInfo) => void;
    /**【在房间中才能收到】房间中停止帧同步了*/
    public onStopFrameSync?: (roomInfo: IRoomInfo, stopPlayer: IPlayerInfo) => void;
    /**【在房间中才能收到】房间中收到一个同步帧*/
    public onRecvFrame?: (syncFrame: IGameSyncFrame, dt: number) => void;
    /**【在房间中才能收到】服务端要求玩家上传状态同步数据 (调用 playerSendSyncState 方法)*/
    public onRequirePlayerSyncState?: () => void;
    /**【在房间中才能收到】玩家加入当前房间（自己操作的不触发）*/
    public onChangePlayerNetworkState?: (player: IPlayerInfo) => void;
    /**【在房间中才能收到】有玩家修改了自定义属性(只要在房间,自己也会收到)*/
    public onChangeCustomPlayerProfile?: (changeInfo: IChangeCustomPlayerProfile) => void;
    /**【在房间中才能收到】有玩家修改了自定义状态(只要在房间,自己也会收到)*/
    public onChangeCustomPlayerStatus?: (changeInfo: IChangeCustomPlayerStatus) => void;
    /**【在房间中才能收到】有玩家修改了自定义属性(只要在房间,自己也会收到)*/
    public onChangeRoom?: (roomInfo: IRoomInfo) => void;
    /**【在房间中才能收到】有玩家修改了所在队伍(只要在房间,自己也会收到)*/
    public onChangePlayerTeam?: (changeInfo: IChangePlayerTeam) => void;
    /**【在房间中才能收到】有玩家发起了全房间玩家匹配(自己也会收到)*/
    public onRoomAllPlayersMatchStart?: (matchReqId: string, req_playerId: string, matchParams: IMatchParamsFromRoomAllPlayer) => void;
    /**【在房间中才能收到】全房间玩家匹配有结果了(自己也会收到) */
    public onRoomAllPlayersMatchResult?: (errMsg?: string, errCode?: ErrorCodes, matchResult?: IMatchPlayerResultWithServer) => void;

    /**
     *
     * @param _playerToken 服务端调用大厅授权接口，获得玩家授权令牌
     * @param reqTimeout 请求超时毫秒数
     * @param roomWaitReconnectTime 可设置房间中断线后等待重连的毫秒数(认证和重连时使用),默认为60000ms(60秒),设成0表示断线后直接清理(按退出房间处理)不等待重连
     * @param serverUrl
     */
    constructor(serverUrl: string, _playerToken: string, reqTimeout?: number, roomWaitReconnectTime?: number) {
        super(gameServiceProto, {
            server: serverUrl,
            json: false,
            logger: logger,
            timeout: reqTimeout,
        });
        this._playerToken = _playerToken;
        this._playerId = "";
        this.roomWaitReconnectTime = roomWaitReconnectTime;
        //设置断线重连的中间件
        this.client.flows.postDisconnectFlow.push(async v => {
            //如果都没连上过就断开,那么忽略
            if (!this._playerId) return v;

            //判断是否需要重连
            if (!v.isManual) {
                if (this.enabledReconnect) {
                    //启用断线重连
                    this.onReconnectStart?.call(this, 0);
                    if (this.reconnectTimerHD) clearTimeout(this.reconnectTimerHD);
                    this.reconnectTimerHD = setTimeout(async () => this.startReconnect(0, true), this.reconnectWaitSec * 1000);
                    return v;
                }

                //被断开,并且没启用断线重连
                if (this.currRoomInfo) {
                    //如果被断开时,有在房间中,则先触发离开房间
                    this.onLeaveRoom?.call(this, this.currRoomInfo);
                }
                this.onDisconnected?.call(this, v.reason);
            } else {
                //主动断开
                this.onDisconnected?.call(this, v.reason ?? 'ManualDisconnect');
            }

            //确认彻底断开了,清理数据
            this.clearData();
            return v;
        });
        this.client.listenMsg("NotifyRoomMsg", (msg) => {
            this.onRecvRoomMsg?.call(this, msg.recvRoomMsg);
        });
        this.client.listenMsg("NotifyJoinRoom", (msg) => {
            this.currRoomInfo = msg.roomInfo;

            let joinPlayer = this.currRoomInfo.playerList.find(p => p.playerId === msg.joinPlayerId)!;
            this.onPlayerJoinRoom?.call(this, joinPlayer, this.currRoomInfo);
        });
        this.client.listenMsg("NotifyLeaveRoom", (msg) => {
            this.currRoomInfo = msg.roomInfo;

            this.onPlayerLeaveRoom?.call(this, msg.leavePlayerInfo, this.currRoomInfo);
        });
        this.client.listenMsg("NotifyKicked", (msg) => {
            this.currRoomInfo = msg.roomInfo;

            this.onKicked?.call(this, this.currRoomInfo)
        });
        this.client.listenMsg("NotifyDismissRoom", (msg) => {
            if (this.currRoomInfo) {
                this.onLeaveRoom?.call(this, this.currRoomInfo);
            }
            this.currRoomInfo = null;
            this.onDismissRoom?.call(this, msg.roomInfo);
        });
        this.client.listenMsg("NotifyStartFrameSync", (msg) => {
            this.currRoomInfo = msg.roomInfo;

            this.onStartFrameSync?.call(this, this.currRoomInfo,
                this.currRoomInfo.playerList.find(p => p.playerId === msg.startPlayerId)!);
        });
        this.client.listenMsg("NotifyStopFrameSync", (msg) => {
            this.currRoomInfo = msg.roomInfo;

            this.onStopFrameSync?.call(this, this.currRoomInfo,
                this.currRoomInfo.playerList.find(p => p.playerId === msg.stopPlayerId)!);
        });
        this.client.listenMsg("NotifySyncFrame", (msg) => {
            this.onRecvFrame?.call(this, msg.syncFrame, msg.dt);
        });
        this.client.listenMsg("RequirePlayerSyncState", (msg) => {
            this.onRequirePlayerSyncState?.call(this);
        });
        this.client.listenMsg("NotifyChangeRoom", (msg) => {
            this.currRoomInfo = msg.roomInfo;

            this.onChangeRoom?.call(this, this.currRoomInfo);
        });
        this.client.listenMsg("NotifyChangePlayerNetworkState", (msg) => {
            this.currRoomInfo = msg.roomInfo;

            let player = this.currRoomInfo.playerList.find(p => p.playerId === msg.changePlayerId)!;
            this.onChangePlayerNetworkState?.call(this, player);
        });
        this.client.listenMsg("NotifyChangeCustomPlayerProfile", (msg) => {
            this.currRoomInfo = msg.roomInfo;

            this.onChangeCustomPlayerProfile?.call(this, msg);
        });
        this.client.listenMsg("NotifyChangeCustomPlayerStatus", (msg) => {
            this.currRoomInfo = msg.roomInfo;

            this.onChangeCustomPlayerStatus?.call(this, msg);
        });
        this.client.listenMsg("NotifyChangePlayerTeam", (msg) => {
            this.currRoomInfo = msg.roomInfo;

            this.onChangePlayerTeam?.call(this, msg);
        });
        this.client.listenMsg("NotifyRoomAllPlayersMatchStart", (msg) => {
            this.currRoomInfo = msg.roomInfo;

            this.onRoomAllPlayersMatchStart?.call(this, msg.matchReqId, msg.reqPlayerId, msg.matchParams);
        });
        this.client.listenMsg("NotifyRoomAllPlayersMatchResult", (msg) => {
            this.currRoomInfo = msg.roomInfo;

            this.onRoomAllPlayersMatchResult?.call(this, msg.errMsg, msg.errCode, msg.matchResult);
        });
    }
    /**
     * Disconnects game client
     * @param reason websocket的关闭原因字符串,可自定义
     * @param code websocket的关闭原因代码, 取值范围: [1000,3000-4999]
     * @returns disconnect 
     */
    public async disconnect(reason: string = 'ManualDisconnect'): Promise<void> {
        this.stopReconnect();
        if (this._playerId || this.client.isConnected) {
            if (this.currRoomInfo) {
                //如果断开时,有在房间中,则先触发离开房间事件
                this.onLeaveRoom?.call(this, this.currRoomInfo);
            }
            this.clearData();
            await this.client.sendMsg("Disconnect", {});
            await this.client.disconnect(1000, reason);
        }
    }
    protected async clearData(): Promise<void> {
        this._playerId = '';
        this._playerToken = '';
        this._currRoomInfo = null;
        this._currPlayerInfo = null;
        this.onReconnectStart = undefined;
        this.onDisconnected = undefined;
        this.onReconnectResult = undefined;
        this.onLeaveRoom = undefined;
        this.onRecvRoomMsg = undefined;
        this.onPlayerJoinRoom = undefined;
        this.onPlayerLeaveRoom = undefined;
        this.onKicked = undefined;
        this.onDismissRoom = undefined;
        this.onStartFrameSync = undefined;
        this.onStopFrameSync = undefined;
        this.onRecvFrame = undefined;
        this.onRequirePlayerSyncState = undefined;
        this.onChangePlayerNetworkState = undefined;
        this.onChangeCustomPlayerProfile = undefined;
        this.onChangeCustomPlayerStatus = undefined;
        this.onChangeRoom = undefined;
        this.onChangePlayerTeam = undefined;
        this.onRoomAllPlayersMatchStart = undefined;
        this.onRoomAllPlayersMatchResult = undefined;
    }


    protected stopReconnect(): void {
        if (this.reconnectTimerHD) {
            clearTimeout(this.reconnectTimerHD);
            this.reconnectTimerHD = null;
        }
    }
    /**
     * Starts reconnect
     * @param currTryCount 当前重试次数
     * @param failReTry 本次失败后是否继续重试
     * @returns reconnect 
     */
    protected async startReconnect(currTryCount: number = 0, failReTry = true): Promise<boolean> {
        const result = await this.reconnect();
        if (!this._playerToken) {
            //重连异步回来,发现已经取消
            return false;
        }
        // 重连也错误，弹出错误提示
        if (result.succ) {
            this.client.logger?.log('重连成功!');
            this.onReconnectResult?.call(this, true, null);
            return true;
        }
        //如果是逻辑拒绝则不需要重连
        if (!this._playerToken || result.code == ErrorCodes.AuthReconnectionFail) failReTry = false;

        if (failReTry && this.enabledReconnect) {
            currTryCount++;
            this.onReconnectStart?.call(this, currTryCount);
            this.client.logger?.error('重连失败:' + result.err + ' ' + this.reconnectWaitSec + '秒后自动重连!');
            if (this.reconnectTimerHD) clearTimeout(this.reconnectTimerHD);
            this.reconnectTimerHD = setTimeout(() => this.startReconnect(currTryCount, failReTry), this.reconnectWaitSec * 1000);
        } else {
            this.client.logger?.error('重连失败:' + result.err);
            let tmpOnRecRet = this.onReconnectResult;//因为disconnect会清理数据，所以这里临时记录一下，用于接着触发
            await this.disconnect('ReconnectFailed');
            tmpOnRecRet?.call(this, false, result.err);
        }
        return false;
    }
    /**
     * 断线重连, 失败的话要看code, ErrorCodes.AuthReconnectionFail 表示逻辑拒绝,不需要重连
     * @returns  
     */
    public async reconnect(): Promise<IResult<null>> {
        const connectRet = await this.client.connect();
        if (!connectRet.isSucc) {
            return Result.buildErr("连接失败:" + connectRet.errMsg);
        }
        if (!this._playerToken) {
            //重连异步回来,发现已经取消
            return Result.buildErr('取消', 1);
        }
        const loginRet = await this.client.callApi("Reconnect", {
            playerToken: this._playerToken,
            roomWaitReconnectTime: this.roomWaitReconnectTime,
        });
        if (!this._playerToken) {
            //重连异步回来,发现已经取消
            await this.client.disconnect();
            return Result.buildErr('取消', 1);
        }
        if (!loginRet.isSucc) {
            // 连上了, 但重连认证失败, 直接断开
            await this.client.disconnect();
            return Result.buildErr(loginRet.err.message, (loginRet.err?.code ?? 1) as number);
        }
        this._playerId = loginRet.res.playerId;
        this.currRoomInfo = loginRet.res.currRoomInfo;
        return Result.buildSucc(null);
    }


    /**
     * 登录到游戏服务器, 失败则断开连接并清理数据
     * @param infoPara 
     * @returns  
     */
    public async authorize(infoPara?: IPlayerInfoPara): Promise<IResult<null>> {
        const connectRet = await this.client.connect();
        if (!connectRet.isSucc) {
            return Result.buildErr("连接失败:" + connectRet.errMsg);
        }
        let req: ReqAuthorize = (infoPara as ReqAuthorize) ?? ({} as ReqAuthorize);
        req.playerToken = this._playerToken;
        req.roomWaitReconnectTime = this.roomWaitReconnectTime;
        const loginRet = await this.client.callApi("Authorize", req);
        if (!loginRet.isSucc) {
            let errCode = (loginRet.err?.code ?? 1) as number;
            this.disconnect('AuthorizeFailed');
            return Result.buildErr(loginRet.err.message, errCode);
        }
        this._playerId = loginRet.res.playerInfo.playerId;
        return Result.buildSucc(null);
    }


    /**
     * [兼容旧版本保留]进房间
     * @param roomId 
     * @param teamId 同时加入指定队伍 
     * @returns  
     * @deprecated 本重载已弃用, 将在下个版本移除!!
     */
    public async joinRoom(roomId: string, teamId?: string): Promise<IResult<IRoomInfo>>;
    /**
     * 进房间
     * @param joinRoomPara 加入房间参数, 根据房间的加入模式需要传入对应的数据
     * @returns  
     */
    public async joinRoom(joinRoomPara: IJoinRoomPara): Promise<IResult<IRoomInfo>>;
    /**
     * 进房间
     * @param roomId 
     * @param teamId 同时加入指定队伍 
     * @returns  
     */
    public async joinRoom(para: IJoinRoomPara | string, teamId?: string): Promise<IResult<IRoomInfo>> {
        let joinRoomPara: IJoinRoomPara;
        if (typeof (para) === 'string') {
            joinRoomPara = {
                roomId: para,
                teamId,
            };
        } else {
            joinRoomPara = para;
        }
        const ret = await this.client.callApi("JoinRoom", joinRoomPara);
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        this.currRoomInfo = ret.res.roomInfo;
        this.onJoinRoom?.call(this, this.currRoomInfo);
        return Result.buildSucc(ret.res.roomInfo);
    }
    /**
     * 退出当前房间
     * @returns  
     */
    public async leaveRoom(): Promise<IResult<null>> {
        const ret = await this.client.callApi("LeaveRoom", {
        });
        if (!ret.isSucc) {
            //离开房间失败? 没事, 本地当作成功
            //return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        if (this.currRoomInfo) {
            this.onLeaveRoom?.call(this, this.currRoomInfo);
        }
        this.currRoomInfo = null;
        return Result.buildSucc(null);
    }

    /**
     * 【仅房主】踢出房间内玩家
     * @param playerId
     * @returns
     */
    public async kickPlayer(playerId: string): Promise<IResult<null>> {
        if (!this.currRoomInfo) return Result.buildErr('当前不在房间中!');
        const ret = await this.client.callApi("KickPlayer", {
            playerId
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc(null);
    }

    /**
     * 【仅房主】解散当前房间
     * @returns  
     */
    public async dismissRoom(): Promise<IResult<null>> {
        if (!this.currRoomInfo) return Result.buildErr('当前不在房间中！');
        const ret = await this.client.callApi("DismissRoom", {
            roomId: this.currRoomInfo.roomId
        });
        if (!ret.isSucc) {
            //解散失败? 本地当作成功!
            //return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        if (this.currRoomInfo) {
            this.onLeaveRoom?.call(this, this.currRoomInfo);
        }
        this.currRoomInfo = null;
        return Result.buildSucc(null);
    }

    /**
     * 修改房间信息(注意,只能房主操作),同时同步更新本地当前房间信息
     *
     * @param changePara
     * @returns
     */
    public async changeRoom(changePara: IChangeRoomPara): Promise<IResult<IRoomInfo>> {
        const ret = await this.client.callApi("ChangeRoom", changePara);
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        this.currRoomInfo = ret.res.roomInfo;
        return Result.buildSucc(ret.res.roomInfo);
    }
    /**
     * 修改自己的玩家自定义属性,如果当前在房间中会同时会触发通知(房间中所有玩家)
     *
     * @param customPlayerProfile
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns
     */
    public async changeCustomPlayerProfile(customPlayerProfile: string, robotPlayerId?: string): Promise<IResult<null>> {
        const ret = await this.client.callApi("ChangeCustomPlayerProfile", {
            customPlayerProfile,
            robotPlayerId,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        let changePlayerInfo: IPlayerInfo | undefined | null;
        if (robotPlayerId) {
            changePlayerInfo = this.currRoomInfo?.playerList.find(p => p.playerId === robotPlayerId);
        } else {
            changePlayerInfo = this._currPlayerInfo;
        }
        if (changePlayerInfo) changePlayerInfo.customPlayerProfile = customPlayerProfile;
        return Result.buildSucc(null);
    }
    /**
     * 修改自己的玩家自定义状态,如果当前在房间中会同时会触发通知(房间中所有玩家)
     *
     * @param customPlayerStatus
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns
     */
    public async changeCustomPlayerStatus(customPlayerStatus: number, robotPlayerId?: string): Promise<IResult<null>> {
        const ret = await this.client.callApi("ChangeCustomPlayerStatus", {
            customPlayerStatus,
            robotPlayerId,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        let changePlayerInfo: IPlayerInfo | undefined | null;
        if (robotPlayerId) {
            changePlayerInfo = this.currRoomInfo?.playerList.find(p => p.playerId === robotPlayerId);
        } else {
            changePlayerInfo = this._currPlayerInfo;
        }
        if (changePlayerInfo) changePlayerInfo.customPlayerStatus = customPlayerStatus;
        return Result.buildSucc(null);
    }

    /**
     *变更自己所在队伍
     *
     * @param newTeamId 传undefined表示改为无队伍; 如果有指定队伍, 但房间不存在该队伍id, 则需要房间开启自由队伍选项
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns 
     */
    public async changePlayerTeam(newTeamId?: string, robotPlayerId?: string): Promise<IResult<null>> {
        const ret = await this.client.callApi("ChangePlayerTeam", {
            newTeamId,
            robotPlayerId,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        this.currRoomInfo = ret.res.roomInfo;
        return Result.buildSucc(null);
    }


    /**
     * 发送房间消息（自定义消息），可以指定房间里的全部玩家或部分玩家或其他玩家
     *
     * @public
     * @param roomMsg 
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns
     */
    public async sendRoomMsg(roomMsg: IRoomMsg, robotPlayerId?: string): Promise<IResult<null>> {
        const ret = await this.client.callApi("SendRoomMsg", {
            roomMsg,
            robotPlayerId,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc(null);
    }

    /**
     * 开始帧同步
     *
     * @public
     * @returns
     */
    public async startFrameSync(): Promise<IResult<null>> {
        const ret = await this.client.callApi("StartFrameSync", {
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc(null);
    }
    /**
     * 停止帧同步
     *
     * @public
     * @returns
     */
    public async stopFrameSync(): Promise<IResult<null>> {
        const ret = await this.client.callApi("StopFrameSync", {
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc(null);
    }

    /**
     * 发送玩家输入帧(加入到下一帧的操作列表)
     *
     * @public
     * @param inpOperates 
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns
     */
    public async playerInpFrame(inpOperates: IPlayerInputOperate[], robotPlayerId?: string): Promise<IResult<null>> {
        const ret = await this.client.sendMsg("PlayerInpFrame", {
            operates: inpOperates,
            robotPlayerId
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc(null);
    }
    /**
     * 请求追帧数据(当前的所有帧数据[+同步状态数据])
     *
     * @public
     * @returns
     */
    public async requestAfterFrames(): Promise<IResult<IAfterFrames>> {
        const ret = await this.client.callApi("RequestAfterFrames", {
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc(ret.res);
    }
    /**
     * 自主请求帧数组
     *
     * @public
     * @param beginFrameIndex 起始帧索引(包含)
     * @param endFrameIndex 结束帧索引(包含)
     * @returns
     */
    public async requestFrames(beginFrameIndex: number, endFrameIndex: number): Promise<IResult<IGameSyncFrame[]>> {
        const ret = await this.client.callApi("RequestFrames", {
            beginFrameIndex: beginFrameIndex,
            endFrameIndex: endFrameIndex,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc(ret.res.frames);
    }

    /**
     * 玩家发送本地的同步状态数据(有启用状态同步的时候才可以用)
     *
     * @public
     * @param stateData
     * @param stateFrameIndex
     * @returns
     */
    public async playerSendSyncState(stateData: object, stateFrameIndex: number): Promise<IResult<null>> {
        const ret = await this.client.sendMsg("PlayerSendSyncState", {
            stateData: stateData,
            stateFrameIndex: stateFrameIndex,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc(null);
    }

    /**
     * 发起房间所有玩家匹配请求
     * 请求成功即返回,同时房间中的所有玩家会收到通知
     * 匹配有结果了还会收到消息通知, 并且可由一个玩家调用QueryMatch等待完整匹配结果
     *
     * @param matchParams
     * @returns 匹配请求id
     */
    public async requestMatch(matchParams: IMatchParamsFromRoomAllPlayer): Promise<IResult<string>> {
        const ret = await this.client.callApi("RequestMatch", {
            matchParams: matchParams
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc(ret.res.matchReqId);
    }
    /**
     * 取消匹配请求
     * 可能发生并发,导致虽然请求成功了,但还是收到了成功结果的通知
     *
     * @returns 匹配请求id
     */
    public async cancelMatch(): Promise<IResult<null>> {
        const ret = await this.client.callApi("CancelMatch", {
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc(null);
    }
    /**
     * 查询完整匹配结果
     * 会等到有结果了才返回!
     * 注意: 同时只能只有一个玩家进行查询等待,一般使用通知来获取结果即可
     *
     * @returns
     */
    public async queryMatch(): Promise<IResult<IMatchResult>> {
        const ret = await this.client.callApi("QueryMatch", {
        }, {
            timeout: 0
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        return Result.buildSucc(ret.res.matchResult);
    }



    /**
     * 玩家创建房间机器人(退出房间会同步退出)
     * @param createPa 
     * @param [teamId] 
     * @returns 创建的机器人信息
     */
    public async createRoomRobot(createPa: IPlayerInfoPara, teamId?: string): Promise<IResult<IPlayerInfo>> {
        const ret = await this.client.callApi("CreateRoomRobot", {
            createPa,
            teamId,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        if (this._currPlayerInfo) {
            this._currPlayerInfo.roomRobotIds = Array.from(new Set([
                ...this._currPlayerInfo.roomRobotIds ?? [],
                ret.res.robotInfo.playerId
            ]));
        }
        return Result.buildSucc(ret.res.robotInfo);
    }

    /**
     * 玩家的指定房间机器人退出房间(即销毁)
     * @param robotPlayerId 
     * @returns 销毁的机器人信息
     */
    public async roomRobotLeave(robotPlayerId: string): Promise<IResult<IPlayerInfo>> {
        const ret = await this.client.callApi("RoomRobotLeave", {
            robotPlayerId,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err?.code ?? 1) as number);
        }
        if (this._currPlayerInfo) {
            let tmpIds = new Set([
                ...this._currPlayerInfo.roomRobotIds ?? [],
            ]);
            tmpIds.delete(ret.res.robotInfo.playerId);
            this._currPlayerInfo.roomRobotIds = Array.from(tmpIds);
        }
        return Result.buildSucc(ret.res.robotInfo);
    }

}