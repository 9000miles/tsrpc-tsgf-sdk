/*!
 * TSGF SDK For Browser v1.4.0
 * -----------------------------------------
 * Copyright (c) zum.
 * MIT License
 * https://gitee.com/fengssy/ts-gameframework
 */
import { HttpClient, WsClient } from 'tsrpc-browser';

/**
 * 获取当前实现的SDK供应商实现
 */
function buildSDKProvider() {
    return {
        env: {
            getHttpClient: (proto, options) => {
                return new HttpClient(proto, options);
            },
            getWsClient: (proto, options) => {
                return new WsClient(proto, options);
            },
        }
    };
}

export { buildSDKProvider };
