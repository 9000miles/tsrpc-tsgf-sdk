
import { delay } from "../../../src/shared/tsgf/Utils";
import { assert } from 'chai';
import { authPlayerToken, createAndEnterRoom, hallClient, joinRoom, testEachBuild } from "./ApiUtils";
import { ENetworkState } from "../../../src/shared/tsgf/player/IPlayerInfo";
import { GameClient } from "../../../src/shared/gameClient/GameClient";
import { ErrorCodes } from "../../../src/shared/tsgf/Result";

describe("断线重连", () => {

    let testData = testEachBuild(5);

    test('断线重连同时测试网络事件', async function () {

        let msgCount = 0;

        //玩家1创建房间并进入游戏服务器
        let gameClient1Ret = await createAndEnterRoom(testData.playerToken1, testData.playerId1, 'zum1');
        assert.ok(gameClient1Ret.succ, gameClient1Ret.err);
        testData.gameClient1 = gameClient1Ret.data!.gameClient;
        let roomId = gameClient1Ret.data!.roomId;
        testData.gameClient2 = await joinRoom(testData.playerToken2, roomId, 'zum2');
        testData.gameClient3 = await joinRoom(testData.playerToken3, roomId, 'zum3');


        msgCount = 0;
        testData.gameClient1.onChangePlayerNetworkState = (p) => {
            msgCount--;
            console.error(`不应该收到自己的网络事件`);
        };
        testData.gameClient2.onChangePlayerNetworkState = (p) => {
            if (p.playerId === testData.playerId1 && p.networkState === ENetworkState.OFFLINE) {
                msgCount++;
            } else {
                console.error(`这个时候应该收到玩家1【${testData.playerId1}】的变更通知,但实际收到的是:${JSON.stringify(p)}`);
            }
        };
        testData.gameClient3.onChangePlayerNetworkState = (p) => {
            if (p.playerId === testData.playerId1 && p.networkState === ENetworkState.OFFLINE) {
                msgCount++;
            } else {
                console.error(`这个时候应该收到玩家1【${testData.playerId1}】的变更通知,但实际收到的是:${JSON.stringify(p)}`);
            }
        };

        let oldToken = testData.gameClient1.playerToken;
        let oldPid = testData.gameClient1.playerId;
        await testData.gameClient1.client.disconnect();

        await delay(200);
        assert.ok(msgCount === 2, '剩下2个人都应该收到网络变更通知, 实际只为' + msgCount);

        msgCount = 0;
        testData.gameClient1.onChangePlayerNetworkState = (p) => {
            msgCount++;
            assert.fail('不应该收到自己的网络事件');
        };
        testData.gameClient2.onChangePlayerNetworkState = (p) => {
            msgCount++;
        };
        testData.gameClient3.onChangePlayerNetworkState = (p) => {
            msgCount++;
        };

        //@ts-ignore
        testData.gameClient1._playerToken = oldToken;
        //@ts-ignore
        testData.gameClient1._playerId = oldPid;
        let recRet = await testData.gameClient1.reconnect();
        assert.ok(recRet.succ, '重连失败!:' + recRet.err);

        await delay(200);
        assert.ok(msgCount === 2, '剩下2个人都应该收到网络变更通知, 实际只为' + msgCount);

        //await delay(5000);//临时延迟5秒，方便我查看一下redis

        oldPid = testData.gameClient1.playerId;
        oldToken = testData.gameClient1.playerToken;
        await testData.gameClient1.client.disconnect();
        await delay(200);

        let onJoinCount = 0;
        testData.gameClient1.onPlayerJoinRoom = (p) => {
            onJoinCount++;
        };
        testData.gameClient2.onPlayerJoinRoom = (p) => {
            onJoinCount++;
        };
        testData.gameClient3.onPlayerJoinRoom = (p) => {
            onJoinCount++;
        };
        msgCount = 0;
        let roomIdRet = await hallClient.recoverPlayerRoom(oldPid, oldToken, '全新的名字');
        assert.ok(roomIdRet.succ, '恢复失败!' + roomIdRet.err);

        //开始游戏服务器的重连操作
        testData.gameClient1 = new GameClient(roomIdRet.data!.gameServerUrl!, oldToken);
        let reconnectRet = await testData.gameClient1.reconnect();
        assert.ok(reconnectRet.succ, '恢复失败!' + reconnectRet.err);

        await delay(200);
        assert.ok(onJoinCount === 0, '应该有0个玩家收到玩家加入通知, 实际为' + onJoinCount);
        assert.ok(msgCount === 2, '剩下2个人都应该收到网络变更通知, 实际为' + msgCount);


    }, 60 * 1000);


    test('断线超时重连测试是否房间自动解散', async function () {
        //玩家1创建房间并进入游戏服务器
        let gameClient1Ret = await createAndEnterRoom(testData.playerToken1, testData.playerId1, 'zum1', {}, undefined, 0);
        assert.ok(gameClient1Ret.succ, gameClient1Ret.err);
        testData.gameClient1 = gameClient1Ret.data!.gameClient;

        let oldToken = testData.gameClient1.playerToken;
        let oldPid = testData.gameClient1.playerId;
        await testData.gameClient1.client.disconnect();

        await delay(200);

        //@ts-ignore
        testData.gameClient1._playerToken = oldToken;
        //@ts-ignore
        testData.gameClient1._playerId = oldPid;
        let recRet = await testData.gameClient1.reconnect();
        assert.ok(!recRet.succ && recRet.code === ErrorCodes.AuthReconnectionFail,
            '重连应该失败!' + JSON.stringify(recRet));

        // 接着尝试恢复房间数据, token是成功的, 但当前房间id应该为空
        let roomIdRet = await hallClient.recoverPlayerRoom(oldPid, oldToken, '全新的名字');
        assert.ok(roomIdRet.succ && !roomIdRet.data, '这里应该恢复成功,但没有房间id!' + roomIdRet.err);


    }, 60 * 1000)


});