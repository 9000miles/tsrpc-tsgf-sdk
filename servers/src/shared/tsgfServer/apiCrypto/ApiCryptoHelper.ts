import { BaseServiceType } from "tsrpc-proto";
import { CryptoHelper } from "../CryptoHelper"
import { ErrorCodes, IResult, Result } from "../../tsgf/Result";
import { IAppEncryptRequest, IAppEncryptRequestT, IBaseEncryptRequestData } from "../../tsgf/apiCrypto/Models";

export class ApiCryptoHelper {
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
        let cText = CryptoHelper.desEncryptECB_PKCS7_Base64(json, appSecret);
        let req: IAppEncryptRequest = {
            appId: appId,
            ciphertext: cText,
        };
        return req;
    }
    /**
     * 调用AppCrypto协议的解密接口
     *
     * @param appSecret
     * @param req
     * @returns
     */
    public static appCryptoDecryption<T extends IBaseEncryptRequestData>
        (appSecret: string, appReq: IAppEncryptRequest)
        : IResult<IAppEncryptRequestT<T>> {

        if (!appReq.ciphertext) {
            return Result.buildErr("需要 ciphertext !", ErrorCodes.ParamsError);
        }
        try {
            let json = CryptoHelper.desDecryptECB_PKCS7_Base64(appReq.ciphertext, appSecret);
            let data = JSON.parse(json) as T;
            if (!data) {
                return Result.buildErr("接口解析失败", ErrorCodes.ParamsError);
            }
            if (!data.ts || data.ts + 3600000 < Date.now()) {
                return Result.buildErr("接口过期", ErrorCodes.ParamsError);
            }
            appReq.data = data;
            return Result.buildSucc(appReq as IAppEncryptRequestT<T>);
        } catch (err: any) {
            return Result.buildErr("接口解析失败:" + (err?.message ?? err ?? '解析失败!'), ErrorCodes.ParamsError);
        }

    }
}