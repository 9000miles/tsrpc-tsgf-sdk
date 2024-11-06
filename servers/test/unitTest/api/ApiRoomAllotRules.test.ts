import { assert } from "chai";
import { ErrorCodes } from "../../../src/shared/tsgf/Result";
import { createAndEnterRoom, hallClient, appDismissRoom, joinRoom, testEachBuild } from "./ApiUtils";

describe("服务器分配规则验证", () => {
    test('empty', async function () { });
    return;// 防止被批量执行这里return, 需要单独跑的时候再启用
    // 需要启动 npm run devRunLimitOthers + npm run devRunLimitGameServer 作为单元测试环境

    let testData = testEachBuild(5);

    test('单类型房间数限制', async function () {
        let gameClient1Ret = await createAndEnterRoom(testData.playerToken1, testData.playerId1, 'zum1', { roomType: 'Plaza' });
        assert.ok(gameClient1Ret.succ === true, gameClient1Ret.err);
        testData.gameClient1 = gameClient1Ret.data!.gameClient;

        let gameClient2Ret = await createAndEnterRoom(testData.playerToken2, testData.playerId2, 'zum2', { roomType: 'Plaza' });
        assert.ok(gameClient2Ret.succ === false && gameClient2Ret.code === ErrorCodes.RoomNoServerAvailable, '配置 Plaza 只能有一个,第二次创建应该失败!');

        await testData.gameClient1!.dismissRoom();

        gameClient2Ret = await createAndEnterRoom(testData.playerToken2, testData.playerId2, 'zum2', { roomType: 'Plaza' });
        assert.ok(gameClient2Ret.succ === true, gameClient2Ret.err + '上一个 Plaza 房间都解散了,应该成功才对!');
        testData.gameClient2 = gameClient2Ret.data!.gameClient;

        let gameClient3Ret = await createAndEnterRoom(testData.playerToken3, testData.playerId3, 'zum3', { roomType: 'Plaza' });
        assert.ok(gameClient3Ret.succ === false && gameClient3Ret.code === ErrorCodes.RoomNoServerAvailable, '配置 Plaza 只能有一个,第二次创建应该失败!');

    }, 999999999);


    test('类型加最大玩家数10的房间数限制', async function () {
        let gameClient1Ret = await createAndEnterRoom(testData.playerToken1, testData.playerId1, 'zum1', { roomType: 'MeetingRoom', maxPlayers: 10 });
        assert.ok(gameClient1Ret.succ === true, gameClient1Ret.err);
        testData.gameClient1 = gameClient1Ret.data!.gameClient;

        let gameClient2Ret = await createAndEnterRoom(testData.playerToken2, testData.playerId2, 'zum2', { roomType: 'MeetingRoom', maxPlayers: 10 });
        assert.ok(gameClient2Ret.succ === true, gameClient2Ret.err);
        testData.gameClient2 = gameClient2Ret.data!.gameClient;

        let gameClient3Ret = await createAndEnterRoom(testData.playerToken3, testData.playerId3, 'zum3', { roomType: 'MeetingRoom', maxPlayers: 10 });
        assert.ok(gameClient3Ret.succ === false && gameClient3Ret.code === ErrorCodes.RoomNoServerAvailable, '配置 MeetingRoom+10 只能有2个,第3次创建应该失败!');

        //玩家2释放会议室, 后续应该成功
        await testData.gameClient2.dismissRoom();

        gameClient3Ret = await createAndEnterRoom(testData.playerToken3, testData.playerId3, 'zum3', { roomType: 'MeetingRoom', maxPlayers: 10 });
        assert.ok(gameClient3Ret.succ === true, gameClient3Ret.err);
        testData.gameClient3 = gameClient3Ret.data!.gameClient;

    }, 999999999);


    test('获取或创建房间_同类型同时存在个数的限制', async function () {
        //玩家1
        let getOrCreateRet = await hallClient.getOrCreateRoom(testData.playerToken2, {
            createRoomPara: {
                ownerPlayerId: testData.playerId1,
                roomType: 'Hall',
                maxPlayers: 2,
                roomName: '大厅',
                isPrivate: true,
            },
            matchRoomType: true,
        });
        assert.ok(getOrCreateRet.succ, getOrCreateRet.err);
        assert.ok(getOrCreateRet.data?.createRoomOnlineInfo, '应该没匹配到并且创建了一个房间');
        // 玩家1进入自己创建的房间
        testData.gameClient1 = await joinRoom(testData.playerToken1, getOrCreateRet.data!.createRoomOnlineInfo!.roomId, 'zum1');

        //玩家2
        getOrCreateRet = await hallClient.getOrCreateRoom(testData.playerToken2, {
            createRoomPara: {
                ownerPlayerId: testData.playerId2,
                roomType: 'Hall',
                maxPlayers: 2,
                roomName: '大厅',
                isPrivate: true,
            },
            matchRoomType: true,
        });
        assert.ok(getOrCreateRet.succ, getOrCreateRet.err);
        assert.ok(getOrCreateRet.data?.matchRoomOnlineInfoList?.length,
            '应该匹配到房间才对' + JSON.stringify(getOrCreateRet.data));
        // 玩家2进入玩家1创建的房间
        testData.gameClient2 = await joinRoom(testData.playerToken2, getOrCreateRet.data!.matchRoomOnlineInfoList![0].roomId, 'zum2');


        //玩家3
        getOrCreateRet = await hallClient.getOrCreateRoom(testData.playerToken3, {
            createRoomPara: {
                ownerPlayerId: testData.playerId3,
                roomType: 'Hall',
                maxPlayers: 2,
                roomName: '大厅',
                isPrivate: true,
            },
            matchRoomType: true,
        });
        assert.ok(getOrCreateRet.succ, getOrCreateRet.err);
        assert.ok(getOrCreateRet.data?.createRoomOnlineInfo,
            '应该要创建房间,但实际数据是:' + JSON.stringify(getOrCreateRet.data));
        // 玩家3加入自己创建的房间
        testData.gameClient3 = await joinRoom(testData.playerToken3, getOrCreateRet.data!.createRoomOnlineInfo!.roomId, 'zum3');

        //玩家4
        getOrCreateRet = await hallClient.getOrCreateRoom(testData.playerToken4, {
            createRoomPara: {
                ownerPlayerId: testData.playerId4,
                roomType: 'Hall',
                maxPlayers: 2,
                roomName: '大厅',
                isPrivate: true,
            },
            matchRoomType: true,
        });
        assert.ok(getOrCreateRet.succ, getOrCreateRet.err);
        assert.ok(getOrCreateRet.data?.matchRoomOnlineInfoList?.length === 1,
            '应该匹配到了1个房间,但实际数据是:' + JSON.stringify(getOrCreateRet.data?.matchRoomOnlineInfoList));
        assert.ok(getOrCreateRet.data!.matchRoomOnlineInfoList![0].roomId === testData.gameClient3.currRoomInfo?.roomId,
            '应该匹配到玩家3创建的房间, 因为玩家1创建的房间已经满了(玩家1+玩家2)');
        // 玩家4加入玩家3创建的房间
        testData.gameClient4 = await joinRoom(testData.playerToken4, getOrCreateRet.data!.matchRoomOnlineInfoList![0].roomId, 'zum4');

        //玩家5
        getOrCreateRet = await hallClient.getOrCreateRoom(testData.playerToken5, {
            createRoomPara: {
                ownerPlayerId: testData.playerId5,
                roomType: 'Hall',
                maxPlayers: 2,
                roomName: '大厅',
                isPrivate: true,
            },
            matchRoomType: true,
        });
        assert.ok(!getOrCreateRet.succ && getOrCreateRet.code === ErrorCodes.RoomNoServerAvailable,
            '配置了大厅只能有2个房间,应该要满了才对!,实际:'+JSON.stringify(getOrCreateRet));

    }, 999999999);
    

    test('验证创建但不提取是否也算数量', async function () {

        let createRet1 = await hallClient.createRoom(testData.playerToken1, {
            roomType: 'Plaza',
            roomName: 'zum1',
            maxPlayers: 4,
            ownerPlayerId: testData.playerId1,
            isPrivate: true,
        });
        assert.ok(createRet1.succ, createRet1.err);
        
        let createRet2 = await hallClient.createRoom(testData.playerToken2, {
            roomType: 'Plaza',
            roomName: 'zum2',
            maxPlayers: 4,
            ownerPlayerId: testData.playerId2,
            isPrivate: true,
        });
        assert.ok(!createRet2.succ && createRet2.code === ErrorCodes.RoomNoServerAvailable, `配置 Plaza 只能有一个,第二次创建应该失败!${JSON.stringify(createRet2)}`);

        let dismissRet = await appDismissRoom(createRet1.data!.roomId);
        assert.ok(dismissRet.succ, dismissRet.err);

        createRet2 = await hallClient.createRoom(testData.playerToken2, {
            roomType: 'Plaza',
            roomName: 'zum2',
            maxPlayers: 4,
            ownerPlayerId: testData.playerId2,
            isPrivate: true,
        });
        assert.ok(createRet2.succ, createRet2.err);

    }, 999999999);

});
