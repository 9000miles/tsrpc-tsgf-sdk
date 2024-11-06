
import { BaseHttpClient, BaseHttpClientOptions, BaseWsClient, BaseWsClientOptions } from "tsrpc-base-client";
import { BaseServiceType, ServiceProto } from "tsrpc-proto";

/**
 * 环境相关接口
 */
export interface IEnvProvider {
    /**
     * 当前平台实现的Http客户端封装
     * @param proto 
     * @param options 
     * @returns http client 
     */
    getHttpClient:
    <ServiceType extends BaseServiceType>(proto: ServiceProto<ServiceType>, options?: Partial<BaseHttpClientOptions>)
        => BaseHttpClient<ServiceType>;
    /**
     * 当前平台实现的websocket客户端封装
     * @param proto 
     * @param options 
     * @returns websocket client 
     */
    getWsClient:
    <ServiceType extends BaseServiceType>(proto: ServiceProto<ServiceType>, options?: Partial<BaseWsClientOptions>)
        => BaseWsClient<ServiceType>;
}

/**
 * 全局供应商接口定义
 */
export interface ISDKProvider {
    /**环境实现供应商*/
    env: IEnvProvider | null;
}

/**获取全局供应商实现*/
export function getGlobalSDKProvider(): ISDKProvider | undefined{
    return globalThis.tsgfSDKProvider;
}

declare module globalThis {
    /**全局供应商实现*/
    let tsgfSDKProvider: ISDKProvider;
}

/**
 * 初始化全局供应商实现
 * @param provider 
 */
export function initSDKProvider(provider: ISDKProvider) {
    globalThis.tsgfSDKProvider = provider;
}