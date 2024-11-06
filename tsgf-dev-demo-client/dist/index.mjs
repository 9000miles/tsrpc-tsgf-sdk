/*!
 * TSGF Dev Demo Client v1.4.0
 * -----------------------------------------
 * Copyright (c) zum.
 * MIT License
 * https://gitee.com/fengssy/ts-gameframework
 */
import { AHttpClient, Result } from 'tsgf-sdk';

const serviceProto = {
    "version": 1,
    "services": [
        {
            "id": 0,
            "name": "PlayerAuth",
            "type": "api"
        }
    ],
    "types": {
        "PtlPlayerAuth/ReqPlayerAuth": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "showName",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "openId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlPlayerAuth/ResPlayerAuth": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "playerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "playerToken",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        }
    }
};

/**demo服务器的客户端封装*/
class DemoClient extends AHttpClient {
    constructor(serverUrl) {
        super(serviceProto, {
            server: serverUrl,
            json: true,
            logger: console,
        });
    }
    /**
     * 玩家使用自定义的用户ID和昵称去TSGF认证, 本质是模拟接入应用自己的用户系统对接TSGF的玩家体系
     * @param playerOpenId 玩家唯一ID,自定义
     * @param playerShowName 玩家显示名,自定义
     */
    async playerAuth(playerOpenId, playerShowName) {
        var _a;
        let para = {
            showName: playerShowName,
            openId: playerOpenId,
        };
        const ret = await this.client.callApi("PlayerAuth", para);
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_a = ret.err.code) !== null && _a !== void 0 ? _a : 1));
        }
        return Result.buildSucc(ret.res);
    }
}

export { DemoClient };
