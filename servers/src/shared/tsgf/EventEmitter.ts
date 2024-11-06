

/**
 * 多事件的订阅和触发
 */
 export class EventEmitter {
    protected eventHandlers: Map<string, EventHandlers<Function>>;
    constructor() {
        this.eventHandlers = new Map<string, EventHandlers<Function>>();
    }

    /**
     * 注册事件
     * @param event 
     * @param handler 
     * @param target 事件处理器的this指向
     */
    public on(event: string, handler: Function, target?: any): void {
        let handlers = this.eventHandlers.get(event);
        if (!handlers) {
            handlers = new EventHandlers<Function>();
            this.eventHandlers.set(event, handlers);
        }
        handlers.addHandler(handler, target);
    }
    /**
     * 注销一个事件
     * @param event 
     * @param handler 
     */
    public off(event: string, handler: Function): void {
        let handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.removeHandler(handler);
            if (handlers.count() <= 0) {
                this.eventHandlers.delete(event);
            }
        }
    }
    /**
     * 触发一个事件的所有处理器,按注册顺序触发
     * @param event 
     * @param args 
     * @returns true if emit 
     */
    public emit(event: string, ...args: any[]): boolean {
        let handlers = this.eventHandlers.get(event);
        if (handlers) return handlers.emit(...args);
        return false;
    }

    /**
     * 移除所有事件和处理器
     */
    public removeAllListeners() {
        for (let eh of this.eventHandlers) {
            eh[1].removeAllHandlers();
        }
        this.eventHandlers.clear();
    }
}

/**
 * 事件处理器
 */
export interface IEventHandler<FnType extends Function> {
    /**
     * 处理器方法
     */
    handler: FnType;
    /**
     * 执行 `handler` 的所有者, 即 `handler` 里的 `this` 指向
     */
    target?: any;
}

/**
 * 单事件的多处理器订阅和触发
 */
export class EventHandlers<FunctionType extends Function>{
    private handlers: IEventHandler<FunctionType>[] = [];

    /**
     * 构造
     */
    constructor() {
    }

    /**
     * Counts event handlers
     * @returns  
     */
    public count() {
        return this.handlers.length;
    }

    /**
     * 添加处理器
     *
     * @param handler
     */
    public addHandler(handler: FunctionType, target?: any) {
        this.handlers.push({
            handler,
            target
        });
    }

    /**
     * 移出处理器
     *
     * @param handler
     */
    public removeHandler(handler: FunctionType) {
        for (let i = 0; i < this.handlers.length; i++) {
            if (this.handlers[i].handler === handler) {
                this.handlers.splice(i, 1);
                return;
            }
        }
    }

    /**
     * Removes all handlers
     */
    public removeAllHandlers() {
        this.handlers = [];
    }


    /**
     * 触发所有处理器, 有处理器则返回true
     *
     * @param args
     */
    public emit(...args: any[]): boolean {
        for (let i = 0; i < this.handlers.length; i++) {
            this.handlers[i].handler.call(this.handlers[i].target ?? this, ...args);
        }
        return this.handlers.length > 0;
    }
}