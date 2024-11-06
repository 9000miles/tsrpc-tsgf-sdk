
import { HttpClient, WsClient } from "tsrpc";
import { initSDKProvider } from "./shared/tsgf/Provider";

//服务器使用的供应商, 使用原生版本实现
initSDKProvider({
    env: {
        getHttpClient: (proto, options) => {
            return new HttpClient(proto, options);
        },
        getWsClient: (proto, options) => {
            return new WsClient(proto, options);
        },
    }
});