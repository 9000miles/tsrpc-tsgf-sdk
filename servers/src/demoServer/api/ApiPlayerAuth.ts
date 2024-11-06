import { ApiCall, HttpClient } from "tsrpc";
import { ReqPlayerAuth, ResPlayerAuth } from "../../shared/demoClient/protocols/PtlPlayerAuth";
import { HallClient } from "../../shared/hallClient/HallClient";
import { ApiCryptoHelper } from "../../shared/tsgfServer/apiCrypto/ApiCryptoHelper";
import { getServerConfig } from "../../serverConfigMgr";

let hallClient!: HallClient;

async function getHallClient(): Promise<HallClient> {
    if (!hallClient) {
        hallClient = new HallClient((await getServerConfig()).demoServer.hallServerUrl);
    }
    return hallClient;
}

export async function ApiPlayerAuth(call: ApiCall<ReqPlayerAuth, ResPlayerAuth>) {
    let req1 = ApiCryptoHelper.appCryptoEncrypt("default", "FDGWPRET345-809RGKFER43SKGF", {
        openId: call.req.openId,
        showName: call.req.showName,
        authTokenDay: 1,
    });
    const ret1 = await (await getHallClient()).client.callApi("Authorize", req1);
    if (!ret1.isSucc) return call.error(ret1.err);
    return call.succ(ret1.res);
}