import { IBaseEncryptRequest, IBaseEncryptRequestData } from "../../tsgf/apiCrypto/Models";
import { IResult } from "../../tsgf/Result";

/**所有接口加解密方案，都要实现的接口*/
export interface IApiCrypto {
    
    /**
     * 解密请求，没通过返回IResult，通过则设置解密后的实际数据对象到req.data
     *
     * @typeParam T extends IBaseEncryptRequestData
     * @param req
     * @returns
     */
    decryptionReq<T extends IBaseEncryptRequestData>(req: IBaseEncryptRequest): Promise<IResult<T>>;
}