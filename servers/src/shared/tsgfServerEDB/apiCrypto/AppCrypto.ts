import { ApiCryptoHelper } from "../../tsgfServer/apiCrypto/ApiCryptoHelper";
import { IAppEncryptRequest, IBaseEncryptRequest, IBaseEncryptRequestData } from "../../tsgf/apiCrypto/Models";
import { ErrorCodes, IResult, Result } from "../../tsgf/Result";
import { AppBLL, SimpleAppHelper } from "../BLL";
import { IApiCrypto } from "./IApiCrypto";


export class AppCrypto implements IApiCrypto {

    /**
     * 解密应用加密请求为原始请求对象, 成功则赋值给appReq.req
     *
     * @public
     * @typeParam T
     * @param appReq
     * @param appSecret
     * @returns
     */
    public async decryptionReq<T extends IBaseEncryptRequestData>(req: IBaseEncryptRequest)
        : Promise<IResult<T>> {
        let appEnReq = req as IAppEncryptRequest;
        if (!appEnReq.appId) {
            return Result.buildErr("需要 appId !", ErrorCodes.ParamsError);
        }
        //let appRet = await AppBLL.Ins.selectSingle({ appId: appEnReq.appId }).waitResult();
        let appRet = await SimpleAppHelper.selectSingleByAppId(appEnReq.appId).waitResult();
        if (!appRet.succ) {
            return Result.buildErr(appRet.err, appRet.code);
        }
        if (!appRet.data) {
            return Result.buildErr("错误的 appId !", ErrorCodes.ParamsError);
        }

        let ret = ApiCryptoHelper.appCryptoDecryption(appRet.data.appSecret, appEnReq);
        if(!ret.succ){
            return Result.buildErr(ret.err, ret.code);
        }

        return Result.buildSucc(ret.data.data as T);
    }
}