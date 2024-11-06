import { ICancelableExec } from "../tsgf/ICancelable";
import { IResult, Result } from "../tsgf/Result";
import { BaseBLL } from "../tsgfServer/BaseBLL";
import { OrderBy } from "../tsgfServer/BaseDAL";
import { AppDAL } from "./DAL";
import { IApp } from "./Models";

/**简单应用管理(不需要走数据库)*/
export class SimpleAppHelper {
    private static allApps: IApp[] = [
        {
            appId: 'default',
            appName: '默认应用',
            appSecret: 'FDGWPRET345-809RGKFER43SKGF',
            addTime: new Date(Date.parse('2022-01-01'))
        }
    ];

    public static selectAll(): ICancelableExec<IApp[]> {
        return {
            async cancel(): Promise<void> {
            },
            async waitResult(): Promise<IResult<IApp[]>> {
                return Result.buildSucc(SimpleAppHelper.allApps);
            }
        }
    }
    public static selectSingleByAppId(appId: string): ICancelableExec<IApp | null> {
        return {
            async cancel(): Promise<void> {
            },
            async waitResult(): Promise<IResult<IApp | null>> {
                return Result.buildSucc(SimpleAppHelper.allApps.find(a => a.appId == appId) ?? null);
            }
        }
    }
}

export interface AppSearch {
    /**精确匹配*/
    appId?: string | null;
    /**模糊匹配匹配*/
    appNameLike?: string | null;
}

export class AppBLL extends BaseBLL<IApp, AppSearch, AppDAL>  {
    public static Ins: AppBLL = new AppBLL();

    protected getDAL() {
        return new AppDAL();
    }

    protected buildWhereSql(search?: AppSearch): { whereSql: string | null, params: any } {
        let whereSql = null;
        let params: any = null;
        if (search) {
            whereSql = '';
            params = {};
            let hasA = false;
            if (search.appId) {
                if (hasA) whereSql += ' and ';
                whereSql += 'app.appId=:appId';
                params.appId = search.appId;
                hasA = true;
            }
            if (search.appNameLike) {
                if (hasA) whereSql += ' and ';
                whereSql += 'app.appName like :appNameLike';
                params.appNameLike = search.appNameLike;
                hasA = true;
            }
        }
        return {
            whereSql,
            params,
        };
    }
}