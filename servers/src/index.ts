
import './env'

import { getServerRedisClient, startWatchServerConfig } from "./serverConfigMgr";
import { startServers } from "./server";
import { PlayerAuthHelper } from "./shared/tsgfServer/auth/PlayerAuthHelper";
import { RoomHelper } from "./shared/tsgfServer/room/RoomHelper";
import { GameServerHelper } from './shared/tsgfServer/game/GameServerHelper';
import { MySqlFactory } from './shared/tsgfServer/DbHelper';


async function main() {
    let cfgRet = await startWatchServerConfig();
    if (!cfgRet.succ) throw new Error(cfgRet.err);
    
    /**实现当前项目全局定义的 获取应用数据库连接实例 的方法*/
    if (!globalThis.getAppDbHelper && cfgRet.data.connString) {
        globalThis.getAppDbHelper = function () {
            return MySqlFactory.getMySqlDbHelper(cfgRet.data!.connString!.appDb.mysql);
        }
    }

    PlayerAuthHelper.init(getServerRedisClient);
    RoomHelper.init(getServerRedisClient);
    GameServerHelper.init(getServerRedisClient);

    await startServers();
};
main();


