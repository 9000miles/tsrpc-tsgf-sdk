import { IGameServerInfo } from "../../hallClient/Models";
import { EPrivateRoomJoinMode, ITeamPlayerIds } from "../../tsgf/room/IRoomInfo";
import { arrRemoveItems } from "../../tsgf/Utils";


/**基础的房间注册信息*/
export interface IRoomRegInfo {
    /**所属应用id*/
    appId: string;
    /**房间ID，全局唯一*/
    roomId: string;
    /**房间名称*/
    roomName: string;
    /**房间类型自定义字符串*/
    roomType?: string;
    /**所属玩家ID*/
    ownerPlayerId: string;
    /**房间最大玩家数*/
    maxPlayers: number;
    /**房间当前空位数(可加多少个玩家)*/
    emptySeats: number;
    /**创建时间(毫秒时间戳)*/
    createTime: number;
    /**到期时间(毫秒时间戳), 到了将被清理,以至于无法加入新房间,在线玩家不会受影响*/
    expireTime: number;
    /**是否私有房间，私有房间不参与匹配*/
    isPrivate: 0 | 1;
    /**私有房间的加入模式*/
    privateRoomJoinMode?: EPrivateRoomJoinMode;
    /**如果私有房间的加入模式是密码, 则必填本密码字段*/
    privateRoomPassword?: string;
    /**当前队伍玩家id列表,如果没有队伍则[{teamId='',playerIds:[...所有玩家id都在这...]}]*/
    teamsPlayerIds: ITeamPlayerIds[];
    /**挂在哪个游戏服务器下（服务器节点id）*/
    gameServerNodeId: string;
}


/**
 * 给队伍玩家数组添加另一个队伍玩家数组, 结果放在 targetTeams 中
 *
 * @param targetTeams
 * @param add
 */
export function teamPlayerIdsAdd(targetTeams: ITeamPlayerIds[], add: ITeamPlayerIds[]) {
    for (let team of add) {
        let targetTeam = targetTeams.find(t => t.teamId === team.teamId ?? '');
        if (!targetTeam) {
            targetTeam = { teamId: team.teamId ?? '', playerIds: team.playerIds.slice() };
            targetTeams.push(targetTeam);
        } else {
            for (let appPid of team.playerIds) {
                if (!targetTeam.playerIds.includes(appPid)) {
                    targetTeam.playerIds.push(appPid);
                }
            }
        }
    }
}
/**
 * 给队伍玩家数组添加一个单个队伍玩家, 结果放在 targetTeams 中
 *
 * @param targetTeams
 * @param addTeamId 如果无队伍则会使用''
 * @param addPlayerId
 */
export function teamPlayerIdsAddSingle(targetTeams: ITeamPlayerIds[], addPlayerId: string, addTeamId: string | undefined) {
    if (!addTeamId) addTeamId = '';
    let targetTeam = targetTeams.find(t => t.teamId === addTeamId);
    if (!targetTeam) {
        targetTeam = { teamId: addTeamId, playerIds: [addPlayerId] };
        targetTeams.push(targetTeam);
    } else {
        if (!targetTeam.playerIds.includes(addPlayerId)) {
            targetTeam.playerIds.push(addPlayerId);
        }
    }
}

/**
 * 从一个队伍玩家数组中移除另一个队伍玩家数组的数据
 *
 * @param targetTeams
 * @param subtract
 * @param removeEmptyTeam=true
 */
export function teamPlayerIdsSubtract(targetTeams: ITeamPlayerIds[], subtract: ITeamPlayerIds[], removeEmptyTeam: boolean = true) {
    for (let team of subtract) {
        let targetTeamI = targetTeams.findIndex(t => t.teamId === team.teamId ?? '');
        let targetTeam = targetTeams[targetTeamI];
        if (targetTeam) {
            for (let appPid of team.playerIds) {
                arrRemoveItems(targetTeam.playerIds, p => p === appPid);
            }
            if (removeEmptyTeam && targetTeam.playerIds.length <= 0) {
                //这个队伍下的玩家都没了直接删除
                targetTeams.splice(targetTeamI, 1);
            }
        }
    }
}
/**
 *从一个队伍玩家数组中移除一个单个的队伍玩家
 *
 * @param targetTeams
 * @param subtractTeamId 如果无队伍则会使用''
 * @param subtractPlayerId
 * @param removeEmptyTeam=true
 */
export function teamPlayerIdsSubtractSingle(targetTeams: ITeamPlayerIds[], subtractPlayerId: string, subtractTeamId: string | undefined, removeEmptyTeam: boolean = true) {
    let targetTeamI = targetTeams.findIndex(t => t.teamId === subtractTeamId ?? '');
    let targetTeam = targetTeams[targetTeamI];
    if (targetTeam) {
        arrRemoveItems(targetTeam.playerIds, p => p === subtractPlayerId);
        if (removeEmptyTeam && targetTeam.playerIds.length <= 0) {
            //这个队伍下的玩家都没了直接删除
            targetTeams.splice(targetTeamI, 1);
        }
    }
}