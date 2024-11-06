
import { IRedisClient } from "./redisHelper";


/**（跨服务器）队列接口*/
export interface IQueue {

    /**
     * 读取并移除队列第一个元素，并json解析为对象，如果队列为空这个返回null
     *
     * @typeParam T
     * @returns
     */
    pop<T extends object>(queueKey: string): Promise<T | null>;

    /**
     * 阻塞的方式读取并移除队列第一个元素，并解析为对象，如果队列为空则会一直阻塞
     *
     * @typeParam T
     * @returns
     */
    blockPop<T extends object>(queueKey: string): Promise<T | null>;

    /**
     * 将一个元素推入队列的最后
     *
     * @param item
     * @returns
     */
    push(queueKey: string, item: any): Promise<void>;

    /**
     * 开始侦听队列，有元素进来时会触发回调, 会阻塞到停止侦听，所以不要await
     *
     * @typeParam T
     * @param callback
     * @returns
     */
    listen<T extends object>(queueKey: string, callback: (item: T) => void): Promise<void>;

    /**
     * 停止侦听。注意：如果停止时，队列里还有元素，侦听回调可能还会触发一次，防止已经读取出来的数据没触发回调导致“丢包”
     */
    stopListen(queueKey: string): void;
}


/**redis队列实现, 需要调用init进行异步初始化*/
export class RedisQueue implements IQueue {
    protected getRedisClient: (reuseClient: boolean) => Promise<IRedisClient>;
    protected msgCallbacks: Map<string, (item: any) => void> = new Map<string, (item: any) => void>();

    protected insRedisClient?: IRedisClient;

    constructor(getRedisClient: (reuseClient: boolean) => Promise<IRedisClient>) {
        this.getRedisClient = getRedisClient;
    }
    async listen<T extends object>(queueKey: string, callback: (item: T) => void): Promise<void> {
        this.msgCallbacks.set(queueKey, callback);
        do {
            //阻塞读取，1秒超时 （阻塞的命令，需要独占连接，所以使用队列自己的连接
            let ret = await (await this.getInsRedisClient()).blPopObject<T>(queueKey, 1);
            if (ret) {
                callback(ret);
            }
        } while (this.msgCallbacks.get(queueKey));
    }
    stopListen(queueKey: string): void {
        this.msgCallbacks.delete(queueKey)
    }

    public async getSelfRedisClient(): Promise<IRedisClient> {
        return await this.getRedisClient(true);
    }
    public async getInsRedisClient(): Promise<IRedisClient> {
        if (!this.insRedisClient) {
            //首次或者之前的已经断开,则全新拷贝一个自己的连接来使用
            this.insRedisClient = await this.getRedisClient(false);
        }
        return this.insRedisClient;
    }

    async push<T extends object>(queueKey: string, item: T): Promise<void> {
        return await (await this.getSelfRedisClient()).rPushObject<T>(queueKey, item);
    }

    async pop<T extends object>(queueKey: string): Promise<T | null> {
        return await (await this.getSelfRedisClient()).lPopObject<T>(queueKey);
    }

    async blockPop<T extends object>(queueKey: string): Promise<T | null> {
        //阻塞的命令，需要独占连接，所以使用全新的获取连接
        return await (await this.getInsRedisClient()).blPopObject<T>(queueKey, 0);
    }
}