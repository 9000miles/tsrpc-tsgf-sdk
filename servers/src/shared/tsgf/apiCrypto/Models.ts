
/**加密请求的基类*/
export interface IBaseEncryptRequest {
    /**请求数据密文*/
    ciphertext?: string;
    /**请求数据对象, 到了ApiCall层就是解析通过可以使用的*/
    data?: any;
}
/**加密请求的数据对象基类*/
export interface IBaseEncryptRequestData {
    /**请求时间戳（毫秒），服务端会验证，防止请求重复被使用，时间超过1H就不让用*/
    ts?: number;
}

/**接口加密模式*/
export enum EApiCryptoMode {
    /**没有加解密,全明文*/
    None = "None",
    /**应用请求参数使用des加解密, 需要请求类型继承 IAppEncryptRequest<T> */
    AppReqDes = "AppReqDes",
}





/*============app加密通讯基类=============*/

/**应用加密请求的原始请求对象的基类, 如果有加密外的参数附加, 可以拓展接口补充*/
export interface IAppEncryptRequest extends IBaseEncryptRequest {
    /**应用ID*/
    appId: string;
}

/**应用加密请求的解密后的请求数据的基类, 拓展加密数据对象*/
export interface IAppEncryptRequestT<T extends IBaseEncryptRequestData> extends IAppEncryptRequest {
    /**请求数据对象, 到了ApiCall层就是解析通过可以使用的*/
    data: T;
}
