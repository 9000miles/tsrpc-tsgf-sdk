import { IResult } from "../tsgf/Result";
import { IDbHelper } from "./DbHelper";

export class OrderBy {
    public tableName: string;
    public colName: string;
    public isAsc: boolean;
    constructor(tableName: string, colName: string, isAsc: boolean) {
        if (!checkIdentifierConform(tableName)) throw Error(`${tableName}表名不合法！`);
        if (!checkIdentifierConform(colName)) throw Error(`${colName}字段名不合法！`);
        this.tableName = tableName;
        this.colName = colName;
        this.isAsc = isAsc;
    }

    public toString(reverseAsc: boolean = false) {
        let str = '';
        if (this.tableName) str += this.tableName + '.';
        str += this.colName;
        let asc = reverseAsc ? !this.isAsc : this.isAsc;
        str += asc ? ' asc' : ' desc';
        return '';
    }
}

export abstract class BaseDAL<Model>{

    protected _currDbHelper?: IDbHelper;
    protected readonly dbHelperFactory: () => IDbHelper;

    public readonly tableName: string;
    public readonly idName: string;
    public get currDbHelper() {
        return this._currDbHelper;
    }

    constructor(dbHelperFactory: () => IDbHelper, tableName: string, idName: string) {
        this.dbHelperFactory = dbHelperFactory;
        this.tableName = tableName;
        this.idName = idName;
    }

    protected getDbHelper(): IDbHelper {
        if (!this._currDbHelper) {
            this._currDbHelper = this.dbHelperFactory();
        }
        return this._currDbHelper;
    }
    public async closeCurrDb(): Promise<void> {
        if (this._currDbHelper) {
            await this._currDbHelper.close();
            this._currDbHelper = undefined;
        }
    }

    /**
     * 基础生成select语句
     *
     * @protected
     * @param selectSql 不包含select关键字
     * @param fromSql 不包含from关键字
     * @param whereSql 可空，有则不包含where关键字
     * @param limitCount 读取条数
     * @param limitOffset 读取偏移（从0开始）
     * @param orderBySql 可空，有则不包含order by关键字
     */
    protected abstract buildSelectSql(selectSql: string, fromSql: string, whereSql?: string | null, orderBySql?: string | null, limitCount?: number | null, limitOffset?: number | null): string;

    /**
     * 查询多行
     *
     * @public
     * @param selectSql="*"
     * @param fromSqlApp
     * @param whereSql
     * @param params
     * @param orderby
     * @param limitCount
     */
    public async selectAll(selectSql: string = "*", fromSqlApp?: string | null, whereSql?: string | null, params?: any | null, orderby?: OrderBy[] | null, limitCount?: number | null) {
        let fromSql = this.tableName;
        if (fromSqlApp) fromSql += ` ${fromSqlApp}`;
        let orderBySql: string | null = null;
        if (orderby && orderby.length > 0) orderBySql = orderby.join(',')
        let sql = this.buildSelectSql(selectSql, fromSql, whereSql, orderBySql, limitCount);
        return await this.getDbHelper().queryMulti<Model>(sql, params);
    }

    /**
     * 分页查询
     *
     * @public
     * @param pageSize 一页几条
     * @param pageIndex 页码，从1开始
     * @param selectSql="*"
     * @param fromSqlApp
     * @param whereSql
     * @param params
     * @param orderby
     */
    public async selectPages(pageSize: number, pageIndex: number, selectSql: string = "*", fromSqlApp?: string | null, whereSql?: string | null, params?: any | null, orderby?: OrderBy[] | null) {
        let fromSql = this.tableName;
        if (fromSqlApp) fromSql += ` ${fromSqlApp}`;
        let orderBySql: string | null = null;
        if (orderby && orderby.length > 0) orderBySql = orderby.join(',')
        let sql = this.buildSelectSql(selectSql, fromSql, whereSql, orderBySql, pageSize, (pageIndex - 1) * pageSize);
        return await this.getDbHelper().queryMulti<Model>(sql, params);
    }

    /**
     * 查询单条
     *
     * @public
     * @param fromSqlApp
     * @param whereSql
     * @param params
     */
    public async selectSingle(fromSqlApp?: string | null, whereSql?: string | null, params?: any | null) {
        let fromSql = this.tableName;
        if (fromSqlApp) fromSql += ` ${fromSqlApp}`;
        let sql = this.buildSelectSql('*', fromSql, whereSql, undefined, 1);
        return await this.getDbHelper().querySingle<Model>(sql, params);
    }
}
export class BaseMySqlDAL<Model> extends BaseDAL<Model>{
    /**
     * 基础生成select语句
     *
     * @protected
     * @param selectSql 不包含select关键字
     * @param fromSql 不包含from关键字
     * @param whereSql 可空，有则不包含where关键字
     * @param limitCount 读取条数
     * @param limitOffset 读取偏移（从0开始）
     * @param orderBySql 可空，有则不包含order by关键字
     */
    protected buildSelectSql(selectSql: string, fromSql: string, whereSql?: string | null, orderBySql?: string | null, limitCount?: number | null, limitOffset?: number | null): string {
        let sql = `select ${selectSql} from ${fromSql}`;
        if (whereSql) sql += ` where ${whereSql}`;
        if (orderBySql) sql += ` order by ${orderBySql}`;
        if (typeof (limitCount) !== "undefined" && limitCount !== null) {
            if (typeof (limitOffset) !== "undefined" && limitOffset !== null) {
                sql += ` limit ${limitOffset},${limitCount}`;
            } else {
                sql += ` limit ${limitCount}`;
            }
        }
        return sql;
    }
}


const checkIdentifier = /^[0-9a-zA-Z\_]+$/ig;
/**
 * 检查一个名称是否符合标识符命名规范，防止注入等
 * @date 2022/4/25 - 15:15:56
 *
 * @param name
 */
export function checkIdentifierConform(name: string): boolean {
    return checkIdentifier.test(name);
}
