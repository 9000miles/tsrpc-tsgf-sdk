import { ICancelableExec } from "../tsgf/ICancelable";
import { IResult } from "../tsgf/Result";
import { BaseDAL, OrderBy } from "./BaseDAL";


export abstract class BaseBLL<Model, SearchModel, DAL extends BaseDAL<Model>> {

    protected abstract getDAL(): DAL;
    protected abstract buildWhereSql(search?: SearchModel): { whereSql: string | null, params: any };

    protected exec<ResultData>(run: (dal: DAL) => Promise<IResult<ResultData>>): ICancelableExec<ResultData> {
        let dal = this.getDAL();
        return {
            waitResult: () => {
                return run(dal);
            },
            cancel: async () => {
                await dal.closeCurrDb();
            }
        };
    }


    /**
     * 查询多行
     *
     * @public
     * @param orderby
     * @param limitCount
     */
    public selectAll(search?: SearchModel, orderby?: OrderBy[] | null, limitCount?: number | null): ICancelableExec<Model[]> {
        let where = this.buildWhereSql(search);
        return this.exec(async (dal) => {
            return await dal.selectAll('*', null, where.whereSql, where.params, orderby, limitCount);
        });
    }

    /**
     * 分页查询
     *
     * @public
     * @param pageSize 一页几条
     * @param pageIndex 页码，从1开始
     * @param orderby
     */
    public selectPages(pageSize: number, pageIndex: number, search?: SearchModel, orderby?: OrderBy[]): ICancelableExec<Model[]> {
        let where = this.buildWhereSql(search);
        return this.exec(async (dal) => {
            return await dal.selectPages(pageSize, pageIndex, '*', null, where.whereSql, where.params, orderby);
        });
    }

    /**
     * 查询单条
     *
     * @public
     * @param fromSqlApp
     * @param whereSql
     * @param params
     */
    public selectSingle(search?: SearchModel): ICancelableExec<Model | null> {
        let where = this.buildWhereSql(search);
        return this.exec(async (dal) => {
            return await dal.selectSingle(null, where.whereSql, where.params);
        });
    }


}