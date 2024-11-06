
import { MsgPlayerInpFrame } from "../shared/gameClient/protocols/MsgPlayerInpFrame";
import { MatchRequestTerminal } from "../shared/tsgfServer/match/MatchRequestTerminal";
import { logger } from "../shared/tsgf/logger";
import { EMatchFromType, IMatchParamsFromPlayer, IMatchParamsFromRoomAllPlayer, IMatchResult, IMatchPlayerResultWithServer } from "../shared/tsgf/match/Models";
import { ENetworkState, IPlayerInfo, IPlayerInfoPara } from "../shared/tsgf/player/IPlayerInfo";
import { ErrorCodes, IResult, Result } from "../shared/tsgf/Result";
import { EPlayerInputFrameType, IFramePlayerInput } from "../shared/tsgf/room/IGameFrame";
import { EFrameSyncState, EPrivateRoomJoinMode, IChangeRoomPara, IJoinRoomPara, IRoomInfo, ITeamInfo, ITeamPlayerIds } from "../shared/tsgf/room/IRoomInfo";
import { arrCount, arrGroup, arrRemoveItems } from "../shared/tsgf/Utils";
import { IPlayer } from "../shared/tsgfServer/auth/Models";
import { PlayerAuthHelper } from "../shared/tsgfServer/auth/PlayerAuthHelper";
import { IMatchFromRoomAllPlayersOnServer, IMatchRequest } from "../shared/tsgfServer/match/Models";
import { IRoomRegInfo } from "../shared/tsgfServer/room/Models";
import { ERoomRegChangedType, RoomHelper } from "../shared/tsgfServer/room/RoomHelper";
import { buildGuid, buildPlayerId, buildPlayerRobotId } from "../shared/tsgfServer/ServerUtils";
import { ConnectionCollection } from "./ConnectionCollection";
import { FrameSyncGame } from "./FrameSyncGame";
import { GameConnMgr } from "./GameConnMgr";
import { ClientConnection, GameServer, GameWsServer } from "./GameServer";
import { GameClusterNodeClient } from "../shared/tsgfServer/gameCluster/GameClusterNodeClient";


/**游戏房间操作对象*/
export class GameRoom {
    private gameWsServer: GameWsServer;
    private gameConnMgr: GameConnMgr;
    private matchReqTerminal: MatchRequestTerminal;
    private gameClusterClient: GameClusterNodeClient;
    /**在线的玩家连接,连接标识使用的是玩家ID*/
    public onlinePlayerConns: ConnectionCollection;
    public roomRegInfo: IRoomRegInfo;
    public roomInfo: IRoomInfo;
    public game: FrameSyncGame;
    public isDismiss: boolean = false;

    /**招人匹配请求id,如果开启了则有值*/
    private joinUsMatchReqId?: string;
    /**内部设置当房间所有玩家发起匹配的结果回调*/
    private onRoomAllPlayersMatchResult?: (matchResult: IResult<IMatchResult>) => any;
    private onRoomAllPlayersMatchResultOther?: (matchResult: IResult<IMatchResult>) => any;

    constructor(roomRegInfo: IRoomRegInfo, roomInfo: IRoomInfo,
        gameWsServer: GameWsServer, gameConnMgr: GameConnMgr,
        matchReqTerminal: MatchRequestTerminal,
        gameClusterClient: GameClusterNodeClient
    ) {
        this.roomRegInfo = roomRegInfo;
        this.roomInfo = roomInfo;
        this.gameConnMgr = gameConnMgr;
        this.gameWsServer = gameWsServer;
        this.matchReqTerminal = matchReqTerminal;
        this.gameClusterClient = gameClusterClient;
        this.onlinePlayerConns = new ConnectionCollection(c => c.playerId);
        this.game = new FrameSyncGame(this.roomInfo, gameWsServer, this.gameConnMgr,
            () => this.onlinePlayerConns.connections, roomInfo.frameRate, roomInfo.randomRequirePlayerSyncStateInvMs);
    }
    public dispose() {

        //如果还没解散就释放,则先执行解散
        if (!this.isDismiss) {
            //执行实际的解散逻辑（数据操作）
            this.internalDismissRoom();
            //触发事件
            this.triggerDismissRoomNotify(this.roomInfo.playerList);
        }

        this.game.dispose();

        this.onlinePlayerConns.clearAllConnections();
    }

    /**触发玩家进入房间事件的通知, 不会通知当前玩家*/
    protected async triggerPlayerJoinRoomNotify(joinPlayerInfo: IPlayerInfo) {
        await this.gameWsServer.broadcastMsg('NotifyJoinRoom', {
            joinPlayerId: joinPlayerInfo.playerId,
            roomInfo: this.roomInfo,
        }, this.onlinePlayerConns.connections.filter(c => c.playerId !== joinPlayerInfo.playerId));
    }
    /**触发玩家离开房间事件的通知, 不会通知当前玩家*/
    protected async triggerPlayerLeaveRoomNotify(leavePlayerInfo: IPlayerInfo) {
        await this.gameWsServer.broadcastMsg('NotifyLeaveRoom', {
            leavePlayerInfo: leavePlayerInfo,
            roomInfo: this.roomInfo,
        }, this.onlinePlayerConns.connections.filter(c => c.playerId !== leavePlayerInfo.playerId));
    }

    protected async triggerKickedOutRoomNotify(playerInfo: IPlayerInfo) {
        await this.gameWsServer.broadcastMsg('NotifyKicked', {
            roomInfo: this.roomInfo
        }, this.onlinePlayerConns.connections.filter(c => c.playerId === playerInfo.playerId));
    }

    protected async triggerDismissRoomNotify(playerInfos: IPlayerInfo[]) {
        let connList: ClientConnection[] = [];
        for (let playerInfo of playerInfos) {
            let playerConn = this.gameConnMgr.getPlayerConn(playerInfo.playerId);
            if (!playerConn) continue;
            connList.push(playerConn);
        }
        await this.gameWsServer.broadcastMsg('NotifyDismissRoom', {
            roomInfo: this.roomInfo,
        }, connList);
    }
    protected async triggerStartFrameSyncNotify(startPlayerInfo: IPlayerInfo) {
        await this.gameWsServer.broadcastMsg('NotifyStartFrameSync', {
            startPlayerId: startPlayerInfo.playerId,
            roomInfo: this.roomInfo,
        }, this.onlinePlayerConns.connections);
    }
    protected async triggerStopFrameSyncNotify(stopPlayerInfo: IPlayerInfo) {
        await this.gameWsServer.broadcastMsg('NotifyStopFrameSync', {
            stopPlayerId: stopPlayerInfo.playerId,
            roomInfo: this.roomInfo,
        }, this.onlinePlayerConns.connections);
    }
    public async triggerChangePlayerNetworkState(playerInfo: IPlayerInfo) {
        await this.gameWsServer.broadcastMsg('NotifyChangePlayerNetworkState', {
            roomInfo: this.roomInfo,
            changePlayerId: playerInfo.playerId,
            networkState: playerInfo.networkState,
        }, this.onlinePlayerConns.connections);
    }
    protected async triggerChangeRoomNotify() {
        await this.gameWsServer.broadcastMsg('NotifyChangeRoom', {
            roomInfo: this.roomInfo,
        }, this.onlinePlayerConns.connections);
    }
    public async triggerChangeCustomPlayerStatus(playerInfo: IPlayerInfo, oldVal: number) {
        await this.gameWsServer.broadcastMsg('NotifyChangeCustomPlayerStatus', {
            roomInfo: this.roomInfo,
            changePlayerId: playerInfo.playerId,
            customPlayerStatus: playerInfo.customPlayerStatus,
            oldCustomPlayerStatus: oldVal,
        }, this.onlinePlayerConns.connections);
    }
    public async triggerChangeCustomPlayerProfile(playerInfo: IPlayerInfo, oldVal: string) {
        await this.gameWsServer.broadcastMsg('NotifyChangeCustomPlayerProfile', {
            roomInfo: this.roomInfo,
            changePlayerId: playerInfo.playerId,
            customPlayerProfile: playerInfo.customPlayerProfile,
            oldCustomPlayerProfile: oldVal,
        }, this.onlinePlayerConns.connections);
    }
    public async triggerChangePlayerTeam(playerInfo: IPlayerInfo, oldVal?: string) {
        await this.gameWsServer.broadcastMsg('NotifyChangePlayerTeam', {
            roomInfo: this.roomInfo,
            changePlayerId: playerInfo.playerId,
            teamId: playerInfo.customPlayerProfile,
            oldTeamId: oldVal,
        }, this.onlinePlayerConns.connections);
    }

    /**自动设置(开启或停止)房间招人匹配*/
    protected async autoSetRoomJoinUsMatch(mustNew = false): Promise<void> {

        if (!this.roomInfo
            || this.isDismiss
            || this.roomInfo.isPrivate
            || !this.roomInfo.matcherKey
            || this.roomInfo.maxPlayers <= this.roomInfo.playerList.length
            || this.roomInfo.frameSyncState === EFrameSyncState.START) {
            //这里应该关闭匹配
            this.disabledRoomJoinUsMatch();
        } else {
            //这里应该启用招人匹配
            if (!mustNew && this.joinUsMatchReqId) {
                //已经开启则忽略
                return;
            }
            //请求匹配,并记录请求id
            let ret = await this.matchReqTerminal.requestMatch(this.roomRegInfo.appId, {
                matchTimeoutSec: 120, //最长2分钟轮询一次, 防止
                matchFromType: EMatchFromType.RoomJoinUs,
                matchFromInfo: {
                    roomId: this.roomInfo.roomId,
                    currPlayerCount: this.roomInfo.playerList.length,
                    teamsPlayerIds: this.roomRegInfo.teamsPlayerIds.slice(),
                },
                matcherKey: this.roomInfo.matcherKey,
                maxPlayers: this.roomInfo.maxPlayers,
                matcherParams: {},
            }, _ => {
                //到这里应该是超时, 需要轮询状态, 防止中间有错误, 服务器内存就无限挂着一个无法连接的匹配房间!
                this.autoSetRoomJoinUsMatch(true);
            }, false);
            if (!ret.succ) {
                logger.error(`GameRoom.enabledRoomJoinUsMatch.requestMatch失败:${ret.err}  roomInfo:`, this.roomInfo);
                return;
            }
            this.joinUsMatchReqId = ret.data;
        }
    }
    /**停止房间招人匹配*/
    protected async disabledRoomJoinUsMatch(): Promise<void> {
        if (this.joinUsMatchReqId) {
            await this.matchReqTerminal.cancelMatch(this.roomRegInfo.appId, this.joinUsMatchReqId);
            this.joinUsMatchReqId = undefined;
        }
    }
    /**生成队伍玩家id结构*/
    protected buildTeamsPlayerIds(playerInfos: IPlayerInfo[]): ITeamPlayerIds[] {
        let arr: ITeamPlayerIds[] = [];
        let group = arrGroup(playerInfos, p => p.teamId);
        for (let groupList of group) {
            arr.push({
                teamId: groupList[0] ?? '',
                playerIds: groupList[1].map(p => p.playerId),
            });
        }
        return arr;
    }
    /**
     * [实际的数据操作] 解散房间
     *
     * @protected
     * @returns
     */
    protected async internalDismissRoom(): Promise<void> {
        if (this.isDismiss) return;

        //删除房间注册信息, 截断后续新加入的人(存在失败的可能，集群可能先清理掉了，可以忽略)
        await this.gameClusterClient.dismissRoom(this.roomInfo.roomId);

        //停止游戏
        this.game.stopGame();

        //如果有开启招人匹配则停止
        await this.disabledRoomJoinUsMatch();

        //拷贝一份遍历,因为循环时会操作玩家数组
        const tmpArr = [...this.roomInfo.playerList];
        for (let playerInfo of tmpArr) {
            let roomPlayer = this.gameConnMgr.getPlayer(playerInfo.playerId);
            //机器人玩家没有连接, 忽略
            if (!roomPlayer) continue;
            await this.internalLeaveRoom(roomPlayer, false);
        }
        this.roomInfo.playerList.length = 0;
        this.isDismiss = true;
    }

    /**
     * [实际的数据操作] 玩家离开房间
     *
     * @public
     * @param player
     * @returns 返回实际离开的玩家数组(如果有会包含机器人玩家)
     */
    protected async internalLeaveRoom(player: IPlayer, canUpdateRegInfo: boolean = true): Promise<IPlayerInfo[]> {
        let teamId = player.playerInfo.teamId;
        //当前房间id设置为未定义
        player.authInfo.currRoomId = undefined;
        PlayerAuthHelper.updatePlayerCurrRoomId(player.authInfo.playerToken, player.authInfo.currRoomId);

        const leavePlayers: IPlayerInfo[] = [];
        if (player.roomRobotPlayers?.size) {
            //玩家如果有连接机器人, 则先处理退出
            player.roomRobotPlayers.forEach(robitPlayer => {
                //自己的房间机器人操作离开房间数据
                this.internalLeaveRoomData(robitPlayer);
                leavePlayers.push(robitPlayer);
            });
            //清理房间机器人
            player.roomRobotPlayers.clear();
        }
        //自己操作离开房间数据
        this.internalLeaveRoomData(player.playerInfo);
        leavePlayers.push(player.playerInfo);

        //同步信息给房间注册信息
        this.roomRegInfo.teamsPlayerIds = this.buildTeamsPlayerIds(this.roomInfo.playerList);
        this.roomRegInfo.emptySeats = RoomHelper.getRoomEmptySeats(this.roomInfo);
        if (canUpdateRegInfo) {
            await Promise.all([
                this.gameClusterClient.updateRoom(
                    this.roomRegInfo,
                    ERoomRegChangedType.PlayerLeaveRoom,
                    player.playerInfo.playerId,
                    teamId,
                ),
                //根据当前房间情况去自动开启或关闭招人匹配
                this.autoSetRoomJoinUsMatch(),
            ]);
        }

        //移除房间在线玩家连接
        this.onlinePlayerConns.removeConnection(player.playerInfo.playerId);

        return leavePlayers;
    }

    /**
     * [内部实现] 玩家退出队伍的数据操作
     * @param playerInfo
     */
    protected internalPlayerLeaveTeam(playerInfo: IPlayerInfo) {
        let oldTeamId = playerInfo.teamId;
        playerInfo.teamId = undefined;
        if (oldTeamId) {
            let oldTeamIndex = this.roomInfo.teamList.findIndex(t => t.id === oldTeamId);
            if (oldTeamIndex > -1) {
                //如果之前有在队伍中,需要处理
                if (this.roomInfo.freeTeamMinPlayers && this.roomInfo.freeTeamMaxPlayers) {
                    //是自由队伍的房间
                    if (arrCount(this.roomInfo.playerList, p => p.teamId === oldTeamId) <= 0) {
                        //之前队伍已经没人了,则销毁该队伍
                        arrRemoveItems(this.roomInfo.teamList, t => t.id === oldTeamId);
                        this.roomInfo.teamList.splice(oldTeamIndex, 1);
                    }
                }
            }
        }
    }
    /**玩家退出房间的数据操作*/
    protected internalLeaveRoomData(playerInfo: IPlayerInfo) {
        //玩家退出队伍数据操作
        this.internalPlayerLeaveTeam(playerInfo);
        //移除房间的玩家列表中该玩家对象
        arrRemoveItems(this.roomInfo.playerList, p => p.playerId === playerInfo.playerId);
        //离开房间了就清空当前房间控制的机器人列表(不管有没有)
        playerInfo.roomRobotIds = undefined;
        //玩家退出房间帧
        this.game.playerInpFrame(playerInfo, EPlayerInputFrameType.LeaveRoom,
            inpFrame => inpFrame.playerInfo = playerInfo);
    }

    /**玩家加入房间的内部操作, 同时会操作连接和通知, 成功的data===true则要求直接返回(如已经在房间中)*/
    protected async internalJoinRoom(playerInfo: IPlayerInfo, joinPara: IJoinRoomPara, robotOwnPlayerInfo?: IPlayerInfo): Promise<IResult<boolean>> {
        let existsPlayerInfo = this.roomInfo.playerList.find(p => p.playerId === playerInfo.playerId);
        if (existsPlayerInfo) {
            //这个玩家已经在房间中了，直接成功！
            return Result.buildSucc(true);
        }
        let playerConn: ClientConnection | undefined;
        if (!robotOwnPlayerInfo) {
            //不是机器人,则需要处理连接
            playerConn = this.gameConnMgr.getPlayerConn(playerInfo.playerId);
            if (!playerConn) {
                return Result.buildErr('玩家不在线！', ErrorCodes.Exception);
            }
        }
        // 空位判断
        if (this.roomRegInfo.emptySeats <= 0) {
            // 但排除一种情况, 房主要进来由设置了保留空位, 则可以进!
            if (playerInfo.playerId !== this.roomInfo.ownerPlayerId || !this.roomInfo.retainOwnSeat) {
                //不是房主或者没设置给房主保留,则真满房~
                return Result.buildErr('房间人数已满！', ErrorCodes.RoomPlayersFull);
            }
        }
        if (this.roomInfo.isPrivate && this.roomInfo.ownerPlayerId !== playerInfo.playerId) {
            // 私有房间,且加入的不是房主, 则需要验证一波
            if (robotOwnPlayerInfo) {
                //私有房的加机器人操作必须是房主
                if (this.roomInfo.ownerPlayerId !== robotOwnPlayerInfo.playerId) {
                    return Result.buildErr('房间不可加入！', ErrorCodes.RoomForbidJoin);
                }
            } else {
                //正常玩家加入私有房的限制判断
                switch (this.roomInfo.privateRoomJoinMode) {
                    case EPrivateRoomJoinMode.forbidJoin:
                        //房间不可加入时
                        return Result.buildErr('房间不可加入！', ErrorCodes.RoomForbidJoin);
                    case EPrivateRoomJoinMode.password:
                        // 密码加入则需要提供密码
                        if (!joinPara.password) {
                            return Result.buildErr('房间需要密码！', ErrorCodes.RoomMustPassword);
                        }
                        if (joinPara.password !== this.roomRegInfo.privateRoomPassword) {
                            return Result.buildErr('房间密码不正确！', ErrorCodes.RoomPasswordWrong);
                        }
                        break;
                }
            }
        }
        let changeTeamResult = await this.internalChangePlayerTeam(playerInfo, joinPara.teamId);
        if (!changeTeamResult.succ) {
            return Result.buildErr(changeTeamResult.err, changeTeamResult.code);
        }
        this.roomInfo.playerList.push(playerInfo);

        if (robotOwnPlayerInfo) {
            //是机器人, 则需要加到玩家拥有机器人数组上
            robotOwnPlayerInfo.roomRobotIds = Array.from(new Set([
                ...robotOwnPlayerInfo.roomRobotIds ?? [],
                playerInfo.playerId
            ]));
        }

        //加入房间先触发事件
        await this.triggerPlayerJoinRoomNotify(playerInfo);

        if (!robotOwnPlayerInfo) {
            //不是机器人,则这个时候再把连接加入
            this.onlinePlayerConns.addConnection(playerConn!);
        }

        //再给所有人发玩家加入房间的输入帧
        this.game.playerInpFrame(playerInfo, EPlayerInputFrameType.JoinRoom,
            inpFrame => inpFrame.playerInfo = playerInfo);

        //更新房间注册信息
        this.roomRegInfo.teamsPlayerIds = this.buildTeamsPlayerIds(this.roomInfo.playerList);
        this.roomRegInfo.emptySeats = RoomHelper.getRoomEmptySeats(this.roomInfo);
        await Promise.all([
            this.gameClusterClient.updateRoom(
                this.roomRegInfo,
                ERoomRegChangedType.PlayerJoinRoom,
                playerInfo.playerId,
                joinPara.teamId,
            ),
            //根据当前房间情况去自动开启或关闭招人匹配
            this.autoSetRoomJoinUsMatch(),
        ]);

        return Result.buildSucc(false);
    }

    /**内置变更玩家所在队伍, 只有实际变更了才会更新和推送, 有指定队伍会根据房间配置来初始化*/
    protected async internalChangePlayerTeam(playerInfo: IPlayerInfo, newTeamId?: string): Promise<IResult<null>> {
        if (newTeamId) {
            //有指定队伍
            let team = this.roomInfo.teamList.find(t => t.id === newTeamId);
            if (!team) {
                //不存在队伍需要判断情况
                if (this.roomInfo.fixedTeamCount) {
                    //又是固定队伍,所以直接返回失败!
                    return Result.buildErr(`要加入的队伍id不存在[${newTeamId}]`, ErrorCodes.RoomTeamNotFound);
                }
                if (!this.roomInfo.freeTeamMinPlayers || !this.roomInfo.freeTeamMaxPlayers) {
                    //但又没定义自由队伍的参数,所以直接返回失败!
                    return Result.buildErr(`房间未定义自动创建队伍参数!`, ErrorCodes.RoomTeamNotFound);
                }
                team = {
                    id: newTeamId,
                    name: newTeamId,
                    minPlayers: this.roomInfo.freeTeamMinPlayers,
                    maxPlayers: this.roomInfo.freeTeamMaxPlayers,
                };
            }
            if (arrCount(this.roomInfo.playerList, p => p.teamId === newTeamId) >= team.maxPlayers) {
                return Result.buildErr(`要加入的队伍已满!`, ErrorCodes.RoomTeamPlayersFull);
            }
        }

        let oldTeamId = playerInfo.teamId;
        if (playerInfo.teamId !== newTeamId) {
            //和之前队伍不一样才需要更新和推送
            this.internalPlayerLeaveTeam(playerInfo);
            playerInfo.teamId = newTeamId;
            if (oldTeamId) {
                let oldTeamIndex = this.roomInfo.teamList.findIndex(t => t.id === oldTeamId);
                if (oldTeamIndex > -1) {
                    //如果之前有在队伍中,需要处理
                    if (this.roomInfo.freeTeamMinPlayers && this.roomInfo.freeTeamMaxPlayers) {
                        //是自由队伍的房间
                        if (arrCount(this.roomInfo.playerList, p => p.teamId === oldTeamId) <= 0) {
                            //之前队伍已经没人了,则销毁该队伍
                            arrRemoveItems(this.roomInfo.teamList, t => t.id === oldTeamId);
                            this.roomInfo.teamList.splice(oldTeamIndex, 1);
                        }
                    }
                }
            }
            this.roomRegInfo.emptySeats = RoomHelper.getRoomEmptySeats(this.roomInfo);
            await Promise.all([
                this.gameClusterClient.updateRoom(
                    this.roomRegInfo,
                    ERoomRegChangedType.PlayerChangeTeam,
                    playerInfo.playerId,
                    newTeamId,
                    oldTeamId
                ),
                this.triggerChangePlayerTeam(playerInfo, oldTeamId),
            ]);
        }


        return Result.buildSucc(null);
    }

    protected async intenalChangeCustomPlayerStatus(playerId: string, newCustomPlayerStatus: number)
        : Promise<IResult<IPlayerInfo>> {
        let playerInfo = this.roomInfo.playerList.find(p => p.playerId === playerId);
        if (!playerInfo) return Result.buildErr('玩家不在房间中!', ErrorCodes.Exception);

        if (playerInfo.customPlayerStatus !== newCustomPlayerStatus) {
            let oldVal = playerInfo.customPlayerStatus;
            playerInfo.customPlayerStatus = newCustomPlayerStatus;
            //无需等待通知结果,直接返回操作成功
            this.triggerChangeCustomPlayerStatus(playerInfo, oldVal);
        }
        return Result.buildSucc(playerInfo);
    }

    protected async intenalChangeCustomPlayerProfile(playerId: string, newCustomPlayerProfile: string)
        : Promise<IResult<IPlayerInfo>> {
        let playerInfo = this.roomInfo.playerList.find(p => p.playerId === playerId);
        if (!playerInfo) return Result.buildErr('玩家不在房间中!');

        if (playerInfo.customPlayerProfile !== newCustomPlayerProfile) {
            let oldVal = playerInfo.customPlayerProfile;
            playerInfo.customPlayerProfile = newCustomPlayerProfile;
            this.triggerChangeCustomPlayerProfile(playerInfo, oldVal);
        }

        return Result.buildSucc(playerInfo);
    }

    /**
     * 玩家加入房间，会根据房间等的规则判断是否可以加入
     *
     * @public
     * @param player
     * @returns
     */
    public async joinRoom(player: IPlayer, joinPara: IJoinRoomPara): Promise<IResult<IRoomInfo>> {
        const ret = await this.internalJoinRoom(player.playerInfo, joinPara);
        //加入失败,直接返回
        if (!ret.succ) return Result.buildErr(ret);
        //加入成功并且要求直接返回成功
        if (ret.data) return Result.buildSucc(this.roomInfo);

        //当前玩家的数据操作
        player.authInfo.currRoomId = this.roomInfo.roomId;
        PlayerAuthHelper.updatePlayerCurrRoomId(player.authInfo.playerToken, player.authInfo.currRoomId);

        return Result.buildSucc(this.roomInfo);
    }



    /**
     * 离开玩家当前所在的房间,如果离开后没人了,房间将被解散，返回房间是否被解散
     *
     * @public
     * @param player
     * @returns
     */
    public async leaveRoom(player: IPlayer): Promise<IResult<null>> {
        const leavePlayerInfos = await this.internalLeaveRoom(player);

        if (this.roomInfo.playerList.length <= 0) {
            //房间没人了
            if (!this.roomInfo.retainEmptyRoomTime) {
                //没设置保留空房间,则直接解散
                await this.internalDismissRoom();
            }
        } else {
            //还有人，才需要触发事件
            leavePlayerInfos.forEach(async playerInfo => {
                await this.triggerPlayerLeaveRoomNotify(playerInfo);
            });
        }

        return Result.buildSucc(null);
    }

    /**
     * 房主将玩家踢出房间
     * @param player
     */
    public async kickPlayer(player: IPlayer): Promise<IResult<null>> {
        //通知玩家被踢出房间
        await this.triggerKickedOutRoomNotify(player.playerInfo);

        return Result.buildSucc(null);
    }

    /**
     * 解散房间
     *
     * @public
     * @param player 当前玩家,如果是定时解散等没有当前玩家时,可以不传
     * @returns
     */
    public async dismissRoom(player?: IPlayer): Promise<IResult<IRoomInfo>> {
        if (player && this.roomInfo.ownerPlayerId !== player.playerInfo.playerId) {
            return Result.buildErr('只有房主才可以解散房间！', ErrorCodes.RoomPermissionDenied);
        }

        //拷贝一份原有的玩家信息列表(排除自己)，用于做事件通知
        let notifyPlayerInfos = player ?
            this.roomInfo.playerList.filter(p => p.playerId !== player.playerInfo.playerId)
            : [...this.roomInfo.playerList];

        //执行实际的解散逻辑（数据操作）
        await this.internalDismissRoom();

        //触发事件(不等待)
        this.triggerDismissRoomNotify(notifyPlayerInfos);

        return Result.buildSucc(this.roomInfo);
    }


    /**
     * 房主修改房间属性
     *
     * @public
     * @param player 当前玩家
     * @returns
     */
    public async changeRoom(player: IPlayer, changePara: IChangeRoomPara): Promise<IResult<IRoomInfo>> {
        if (this.roomInfo.ownerPlayerId !== player.playerInfo.playerId) {
            return Result.buildErr('只有房主才可以修改房间信息！');
        }

        let changed = false;
        let regChange = false;
        if (changePara.roomName) {
            this.roomInfo.roomName = changePara.roomName;
            this.roomRegInfo.roomName = changePara.roomName;
            changed = true;
        }
        if (typeof (changePara.isPrivate) !== 'undefined') {
            this.roomInfo.isPrivate = changePara.isPrivate;
            this.roomRegInfo.isPrivate = this.roomInfo.isPrivate ? 1 : 0;
            changed = true;
            regChange = true;
        }
        if (typeof (changePara.privateRoomJoinMode) !== 'undefined') {
            this.roomInfo.privateRoomJoinMode = changePara.privateRoomJoinMode;
            this.roomRegInfo.privateRoomJoinMode = changePara.privateRoomJoinMode;
            changed = true;
            regChange = true;
        }
        if (typeof (changePara.privateRoomPassword) !== 'undefined') {
            this.roomRegInfo.privateRoomPassword = changePara.privateRoomPassword;
            changed = true;
            regChange = true;
        }
        if (typeof (changePara.customProperties) !== 'undefined') {
            this.roomInfo.customProperties = changePara.customProperties;
            changed = true;
        }
        if (changed) {
            if (regChange) {
                await Promise.all([
                    this.gameClusterClient.updateRoom(
                        this.roomRegInfo,
                        ERoomRegChangedType.ChangeInfo
                    ),
                ]);
            }
            //触发事件
            this.triggerChangeRoomNotify();
        }

        return Result.buildSucc(this.roomInfo);
    }
    /**
     *玩家修改自己的自定义状态
     *
     * @param player
     * @param newCustomPlayerStatus
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns
     */
    public async changeCustomPlayerStatus(player: IPlayer, newCustomPlayerStatus: number, robotPlayerId?: string): Promise<IResult<IPlayerInfo>> {
        let playerId: string;
        if (robotPlayerId) {
            if (!player.roomRobotPlayers.has(robotPlayerId)) {
                return Result.buildErr('非可操作玩家!', ErrorCodes.Exception);
            }
            playerId = robotPlayerId;
        } else {
            playerId = player.playerInfo.playerId;
        }
        return await this.intenalChangeCustomPlayerStatus(playerId, newCustomPlayerStatus);
    }
    /**
     *玩家修改自己的自定义属性
     *
     * @param player
     * @param newCustomPlayerProfile
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns
     */
    public async changeCustomPlayerProfile(player: IPlayer, newCustomPlayerProfile: string, robotPlayerId?: string): Promise<IResult<IPlayerInfo>> {
        let playerId: string;
        if (robotPlayerId) {
            if (!player.roomRobotPlayers.has(robotPlayerId)) {
                return Result.buildErr('非可操作玩家!', ErrorCodes.Exception);
            }
            playerId = robotPlayerId;
        } else {
            playerId = player.playerInfo.playerId;
        }
        return await this.intenalChangeCustomPlayerProfile(playerId, newCustomPlayerProfile);
    }
    /**
     *玩家修改自己所在队伍
     *
     * @param player
     * @param newTeamId
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns
     */
    public async changePlayerTeam(player: IPlayer, newTeamId?: string, robotPlayerId?: string): Promise<IResult<IRoomInfo>> {
        let playerInfo: IPlayerInfo | undefined;
        if (robotPlayerId) {
            playerInfo = player.roomRobotPlayers.get(robotPlayerId);
            if (!playerInfo) {
                return Result.buildErr('非可操作玩家!', ErrorCodes.Exception);
            }
        } else {
            playerInfo = player.playerInfo;
        }

        let ret = await this.internalChangePlayerTeam(playerInfo, newTeamId);
        if (!ret.succ) return Result.buildErr(ret.err, ret.code);
        return Result.buildSucc(this.roomInfo);
    }


    /**
     * 开始游戏帧同步
     *
     * @public
     */
    public async startGameFrameSync(player: IPlayer): Promise<void> {
        this.roomInfo.startGameTime = Date.now();
        this.roomInfo.frameSyncState = EFrameSyncState.START;
        //await等通知消息都发了,再启动游戏的帧同步
        await this.triggerStartFrameSyncNotify(player.playerInfo);
        this.game.startGame();

        //根据当前房间情况去自动开启或关闭招人匹配
        await this.autoSetRoomJoinUsMatch();
    }

    /**
     * 停止游戏帧同步
     *
     * @public
     */
    public async stopGameFrameSync(player: IPlayer): Promise<void> {
        this.game.stopGame();
        this.roomInfo.frameSyncState = EFrameSyncState.STOP;
        await this.triggerStopFrameSyncNotify(player.playerInfo);

        //根据当前房间情况去自动开启或关闭招人匹配
        await this.autoSetRoomJoinUsMatch();
    }

    /**
     * 玩家输入帧
     * @param player
     * @param inpFrameType
     * @param [setOthersProp]
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns
     */
    public playerInpFrame(player: IPlayer, inpFrameType: EPlayerInputFrameType,
        setOthersProp?: (inpFrame: IFramePlayerInput) => void, robotPlayerId?: string) {
        let playerInfo: IPlayerInfo | undefined;
        if (robotPlayerId) {
            playerInfo = player.roomRobotPlayers.get(robotPlayerId);
            if (!playerInfo) {
                return Result.buildErr('非可操作玩家!', ErrorCodes.Exception);
            }
        } else {
            playerInfo = player.playerInfo;
        }
        return this.game.playerInpFrame(playerInfo, inpFrameType, setOthersProp);
    }


    /**
     * 发起房间所有玩家匹配请求
     * 请求成功即返回,同时房间中的所有玩家会收到通知
     * 匹配有结果了还会收到消息通知, 并且可由一个玩家调用QueryMatch等待完整匹配结果
     *
     * @public
     * @param player
     * @param matchParams
     * @returns
     */
    public async requestMatch(player: IPlayer, matchParams: IMatchParamsFromRoomAllPlayer)
        : Promise<IResult<string>> {
        if (this.roomInfo.allPlayerMatchReqId) {
            return Result.buildErr('当前在匹配中!要重新请求必须先取消!', ErrorCodes.MatchRequestCancelled);
        }
        //TODO: 发起后又加入玩家怎么算? 还是改成房间发起请求后是否停止加人? 如果停止加人是否设置一个停止原因?用于有人加入时返回消息

        if (!matchParams.matchFromInfo) matchParams.matchFromInfo = {};
        let matchReq = matchParams as IMatchRequest;
        let matchFromInfo = matchReq.matchFromInfo as IMatchFromRoomAllPlayersOnServer;
        //这里需要把当前房间中所有玩家id更新进去,对于服务器来说是多玩家匹配
        matchFromInfo.playerIds = this.roomInfo.playerList.map(p => p.playerId);

        this.onRoomAllPlayersMatchResult = async (matchResult) => {
            this.onRoomAllPlayersMatchResult = undefined;
            this.roomInfo.allPlayerMatchReqId = undefined;
            if (matchResult.succ) {
                //匹配结果是成功的,需要通知单独通知每个玩家自己的结果
                let notifyTasks: Promise<any>[] = [];
                for (let playerResult of matchResult.data.matchPlayerResults) {
                    let conn = this.gameConnMgr.getPlayerConn(playerResult.playerId);
                    if (!conn) continue;
                    let playerMatchResult: IMatchPlayerResultWithServer = {
                        gameServerUrl: matchResult.data.gameServerUrl,
                        roomId: matchResult.data.roomId,
                        teamId: playerResult.teamId,
                    };
                    notifyTasks.push(conn.sendMsg('NotifyRoomAllPlayersMatchResult', {
                        roomInfo: this.roomInfo,
                        matchResult: playerMatchResult,
                    }));
                }
                await Promise.all(notifyTasks);
            } else {
                //匹配失败的,则结果一样,直接广播
                await this.gameWsServer.broadcastMsg('NotifyRoomAllPlayersMatchResult', {
                    roomInfo: this.roomInfo,
                    errMsg: matchResult.err,
                    errCode: matchResult.code,
                }, this.onlinePlayerConns.connections);
            }
            this.onRoomAllPlayersMatchResultOther?.call(this, matchResult);
        };
        let reqRet = await this.matchReqTerminal.requestMatch(player.authInfo.appId, matchReq,
            async (matchResult) => {
                //匹配结果返回了(成功或失败)
                this.onRoomAllPlayersMatchResult?.call(this, matchResult);
            }
        );
        if (!reqRet.succ) {
            //请求匹配失败了,直接返回失败
            return reqRet;
        }

        this.roomInfo.allPlayerMatchReqId = reqRet.data;

        //匹配请求正常发起了,通知相关玩家
        await this.gameWsServer.broadcastMsg('NotifyRoomAllPlayersMatchStart', {
            roomInfo: this.roomInfo,
            matchReqId: reqRet.data,
            matchParams: matchParams,
            reqPlayerId: player.playerInfo.playerId,
        }, this.onlinePlayerConns.connections);

        return reqRet;
    }

    /**
     * 取消匹配请求
     * 如果提交成功, 将会由匹配服务器根据请求顺序来决定是否成功取消
     * 如果成功取消,则会触发匹配结果(通知+queryMatch),结果为"请求被取消"[code=ErrorCodes.MatchRequestCancelled]
     * 如果没取消成功,说明在取消之前,匹配服务器已经匹配完成,通知过来并发了,所以紧接着会收到成功的匹配结果(通知+queryMatch)
     *
     * @param player
     * @returns
     */
    public async cancelMatch(player: IPlayer): Promise<IResult<null>> {
        if (!this.roomInfo.allPlayerMatchReqId) {
            return Result.buildErr('当前房间未发起匹配!', ErrorCodes.MatchRequestCancelled);
        }

        let reqRet = await this.matchReqTerminal
            .cancelMatch(player.authInfo.appId, this.roomInfo.allPlayerMatchReqId, player.playerInfo.playerId);

        return Result.transition(reqRet, () => null);
    }

    /**
     * 查询匹配结果, 会等到有结果了才返回!
     * 注意: 同时只能只有一个玩家进行查询等待,一般使用通知来获取结果即可
     *
     * @param player
     * @returns
     */
    public async queryMatch(player: IPlayer): Promise<IResult<IMatchResult>> {
        if (!this.roomInfo.allPlayerMatchReqId) {
            return Result.buildErr('当前房间没发起匹配!', ErrorCodes.MatchRequestCancelled);
        }
        if (this.onRoomAllPlayersMatchResultOther) {
            return Result.buildErr('同时只能一个玩家等待完整匹配结果!', ErrorCodes.MatchRequestCancelled);
        }
        let queryTask = new Promise<IResult<IMatchResult>>(async (resolve) => {
            let timeout = setTimeout(() => {
                //防止之后各种意外导致都没触发,这里保底
                this.onRoomAllPlayersMatchResult?.call(this, Result.buildErr('查询超时!', ErrorCodes.MatchQueryTimeout));
            }, 70000);
            this.onRoomAllPlayersMatchResultOther = (matchResult) => {
                //防止重复触发,置空
                this.onRoomAllPlayersMatchResultOther = undefined;
                clearTimeout(timeout);
                resolve(matchResult);
            };
            let resultRet = await this.matchReqTerminal
                .queryMatch(player.authInfo.appId, this.roomInfo.allPlayerMatchReqId!);
            if (resultRet) {
                //既然直接查询出结果,那么直接触发吧
                this.onRoomAllPlayersMatchResult?.call(this, resultRet);
            }
        });
        let queryRet = await queryTask;
        return queryRet;
    }


    /**
     * 玩家创建房间机器人(退出房间会同步退出)
     * @param player
     * @param createPa
     * @param [teamId]
     * @returns room robot
     */
    public async createRoomRobot(player: IPlayer, createPa: IPlayerInfoPara, teamId?: string): Promise<IResult<IPlayerInfo>> {

        let robotInfo: IPlayerInfo = {
            playerId: buildPlayerRobotId(player.playerInfo.playerId),
            showName: createPa.showName ?? `${player.authInfo.showName}R${player.roomRobotPlayers.size}`,
            customPlayerStatus: createPa.customPlayerStatus ?? 0,
            customPlayerProfile: createPa.customPlayerProfile ?? '',
            isRobot: true,
            networkState: ENetworkState.ONLINE,
        };

        const ret = await this.internalJoinRoom(robotInfo, { roomId: this.roomInfo.roomId, teamId }, player.playerInfo);
        //加入失败,直接返回
        if (!ret.succ) return Result.buildErr(ret);

        //机器人加入到玩家连接的房间机器人里
        player.roomRobotPlayers.set(robotInfo.playerId, robotInfo);

        return Result.buildSucc(robotInfo);
    }

    /**
     * 玩家的指定房间机器人退出房间(即销毁)
     * @param player
     * @param robotPlayerId
     * @returns
     */
    public async roomRobotLeave(player: IPlayer, robotPlayerId: string): Promise<IResult<IPlayerInfo>> {
        const robotInfo = player.roomRobotPlayers.get(robotPlayerId);
        if (!robotInfo) return Result.buildErr('非可操作机器人!', ErrorCodes.Exception);
        const teamId = robotInfo.teamId;
        this.internalLeaveRoomData(robotInfo);

        //移掉这个机器人
        let tmpIds = new Set([...player.playerInfo.roomRobotIds ?? []]);
        tmpIds.delete(robotPlayerId);
        player.playerInfo.roomRobotIds = Array.from(tmpIds);

        //通知玩家退出
        await this.triggerPlayerLeaveRoomNotify(robotInfo);

        //更新房间注册信息
        this.roomRegInfo.teamsPlayerIds = this.buildTeamsPlayerIds(this.roomInfo.playerList);
        this.roomRegInfo.emptySeats = RoomHelper.getRoomEmptySeats(this.roomInfo);
        await Promise.all([
            this.gameClusterClient.updateRoom(
                this.roomRegInfo,
                ERoomRegChangedType.PlayerJoinRoom,
                robotPlayerId,
                teamId,
            ),
            //根据当前房间情况去自动开启或关闭招人匹配
            this.autoSetRoomJoinUsMatch(),
        ]);

        return Result.buildSucc(robotInfo);
    }
}