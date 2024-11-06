


import { HttpClient, WsClient } from "tsrpc";
import { ISDKProvider } from "../../src/tsgf/Provider";

/**
 * 获取当前实现的SDK供应商实现
 */
export function buildSDKProvider(): ISDKProvider {
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
