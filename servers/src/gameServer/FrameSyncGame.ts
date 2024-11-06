
import { MsgNotifySyncFrame } from "../shared/gameClient/protocols/MsgNotifySyncFrame";
import { MsgPlayerInpFrame } from "../shared/gameClient/protocols/MsgPlayerInpFrame";
import { MsgPlayerSendSyncState } from "../shared/gameClient/protocols/MsgPlayerSendSyncState";
import { ConnectionStatus } from "tsrpc";
import { FrameSyncExecutor } from "./FrameSyncExecutor";
import { ClientConnection, GameMsgCall, GameServer, GameWsServer } from "./GameServer";
import { GameConnMgr } from "./GameConnMgr";
import { IRoomInfo } from "../shared/tsgf/room/IRoomInfo";
import { IPlayer } from "../shared/tsgfServer/auth/Models";
import { EPlayerInputFrameType, IAfterFrames, IGameSyncFrame, IFramePlayerInput, IPlayerInputOperate } from "../shared/tsgf/room/IGameFrame";
import { IPlayerInfo } from "../shared/tsgf/player/IPlayerInfo";


/**帧同步游戏*/
export class FrameSyncGame {

    private _inSync = false;
    /**是否已经开始了同步*/
    get inSync() {
        return this._inSync;
    }

    /**帧同步执行器*/
    private frameSyncExecutor: FrameSyncExecutor;

    private _inRandomRequirePlayerSyncState: boolean = false;
    /**当前是否在随机要求连接同步游戏状态数据到服务端*/
    get inRandomRequirePlayerSyncState() {
        return this._inRandomRequirePlayerSyncState;
    }
    /**随机要求连接同步游戏状态数据到服务端的 定时器句柄*/
    private randomRequirePlayerSyncStateHD!: NodeJS.Timeout;
    /**随机要求连接同步游戏状态数据到服务端的 定时间隔*/
    public randomRequirePlayerSyncStateInvMs?: number;
    /**当前要求同步状态的玩家ID,即不是所有客户端发来的同步状态都使用的*/
    private requireSyncStatePlayerId: string | undefined;

    private roomInfo: IRoomInfo;
    private gameWsServer: GameWsServer;
    private gameConnMgr: GameConnMgr;
    private getRoomAllPlayerConns: () => ClientConnection[];
    /**
     * 构造函数
     * @param syncFrameRate 同步帧率(每秒多少帧),默认每秒30帧
     * @param randomRequirePlayerSyncEnabled 是否启用随机要求玩家同步状态给服务端的功能【前提客户端要实现】,方便大大缩短追帧时间
     * @param randomRequirePlayerSyncStateInvMs 启用随机要求玩家同步状态功能的间隔
     */
    constructor(roomInfo: IRoomInfo, gameWsServer: GameWsServer, gameConnMgr: GameConnMgr, getRoomAllPlayerConns: () => ClientConnection[], syncFrameRate = 30, randomRequirePlayerSyncStateInvMs?:number) {
        this.roomInfo = roomInfo;
        this.gameWsServer = gameWsServer;
        this.gameConnMgr = gameConnMgr;
        this.randomRequirePlayerSyncStateInvMs = randomRequirePlayerSyncStateInvMs;
        this.getRoomAllPlayerConns = getRoomAllPlayerConns;
        this.frameSyncExecutor = new FrameSyncExecutor((msg) => this.onSyncOneFrame(msg), syncFrameRate);
    }

    /**销毁游戏数据,方便快速回收*/
    public dispose(): void {
        this.stopGame();
    }

    private onSyncOneFrame(msg: MsgNotifySyncFrame) {
        let playerConnList = this.getRoomAllPlayerConns();
        if (playerConnList.length <= 0) return;
        //广播给游戏中所有连接
        this.gameWsServer.broadcastMsg("NotifySyncFrame", msg, playerConnList);
    }


    /**
     * [同步中才有效]玩家输入操作帧
     *
     * @public
     * @param playerInfo
     * @param inpFrameType
     * @param setOthersProp 自行设置额外字段, 如帧输入类型是操作,则需要设置operates字段
     */
    public playerInpFrame(playerInfo: IPlayerInfo, inpFrameType: EPlayerInputFrameType,
        setOthersProp?: (inpFrame: IFramePlayerInput) => void) {
        this.frameSyncExecutor.addPlayerInpFrame(playerInfo.playerId, inpFrameType, setOthersProp);
    }

    /**
     * 获取追帧数据(最后状态数据+追帧包)
     * @param startFrameIndex 使用指定的帧索引开始追帧. 不传则默认使用服务端状态同步所在帧索引开始,如果没有状态同步则从头开始
     */
    public buildAfterFrames(startFrameIndex?: number): IAfterFrames {
        return this.frameSyncExecutor.buildAfterFrames(startFrameIndex);
    }
    /**
     * 请求帧数组
     *
     * @public
     * @param beginFrameIndex 起始帧索引(包含)
     * @param endFrameIndex 截止帧索引(包含)
     * @returns
     */
    public requestFrames(beginFrameIndex: number, endFrameIndex: number): IGameSyncFrame[] {
        return this.frameSyncExecutor.requestFrames(beginFrameIndex, endFrameIndex);
    }

    /**
     * 同步游戏状态数据
     * @param stateData 
     * @param stateFrameIndex 
     */
    public syncStateData(stateData: any, stateFrameIndex: number): void {
        this.frameSyncExecutor.syncStateData(stateData, stateFrameIndex);
    }


    /**
     * 停止随机要求连接同步游戏状态数据给服务端
     */
    public stopRandomRequireConnSyncState(): void {
        this._inRandomRequirePlayerSyncState = false;
        clearInterval(this.randomRequirePlayerSyncStateHD);
    }
    /**
     * 开始随机要求连接同步游戏状态数据给服务端
     */
    public startRandomRequireConnSyncState(): void {
        this.stopRandomRequireConnSyncState();
        if (this.randomRequirePlayerSyncStateInvMs) {
            this._inRandomRequirePlayerSyncState = true;
            this.randomRequirePlayerSyncStateHD = setInterval(this.onRandomRequireConnSyncState.bind(this), this.randomRequirePlayerSyncStateInvMs);
        }
    }

    /**玩家发送*/
    public playerSendSyncState(player: IPlayer, msg: MsgPlayerSendSyncState) {
        if (!this._inRandomRequirePlayerSyncState) return;
        //必须是服务端当前指定的(信任的),否则不使用这同步数据
        if (this.requireSyncStatePlayerId !== player?.playerInfo?.playerId) return;
        //同步服务端状态数据
        this.frameSyncExecutor.syncStateData(msg.stateData, msg.stateFrameIndex);
    }
    /**
     * 处理随机要求连接同步游戏状态数据给服务端
     */
    onRandomRequireConnSyncState(): void {
        //如果当前没有连接,直接返回
        if (this.roomInfo.playerList.length <= 0) return;

        let conn: ClientConnection | undefined;
        if (this.requireSyncStatePlayerId) {
            //已经指定过连接了,直接获取
            conn = this.gameConnMgr.getPlayerConn(this.requireSyncStatePlayerId);
        }
        if (!conn || conn.status != ConnectionStatus.Opened) {
            //没指定过或者之前指定的不能用了,则重新随机一个
            let connIndex = Math.floor(Math.random() * this.roomInfo.playerList.length);
            this.requireSyncStatePlayerId = this.roomInfo.playerList[connIndex].playerId;
            conn = this.gameConnMgr.getPlayerConn(this.requireSyncStatePlayerId);
        }

        conn!.sendMsg("RequirePlayerSyncState", {});
    }


    /**开始游戏,根据启用的功能,直接开始游戏服务支持*/
    public startGame(): void {
        this.frameSyncExecutor.startSyncFrame();
        this.startRandomRequireConnSyncState();
        this._inSync = true;

        for (let playerInfo of this.roomInfo.playerList) {
            this.frameSyncExecutor.addPlayerInpFrame(playerInfo.playerId, EPlayerInputFrameType.PlayerEnterGame,
                inpFrame => inpFrame.playerInfo = playerInfo);
        }
    }
    /**停止游戏内相关功能,并回收或重置相关数据*/
    public stopGame(): void {
        this._inSync = false;
        this.frameSyncExecutor.stopSyncFrame();
        this.stopRandomRequireConnSyncState();
    }

}