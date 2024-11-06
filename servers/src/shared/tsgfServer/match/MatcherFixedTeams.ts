import { EMatchFromType, ISingleMatcherParams, IMatchFromPlayer, IMatchParams, IFixedTeamsMatcherParams } from "../../tsgf/match/Models";
import { ErrorCodes, IResult, Result } from "../../tsgf/Result";
import { ITeamInfo } from "../../tsgf/room/IRoomInfo";
import { arrGroup, arrUpdateItems, arrRemoveItems, arrSum, arrWinner } from "../../tsgf/Utils";
import { IMatcher } from "./IMatcher";
import { IMatchRequest, IMatcherExecResult, IMatcherExecResultJoinRoom, IMatcherExecResultCreateRoom, IMatchFromRoomJoinUsOnServer, IMatchRequestPlayerResults, IMatchRequestFromPlayer } from "./Models";


/**固定队伍匹配器 的匹配属性*/
export interface IFixedTeamsMatcherParamsOnServer extends IFixedTeamsMatcherParams {
    /**只要新匹配进来, 匹配器都会初始化好, 所以匹配中可以直接使用*/
    fixedTeamList: ITeamInfo[];
}

/**固定数量的组队匹配器
 * 匹配器参数: 客户端用IFixedTeamsMatcherParams, 服务端用:IFixedTeamsMatcherParamsOnServer
*/
export class MatcherFixedTeams implements IMatcher {
    public matcherKey: string = 'FixedTeams';

    protected matchAllReqs(allReqs: IMatchRequest[]): IMatcherExecResult {

        let joinRoomResults: IMatcherExecResultJoinRoom[] = [];
        let createRoomResults: IMatcherExecResultCreateRoom[] = [];

        let roomJoinUsReqs: IMatchRequest[] = [];
        let playerReqs: IMatchRequestFromPlayer[] = [];

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
            let matchReqs: IMatchRequestFromPlayer[] = playerReqs.filter(r => r.matchReqGroupKey === checkReq.matchReqGroupKey);
            if (matchReqs.length > 0) {
                let roomTeamPCount = fromInfo.teamsPlayerIds.map(t => t.playerIds.length);
                let ret = this.matchPlayerReqs(playerReqs, checkReq, roomTeamPCount, false, matchReqs);
                if (ret.matchRequestPlayerResults && ret.matchRequestPlayerResults.length > 0) {
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
        let groupReqs = arrGroup(playerReqs, r => r.matchReqGroupKey);
        for (let group of groupReqs) {
            let reqs = group[1];
            if (reqs.length <= 0) continue;
            //因为同分组下,固定队伍的配置是一致的,只要拿第一个就能获取要求的最小玩家数
            let params = reqs[0].matcherParams as IFixedTeamsMatcherParamsOnServer;
            let pTeams = params.fixedTeamList;
            let minPCount = arrSum(pTeams, t => t.minPlayers);
            //未被匹配列表
            let waitReqs = reqs;
            //整个分组只要剩余匹配数满足最少玩家数,则会继续匹配
            while (waitReqs.length > 0 && arrSum(waitReqs, r => r.matchFromInfo.playerIds.length) >= minPCount) {
                let checkReq = waitReqs[0];
                let roomTeamPCount = pTeams.map(t => 0);
                let ret = this.matchPlayerReqs(waitReqs, waitReqs[0], roomTeamPCount, false, waitReqs.slice());
                if (!ret.matchRequestPlayerResults || ret.matchRequestPlayerResults.length <= 0) {
                    //任何一次匹配没结果,直接停止继续匹配了,后续大概率也是没结果了,等下次轮询
                    break;
                }
                //匹配成功!
                let roomJoinUsMatch = false;
                let matchPlayerCount = arrSum(ret.matchRequestPlayerResults, r => r.matchPlayerResults.length);
                if (matchPlayerCount < checkReq.maxPlayers) {
                    //如果匹配玩家没满员,则根据配置来决定是否开启招人匹配
                    roomJoinUsMatch = params?.resultsContinueRoomJoinUsMatch === true;
                }
                createRoomResults.push({
                    createRoomPara: {
                        roomName: '系统匹配的房间',
                        ownerPlayerId: '',
                        maxPlayers: checkReq.maxPlayers,
                        isPrivate: false,
                        matcherKey: this.matcherKey,
                        fixedTeamInfoList: pTeams.slice(),
                    },
                    matchRequestPlayerResults: ret.matchRequestPlayerResults.slice(),
                    roomJoinUsMatch: roomJoinUsMatch,
                });
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
     * @param allReqs 总匹配请求(匹配中的将从中移除)
     * @param checkReq 作为匹配主体
     * @param checkReqTeamPlayers 匹配主体的各队伍玩家人数(即已经有的个队伍玩家数量),长度和固定队伍长度一致
     * @param checkReqSelfApply 匹配结果是否需要包含checkReq(同时移除)
     * @param matchPlayerReqs 来自玩家的匹配请求列表, 从中提取中可以匹配成功的请求, 并且本列表需要是一个副本
     */
    protected matchPlayerReqs(allReqs: IMatchRequest[],
        checkReq: IMatchRequest, checkReqTeamPlayers: number[], checkReqSelfApply: boolean,
        matchPlayerReqs: IMatchRequestFromPlayer[])
        : {
            matchRequestPlayerResults?: IMatchRequestPlayerResults[],
        } {

        this.sortByReqTime(matchPlayerReqs);
        let matchRequestPlayerResults: IMatchRequestPlayerResults[] = [];

        //匹配器参数(匹配器收到时已经初始化过,确保有不为空)
        let params = checkReq.matcherParams as IFixedTeamsMatcherParamsOnServer;
        let remainPCount: number[] = checkReqTeamPlayers.slice();
        arrUpdateItems(remainPCount, (curr, i) => params.fixedTeamList[i].maxPlayers - curr);

        let hasRemain = false;

        //优先筛选出刚好符合各队伍的剩余人数
        let waitFullMatchReqs = matchPlayerReqs.slice();
        let fullMatchResult: IMatchRequestPlayerResults[] = [];
        for (let i = 0; i < remainPCount.length; i++) {
            if (remainPCount[i] <= 0) continue;//如果当前队伍直接满员,则忽略
            //找到玩家数量和剩下数量一致的匹配请求
            let matchReq = waitFullMatchReqs.find(r => r.matchFromInfo.playerIds.length === remainPCount[i]);
            if (!matchReq) {
                //没找到,跳过本队伍,并标记还有没满的
                hasRemain = true;
                continue;
            }
            fullMatchResult.push({
                matchReqId: matchReq.matchReqId,
                matchPlayerResults: matchReq.matchFromInfo.playerIds
                    .map(pid => { return { playerId: pid, teamId: params.fixedTeamList[i].id } }),
            });
            arrRemoveItems(waitFullMatchReqs, r => r.matchReqId === matchReq!.matchReqId);
        }
        if (!hasRemain) {
            //完整匹配成功,刚好所有队伍都匹配max了!, 将结果设置到总结果里
            matchRequestPlayerResults.push(...fullMatchResult);
            arrRemoveItems(matchPlayerReqs, r => !!fullMatchResult.find(re=>re.matchReqId=== r.matchReqId));
        }

        if (hasRemain) {
            //还有没满的, 继续尝试组合匹配是否有刚好的
            let fullTeamCounts = params.fixedTeamList.map(t => { return { min: t.maxPlayers, max: t.maxPlayers } });
            hasRemain = this.extractTeamCombination(params, remainPCount, fullTeamCounts, matchPlayerReqs,
                matchRequestPlayerResults).hasRemain;
        }

        if (hasRemain) {
            //还有没满的, 继续尝试组合匹配符合最低玩家数量要求的
            let minTeamCounts = params.fixedTeamList.map(t => { return { min: t.minPlayers, max: t.maxPlayers } });
            hasRemain = this.extractTeamCombination(params, remainPCount, minTeamCounts, matchPlayerReqs,
                matchRequestPlayerResults).hasRemain;
            if (!hasRemain) {
                //满足最低要求了,则开始尽量推满!
                for (let teamIndex = 0; matchPlayerReqs.length > 0 && teamIndex < remainPCount.length; teamIndex++) {
                    if (remainPCount[teamIndex] <= 0) continue;//如果当前队伍直接满员,则忽略
                    //遍历剩余匹配,推满本队玩家
                    for (let i = 0; remainPCount[teamIndex] > 0 && i < matchPlayerReqs.length; i++) {
                        let req = matchPlayerReqs[i];
                        let pCount = req.matchFromInfo.playerIds.length;
                        if (pCount > remainPCount[teamIndex]) {
                            //这个匹配包含的玩家数超过剩下的,跳过不要
                            continue;
                        }
                        remainPCount[teamIndex] -= pCount;
                        matchPlayerReqs.splice(i, 1);//删掉匹配上的
                        i--;
                        matchRequestPlayerResults.push({
                            matchReqId: req.matchReqId,
                            matchPlayerResults: req.matchFromInfo.playerIds
                                .map(pid => { return { playerId: pid, teamId: params.fixedTeamList[teamIndex].id } }),
                        });
                    }
                }
            }
        }

        if (hasRemain) {
            //固定队伍有最少玩家没满足的,则本次匹配失败
            return {
                matchRequestPlayerResults: undefined,
            };
        }

        //这里就匹配成功了

        if (checkReqSelfApply) {
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
            //当前这个插入到匹配结果最前面
            matchRequestPlayerResults.splice(0, 0, selfReqResult);
        }

        //统一从所有匹配请求中移除匹配成功的
        arrRemoveItems(allReqs, r => !!matchRequestPlayerResults.find(re => re.matchReqId === r.matchReqId));
        return {
            matchRequestPlayerResults,
        };
    }

    /**
     *提取匹配列表中符合数量范围的匹配,成功则加入到结果列表,并返回是否还有剩余一定要填的空位
     * 失败则不会操作结果和传入的待匹配列表
     * @protected
     * @param params
     * @param remainPCount
     * @param remainRange
     * @param matchPlayerReqs
     * @param matchRequestPlayerResults
     * @returns
     */
    protected extractTeamCombination(params: IFixedTeamsMatcherParamsOnServer,
        remainPCount: number[], remainRange: { min: number, max: number }[],
        matchPlayerReqs: IMatchRequestFromPlayer[], matchRequestPlayerResults: IMatchRequestPlayerResults[])
        : {
            hasRemain: boolean,
        } {
        //复制一个副本,暂时在这里操作,最后如果成功,才移除传入的匹配数组
        let waitReqs = matchPlayerReqs.slice();
        //结果对象临时放,最终成功才追加到传入的结果数组
        let tmpResults: IMatchRequestPlayerResults[] = [];
        //是否还有空的
        let hasRemain = false;
        let tmpRemainPCount = remainPCount.slice();
        for (let teamIndex = 0; teamIndex < tmpRemainPCount.length; teamIndex++) {
            let min = remainRange[teamIndex].min;
            let max = remainRange[teamIndex].max;
            let maxRemain = max - min;

            if (tmpRemainPCount[teamIndex] <= maxRemain) continue;//如果当前队伍直接满员,则忽略
            if (waitReqs.length <= 0) {
                hasRemain = true;
                break;
            }


            let startRemain = tmpRemainPCount[teamIndex];
            let reqs = waitReqs.slice();//匹配请求列表复制一份,方便尝试完没发现合适的组合就跳过
            let startI = 0;
            let matchReqIds: string[] = [];
            /*(性能考虑,不做组合算法, 实现一个简单的顺序组合)
                遍历规则:
                遍历所有队伍
                    所有匹配请求,分别拿其中一个元素作为起始,剩余位置重新算
                        然后n次顺序遍历剩下的,够扣则一直叠加,看是否刚好有满的
            */
            do {
                //本次用startI作为起始量
                let currI = startI++;
                let startReq = reqs[currI];
                matchReqIds = [startReq.matchReqId];
                //拿currI作为起始,然后重新开始算剩余位置,看能否组合出来
                tmpRemainPCount[teamIndex] = startRemain - startReq.matchFromInfo.playerIds.length;
                if (tmpRemainPCount[teamIndex] < 0) {
                    //这个请求的玩家数量已经超出剩余要的了,跳过这个起始
                    continue;
                }
                //这么刚好不用组合,第一个就符合了
                if (tmpRemainPCount[teamIndex] <= maxRemain) break;

                //最多遍历剩余位置的遍数
                for (let c = 0, count = tmpRemainPCount[teamIndex]; c < count; c++) {
                    let hasCon = false;
                    //开始遍历除了startI位置的其他匹配
                    for (let i = 0; i < reqs.length && tmpRemainPCount[teamIndex] > maxRemain; i++) {
                        let req = reqs[i];
                        if (req.matchReqId === startReq.matchReqId) continue;
                        let pCount = req.matchFromInfo.playerIds.length;
                        if (pCount > tmpRemainPCount[teamIndex]) {
                            //这个匹配包含的玩家数超过剩下的,跳过不要
                            continue;
                        }
                        //没超过,则扣掉剩下位置
                        hasCon = true;//标记当前有抵扣
                        matchReqIds.push(req.matchReqId);
                        tmpRemainPCount[teamIndex] -= pCount;
                        reqs.splice(i, 1);//删掉匹配上的
                        i--;
                    }
                    //遍历完成,发现没任何一个可以抵扣的了, 或者成功完整匹配的, 则停止
                    if (!hasCon || tmpRemainPCount[teamIndex] <= maxRemain) break;
                }
                //成功组合上了!
                if (tmpRemainPCount[teamIndex] <= maxRemain) break;

            } while (tmpRemainPCount[teamIndex] > maxRemain && startI < reqs.length);

            if (tmpRemainPCount[teamIndex]>=0 && tmpRemainPCount[teamIndex] <= maxRemain) {
                //这个队伍组合满了! 清理数据
                arrRemoveItems(waitReqs, r => {
                    if (matchReqIds.includes(r.matchReqId)) {
                        tmpResults.push({
                            matchReqId: r.matchReqId,
                            matchPlayerResults: r.matchFromInfo.playerIds
                                .map(pid => { return { playerId: pid, teamId: params.fixedTeamList[teamIndex].id } }),
                        });
                        return true;
                    }
                    return false;
                });
            } else {
                //可惜还是没匹配满
                hasRemain = true;
            }
        }

        if (!hasRemain) {
            //最后所有队伍都没空位了,则将结果推到外部
            arrRemoveItems(matchPlayerReqs, r => !!tmpResults.find(e => e.matchReqId === r.matchReqId));
            matchRequestPlayerResults.push(...tmpResults);
            arrUpdateItems(remainPCount, (old, i) => tmpRemainPCount[i]);
        }
        return {
            hasRemain,
        };
    }

    /**请求按开始匹配时间排序,早的在前面*/
    protected sortByReqTime(reqs: IMatchRequest[]) {
        reqs.sort((a, b) => {
            //返回小于0则a在前
            return a.startMatchTime - b.startMatchTime;
        });
    }

    procNewMatchReq(newMatchReq: IMatchRequest): IResult<null> {
        //新匹配进来先检查参数和初始化参数!
        let params = newMatchReq.matcherParams as IFixedTeamsMatcherParamsOnServer;
        let teams = newMatchReq.teamParams;
        if (!teams) {
            return Result.buildErr('固定队伍匹配器必须传入队伍参数!', ErrorCodes.ParamsError);
        }
        let fixedTeamList: ITeamInfo[] | null = null;
        if (teams.fixedTeamInfoList && teams.fixedTeamInfoList.length) {
            //指定的队伍信息列表
            fixedTeamList = teams.fixedTeamInfoList.slice();
        } else if (teams.fixedTeamCount) {
            //指定固定的队伍数量来生成
            fixedTeamList = [];
            for (let i = 0; i < teams.fixedTeamCount; i++) {
                let id = (i + 1).toString();
                fixedTeamList.push({
                    id: (i + 1).toString(),
                    name: '队伍' + id,
                    minPlayers: teams.fixedTeamMinPlayers ?? 1,
                    maxPlayers: teams.fixedTeamMaxPlayers ?? 9,
                });
            }
        }
        if (!fixedTeamList) {
            return Result.buildErr('匹配器参数中没有固定队伍的相关配置!', ErrorCodes.ParamsError);
        }

        if (!params) {
            params = {
                fixedTeamList: fixedTeamList,
                resultsContinueRoomJoinUsMatch: false,
            };
            newMatchReq.matcherParams = params;
        } else {
            params.fixedTeamList = fixedTeamList;
        }

        return Result.buildSucc(null);

    }

    onNewMatchReq(newMatchReq: IMatchRequest, allReqs: IMatchRequest[]): IMatcherExecResult {
        let procRet = this.procNewMatchReq(newMatchReq);
        if (!procRet.succ) {
            return {
                hasResult: true,
                resultErrCode: procRet.code,
                resultErrMsg: procRet.err,
            };
        }
        return this.matchAllReqs(allReqs);
    }
    onPollMatcherReqs(allReqs: IMatchRequest[]): IMatcherExecResult {
        return this.matchAllReqs(allReqs);
    }

}