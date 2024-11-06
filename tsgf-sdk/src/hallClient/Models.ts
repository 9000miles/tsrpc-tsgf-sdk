
/**
 * 游戏服务器信息
 */
export interface IGameServerInfo {
    /**游戏服务器ID */
    serverNodeId: string;
    /**游戏服务器名称 */
    serverName: string;
    /**游戏服务器给客户端用的WebSocket连接地址 */
    serverUrl: string;
    /**连接的客户端数量 */
    clientCount: number;
    /**拓展数据,不同的服务器不同的版本各不相同,也不用频繁升级大厅服务器 */
    extendData?: any;
}