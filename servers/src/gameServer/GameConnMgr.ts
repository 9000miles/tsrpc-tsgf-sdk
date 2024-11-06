import { BaseConnection, ConnectionStatus, WsServer } from "tsrpc";
import { ClientConnection, GameMsgCall } from "./GameServer";
import { serviceProto as GameServiceProto, ServiceType as GameServiceType } from "../shared/gameClient/protocols/serviceProto";
import { MsgDisconnect } from "../shared/gameClient/protocols/MsgDisconnect";
import { hasProperty } from "../shared/tsgf/Utils";
import { IPlayer } from "../shared/tsgfServer/auth/Models";
import { PlayerAuthHelper } from "../shared/tsgfServer/auth/PlayerAuthHelper";
import { ErrorCodes, IResult, Result } from "../shared/tsgf/Result";
import { ENetworkState, IPlayerInfoPara, IPlayerInfo } from "../shared/tsgf/player/IPlayerInfo";
import { IGameServerCfg } from "../ServerConfig";

/**连接认证通过前事件处理器参数定义*/
export type ConnAuthingHandler = (conn: ClientConnection, player: IPlayer) => string | void;
/**连接认证通过事件处理器参数定义, 断开重连也会走这里*/
export type ConnAuthedHandler = (conn: ClientConnection) => void;
/**玩家断线事件处理器参数定义, 返回是否支持断线重连*/
export type ConnDisconnectHandler = (connId: string, player: IPlayer) => boolean;
/**[断线时返回支持重连才有]玩家断线重连上事件处理器参数定义, 返回是否支持断线重连*/
export type ConnReconnectHandler = (conn: ClientConnection, player: IPlayer) => void;
/**(认证过的)玩家断开连接并不再重连事件处理器参数定义*/
export type AuthedPlayerDisconnectHandler = (connId: string, player: IPlayer) => void;

/**游戏服务器的连接管理*/
export class GameConnMgr {

    /**默认的房间中断线等待重连的秒数(超过这个时间不再等待重连,即要求重连会被踢掉要求重新登陆)*/
    public defaultWaitReconnectTime = 60000;

    private connAuthingHandlers: ConnAuthingHandler[] = [];
    private connAuthedHandlers: ConnAuthedHandler[] = [];
    private connDisconnectHandlers: ConnDisconnectHandler[] = [];
    private connReconnectHandlers: ConnReconnectHandler[] = [];
    private authedPlayerDisconnectHandlers: AuthedPlayerDisconnectHandler[] = [];

    /**所有认证过的玩家信息(完全断开后才清除)*/
    private allConnectionPlayer: Map<string, IPlayer> = new Map<string, IPlayer>();

    /**当前认证过的连接, playerId => conn */
    private currConnections: Map<string, ClientConnection> = new Map<string, ClientConnection>();
    /**当前认证过的玩家信息, playerId => player */
    private currConnectionplayer: Map<string, IPlayer> = new Map<string, IPlayer>();

    /**等待断线重连的玩家, playerId => player */
    private waitConnectionPlayer: Map<string, IPlayer> = new Map<string, IPlayer>();
    /**等待断线重连的定时器, playerId => NodeJS.Timeout | number */
    private waitConnectionTimeHD: Map<string, any> = new Map<string, any>();

    /**等待认证的连接，超时不认证则踢掉, playerId => conn */
    private waitAuthConnections: Map<string, ClientConnection> = new Map<string, ClientConnection>();
    /**等待认证的定时器，超时不认证则踢掉, playerId => NodeJS.Timeout | number */
    private waitAuthConnectionsTimeHD: Map<string, any> = new Map<string, any>();


    private gameServer: WsServer<GameServiceType>;
    private getGameServerCfg: () => Promise<IGameServerCfg>;

    constructor(gameServer: WsServer<GameServiceType>, getGameServerCfg: () => Promise<IGameServerCfg>) {
        this.gameServer = gameServer;
        this.getGameServerCfg = getGameServerCfg;

        //定义连接断开后的数据清理
        this.gameServer.flows.postDisconnectFlow.push(v => {
            //先停止等待认证（都断开了）
            this.clearWaitAuth(v.conn.connectionId);

            //判断之前是否认证过(即是否有玩家信息)
            let player = v.conn.currPlayer;
            if (player) {
                //@ts-ignore
                v.conn.currPlayer = undefined;
                //直接删除当前连接的相关数据, 不管有没重连, 都断开了
                this.currConnections.delete(player.authInfo.playerId);
                this.currConnectionplayer.delete(player.authInfo.playerId);

                //有玩家信息的断开，则判断是否要断线重连
                if (this.triggerConnDisconnect(v.conn.connectionId, player)) {
                    //所有中间件都允许断线重连，则直接开始流程
                    this.startWaitReconnect(v.conn.connectionId, player);
                    return v;
                }
            }
            this.disconnectClearData(v.conn.connectionId, player, true);
            return v;
        });

        //定义所有消息请求都要再认证通过之后才会受理
        this.gameServer.flows.preApiCallFlow.push(call => {
            if (call.service.name == "Reconnect" || call.service.name == "Authorize") {
                return call;
            }
            if (!call.conn.currPlayer) {
                //发送所有消息前必须通过认证
                call.error('You need Authorize before do this', { code: ErrorCodes.AuthUnverified });
                return undefined;
            }
            return call;
        });
        this.gameServer.flows.preMsgCallFlow.push(call => {
            if (call.service.name == "Reconnect" || call.service.name == "Authorize" || call.service.name == "Disconnect") {
                return call;
            }
            if (!call.conn.currPlayer) {
                //发送所有消息前必须通过认证
                call.logger.log('You need Authorize before do this', { code: ErrorCodes.AuthUnverified });
                return undefined;
            }
            return call;
        });
        this.gameServer.listenMsg('Disconnect', (call: GameMsgCall<MsgDisconnect>) => {
            //主动要求断开的,直接清理数据
            if (call.conn.currPlayer) this.disconnectClearData(call.conn.connectionId, call.conn.currPlayer, true);
            call.conn.close();
        });
    }


    /**连接断开的清理数据*/
    protected disconnectClearData(connId: string, player?: IPlayer | null, triggerEvent: boolean = true): void {
        if (player) {
            //有玩家才清理的数据

            //清理等待断线重连
            this.clearWaitReconnect(player.authInfo.playerId);

            //清理当前在线的连接
            this.currConnections.delete(player.authInfo.playerId);
            this.currConnectionplayer.delete(player.authInfo.playerId);

            //清理所有认证过的玩家
            this.allConnectionPlayer.delete(player.authInfo.playerId);

            //确认是否触发认证用户断开事件
            if (triggerEvent) this.triggerAuthedPlayerDisconnect(connId, player);
        }
        this.clearWaitAuth(connId);

    }
    /**开始连接等待认证定时器, 固定等待3秒*/
    protected startWaitAuth(conn: ClientConnection): void {
        let hd = this.waitAuthConnectionsTimeHD.get(conn.connectionId);
        if (hd) clearTimeout(hd);
        this.waitAuthConnections.set(conn.connectionId, conn);
        this.waitAuthConnectionsTimeHD.set(conn.connectionId,
            setTimeout((conn?: ClientConnection) => {
                if (conn) {
                    this.disconnectClearData(conn.connectionId, null, false);
                    conn.close();
                    conn = undefined;
                }
            }, 3000, conn)
        );
    }
    /**清理连接的等待认证定时器*/
    protected clearWaitAuth(connId: string) {
        let hd = this.waitAuthConnectionsTimeHD.get(connId);
        if (hd) clearTimeout(hd);
        this.waitAuthConnections.delete(connId);
        this.waitAuthConnectionsTimeHD.delete(connId);
    }
    /**
     * 检查新连接通过认证,是否有阻止的
     * @param conn 
     * @param player 
     */
    public checkConnAuthorizing(conn: ClientConnection, player: IPlayer): string | null {
        return this.triggerConnAuthing(conn, player);
    }
    /**
     * 设置新连接通过认证, 新认证的或者断线重连的，都要调用本方法，设置认证状态
     * @param conn 
     * @param player 
     */
    public setConnAuthorized(conn: ClientConnection, player: IPlayer): void {

        conn.currPlayer = player;
        conn.playerId = player.playerInfo.playerId;

        this.clearWaitAuth(conn.connectionId);
        this.clearWaitReconnect(player.authInfo.playerId);

        this.currConnections.set(player.authInfo.playerId, conn);
        this.currConnectionplayer.set(player.authInfo.playerId, player);
        this.allConnectionPlayer.set(player.authInfo.playerId, player);

        this.triggerConnAuthed(conn);
    }


    /**开始等待断线重连流程*/
    protected startWaitReconnect(connId: string, player: IPlayer): void {
        let hd = this.waitConnectionTimeHD.get(player.authInfo.playerId);
        if (hd) clearTimeout(hd);
        this.waitConnectionPlayer.set(player.authInfo.playerId, player);
        this.waitConnectionTimeHD.set(player.authInfo.playerId,
            setTimeout((connId: string, player?: IPlayer) => {
                this.disconnectClearData(connId, player, true);
                player = undefined;
            }, player.roomWaitReconnectTime, connId, player)
        );
    }
    /**清理连接的等待认证定时器*/
    protected clearWaitReconnect(playerId: string) {
        let hd = this.waitConnectionTimeHD.get(playerId);
        if (hd) clearTimeout(hd);
        this.waitConnectionPlayer.delete(playerId);
        this.waitConnectionTimeHD.delete(playerId);
    }
    /**尝试完成重连,清理等待数据,并返回这个连接之前用户信息,如果为null则表示已经不再等待重连,需要重新登陆*/
    protected tryReconnect(playerId: string): IPlayer | null {
        let waitPlayer = this.waitConnectionPlayer.get(playerId);
        if (!waitPlayer) return null;

        let hd = this.waitConnectionTimeHD.get(playerId);
        if (hd) clearTimeout(hd);
        this.waitConnectionPlayer.delete(playerId);
        this.waitConnectionTimeHD.delete(playerId);
        this.allConnectionPlayer.delete(playerId);
        return waitPlayer;
    }
    /**
     * 连接重连
     * @param conn 
     * @param playerToken 
     * @param roomWaitReconnectTime 可设置房间中断线后等待重连的毫秒数,默认为60000ms(60秒),设成0表示断线后直接清理(按退出房间处理)不等待重连 
     * @returns 成功null或者失败的错误消息 
     */
    public async connReconnect(conn: ClientConnection, playerToken: string, roomWaitReconnectTime?: number): Promise<IResult<IPlayer>> {
        //先验证token
        let authInfoRet = await PlayerAuthHelper.verification(playerToken);
        if (!authInfoRet.succ) return Result.buildErr(authInfoRet.err, authInfoRet.code);
        let authInfo = authInfoRet.data;
        //通过以及拿到playerId,尝试断线重连数据获取
        let player = this.tryReconnect(authInfo.playerId);
        if (!player) {
            //已经被等待清理,则返回重连失败
            return Result.buildErr('请重新登陆!', ErrorCodes.AuthReconnectionFail);
        }

        //刷新玩家显示名
        player.authInfo.showName = authInfo.showName;
        player.playerInfo.showName = authInfo.showName;

        let err = this.checkConnAuthorizing(conn, player);
        if (err) {
            return Result.buildErr(err, ErrorCodes.AuthForbid);
        }
        if (roomWaitReconnectTime !== undefined) player.roomWaitReconnectTime;
        this.setConnAuthorized(conn, player);
        this.triggerConnReconnect(conn, player);
        return Result.buildSucc(player);
    }

    /**
     * 连接认证
     * @param conn 
     * @param playerToken 
     * @param roomWaitReconnectTime 可设置房间中断线后等待重连的毫秒数,默认为60000ms(60秒),设成0表示断线后直接清理(按退出房间处理)不等待重连 
     * @returns 成功null或者失败的错误消息 
     */
    public async connAuthorize(conn: ClientConnection, playerToken: string, authPlayerPara: IPlayerInfoPara, roomWaitReconnectTime?: number): Promise<IResult<IPlayer>> {
        let authInfoRet = await PlayerAuthHelper.verification(playerToken);
        if (!authInfoRet.succ) return Result.buildErr(authInfoRet.err, authInfoRet.code);
        let authInfo = authInfoRet.data;

        if (roomWaitReconnectTime === undefined) roomWaitReconnectTime = this.defaultWaitReconnectTime;

        let playerInfo: IPlayerInfo = {
            playerId: authInfo.playerId,
            showName: authPlayerPara.showName ?? authInfo.showName,
            customPlayerStatus: authPlayerPara.customPlayerStatus ?? 0,
            customPlayerProfile: authPlayerPara.customPlayerProfile ?? '',
            isRobot: false,
            networkState: ENetworkState.ONLINE,
        };

        let player: IPlayer = {
            authInfo: authInfo,
            playerInfo: playerInfo,
            roomRobotPlayers: new Map(),
            roomWaitReconnectTime: roomWaitReconnectTime,
        };
        let err = this.checkConnAuthorizing(conn, player);
        if (err) {
            return Result.buildErr(err, ErrorCodes.AuthForbid);
        }
        this.setConnAuthorized(conn, player);
        return Result.buildSucc(player);
    }


    /**
     * 当前是否还有玩家(包含等待断线重连的)
     */
    public hasUser(): boolean {
        return hasProperty(this.allConnectionPlayer);
    }
    /**
     * 获取玩家信息（包含暂时离线的）
     */
    public getPlayer(playerId: string): IPlayer | undefined {
        return this.allConnectionPlayer.get(playerId);
    }
    /**
     * 获取玩家连接（只有在线的才有连接）
     */
    public getPlayerConn(playerId: string): ClientConnection | undefined {
        return this.currConnections.get(playerId);
    }
    /**
     * 获取玩家连接列表（只有在线的才有连接）
     */
    public getPlayersConn(playerIds: string[]): ClientConnection[] {
        let connList: ClientConnection[] = [];
        for (let playerId of playerIds) {
            let conn = this.currConnections.get(playerId);
            if (conn) connList.push(conn);
        }
        return connList;
    }
    /**
     * 获取玩家连接列表（只有在线的才有连接）
     */
    public getPlayersConnFromPlayerInfos(playerInfos: IPlayerInfo[]): ClientConnection[] {
        let connList: ClientConnection[] = [];
        for (let p of playerInfos) {
            let conn = this.currConnections.get(p.playerId);
            if (conn) connList.push(conn);
        }
        return connList;
    }



    protected triggerConnAuthing(conn: ClientConnection, player: IPlayer): string | null {
        for (let i = 0; i < this.connAuthingHandlers.length; i++) {
            try {
                let err = this.connAuthingHandlers[i](conn, player);
                if (err) return err;
            } catch (e) {
                this.gameServer.logger?.error("triggerConnAuthed:", e);
            }
        }
        return null;
    }
    protected triggerConnAuthed(conn: ClientConnection): void {
        //延时1毫秒,让原始授权流程完整走完后再触发事件
        setTimeout((conn?: ClientConnection) => {
            if (conn) {
                for (let i = 0; i < this.connAuthedHandlers.length; i++) {
                    try {
                        this.connAuthedHandlers[i](conn);
                    } catch (e) {
                        this.gameServer.logger?.error("triggerConnAuthed:", e);
                    }
                }
                conn = undefined;
            }
        }, 1, conn);
    }
    protected triggerAuthedPlayerDisconnect(connId: string, player: IPlayer): void {
        //延时1毫秒,让原始流程完整走完后再触发事件
        setTimeout((connId?: string, player?: IPlayer) => {
            if (connId && player) {
                for (let i = 0; i < this.authedPlayerDisconnectHandlers.length; i++) {
                    try {
                        this.authedPlayerDisconnectHandlers[i](connId, player);
                    } catch (e) {
                        this.gameServer.logger?.error("triggerConnDisconnect:", e);
                    }
                }
                connId = undefined;
                player = undefined;
            }
        }, 1, connId, player);
    }
    protected triggerConnDisconnect(connId: string, player: IPlayer): boolean {
        for (let i = 0; i < this.connDisconnectHandlers.length; i++) {
            try {
                let wait = this.connDisconnectHandlers[i](connId, player);
                if (!wait) return false;
            } catch (e) {
                this.gameServer.logger?.error("triggerConnDisconnect:", e);
            }
        }
        return true;
    }
    protected triggerConnReconnect(conn: ClientConnection, player: IPlayer): boolean {
        for (let i = 0; i < this.connReconnectHandlers.length; i++) {
            try {
                this.connReconnectHandlers[i](conn, player);
            } catch (e) {
                this.gameServer.logger?.error("triggerConnReconnect:", e);
            }
        }
        return true;
    }

    /**
     * 注册验证连接授权事件,新连接和断线重连都走这里
     * @param handler 
     */
    public onConnAuthing(handler: ConnAuthingHandler): void {
        this.connAuthingHandlers.push(handler);
    }
    /**
     * 取消注册连接授权事件
     * @param handler 
     */
    public offConnAuthing(handler: ConnAuthingHandler): void {
        this.connAuthingHandlers.remove(h => h == handler);
    }

    /**
     * 注册连接授权事件,新连接和断线重连成功都走这里
     * @param handler 
     */
    public onConnAuthed(handler: ConnAuthedHandler): void {
        this.connAuthedHandlers.push(handler);
    }
    /**
     * 取消注册连接授权事件
     * @param handler 
     */
    public offConnAuthed(handler: ConnAuthedHandler): void {
        this.connAuthedHandlers.remove(h => h == handler);
    }

    /**
     * 注册连接断开事件(非服务端主动断开), 返回是否允许等待断线重连! 只有返回true, 才支持 onConnReconnect 事件!
     *  (彻底断开不再重连则使用 onAuthedPlayerDisconnect)
     * @param handler 
     */
    public onConnDiconnect(handler: ConnDisconnectHandler): void {
        this.connDisconnectHandlers.push(handler);
    }
    /**
     * 取消注册连接断开事件
     * @param handler 
     */
    public offConnDiconnect(handler: ConnDisconnectHandler): void {
        this.connDisconnectHandlers.remove(h => h == handler);
    }

    /**
     * 注册断线重连上事件, 只有对应玩家的 onConnDiconnect 事件返回true才支持重连!
     *  (彻底断开不再重连则使用 onAuthedPlayerDisconnect)
     * @param handler 
     */
    public onConnReconnect(handler: ConnReconnectHandler): void {
        this.connReconnectHandlers.push(handler);
    }
    /**
     * 取消注册连接重新连上事件
     * @param handler 
     */
    public offConnReconnect(handler: ConnReconnectHandler): void {
        this.connReconnectHandlers.remove(h => h == handler);
    }


    /**
     * 注册玩家断开事件(连接断开并且不再等待重连后触发)
     * @param handler 
     */
    public onAuthedPlayerDisconnect(handler: AuthedPlayerDisconnectHandler): void {
        this.authedPlayerDisconnectHandlers.push(handler);
    }
    /**
     * 取消注册玩家断开事件
     * @param handler 
     */
    public offAuthedPlayerDisconnect(handler: AuthedPlayerDisconnectHandler): void {
        this.authedPlayerDisconnectHandlers.remove(h => h == handler);
    }


}