

import { BaseServiceType } from "tsrpc-proto";
import { ErrorCodes, IResult, Result } from "../../src/tsgf/Result";
import { IAppEncryptRequest, IAppEncryptRequestT, IBaseEncryptRequestData } from "../../src/tsgf/apiCrypto/Models";
import CryptoJS from 'crypto-js';
import { assert } from "chai";
import { ResAuthorize } from "../../src/hallClient/protocols/PtlAuthorize";
import { Game } from "../../src/Game";
import { Room } from "../../src/Room";
import { GroupRoom } from "../../src/GroupRoom";
import { HallClient } from "../../src/hallClient/HallClient";
import { initSDK } from "../../src/SDK";
import { buildSDKProvider } from "./env";

class ApiHelper {
    /**
     * des加密，ECB模式，PKCS7填充，密钥用UTF8提取前8个字节，输入字符串使用UTF8编码解析，输出加密后的base64编码字符串
     *
     * @public
     * @param input 要加密的字符串（明文）
     * @param strKey 长度超过8个字节即可，只会取前8个字节
     * @returns
     */
    public static desEncryptECB_PKCS7_Base64(input: string, strKey: string): string {
        //转为utf8字节,并只取前8个字节
        let keyBytes = CryptoJS.lib.WordArray.create(CryptoJS.enc.Utf8.parse(strKey).words.slice(0, 8), 8);
        let inputBytes = CryptoJS.enc.Utf8.parse(input);
        let enResult = CryptoJS.DES.encrypt(inputBytes, keyBytes, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        let retStr = enResult.ciphertext.toString(CryptoJS.enc.Base64);

        return retStr;
    }
    /**
     * des解密，ECB模式，PKCS7填充，密钥用UTF8提取前8个字节，输入字符串使用UTF8编码解析，输出加密后的base64编码字符串
     *
     * @public
     * @param inputBase64 密文（base64格式）
     * @param strKey
     * @returns
     */
    public static desDecryptECB_PKCS7_Base64(inputBase64: string, strKey: string): string {
        //转为utf8字节,并只取前8个字节
        let keyBytes = CryptoJS.lib.WordArray.create(CryptoJS.enc.Utf8.parse(strKey).words.slice(0, 8), 8);
        let inputBytes = CryptoJS.enc.Base64.parse(inputBase64);
        let cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: inputBytes,
        });
        let enResult = CryptoJS.DES.decrypt(cipherParams, keyBytes, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });
        let retStr = enResult.toString(CryptoJS.enc.Utf8);

        return retStr;
    }
    /**
     * 调用AppCrypto协议的加密接口
     *
     * @param appId
     * @param appSecret
     * @param reqData
     * @returns
     */
    public static appCryptoEncrypt(appId: string, appSecret: string, reqData: any)
        : IAppEncryptRequest {

        reqData.ts = Date.now();
        let json = JSON.stringify(reqData);
        let cText = ApiHelper.desEncryptECB_PKCS7_Base64(json, appSecret);
        let req: IAppEncryptRequest = {
            appId: appId,
            ciphertext: cText,
        };
        return req;
    }

}

initSDK(buildSDKProvider());

export const hallServerUrl = 'http://127.0.0.1:7100';
const hallClient = new HallClient(hallServerUrl);

export interface sdkApi {
    game: Game;
    room: Room;
    group: GroupRoom;
    
    playerId: string;
    playerToken: string;
    dispose(): Promise<void>;
}

/**模拟应用在服务端授权拿到token后, 初始化SDK客户端*/
export async function initGame(openId: string, showName: string): Promise<IResult<sdkApi>> {
    let ret = await authPlayerToken(openId, showName);
    if (!ret.succ) return Result.transition(ret);

    let game = new Game();
    let room = new Room(game);
    let group = new GroupRoom(game, room);

    game.init(hallServerUrl, ret.data.playerId, ret.data.playerToken);
    return Result.buildSucc({
        game, room, group,
        playerId: ret.data.playerId,
        playerToken: ret.data.playerToken,
        async dispose(): Promise<void> {
            await group.dispose();
            await room.dispose();
            await game.dispose();
        },
    });
}

/**模拟应用在服务端获取玩家授权*/
export async function authPlayerToken(openId: string, showName: string): Promise<IResult<ResAuthorize>> {
    let req1 = ApiHelper.appCryptoEncrypt("default", "FDGWPRET345-809RGKFER43SKGF", {
        openId: openId,
        showName: showName,
        authTokenDay: 1,
    });
    const ret1 = await hallClient.client.callApi("Authorize", req1);
    if (ret1.isSucc) return Result.buildSucc(ret1.res);
    return Result.buildErr(ret1.err?.message, (ret1.err?.code ?? 1) as number);
}