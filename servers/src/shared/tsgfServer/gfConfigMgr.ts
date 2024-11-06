
import fs from "fs";
import path from "path";
import { IResult, Result } from "../tsgf/Result";
import { IDbHelper } from "./DbHelper";

const allConfigs: Map<string, any> = new Map<string, any>();


export type GetConfig = () => Promise<IResult<any>>;

export enum ConfigType {
    /**直接json格式的配置文件*/
    json = '.json',
    /**js配置对象必须是默认导出*/
    js = '.js',
}

/**
 * 开始监控配置文件,并返回配置对象的方法
 * @param configPath 配置文件路径, 支持json和ts默认导出格式
 * @param configChanged 当配置文件有变化时触发，需要自行调用获取最新的配置
 * @returns 
 */
export async function startWatchConfig(configPath: string, configChanged: (() => void) | null = null): Promise<IResult<any>> {
    if (!fs.existsSync(configPath)) {
        return Result.buildErr("配置文件[" + configPath + "]不存在!");
    }
    fs.watchFile(configPath, { persistent: false, interval: 500 }, () => {
        allConfigs.set(configPath, null);
        configChanged?.call(null);
    });
    allConfigs.set(configPath, null);
    return await getConfigAuto(configPath);
}
/**
 * 读取配置文件,自动根据配置文件格式解析,如果配置没变更将从缓存中读取,需要调用过startWatchConfig初始化!
 * @param configPath 配置文件路径, 支持json和js默认导出格式
 * @returns 
 */
export async function getConfigAuto(configPath: string): Promise<IResult<any>> {
    let config = allConfigs.get(configPath);
    if (config) return Promise.resolve(Result.buildSucc(config));

    let ext = path.extname(configPath);
    let getConfig: GetConfig | null = null;
    switch (ext) {
        case ConfigType.json:
            getConfig = () => Promise.resolve(getConfigByJson(configPath));
            break;
        case ConfigType.js:
            getConfig = async () => Result.buildSucc((await import(configPath)).default);
            break;
        default:
            return Result.buildErr("配置路径[" + configPath + "]格式不支持!目前只支持ts和json格式");
    }
    return await getConfig();
}
/**
 * 读取配置文件,如果配置没变更将从缓存中读取,需要调用过startWatchConfig初始化!
 * @param configPath 配置文件路径
 * @returns 
 */
function getConfigByJson(configPath: string): IResult<any> {
    let config = allConfigs.get(configPath);
    if (!config) {
        let configFileText: string;
        try {
            let fileBin = fs.readFileSync(configPath);
            if (!fileBin) {
                return Result.buildErr("配置文件[" + configPath + "]读取为空!可能是没权限!");
            }
            if (fileBin[0] === 0xEF && fileBin[1] === 0xBB && fileBin[2] === 0xBF) {
                fileBin = fileBin.slice(3);
            }
            configFileText = fileBin.toString('utf-8');
        } catch (ex) {
            return Result.buildErr("配置文件[" + configPath + "]读取失败:" + ex);
        }
        try {
            config = JSON.parse(configFileText);
            allConfigs.set(configPath, config);
        } catch (ex) {
            return Result.buildErr("配置文件[" + configPath + "]解析失败:" + ex + ", configFileText:" + configFileText);
        }
    }
    return Result.buildSucc(config);
}

declare global {

    /**
     * 获取全局定义的应用数据库连接实例
     *
     * @returns
     */
    function getAppDbHelper(): IDbHelper;
}