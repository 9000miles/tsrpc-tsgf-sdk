
import '../../../src/env'

import { assert } from "chai";
import { GameClient } from "../../../src/shared/gameClient/GameClient";
import { HallClient } from "../../../src/shared/hallClient/HallClient";
import { ResAuthorize } from "../../../src/shared/hallClient/protocols/PtlAuthorize";
import { ApiCryptoHelper } from "../../../src/shared/tsgfServer/apiCrypto/ApiCryptoHelper";
import { EMatchFromType, ISingleMatcherParams, IMatchResult, MatcherKeys } from "../../../src/shared/tsgf/match/Models";
import { IResult, Result } from '../../../src/shared/tsgf/Result';
import { ICreateRoomPara, IRoomOnlineInfo } from '../../../src/shared/tsgf/room/IRoomInfo';
import { ResAppDismissRoom } from '../../../src/shared/hallClient/protocols/PtlAppDismissRoom';

let enabledLog = true;
export function setLogEnabled(enabled:boolean) {
    enabledLog = enabled;
}
export function createHallClient(hallServerUrl: string): HallClient {
    let c = new HallClient(hallServerUrl, 90000000);
    if (!enabledLog) {
        c.client.logger!.log = () => { };
    }
    return c;
}
export function createGameClient(playerToken: string, serverUrl: string, roomWaitReconnectTime?: number): GameClient {
    let gameClient = new GameClient(serverUrl, playerToken, 90000000, roomWaitReconnectTime);
    if (!enabledLog) {
        gameClient.client.logger!.log = () => { };
    }
    return gameClient;
}

export const hallClient = createHallClient('http://127.0.0.1:7100');

export type TestData = {
    playerToken1: string,
    playerId1: string,
    playerToken2: string,
    playerId2: string,
    playerToken3: string,
    playerId3: string,
    playerToken4: string,
    playerId4: string,
    playerToken5: string,
    playerId5: string,
    gameClient1: GameClient,
    gameClient2: GameClient,
    gameClient3: GameClient,
    gameClient4: GameClient,
    gameClient5: GameClient,
};

export function testEachBuild(maxPlayerCount: number): TestData {
    //@ts-ignore
    let data: TestData = {};

    beforeEach(async () => {
        let auth1Task = maxPlayerCount < 1 ? null : authPlayerToken("zum0001_ApiCreateRoomAndJoin_MaxPlayers2", "zum1");
        let auth2Task = maxPlayerCount < 2 ? null : authPlayerToken("zum0002_ApiCreateRoomAndJoin_MaxPlayers2", "zum2");
        let auth3Task = maxPlayerCount < 3 ? null : authPlayerToken("zum0003_ApiCreateRoomAndJoin_MaxPlayers2", "zum3");
        let auth4Task = maxPlayerCount < 4 ? null : authPlayerToken("zum0004_ApiCreateRoomAndJoin_MaxPlayers2", "zum4");
        let auth5Task = maxPlayerCount < 5 ? null : authPlayerToken("zum0005_ApiCreateRoomAndJoin_MaxPlayers2", "zum5");
        let auth1 = maxPlayerCount < 1 ? null : await auth1Task;
        let auth2 = maxPlayerCount < 2 ? null : await auth2Task;
        let auth3 = maxPlayerCount < 3 ? null : await auth3Task;
        let auth4 = maxPlayerCount < 4 ? null : await auth4Task;
        let auth5 = maxPlayerCount < 5 ? null : await auth5Task;

        if (auth1) data.playerToken1 = auth1.playerToken;
        if (auth1) data.playerId1 = auth1.playerId;
        if (auth2) data.playerToken2 = auth2.playerToken;
        if (auth2) data.playerId2 = auth2.playerId;
        if (auth3) data.playerToken3 = auth3.playerToken;
        if (auth3) data.playerId3 = auth3.playerId;
        if (auth4) data.playerToken4 = auth4.playerToken;
        if (auth4) data.playerId4 = auth4.playerId;
        if (auth5) data.playerToken5 = auth5.playerToken;
        if (auth5) data.playerId5 = auth5.playerId;
    });

    afterEach(async () => {
        await Promise.all([
            data.gameClient1?.disconnect(),
            data.gameClient2?.disconnect(),
            data.gameClient3?.disconnect(),
            data.gameClient4?.disconnect(),
            data.gameClient5?.disconnect(),
        ]);
    });
    return data;
}

/**模拟服务端获取玩家的token*/
export async function authPlayerToken(openId: string, showName: string): Promise<ResAuthorize> {
    return await authPlayerTokenByHallClient(hallClient, openId, showName);
}
export async function authPlayerTokenByHallClient(hallClient:HallClient,openId: string, showName: string): Promise<ResAuthorize> {
    let req1 = ApiCryptoHelper.appCryptoEncrypt("default", "FDGWPRET345-809RGKFER43SKGF", {
        openId: openId,
        showName: showName,
        authTokenDay: 1,
    });
    const ret1 = await hallClient.client.callApi("Authorize", req1);
    assert.ok(ret1.isSucc, ret1.err?.message);
    assert.ok(ret1.res, 'res为空');
    return ret1.res!;
}
/**模拟服务端调用大厅强制解散房间*/
export async function appDismissRoom(roomId: string): Promise<IResult<ResAppDismissRoom>> {
    let req1 = ApiCryptoHelper.appCryptoEncrypt("default", "FDGWPRET345-809RGKFER43SKGF", {
        roomId,
    });
    const ret1 = await hallClient.client.callApi("AppDismissRoom", req1);
    if (!ret1.isSucc) return Result.buildErr(ret1.err?.message || '失败', (ret1.err.code as number) || 1);
    return Result.buildSucc(ret1.res);
}

export async function requestMatchOneSingle(playerToken: string, playerId: string,
    maxPlayers: number = 8, minPlayers: number = 3): Promise<string> {
    let retM1 = await hallClient.requestMatch(playerToken, {
        matchFromType: EMatchFromType.Player,
        matchFromInfo: {
            playerIds: [playerId],
        },
        maxPlayers: maxPlayers,
        matcherKey: MatcherKeys.Single,
        matcherParams: {
            minPlayers: minPlayers,
            resultsContinueRoomJoinUsMatch: true,
        } as ISingleMatcherParams,
    });
    assert.ok(retM1.succ, retM1.err);
    let matchReqId = retM1.data!;
    return matchReqId;
}
export async function cancelMatch(playerToken: string, matchReqId: string): Promise<void> {
    let retM1 = await hallClient.cancelMatch(playerToken, matchReqId);
    assert.ok(retM1.succ, retM1.err);
}

/**查询匹配结果,要求自行延时,里面断言一定会获取到结果!*/
export async function queryMatch(playerToken: string, matchReqId: string): Promise<IMatchResult> {
    let retM1 = await hallClient.queryMatch(playerToken, matchReqId);
    assert.ok(!!retM1, "结果应该要出了,但没出！");
    assert.ok(retM1?.succ === true, retM1?.err);
    return retM1!.data!;
}

export async function authToGameServer(playerShowName: string, playerToken: string, gameServerUrl: string, roomWaitReconnectTime?: number): Promise<GameClient> {
    let gameClient1 = createGameClient(playerToken, gameServerUrl, roomWaitReconnectTime);
    let gameRet = await gameClient1.authorize({ showName: playerShowName });
    assert.ok(gameRet.succ, gameRet.err);
    gameClient1.onRecvRoomMsg = (msg) => {
        //console.log(`${playerShowName}: 收到【${msg.fromPlayerInfo.showName}】房间消息[${msg.recvType}]：${msg.msg}`);
    };
    gameClient1.onPlayerJoinRoom = (playerInfo, roomInfo) => {
        //console.log(`${playerShowName}: 有玩家进入房间：${playerInfo.showName}`);
    };
    gameClient1.onPlayerLeaveRoom = (playerInfo, roomInfo) => {
        //console.log(`${playerShowName}: 有玩家退出房间：${playerInfo.showName}`);
    };
    gameClient1.onDismissRoom = (roomInfo) => {
        //console.log(`${playerShowName}: 房间被解散`);
    };
    return gameClient1;
}
export async function authToGameServerResult(playerShowName: string, playerToken: string, gameServerUrl: string, roomWaitReconnectTime?: number): Promise<IResult<GameClient>> {
    let gameClient1 = createGameClient(playerToken, gameServerUrl, roomWaitReconnectTime);
    let gameRet = await gameClient1.authorize({ showName: playerShowName });
    if (!gameRet.succ) return Result.transition(gameRet);
    gameClient1.onRecvRoomMsg = (msg) => {
        //console.log(`${playerShowName}: 收到【${msg.fromPlayerInfo.showName}】房间消息[${msg.recvType}]：${msg.msg}`);
    };
    gameClient1.onPlayerJoinRoom = (playerInfo, roomInfo) => {
        //console.log(`${playerShowName}: 有玩家进入房间：${playerInfo.showName}`);
    };
    gameClient1.onPlayerLeaveRoom = (playerInfo, roomInfo) => {
        //console.log(`${playerShowName}: 有玩家退出房间：${playerInfo.showName}`);
    };
    gameClient1.onDismissRoom = (roomInfo) => {
        //console.log(`${playerShowName}: 房间被解散`);
    };
    return Result.buildSucc(gameClient1);
}

export interface ICreateAndEnterResult {
    gameClient: GameClient;
    roomId: string;
    gameServerUrl: string;
    roomOnlineInfo: IRoomOnlineInfo;
}
export async function createAndEnterRoom(playerToken: string, playerId: string, playerShowName: string, createRoomPara?: Partial<ICreateRoomPara>, teamId?: string, roomWaitReconnectTime?: number): Promise<IResult<ICreateAndEnterResult>> {
    if (!createRoomPara) createRoomPara = {};
    if (!createRoomPara.roomName) createRoomPara.roomName = '测试的房间';
    if (!createRoomPara.maxPlayers) createRoomPara.maxPlayers = 4;
    if (!createRoomPara.ownerPlayerId) createRoomPara.ownerPlayerId = playerId;
    if (createRoomPara.isPrivate === undefined) createRoomPara.isPrivate = false;

    let createRet = await hallClient.createRoom(playerToken, createRoomPara as ICreateRoomPara);
    if (!createRet.succ) return Result.transition(createRet);
    let roomOnlineInfo = createRet.data!;

    //连接游戏服务器
    let gameClient = await authToGameServer(playerShowName, playerToken, roomOnlineInfo.gameServerUrl!, roomWaitReconnectTime);
    //加入自己创建的房间
    let joinRet = await gameClient.joinRoom({ roomId: roomOnlineInfo.roomId, teamId });
    if (!joinRet.succ) return Result.transition(joinRet);

    return Result.buildSucc({
        gameClient: gameClient,
        roomId: roomOnlineInfo.roomId,
        gameServerUrl: roomOnlineInfo.gameServerUrl!,
        roomOnlineInfo,
    });
}

/**根据房间ID认证进入游戏服务器,返回游戏客户端(并未加入房间)*/
export async function authToGameServerByRoomId(playerToken: string, roomId: string, playerShowName: string, roomWaitReconnectTime?: number): Promise<GameClient> {
    let regRet = await hallClient.getRoomOnlineInfo(playerToken, roomId);
    assert.ok(regRet.succ, regRet.err);
    let gameClient = await authToGameServer(playerShowName, playerToken, regRet.data!.gameServerUrl!, roomWaitReconnectTime);
    return gameClient;
}
/**直接加入房间,要求成功!*/
export async function joinRoom(playerToken: string, roomId: string, playerShowName: string, teamId?: string): Promise<GameClient> {
    let gameClient = await authToGameServerByRoomId(playerToken, roomId, playerShowName);
    let joinRet = await gameClient.joinRoom({ roomId, teamId });
    assert.ok(joinRet.succ, joinRet.err);
    return gameClient;
}
/**直接加入房间*/
export async function joinRoomResult(playerToken: string, roomId: string, playerShowName: string, teamId?: string): Promise<IResult<GameClient>> {
    let gameClient = await authToGameServerByRoomId(playerToken, roomId, playerShowName);
    let joinRet = await gameClient.joinRoom({ roomId, teamId });
    if (!joinRet.succ) return Result.transition(joinRet);
    return Result.buildSucc(gameClient);
}
/**根据指定的游戏服务器.连接并加入房间*/
export async function joinRoomUseGameServer(gameServerUrl: string, playerToken: string, roomId: string, playerShowName: string, roomWaitReconnectTime?: number): Promise<GameClient> {
    let gameClient = await authToGameServer(playerShowName, playerToken, gameServerUrl, roomWaitReconnectTime);
    let joinRet = await gameClient.joinRoom({ roomId });
    assert.ok(joinRet.succ, joinRet.err);
    return gameClient;
}
/**根据指定的游戏服务器.连接并加入房间*/
export async function joinRoomUseGameServerResult(gameServerUrl: string, playerToken: string, roomId: string, playerShowName: string, roomWaitReconnectTime?: number): Promise<IResult<GameClient>> {
    let gameClientRet = await authToGameServerResult(playerShowName, playerToken, gameServerUrl, roomWaitReconnectTime);
    if (!gameClientRet.succ) return Result.transition(gameClientRet);
    let gameClient = gameClientRet.data!;
    let joinRet = await gameClient.joinRoom({ roomId });
    if (!joinRet.succ) return Result.transition(joinRet);
    return Result.buildSucc(gameClient);
}