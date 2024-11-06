import { ApiCall, BaseServiceType, TsrpcErrorData } from "tsrpc";

/**
 * 返回错误并随后关闭连接
 * @typeParam req 
 * @typeParam res 
 * @param call 
 * @param msg 
 * @param info
 * @param closeReason
 * @returns
 */
export async function apiErrorThenClose<req, res, ServiceType extends BaseServiceType = any>(
    call: ApiCall<req, res, ServiceType>, msg: string, info?: Partial<TsrpcErrorData>, closeReason?: string): Promise<void> {
    await call.error(msg, info);
    call.conn.close(closeReason);
}
/**
 * 返回成功并随后关闭连接
 * @typeParam req 
 * @typeParam res 
 * @param call 
 * @param closeReason
 * @returns
 */
export async function apiSuccThenClose<req, res, ServiceType extends BaseServiceType = any>(
    call: ApiCall<req, res, ServiceType>, res: res, closeReason?: string): Promise<void> {
    await call.succ(res);
    call.conn.close(closeReason);
}