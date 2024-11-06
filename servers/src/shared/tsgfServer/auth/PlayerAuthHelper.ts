import { v4 } from "uuid";
import { ErrorCodes, IResult, Result } from "../../tsgf/Result";
import { GetRedisClient, IRedisClient } from "../redisHelper";
import { buildGuid, buildPlayerId } from "../ServerUtils";
import { IPlayerAuthInfo } from "./Models";

/**玩家认证工具, 使用本模块需要初始化*/
export class PlayerAuthHelper {

    /**需要全局初始化时设置*/
    private static getRedisClient: GetRedisClient;
    private static openIdCheckRegex = /^[0-9a-zA-Z\-_]+$/ig;
    private static oneDaySec = 24 * 60 * 60;


    public static init(getRedisClient: GetRedisClient) {
        PlayerAuthHelper.getRedisClient = getRedisClient;
    }

    private static buildLastPlayerTokenKey(playerId: string) {
        return `PlayerAuth:playerIdToLastToken:playerId_${playerId}`;
    }
    private static buildPlayerKey(playerToken: string) {
        return `PlayerAuth:Player:token_${playerToken}`;
    }

    /**
     * 玩家认证,成功则返回playerToken
     *
     * @public
     * @param appId
     * @param openId
     * @param showName
     * @param authTokenDay 授权有效天数
     */
    public static async authorize(appId: string, openId: string, showName: string, authTokenDay: number): Promise<IResult<IPlayerAuthInfo>> {
        if (!appId) {
            return Result.buildErr('错误的参数 appId');
        }
        if (!openId) {
            return Result.buildErr('错误的参数 playerId');
        }
        if (openId.match(PlayerAuthHelper.openIdCheckRegex)?.length === 2) {
            return Result.buildErr('参数 openId 只能由数字、字母、下划线、连接线组成');
        }
        if (!showName) {
            return Result.buildErr('错误的参数 showName');
        }
        if (authTokenDay <= 0) {
            return Result.buildErr('错误的参数 authTokenDay');
        }

        //正常应该走数据库，这里简单哈希一下
        let playerId = buildPlayerId(appId, openId);

        let redisClient = await PlayerAuthHelper.getRedisClient();
        let redisLastPlayerTokenKey = PlayerAuthHelper.buildLastPlayerTokenKey(playerId);
        let oldPToken = await redisClient.getString(redisLastPlayerTokenKey);
        if (oldPToken) {
            //存在之前授权的token
            let oldPlayerRedisKey = PlayerAuthHelper.buildPlayerKey(oldPToken);
            let oldPlayer = await redisClient.getObject<IPlayerAuthInfo>(oldPlayerRedisKey);
            if (oldPlayer) {
                oldPlayer.invalid = true;
                //重新设置进去，并且设置redis一天后过期
                await redisClient.setObject(oldPlayerRedisKey, oldPlayer, PlayerAuthHelper.oneDaySec);
            }
        }
        let playerToken = v4();
        let exSec = authTokenDay * PlayerAuthHelper.oneDaySec;
        let authInfo: IPlayerAuthInfo = {
            playerId: playerId,
            appId: appId,
            openId: openId,
            showName: showName,
            playerToken: playerToken,
            invalid: false,
            expireDate: Date.now() + exSec * 1000
        };
        //redis里的多放一天
        let redisExSec = exSec + PlayerAuthHelper.oneDaySec;
        let redisPlayerKey = PlayerAuthHelper.buildPlayerKey(playerToken);
        await redisClient.setObject(redisPlayerKey, authInfo, redisExSec);
        await redisClient.setString(redisLastPlayerTokenKey, playerToken, exSec + redisExSec);
        return Result.buildSucc(authInfo);
    }


    /**
     * 身份认证，成功则返回玩家对象
     *
     * @public
     * @param playerToken
     * @returns
     */
    public static async verification(playerToken: string): Promise<IResult<IPlayerAuthInfo>> {
        let redisKey = PlayerAuthHelper.buildPlayerKey(playerToken);
        let player = await (await PlayerAuthHelper.getRedisClient()).getObject<IPlayerAuthInfo>(redisKey);
        if (!player || !player.playerToken) {
            return Result.buildErr('token过期或不存在！', ErrorCodes.AuthPlayerTokenNotFound);
        }
        if (player.invalid) {
            return Result.buildErr('token已经失效！', ErrorCodes.AuthPlayerTokenInvalid);
        }
        if (player.expireDate < Date.now()) {
            return Result.buildErr('token已经过期！', ErrorCodes.AuthPlayerTokenExpire);
        }
        return Result.buildSucc(player);
    }

    /**
     * 使用id+token进行身份认证，成功则返回玩家对象
     *
     * @public
     * @param playerId
     * @param playerToken
     * @param updateShowName 可更新玩家显示名
     * @returns
     */
    public static async verificationFromId(playerId: string, playerToken: string, updateShowName?: string): Promise<IResult<IPlayerAuthInfo>> {

        let redisClient = await PlayerAuthHelper.getRedisClient();
        let redisLastPlayerTokenKey = PlayerAuthHelper.buildLastPlayerTokenKey(playerId);
        let oldPToken = await redisClient.getString(redisLastPlayerTokenKey);
        if (oldPToken !== playerToken) {
            return Result.buildErr('token已失效！', ErrorCodes.AuthPlayerTokenInvalid);
        }

        let redisKey = PlayerAuthHelper.buildPlayerKey(playerToken);
        let playerAuth = await redisClient.getObject<IPlayerAuthInfo>(redisKey);
        if (!playerAuth || !playerAuth.playerToken) {
            return Result.buildErr('token过期或不存在！', ErrorCodes.AuthPlayerTokenNotFound);
        }
        if (playerAuth.invalid) {
            return Result.buildErr('token已经失效！', ErrorCodes.AuthPlayerTokenInvalid);
        }
        if (playerAuth.expireDate < Date.now()) {
            return Result.buildErr('token已经过期！', ErrorCodes.AuthPlayerTokenExpire);
        }

        if (updateShowName) {
            //有更新玩家信息，则更新进redis
            playerAuth.showName = updateShowName;
            await redisClient.setObject(redisKey, playerAuth, playerAuth.expireDate - Date.now());
        }

        return Result.buildSucc(playerAuth);
    }

    /**
     * 更新玩家的当前所在房间id
     * @param playerToken 
     * @param [roomId] 
     * @returns  
     */
    public static async updatePlayerCurrRoomId(playerToken: string, roomId?: string) {
        let redisClient = await PlayerAuthHelper.getRedisClient();
        let redisKey = PlayerAuthHelper.buildPlayerKey(playerToken);
        let playerAuth = await redisClient.getObject<IPlayerAuthInfo>(redisKey);
        if (!playerAuth) return;
        playerAuth.currRoomId = roomId;
        await redisClient.setObject(redisKey, playerAuth, playerAuth.expireDate - Date.now());
    }

}