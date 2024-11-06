
import { BaseHttpClient, BaseHttpClientOptions, BaseWsClient, BaseWsClientOptions } from "tsrpc-base-client";
import { BaseServiceType, ServiceProto } from "tsrpc-proto";
import { getGlobalSDKProvider } from "./Provider";

/**
 * 抽象的HTTP客户端,根据具体的环境,接入对应的客户端,让引用类型的地方不需要判断
 * @typeParam ServiceType 
 */
export class AHttpClient<ServiceType extends BaseServiceType>{
    public client: BaseHttpClient<ServiceType>;
    constructor(proto: ServiceProto<ServiceType>, options?: Partial<BaseHttpClientOptions>) {
        const env = getGlobalSDKProvider()?.env;
        if (!env) throw new Error('GlobalProvider.env需要提供环境实现!');
        this.client = env.getHttpClient!(proto, options);
    }
}
/**
 * 抽象的Websocket客户端,根据具体的环境,接入对应的客户端,让引用类型的地方不需要判断
 * @typeParam ServiceType 
 */
export class AWsClient<ServiceType extends BaseServiceType>{
    public client: BaseWsClient<ServiceType>;
    constructor(proto: ServiceProto<ServiceType>, options?: Partial<BaseWsClientOptions>) {
        const env = getGlobalSDKProvider()?.env;
        if (!env) throw new Error('GlobalProvider.env需要提供环境实现!');
        this.client = env.getWsClient!(proto, options);
    }
}
