import { assert } from "chai";
import { ErrorCodes } from "../../../src/shared/tsgf/Result";
import { delay } from "../../../src/shared/tsgf/Utils";
import { authPlayerToken, authToGameServer, createAndEnterRoom, hallClient, appDismissRoom, testEachBuild } from "./ApiUtils";

describe("大厅服务端接口", () => {

    let testData = testEachBuild(5);


    test('玩家服务端认证', async function () {
        //==========这里模拟服务端获取playerToken (openid需要按单元测试名区分一下,防止多个单元测试并行时token互踢)
        await authPlayerToken("zum0001_ApiAuthorize", "zum1");
    })
    test('服务端解散房间', async function () {
        //创建单人房间
        let gameClient1Ret = await createAndEnterRoom(testData.playerToken1, testData.playerId1, 'zum1', {
            maxPlayers: 2,
            isPrivate: true,
        });
        assert.ok(gameClient1Ret.succ, gameClient1Ret.err);
        testData.gameClient1 = gameClient1Ret.data!.gameClient;
        let roomId = gameClient1Ret.data!.roomId;
        let gameServerUrl = gameClient1Ret.data!.gameServerUrl

        // 玩家2加入
        testData.gameClient2 = await authToGameServer('zum2', testData.playerToken2, gameServerUrl);
        let joinRet = await testData.gameClient2.joinRoom({ roomId });
        assert.ok(joinRet.succ, joinRet.err);

        let onDismissRoom = 0;
        testData.gameClient1.onDismissRoom = () => {
            onDismissRoom++;
        };
        testData.gameClient2.onDismissRoom = () => {
            onDismissRoom++;
        };

        let dismissRoomRet = await appDismissRoom(roomId);
        assert.ok(dismissRoomRet.succ, dismissRoomRet.err);

        await delay(500);

        let regRet = await hallClient.getRoomOnlineInfo(testData.playerToken1, roomId);
        assert.ok(!regRet.succ && regRet.code === ErrorCodes.RoomNotFound, '房间应该被解散了!' + JSON.stringify(regRet));
        assert.ok(onDismissRoom === 2, `应该收到2条解散房间的消息,但实际${onDismissRoom}条`);

    });
});