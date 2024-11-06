import path from "path";
import { getConfigAuto, startWatchConfig } from "./shared/tsgfServer/gfConfigMgr";
import { getRedisClient, initRedisClient, IRedisClient } from "./shared/tsgfServer/redisHelper";
import { logger } from "./shared/tsgf/logger";
import { parseProcessArgv, parseProcessEnv } from "./shared/tsgf/Utils";
import { IResult, Result } from "./shared/tsgf/Result";
import { IServerConfig } from "./ServerConfig";


let processArgs = parseProcessArgv(process.argv.splice(2));
let processEnv = parseProcessEnv(process.env);
// 命令行参数 > 环境变量 > 默认值
let tsgfConfigFile = processArgs['tsgfConfigFile'] ?? processEnv['tsgfConfigFile'] ?? '../tsgf.server.config.json';


let serverConfigPath = path.resolve(__dirname, tsgfConfigFile);
/**使用内存指定的配置*/
let memServerConfig: IServerConfig | null = null;

logger.log('serverConfigPath:',serverConfigPath);

/**开始监控gf.clusterServer.config.json配置, 并返回获取到的配置对象 */
export async function startWatchServerConfig(): Promise<IResult<IServerConfig>> {
    let getAndInitConfig: () => Promise<IResult<IServerConfig>> = async () => {
        let cfg = await getServerConfig();
        if (cfg.redisConfig) {
            logger.log(`初始化redis配置`);
            initRedisClient(cfg.redisConfig);
        } else {
            logger.error(`redisConfig未配置!`);
            return Result.buildErr("redisConfig未配置!");
        }
        return Result.buildSucc(cfg);
    };
    let ret = await startWatchConfig(serverConfigPath, () => {
        if (!getConfig) return;
        logger.log(`配置文件更新,重新加载中...[${serverConfigPath}]`);
        getAndInitConfig();
    });
    if (!ret.succ) {
        return Result.transition(ret);
    }
    let getConfig = ret.data;
    return await getAndInitConfig();
}

/**获取gf.clusterServer.config.json配置，配置文件有变化会自动读取最新的*/
export async function getServerConfig(): Promise<IServerConfig> {
    //如果有指定内存配置，则直接返回
    if (memServerConfig) return memServerConfig;

    //尝试加载文件配置
    let ret = await getConfigAuto(serverConfigPath);
    if (!ret.succ) {
        logger.error(ret.err);
        return {} as any;
    }
    return ret.data as IServerConfig;
}
/**
 * 指定使用内存配置
 * @param cfg null表示清除内存配置，获取配置时会使用文件配置
 */
export function setMemServerConfig(cfg: IServerConfig | null): void {
    memServerConfig = cfg;
}
/**获取gf.clusterServer.config.json配置中的redis客户端实例，配置文件有变化会自动使用最新的*/
export async function getServerRedisClient(reuseClient: boolean = true): Promise<IRedisClient> {
    return await getRedisClient(reuseClient);
}
