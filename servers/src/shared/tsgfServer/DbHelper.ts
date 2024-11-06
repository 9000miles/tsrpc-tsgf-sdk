import { IResult, Result } from "../tsgf/Result";
import mysql from 'mysql';

/**数据库连接实例*/
export interface IDbHelper {

    /**
     * 设置连接手动关闭，数据库操作后是否需要手动调用关闭，否则会自动调用关闭
     * @param manual 默认为false，即为：会自动关闭
     */
    setManualClose(manual: boolean): void;


    /**
     * 打开连接，一般不用手动调用，执行时会自动打开
     *
     * @returns
     */
    open(): Promise<IResult<null>>;


    /**
     * 关闭连接，设置手动关闭连接后，需要自行调用关闭
     *
     * @returns
     */
    close(): Promise<void>;


    /**
     * 查询出多行数据并映射为对象数组
     *
     * @param sql
     * @param params
     * @returns
     */
    queryMulti<Model>(sql: string, params?: any): Promise<IResult<Model[]>>;

    /**
     * 查询首行数据并映射为对象，如果没数据则ret.data=null
     *
     * @typeParam Model 实体类型
     * @param sql
     * @param params
     * @returns
     */
    querySingle<Model>(sql: string, params?: any): Promise<IResult<Model | null>>;
}


export class MySqlDbHelper implements IDbHelper {
    protected pool?: mysql.Pool;
    protected conn?: mysql.PoolConnection;
    protected autoClose: boolean = true;

    constructor(pool: mysql.Pool) {
        this.pool = pool;
    }

    setManualClose(manual: boolean): void {
        this.autoClose = !manual;
    }

    open(): Promise<IResult<null>> {
        return new Promise<IResult<null>>((resolve) => {
            if (!this.pool) return resolve(Result.buildErr("从连接池中获取连接失败：连接池为空!"));
            this.pool.getConnection((err, connection) => {
                if (err) {
                    return resolve(Result.buildErr("从连接池中获取连接失败：" + err.message));
                }
                //支持sql的参数名方式的参数化
                connection.config.queryFormat = function (query, values) {
                    if (!values) return query;
                    return query.replace(/\:(\w+)/g, (txt, key) => {
                        if (values.hasOwnProperty(key)) {
                            return connection.escape(values[key]);
                        }
                        return txt;
                    });
                };
                this.conn = connection;
                return resolve(Result.buildSucc(null));
            });
        });
    }

    close(): Promise<void> {
        this.conn?.release();
        this.conn = undefined;
        return Promise.resolve();
    }
    queryMulti<Model>(sql: string, params?: any): Promise<IResult<Model[]>> {
        return new Promise<IResult<any>>(async (resolve) => {
            if (!this.conn) {
                let openRet = await this.open();
                if (!openRet.succ) {
                    return resolve(Result.buildErr(openRet.err));
                }
            }
            this.conn!.query(sql, params, async (err, result) => {
                if (this.autoClose) await this.close();
                if (err) {
                    return resolve(Result.buildErr(err.message));
                }
                if (result && result.length) {
                    return resolve(Result.buildSucc(result as Model[]));
                }
                return resolve(Result.buildSucc([]));
            });
        });
    }
    querySingle<Model>(sql: string, params?: any): Promise<IResult<Model | null>> {
        return new Promise<IResult<any>>(async (resolve) => {
            if (!this.conn) {
                let openRet = await this.open();
                if (!openRet.succ) {
                    return resolve(Result.buildErr(openRet.err));
                }
            }
            this.conn!.query(sql, params, async (err, result) => {
                if (this.autoClose) await this.close();
                if (err) {
                    return resolve(Result.buildErr(err.message));
                }
                if (result && result.length) {
                    return resolve(Result.buildSucc(result[0] as Model));
                }
                return resolve(Result.buildSucc(null));
            });
        });
    }

}

/**mysql的连接工厂*/
export class MySqlFactory {

    private static mysqlPool?: mysql.Pool;

    /**
     * 获取一个mysql的连接工具实例
     *
     * @public
     * @param connString
     * @returns
     */
    public static getMySqlDbHelper(connString: string): IDbHelper {
        if (!MySqlFactory.mysqlPool) {
            MySqlFactory.mysqlPool = mysql.createPool(connString);
        }
        return new MySqlDbHelper(MySqlFactory.mysqlPool);
    }
}