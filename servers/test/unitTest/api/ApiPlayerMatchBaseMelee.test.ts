
import { delay } from "../../../src/shared/tsgf/Utils";
import { assert } from 'chai';
import { cancelMatch, createAndEnterRoom, hallClient, joinRoom, joinRoomUseGameServer, queryMatch, requestMatchOneSingle, testEachBuild } from "./ApiUtils";
import { ERoomMsgRecvType } from "../../../src/shared/tsgf/room/IRoomMsg";
import { EMatchFromType, IMatchPlayerResultWithServer, ISingleMatcherParams, MatcherKeys } from "../../../src/shared/tsgf/match/Models";
import { ErrorCodes } from "../../../src/shared/tsgf/Result";

describe("玩家匹配", () => {

    let testData = testEachBuild(5);


    test('4max,min2,2人匹配,应成功,再进入招人匹配,依次进入2人,都要成功,再进1人应该要没结果,再取消!', async function () {
        //匹配请求
        let matchReqId1 = await requestMatchOneSingle(testData.playerToken1, testData.playerId1, 4, 2);
        let matchReqId2 = await requestMatchOneSingle(testData.playerToken2, testData.playerId2, 4, 2);
        await delay(1000);
        let matchRet1 = await queryMatch(testData.playerToken1, matchReqId1);
        let matchRet2 = await queryMatch(testData.playerToken2, matchReqId2);

        console.log('ApiPlayerMatch_4Max2Min2P_2P_1PNoResult, roomId:', matchRet1.roomId);

        testData.gameClient1 = await joinRoomUseGameServer(matchRet1.gameServerUrl!, testData.playerToken1, matchRet1.roomId, 'zum1');
        testData.gameClient2 = await joinRoomUseGameServer(matchRet2.gameServerUrl!, testData.playerToken2, matchRet2.roomId, 'zum2');

        let matchReqId3 = await requestMatchOneSingle(testData.playerToken3, testData.playerId3, 4, 2);
        await delay(1000);
        let matchRet3 = await queryMatch(testData.playerToken3, matchReqId3);
        testData.gameClient3 = await joinRoomUseGameServer(matchRet3.gameServerUrl!, testData.playerToken3, matchRet3.roomId, 'zum3');

        let matchReqId4 = await requestMatchOneSingle(testData.playerToken4, testData.playerId4, 4, 2);
        await delay(1000);
        let matchRet4 = await queryMatch(testData.playerToken4, matchReqId4);
        testData.gameClient4 = await joinRoomUseGameServer(matchRet4.gameServerUrl!, testData.playerToken4, matchRet4.roomId, 'zum4');

        let matchReqId5 = await requestMatchOneSingle(testData.playerToken5, testData.playerId5, 4, 2);
        await delay(1000);
        let retM5 = await hallClient.queryMatch(testData.playerToken5, matchReqId5);
        assert.ok(retM5 === null, "应该没结果!实际有了!" + JSON.stringify(retM5));
        //取消匹配
        await cancelMatch(testData.playerToken5, matchReqId5);

        //这个时候退出了一个
        await testData.gameClient4.leaveRoom();

        //玩家5这个时候要能匹配进房间才对!
        matchReqId5 = await requestMatchOneSingle(testData.playerToken5, testData.playerId5, 4, 2);
        await delay(1000);
        let matchRet5 = await queryMatch(testData.playerToken5, matchReqId5);
        testData.gameClient5 = await joinRoomUseGameServer(matchRet5.gameServerUrl!, testData.playerToken5, matchRet5.roomId, 'zum5');


    });
    test('模拟三个客户端单人混战匹配', async function () {

        //匹配请求
        let matchReqId1 = await requestMatchOneSingle(testData.playerToken1, testData.playerId1, 8, 3);
        let matchReqId2 = await requestMatchOneSingle(testData.playerToken2, testData.playerId2, 8, 3);
        let matchReqId3 = await requestMatchOneSingle(testData.playerToken3, testData.playerId3, 8, 3);

        //延时1秒
        await delay(1000);

        let matchRet1 = await queryMatch(testData.playerToken1, matchReqId1);
        let matchRet2 = await queryMatch(testData.playerToken2, matchReqId2);
        let matchRet3 = await queryMatch(testData.playerToken3, matchReqId3);

        console.log('matchRet1', matchRet1);
        console.log('matchRet2', matchRet2);
        console.log('matchRet3', matchRet3);
        console.log('ApiPlayer_MatchSingle3~8, roomId:', matchRet1.roomId);

        testData.gameClient1 = await joinRoomUseGameServer(matchRet1.gameServerUrl!, testData.playerToken1, matchRet1.roomId, 'zum1');
        testData.gameClient2 = await joinRoomUseGameServer(matchRet2.gameServerUrl!, testData.playerToken2, matchRet2.roomId, 'zum2');
        testData.gameClient3 = await joinRoomUseGameServer(matchRet3.gameServerUrl!, testData.playerToken3, matchRet3.roomId, 'zum3');

        await testData.gameClient3.sendRoomMsg({
            recvType: ERoomMsgRecvType.ROOM_OTHERS,
            msg: '大伙好呀~'
        });

    });
    test('取消匹配', async function () {

        let matchReqId1 = await requestMatchOneSingle(testData.playerToken1, testData.playerId1, 8, 3);
        let matchReqId2 = await requestMatchOneSingle(testData.playerToken2, testData.playerId2, 8, 3);

        let retM1 = await hallClient.queryMatch(testData.playerToken1, matchReqId1);
        assert.ok(retM1 === null, '应该查不到结果的!' + JSON.stringify(retM1));

        //取消玩家1匹配
        await cancelMatch(testData.playerToken1, matchReqId1);
        let matchReqId3 = await requestMatchOneSingle(testData.playerToken3, testData.playerId3, 8, 3);

        //延时
        await delay(500);

        retM1 = await hallClient.queryMatch(testData.playerToken1, matchReqId1);
        assert.ok(retM1?.succ === false && retM1.code === ErrorCodes.MatchRequestCancelled,
            '应该要查到取消匹配的结果!' + JSON.stringify(retM1));

        //延时
        await delay(500);

        //这个时候不满3个,有2个在匹配池等待中,所以没有结果
        retM1 = await hallClient.queryMatch(testData.playerToken1, matchReqId1);
        let retM2 = await hallClient.queryMatch(testData.playerToken2, matchReqId2);
        let retM3 = await hallClient.queryMatch(testData.playerToken3, matchReqId3);
        assert.ok(retM1 === null, '应该查不到结果的!' + JSON.stringify(retM1));
        assert.ok(retM2 === null, '应该查不到结果的!' + JSON.stringify(retM2));
        assert.ok(retM3 === null, '应该查不到结果的!' + JSON.stringify(retM3));

        //玩家1再提交匹配
        matchReqId1 = await requestMatchOneSingle(testData.playerToken1, testData.playerId1, 8, 3);

        //延时
        await delay(500);

        //这个时候应该有结果了
        retM1 = await hallClient.queryMatch(testData.playerToken1, matchReqId1);
        retM2 = await hallClient.queryMatch(testData.playerToken2, matchReqId2);
        retM3 = await hallClient.queryMatch(testData.playerToken3, matchReqId3);
        assert.ok(retM1 !== null, '应该要有结果了!');
        assert.ok(retM1?.succ === true, '应该匹配成功才对!' + retM1?.err);
        assert.ok(retM2 !== null, '应该要有结果了!');
        assert.ok(retM2?.succ === true, '应该匹配成功才对!' + retM2?.err);
        assert.ok(retM3 !== null, '应该要有结果了!');
        assert.ok(retM3?.succ === true, '应该匹配成功才对!' + retM3?.err);

        let matchRet1 = retM1!.data!;
        let matchRet2 = retM2!.data!;
        let matchRet3 = retM3!.data!;
        testData.gameClient1 = await joinRoomUseGameServer(matchRet1.gameServerUrl!, testData.playerToken1, matchRet1.roomId, 'zum1');
        testData.gameClient2 = await joinRoomUseGameServer(matchRet2.gameServerUrl!, testData.playerToken2, matchRet2.roomId, 'zum2');
        testData.gameClient3 = await joinRoomUseGameServer(matchRet3.gameServerUrl!, testData.playerToken3, matchRet3.roomId, 'zum3');

    });
    test('发起全房间玩家匹配和房间取消匹配_单人混战', async function () {

        //创建房间
        let gameClient1Ret = await createAndEnterRoom(testData.playerToken1, testData.playerId1, 'zum1', { maxPlayers: 3 });
        assert.ok(gameClient1Ret.succ === true, gameClient1Ret.err);
        testData.gameClient1 = gameClient1Ret.data!.gameClient;
        let roomId1 = gameClient1Ret.data!.roomId;
        testData.gameClient2 = await joinRoom(testData.playerToken2, roomId1, 'zum2');

        let gameClient3Ret = await createAndEnterRoom(testData.playerToken3, testData.playerId3, 'zum3', { maxPlayers: 3 });
        assert.ok(gameClient3Ret.succ === true, gameClient3Ret.err);
        testData.gameClient3 = gameClient3Ret.data!.gameClient;
        let roomId2 = gameClient3Ret.data!.roomId;
        testData.gameClient4 = await joinRoom(testData.playerToken4, roomId2, 'zum4');

        //发起房间所有玩家匹配请求
        let msgCount = 0;
        testData.gameClient1.onRoomAllPlayersMatchStart = (matchReqId, reqPlayerId, matchParams) => {
            if (reqPlayerId === testData.playerId1) {
                msgCount++;
            }
        };
        testData.gameClient2.onRoomAllPlayersMatchStart = (matchReqId, reqPlayerId, matchParams) => {
            if (reqPlayerId === testData.playerId1) {
                msgCount++;
            }
        };
        let reqRet = await testData.gameClient1.requestMatch({
            matchFromType: EMatchFromType.RoomAllPlayers,
            matchFromInfo: {},
            maxPlayers: 4,
            matcherKey: MatcherKeys.Single,
            matcherParams: {
                minPlayers: 4,
            } as ISingleMatcherParams,
        });
        assert.ok(reqRet.succ, `${reqRet.err}`);
        await delay(200);
        assert.ok(msgCount === 2, `应该要收到2个消息！实际${msgCount}个`);

        //先测试取消
        msgCount = 0;
        testData.gameClient1.onRoomAllPlayersMatchResult = (errMsg, errCode, matchResult) => {
            if (errCode === ErrorCodes.MatchRequestCancelled) {
                msgCount++;
            }
        };
        testData.gameClient2.onRoomAllPlayersMatchResult = (errMsg, errCode, matchResult) => {
            if (errCode === ErrorCodes.MatchRequestCancelled) {
                msgCount++;
            }
        };
        //玩家2去取消
        let cancelRet = await testData.gameClient2.cancelMatch();
        assert.ok(cancelRet.succ, `${cancelRet.err}`);
        await delay(500);
        assert.ok(msgCount === 2, `应该要收到2个消息！实际${msgCount}个`);

        //测试正常的匹配成功
        let p1Result!: IMatchPlayerResultWithServer,
            p2Result!: IMatchPlayerResultWithServer,
            p3Result!: IMatchPlayerResultWithServer,
            p4Result!: IMatchPlayerResultWithServer;
        msgCount = 0;
        testData.gameClient1.onRoomAllPlayersMatchStart = (matchReqId, reqPlayerId, matchParams) => {
            msgCount++;
        };
        testData.gameClient1.onRoomAllPlayersMatchResult = (errMsg, errCode, matchResult) => {
            assert.ok(matchResult, `应该有结果,但为空,错误消息为:${errCode},${errMsg}`);
            msgCount++;
            p1Result = matchResult!;
        };
        testData.gameClient2.onRoomAllPlayersMatchStart = (matchReqId, reqPlayerId, matchParams) => {
            msgCount++;
        };
        testData.gameClient2.onRoomAllPlayersMatchResult = (errMsg, errCode, matchResult) => {
            assert.ok(matchResult, `应该有结果,但为空,错误消息为:${errCode},${errMsg}`);
            msgCount++;
            p2Result = matchResult!;
        };
        reqRet = await testData.gameClient1.requestMatch({
            matchFromType: EMatchFromType.RoomAllPlayers,
            matchFromInfo: {},
            maxPlayers: 4,
            matcherKey: MatcherKeys.Single,
            matcherParams: {
                minPlayers: 4,
            } as ISingleMatcherParams,
        });
        assert.ok(reqRet.succ, `${reqRet.err}`);

        testData.gameClient3.onRoomAllPlayersMatchStart = (matchReqId, reqPlayerId, matchParams) => {
            msgCount++;
        };
        testData.gameClient3.onRoomAllPlayersMatchResult = (errMsg, errCode, matchResult) => {
            assert.ok(matchResult, `应该有结果,但为空,错误消息为:${errCode},${errMsg}`);
            msgCount++;
            p3Result = matchResult!;
        };
        testData.gameClient4.onRoomAllPlayersMatchStart = (matchReqId, reqPlayerId, matchParams) => {
            msgCount++;
        };
        testData.gameClient4.onRoomAllPlayersMatchResult = (errMsg, errCode, matchResult) => {
            assert.ok(matchResult, `应该有结果,但为空,错误消息为:${errCode},${errMsg}`);
            msgCount++;
            p4Result = matchResult!;
        };
        reqRet = await testData.gameClient3.requestMatch({
            matchFromType: EMatchFromType.RoomAllPlayers,
            matchFromInfo: {},
            maxPlayers: 4,
            matcherKey: MatcherKeys.Single,
            matcherParams: {
                minPlayers: 4,
            } as ISingleMatcherParams,
        });
        assert.ok(reqRet.succ, `${reqRet.err}`);
        await delay(2000);//匹配有定时器的
        assert.ok(msgCount === 8, `应该要收到8个消息！实际${msgCount}个`);


        //接着根据匹配结果加入新的房间
        await testData.gameClient1.disconnect();
        await testData.gameClient2.disconnect();
        await testData.gameClient3.disconnect();
        await testData.gameClient4.disconnect();
        testData.gameClient1 = await joinRoomUseGameServer(p1Result.gameServerUrl!, testData.playerToken1, p1Result.roomId, 'zum1');
        testData.gameClient2 = await joinRoomUseGameServer(p2Result.gameServerUrl!, testData.playerToken2, p2Result.roomId, 'zum2');
        testData.gameClient3 = await joinRoomUseGameServer(p3Result.gameServerUrl!, testData.playerToken3, p3Result.roomId, 'zum3');
        testData.gameClient4 = await joinRoomUseGameServer(p4Result.gameServerUrl!, testData.playerToken4, p4Result.roomId, 'zum4');

        msgCount = 0;
        testData.gameClient1.onRecvRoomMsg = (msg) => {
            msgCount++;
        };
        testData.gameClient2.onRecvRoomMsg = (msg) => {
            msgCount++;
        };
        testData.gameClient3.onRecvRoomMsg = (msg) => {
            msgCount++;
        };
        testData.gameClient4.onRecvRoomMsg = (msg) => {
            msgCount++;
        };
        let sendRet = await testData.gameClient1.sendRoomMsg({
            recvType: ERoomMsgRecvType.ROOM_ALL,
            msg: '测试是否同一个房间'
        });
        assert.ok(sendRet.succ, `${sendRet.err}`);
        await delay(200);//匹配有定时器的
        assert.ok(msgCount === 4, `应该要收到4个消息！实际${msgCount}个`);

    });

});