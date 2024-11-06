
import * as path from "path";
/*
当前加载了哪些服务，由本文件决定
*/
import { getServerConfig, getServerRedisClient } from "./serverConfigMgr";
import { logger } from "./shared/tsgf/logger";
import { IPlayer } from "./shared/tsgfServer/auth/Models";

import { HallServer } from "./hallServer/HallServer";
import { GameServerClusterMgr } from "./gameServerCluster/GameServerClusterMgr";
import { MatchServerClusterMgr } from "./matchServerCluster/MatchServerClusterMgr";
import { GameServer } from "./gameServer/GameServer";
import { MatchServer } from "./matchServer/MatchServer";
import { HttpConnection, HttpServer } from "tsrpc";

import { serviceProto as demoServiceProto, ServiceType as DemoServiceType } from "./shared/demoClient/protocols/serviceProto";
import { RunServerKey } from "./ServerConfig";

let hallServer: HallServer | null = null;
let gameServerClusterMgr: GameServerClusterMgr | null = null;
let matchServerClusterMgr: MatchServerClusterMgr | null = null;
let gameServer: GameServer | null = null;
let matchServer: MatchServer | null = null;
let demoServer: HttpServer | null = null;

/**拓展字段*/
declare module 'tsrpc' {
    export interface BaseConnection {
        /**连接ID,连接在服务端唯一标识*/
        connectionId: string;
        /**玩家ID, 只要通过认证都不会为空, 并且即使销毁, 这个字段值还在*/
        playerId: string;
        /**当前连接所属的玩家服务器对象, 只要通过认证都不会为空, 但断开连接后对象会销毁!*/
        currPlayer: IPlayer;
    }
}


async function startHallServer() {
    // 大厅服务器
    let hallServerCfg = (await getServerConfig()).hallServer;
    logger?.log("大厅服务器.port:", hallServerCfg.port);
    hallServer = new HallServer(
        getServerRedisClient,
        hallServerCfg,
        async () => (await getServerConfig()).hallServer
    );
    await hallServer.start();
    logger.log("大厅服务启动成功!");
}
async function stopHallServer(): Promise<void> {
    await hallServer?.stop();
}

async function startGameServerClusterMgr() {

    // 游戏服务器集群管理服务（可选，即可另外独立部署、启动）
    logger?.log("gameClusterServer.port:", (await getServerConfig()).gameServerCluster.port);
    gameServerClusterMgr = new GameServerClusterMgr(
        async () => {
            //每次都从配置中读取
            return (await getServerConfig()).gameServerCluster.nodeList;
        },
        async () => {
            //每次都从配置中读取
            return (await getServerConfig()).gameServerCluster.terminalList;
        },
        {
            port: (await getServerConfig()).gameServerCluster.port,
            json: false,
            logger: logger,
        },
        async (reuseClient: boolean = true) => await getServerRedisClient(reuseClient)
    );
    await gameServerClusterMgr.start();
    logger.log("游戏集群管理服务启动成功!");
}
async function stopGameServerClusterMgr(): Promise<void> {
    await gameServerClusterMgr?.stop();
}

async function startMatchServerClusterMgr() {
    // 匹配服务器集群管理服务（可选，即可另外独立部署、启动）
    logger?.log("matchClusterServer.port:", (await getServerConfig()).matchServerCluster.port);
    matchServerClusterMgr = new MatchServerClusterMgr(
        async () => {
            //每次都从配置中读取
            return (await getServerConfig()).matchServerCluster.nodeList;
        },
        async () => {
            //每次都从配置中读取
            return (await getServerConfig()).matchServerCluster.terminalList;
        },
        {
            port: (await getServerConfig()).matchServerCluster.port,
            json: false,
            logger: logger,
        },
        async (reuseClient: boolean = true) => await getServerRedisClient(reuseClient)
    );
    await matchServerClusterMgr.start();
    logger.log("匹配集群管理服务启动成功!");
}
async function stopMatchServerClusterMgr(): Promise<void> {
    await matchServerClusterMgr?.stop();
}

async function startGameServer() {
    let serverCfg = await getServerConfig();
    logger?.log("gameServer: port:", serverCfg.gameServer.port);
    gameServer = new GameServer(getServerRedisClient, serverCfg.gameServer, async () => (await getServerConfig()).gameServer);
    await gameServer.start();
    logger.log("游戏服务启动成功!");
}
async function stopGameServer(): Promise<void> {
    await gameServer?.stop();
}

async function startMatchServer() {
    let serverCfg = await getServerConfig();
    logger?.log("matchServer:", serverCfg.matchServer.clusterNodeId, serverCfg.matchServer.serverName);
    matchServer = new MatchServer(
        getServerRedisClient,
        serverCfg.matchServer,
    );
    await matchServer.start();
    logger.log("匹配处理服务启动成功!");
}
async function stopMatchServer(): Promise<void> {
    await matchServer?.stop();
}

async function startDemoServer() {
    demoServer = new HttpServer<DemoServiceType>(demoServiceProto, {
        port: (await getServerConfig()).demoServer.port,
        json: true,
        logger: logger,
    });
    demoServer.flows.preRecvDataFlow.push(v => {
        let conn = v.conn as HttpConnection;
        //解决HTTP请求跨域问题
        conn.httpRes.setHeader("Access-Control-Allow-Origin", "*");
        return v;
    })
    await demoServer.autoImplementApi(path.resolve(__dirname, 'demoServer/api'));
    await demoServer.start();
    logger.log("示例应用的用户系统模拟服务启动成功!");
}
async function stopDemoServer(): Promise<void> {
    await demoServer?.stop();
}


/**启动当前选用的所有服务*/
export async function startServers() {
    let rs = (await getServerConfig()).runServer;
    if (rs.includes(RunServerKey.GameServerCluster)) {
        await startGameServerClusterMgr();
    }
    if (rs.includes(RunServerKey.MatchServerCluster)) {
        await startMatchServerClusterMgr();
    }
    if (rs.includes(RunServerKey.GameServer)) {
        await startGameServer();
    }
    if (rs.includes(RunServerKey.MatchServer)) {
        await startMatchServer();
    }
    if (rs.includes(RunServerKey.HallServer)) {
        await startHallServer();
    }
    if (rs.includes(RunServerKey.DemoServer)) {
        await startDemoServer();
    }
};
export async function stopServers() {
    let rs = (await getServerConfig()).runServer;
    if (rs.includes(RunServerKey.DemoServer)) {
        await stopDemoServer();
    }
    if (rs.includes(RunServerKey.GameServer)) {
        await stopGameServer();
    }
    if (rs.includes(RunServerKey.MatchServer)) {
        await stopMatchServer();
    }
    if (rs.includes(RunServerKey.HallServer)) {
        await stopHallServer();
    }
    if (rs.includes(RunServerKey.GameServerCluster)) {
        await stopGameServerClusterMgr();
    }
    if (rs.includes(RunServerKey.MatchServerCluster)) {
        await stopMatchServerClusterMgr();
    }
};