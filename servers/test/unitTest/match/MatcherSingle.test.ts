import { assert } from "chai";
import { EMatchFromType, IMatchParamsFromPlayer, ISingleMatcherParams, MatcherKeys } from "../../../src/shared/tsgf/match/Models";
import { arrRemoveItems, arrSum } from "../../../src/shared/tsgf/Utils";
import { MatcherSingle } from "../../../src/shared/tsgfServer/match/MatcherSingle";
import { IMatchRequest, IMatchFromRoomJoinUsOnServer, IMatchRequestParams, initMatchRequest, IMatchParamsFromRoomJoinUsOnServer } from "../../../src/shared/tsgfServer/match/Models";

describe('单人匹配计算验证', () => {
    let matcher = new MatcherSingle();

    function buildSinglePlayerMatchReq(playerId: string, minPlayers: number, maxPlayers: number): IMatchRequest {
        let reqParams: IMatchParamsFromPlayer = {
            matchFromType: EMatchFromType.Player,
            matchFromInfo: {
                playerIds: [playerId],
            },
            matcherKey: MatcherKeys.Single,
            maxPlayers: maxPlayers,
            matcherParams: {
                minPlayers: minPlayers,
                resultsContinueRoomJoinUsMatch: true,
            } as ISingleMatcherParams,
        };
        let req = initMatchRequest(reqParams);
        return req;
    }
    function buildRoomJoinUsMatchReq(roomId: string, matchPlayerIds: string[], maxPlayers: number): IMatchRequest {
        let reqParams: IMatchParamsFromRoomJoinUsOnServer = {
            matchFromType: EMatchFromType.RoomJoinUs,
            matchFromInfo: {
                roomId: roomId,
                teamsPlayerIds: [{ teamId: '', playerIds: matchPlayerIds.slice() }],
                currPlayerCount: matchPlayerIds.length,
            },
            matcherKey: MatcherKeys.Single,
            maxPlayers: maxPlayers,
            matcherParams: {
            } as ISingleMatcherParams,
        };
        let req = initMatchRequest(reqParams);
        return req;
    }

    test('Single_1人的房间', async function () {
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq('4a', 1, 9),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 1, '应该创建1个房间!');
    });
    test('Single_单玩家匹配再房间招人匹配', async function () {

        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq('4a', 2, 4),
            buildSinglePlayerMatchReq('4b', 2, 4),
            buildSinglePlayerMatchReq('3a', 2, 3),
            buildSinglePlayerMatchReq('3a', 2, 3),
            buildSinglePlayerMatchReq('2a', 2, 2),
            buildSinglePlayerMatchReq('2b', 2, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建3个房间!');
        assert.ok(result.resultCreateRoom?.length === 3, '应该创建3个房间!');
        let createRoomResult4 = result.resultCreateRoom!.find(r => r.createRoomPara.maxPlayers === 4);
        let createRoomResult3 = result.resultCreateRoom!.find(r => r.createRoomPara.maxPlayers === 3);
        let createRoomResult2 = result.resultCreateRoom!.find(r => r.createRoomPara.maxPlayers === 2);
        assert.ok(createRoomResult4, '应该创建一个房间!');
        assert.ok(createRoomResult3, '应该创建一个房间!');
        assert.ok(createRoomResult2, '应该创建一个房间!');

        let matchPlayerCount = arrSum(createRoomResult4!.matchRequestPlayerResults, r => r.matchPlayerResults.length);
        assert.ok(matchPlayerCount === 2, '应该匹配到2个,实际为' + matchPlayerCount);
        assert.ok(createRoomResult4?.matchRequestPlayerResults.length === 2, '应该匹配到2个,实际为' + createRoomResult4?.matchRequestPlayerResults.length);
        assert.ok(createRoomResult4?.roomJoinUsMatch, '因为人未满,所以应该开启招人匹配!');

        matchPlayerCount = arrSum(createRoomResult3!.matchRequestPlayerResults, r => r.matchPlayerResults.length);
        assert.ok(matchPlayerCount === 2, '应该匹配到2个,实际为' + matchPlayerCount);
        assert.ok(createRoomResult3?.matchRequestPlayerResults.length === 2, '应该匹配到2个,实际为' + createRoomResult3?.matchRequestPlayerResults.length);
        assert.ok(createRoomResult3?.roomJoinUsMatch, '因为人未满,所以应该开启招人匹配!');

        matchPlayerCount = arrSum(createRoomResult2!.matchRequestPlayerResults, r => r.matchPlayerResults.length);
        assert.ok(matchPlayerCount === 2, '应该匹配到2个,实际为' + matchPlayerCount);
        assert.ok(createRoomResult2?.matchRequestPlayerResults.length === 2, '应该匹配到2个,实际为' + createRoomResult2?.matchRequestPlayerResults.length);
        assert.ok(!createRoomResult2?.roomJoinUsMatch, '因为满员,所以不应该开启招人匹配!');

        //模拟移除匹配中的请求
        arrRemoveItems(allPlayersReqs, r =>
            !!result.resultCreateRoom?.find(c =>
                c.matchRequestPlayerResults.find(re => re.matchReqId === r.matchReqId))
            || !!result.resultJoinRoom?.find(c =>
                c.matchRequestPlayerResults.find(re => re.matchReqId === r.matchReqId))
        );
        assert.ok(allPlayersReqs.length === 0, '匹配应该被清空了!实际为' + allPlayersReqs.length);

        //加入2个房间招人匹配
        let matchPlayerIds: string[] = [];
        createRoomResult4!.matchRequestPlayerResults
            .forEach(r => matchPlayerIds.push(...r.matchPlayerResults.map(p => p.playerId)));
        let roomJoinUsMatchReq4 = buildRoomJoinUsMatchReq('4', matchPlayerIds, 4);
        matchPlayerIds = [];
        createRoomResult3!.matchRequestPlayerResults
            .forEach(r => matchPlayerIds.push(...r.matchPlayerResults.map(p => p.playerId)));
        let roomJoinUsMatchReq3 = buildRoomJoinUsMatchReq('3', matchPlayerIds, 3);
        allPlayersReqs.push(roomJoinUsMatchReq4);
        allPlayersReqs.push(roomJoinUsMatchReq3);
        result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(!result.hasResult, '两个房间招人,但没玩家匹配,应该没结果!');

        //加入1个4Max的玩家匹配
        allPlayersReqs.push(buildSinglePlayerMatchReq('4c', 2, 4));
        result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultJoinRoom, '应该加入1个房间!');
        assert.ok(result.resultJoinRoom?.length === 1, '应该加入1个房间!');
        let joinRoomResult4 = result.resultJoinRoom![0];
        assert.ok(joinRoomResult4, '应该加入1个房间!');
        assert.ok(joinRoomResult4?.joinRoomId === '4', '加入的房间ID应该是4,实际为' + joinRoomResult4?.joinRoomId);
        matchPlayerCount = arrSum(joinRoomResult4!.matchRequestPlayerResults, r => r.matchPlayerResults.length);
        assert.ok(matchPlayerCount === 1, '应该匹配上1个,实际' + matchPlayerCount);
        assert.ok(joinRoomResult4?.matchRequestPlayerResults.length === 1, '应该匹配上1个,实际' + joinRoomResult4?.matchRequestPlayerResults.length);
        assert.ok(joinRoomResult4?.roomJoinUsMatch, '因为人未满,所以应该开启招人匹配!');
        //模拟移除匹配中的请求
        arrRemoveItems(allPlayersReqs, r =>
            !!result.resultCreateRoom?.find(c =>
                c.matchRequestPlayerResults.find(re => re.matchReqId === r.matchReqId))
            || !!result.resultJoinRoom?.find(c =>
                c.matchRequestPlayerResults.find(re => re.matchReqId === r.matchReqId))
        );
        assert.ok(allPlayersReqs.length === 2, '总匹配应该剩下那2个招人匹配!但实际为' + allPlayersReqs.length);

        //需要模拟将这个匹配玩家加入到对应匹配的玩家列表中
        let roomJoinUsInfo = (roomJoinUsMatchReq4.matchFromInfo as IMatchFromRoomJoinUsOnServer);
        matchPlayerIds = [];
        joinRoomResult4!.matchRequestPlayerResults
            .forEach(r => matchPlayerIds.push(...r.matchPlayerResults.map(p => p.playerId)));
        roomJoinUsInfo.teamsPlayerIds[0].playerIds.push(...matchPlayerIds);
        roomJoinUsInfo.currPlayerCount = roomJoinUsInfo.teamsPlayerIds[0].playerIds.length;

        //再加入1个4Max的玩家匹配
        allPlayersReqs.push(buildSinglePlayerMatchReq('4d', 2, 4));
        result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultJoinRoom, '应该加入1个房间!');
        assert.ok(result.resultJoinRoom?.length === 1, '应该加入1个房间!');
        joinRoomResult4 = result.resultJoinRoom![0];
        assert.ok(joinRoomResult4, '应该加入1个房间!');
        assert.ok(joinRoomResult4?.joinRoomId === '4', '加入的房间ID应该是4,实际为' + joinRoomResult4?.joinRoomId);
        matchPlayerCount = arrSum(joinRoomResult4!.matchRequestPlayerResults, r => r.matchPlayerResults.length);
        assert.ok(matchPlayerCount === 1, '应该匹配上1个,实际' + matchPlayerCount);
        assert.ok(joinRoomResult4?.matchRequestPlayerResults.length === 1, '应该匹配上1个,实际' + joinRoomResult4?.matchRequestPlayerResults.length);
        assert.ok(!joinRoomResult4?.roomJoinUsMatch, '因为满员,所以不应该开启招人匹配!');
        //模拟移除匹配中的请求
        arrRemoveItems(allPlayersReqs, r =>
            !!result.resultCreateRoom?.find(c =>
                c.matchRequestPlayerResults.find(re => re.matchReqId === r.matchReqId))
            || !!result.resultJoinRoom?.find(c =>
                c.matchRequestPlayerResults.find(re => re.matchReqId === r.matchReqId))
        );
        assert.ok(allPlayersReqs.length === 2, '总匹配应该剩下那2个招人匹配!但实际为' + allPlayersReqs.length);

        //需要模拟将这个匹配玩家加入到对应匹配的玩家列表中
        roomJoinUsInfo = (roomJoinUsMatchReq4.matchFromInfo as IMatchFromRoomJoinUsOnServer);
        matchPlayerIds = [];
        joinRoomResult4!.matchRequestPlayerResults
            .forEach(r => matchPlayerIds.push(...r.matchPlayerResults.map(p => p.playerId)));
        roomJoinUsInfo.teamsPlayerIds[0].playerIds.push(...matchPlayerIds);
        roomJoinUsInfo.currPlayerCount = roomJoinUsInfo.teamsPlayerIds[0].playerIds.length;

        //再加入1个3Max的玩家匹配
        allPlayersReqs.push(buildSinglePlayerMatchReq('3c', 2, 3));
        result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultJoinRoom, '应该加入1个房间!');
        assert.ok(result.resultJoinRoom?.length === 1, '应该加入1个房间!');
        let joinRoomResult3 = result.resultJoinRoom![0];
        assert.ok(joinRoomResult3, '应该加入1个房间!');
        assert.ok(joinRoomResult3?.joinRoomId === '3', '加入的房间ID应该是3,实际为' + joinRoomResult3?.joinRoomId);
        matchPlayerCount = arrSum(joinRoomResult3!.matchRequestPlayerResults, r => r.matchPlayerResults.length);
        assert.ok(matchPlayerCount === 1, '应该匹配上1个,实际' + matchPlayerCount);
        assert.ok(joinRoomResult3?.matchRequestPlayerResults.length === 1, '应该匹配上1个,实际' + joinRoomResult3?.matchRequestPlayerResults.length);
        assert.ok(!joinRoomResult3?.roomJoinUsMatch, '因为满员,所以不应该开启招人匹配!');
        //模拟移除匹配中的请求
        arrRemoveItems(allPlayersReqs, r =>
            !!result.resultCreateRoom?.find(c =>
                c.matchRequestPlayerResults.find(re => re.matchReqId === r.matchReqId))
            || !!result.resultJoinRoom?.find(c =>
                c.matchRequestPlayerResults.find(re => re.matchReqId === r.matchReqId))
        );
        assert.ok(allPlayersReqs.length === 2, '总匹配应该剩下0个匹配!但实际为' + allPlayersReqs.length);

        //需要模拟将这个匹配玩家加入到对应匹配的玩家列表中
        roomJoinUsInfo = (roomJoinUsMatchReq3.matchFromInfo as IMatchFromRoomJoinUsOnServer);
        matchPlayerIds = [];
        joinRoomResult3!.matchRequestPlayerResults
            .forEach(r => matchPlayerIds.push(...r.matchPlayerResults.map(p => p.playerId)));
        roomJoinUsInfo.teamsPlayerIds[0].playerIds.push(...matchPlayerIds);
        roomJoinUsInfo.currPlayerCount = roomJoinUsInfo.teamsPlayerIds[0].playerIds.length;

    });
});
