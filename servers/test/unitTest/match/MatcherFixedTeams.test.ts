import { assert } from "chai";
import { EMatchFromType, IFixedTeamsMatcherParams, IMatchParamsFromPlayer, MatcherKeys } from "../../../src/shared/tsgf/match/Models";
import { ITeamPlayerIds } from "../../../src/shared/tsgf/room/IRoomInfo";
import { arrRemoveItems, arrSum } from "../../../src/shared/tsgf/Utils";
import { MatcherFixedTeams, IFixedTeamsMatcherParamsOnServer } from "../../../src/shared/tsgfServer/match/MatcherFixedTeams";
import { IMatchRequest, IMatchFromRoomJoinUsOnServer, IMatchRequestParams, initMatchRequest, IMatchParamsFromRoomJoinUsOnServer } from "../../../src/shared/tsgfServer/match/Models";

describe('固定队伍匹配计算验证', () => {

    let matcher = new MatcherFixedTeams();

    function buildSinglePlayerMatchReq(playerIds: string[],
        fixedTeamCount: number, teamMinPlayers: number, teamMaxPlayers: number): IMatchRequest {
        let reqParams: IMatchParamsFromPlayer = {
            maxPlayers: fixedTeamCount * teamMaxPlayers,
            matchFromType: EMatchFromType.Player,
            matchFromInfo: {
                playerIds: playerIds,
            },
            matcherKey: MatcherKeys.FixedTeams,
            matcherParams: {
                resultsContinueRoomJoinUsMatch: true,
            } as IFixedTeamsMatcherParams,
            teamParams: {
                fixedTeamCount: fixedTeamCount,
                fixedTeamMinPlayers: teamMinPlayers,
                fixedTeamMaxPlayers: teamMaxPlayers,
            },
        };
        let req = initMatchRequest(reqParams);
        let ret = matcher.procNewMatchReq(req);
        assert.ok(ret.succ, ret.err);
        return req;
    }
    function buildRoomJoinUsMatchReq(roomId: string,
        fixedTeamCount: number, teamMinPlayers: number, teamMaxPlayers: number,
        teamsPlayerIds: ITeamPlayerIds[]): IMatchRequest {
        let reqParams: IMatchParamsFromRoomJoinUsOnServer = {
            maxPlayers: fixedTeamCount * teamMaxPlayers,
            matchFromType: EMatchFromType.RoomJoinUs,
            matchFromInfo: {
                roomId: roomId,
                teamsPlayerIds: teamsPlayerIds,
                currPlayerCount: arrSum(teamsPlayerIds, t => t.playerIds.length),
            },
            matcherKey: MatcherKeys.FixedTeams,
            matcherParams: {
                resultsContinueRoomJoinUsMatch: true,
            } as IFixedTeamsMatcherParams,
            teamParams: {
                fixedTeamCount: fixedTeamCount,
                fixedTeamMinPlayers: teamMinPlayers,
                fixedTeamMaxPlayers: teamMaxPlayers,
            },
        };
        let req = initMatchRequest(reqParams);
        let ret = matcher.procNewMatchReq(req);
        assert.ok(ret.succ, ret.err);
        return req;
    }


    test('1个队伍(1~1) 1人*1请求', async function () {
        //满足最低要求
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1'], 1, 1, 1),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 1, '应该创建1个房间!');
    });
    test('1个队伍(1~2) 1人*1请求', async function () {
        //满足最低要求
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1'], 1, 1, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 1, '应该创建1个房间!');
    });
    test('1个队伍(1~2) 2人*1请求', async function () {
        //满足最低要求
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1', '2'], 1, 1, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 1, '应该创建1个房间!');
    });

    test('1个队伍(1~2) 1人*2请求', async function () {
        //组合满
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1'], 1, 1, 2),
            buildSinglePlayerMatchReq(['2'], 1, 1, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 1, '应该创建1个房间!');
    });
    test('1个队伍(1~2) 2人*2请求', async function () {
        //组合满
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1', '1a'], 1, 1, 2),
            buildSinglePlayerMatchReq(['2', '2a'], 1, 1, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 2, '应该创建2个房间!实际' + result.resultCreateRoom?.length);
    });

    test('1个队伍(1~2) 1人*3请求', async function () {
        //1个满,再1个最低要求
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1'], 1, 1, 2),
            buildSinglePlayerMatchReq(['2'], 1, 1, 2),
            buildSinglePlayerMatchReq(['3'], 1, 1, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建房间!');
        assert.ok(result.resultCreateRoom?.length === 2, '应该创建2个房间!实际为' + result.resultCreateRoom?.length);
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 2, '第1个房间应该有2个匹配!实际为' + retReqLen);
        retReqLen = result.resultCreateRoom![1].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 1, '第2个房间应该有1个匹配!实际为' + retReqLen);
    });
    test('1个队伍(1~2) 2人*3请求', async function () {
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1', '1a'], 1, 1, 2),
            buildSinglePlayerMatchReq(['2', '2a'], 1, 1, 2),
            buildSinglePlayerMatchReq(['3', '3a'], 1, 1, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建房间!');
        assert.ok(result.resultCreateRoom?.length === 3, '应该创建3个房间!实际为' + result.resultCreateRoom?.length);
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 1, '第1个房间应该有1个匹配!实际为' + retReqLen);
        retReqLen = result.resultCreateRoom![1].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 1, '第2个房间应该有1个匹配!实际为' + retReqLen);
    });

    test('1个队伍(1~3) 1人*5请求', async function () {
        //1个满,再1个最低要求并推满
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1'], 1, 1, 3),
            buildSinglePlayerMatchReq(['2'], 1, 1, 3),
            buildSinglePlayerMatchReq(['3'], 1, 1, 3),
            buildSinglePlayerMatchReq(['4'], 1, 1, 3),
            buildSinglePlayerMatchReq(['5'], 1, 1, 3),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建房间!');
        assert.ok(result.resultCreateRoom?.length === 2, '应该创建2个房间!实际为' + result.resultCreateRoom?.length);
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 3, '第1个房间应该有3个匹配!实际为' + retReqLen);
        retReqLen = result.resultCreateRoom![1].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 2, '第2个房间应该有2个匹配!实际为' + retReqLen);
    });
    test('1个队伍(1~3) 2人*5请求', async function () {
        //1个满,再1个最低要求并推满
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1', '1a'], 1, 1, 3),
            buildSinglePlayerMatchReq(['2', '2a'], 1, 1, 3),
            buildSinglePlayerMatchReq(['3', '3a'], 1, 1, 3),
            buildSinglePlayerMatchReq(['4', '4a'], 1, 1, 3),
            buildSinglePlayerMatchReq(['5', '5a'], 1, 1, 3),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建房间!');
        assert.ok(result.resultCreateRoom?.length === 5, '应该创建5个房间!实际为' + result.resultCreateRoom?.length);
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 1, '第1个房间应该有3个匹配!实际为' + retReqLen);
        retReqLen = result.resultCreateRoom![1].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 1, '第2个房间应该有2个匹配!实际为' + retReqLen);
    });

    test('2个队伍各(1~1) 1人*2请求', async function () {
        //2个队伍(1~1)组合满
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1'], 2, 1, 1),
            buildSinglePlayerMatchReq(['2'], 2, 1, 1),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 1, '应该创建1个房间!');
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 2, '第1个房间应该有2个匹配!实际为' + retReqLen);
    });
    test('2个队伍各(1~1) 2人*2请求', async function () {
        //2个队伍(1~1)组合满
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1', '1a'], 2, 1, 1),
            buildSinglePlayerMatchReq(['2', '2a'], 2, 1, 1),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(!result.hasResult, '应该没结果!');
    });

    test('2个队伍各(1~2) 1人*2请求', async function () {
        //2个队伍(1~2)满足最低要求
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1'], 2, 1, 2),
            buildSinglePlayerMatchReq(['2'], 2, 1, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 1, '应该创建1个房间!');
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 2, '第1个房间应该有2个匹配!实际为' + retReqLen);
    });

    test('2个队伍各(1~2) 2人*2请求', async function () {
        //2个队伍(1~2)满足最低要求
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1', '1a'], 2, 1, 2),
            buildSinglePlayerMatchReq(['2', '2a'], 2, 1, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 1, '应该创建1个房间!');
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 2, '第1个房间应该有2个匹配!实际为' + retReqLen);
    });

    test('2个队伍各(1~3) 1人*2请求', async function () {
        //2个队伍(1~3)满足最低要求
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1'], 2, 1, 3),
            buildSinglePlayerMatchReq(['2'], 2, 1, 3),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 1, '应该创建1个房间!');
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 2, '第1个房间应该有2个匹配!实际为' + retReqLen);
    });
    test('2个队伍各(1~3) 2人*2请求', async function () {
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1', '1a'], 2, 1, 3),
            buildSinglePlayerMatchReq(['2', '2a'], 2, 1, 3),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 1, '应该创建1个房间!');
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 2, '第1个房间应该有2个匹配!实际为' + retReqLen);
    });

    test('2个队伍各(1~2) 1人*4请求', async function () {
        //2个队伍(1~2)组合满
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1'], 2, 1, 2),
            buildSinglePlayerMatchReq(['2'], 2, 1, 2),
            buildSinglePlayerMatchReq(['3'], 2, 1, 2),
            buildSinglePlayerMatchReq(['4'], 2, 1, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 1, '应该创建1个房间!实际为' + result.resultCreateRoom?.length);
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 4, '第1个房间应该有4个匹配!实际为' + retReqLen);
    });
    test('2个队伍各(1~2) 2人*4请求', async function () {
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1', '1a'], 2, 1, 2),
            buildSinglePlayerMatchReq(['2', '2a'], 2, 1, 2),
            buildSinglePlayerMatchReq(['3', '3a'], 2, 1, 2),
            buildSinglePlayerMatchReq(['4', '4a'], 2, 1, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建2个房间!');
        assert.ok(result.resultCreateRoom?.length === 2, '应该创建2个房间!实际为' + result.resultCreateRoom?.length);
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 2, '第1个房间应该有2个匹配!实际为' + retReqLen);
    });
    test('2个队伍各(1~2) 2+2+2+1人请求', async function () {
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1', '1a'], 2, 1, 2),
            buildSinglePlayerMatchReq(['2', '2a'], 2, 1, 2),
            buildSinglePlayerMatchReq(['3', '3a'], 2, 1, 2),
            buildSinglePlayerMatchReq(['4'], 2, 1, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建2个房间!');
        assert.ok(result.resultCreateRoom?.length === 2, '应该创建2个房间!实际为' + result.resultCreateRoom?.length);
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 2, '第1个房间应该有2个匹配!实际为' + retReqLen);
        retReqLen = result.resultCreateRoom![1].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 2, '第2个房间应该有2个匹配!实际为' + retReqLen);
    });
    test('2个队伍各(1~2) 2+2+1+1人请求', async function () {
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1', '1a'], 2, 1, 2),
            buildSinglePlayerMatchReq(['2', '2a'], 2, 1, 2),
            buildSinglePlayerMatchReq(['3'], 2, 1, 2),
            buildSinglePlayerMatchReq(['4'], 2, 1, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建2个房间!');
        assert.ok(result.resultCreateRoom?.length === 2, '应该创建2个房间!实际为' + result.resultCreateRoom?.length);
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 2, '第1个房间应该有2个匹配!实际为' + retReqLen);
        retReqLen = result.resultCreateRoom![1].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 2, '第2个房间应该有2个匹配!实际为' + retReqLen);
    });

    test('3个队伍各(1~3) 1人*3请求', async function () {
        //3个队伍(1~3)满足最低要求
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1'], 3, 1, 3),
            buildSinglePlayerMatchReq(['2'], 3, 1, 3),
            buildSinglePlayerMatchReq(['3'], 3, 1, 3),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 1, '应该创建1个房间!');
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 3, '第1个房间应该有3个匹配!实际为' + retReqLen);
    });
    test('3个队伍各(1~3) 2人*3请求', async function () {
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1', '1a'], 3, 1, 3),
            buildSinglePlayerMatchReq(['2', '2a'], 3, 1, 3),
            buildSinglePlayerMatchReq(['3', '3a'], 3, 1, 3),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 1, '应该创建1个房间!');
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 3, '第1个房间应该有3个匹配!实际为' + retReqLen);
    });
    test('3个队伍各(1~3) 3人*3请求', async function () {
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1', '1a', '1b'], 3, 1, 3),
            buildSinglePlayerMatchReq(['2', '2a', '2b'], 3, 1, 3),
            buildSinglePlayerMatchReq(['3', '3a', '3b'], 3, 1, 3),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 1, '应该创建1个房间!');
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 3, '第1个房间应该有3个匹配!实际为' + retReqLen);
    });
    test('3个队伍各(1~3) 1+2+3人请求', async function () {
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1'], 3, 1, 3),
            buildSinglePlayerMatchReq(['2', '2a'], 3, 1, 3),
            buildSinglePlayerMatchReq(['3', '3a', '3b'], 3, 1, 3),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 1, '应该创建1个房间!');
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 3, '第1个房间应该有3个匹配!实际为' + retReqLen);
    });
    test('3个队伍各(1~3) 1+2+3+1+2人请求', async function () {
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1'], 3, 1, 3),
            buildSinglePlayerMatchReq(['2', '2a'], 3, 1, 3),
            buildSinglePlayerMatchReq(['3', '3a', '3b'], 3, 1, 3),
            buildSinglePlayerMatchReq(['4'], 3, 1, 3),
            buildSinglePlayerMatchReq(['5', '5a'], 3, 1, 3),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 1, '应该创建1个房间!');
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 5, '第1个房间应该有5个匹配!实际为' + retReqLen);
    });

    test('3个队伍各(1~3) 1人*6请求', async function () {
        //3个队伍(1~3)满足最低要求再补充
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1'], 3, 1, 3),
            buildSinglePlayerMatchReq(['2'], 3, 1, 3),
            buildSinglePlayerMatchReq(['3'], 3, 1, 3),
            buildSinglePlayerMatchReq(['4'], 3, 1, 3),
            buildSinglePlayerMatchReq(['5'], 3, 1, 3),
            buildSinglePlayerMatchReq(['6'], 3, 1, 3),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        //应该是尽量推满, 而不是按min去创建两个房间
        assert.ok(result.resultCreateRoom?.length === 1, '应该创建1个房间!实际为' + result.resultCreateRoom?.length);
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 6, '第1个房间应该有6个匹配!实际为' + retReqLen);
    });

    test('3个队伍各(2~3) 1人*6请求', async function () {
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1'], 3, 2, 3),
            buildSinglePlayerMatchReq(['2'], 3, 2, 3),
            buildSinglePlayerMatchReq(['3'], 3, 2, 3),
            buildSinglePlayerMatchReq(['4'], 3, 2, 3),
            buildSinglePlayerMatchReq(['5'], 3, 2, 3),
            buildSinglePlayerMatchReq(['6'], 3, 2, 3),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 1, '应该创建1个房间!实际为' + result.resultCreateRoom?.length);
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 6, '第1个房间应该有6个匹配!实际为' + retReqLen);


    });

    test('3个队伍各(1~2) 1人*12请求', async function () {
        //3个队伍(1~2) 组合满2个房间
        let allPlayersReqs: IMatchRequest[] = [
            buildSinglePlayerMatchReq(['1'], 3, 1, 2),
            buildSinglePlayerMatchReq(['2'], 3, 1, 2),
            buildSinglePlayerMatchReq(['3'], 3, 1, 2),
            buildSinglePlayerMatchReq(['4'], 3, 1, 2),
            buildSinglePlayerMatchReq(['5'], 3, 1, 2),
            buildSinglePlayerMatchReq(['6'], 3, 1, 2),
            buildSinglePlayerMatchReq(['7'], 3, 1, 2),
            buildSinglePlayerMatchReq(['8'], 3, 1, 2),
            buildSinglePlayerMatchReq(['9'], 3, 1, 2),
            buildSinglePlayerMatchReq(['10'], 3, 1, 2),
            buildSinglePlayerMatchReq(['11'], 3, 1, 2),
            buildSinglePlayerMatchReq(['12'], 3, 1, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultCreateRoom, '应该创建1个房间!');
        assert.ok(result.resultCreateRoom?.length === 2, '应该创建2个房间!实际为' + result.resultCreateRoom?.length);
        let retReqLen = result.resultCreateRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 6, '第1个房间应该有6个匹配!实际为' + retReqLen);
        retReqLen = result.resultCreateRoom![1].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 6, '第2个房间应该有6个匹配!实际为' + retReqLen);
    });



    test('房间招人:2个队伍各(1~2) 已有1*2人, 匹配1人*1请求', async function () {
        let allPlayersReqs: IMatchRequest[] = [
            buildRoomJoinUsMatchReq('1', 2, 1, 2, [
                { teamId: '1', playerIds: ['1'] },
                { teamId: '2', playerIds: ['2'] }
            ]),
            buildSinglePlayerMatchReq(['1'], 2, 1, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultJoinRoom, '应该加入1个房间!');
        assert.ok(result.resultJoinRoom?.length === 1, '应该加入1个房间!实际为' + result.resultJoinRoom?.length);
        let retReqLen = result.resultJoinRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 1, '第1个结果应该有1个匹配!实际为' + retReqLen);
    });
    test('房间招人:2个队伍各(1~3) 已有1+1人, 匹配1+2人请求', async function () {
        let allPlayersReqs: IMatchRequest[] = [
            buildRoomJoinUsMatchReq('1', 2, 1, 3, [
                { teamId: '1', playerIds: ['1'] },
                { teamId: '2', playerIds: ['2'] }
            ]),
            buildSinglePlayerMatchReq(['1'], 2, 1, 3),
            buildSinglePlayerMatchReq(['2', '2a'], 2, 1, 3),

            //干扰
            buildSinglePlayerMatchReq(['a1'], 2, 1, 2),
            buildSinglePlayerMatchReq(['b1'], 2, 1, 2),
            buildSinglePlayerMatchReq(['c1'], 2, 1, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultJoinRoom, '应该加入1个房间!');
        assert.ok(result.resultJoinRoom?.length === 1, '应该加入1个房间!实际为' + result.resultJoinRoom?.length);
        let retReqLen = result.resultJoinRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 2, '第1个结果应该有2个匹配!实际为' + retReqLen);
    });

    test('房间招人:2个队伍各(1~2) 已有1*2人, 匹配1人*2请求', async function () {
        let allPlayersReqs: IMatchRequest[] = [
            buildRoomJoinUsMatchReq('1', 2, 1, 2, [
                { teamId: '1', playerIds: ['1'] },
                { teamId: '2', playerIds: ['2'] }
            ]),
            buildSinglePlayerMatchReq(['1'], 2, 1, 2),
            buildSinglePlayerMatchReq(['2'], 2, 1, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultJoinRoom, '应该加入1个房间!');
        assert.ok(result.resultJoinRoom?.length === 1, '应该加入1个房间!实际为' + result.resultJoinRoom?.length);
        let retReqLen = result.resultJoinRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 2, '第1个结果应该有2个匹配!实际为' + retReqLen);
    });

    test('房间招人:2个队伍各(1~2) 已有1*2人, 匹配1人*3请求', async function () {
        let allPlayersReqs: IMatchRequest[] = [
            buildRoomJoinUsMatchReq('1', 2, 1, 2, [
                { teamId: '1', playerIds: ['1'] },
                { teamId: '2', playerIds: ['2'] },
            ]),
            buildSinglePlayerMatchReq(['1'], 2, 1, 2),
            buildSinglePlayerMatchReq(['2'], 2, 1, 2),
            buildSinglePlayerMatchReq(['3'], 2, 1, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultJoinRoom, '应该加入1个房间!');
        assert.ok(result.resultJoinRoom?.length === 1, '应该加入1个房间!实际为' + result.resultJoinRoom?.length);
        let retReqLen = result.resultJoinRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 2, '第1个结果应该有2个匹配!实际为' + retReqLen);
    });

    test('房间招人:2个队伍各(1~2) 已有1+2人, 匹配1人*3请求', async function () {
        let allPlayersReqs: IMatchRequest[] = [
            buildRoomJoinUsMatchReq('1', 2, 1, 2, [
                { teamId: '1', playerIds: ['1'] },
                { teamId: '2', playerIds: ['2', '3'] },
            ]),
            buildSinglePlayerMatchReq(['1'], 2, 1, 2),
            buildSinglePlayerMatchReq(['2'], 2, 1, 2),
            buildSinglePlayerMatchReq(['3'], 2, 1, 2),
        ];
        let result = matcher.onPollMatcherReqs(allPlayersReqs);
        assert.ok(result.hasResult, '应该要有结果了!');
        assert.ok(!result.resultErrMsg, '出错了' + result.resultErrMsg);
        assert.ok(result.resultJoinRoom, '应该加入1个房间!');
        assert.ok(result.resultJoinRoom?.length === 1, '应该加入1个房间!实际为' + result.resultJoinRoom?.length);
        let retReqLen = result.resultJoinRoom![0].matchRequestPlayerResults.length;
        assert.ok(retReqLen === 1, '第1个结果应该有2个匹配!实际为' + retReqLen);
    });
});
