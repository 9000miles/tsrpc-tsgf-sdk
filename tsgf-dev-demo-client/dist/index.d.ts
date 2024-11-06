/*!
 * TSGF Dev Demo Client v1.4.0
 * -----------------------------------------
 * Copyright (c) zum.
 * MIT License
 * https://gitee.com/fengssy/ts-gameframework
 */
import { AHttpClient } from 'tsgf-sdk';
import { IResult } from 'tsgf-sdk';

/**demo服务器的客户端封装*/
export declare class DemoClient extends AHttpClient<ServiceType> {
    constructor(serverUrl: string);
    /**
     * 玩家使用自定义的用户ID和昵称去TSGF认证, 本质是模拟接入应用自己的用户系统对接TSGF的玩家体系
     * @param playerOpenId 玩家唯一ID,自定义
     * @param playerShowName 玩家显示名,自定义
     */
    playerAuth(playerOpenId: string, playerShowName: string): Promise<IResult<{
        playerId: string;
        playerToken: string;
    }>>;
}

/**
 * 模拟应用简单实现用户体系对接玩家体系
 */
declare interface ReqPlayerAuth {
    showName: string;
    openId: string;
}

declare interface ResPlayerAuth {
    playerId: string;
    playerToken: string;
}

declare interface ServiceType {
    api: {
        "PlayerAuth": {
            req: ReqPlayerAuth;
            res: ResPlayerAuth;
        };
    };
    msg: {};
}

export { }
