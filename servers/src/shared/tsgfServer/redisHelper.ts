
import { commandOptions, createClient, RedisClientType, RedisFunctions, RedisModules, RedisScripts } from 'redis';
import { v4 } from "uuid";
import { RedisConfig } from '../../ServerConfig';
import { logger } from "../tsgf/logger";
import { delay } from "../tsgf/Utils";

/**
 * redis客户端接口
 */
export interface IRedisClient {
    disconnect(): Promise<void>;
    /**
     * 删除键
     *
     * @public
     * @param keys
     * @returns
     */
    delete(...keys: string[]): Promise<void>;
    /**
     * 设置键值对,值是字符串
     * @param key 
     * @param val 
     * @param exTimeSec 在几秒后过期,0表示永不过期
     */
    setString(key: string, val: string, exTimeSec: number): Promise<void>;
    /**
     * 获取 @see setString 设置的值
     * @param key 
     * @returns 
     */
    getString(key: string): Promise<string | null>;
    /**
     * 设置键值对,值类型是对象
     * @param key 
     * @param val 
     * @param exTimeSec 在几秒后过期,0表示永不过期
     */
    setObject(key: string, val: any, exTimeSec: number): Promise<void>;
    /**
     * 获取 @see setObject 设置的值
     * @param key 
     * @returns 
     */
    getObject<T>(key: string): Promise<T | null>;
    /**
     * 设置hash表的字段为对象值（会被序列化为json字符串进行存储）
     *
     * @public
     * @param key
     * @param field
     * @param valueObject 对象类型
     * @returns
     */
    setHashObject(key: string, field: string, valueObject: any): Promise<void>;
    /**
     * 设置hash表的字段为字符串值
     *
     * @public
     * @param key
     * @param field
     * @param valueString 字符串类型
     * @returns
     */
    setHashString(key: string, field: string, valueString: string): Promise<void>;
    /**
     * 获取hash表的字段的字符串值
     *
     * @public
     * @param key
     * @param field
     * @returns
     */
    getHashString(key: string, field: string): Promise<string | null | undefined>;
    /**
     * 设置hash表的字段为对象值（会被序列化为json字符串进行存储）
     *
     * @public
     * @param key
     * @param field
     * @param valueObject 对象类型
     * @returns
     */
    getHashObject<T extends object>(key: string, field: string): Promise<T | null>;
    /**
     * 获取哈希表里的所有键值对，字段值为对象类型
     *
     * @public
     * @typeParam ValueType
     * @param key
     * @returns
     */
    getHashObjects<ValueType>(key: string): Promise<{ [key: string]: ValueType }>;
    /**
     * 获取哈希表里的所有键值对，字段值为字符串类型
     *
     * @public
     * @typeParam ValueType
     * @param key
     * @returns
     */
    getHashValues(key: string): Promise<{ [key: string]: string }>;
    /**
     * 删除hash表的字段
     * @public
     * @param key
     * @param field
     * @returns
     */
    removeHashValue(key: string, field: string): Promise<void>;
    /**
     * 将一个元素推入列表的最后
     *
     * @public
     * @typeParam T extends object 必须是对象类型
     * @param redisKey
     * @param item
     * @returns
     */
    rPushObject<T extends object>(redisKey: string, item: T): Promise<void>;
    /**
     * 读取并移除列表第一个元素，并json解析为对象，如果列表为空这个返回null
     *
     * @public
     * @typeParam T extends object 必须是对象类型
     * @param redisKey
     * @returns
     */
    lPopObject<T extends object>(redisKey: string): Promise<T | null>;
    /**
     * 阻塞的方式读取并移除列表第一个元素，并解析为对象，如果列表为空则会一直阻塞
     *
     * @public
     * @typeParam T extends object 必须是对象类型
     * @param redisKey
     * @param timeoutSec 阻塞超时秒数，传0表示不超时，没数据则一直阻塞下去
     * @returns
     */
    blPopObject<T extends object>(redisKey: string, timeoutSec: number): Promise<T | null>;/**
     * 递增1并返回递增后的数值，如果没有则会当作0来执行
     *
     * @public
     * @param redisKey
     * @returns
     */
    incr(redisKey: string): Promise<number>;
    /**
     * 递减1并返回递减后的数值，如果没有则会当作0来执行
     *
     * @public
     * @param redisKey
     * @returns
     */
    decr(redisKey: string): Promise<number>;
    /**
     * 递增指定数值并返回递增后的数值，如果没有则会当作0来执行
     *
     * @public
     * @param redisKey
     * @param increment 整数
     * @returns
     */
    incrBy(redisKey: string, increment: number): Promise<number>;
    /**
     * 递减指定数值并返回递减后的数值，如果没有则会当作0来执行
     *
     * @public
     * @param redisKey
     * @param increment 整数
     * @returns
     */
    decrBy(redisKey: string, increment: number): Promise<number>;
    /**
     * 【发布、订阅】发布一个对象到key中
     *
     * @public
     * @typeParam T extends object 需要是一个对象
     * @param redisKey
     * @param item
     * @returns
     */
    publishObject<T extends object>(redisKey: string, item: T): Promise<void>;
    /**
     * 【发布、订阅】订阅一个key中的消息，注意，本操作需要一个独立的连接！（可以使用getRedisClient(false)来创建一个全新的连接）
     *
     * @public
     * @typeParam T extends object 需要是一个对象
     * @param redisKey
     * @param item
     * @returns
     */
    subscribeObject<T extends object>(redisKey: string, listen: (item: T) => void): Promise<void>;
    /**
     * 【发布、订阅】取消订阅一个key中的消息，注意，本操作的连接需要和订阅是同一个！
     *
     * @public
     * @typeParam T extends object 需要是一个对象
     * @param redisKey
     * @param item
     * @returns
     */
    unsubscribe(redisKey: string): Promise<void>;
}

/**获取redis客户端实例的方法定义*/
export type GetRedisClient = () => Promise<IRedisClient>;

/**redis客户端封装 */
export class RedisClient implements IRedisClient {
    private config?: RedisConfig;
    private configUrl: string;
    private client?: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
    private reconnectHd: any;
    private reconnectWaiting: boolean = false;
    /**是否已经显示过连接错误了*/
    private showConnectError: boolean = false;
    private id: string;
    /**
     * 初始化
     * @param cfg 配置对象
     */
    private constructor(cfg: RedisConfig) {
        this.id = v4();
        this.config = cfg;
        //redis[s]://[[username][:password]@][host][:port][/db-number]:
        let url = "redis" + (this.config.ssl ? 's' : '') + "://";
        if (this.config.username) {
            url += this.config.username;
            if (this.config.password) {
                url += ":" + this.config.password;
            }
            url += "@";
        }
        url += this.config.host + ':' + this.config.port
            + '/' + this.config.database;
        this.configUrl = url;

        this.client = createClient({
            url: this.configUrl
        });
    }

    /**
     * 创建连接好的客户端,建议全局静态一个
     * @param cfg 
     * @returns 
     */
    public static async createClient(cfg: RedisConfig): Promise<IRedisClient> {
        let rc = new RedisClient(cfg);
        let isFirst = true;
        //redis的connect()方法实现的很坑, 如果没连接成功,触发完on('error')事件后,不会resolve或者reject继续,并且还会走自动重连
        //所以这里统一封装一个连接的异步任务,兼容connect的处理流程,即使连不上,也能正常走后续
        let connTask = new Promise<void>(async (resolve) => {
            //实现额外的网络错误重连
            rc.client?.on('error', async (error: any) => {
                //暂时不启用自定义重连机制,暂时先相信redis客户端自己的重连机制
                //IRedisClient.tryReconnect(rc, null);
                //logger.log(`redisClient错误[${rc.id}]!`, error);
                if (!rc.showConnectError) {
                    rc.showConnectError = true;
                    logger.error(`redisClient连接错误[${rc.id}]!(自动重试中...)`, error);
                }
                if (isFirst) {
                    //还没连上就出错了,那就补充connect那边的异步回调
                    isFirst = false;
                    return resolve();
                }
            });
            rc.client?.on('reconnecting', async () => {
                //logger.log(`redisClient正在重连[${rc.id}]!`);
            });
            rc.client?.on('end', async (error: any) => {
                isFirst = false;
                //断开事件触发后尝试重连(如果是手动调用断开的会跳过)
                RedisClient.tryReconnect(rc, null);
            });
            rc.client?.on('ready', async (error: any) => {
                isFirst = false;
                rc.showConnectError = false;
                //logger.log(`redisClient连接成功[${rc.id}]!`);
            });
            await rc.client?.connect();
            //到这里了,说明连接成功了!返回
            return resolve();
        });
        await connTask;
        return rc;
    }

    /**暂时不需要自己的重连机制*/
    private static async tryReconnect(rc?: RedisClient, retryEx: any | null = null) {
        if (!rc) return;
        if (!rc.reconnectWaiting) {
            //因为error事件会多次重复触发, 所以用个标志只处理一次
            try {
                await rc.client?.disconnect();
            } catch (ex) {
                //logger.error(`redisClient断开[${rc.id}]产生错误`, ex);
            }
            rc.reconnectWaiting = true;
            if (retryEx) {
                logger.error(`redisClient重连失败[${rc.id}], 2秒后再次重连!`, retryEx);
            } else {
                logger.error(`redisClient断开[${rc.id}], 2秒后重连尝试!`);
            }
            clearTimeout(rc.reconnectHd);
            rc.reconnectHd = setTimeout((rc?: RedisClient) => {
                if (rc) {
                    rc.reconnectWaiting = false;
                    RedisClient.reconnect(rc)
                    rc = undefined;
                }
            }, 2000, rc);
        }
        rc = undefined;
    }
    /**暂时不需要自己的重连机制*/
    private static async reconnect(rc?: RedisClient) {
        if (!rc) return;
        clearTimeout(rc.reconnectHd);
        if (rc.client?.isOpen === true) {
            //开始重连时,状态就是连上的,则直接成功
            logger.log(`redisClient重连成功[${rc.id}]! [01]`);
        } else {
            try {
                //尝试连接
                await rc.client?.connect();
                //没报错则成功
                logger.log(`redisClient重连成功[${rc.id}]! [02]`);
            } catch (ex) {
                if (rc.client?.isOpen) {
                    //报错后发现是连接状态的,则视为成功
                    logger.log(`redisClient重连成功[${rc.id}]! [03]`);
                    return;
                }
                //其他错误,则再次重试
                RedisClient.tryReconnect(rc, ex);
            }
        }
        rc = undefined;
    }
    public async disconnect(): Promise<void> {
        clearTimeout(this.reconnectHd);
        try {
            await this.client?.disconnect();
        } catch (e) { }
        this.client = undefined;
        this.config = undefined;
    }


    /**
     * 删除键
     *
     * @public
     * @param keys
     * @returns
     */
    public async delete(...keys: string[]): Promise<void> {
        await this.client?.del(keys);
    }
    /**
     * 设置键值对,值是字符串
     * @param key 
     * @param val 
     * @param exTimeSec 在几秒后过期,0表示永不过期
     */
    public async setString(key: string, val: string, exTimeSec: number = 0): Promise<void> {
        let opt: any = {};
        if (exTimeSec) {
            opt.EX = exTimeSec;
        }
        await this.client?.set(key, val, opt);
    }
    /**
     * 获取 @see setString 设置的值
     * @param key 
     * @returns 
     */
    public async getString(key: string): Promise<string | null> {
        return await this.client?.get(key) ?? null;
    }

    /**
     * 设置键值对,值类型是对象
     * @param key 
     * @param val 
     * @param exTimeSec 在几秒后过期,0表示永不过期
     */
    public async setObject(key: string, val: any, exTimeSec: number = 0): Promise<void> {
        let valJson: any = null;
        if (val) {
            valJson = JSON.stringify(val);
        }
        await this.setString(key, valJson, exTimeSec);
    }
    /**
     * 获取 @see setObject 设置的值
     * @param key 
     * @returns 
     */
    public async getObject<T>(key: string): Promise<T | null> {
        let json = await this.getString(key);
        if (!json) return null;
        try {
            return JSON.parse(json) as T;
        } catch (ex) {
            logger.error('getObject("' + key + '")json解析失败:', json);
            return null;
        }
    }


    /**
     * 设置hash表的字段为对象值（会被序列化为json字符串进行存储）
     *
     * @public
     * @param key
     * @param field
     * @param valueObject 对象类型
     * @returns
     */
    public async setHashObject(key: string, field: string, valueObject: any): Promise<void> {
        let valJson: any = null;
        if (valueObject) {
            valJson = JSON.stringify(valueObject);
        }
        await this.setHashString(key, field, valJson);
    }
    /**
     * 设置hash表的字段为字符串值
     *
     * @public
     * @param key
     * @param field
     * @param valueString 字符串类型
     * @returns
     */
    public async setHashString(key: string, field: string, valueString: string): Promise<void> {
        await this.client?.hSet(key, field, valueString);
    }
    /**
     * 获取hash表的字段的字符串值
     *
     * @public
     * @param key
     * @param field
     * @returns
     */
    public async getHashString(key: string, field: string): Promise<string | null | undefined> {
        return await this.client?.hGet(key, field);
    }
    /**
     * 设置hash表的字段为对象值（会被序列化为json字符串进行存储）
     *
     * @public
     * @param key
     * @param field
     * @param valueObject 对象类型
     * @returns
     */
    public async getHashObject<T extends object>(key: string, field: string): Promise<T | null> {
        let json: any = await this.getHashString(key, field);
        if (!json) return null;
        try {
            return JSON.parse(json) as T;
        } catch (ex) {
            logger.error(`getHashObject(${key}, ${field})json解析失败:`, json);
            return null;
        }

    }


    /**
     * 获取哈希表里的所有键值对，字段值为对象类型
     *
     * @public
     * @typeParam ValueType
     * @param key
     * @returns
     */
    public async getHashObjects<ValueType>(key: string): Promise<{ [key: string]: ValueType }> {
        let kv = await this.client?.hGetAll(key);
        let ret: { [key: string]: ValueType } = {};
        if (kv) {
            for (let key in kv) {
                let json = kv[key];
                ret[key] = JSON.parse(json);
            }
        }
        return ret;
    }
    /**
     * 获取哈希表里的所有键值对，字段值为字符串类型
     *
     * @public
     * @typeParam ValueType
     * @param key
     * @returns
     */
    public async getHashValues(key: string): Promise<{ [key: string]: string }> {
        return await this.client?.hGetAll(key) ?? {};
    }

    /**
     * 删除hash表的字段
     * @public
     * @param key
     * @param field
     * @returns
     */
    public async removeHashValue(key: string, field: string): Promise<void> {
        await this.client?.hDel(key, field);
    }


    /**
     * 将一个元素推入列表的最后
     *
     * @public
     * @typeParam T extends object 必须是对象类型
     * @param redisKey
     * @param item
     * @returns
     */
    public async rPushObject<T extends object>(redisKey: string, item: T): Promise<void> {
        let valJson: any = null;
        if (item) {
            valJson = JSON.stringify(item);
        }
        await this.client?.rPush(redisKey, valJson);
    }


    /**
     * 读取并移除列表第一个元素，并json解析为对象，如果列表为空这个返回null
     *
     * @public
     * @typeParam T extends object 必须是对象类型
     * @param redisKey
     * @returns
     */
    public async lPopObject<T extends object>(redisKey: string): Promise<T | null> {
        let json = await this.client?.lPop(redisKey);
        if (!json) return null;
        try {
            return JSON.parse(json) as T;
        } catch (ex) {
            logger.error('IRedisClient.lPopObject("' + redisKey + '")json解析失败:', json);
            return null;
        }
    }


    /**
     * 阻塞的方式读取并移除列表第一个元素，并解析为对象，如果列表为空则会一直阻塞
     *
     * @public
     * @typeParam T extends object 必须是对象类型
     * @param redisKey
     * @param timeoutSec 阻塞超时秒数，传0表示不超时，没数据则一直阻塞下去
     * @returns
     */
    public async blPopObject<T extends object>(redisKey: string, timeoutSec: number): Promise<T | null> {
        let ret = await this.client?.blPop(commandOptions({ isolated: true }), redisKey, timeoutSec);
        if (!ret || !ret.element) return null;
        try {
            return JSON.parse(ret.element) as T;
        } catch (ex) {
            logger.error('IRedisClient.blPopObject("' + redisKey + '")json解析失败:', ret.element);
            return null;
        }
    }


    /**
     * 递增1并返回递增后的数值，如果没有则会当作0来执行
     *
     * @public
     * @param redisKey
     * @returns
     */
    public async incr(redisKey: string): Promise<number> {
        return await this.client?.incr(redisKey) ?? 0;
    }
    /**
     * 递减1并返回递减后的数值，如果没有则会当作0来执行
     *
     * @public
     * @param redisKey
     * @returns
     */
    public async decr(redisKey: string): Promise<number> {
        return await this.client?.decr(redisKey) ?? 0;
    }

    /**
     * 递增指定数值并返回递增后的数值，如果没有则会当作0来执行
     *
     * @public
     * @param redisKey
     * @param increment 整数
     * @returns
     */
    public async incrBy(redisKey: string, increment: number): Promise<number> {
        return await this.client?.incrBy(redisKey, increment) ?? 0;
    }
    /**
     * 递减指定数值并返回递减后的数值，如果没有则会当作0来执行
     *
     * @public
     * @param redisKey
     * @param increment 整数
     * @returns
     */
    public async decrBy(redisKey: string, increment: number): Promise<number> {
        return await this.client?.decrBy(redisKey, increment) ?? 0;
    }



    /**
     * 【发布、订阅】发布一个对象到key中
     *
     * @public
     * @typeParam T extends object 需要是一个对象
     * @param redisKey
     * @param item
     * @returns
     */
    public async publishObject<T extends object>(redisKey: string, item: T): Promise<void> {
        let valJson: any = null;
        if (item) {
            valJson = JSON.stringify(item);
        }
        await this.client?.publish(redisKey, valJson);
    }

    /**
     * 【发布、订阅】订阅一个key中的消息，注意，本操作需要一个独立的连接！（可以使用getRedisClient(false)来创建一个全新的连接）
     *
     * @public
     * @typeParam T extends object 需要是一个对象
     * @param redisKey
     * @param item
     * @returns
     */
    public async subscribeObject<T extends object>(redisKey: string, listen: (item: T) => void): Promise<void> {
        await this.client?.subscribe(redisKey, (json: string) => {
            if (!json) return;
            let item: T;
            try {
                item = JSON.parse(json) as T;
            } catch (ex) {
                logger.error('IRedisClient.subscribeObject("' + redisKey + '")json解析失败:', ex, "json:", json);
                return;
            }
            listen(item);
        });
    }
    /**
     * 【发布、订阅】取消订阅一个key中的消息，注意，本操作的连接需要和订阅是同一个！
     *
     * @public
     * @typeParam T extends object 需要是一个对象
     * @param redisKey
     * @param item
     * @returns
     */
    public async unsubscribe(redisKey: string): Promise<void> {
        await this.client?.unsubscribe(redisKey);
    }
}
/**单机内存版的实现，用在简易的all-in-one场景，减少redis的依赖！*/
export class MemRedisClient implements IRedisClient {

    private static memCacheKV: Map<string, string> = new Map<string, string>();
    private static memCacheHSet: Map<string, Map<string, string>> = new Map<string, Map<string, string>>();
    private static memCacheList: Map<string, string[]> = new Map<string, string[]>();
    private static memCacheInc: Map<string, number> = new Map<string, number>();
    private static memCachePubSub: Map<string, ((item: string) => void)[]> = new Map<string, ((item: string) => void)[]>();

    public async disconnect(): Promise<void> {
    }


    /**
     * 删除键
     *
     * @public
     * @param key
     * @returns
     */
    public async delete(...keys: string[]): Promise<void> {
        for (let key of keys) {
            MemRedisClient.memCacheKV.delete(key);
        }
    }
    /**
     * 设置键值对,值是字符串
     * @param key 
     * @param val 
     * @param exTimeSec 在几秒后过期,0表示永不过期
     */
    public async setString(key: string, val: string, exTimeSec: number = 0): Promise<void> {
        let opt: any = {};
        if (exTimeSec) {
            opt.EX = exTimeSec;
        }
        MemRedisClient.memCacheKV.set(key, val);
    }
    /**
     * 获取 @see setString 设置的值
     * @param key 
     * @returns 
     */
    public async getString(key: string): Promise<string | null> {
        return MemRedisClient.memCacheKV.get(key) ?? null;
    }

    /**
     * 设置键值对,值类型是对象
     * @param key 
     * @param val 
     * @param exTimeSec 在几秒后过期,0表示永不过期
     */
    public async setObject(key: string, val: any, exTimeSec: number = 0): Promise<void> {
        let valJson: any = null;
        if (val) {
            valJson = JSON.stringify(val);
        }
        await this.setString(key, valJson, exTimeSec);
    }
    /**
     * 获取 @see setObject 设置的值
     * @param key 
     * @returns 
     */
    public async getObject<T>(key: string): Promise<T | null> {
        let json = await this.getString(key);
        if (!json) return null;
        try {
            return JSON.parse(json) as T;
        } catch (ex) {
            logger.error('getObject("' + key + '")json解析失败:', json);
            return null;
        }
    }


    /**
     * 设置hash表的字段为对象值（会被序列化为json字符串进行存储）
     *
     * @public
     * @param key
     * @param field
     * @param valueObject 对象类型
     * @returns
     */
    public async setHashObject(key: string, field: string, valueObject: any): Promise<void> {
        let valJson: any = null;
        if (valueObject) {
            valJson = JSON.stringify(valueObject);
        }
        await this.setHashString(key, field, valJson);
    }
    /**
     * 设置hash表的字段为字符串值
     *
     * @public
     * @param key
     * @param field
     * @param valueString 字符串类型
     * @returns
     */
    public async setHashString(key: string, field: string, valueString: string): Promise<void> {
        let set = MemRedisClient.memCacheHSet.get(key);
        if (!set) {
            set = new Map<string, string>();
            MemRedisClient.memCacheHSet.set(key, set);
        }
        set.set(field, valueString);
    }
    /**
     * 获取hash表的字段的字符串值
     *
     * @public
     * @param key
     * @param field
     * @returns
     */
    public async getHashString(key: string, field: string): Promise<string | null | undefined> {
        let set = MemRedisClient.memCacheHSet.get(key);
        if (!set) {
            return null;
        }
        return set.get(field);
    }
    /**
     * 设置hash表的字段为对象值（会被序列化为json字符串进行存储）
     *
     * @public
     * @param key
     * @param field
     * @param valueObject 对象类型
     * @returns
     */
    public async getHashObject<T extends object>(key: string, field: string): Promise<T | null> {
        let json: any = await this.getHashString(key, field);
        if (!json) return null;
        try {
            return JSON.parse(json) as T;
        } catch (ex) {
            logger.error(`getHashObject(${key}, ${field})json解析失败:`, json);
            return null;
        }

    }


    /**
     * 获取哈希表里的所有键值对，字段值为对象类型
     *
     * @public
     * @typeParam ValueType
     * @param key
     * @returns
     */
    public async getHashObjects<ValueType>(key: string): Promise<{ [key: string]: ValueType }> {
        let set = MemRedisClient.memCacheHSet.get(key);
        if (!set) {
            return {};
        }
        let ret: { [key: string]: ValueType } = {};
        for (let kv of set) {
            ret[kv[0]] = JSON.parse(kv[1]);;
        }
        return ret;
    }
    /**
     * 获取哈希表里的所有键值对，字段值为字符串类型
     *
     * @public
     * @typeParam ValueType
     * @param key
     * @returns
     */
    public async getHashValues(key: string): Promise<{ [key: string]: string }> {
        let set = MemRedisClient.memCacheHSet.get(key);
        if (!set) {
            return {};
        }
        let obj: { [key: string]: string } = {};
        for (let kv of set) {
            obj[kv[0]] = kv[1];
        }
        return obj;
    }

    /**
     * 删除hash表的字段
     * @public
     * @param key
     * @param field
     * @returns
     */
    public async removeHashValue(key: string, field: string): Promise<void> {
        let set = MemRedisClient.memCacheHSet.get(key);
        if (!set) {
            return;
        }
        set.delete(field);
    }




    /**
     * 将一个元素推入列表的最后
     *
     * @public
     * @typeParam T extends object 必须是对象类型
     * @param redisKey
     * @param item
     * @returns
     */
    public async rPushObject<T extends object>(redisKey: string, item: T): Promise<void> {
        let valJson: any = null;
        if (item) {
            valJson = JSON.stringify(item);
        }
        let list = MemRedisClient.memCacheList.get(redisKey);
        if (!list) {
            list = [];
            MemRedisClient.memCacheList.set(redisKey, list);
        }
        list.push(valJson);
    }


    /**
     * 读取并移除列表第一个元素，并json解析为对象，如果列表为空这个返回null
     *
     * @public
     * @typeParam T extends object 必须是对象类型
     * @param redisKey
     * @returns
     */
    public async lPopObject<T extends object>(redisKey: string): Promise<T | null> {
        let list = MemRedisClient.memCacheList.get(redisKey);
        if (!list) {
            list = [];
            MemRedisClient.memCacheList.set(redisKey, list);
        }
        let json = list.shift();
        if (!json) return null;
        try {
            return JSON.parse(json) as T;
        } catch (ex) {
            logger.error('IRedisClient.lPopObject("' + redisKey + '")json解析失败:', json);
            return null;
        }
    }


    /**
     * 阻塞的方式读取并移除列表第一个元素，并解析为对象，如果列表为空则会一直阻塞
     *
     * @public
     * @typeParam T extends object 必须是对象类型
     * @param redisKey
     * @param timeoutSec 阻塞超时秒数，传0表示不超时，没数据则一直阻塞下去
     * @returns
     */
    public async blPopObject<T extends object>(redisKey: string, timeoutSec: number): Promise<T | null> {
        return await new Promise<T | null>(async resolve => {
            let time = 0, allTime = timeoutSec * 1000;
            while (timeoutSec === 0 || time < allTime) {
                let val = await this.lPopObject<T>(redisKey);
                if (val) return resolve(val);
                await delay(300);
                time += 300;
            }
            resolve(null);
        });
    }


    /**
     * 递增1并返回递增后的数值，如果没有则会当作0来执行
     *
     * @public
     * @param redisKey
     * @returns
     */
    public async incr(redisKey: string): Promise<number> {
        let nStr = MemRedisClient.memCacheKV.get(redisKey);
        if (typeof (nStr) === 'undefined') {
            nStr = '0';
        }
        let n = parseInt(nStr);
        n++;
        MemRedisClient.memCacheKV.set(redisKey, n + '');
        return n;
    }
    /**
     * 递减1并返回递减后的数值，如果没有则会当作0来执行
     *
     * @public
     * @param redisKey
     * @returns
     */
    public async decr(redisKey: string): Promise<number> {
        let nStr = MemRedisClient.memCacheKV.get(redisKey);
        if (typeof (nStr) === 'undefined') {
            nStr = '0';
        }
        let n = parseInt(nStr);
        n--;
        MemRedisClient.memCacheKV.set(redisKey, n + '');
        return n;
    }

    /**
     * 递增指定数值并返回递增后的数值，如果没有则会当作0来执行
     *
     * @public
     * @param redisKey
     * @param increment 整数
     * @returns
     */
    public async incrBy(redisKey: string, increment: number): Promise<number> {
        let nStr = MemRedisClient.memCacheKV.get(redisKey);
        if (typeof (nStr) === 'undefined') {
            nStr = '0';
        }
        let n = parseInt(nStr);
        n += increment;
        MemRedisClient.memCacheKV.set(redisKey, n + '');
        return n;
    }
    /**
     * 递减指定数值并返回递减后的数值，如果没有则会当作0来执行
     *
     * @public
     * @param redisKey
     * @param increment 整数
     * @returns
     */
    public async decrBy(redisKey: string, increment: number): Promise<number> {
        let nStr = MemRedisClient.memCacheKV.get(redisKey);
        if (typeof (nStr) === 'undefined') {
            nStr = '0';
        }
        let n = parseInt(nStr);
        n -= increment;
        MemRedisClient.memCacheKV.set(redisKey, n + '');
        return n;
    }


    /**
     * 【发布、订阅】发布一个对象到key中
     *
     * @public
     * @typeParam T extends object 需要是一个对象
     * @param redisKey
     * @param item
     * @returns
     */
    public async publishObject<T extends object>(redisKey: string, item: T): Promise<void> {
        let valJson: any = null;
        if (item) {
            valJson = JSON.stringify(item);
        }
        let ls = MemRedisClient.memCachePubSub.get(redisKey);
        if (ls) {
            for (let fn of ls) {
                fn(valJson);
            }
        }
    }

    /**
     * 【发布、订阅】订阅一个key中的消息，注意，本操作需要一个独立的连接！（可以使用getRedisClient(false)来创建一个全新的连接）
     *
     * @public
     * @typeParam T extends object 需要是一个对象
     * @param redisKey
     * @param listen
     * @returns
     */
    public async subscribeObject<T extends object>(redisKey: string, listen: (item: T) => void): Promise<void> {
        let ls = MemRedisClient.memCachePubSub.get(redisKey);
        if (!ls) {
            ls = [];
            MemRedisClient.memCachePubSub.set(redisKey, ls);
        }
        ls.push(json => {
            if (!json) return;
            let item: T;
            try {
                item = JSON.parse(json) as T;
            } catch (ex) {
                logger.error('IRedisClient.subscribeObject("' + redisKey + '")json解析失败:', ex, "json:", json);
                return;
            }
            listen(item);
        });
    }
    /**
     * 【发布、订阅】取消订阅一个key中的消息，注意，本操作的连接需要和订阅是同一个！
     *
     * @public
     * @typeParam T extends object 需要是一个对象
     * @param redisKey
     * @param item
     * @returns
     */
    public async unsubscribe(redisKey: string): Promise<void> {
        MemRedisClient.memCachePubSub.delete(redisKey);
    }
}

const allRedisClients: Map<string, IRedisClient> = new Map<string, IRedisClient>();
const allRedisCfg: Map<string, RedisConfig> = new Map<string, RedisConfig>();

/**
 * 初始化指定配置的redis客户端配置,如果已经存在会断开之前的连接(相当于重置)
 * @param cfg 
 * @param configKey 根据这配置标识区分客户端
 */
export async function initRedisClient(cfg: RedisConfig, configKey: string = "default"): Promise<void> {
    allRedisCfg.set(configKey, cfg);
    let existsClient = allRedisClients.get(configKey);
    if (existsClient) await existsClient.disconnect();
    if (cfg.useMemRedis) {
        existsClient = new MemRedisClient();
    } else {
        existsClient = await RedisClient.createClient(cfg);
    }
    allRedisClients.set(configKey, existsClient);
}
/**
 * 获取redis客户端(需要先调用初始化), 全局共享同配置的客户端实例
 * @param reuseClient 是否复用连接,否的只是单纯的创建一个全新的连接并返回
 * @param configKey 如果没传使用默认值
 * @returns 
 */
export async function getRedisClient(reuseClient: boolean = true, configKey: string = "default"): Promise<IRedisClient> {
    if (reuseClient) {
        let client = allRedisClients.get(configKey);
        if (client) return client;
        let cfg = allRedisCfg.get(configKey);
        if (!cfg) {
            throw new Error(`${configKey}标识未初始化配置!`);
        }
        if (cfg.useMemRedis) {
            client = new MemRedisClient();
        } else {
            client = await RedisClient.createClient(cfg);
        }
        allRedisClients.set(configKey, client);
        return client;
    } else {
        let cfg = allRedisCfg.get(configKey);
        if (!cfg) {
            throw new Error(`${configKey}标识未初始化配置!`);
        }
        if (cfg.useMemRedis) {
            return new MemRedisClient();
        } else {
            return await RedisClient.createClient(cfg);
        }
    }
}