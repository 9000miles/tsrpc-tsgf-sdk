import { assert } from "chai";
import { ErrorCodes } from "../../../src/shared/tsgf/Result";
import { delay } from "../../../src/shared/tsgf/Utils";
import { authPlayerToken, authToGameServer, createAndEnterRoom, hallClient, appDismissRoom, testEachBuild, createHallClient, authPlayerTokenByHallClient, TestData } from "./ApiUtils";

describe("Traefik", () => {
    test('empty', async function () { });
    return;// 防止被批量执行这里return, 需要单独跑的时候再启用
    // 需要启动 npm run runAllInOne + traefik服务 + hosts解析本地 作为单元测试环境

    test('简单走一下基本接口', async function () {
        const hallClient = createHallClient('http://tsgf-hall.iclouden.com');
        let authRet = await authPlayerTokenByHallClient(hallClient, 'zum1', 'zum1');
    
        // @ts-ignore
        let testData: TestData = {
            playerId1: authRet.playerId,
            playerToken1: authRet.playerToken,
        };
        //创建单人房间
        let createRet = await hallClient.createRoom(testData.playerToken1, {
            roomName: 'test',
            maxPlayers: 2,
            ownerPlayerId: testData.playerId1,
            isPrivate: true,
        });
        assert.ok(createRet.succ, createRet.err);
        let roomOnlineInfo = createRet.data!;

        //连接游戏服务器
        let gameClient = await authToGameServer('zum1', testData.playerToken1, roomOnlineInfo.gameServerUrl!, 0);
        //加入自己创建的房间
        let joinRet = await gameClient.joinRoom({ roomId: roomOnlineInfo.roomId });
        assert.ok(joinRet.succ, joinRet.err);

        await delay(500);

        let regRet = await hallClient.getRoomOnlineInfo(testData.playerToken1, roomOnlineInfo.roomId);
        assert.ok(regRet.succ, regRet.err);

        await gameClient.disconnect();

    });
});