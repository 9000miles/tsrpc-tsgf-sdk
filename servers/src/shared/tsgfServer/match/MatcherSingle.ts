import { EMatchFromType, ISingleMatcherParams, IMatchFromPlayer, IMatchParams } from "../../tsgf/match/Models";
import { arrGroup, arrRemoveItems, arrSum, arrWinner } from "../../tsgf/Utils";
import { IMatcher } from "./IMatcher";
import { IMatchRequest, IMatcherExecResult, IMatcherExecResultJoinRoom, IMatcherExecResultCreateRoom, IMatchFromRoomJoinUsOnServer, IMatchRequestPlayerResults } from "./Models";

/**单人(无组队)匹配器
 * ISingleMatcherParams
*/
export class MatcherSingle implements IMatcher {
    public matcherKey: string = 'Single';

    protected matchAllReqs(allReqs: IMatchRequest[]): IMatcherExecResult {

        let joinRoomResults: IMatcherExecResultJoinRoom[] = [];
        let createRoomResults: IMatcherExecResultCreateRoom[] = [];

        let roomJoinUsReqs: IMatchRequest[] = [];
        let playerReqs: IMatchRequest[] = [];

        allReqs.forEach(r => {
            switch (r.matchFromType) {
                case EMatchFromType.RoomJoinUs:
                    roomJoinUsReqs.push(r);
                    break;
                case EMatchFromType.Player:
                case EMatchFromType.RoomAllPlayers:
                    playerReqs.push(r);
                    break;
            }
        });

        //=====房间招人匹配, 即招人的房间先挑人,挑满后剩下的再看能否匹配成功
        //排序, 先请求的先满足
        this.sortByReqTime(roomJoinUsReqs);
        for (let checkReq of roomJoinUsReqs) {
            let fromInfo = checkReq.matchFromInfo as IMatchFromRoomJoinUsOnServer;
            //相同匹配分组的
            let matchReqs: IMatchRequest[] = playerReqs.filter(r => r.matchReqGroupKey === checkReq.matchReqGroupKey);
            if (matchReqs.length > 0) {
                let ret = this.matchPlayerReqs(playerReqs, checkReq, fromInfo.currPlayerCount, false, matchReqs);
                if (ret.matchRequestPlayerResults.length > 0) {
                    let roomJoinUsMatch = true;
                    let matchPlayerCount = arrSum(ret.matchRequestPlayerResults, r => r.matchPlayerResults.length);
                    if (fromInfo.currPlayerCount + matchPlayerCount >= checkReq.maxPlayers) {
                        //如果匹配完玩家满员,则关闭招人匹配
                        roomJoinUsMatch = false;
                    }
                    //匹配成功!
                    joinRoomResults.push({
                        joinRoomId: fromInfo.roomId,
                        matchRequestPlayerResults: ret.matchRequestPlayerResults,
                        roomJoinUsMatch: roomJoinUsMatch,
                    });
                }
            }
        }

        //=====玩家匹配

        //根据匹配分组遍历, 组内匹配时间排序, 依次找有没满足minPlayers的匹配
        let maxPlayersReqs = arrGroup(playerReqs, r => r.matchReqGroupKey);
        for (let group of maxPlayersReqs) {
            //组内匹配时间排序
            let reqs = group[1];
            let groupMatchReqs = reqs.slice();//拷贝一份
            this.sortByReqTime(groupMatchReqs);
            for (let i = 0; i < reqs.length; i++) {
                let checkReq = reqs[i];//用原始group的,保证每个都能有一次尝试机会
                if (!groupMatchReqs.find(r => r.matchReqId === checkReq.matchReqId)) {
                    //如果这个匹配请求已经被其他的匹配走了,则跳过
                    continue;
                }
                let attr = checkReq.matcherParams as ISingleMatcherParams;
                let fromInfo = checkReq.matchFromInfo as IMatchFromPlayer;
                //找到不高于这个最小玩家要求的匹配
                let canPlayersMatchReqs = groupMatchReqs.filter(r =>
                    r.matchReqId !== checkReq.matchReqId
                    && (!r.matcherParams.minPlayers
                        || r.matcherParams.minPlayers <= attr.minPlayers
                    ));
                let playerCount = arrSum(canPlayersMatchReqs,
                    r => (r.matchFromInfo as IMatchFromPlayer).playerIds.length)
                    + fromInfo.playerIds.length;
                if (playerCount >= attr.minPlayers) {
                    //有包含最低要求, 调用匹配逻辑,会尽量配满!
                    let ret = this.matchPlayerReqs(groupMatchReqs, checkReq, fromInfo.playerIds.length, true, canPlayersMatchReqs);
                    if (ret.matchRequestPlayerResults.length > 0) {
                        //匹配成功!
                        let roomJoinUsMatch = false;
                        let matchPlayerCount = arrSum(ret.matchRequestPlayerResults, r => r.matchPlayerResults.length);
                        if (matchPlayerCount < checkReq.maxPlayers) {
                            //如果匹配玩家没满员,则根据配置来决定是否开启招人匹配
                            roomJoinUsMatch = attr.resultsContinueRoomJoinUsMatch === true;
                        }
                        createRoomResults.push({
                            createRoomPara: {
                                roomName: '系统匹配的房间',
                                ownerPlayerId: '',
                                maxPlayers: checkReq.maxPlayers,
                                isPrivate: !roomJoinUsMatch,
                                matcherKey: this.matcherKey,
                            },
                            matchRequestPlayerResults: ret.matchRequestPlayerResults,
                            roomJoinUsMatch: roomJoinUsMatch,
                        });
                        //组里的也移除
                        arrRemoveItems(groupMatchReqs, r => !!ret.matchRequestPlayerResults.find(e => e.matchReqId === r.matchReqId));
                    }
                }
            }
        }


        if (joinRoomResults.length <= 0 && createRoomResults.length <= 0) {
            return { hasResult: false };
        }
        return {
            hasResult: true,
            resultCreateRoom: createRoomResults,
            resultJoinRoom: joinRoomResults,
        };

    }


    /**
     * 匹配筛选出来的玩家列表,成功则移除allReqs里的匹配请求
     *
     * @protected
     * @param allReqs
     * @param checkReq
     * @param checkReqPlayerCount
     * @param checkReqSelfApply 匹配结果是否需要包含checkReq(同时移除)
     * @param matchPlayerReqs
     * @returns
     */
    protected matchPlayerReqs(allReqs: IMatchRequest[],
        checkReq: IMatchRequest, checkReqPlayerCount: number, checkReqSelfApply: boolean,
        matchPlayerReqs: IMatchRequest[])
        : {
            matchRequestPlayerResults: IMatchRequestPlayerResults[],
        } {

        this.sortByReqTime(matchPlayerReqs);
        let matchRequestPlayerResults: IMatchRequestPlayerResults[] = [];

        let playerIdCount = checkReqPlayerCount;
        for (let matchReq of matchPlayerReqs) {
            if (playerIdCount >= matchReq.maxPlayers) {
                //满员
                break;
            }
            let fromPlayerInfo = matchReq.matchFromInfo as IMatchFromPlayer;
            if (playerIdCount + fromPlayerInfo.playerIds.length > matchReq.maxPlayers) {
                //遍历的请求加上去超过了最大玩家数,跳过
                continue;
            }
            matchRequestPlayerResults.push({
                matchReqId: matchReq.matchReqId,
                //没有队伍,直接用玩家id生成结果
                matchPlayerResults: fromPlayerInfo.playerIds.map(pid => { return { playerId: pid } }),
            });
            playerIdCount += fromPlayerInfo.playerIds.length;
            //匹配移除
            arrRemoveItems(allReqs, r => r.matchReqId === matchReq.matchReqId);
        }
        if (checkReqSelfApply) {
            arrRemoveItems(allReqs, r => r.matchReqId === checkReq.matchReqId);
            //当前匹配数据是否也加入到匹配结果里(房间招人匹配就不需要加入)
            let selfReqResult: IMatchRequestPlayerResults = {
                matchReqId: checkReq.matchReqId,
                matchPlayerResults: [],
            };
            if (checkReq.matchFromType === EMatchFromType.Player
                || checkReq.matchFromType === EMatchFromType.RoomAllPlayers) {
                //检测请求是来源玩家,则把玩家id也加入到结果中
                //没有队伍,直接用玩家id生成结果
                selfReqResult.matchPlayerResults
                    .push(...checkReq.matchFromInfo.playerIds.map(pid => { return { playerId: pid } }));
            }
            matchRequestPlayerResults.splice(0, 0, selfReqResult);
        }
        return {
            matchRequestPlayerResults,
        };
    }

    /**请求按开始匹配时间排序,早的在前面*/
    protected sortByReqTime(reqs: IMatchRequest[]) {
        reqs.sort((a, b) => {
            //返回小于0则a在前
            return a.startMatchTime - b.startMatchTime;
        });
    }

    onNewMatchReq(currMatchReq: IMatchRequest, allReqs: IMatchRequest[]): IMatcherExecResult {
        return this.matchAllReqs(allReqs);
    }
    onPollMatcherReqs(allReqs: IMatchRequest[]): IMatcherExecResult {
        return this.matchAllReqs(allReqs);
    }

}