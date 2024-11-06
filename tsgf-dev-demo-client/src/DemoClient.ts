import { AHttpClient, IResult, Result } from "tsgf-sdk";
import { serviceProto as demoServiceProto, ServiceType as DemoServiceType } from "./protocols/serviceProto";
import { ReqPlayerAuth } from "./protocols/PtlPlayerAuth";

/**demo服务器的客户端封装*/
export class DemoClient extends AHttpClient<DemoServiceType>{

    constructor(serverUrl: string) {
        super(demoServiceProto, {
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
    public async playerAuth(playerOpenId: string, playerShowName: string): Promise<IResult<{ playerId: string, playerToken: string }>> {
        let para: ReqPlayerAuth = {
            showName: playerShowName,
            openId: playerOpenId,
        };
        const ret = await this.client.callApi("PlayerAuth", para);
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, (ret.err.code ?? 1) as number);
        }
        return Result.buildSucc(ret.res);
    }
}
