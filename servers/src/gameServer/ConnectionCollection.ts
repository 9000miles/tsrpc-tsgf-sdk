import { v4 } from "uuid";
import { ClientConnection } from "./GameServer";


/**连接的集合*/
export class ConnectionCollection {

    protected _conns: ClientConnection[] = [];
    protected _connMap: Map<string, ClientConnection> = new Map<string, ClientConnection>();
    protected getConnKey: (conn: ClientConnection) => string | undefined;

    /**集合内的连接数组*/
    public get connections() {
        return this._conns;
    }
    /**集合内的连接字典,连接标识=>连接对象*/
    public get connectionMap() {
        return this._connMap;
    }


    /**
     *
     * @param getConnKey 获取连接标识,可以用connId也可以用其他
     */
    constructor(getConnKey: (conn: ClientConnection) => string) {
        this.getConnKey = getConnKey;
    }

    /**
     * 加入连接
     * @param conn 
     */
    public addConnection(conn: ClientConnection): void {
        let k = this.getConnKey(conn);
        if (!k) return;
        this.removeConnection(k);
        this._connMap.set(k, conn);
        this._conns.push(conn);
    }
    /**
     * 移除指定连接
     * @param conn 
     */
    public removeConnection(connKey: string): void {
        this._connMap.delete(connKey);
        this._conns.remove(c => this.getConnKey(c) === connKey);
    }

    /**清除所有连接*/
    public clearAllConnections(): void {
        this._connMap.clear();
        this._conns = [];
    }
}
