import { IResult } from "./Result";


/**可取消对象*/
export interface ICancelable {
    
    /**
     * 取消执行
     *
     * @returns
     */
    cancel(): Promise<void>;
}


/**可取消的执行对象*/
export interface ICancelableExec<ResultData> extends ICancelable {
    /**
     * 等待执行结果
     *
     * @returns
     */
    waitResult(): Promise<IResult<ResultData>>;
}