
/**servers的总配置对象*/
export interface IServerConfig {
    /**redis配置 */
    redisConfig: RedisConfig;
    /**所有数据库连接配置[当前服务端版本未启用数据库功能]*/
    connString?: ConnStringMgr;
    /**游戏服务器集群管理服务配置*/
    gameServerCluster: IClusterCfg;
    /**匹配服务器集群管理服务配置*/
    matchServerCluster: IClusterCfg;
    /**大厅服务配置*/
    hallServer: IHallServerCfg;
    /**游戏服务器*/
    gameServer: IGameServerCfg;
    /**匹配服务器*/
    matchServer: IMatchServerCfg;
    /**示例应用的用户系统接入服务 配置*/
    demoServer: IDemoServerCfg;
    /**当前实例要启动哪些服务*/
    runServer: RunServerKey[];
}


/** redis连接配置 */
export interface RedisConfig {
    /**是否有ssl */
    ssl?: boolean;
    /**主机地址,ip或者域名 */
    host?: string;
    /**端口 */
    port?: number;
    /** 用户名, 没有认证放空 */
    username?: string;
    /** 密码, 没有认证或密码放空, 有的话一定要有username,否则无效 */
    password?: string;
    /**使用的数据库索引,一般默认使用0 */
    database?: number;
    /**使用单机内存来简单实现，免去简单场景依赖redis的情况*/
    useMemRedis?: boolean;
}

export interface BaseServerCfg {
    port: number;
}

export interface IHallServerCfg extends BaseServerCfg {
    /**连接的游戏集群url*/
    gameClusterServerUrl: string;
    /**连接游戏集群的终端id*/
    gameClusterTerminalId: string;
    /**连接游戏集群的终端秘钥*/
    gameClusterTerminalKey: string;
}


export interface ConnStringMgr {
    appDb: DbConnStringCfg;
}
export interface DbConnStringCfg {
    mysql: string
}

/**集群节点配置*/
export interface IClusterNodeCfg {
    clusterNodeId: string;
    clusterKey: string;
}
/**集群终端配置*/
export interface IClusterTerminalCfg {
    terminalId: string;
    terminalKey: string;
}

export interface IClusterCfg extends BaseServerCfg {
    /**配置所有可以连接集群的节点 */
    nodeList: IClusterNodeCfg[];
    /**配置所有可以连接集群的终端 */
    terminalList?: IClusterTerminalCfg[];
}
export interface IDemoServerCfg extends BaseServerCfg {
    /**所连的大厅服务器地址*/
    hallServerUrl:string;
}

/**所有服务器类型标识*/
export enum RunServerKey {
    HallServer = "HallServer",
    GameServerCluster = "GameServerCluster",
    MatchServerCluster = "MatchServerCluster",
    GameServer = "GameServer",
    MatchServer = "MatchServer",
    DemoServer = "DemoServer",
}

 

/**
 * 游戏服务器配置
 */
export interface IGameServerCfg {
    /**集群的内网连接地址*/
    clusterWSUrl: string;
    /**集群节点ID（也可以视为服务器ID），集群内唯一，需要和集群服务的配置里一致 */
    clusterNodeId: string;
    /**本节点的集群连接密钥，需要和集群服务的配置里一致 */
    clusterKey: string;

    /**服务器名称 */
    serverName: string;
    /**服务器外网连接地址 */
    serverUrl: string;
    /**服务侦听的端口*/
    port: number;
    /**拓展数据,不同的服务器不同的版本各不相同,将输出给获取服务器列表的客户端 */
    extendData?: any;

    /**游戏服务器分配规则配置*/
    allotRules?: IGameServerAllotRuleCfg;
}

/**限制房间数量的规则*/
export interface AllotLimitRoomCountRule {
    /**匹配房间类型,放空表示不限制本项*/
    roomType?: string;
    /**匹配房间最大玩家数,放空表示不限制本项*/
    maxPlayers?: number;
    /**限制符合本条件的房间数量(多个匹配则取最小值)*/
    limitRoomCount: number;
}
/**各分配规则定义*/
export interface IGameServerAllotRuleCfg{
    /**限制房间数量的规则列表, 如果配置了, 没符合规则的不会分配到本服务器, 匹配中多份配置则会取数量最小的限制值*/
    limitRoomCountRules?: AllotLimitRoomCountRule[];
}



/**匹配服务器配置*/
export interface IMatchServerCfg {
    /**集群的内网连接地址*/
    clusterWSUrl: string;
    /**集群节点ID（也可以视为服务器ID），集群内唯一，需要和集群服务的配置里一致 */
    clusterNodeId: string;
    /**本节点的集群连接密钥，需要和集群服务的配置里一致 */
    clusterKey: string;

    /**服务器名称 */
    serverName: string;

    /**连接的游戏集群url*/
    gameClusterServerUrl: string;
    /**连接游戏集群使用的终端id*/
    gameClusterTerminalId: string;
    /**连接游戏集群使用的终端秘钥*/
    gameClusterTerminalKey: string;
}
