
/**结果是成功的*/
export type IResultSucc<T> = {
    /**结果是成功的*/
    succ: true,
    /**结果代码*/
    code: number,
    /**如果是失败的，则有错误消息*/
    err?: string,
    data: T,
};
/**结果是失败的*/
export type IResultErr<T> = {
    succ: false,
    /**结果代码*/
    code: number,
    /**如果是失败的，则有错误消息*/
    err: string,
    data?: T,
};

/**通用结果对象*/
export type IResult<T> = IResultSucc<T> | IResultErr<T>;

/**通用结果对象的生成类*/
export class Result<T> {

    /**
     * 构建一个错误的结果对象
     *
     * @public
     * @typeParam T
     * @param errRet
     * @returns
     */
    public static buildErr<T, T2>(errRet: IResult<T2>): IResult<T>;
    /**
     * 构建一个错误的结果对象
     *
     * @public
     * @typeParam T
     * @param errMsg
     * @param code=0
     * @returns
     */
    public static buildErr<T>(errMsg: string, code?: number): IResult<T>;
    /**
     * 构建一个错误的结果对象
     *
     * @public
     * @typeParam T
     * @param errMsgOrErrRet
     * @param code=1
     * @returns
     */
    public static buildErr<T, T2>(errMsgOrErrRet: string | IResult<T2>, code: number = 1): IResult<T> {
        if (typeof errMsgOrErrRet === 'string') {
            return {
                succ: false,
                err: errMsgOrErrRet,
                code: code,
            };
        } else {
            return {
                succ: false,
                err: errMsgOrErrRet.err ?? '',
                code: errMsgOrErrRet.code,
            };
        }
    }

    /**
     * 构建一个成功的结果对象
     *
     * @public
     * @typeParam T
     * @param data
     * @returns
     */
    public static buildSucc<T>(data: T): IResult<T> {
        return {
            succ: true,
            code: 0,
            data: data,
        };
    }

    /**
     *将一个类型的成功结果转为另外一个
     *
     * @typeParam TSource
     * @typeParam TTarget
     * @param source 成功的对象, 注意必须传入ifSuccGetData参数!
     * @param ifSuccGetData 如果结果是正确的则需要换一个目标类型的data
     * @returns
     */
    public static transition<TSource, TTarget>(source: IResultSucc<TSource>, ifSuccGetData: () => TTarget): IResult<TTarget>;
    /**
    *将一个类型的失败结果转为另外一个
    *
    * @typeParam TSource
    * @typeParam TTarget
    * @param source 失败的对象
    * @returns
    */
    public static transition<TSource, TTarget>(source: IResultErr<TSource>): IResult<TTarget>;
    /**
     *将一个类型的结果转为另外一个类型
     *
     * @typeParam TSource
     * @typeParam TTarget
     * @param source 成功的对象, 注意必须传入ifSuccGetData参数!
     * @param ifSuccGetData 如果结果是正确的则需要换一个目标类型的data
     * @returns
     */
    public static transition<TSource, TTarget>(source: IResult<TSource>, ifSuccGetData: () => TTarget): IResult<TTarget>;
    public static transition<TSource, TTarget>(source: IResult<TSource>, ifSuccGetData?: () => TTarget): IResult<TTarget> {
        if (source.succ) {
            return {
                succ: true,
                code: 0,
                data: ifSuccGetData!(),
            };
        } else {
            return {
                succ: false,
                err: source.err ?? '',
                code: source.code,
            };
        }
    }
}


/**错误码表*/
export enum ErrorCodes {

    /**
     * 通用
     * =======================================
    */

    /**参数错误*/
    ParamsError = 9001,
    /**异常*/
    Exception = 9005,

    /**
     * 房间相关
     * =======================================
    */

    /**不在房间中,无法操作需要在房间中的api*/
    RoomNotIn = 1000,
    /**房间不存在*/
    RoomNotFound = 1001,
    /**房间服务器已经关闭, 需要重新创建*/
    RoomServerClosed = 1002,
    /**服务器爆满, 暂无可用服务器*/
    RoomNoServerAvailable = 1003,
    /**房间现在不允许加入*/
    RoomForbidJoin = 1004,
    /**请先退出之前的房间(调用退出房间)*/
    RoomNeedLeavePrevious = 1005,
    /**房间已经解散*/
    RoomHasDismiss = 1006,
    /**房间人满无法加入*/
    RoomPlayersFull = 1007,
    /**要加入的队伍不存在!*/
    RoomTeamNotFound = 1008,
    /**要加入的队伍已满!*/
    RoomTeamPlayersFull = 1009,
    /**房间中的操作被禁止(一般是权限不足)*/
    RoomPermissionDenied = 1010,
    /**当前需要在同步中才可以操作*/
    RoomNotInSync = 1011,
    /**房间需要密码*/
    RoomMustPassword = 1012,
    /**房间密码不正确*/
    RoomPasswordWrong = 1013,
    /**房间id已存在*/
    RoomIdExists = 1014,

    /**
     * 匹配相关
     * =======================================
    */
    /**未知匹配错误*/
    MatchUnknown = 2000,
    /**请求被取消*/
    MatchRequestCancelled = 2001,
    /**游戏服务器爆满，请稍后再试！*/
    MatchServerBusy = 2002,
    /**匹配查询超时！*/
    MatchQueryTimeout = 2003,
    /**匹配超时！*/
    MatchTimeout = 2004,
    /**匹配相关的操作被禁止*/
    MatchPermissionDenied = 2100,
    /**匹配器标识不存在！*/
    MatchMatcherNotFound = 2101,


    /**
     * 认证相关
     * =======================================
    */

    /**token过期或不存在！(token被平台清理了,可能是太久没用或续期等)*/
    AuthPlayerTokenNotFound = 4001,
    /**token已经失效！(相同的openid重新授权,旧的token就失效了)*/
    AuthPlayerTokenInvalid = 4002,
    /**token已经过期！(刚过期,但还没被平台清理)*/
    AuthPlayerTokenExpire = 4003,
    /**断线重连失败,玩家在断开连接后太久没重连,已经被踢,需要重新登录*/
    AuthReconnectionFail = 4004,
    /**授权被(中间件)禁止*/
    AuthForbid = 4005,
    /**当前操作未授权! 需要先经过认证操作!*/
    AuthUnverified = 4006,
};