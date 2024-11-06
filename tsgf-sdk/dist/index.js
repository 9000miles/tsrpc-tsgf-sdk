/*!
 * TSGF SDK Base v1.4.0
 * -----------------------------------------
 * Copyright (c) zum.
 * MIT License
 * https://gitee.com/fengssy/ts-gameframework
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**获取全局供应商实现*/
function getGlobalSDKProvider() {
    return globalThis.tsgfSDKProvider;
}
/**
 * 初始化全局供应商实现
 * @param provider
 */
function initSDKProvider(provider) {
    globalThis.tsgfSDKProvider = provider;
}

/**
 * 对象里是否有属性,通常用于判断将object当作键值对来使用的场景
 *
 * @param object
 * @returns
 */
function hasProperty(object) {
    if (!object)
        return false;
    for (let key in object) {
        return true;
    }
    return false;
}
/**
 * 异步延时
 *
 * @param ms
 * @returns
 */
async function delay(ms) {
    await delayCanCancel(ms).waitResult();
}
/**
 * 可取消的异步延时
 *
 * @param ms
 * @returns
 */
function delayCanCancel(ms) {
    let tHD = 0;
    let task = new Promise((resolve) => {
        tHD = setTimeout(resolve, ms);
    });
    return {
        waitResult() {
            return task;
        },
        cancel() {
            clearTimeout(tHD);
            return Promise.resolve();
        },
    };
}
/**
 * 提取数组中最符合条件的元素 O(n)
 *
 * @typeParam T
 * @param arr
 * @param compareFn 数组中每个元素对比，返回最符合条件的元素
 * @param filter 先筛选,通过筛选的元素再进行提取最符合的
 * @returns
 */
function arrWinner(arr, compareFn, filter) {
    let winner = null;
    for (let item of arr) {
        if ((filter === null || filter === void 0 ? void 0 : filter.call(null, item)) === false)
            continue;
        if (!winner) {
            winner = item;
            continue;
        }
        winner = compareFn(winner, item);
    }
    return winner;
}
/**
 * 原数组直接删除符合条件的元素，返回删除的数量
 *
 * @typeParam T
 * @param arr
 * @param itemCanRemove
 * @returns
 */
function arrRemoveItems(arr, itemCanRemove) {
    let deleteCount = 0;
    for (let i = 0; i < arr.length; i++) {
        if (itemCanRemove(arr[i])) {
            arr.splice(i, 1);
            i--;
            deleteCount++;
            continue;
        }
    }
    return deleteCount;
}
/**
 * 分组
 *
 * @typeParam Item
 * @param arr
 * @param grouper
 * @returns
 */
function arrGroup(arr, grouper) {
    let groups = new Map();
    for (let item of arr) {
        let key = grouper(item);
        let list = groups.get(key);
        if (!list) {
            list = [];
            groups.set(key, list);
        }
        list.push(item);
    }
    return groups;
}
/**
 *合并数组中对象元素中的数组!
 *
 * @typeParam ArrItem
 * @typeParam ItemArrItem
 * @param arr
 * @param itemArrGet 获取元素中的数组
 * @param mergeProc 合并操作(返回false表示不继续),merge为最终合并的数组, 需要自行往里面操作(连接或者去重等)
 * @returns
 */
function arrItemArrMerge(arr, itemArrGet, mergeProc) {
    let merge = [];
    for (let item of arr) {
        let itemArr = itemArrGet(item);
        if (mergeProc(merge, itemArr) === false)
            return merge;
    }
    return merge;
}
/**
 * 连接数组中对象元素中的数组!
 *
 * @typeParam ArrItem
 * @typeParam ItemArrItem
 * @param arr
 * @param itemArrGet 获取元素中的数组
 * @returns
 */
function arrItemArrMergeConcat(arr, itemArrGet) {
    return arrItemArrMerge(arr, itemArrGet, (m, curr) => {
        m = m.concat(...curr);
    });
}
/**
 * 数组元素值累加
 *
 * @typeParam Item
 * @param arr
 * @param mapper
 * @returns
 */
function arrSum(arr, mapper) {
    let sum = 0;
    for (let item of arr) {
        sum += mapper(item);
    }
    return sum;
}
/**
 * 数组元素满足条件的数量
 *
 * @typeParam Item
 * @param arr
 * @param filter
 * @returns
 */
function arrCount(arr, filter) {
    let count = 0;
    for (let item of arr) {
        if (filter(item))
            count++;
    }
    return count;
}
/**
 * 应用skip+limit到数组实现
 * @template T
 * @param arr
 * @param [skip]
 * @param [limit]
 * @returns skip limit to slice
 */
function arrSkipAndLimit(arr, skip, limit) {
    let start = skip !== undefined ? skip : 0;
    // 如果跳过数量剩下没了，直接返回空数组
    if (start >= arr.length)
        return [];
    let end = limit !== undefined ? start + limit : arr.length;
    if (end > arr.length)
        end = arr.length;
    return arr.slice(start, end);
}
/**
 *将两个一样长度的数值数组相加,输出到另外一个一样长度的数值数组
 *
 * @param out
 * @param a
 * @param b
 */
function numbersAdd(out, a, b) {
    for (let index = 0; index < a.length; index++) {
        out[index] = a[index] + b[index];
    }
}
/**
 * 给数组的每个元素更新值
 *
 * @param out
 * @param set
 */
function arrUpdateItems(out, set) {
    for (let index = 0; index < out.length; index++) {
        out[index] = set(out[index], index);
    }
}
/**
 * 解析进程入口参数为一个对象, 格式为 -配置名1=配置值1 -配置名2="带有空格 的配置值", 转为 \{ 配置名1:"配置值1",配置名2:"带有空格 的配置值" \}
 *
 * @param args 进程传入参数列表
 * @param configNamePrefix
 */
function parseProcessArgv(args, configNamePrefix = '-') {
    let setOption = {};
    for (let arg of args) {
        let argStr = arg.trim();
        if (argStr.startsWith(configNamePrefix)) {
            let dIndex = argStr.indexOf('=');
            let key = dIndex > -1 ? argStr.substring(1, dIndex) : argStr.substring(1);
            let val = dIndex > -1 ? argStr.substring(dIndex + 1) : '';
            //支持值头尾有双引号
            val = val.replace(/^"?(.*?)"?$/ig, ($0, $1) => $1);
            setOption[key] = val;
        }
    }
    return setOption;
}
/**
 * 提取 process.argv 中 "ARGV_" 开头的值 转为配置对象
 *
 * @param env 配置名列表
 */
function parseProcessEnv(env) {
    let setOption = {};
    for (let key in env) {
        if (key.startsWith('ARGV_')) {
            let argvName = key.substring('ARGV_'.length);
            setOption[argvName] = env[key];
        }
    }
    return setOption;
}

/**通用结果对象的生成类*/
class Result {
    /**
     * 构建一个错误的结果对象
     *
     * @public
     * @typeParam T
     * @param errMsgOrErrRet
     * @param code=1
     * @returns
     */
    static buildErr(errMsgOrErrRet, code = 1) {
        var _a;
        if (typeof errMsgOrErrRet === 'string') {
            return {
                succ: false,
                err: errMsgOrErrRet,
                code: code,
            };
        }
        else {
            return {
                succ: false,
                err: (_a = errMsgOrErrRet.err) !== null && _a !== void 0 ? _a : '',
                code: errMsgOrErrRet.code,
            };
        }
    }
    /**
     * 构建一个成功的结果对象
     *
     * @public
     * @typeParam T
     * @param data
     * @returns
     */
    static buildSucc(data) {
        return {
            succ: true,
            code: 0,
            data: data,
        };
    }
    static transition(source, ifSuccGetData) {
        var _a;
        if (source.succ) {
            return {
                succ: true,
                code: 0,
                data: ifSuccGetData(),
            };
        }
        else {
            return {
                succ: false,
                err: (_a = source.err) !== null && _a !== void 0 ? _a : '',
                code: source.code,
            };
        }
    }
}
/**错误码表*/
exports.ErrorCodes = void 0;
(function (ErrorCodes) {
    /**
     * 通用
     * =======================================
    */
    /**参数错误*/
    ErrorCodes[ErrorCodes["ParamsError"] = 9001] = "ParamsError";
    /**异常*/
    ErrorCodes[ErrorCodes["Exception"] = 9005] = "Exception";
    /**
     * 房间相关
     * =======================================
    */
    /**不在房间中,无法操作需要在房间中的api*/
    ErrorCodes[ErrorCodes["RoomNotIn"] = 1000] = "RoomNotIn";
    /**房间不存在*/
    ErrorCodes[ErrorCodes["RoomNotFound"] = 1001] = "RoomNotFound";
    /**房间服务器已经关闭, 需要重新创建*/
    ErrorCodes[ErrorCodes["RoomServerClosed"] = 1002] = "RoomServerClosed";
    /**服务器爆满, 暂无可用服务器*/
    ErrorCodes[ErrorCodes["RoomNoServerAvailable"] = 1003] = "RoomNoServerAvailable";
    /**房间现在不允许加入*/
    ErrorCodes[ErrorCodes["RoomForbidJoin"] = 1004] = "RoomForbidJoin";
    /**请先退出之前的房间(调用退出房间)*/
    ErrorCodes[ErrorCodes["RoomNeedLeavePrevious"] = 1005] = "RoomNeedLeavePrevious";
    /**房间已经解散*/
    ErrorCodes[ErrorCodes["RoomHasDismiss"] = 1006] = "RoomHasDismiss";
    /**房间人满无法加入*/
    ErrorCodes[ErrorCodes["RoomPlayersFull"] = 1007] = "RoomPlayersFull";
    /**要加入的队伍不存在!*/
    ErrorCodes[ErrorCodes["RoomTeamNotFound"] = 1008] = "RoomTeamNotFound";
    /**要加入的队伍已满!*/
    ErrorCodes[ErrorCodes["RoomTeamPlayersFull"] = 1009] = "RoomTeamPlayersFull";
    /**房间中的操作被禁止(一般是权限不足)*/
    ErrorCodes[ErrorCodes["RoomPermissionDenied"] = 1010] = "RoomPermissionDenied";
    /**当前需要在同步中才可以操作*/
    ErrorCodes[ErrorCodes["RoomNotInSync"] = 1011] = "RoomNotInSync";
    /**房间需要密码*/
    ErrorCodes[ErrorCodes["RoomMustPassword"] = 1012] = "RoomMustPassword";
    /**房间密码不正确*/
    ErrorCodes[ErrorCodes["RoomPasswordWrong"] = 1013] = "RoomPasswordWrong";
    /**房间id已存在*/
    ErrorCodes[ErrorCodes["RoomIdExists"] = 1014] = "RoomIdExists";
    /**
     * 匹配相关
     * =======================================
    */
    /**未知匹配错误*/
    ErrorCodes[ErrorCodes["MatchUnknown"] = 2000] = "MatchUnknown";
    /**请求被取消*/
    ErrorCodes[ErrorCodes["MatchRequestCancelled"] = 2001] = "MatchRequestCancelled";
    /**游戏服务器爆满，请稍后再试！*/
    ErrorCodes[ErrorCodes["MatchServerBusy"] = 2002] = "MatchServerBusy";
    /**匹配查询超时！*/
    ErrorCodes[ErrorCodes["MatchQueryTimeout"] = 2003] = "MatchQueryTimeout";
    /**匹配超时！*/
    ErrorCodes[ErrorCodes["MatchTimeout"] = 2004] = "MatchTimeout";
    /**匹配相关的操作被禁止*/
    ErrorCodes[ErrorCodes["MatchPermissionDenied"] = 2100] = "MatchPermissionDenied";
    /**匹配器标识不存在！*/
    ErrorCodes[ErrorCodes["MatchMatcherNotFound"] = 2101] = "MatchMatcherNotFound";
    /**
     * 认证相关
     * =======================================
    */
    /**token过期或不存在！(token被平台清理了,可能是太久没用或续期等)*/
    ErrorCodes[ErrorCodes["AuthPlayerTokenNotFound"] = 4001] = "AuthPlayerTokenNotFound";
    /**token已经失效！(相同的openid重新授权,旧的token就失效了)*/
    ErrorCodes[ErrorCodes["AuthPlayerTokenInvalid"] = 4002] = "AuthPlayerTokenInvalid";
    /**token已经过期！(刚过期,但还没被平台清理)*/
    ErrorCodes[ErrorCodes["AuthPlayerTokenExpire"] = 4003] = "AuthPlayerTokenExpire";
    /**断线重连失败,玩家在断开连接后太久没重连,已经被踢,需要重新登录*/
    ErrorCodes[ErrorCodes["AuthReconnectionFail"] = 4004] = "AuthReconnectionFail";
    /**授权被(中间件)禁止*/
    ErrorCodes[ErrorCodes["AuthForbid"] = 4005] = "AuthForbid";
    /**当前操作未授权! 需要先经过认证操作!*/
    ErrorCodes[ErrorCodes["AuthUnverified"] = 4006] = "AuthUnverified";
})(exports.ErrorCodes || (exports.ErrorCodes = {}));

/**
 * 抽象的HTTP客户端,根据具体的环境,接入对应的客户端,让引用类型的地方不需要判断
 * @typeParam ServiceType
 */
class AHttpClient {
    constructor(proto, options) {
        var _a;
        const env = (_a = getGlobalSDKProvider()) === null || _a === void 0 ? void 0 : _a.env;
        if (!env)
            throw new Error('GlobalProvider.env需要提供环境实现!');
        this.client = env.getHttpClient(proto, options);
    }
}
/**
 * 抽象的Websocket客户端,根据具体的环境,接入对应的客户端,让引用类型的地方不需要判断
 * @typeParam ServiceType
 */
class AWsClient {
    constructor(proto, options) {
        var _a;
        const env = (_a = getGlobalSDKProvider()) === null || _a === void 0 ? void 0 : _a.env;
        if (!env)
            throw new Error('GlobalProvider.env需要提供环境实现!');
        this.client = env.getWsClient(proto, options);
    }
}

/**
 * 多事件的订阅和触发
 */
class EventEmitter {
    constructor() {
        this.eventHandlers = new Map();
    }
    /**
     * 注册事件
     * @param event
     * @param handler
     * @param target 事件处理器的this指向
     */
    on(event, handler, target) {
        let handlers = this.eventHandlers.get(event);
        if (!handlers) {
            handlers = new EventHandlers();
            this.eventHandlers.set(event, handlers);
        }
        handlers.addHandler(handler, target);
    }
    /**
     * 注销一个事件
     * @param event
     * @param handler
     */
    off(event, handler) {
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
    emit(event, ...args) {
        let handlers = this.eventHandlers.get(event);
        if (handlers)
            return handlers.emit(...args);
        return false;
    }
    /**
     * 移除所有事件和处理器
     */
    removeAllListeners() {
        for (let eh of this.eventHandlers) {
            eh[1].removeAllHandlers();
        }
        this.eventHandlers.clear();
    }
}
/**
 * 单事件的多处理器订阅和触发
 */
class EventHandlers {
    /**
     * 构造
     */
    constructor() {
        this.handlers = [];
    }
    /**
     * Counts event handlers
     * @returns
     */
    count() {
        return this.handlers.length;
    }
    /**
     * 添加处理器
     *
     * @param handler
     */
    addHandler(handler, target) {
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
    removeHandler(handler) {
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
    removeAllHandlers() {
        this.handlers = [];
    }
    /**
     * 触发所有处理器, 有处理器则返回true
     *
     * @param args
     */
    emit(...args) {
        var _a;
        for (let i = 0; i < this.handlers.length; i++) {
            this.handlers[i].handler.call((_a = this.handlers[i].target) !== null && _a !== void 0 ? _a : this, ...args);
        }
        return this.handlers.length > 0;
    }
}

const serviceProto$1 = {
    "version": 35,
    "services": [
        {
            "id": 11,
            "name": "AppDismissRoom",
            "type": "api",
            "conf": {
                "skipPlayerAuth": true,
                "cryptoMode": "AppReqDes"
            }
        },
        {
            "id": 0,
            "name": "Authorize",
            "type": "api",
            "conf": {
                "skipPlayerAuth": true,
                "cryptoMode": "AppReqDes"
            }
        },
        {
            "id": 1,
            "name": "CancelMatch",
            "type": "api",
            "conf": {
                "cryptoMode": "None"
            }
        },
        {
            "id": 2,
            "name": "CreateRoom",
            "type": "api",
            "conf": {
                "cryptoMode": "None"
            }
        },
        {
            "id": 12,
            "name": "FilterRooms",
            "type": "api",
            "conf": {
                "cryptoMode": "None"
            }
        },
        {
            "id": 8,
            "name": "GetOrCreateRoom",
            "type": "api",
            "conf": {
                "cryptoMode": "None"
            }
        },
        {
            "id": 7,
            "name": "GetRoomOnlineInfo",
            "type": "api",
            "conf": {
                "cryptoMode": "None"
            }
        },
        {
            "id": 13,
            "name": "OwnDismissRoom",
            "type": "api",
            "conf": {
                "cryptoMode": "None"
            }
        },
        {
            "id": 4,
            "name": "QueryMatch",
            "type": "api",
            "conf": {
                "cryptoMode": "None"
            }
        },
        {
            "id": 6,
            "name": "RecoverPlayerRoom",
            "type": "api",
            "conf": {
                "cryptoMode": "None"
            }
        },
        {
            "id": 5,
            "name": "RequestMatch",
            "type": "api",
            "conf": {
                "cryptoMode": "None"
            }
        }
    ],
    "types": {
        "PtlAppDismissRoom/ReqAppDismissRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/apiCrypto/Models/IAppEncryptRequest"
                    }
                }
            ]
        },
        "../../tsgf/apiCrypto/Models/IAppEncryptRequest": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/apiCrypto/Models/IBaseEncryptRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "appId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "../../tsgf/apiCrypto/Models/IBaseEncryptRequest": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "ciphertext",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "data",
                    "type": {
                        "type": "Any"
                    },
                    "optional": true
                }
            ]
        },
        "PtlAppDismissRoom/ResAppDismissRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomOnlineInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/IRoomOnlineInfo": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 10,
                    "name": "ownerPlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "roomName",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "roomType",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 3,
                    "name": "maxPlayers",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 9,
                    "name": "emptySeats",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 5,
                    "name": "isPrivate",
                    "type": {
                        "type": "Boolean"
                    }
                },
                {
                    "id": 6,
                    "name": "privateRoomJoinMode",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/EPrivateRoomJoinMode"
                    },
                    "optional": true
                },
                {
                    "id": 7,
                    "name": "gameServerUrl",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 8,
                    "name": "currGameServerPlayers",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/EPrivateRoomJoinMode": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": 0
                },
                {
                    "id": 1,
                    "value": 1
                },
                {
                    "id": 2,
                    "value": 2
                }
            ]
        },
        "PtlAuthorize/ReqAuthorize": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/apiCrypto/Models/IAppEncryptRequest"
                    }
                }
            ]
        },
        "PtlAuthorize/ResAuthorize": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "playerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "playerToken",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "base/BasePlayerResponse": {
            "type": "Interface"
        },
        "PtlCancelMatch/ReqCancelMatch": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "matchReqId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "base/BasePlayerRequest": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "playerToken",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlCancelMatch/ResCancelMatch": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                }
            ]
        },
        "PtlCreateRoom/ReqCreateRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 2,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerRequest"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/ICreateRoomPara"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/ICreateRoomPara": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/ITeamParams"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "roomName",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "ownerPlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "maxPlayers",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 3,
                    "name": "isPrivate",
                    "type": {
                        "type": "Boolean"
                    }
                },
                {
                    "id": 9,
                    "name": "privateRoomJoinMode",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/EPrivateRoomJoinMode"
                    },
                    "optional": true
                },
                {
                    "id": 10,
                    "name": "privateRoomPassword",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 6,
                    "name": "matcherKey",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 4,
                    "name": "customProperties",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 5,
                    "name": "roomType",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 7,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 11,
                    "name": "retainEmptyRoomTime",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 12,
                    "name": "retainOwnSeat",
                    "type": {
                        "type": "Boolean"
                    },
                    "optional": true
                },
                {
                    "id": 13,
                    "name": "randomRequirePlayerSyncStateInvMs",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/ITeamParams": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "fixedTeamCount",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "fixedTeamMinPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "fixedTeamMaxPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 3,
                    "name": "fixedTeamInfoList",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/room/IRoomInfo/ITeamInfo"
                        }
                    },
                    "optional": true
                },
                {
                    "id": 4,
                    "name": "freeTeamMinPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 5,
                    "name": "freeTeamMaxPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/ITeamInfo": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "id",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "name",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "minPlayers",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 3,
                    "name": "maxPlayers",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "PtlCreateRoom/ResCreateRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "roomOnlineInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                    }
                }
            ]
        },
        "PtlFilterRooms/ReqFilterRooms": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "filter",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomsFilterPara"
                    }
                },
                {
                    "id": 1,
                    "name": "skip",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "limit",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/IRoomsFilterPara": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomType",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "maxPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "roomNameLike",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 3,
                    "name": "roomNameFullMatch",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlFilterRooms/ResFilterRooms": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomsFilterRes"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/IRoomsFilterRes": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "rooms",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                        }
                    }
                },
                {
                    "id": 1,
                    "name": "count",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "PtlGetOrCreateRoom/ReqGetOrCreateRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 2,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerRequest"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IGetOrCreateRoomPara"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/IGetOrCreateRoomPara": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "matchRoomType",
                    "type": {
                        "type": "Boolean"
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "matchMaxPlayers",
                    "type": {
                        "type": "Boolean"
                    },
                    "optional": true
                },
                {
                    "id": 3,
                    "name": "matchLimitRoomCount",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "createRoomPara",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/ICreateRoomPara"
                    }
                }
            ]
        },
        "PtlGetOrCreateRoom/ResGetOrCreateRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 2,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IGetOrCreateRoomRsp"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/IGetOrCreateRoomRsp": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "matchRoomOnlineInfoList",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                        }
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "createRoomOnlineInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                    },
                    "optional": true
                }
            ]
        },
        "PtlGetRoomOnlineInfo/ReqGetRoomOnlineInfo": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlGetRoomOnlineInfo/ResGetRoomOnlineInfo": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "roomOnlineInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                    }
                }
            ]
        },
        "PtlOwnDismissRoom/ReqOwnDismissRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlOwnDismissRoom/ResOwnDismissRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "roomOnlineInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                    }
                }
            ]
        },
        "PtlQueryMatch/ReqQueryMatch": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "matchReqId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlQueryMatch/ResQueryMatch": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "hasResult",
                    "type": {
                        "type": "Boolean"
                    }
                },
                {
                    "id": 3,
                    "name": "errMsg",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 4,
                    "name": "errCode",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "matchResult",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/match/Models/IMatchResult"
                    },
                    "optional": true
                }
            ]
        },
        "../../tsgf/match/Models/IMatchResult": {
            "type": "Interface",
            "properties": [
                {
                    "id": 1,
                    "name": "gameServerUrl",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 0,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "matchPlayerResults",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/match/Models/IMatchPlayerResult"
                        }
                    }
                }
            ]
        },
        "../../tsgf/match/Models/IMatchPlayerResult": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "playerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "teamId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlRecoverPlayerRoom/ReqRecoverPlayerRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "playerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "playerToken",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "updateShowName",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlRecoverPlayerRoom/ResRecoverPlayerRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 3,
                    "name": "roomOnlineInfo",
                    "type": {
                        "type": "Union",
                        "members": [
                            {
                                "id": 0,
                                "type": {
                                    "type": "Reference",
                                    "target": "../../tsgf/room/IRoomInfo/IRoomOnlineInfo"
                                }
                            },
                            {
                                "id": 1,
                                "type": {
                                    "type": "Literal",
                                    "literal": null
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "PtlRequestMatch/ReqRequestMatch": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "matchParams",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/match/Models/IMatchParamsFromPlayer"
                    }
                }
            ]
        },
        "../../tsgf/match/Models/IMatchParamsFromPlayer": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/match/Models/IMatchParamsBase"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "matchFromType",
                    "type": {
                        "type": "Literal",
                        "literal": "Player"
                    }
                },
                {
                    "id": 1,
                    "name": "matchFromInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/match/Models/IMatchFromPlayer"
                    }
                }
            ]
        },
        "../../tsgf/match/Models/IMatchParamsBase": {
            "type": "Interface",
            "properties": [
                {
                    "id": 6,
                    "name": "matchType",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 0,
                    "name": "matcherKey",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 4,
                    "name": "matcherParams",
                    "type": {
                        "type": "Any"
                    }
                },
                {
                    "id": 2,
                    "name": "matchTimeoutSec",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 3,
                    "name": "maxPlayers",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 5,
                    "name": "teamParams",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/ITeamParams"
                    },
                    "optional": true
                }
            ]
        },
        "../../tsgf/match/Models/EMatchFromType": {
            "type": "Enum",
            "members": [
                {
                    "id": 3,
                    "value": "Player"
                },
                {
                    "id": 4,
                    "value": "RoomJoinUs"
                },
                {
                    "id": 5,
                    "value": "RoomAllPlayers"
                }
            ]
        },
        "../../tsgf/match/Models/IMatchFromPlayer": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "playerIds",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "String"
                        }
                    }
                }
            ]
        },
        "PtlRequestMatch/ResRequestMatch": {
            "type": "Interface",
            "extends": [
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "base/BasePlayerResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "matchReqId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        }
    }
};

function formatObj(obj) {
    if (obj.stack) {
        return obj.stack;
    }
    else if (typeof (obj) === 'object') {
        return JSON.stringify(obj, null, 4);
    }
    return obj;
}
function objArrJoin(arr) {
    let str = "", sp = "";
    for (let i = 0; i < arr.length; i++) {
        str += sp;
        str += formatObj(arr[i]);
        sp = "\n";
    }
    return str;
}
const logger = {
    ignoreKeys: ["SyncFrame", "ClusterSyncNodeInfo", "InpFrame", "AfterFrames", "SyncState"],
    debug(...args) {
        // 什么也不做，相当于隐藏了日志
    },
    log(...args) {
        if (!args || args.length <= 0)
            return;
        // 让日志仍然输出到控制台
        if (args.find(a => a && a.indexOf && this.ignoreKeys.find(k => a.indexOf(k) > -1))) {
            //有忽略的关键字，跳过
            return;
        }
        console.log(new Date().toLocaleString() + "|" + objArrJoin(args));
        //console.log(...args);
    },
    warn(...args) {
        if (!args || args.length <= 0)
            return;
        console.warn(new Date().toLocaleString() + "|" + objArrJoin(args));
        //console.warn(...args);
    },
    error(...args) {
        if (!args || args.length <= 0)
            return;
        console.error(new Date().toLocaleString() + "|" + objArrJoin(args));
        //console.error(...args);
    },
};

/**
 * 基础的大厅服务器api的客户端封装
 */
class HallClient extends AHttpClient {
    constructor(serverUrl, timeout) {
        super(serviceProto$1, {
            server: serverUrl,
            json: true,
            logger: logger,
            timeout,
        });
        this.client.flows.preCallApiFlow.push((v) => {
            return v;
        });
    }
    /**
     * 认证并返回尝试恢复玩家房间信息，如果玩家还被保留在房间中,则返回之前所在房间id,需要再调用GameClient的重连方法
     * @param playerId
     * @param playerToken
     * @param updateShowName 可更新玩家显示名
     * @returns player room
     */
    async recoverPlayerRoom(playerId, playerToken, updateShowName) {
        var _a;
        const ret = await this.client.callApi("RecoverPlayerRoom", {
            playerId: playerId,
            playerToken: playerToken,
            updateShowName: updateShowName,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_a = ret.err.code) !== null && _a !== void 0 ? _a : 1));
        }
        return Result.buildSucc(ret.res.roomOnlineInfo);
    }
    /**
     * 创建房间，并获得分配的游戏服务器，得到后用游戏服务器客户端进行连接
     * @param playerToken
     * @param createPa
     * @returns 返回是否有错误消息,null表示成功
     */
    async createRoom(playerToken, createPa) {
        var _a;
        let para = createPa;
        para.playerToken = playerToken;
        const ret = await this.client.callApi("CreateRoom", para);
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_a = ret.err.code) !== null && _a !== void 0 ? _a : 1));
        }
        return Result.buildSucc(ret.res.roomOnlineInfo);
    }
    /**
     * 获取房间的在线信息，然后需要用游戏服务器客户端连接再加入房间
     * @param playerToken
     * @param createPa
     * @returns 返回是否有错误消息,null表示成功
     */
    async getRoomOnlineInfo(playerToken, roomId) {
        var _a;
        const ret = await this.client.callApi("GetRoomOnlineInfo", {
            playerToken: playerToken,
            roomId: roomId
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_a = ret.err.code) !== null && _a !== void 0 ? _a : 1));
        }
        return Result.buildSucc(ret.res.roomOnlineInfo);
    }
    /**
     * 获取或创建符合条件的房间
     * @param playerToken
     * @param createPa
     * @returns 返回是否有错误消息,null表示成功
     */
    async getOrCreateRoom(playerToken, para) {
        var _a;
        const ret = await this.client.callApi("GetOrCreateRoom", {
            ...para,
            playerToken,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_a = ret.err.code) !== null && _a !== void 0 ? _a : 1));
        }
        return Result.buildSucc(ret.res);
    }
    /**
     * 请求匹配，返回匹配请求ID，用queryMatch查询匹配结果，建议2秒一次查询
     * @param playerToken
     * @param matchParams
     * @returns 返回是否有错误消息,null表示成功
     */
    async requestMatch(playerToken, matchParams) {
        var _a;
        const ret = await this.client.callApi("RequestMatch", {
            playerToken: playerToken,
            matchParams: matchParams,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_a = ret.err.code) !== null && _a !== void 0 ? _a : 1));
        }
        return Result.buildSucc(ret.res.matchReqId);
    }
    /**
     * 查询匹配结果, null表示结果还没出. 建议2秒一次查询. 因为请求时超时时间已知，所以客户端要做好请求超时判断
     * @param matchReqId
     * @returns 返回结果对象
     */
    async queryMatch(playerToken, matchReqId) {
        var _a;
        const ret = await this.client.callApi("QueryMatch", {
            playerToken: playerToken,
            matchReqId: matchReqId,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_a = ret.err.code) !== null && _a !== void 0 ? _a : 1));
        }
        if (!ret.res.hasResult)
            return null;
        if (ret.res.errMsg) {
            return Result.buildErr(ret.res.errMsg, ret.res.errCode);
        }
        if (ret.res.matchResult) {
            return Result.buildSucc(ret.res.matchResult);
        }
        return Result.buildErr("未知结果！");
    }
    /**
     * 取消匹配请求
     * @param matchReqId
     * @returns 返回结果对象
     */
    async cancelMatch(playerToken, matchReqId) {
        var _a;
        const ret = await this.client.callApi("CancelMatch", {
            playerToken: playerToken,
            matchReqId: matchReqId,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_a = ret.err.code) !== null && _a !== void 0 ? _a : 1));
        }
        return Result.buildSucc(null);
    }
    /**
     * 筛选在线房间列表
     * @param playerToken
     * @param filter
     * @param [skip]
     * @param [limit]
     */
    async filterRooms(playerToken, filter, skip, limit) {
        var _a;
        const ret = await this.client.callApi("FilterRooms", {
            playerToken,
            filter,
            skip,
            limit,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_a = ret.err.code) !== null && _a !== void 0 ? _a : 1));
        }
        return Result.buildSucc(ret.res);
    }
    /**
     * 房主直接解散自己的房间
     * @param playerToken
     * @param roomId
     */
    async ownDismissRoom(playerToken, roomId) {
        var _a;
        const ret = await this.client.callApi("OwnDismissRoom", {
            playerToken: playerToken,
            roomId: roomId
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_a = ret.err.code) !== null && _a !== void 0 ? _a : 1));
        }
        return Result.buildSucc(ret.res.roomOnlineInfo);
    }
}

const serviceProto = {
    "version": 70,
    "services": [
        {
            "id": 13,
            "name": "Disconnect",
            "type": "msg"
        },
        {
            "id": 40,
            "name": "NotifyChangeCustomPlayerProfile",
            "type": "msg"
        },
        {
            "id": 34,
            "name": "NotifyChangeCustomPlayerStatus",
            "type": "msg"
        },
        {
            "id": 33,
            "name": "NotifyChangePlayerNetworkState",
            "type": "msg"
        },
        {
            "id": 42,
            "name": "NotifyChangePlayerTeam",
            "type": "msg"
        },
        {
            "id": 35,
            "name": "NotifyChangeRoom",
            "type": "msg"
        },
        {
            "id": 16,
            "name": "NotifyDismissRoom",
            "type": "msg"
        },
        {
            "id": 17,
            "name": "NotifyJoinRoom",
            "type": "msg"
        },
        {
            "id": 55,
            "name": "NotifyKicked",
            "type": "msg"
        },
        {
            "id": 18,
            "name": "NotifyLeaveRoom",
            "type": "msg"
        },
        {
            "id": 48,
            "name": "NotifyRoomAllPlayersMatchResult",
            "type": "msg"
        },
        {
            "id": 49,
            "name": "NotifyRoomAllPlayersMatchStart",
            "type": "msg"
        },
        {
            "id": 19,
            "name": "NotifyRoomMsg",
            "type": "msg"
        },
        {
            "id": 23,
            "name": "NotifyStartFrameSync",
            "type": "msg"
        },
        {
            "id": 24,
            "name": "NotifyStopFrameSync",
            "type": "msg"
        },
        {
            "id": 25,
            "name": "NotifySyncFrame",
            "type": "msg"
        },
        {
            "id": 26,
            "name": "PlayerInpFrame",
            "type": "msg"
        },
        {
            "id": 27,
            "name": "PlayerSendSyncState",
            "type": "msg"
        },
        {
            "id": 28,
            "name": "RequirePlayerSyncState",
            "type": "msg"
        },
        {
            "id": 14,
            "name": "Authorize",
            "type": "api"
        },
        {
            "id": 47,
            "name": "CancelMatch",
            "type": "api"
        },
        {
            "id": 41,
            "name": "ChangeCustomPlayerProfile",
            "type": "api"
        },
        {
            "id": 37,
            "name": "ChangeCustomPlayerStatus",
            "type": "api"
        },
        {
            "id": 43,
            "name": "ChangePlayerTeam",
            "type": "api"
        },
        {
            "id": 38,
            "name": "ChangeRoom",
            "type": "api"
        },
        {
            "id": 51,
            "name": "CreateRoomRobot",
            "type": "api"
        },
        {
            "id": 20,
            "name": "DismissRoom",
            "type": "api"
        },
        {
            "id": 15,
            "name": "JoinRoom",
            "type": "api"
        },
        {
            "id": 54,
            "name": "KickPlayer",
            "type": "api"
        },
        {
            "id": 21,
            "name": "LeaveRoom",
            "type": "api"
        },
        {
            "id": 50,
            "name": "QueryMatch",
            "type": "api"
        },
        {
            "id": 6,
            "name": "Reconnect",
            "type": "api"
        },
        {
            "id": 32,
            "name": "RequestAfterFrames",
            "type": "api"
        },
        {
            "id": 29,
            "name": "RequestFrames",
            "type": "api"
        },
        {
            "id": 44,
            "name": "RequestMatch",
            "type": "api"
        },
        {
            "id": 52,
            "name": "RoomRobotLeave",
            "type": "api"
        },
        {
            "id": 22,
            "name": "SendRoomMsg",
            "type": "api"
        },
        {
            "id": 30,
            "name": "StartFrameSync",
            "type": "api"
        },
        {
            "id": 31,
            "name": "StopFrameSync",
            "type": "api"
        }
    ],
    "types": {
        "MsgDisconnect/MsgDisconnect": {
            "type": "Interface"
        },
        "MsgNotifyChangeCustomPlayerProfile/MsgNotifyChangeCustomPlayerProfile": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IChangeCustomPlayerProfile"
                    }
                }
            ]
        },
        "../../tsgf/player/IPlayerInfo/IChangeCustomPlayerProfile": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "changePlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "customPlayerProfile",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "oldCustomPlayerProfile",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 3,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/IRoomInfo": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "roomName",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "ownerPlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 3,
                    "name": "isPrivate",
                    "type": {
                        "type": "Boolean"
                    }
                },
                {
                    "id": 20,
                    "name": "privateRoomJoinMode",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/EPrivateRoomJoinMode"
                    },
                    "optional": true
                },
                {
                    "id": 14,
                    "name": "matcherKey",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 5,
                    "name": "createType",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/ERoomCreateType"
                    }
                },
                {
                    "id": 6,
                    "name": "maxPlayers",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 7,
                    "name": "roomType",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 8,
                    "name": "customProperties",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 19,
                    "name": "allPlayerMatchReqId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 9,
                    "name": "playerList",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/player/IPlayerInfo/IPlayerInfo"
                        }
                    }
                },
                {
                    "id": 15,
                    "name": "teamList",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/room/IRoomInfo/ITeamInfo"
                        }
                    }
                },
                {
                    "id": 16,
                    "name": "fixedTeamCount",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 17,
                    "name": "freeTeamMinPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 18,
                    "name": "freeTeamMaxPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 10,
                    "name": "frameRate",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 11,
                    "name": "frameSyncState",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/EFrameSyncState"
                    }
                },
                {
                    "id": 12,
                    "name": "createTime",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 13,
                    "name": "startGameTime",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 21,
                    "name": "retainEmptyRoomTime",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 22,
                    "name": "retainOwnSeat",
                    "type": {
                        "type": "Boolean"
                    }
                },
                {
                    "id": 23,
                    "name": "randomRequirePlayerSyncStateInvMs",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/EPrivateRoomJoinMode": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": 0
                },
                {
                    "id": 1,
                    "value": 1
                },
                {
                    "id": 2,
                    "value": 2
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/ERoomCreateType": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": 0
                },
                {
                    "id": 1,
                    "value": 1
                }
            ]
        },
        "../../tsgf/player/IPlayerInfo/IPlayerInfo": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "playerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "showName",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "teamId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 3,
                    "name": "customPlayerStatus",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 9,
                    "name": "customPlayerProfile",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 8,
                    "name": "networkState",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/ENetworkState"
                    }
                },
                {
                    "id": 7,
                    "name": "isRobot",
                    "type": {
                        "type": "Boolean"
                    }
                },
                {
                    "id": 10,
                    "name": "roomRobotIds",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "String"
                        }
                    },
                    "optional": true
                }
            ]
        },
        "../../tsgf/player/IPlayerInfo/ENetworkState": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": 0
                },
                {
                    "id": 1,
                    "value": 1
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/ITeamInfo": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "id",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "name",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "minPlayers",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 3,
                    "name": "maxPlayers",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/EFrameSyncState": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": 0
                },
                {
                    "id": 1,
                    "value": 1
                }
            ]
        },
        "MsgNotifyChangeCustomPlayerStatus/MsgNotifyChangeCustomPlayerStatus": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IChangeCustomPlayerStatus"
                    }
                }
            ]
        },
        "../../tsgf/player/IPlayerInfo/IChangeCustomPlayerStatus": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "changePlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "customPlayerStatus",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "oldCustomPlayerStatus",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 3,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "MsgNotifyChangePlayerNetworkState/MsgNotifyChangePlayerNetworkState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                },
                {
                    "id": 1,
                    "name": "changePlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "networkState",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/ENetworkState"
                    }
                }
            ]
        },
        "MsgNotifyChangePlayerTeam/MsgNotifyChangePlayerTeam": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IChangePlayerTeam"
                    }
                }
            ]
        },
        "../../tsgf/player/IPlayerInfo/IChangePlayerTeam": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "changePlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "teamId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "oldTeamId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 3,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "MsgNotifyChangeRoom/MsgNotifyChangeRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "MsgNotifyDismissRoom/MsgNotifyDismissRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "MsgNotifyJoinRoom/MsgNotifyJoinRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 1,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                },
                {
                    "id": 2,
                    "name": "joinPlayerId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "MsgNotifyKicked/MsgNotifyKicked": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "MsgNotifyLeaveRoom/MsgNotifyLeaveRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 2,
                    "name": "leavePlayerInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IPlayerInfo"
                    }
                },
                {
                    "id": 1,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "MsgNotifyRoomAllPlayersMatchResult/MsgNotifyRoomAllPlayersMatchResult": {
            "type": "Interface",
            "properties": [
                {
                    "id": 3,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                },
                {
                    "id": 0,
                    "name": "errMsg",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "errCode",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "matchResult",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/match/Models/IMatchPlayerResultWithServer"
                    },
                    "optional": true
                }
            ]
        },
        "../../tsgf/match/Models/IMatchPlayerResultWithServer": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "gameServerUrl",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "teamId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "MsgNotifyRoomAllPlayersMatchStart/MsgNotifyRoomAllPlayersMatchStart": {
            "type": "Interface",
            "properties": [
                {
                    "id": 3,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                },
                {
                    "id": 0,
                    "name": "matchReqId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "reqPlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "matchParams",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/match/Models/IMatchParamsFromRoomAllPlayer"
                    }
                }
            ]
        },
        "../../tsgf/match/Models/IMatchParamsFromRoomAllPlayer": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/match/Models/IMatchParamsBase"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "matchFromType",
                    "type": {
                        "type": "Literal",
                        "literal": "RoomAllPlayers"
                    }
                },
                {
                    "id": 1,
                    "name": "matchFromInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/match/Models/IMatchFromRoomAllPlayers"
                    }
                }
            ]
        },
        "../../tsgf/match/Models/IMatchParamsBase": {
            "type": "Interface",
            "properties": [
                {
                    "id": 5,
                    "name": "matchType",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 0,
                    "name": "matcherKey",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "matcherParams",
                    "type": {
                        "type": "Any"
                    }
                },
                {
                    "id": 2,
                    "name": "matchTimeoutSec",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 3,
                    "name": "maxPlayers",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 4,
                    "name": "teamParams",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/ITeamParams"
                    },
                    "optional": true
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/ITeamParams": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "fixedTeamCount",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "fixedTeamMinPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "fixedTeamMaxPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 3,
                    "name": "fixedTeamInfoList",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/room/IRoomInfo/ITeamInfo"
                        }
                    },
                    "optional": true
                },
                {
                    "id": 4,
                    "name": "freeTeamMinPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 5,
                    "name": "freeTeamMaxPlayers",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "../../tsgf/match/Models/EMatchFromType": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": "Player"
                },
                {
                    "id": 1,
                    "value": "RoomJoinUs"
                },
                {
                    "id": 2,
                    "value": "RoomAllPlayers"
                }
            ]
        },
        "../../tsgf/match/Models/IMatchFromRoomAllPlayers": {
            "type": "Interface"
        },
        "MsgNotifyRoomMsg/MsgNotifyRoomMsg": {
            "type": "Interface",
            "properties": [
                {
                    "id": 3,
                    "name": "recvRoomMsg",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomMsg/IRecvRoomMsg"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomMsg/IRecvRoomMsg": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "fromPlayerInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IPlayerInfo"
                    }
                },
                {
                    "id": 1,
                    "name": "msg",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "recvType",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomMsg/ERoomMsgRecvType"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomMsg/ERoomMsgRecvType": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": 1
                },
                {
                    "id": 1,
                    "value": 2
                },
                {
                    "id": 2,
                    "value": 3
                }
            ]
        },
        "MsgNotifyStartFrameSync/MsgNotifyStartFrameSync": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "startPlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "MsgNotifyStopFrameSync/MsgNotifyStopFrameSync": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "stopPlayerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "MsgNotifySyncFrame/MsgNotifySyncFrame": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "syncFrame",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IGameFrame/IGameSyncFrame"
                    }
                },
                {
                    "id": 1,
                    "name": "dt",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "../../tsgf/room/IGameFrame/IGameSyncFrame": {
            "type": "Interface",
            "properties": [
                {
                    "id": 1,
                    "name": "frameIndex",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 0,
                    "name": "playerInputs",
                    "type": {
                        "type": "Union",
                        "members": [
                            {
                                "id": 0,
                                "type": {
                                    "type": "Array",
                                    "elementType": {
                                        "type": "Reference",
                                        "target": "../../tsgf/room/IGameFrame/IFramePlayerInput"
                                    }
                                }
                            },
                            {
                                "id": 1,
                                "type": {
                                    "type": "Literal",
                                    "literal": null
                                }
                            }
                        ]
                    }
                }
            ],
            "indexSignature": {
                "keyType": "String",
                "type": {
                    "type": "Any"
                }
            }
        },
        "../../tsgf/room/IGameFrame/IFramePlayerInput": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "playerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "inputFrameType",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IGameFrame/EPlayerInputFrameType"
                    }
                },
                {
                    "id": 2,
                    "name": "operates",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/room/IGameFrame/IPlayerInputOperate"
                        }
                    },
                    "optional": true
                }
            ],
            "indexSignature": {
                "keyType": "String",
                "type": {
                    "type": "Any"
                }
            }
        },
        "../../tsgf/room/IGameFrame/EPlayerInputFrameType": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": 1
                },
                {
                    "id": 1,
                    "value": 2
                },
                {
                    "id": 2,
                    "value": 3
                },
                {
                    "id": 3,
                    "value": 4
                }
            ]
        },
        "../../tsgf/room/IGameFrame/IPlayerInputOperate": {
            "type": "Interface",
            "indexSignature": {
                "keyType": "String",
                "type": {
                    "type": "Any"
                }
            }
        },
        "MsgPlayerInpFrame/MsgPlayerInpFrame": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "operates",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/room/IGameFrame/IPlayerInputOperate"
                        }
                    }
                },
                {
                    "id": 1,
                    "name": "robotPlayerId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "MsgPlayerSendSyncState/MsgPlayerSendSyncState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "stateData",
                    "type": {
                        "type": "Any"
                    }
                },
                {
                    "id": 1,
                    "name": "stateFrameIndex",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "MsgRequirePlayerSyncState/MsgRequirePlayerSyncState": {
            "type": "Interface"
        },
        "PtlAuthorize/ReqAuthorize": {
            "type": "Interface",
            "extends": [
                {
                    "id": 3,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IPlayerInfoPara"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "playerToken",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "roomWaitReconnectTime",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "../../tsgf/player/IPlayerInfo/IPlayerInfoPara": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "showName",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "customPlayerStatus",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "customPlayerProfile",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlAuthorize/ResAuthorize": {
            "type": "Interface",
            "properties": [
                {
                    "id": 1,
                    "name": "playerInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IPlayerInfo"
                    }
                }
            ]
        },
        "PtlCancelMatch/ReqCancelMatch": {
            "type": "Interface"
        },
        "PtlCancelMatch/ResCancelMatch": {
            "type": "Interface"
        },
        "PtlChangeCustomPlayerProfile/ReqChangeCustomPlayerProfile": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "customPlayerProfile",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "robotPlayerId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlChangeCustomPlayerProfile/ResChangeCustomPlayerProfile": {
            "type": "Interface"
        },
        "PtlChangeCustomPlayerStatus/ReqChangeCustomPlayerStatus": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "customPlayerStatus",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "robotPlayerId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlChangeCustomPlayerStatus/ResChangeCustomPlayerStatus": {
            "type": "Interface"
        },
        "PtlChangePlayerTeam/ReqChangePlayerTeam": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "newTeamId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "robotPlayerId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlChangePlayerTeam/ResChangePlayerTeam": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "PtlChangeRoom/ReqChangeRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IChangeRoomPara"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/IChangeRoomPara": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomName",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "isPrivate",
                    "type": {
                        "type": "Boolean"
                    },
                    "optional": true
                },
                {
                    "id": 5,
                    "name": "privateRoomJoinMode",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/EPrivateRoomJoinMode"
                    },
                    "optional": true
                },
                {
                    "id": 6,
                    "name": "privateRoomPassword",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 4,
                    "name": "customProperties",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlChangeRoom/ResChangeRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "PtlCreateRoomRobot/ReqCreateRoomRobot": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "createPa",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IPlayerInfoPara"
                    }
                },
                {
                    "id": 1,
                    "name": "teamId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlCreateRoomRobot/ResCreateRoomRobot": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "robotInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IPlayerInfo"
                    }
                }
            ]
        },
        "PtlDismissRoom/ReqDismissRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlDismissRoom/ResDismissRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "PtlJoinRoom/ReqJoinRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IJoinRoomPara"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomInfo/IJoinRoomPara": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "teamId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "password",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlJoinRoom/ResJoinRoom": {
            "type": "Interface",
            "properties": [
                {
                    "id": 2,
                    "name": "roomInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                    }
                }
            ]
        },
        "PtlKickPlayer/ReqKickPlayer": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "playerId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlKickPlayer/ResKickPlayer": {
            "type": "Interface"
        },
        "PtlLeaveRoom/ReqLeaveRoom": {
            "type": "Interface"
        },
        "PtlLeaveRoom/ResLeaveRoom": {
            "type": "Interface"
        },
        "PtlQueryMatch/ReqQueryMatch": {
            "type": "Interface"
        },
        "PtlQueryMatch/ResQueryMatch": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "matchResult",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/match/Models/IMatchResult"
                    }
                }
            ]
        },
        "../../tsgf/match/Models/IMatchResult": {
            "type": "Interface",
            "properties": [
                {
                    "id": 1,
                    "name": "gameServerUrl",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 0,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "matchPlayerResults",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/match/Models/IMatchPlayerResult"
                        }
                    }
                }
            ]
        },
        "../../tsgf/match/Models/IMatchPlayerResult": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "playerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "teamId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlReconnect/ReqReconnect": {
            "type": "Interface",
            "properties": [
                {
                    "id": 2,
                    "name": "playerToken",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 3,
                    "name": "roomWaitReconnectTime",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "PtlReconnect/ResReconnect": {
            "type": "Interface",
            "properties": [
                {
                    "id": 1,
                    "name": "playerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 0,
                    "name": "currRoomInfo",
                    "type": {
                        "type": "Union",
                        "members": [
                            {
                                "id": 0,
                                "type": {
                                    "type": "Reference",
                                    "target": "../../tsgf/room/IRoomInfo/IRoomInfo"
                                }
                            },
                            {
                                "id": 1,
                                "type": {
                                    "type": "Literal",
                                    "literal": null
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "PtlRequestAfterFrames/ReqRequestAfterFrames": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "startFrameIndex",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "PtlRequestAfterFrames/ResRequestAfterFrames": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IGameFrame/IAfterFrames"
                    }
                }
            ]
        },
        "../../tsgf/room/IGameFrame/IAfterFrames": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "stateData",
                    "type": {
                        "type": "Any"
                    }
                },
                {
                    "id": 1,
                    "name": "stateFrameIndex",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "afterFrames",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/room/IGameFrame/IGameSyncFrame"
                        }
                    }
                },
                {
                    "id": 5,
                    "name": "afterStartFrameIndex",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 6,
                    "name": "afterEndFrameIndex",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 4,
                    "name": "serverSyncFrameRate",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "PtlRequestFrames/ReqRequestFrames": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "beginFrameIndex",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "endFrameIndex",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "PtlRequestFrames/ResRequestFrames": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "frames",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../tsgf/room/IGameFrame/IGameSyncFrame"
                        }
                    }
                }
            ]
        },
        "PtlRequestMatch/ReqRequestMatch": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "matchParams",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/match/Models/IMatchParamsFromRoomAllPlayer"
                    }
                }
            ]
        },
        "PtlRequestMatch/ResRequestMatch": {
            "type": "Interface",
            "properties": [
                {
                    "id": 4,
                    "name": "matchReqId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlRoomRobotLeave/ReqRoomRobotLeave": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "robotPlayerId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlRoomRobotLeave/ResRoomRobotLeave": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "robotInfo",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/player/IPlayerInfo/IPlayerInfo"
                    }
                }
            ]
        },
        "PtlSendRoomMsg/ReqSendRoomMsg": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "roomMsg",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomMsg/IRoomMsg"
                    }
                },
                {
                    "id": 1,
                    "name": "robotPlayerId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "../../tsgf/room/IRoomMsg/IRoomMsg": {
            "type": "Union",
            "members": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomMsg/IRoomMsgOtherPlayers"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomMsg/IRoomMsgSomePlayers"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomMsg/IRoomMsgOtherPlayers": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomMsg/IRoomMsgBase"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "recvType",
                    "type": {
                        "type": "Union",
                        "members": [
                            {
                                "id": 0,
                                "type": {
                                    "type": "Literal",
                                    "literal": 1
                                }
                            },
                            {
                                "id": 1,
                                "type": {
                                    "type": "Literal",
                                    "literal": 2
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomMsg/IRoomMsgBase": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "msg",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "recvType",
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomMsg/ERoomMsgRecvType"
                    }
                }
            ]
        },
        "../../tsgf/room/IRoomMsg/IRoomMsgSomePlayers": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../../tsgf/room/IRoomMsg/IRoomMsgBase"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "recvType",
                    "type": {
                        "type": "Literal",
                        "literal": 3
                    }
                },
                {
                    "id": 1,
                    "name": "recvPlayerList",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "String"
                        }
                    }
                }
            ]
        },
        "PtlSendRoomMsg/ResSendRoomMsg": {
            "type": "Interface"
        },
        "PtlStartFrameSync/ReqStartFrameSync": {
            "type": "Interface"
        },
        "PtlStartFrameSync/ResStartFrameSync": {
            "type": "Interface"
        },
        "PtlStopFrameSync/ReqStopFrameSync": {
            "type": "Interface"
        },
        "PtlStopFrameSync/ResStopFrameSync": {
            "type": "Interface"
        }
    }
};

/**
 * 基础的游戏服务器api的客户端封装
 */
class GameClient extends AWsClient {
    get playerToken() {
        return this._playerToken;
    }
    get playerId() {
        return this._playerId;
    }
    /**当前所在的房间, 各种操作会自动维护本属性值为最新*/
    get currRoomInfo() {
        return this._currRoomInfo;
    }
    set currRoomInfo(roomInfo) {
        var _a, _b;
        this._currRoomInfo = roomInfo;
        this._currPlayerInfo = (_b = (_a = this._currRoomInfo) === null || _a === void 0 ? void 0 : _a.playerList.find(p => p.playerId === this._playerId)) !== null && _b !== void 0 ? _b : null;
    }
    /**当前玩家信息对象*/
    get currPlayerInfo() {
        return this._currPlayerInfo;
    }
    /**
     *
     * @param _playerToken 服务端调用大厅授权接口，获得玩家授权令牌
     * @param reqTimeout 请求超时毫秒数
     * @param roomWaitReconnectTime 可设置房间中断线后等待重连的毫秒数(认证和重连时使用),默认为60000ms(60秒),设成0表示断线后直接清理(按退出房间处理)不等待重连
     * @param serverUrl
     */
    constructor(serverUrl, _playerToken, reqTimeout, roomWaitReconnectTime) {
        super(serviceProto, {
            server: serverUrl,
            json: false,
            logger: logger,
            timeout: reqTimeout,
        });
        this._currRoomInfo = null;
        this._currPlayerInfo = null;
        /**是否启用断线重连*/
        this.enabledReconnect = true;
        /**
         * 断线重连等待秒数
         */
        this.reconnectWaitSec = 2;
        this._playerToken = _playerToken;
        this._playerId = "";
        this.roomWaitReconnectTime = roomWaitReconnectTime;
        //设置断线重连的中间件
        this.client.flows.postDisconnectFlow.push(async (v) => {
            var _a, _b, _c, _d, _e;
            //如果都没连上过就断开,那么忽略
            if (!this._playerId)
                return v;
            //判断是否需要重连
            if (!v.isManual) {
                if (this.enabledReconnect) {
                    //启用断线重连
                    (_a = this.onReconnectStart) === null || _a === void 0 ? void 0 : _a.call(this, 0);
                    if (this.reconnectTimerHD)
                        clearTimeout(this.reconnectTimerHD);
                    this.reconnectTimerHD = setTimeout(async () => this.startReconnect(0, true), this.reconnectWaitSec * 1000);
                    return v;
                }
                //被断开,并且没启用断线重连
                if (this.currRoomInfo) {
                    //如果被断开时,有在房间中,则先触发离开房间
                    (_b = this.onLeaveRoom) === null || _b === void 0 ? void 0 : _b.call(this, this.currRoomInfo);
                }
                (_c = this.onDisconnected) === null || _c === void 0 ? void 0 : _c.call(this, v.reason);
            }
            else {
                //主动断开
                (_d = this.onDisconnected) === null || _d === void 0 ? void 0 : _d.call(this, (_e = v.reason) !== null && _e !== void 0 ? _e : 'ManualDisconnect');
            }
            //确认彻底断开了,清理数据
            this.clearData();
            return v;
        });
        this.client.listenMsg("NotifyRoomMsg", (msg) => {
            var _a;
            (_a = this.onRecvRoomMsg) === null || _a === void 0 ? void 0 : _a.call(this, msg.recvRoomMsg);
        });
        this.client.listenMsg("NotifyJoinRoom", (msg) => {
            var _a;
            this.currRoomInfo = msg.roomInfo;
            let joinPlayer = this.currRoomInfo.playerList.find(p => p.playerId === msg.joinPlayerId);
            (_a = this.onPlayerJoinRoom) === null || _a === void 0 ? void 0 : _a.call(this, joinPlayer, this.currRoomInfo);
        });
        this.client.listenMsg("NotifyLeaveRoom", (msg) => {
            var _a;
            this.currRoomInfo = msg.roomInfo;
            (_a = this.onPlayerLeaveRoom) === null || _a === void 0 ? void 0 : _a.call(this, msg.leavePlayerInfo, this.currRoomInfo);
        });
        this.client.listenMsg("NotifyKicked", (msg) => {
            var _a;
            this.currRoomInfo = msg.roomInfo;
            (_a = this.onKicked) === null || _a === void 0 ? void 0 : _a.call(this, this.currRoomInfo);
        });
        this.client.listenMsg("NotifyDismissRoom", (msg) => {
            var _a, _b;
            if (this.currRoomInfo) {
                (_a = this.onLeaveRoom) === null || _a === void 0 ? void 0 : _a.call(this, this.currRoomInfo);
            }
            this.currRoomInfo = null;
            (_b = this.onDismissRoom) === null || _b === void 0 ? void 0 : _b.call(this, msg.roomInfo);
        });
        this.client.listenMsg("NotifyStartFrameSync", (msg) => {
            var _a;
            this.currRoomInfo = msg.roomInfo;
            (_a = this.onStartFrameSync) === null || _a === void 0 ? void 0 : _a.call(this, this.currRoomInfo, this.currRoomInfo.playerList.find(p => p.playerId === msg.startPlayerId));
        });
        this.client.listenMsg("NotifyStopFrameSync", (msg) => {
            var _a;
            this.currRoomInfo = msg.roomInfo;
            (_a = this.onStopFrameSync) === null || _a === void 0 ? void 0 : _a.call(this, this.currRoomInfo, this.currRoomInfo.playerList.find(p => p.playerId === msg.stopPlayerId));
        });
        this.client.listenMsg("NotifySyncFrame", (msg) => {
            var _a;
            (_a = this.onRecvFrame) === null || _a === void 0 ? void 0 : _a.call(this, msg.syncFrame, msg.dt);
        });
        this.client.listenMsg("RequirePlayerSyncState", (msg) => {
            var _a;
            (_a = this.onRequirePlayerSyncState) === null || _a === void 0 ? void 0 : _a.call(this);
        });
        this.client.listenMsg("NotifyChangeRoom", (msg) => {
            var _a;
            this.currRoomInfo = msg.roomInfo;
            (_a = this.onChangeRoom) === null || _a === void 0 ? void 0 : _a.call(this, this.currRoomInfo);
        });
        this.client.listenMsg("NotifyChangePlayerNetworkState", (msg) => {
            var _a;
            this.currRoomInfo = msg.roomInfo;
            let player = this.currRoomInfo.playerList.find(p => p.playerId === msg.changePlayerId);
            (_a = this.onChangePlayerNetworkState) === null || _a === void 0 ? void 0 : _a.call(this, player);
        });
        this.client.listenMsg("NotifyChangeCustomPlayerProfile", (msg) => {
            var _a;
            this.currRoomInfo = msg.roomInfo;
            (_a = this.onChangeCustomPlayerProfile) === null || _a === void 0 ? void 0 : _a.call(this, msg);
        });
        this.client.listenMsg("NotifyChangeCustomPlayerStatus", (msg) => {
            var _a;
            this.currRoomInfo = msg.roomInfo;
            (_a = this.onChangeCustomPlayerStatus) === null || _a === void 0 ? void 0 : _a.call(this, msg);
        });
        this.client.listenMsg("NotifyChangePlayerTeam", (msg) => {
            var _a;
            this.currRoomInfo = msg.roomInfo;
            (_a = this.onChangePlayerTeam) === null || _a === void 0 ? void 0 : _a.call(this, msg);
        });
        this.client.listenMsg("NotifyRoomAllPlayersMatchStart", (msg) => {
            var _a;
            this.currRoomInfo = msg.roomInfo;
            (_a = this.onRoomAllPlayersMatchStart) === null || _a === void 0 ? void 0 : _a.call(this, msg.matchReqId, msg.reqPlayerId, msg.matchParams);
        });
        this.client.listenMsg("NotifyRoomAllPlayersMatchResult", (msg) => {
            var _a;
            this.currRoomInfo = msg.roomInfo;
            (_a = this.onRoomAllPlayersMatchResult) === null || _a === void 0 ? void 0 : _a.call(this, msg.errMsg, msg.errCode, msg.matchResult);
        });
    }
    /**
     * Disconnects game client
     * @param reason websocket的关闭原因字符串,可自定义
     * @param code websocket的关闭原因代码, 取值范围: [1000,3000-4999]
     * @returns disconnect
     */
    async disconnect(reason = 'ManualDisconnect') {
        var _a;
        this.stopReconnect();
        if (this._playerId || this.client.isConnected) {
            if (this.currRoomInfo) {
                //如果断开时,有在房间中,则先触发离开房间事件
                (_a = this.onLeaveRoom) === null || _a === void 0 ? void 0 : _a.call(this, this.currRoomInfo);
            }
            this.clearData();
            await this.client.sendMsg("Disconnect", {});
            await this.client.disconnect(1000, reason);
        }
    }
    async clearData() {
        this._playerId = '';
        this._playerToken = '';
        this._currRoomInfo = null;
        this._currPlayerInfo = null;
        this.onReconnectStart = undefined;
        this.onDisconnected = undefined;
        this.onReconnectResult = undefined;
        this.onLeaveRoom = undefined;
        this.onRecvRoomMsg = undefined;
        this.onPlayerJoinRoom = undefined;
        this.onPlayerLeaveRoom = undefined;
        this.onKicked = undefined;
        this.onDismissRoom = undefined;
        this.onStartFrameSync = undefined;
        this.onStopFrameSync = undefined;
        this.onRecvFrame = undefined;
        this.onRequirePlayerSyncState = undefined;
        this.onChangePlayerNetworkState = undefined;
        this.onChangeCustomPlayerProfile = undefined;
        this.onChangeCustomPlayerStatus = undefined;
        this.onChangeRoom = undefined;
        this.onChangePlayerTeam = undefined;
        this.onRoomAllPlayersMatchStart = undefined;
        this.onRoomAllPlayersMatchResult = undefined;
    }
    stopReconnect() {
        if (this.reconnectTimerHD) {
            clearTimeout(this.reconnectTimerHD);
            this.reconnectTimerHD = null;
        }
    }
    /**
     * Starts reconnect
     * @param currTryCount 当前重试次数
     * @param failReTry 本次失败后是否继续重试
     * @returns reconnect
     */
    async startReconnect(currTryCount = 0, failReTry = true) {
        var _a, _b, _c, _d, _e;
        const result = await this.reconnect();
        if (!this._playerToken) {
            //重连异步回来,发现已经取消
            return false;
        }
        // 重连也错误，弹出错误提示
        if (result.succ) {
            (_a = this.client.logger) === null || _a === void 0 ? void 0 : _a.log('重连成功!');
            (_b = this.onReconnectResult) === null || _b === void 0 ? void 0 : _b.call(this, true, null);
            return true;
        }
        //如果是逻辑拒绝则不需要重连
        if (!this._playerToken || result.code == exports.ErrorCodes.AuthReconnectionFail)
            failReTry = false;
        if (failReTry && this.enabledReconnect) {
            currTryCount++;
            (_c = this.onReconnectStart) === null || _c === void 0 ? void 0 : _c.call(this, currTryCount);
            (_d = this.client.logger) === null || _d === void 0 ? void 0 : _d.error('重连失败:' + result.err + ' ' + this.reconnectWaitSec + '秒后自动重连!');
            if (this.reconnectTimerHD)
                clearTimeout(this.reconnectTimerHD);
            this.reconnectTimerHD = setTimeout(() => this.startReconnect(currTryCount, failReTry), this.reconnectWaitSec * 1000);
        }
        else {
            (_e = this.client.logger) === null || _e === void 0 ? void 0 : _e.error('重连失败:' + result.err);
            let tmpOnRecRet = this.onReconnectResult; //因为disconnect会清理数据，所以这里临时记录一下，用于接着触发
            await this.disconnect('ReconnectFailed');
            tmpOnRecRet === null || tmpOnRecRet === void 0 ? void 0 : tmpOnRecRet.call(this, false, result.err);
        }
        return false;
    }
    /**
     * 断线重连, 失败的话要看code, ErrorCodes.AuthReconnectionFail 表示逻辑拒绝,不需要重连
     * @returns
     */
    async reconnect() {
        var _a, _b;
        const connectRet = await this.client.connect();
        if (!connectRet.isSucc) {
            return Result.buildErr("连接失败:" + connectRet.errMsg);
        }
        if (!this._playerToken) {
            //重连异步回来,发现已经取消
            return Result.buildErr('取消', 1);
        }
        const loginRet = await this.client.callApi("Reconnect", {
            playerToken: this._playerToken,
            roomWaitReconnectTime: this.roomWaitReconnectTime,
        });
        if (!this._playerToken) {
            //重连异步回来,发现已经取消
            await this.client.disconnect();
            return Result.buildErr('取消', 1);
        }
        if (!loginRet.isSucc) {
            // 连上了, 但重连认证失败, 直接断开
            await this.client.disconnect();
            return Result.buildErr(loginRet.err.message, ((_b = (_a = loginRet.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        this._playerId = loginRet.res.playerId;
        this.currRoomInfo = loginRet.res.currRoomInfo;
        return Result.buildSucc(null);
    }
    /**
     * 登录到游戏服务器, 失败则断开连接并清理数据
     * @param infoPara
     * @returns
     */
    async authorize(infoPara) {
        var _a, _b, _c;
        const connectRet = await this.client.connect();
        if (!connectRet.isSucc) {
            return Result.buildErr("连接失败:" + connectRet.errMsg);
        }
        let req = (_a = infoPara) !== null && _a !== void 0 ? _a : {};
        req.playerToken = this._playerToken;
        req.roomWaitReconnectTime = this.roomWaitReconnectTime;
        const loginRet = await this.client.callApi("Authorize", req);
        if (!loginRet.isSucc) {
            let errCode = ((_c = (_b = loginRet.err) === null || _b === void 0 ? void 0 : _b.code) !== null && _c !== void 0 ? _c : 1);
            this.disconnect('AuthorizeFailed');
            return Result.buildErr(loginRet.err.message, errCode);
        }
        this._playerId = loginRet.res.playerInfo.playerId;
        return Result.buildSucc(null);
    }
    /**
     * 进房间
     * @param roomId
     * @param teamId 同时加入指定队伍
     * @returns
     */
    async joinRoom(para, teamId) {
        var _a, _b, _c;
        let joinRoomPara;
        if (typeof (para) === 'string') {
            joinRoomPara = {
                roomId: para,
                teamId,
            };
        }
        else {
            joinRoomPara = para;
        }
        const ret = await this.client.callApi("JoinRoom", joinRoomPara);
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_b = (_a = ret.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        this.currRoomInfo = ret.res.roomInfo;
        (_c = this.onJoinRoom) === null || _c === void 0 ? void 0 : _c.call(this, this.currRoomInfo);
        return Result.buildSucc(ret.res.roomInfo);
    }
    /**
     * 退出当前房间
     * @returns
     */
    async leaveRoom() {
        var _a;
        const ret = await this.client.callApi("LeaveRoom", {});
        if (!ret.isSucc) ;
        if (this.currRoomInfo) {
            (_a = this.onLeaveRoom) === null || _a === void 0 ? void 0 : _a.call(this, this.currRoomInfo);
        }
        this.currRoomInfo = null;
        return Result.buildSucc(null);
    }
    /**
     * 【仅房主】踢出房间内玩家
     * @param playerId
     * @returns
     */
    async kickPlayer(playerId) {
        var _a, _b;
        if (!this.currRoomInfo)
            return Result.buildErr('当前不在房间中!');
        const ret = await this.client.callApi("KickPlayer", {
            playerId
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_b = (_a = ret.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        return Result.buildSucc(null);
    }
    /**
     * 【仅房主】解散当前房间
     * @returns
     */
    async dismissRoom() {
        var _a;
        if (!this.currRoomInfo)
            return Result.buildErr('当前不在房间中！');
        const ret = await this.client.callApi("DismissRoom", {
            roomId: this.currRoomInfo.roomId
        });
        if (!ret.isSucc) ;
        if (this.currRoomInfo) {
            (_a = this.onLeaveRoom) === null || _a === void 0 ? void 0 : _a.call(this, this.currRoomInfo);
        }
        this.currRoomInfo = null;
        return Result.buildSucc(null);
    }
    /**
     * 修改房间信息(注意,只能房主操作),同时同步更新本地当前房间信息
     *
     * @param changePara
     * @returns
     */
    async changeRoom(changePara) {
        var _a, _b;
        const ret = await this.client.callApi("ChangeRoom", changePara);
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_b = (_a = ret.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        this.currRoomInfo = ret.res.roomInfo;
        return Result.buildSucc(ret.res.roomInfo);
    }
    /**
     * 修改自己的玩家自定义属性,如果当前在房间中会同时会触发通知(房间中所有玩家)
     *
     * @param customPlayerProfile
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns
     */
    async changeCustomPlayerProfile(customPlayerProfile, robotPlayerId) {
        var _a, _b, _c;
        const ret = await this.client.callApi("ChangeCustomPlayerProfile", {
            customPlayerProfile,
            robotPlayerId,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_b = (_a = ret.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        let changePlayerInfo;
        if (robotPlayerId) {
            changePlayerInfo = (_c = this.currRoomInfo) === null || _c === void 0 ? void 0 : _c.playerList.find(p => p.playerId === robotPlayerId);
        }
        else {
            changePlayerInfo = this._currPlayerInfo;
        }
        if (changePlayerInfo)
            changePlayerInfo.customPlayerProfile = customPlayerProfile;
        return Result.buildSucc(null);
    }
    /**
     * 修改自己的玩家自定义状态,如果当前在房间中会同时会触发通知(房间中所有玩家)
     *
     * @param customPlayerStatus
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns
     */
    async changeCustomPlayerStatus(customPlayerStatus, robotPlayerId) {
        var _a, _b, _c;
        const ret = await this.client.callApi("ChangeCustomPlayerStatus", {
            customPlayerStatus,
            robotPlayerId,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_b = (_a = ret.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        let changePlayerInfo;
        if (robotPlayerId) {
            changePlayerInfo = (_c = this.currRoomInfo) === null || _c === void 0 ? void 0 : _c.playerList.find(p => p.playerId === robotPlayerId);
        }
        else {
            changePlayerInfo = this._currPlayerInfo;
        }
        if (changePlayerInfo)
            changePlayerInfo.customPlayerStatus = customPlayerStatus;
        return Result.buildSucc(null);
    }
    /**
     *变更自己所在队伍
     *
     * @param newTeamId 传undefined表示改为无队伍; 如果有指定队伍, 但房间不存在该队伍id, 则需要房间开启自由队伍选项
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns
     */
    async changePlayerTeam(newTeamId, robotPlayerId) {
        var _a, _b;
        const ret = await this.client.callApi("ChangePlayerTeam", {
            newTeamId,
            robotPlayerId,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_b = (_a = ret.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        this.currRoomInfo = ret.res.roomInfo;
        return Result.buildSucc(null);
    }
    /**
     * 发送房间消息（自定义消息），可以指定房间里的全部玩家或部分玩家或其他玩家
     *
     * @public
     * @param roomMsg
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns
     */
    async sendRoomMsg(roomMsg, robotPlayerId) {
        var _a, _b;
        const ret = await this.client.callApi("SendRoomMsg", {
            roomMsg,
            robotPlayerId,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_b = (_a = ret.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        return Result.buildSucc(null);
    }
    /**
     * 开始帧同步
     *
     * @public
     * @returns
     */
    async startFrameSync() {
        var _a, _b;
        const ret = await this.client.callApi("StartFrameSync", {});
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_b = (_a = ret.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        return Result.buildSucc(null);
    }
    /**
     * 停止帧同步
     *
     * @public
     * @returns
     */
    async stopFrameSync() {
        var _a, _b;
        const ret = await this.client.callApi("StopFrameSync", {});
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_b = (_a = ret.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        return Result.buildSucc(null);
    }
    /**
     * 发送玩家输入帧(加入到下一帧的操作列表)
     *
     * @public
     * @param inpOperates
     * @param [robotPlayerId] 可以指定自己的房间机器人
     * @returns
     */
    async playerInpFrame(inpOperates, robotPlayerId) {
        var _a, _b;
        const ret = await this.client.sendMsg("PlayerInpFrame", {
            operates: inpOperates,
            robotPlayerId
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_b = (_a = ret.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        return Result.buildSucc(null);
    }
    /**
     * 请求追帧数据(当前的所有帧数据[+同步状态数据])
     *
     * @public
     * @returns
     */
    async requestAfterFrames() {
        var _a, _b;
        const ret = await this.client.callApi("RequestAfterFrames", {});
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_b = (_a = ret.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        return Result.buildSucc(ret.res);
    }
    /**
     * 自主请求帧数组
     *
     * @public
     * @param beginFrameIndex 起始帧索引(包含)
     * @param endFrameIndex 结束帧索引(包含)
     * @returns
     */
    async requestFrames(beginFrameIndex, endFrameIndex) {
        var _a, _b;
        const ret = await this.client.callApi("RequestFrames", {
            beginFrameIndex: beginFrameIndex,
            endFrameIndex: endFrameIndex,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_b = (_a = ret.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        return Result.buildSucc(ret.res.frames);
    }
    /**
     * 玩家发送本地的同步状态数据(有启用状态同步的时候才可以用)
     *
     * @public
     * @param stateData
     * @param stateFrameIndex
     * @returns
     */
    async playerSendSyncState(stateData, stateFrameIndex) {
        var _a, _b;
        const ret = await this.client.sendMsg("PlayerSendSyncState", {
            stateData: stateData,
            stateFrameIndex: stateFrameIndex,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_b = (_a = ret.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        return Result.buildSucc(null);
    }
    /**
     * 发起房间所有玩家匹配请求
     * 请求成功即返回,同时房间中的所有玩家会收到通知
     * 匹配有结果了还会收到消息通知, 并且可由一个玩家调用QueryMatch等待完整匹配结果
     *
     * @param matchParams
     * @returns 匹配请求id
     */
    async requestMatch(matchParams) {
        var _a, _b;
        const ret = await this.client.callApi("RequestMatch", {
            matchParams: matchParams
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_b = (_a = ret.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        return Result.buildSucc(ret.res.matchReqId);
    }
    /**
     * 取消匹配请求
     * 可能发生并发,导致虽然请求成功了,但还是收到了成功结果的通知
     *
     * @returns 匹配请求id
     */
    async cancelMatch() {
        var _a, _b;
        const ret = await this.client.callApi("CancelMatch", {});
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_b = (_a = ret.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        return Result.buildSucc(null);
    }
    /**
     * 查询完整匹配结果
     * 会等到有结果了才返回!
     * 注意: 同时只能只有一个玩家进行查询等待,一般使用通知来获取结果即可
     *
     * @returns
     */
    async queryMatch() {
        var _a, _b;
        const ret = await this.client.callApi("QueryMatch", {}, {
            timeout: 0
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_b = (_a = ret.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        return Result.buildSucc(ret.res.matchResult);
    }
    /**
     * 玩家创建房间机器人(退出房间会同步退出)
     * @param createPa
     * @param [teamId]
     * @returns 创建的机器人信息
     */
    async createRoomRobot(createPa, teamId) {
        var _a, _b, _c;
        const ret = await this.client.callApi("CreateRoomRobot", {
            createPa,
            teamId,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_b = (_a = ret.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        if (this._currPlayerInfo) {
            this._currPlayerInfo.roomRobotIds = Array.from(new Set([
                ...(_c = this._currPlayerInfo.roomRobotIds) !== null && _c !== void 0 ? _c : [],
                ret.res.robotInfo.playerId
            ]));
        }
        return Result.buildSucc(ret.res.robotInfo);
    }
    /**
     * 玩家的指定房间机器人退出房间(即销毁)
     * @param robotPlayerId
     * @returns 销毁的机器人信息
     */
    async roomRobotLeave(robotPlayerId) {
        var _a, _b, _c;
        const ret = await this.client.callApi("RoomRobotLeave", {
            robotPlayerId,
        });
        if (!ret.isSucc) {
            return Result.buildErr(ret.err.message, ((_b = (_a = ret.err) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 1));
        }
        if (this._currPlayerInfo) {
            let tmpIds = new Set([
                ...(_c = this._currPlayerInfo.roomRobotIds) !== null && _c !== void 0 ? _c : [],
            ]);
            tmpIds.delete(ret.res.robotInfo.playerId);
            this._currPlayerInfo.roomRobotIds = Array.from(tmpIds);
        }
        return Result.buildSucc(ret.res.robotInfo);
    }
}

/**网络状态*/
exports.ENetworkState = void 0;
(function (ENetworkState) {
    /**离线*/
    ENetworkState[ENetworkState["OFFLINE"] = 0] = "OFFLINE";
    /**在线*/
    ENetworkState[ENetworkState["ONLINE"] = 1] = "ONLINE";
})(exports.ENetworkState || (exports.ENetworkState = {}));

/**玩家输入帧类型*/
exports.EPlayerInputFrameType = void 0;
(function (EPlayerInputFrameType) {
    /**输入操作*/
    EPlayerInputFrameType[EPlayerInputFrameType["Operates"] = 1] = "Operates";
    /**房间帧同步期间, 玩家进入房间, 系统会插入一个进入房间的输入帧(再收到通知后才有), 额外字段:IPlayerInputFrame.playerInfo:IPlayerInfo*/
    EPlayerInputFrameType[EPlayerInputFrameType["JoinRoom"] = 2] = "JoinRoom";
    /**房间帧同步期间, 玩家离开房间(或断线不再重连后), 系统会插入一个离开房间的输入帧, 额外字段:IPlayerInputFrame.playerInfo:IPlayerInfo*/
    EPlayerInputFrameType[EPlayerInputFrameType["LeaveRoom"] = 3] = "LeaveRoom";
    /**玩家进入游戏: 房间开始帧同步时,每个在房间的玩家都加入一帧*/
    EPlayerInputFrameType[EPlayerInputFrameType["PlayerEnterGame"] = 4] = "PlayerEnterGame";
})(exports.EPlayerInputFrameType || (exports.EPlayerInputFrameType = {}));

/**创建房间的方式*/
exports.ERoomCreateType = void 0;
(function (ERoomCreateType) {
    /**调用创建房间方法创建的*/
    ERoomCreateType[ERoomCreateType["COMMON_CREATE"] = 0] = "COMMON_CREATE";
    /**由匹配创建的*/
    ERoomCreateType[ERoomCreateType["MATCH_CREATE"] = 1] = "MATCH_CREATE";
})(exports.ERoomCreateType || (exports.ERoomCreateType = {}));
/**帧同步状态*/
exports.EFrameSyncState = void 0;
(function (EFrameSyncState) {
    /**未开始帧同步*/
    EFrameSyncState[EFrameSyncState["STOP"] = 0] = "STOP";
    /**已开始帧同步*/
    EFrameSyncState[EFrameSyncState["START"] = 1] = "START";
})(exports.EFrameSyncState || (exports.EFrameSyncState = {}));
/**私有房间的加入模式*/
exports.EPrivateRoomJoinMode = void 0;
(function (EPrivateRoomJoinMode) {
    /**知道房间id即可加入*/
    EPrivateRoomJoinMode[EPrivateRoomJoinMode["roomIdJoin"] = 0] = "roomIdJoin";
    /**禁止加入*/
    EPrivateRoomJoinMode[EPrivateRoomJoinMode["forbidJoin"] = 1] = "forbidJoin";
    /**使用密码加入*/
    EPrivateRoomJoinMode[EPrivateRoomJoinMode["password"] = 2] = "password";
})(exports.EPrivateRoomJoinMode || (exports.EPrivateRoomJoinMode = {}));

/**房间消息接收类型*/
exports.ERoomMsgRecvType = void 0;
(function (ERoomMsgRecvType) {
    /**全部玩家*/
    ERoomMsgRecvType[ERoomMsgRecvType["ROOM_ALL"] = 1] = "ROOM_ALL";
    /**除自己外的其他玩家*/
    ERoomMsgRecvType[ERoomMsgRecvType["ROOM_OTHERS"] = 2] = "ROOM_OTHERS";
    /**房间中部分玩家*/
    ERoomMsgRecvType[ERoomMsgRecvType["ROOM_SOME"] = 3] = "ROOM_SOME";
})(exports.ERoomMsgRecvType || (exports.ERoomMsgRecvType = {}));
/*
let a: IRoomMsg = {
    recvType: ERoomMsgRecvType.ROOM_SOME,
    msg: "",
    recvPlayerList: []
};
let b: IRoomMsg = {
    recvType: ERoomMsgRecvType.ROOM_ALL,
    msg: "",
};

let c!: IRoomMsg;
if (c.recvType == ERoomMsgRecvType.ROOM_SOME) {
    c.recvPlayerList.length;
}
*/

/**匹配类型*/
exports.EMatchFromType = void 0;
(function (EMatchFromType) {
    /**单个或多个玩家要匹配，进已存在的或新的房间*/
    EMatchFromType["Player"] = "Player";
    /**已经创建好的房间，支持匹配来人*/
    EMatchFromType["RoomJoinUs"] = "RoomJoinUs";
    /**房间全玩家去匹配全新的房间*/
    EMatchFromType["RoomAllPlayers"] = "RoomAllPlayers";
})(exports.EMatchFromType || (exports.EMatchFromType = {}));
/**内置匹配器标识定义*/
const MatcherKeys = {
    /**单人(无组队,忽视队伍参数), 支持多个玩家一起提交匹配,但匹配结果是没有组队的
     * matcherParams 类型对应为: ISingleMatcherParams*/
    Single: 'Single',
    /**固定队伍匹配器, 所有玩家都在同一个队伍中, 具体哪个队伍由匹配逻辑分配
     * matcherParams 类型对应为: IFixedTeamsMatcherParams*/
    FixedTeams: 'FixedTeams',
    /**指定固定队伍匹配器, 可以详细指定每个玩家的所属队伍
     * matcherParams 类型对应为: IFixedTeamsSpecifyMatcherParams*/
    FixedTeamsSpecify: 'FixedTeamsSpecify',
    /**自由队伍匹配器, matcherParams 类型对应为: IFreeTeamsMatcherParams*/
    FreeTeams: 'FreeTeams',
};

/**
 *游戏管理对象
 */
class Game {
    /**
     * 初始化
     *
     * @param hallServerUrl
     * @param myPlayerId
     * @param myPlayerToken
     */
    init(hallServerUrl, myPlayerId, myPlayerToken) {
        this.__hallClient = new HallClient(hallServerUrl);
        this.__myPlayerId = myPlayerId;
        this.__myPlayerToken = myPlayerToken;
    }
    async dispose() {
        //@ts-ignore
        this.__hallClient = undefined;
    }
}

class RoomEvents {
    constructor() {
        this._eventEmitter = new EventEmitter();
    }
    async dispose() {
        this._eventEmitter.removeAllListeners();
        //@ts-ignore
        this._eventEmitter = undefined;
    }
    /**
     * @internal
     */
    __emitDisconnected(reason) { this._eventEmitter.emit('Disconnect', ...arguments); }
    /**
     * 彻底断开触发, 如下情况:
     * 1. 断开连接时没启用断线重连则触发
     * 2. 主动断开时触发, reason='ManualDisconnect'
     * 3. 断线重连失败并不再重连时触发, reason='ReconnectFailed'
     * 4. 认证失败时会断开连接, 同时触发, reason='AuthorizeFailed'
     * @param fn reason:断开原因
     */
    onDisconnected(fn) { this._eventEmitter.on('Disconnected', fn); }
    offDisconnected(fn) { this._eventEmitter.off('Disconnected', fn); }
    /**
     * @internal
     */
    __emitReconnectStart(currTryCount) { this._eventEmitter.emit('ReconnectStart', ...arguments); }
    /**
     * [需启用断线重连:enabledReconnect]每次开始断线重连时触发, [reconnectWaitSec]秒后开始重连
     * @param fn currTryCount: 已经重试了几次了, 首次断线重连则为0
     * */
    onReconnectStart(fn) { this._eventEmitter.on('ReconnectStart', fn); }
    offReconnectStart(fn) { this._eventEmitter.off('ReconnectStart', fn); }
    /**
     * @internal
     */
    __emitReconnectResult(succ, err) { this._eventEmitter.emit('ReconnectResult', ...arguments); }
    /**断线重连最终有结果时触发(终于连上了,或者返回不继续尝试了)*/
    onReconnectResult(fn) { this._eventEmitter.on('ReconnectResult', fn); }
    offReconnectResult(fn) { this._eventEmitter.off('ReconnectResult', fn); }
    /**
     * @internal
     */
    __emitLeaveRoom(roomInfo) { this._eventEmitter.emit('LeaveRoom', ...arguments); }
    /**当前玩家不管什么原因离开了房间(主动离开,主动解散,房间被解散等等),都会触发*/
    onLeaveRoom(fn) { this._eventEmitter.on('LeaveRoom', fn); }
    offLeaveRoom(fn) { this._eventEmitter.off('LeaveRoom', fn); }
    /**
     * @internal
     */
    __emitJoinRoom(roomInfo) { this._eventEmitter.emit('JoinRoom', ...arguments); }
    /**当前玩家加入到房间后触发*/
    onJoinRoom(fn) { this._eventEmitter.on('JoinRoom', fn); }
    offJoinRoom(fn) { this._eventEmitter.off('JoinRoom', fn); }
    /**
     * @internal
     */
    __emitRecvRoomMsg(roomMsg) { this._eventEmitter.emit('RecvRoomMsg', ...arguments); }
    /**【在房间中才能收到】当接收到房间消息时触发*/
    onRecvRoomMsg(fn) { this._eventEmitter.on('RecvRoomMsg', fn); }
    offRecvRoomMsg(fn) { this._eventEmitter.off('RecvRoomMsg', fn); }
    /**
     * @internal
     */
    __emitPlayerJoinRoom(player, roomInfo) { this._eventEmitter.emit('PlayerJoinRoom', ...arguments); }
    /**【在房间中才能收到】玩家加入当前房间（自己操作的不触发）*/
    onPlayerJoinRoom(fn) { this._eventEmitter.on('PlayerJoinRoom', fn); }
    offPlayerJoinRoom(fn) { this._eventEmitter.off('PlayerJoinRoom', fn); }
    /**
     * @internal
     */
    __emitPlayerLeaveRoom(player, roomInfo) { this._eventEmitter.emit('PlayerLeaveRoom', ...arguments); }
    /**【在房间中才能收到】玩家退出当前房间（自己操作的不触发）*/
    onPlayerLeaveRoom(fn) { this._eventEmitter.on('PlayerLeaveRoom', fn); }
    offPlayerLeaveRoom(fn) { this._eventEmitter.off('PlayerLeaveRoom', fn); }
    /**
     * @internal
     */
    __emitKicked(roomInfo) { this._eventEmitter.emit('Kicked', ...arguments); }
    /**【在房间中才能收到】被踢出当前房间，需要手动调用leaveRoom*/
    onKicked(fn) { this._eventEmitter.on('Kicked', fn); }
    offKicked(fn) { this._eventEmitter.off('Kicked', fn); }
    /**
     * @internal
     */
    __emitDismissRoom(roomInfo) { this._eventEmitter.emit('DismissRoom', ...arguments); }
    /**【在房间中才能收到】当前房间被解散（自己操作的不触发）*/
    onDismissRoom(fn) { this._eventEmitter.on('DismissRoom', fn); }
    offDismissRoom(fn) { this._eventEmitter.off('DismissRoom', fn); }
    /**
     * @internal
     */
    __emitStartFrameSync(roomInfo, startPlayer) { this._eventEmitter.emit('StartFrameSync', ...arguments); }
    /**【在房间中才能收到】房间中开始帧同步了*/
    onStartFrameSync(fn) { this._eventEmitter.on('StartFrameSync', fn); }
    offStartFrameSync(fn) { this._eventEmitter.off('StartFrameSync', fn); }
    /**
     * @internal
     */
    __emitStopFrameSync(roomInfo, stopPlayer) { this._eventEmitter.emit('StopFrameSync', ...arguments); }
    /**【在房间中才能收到】房间中停止帧同步了*/
    onStopFrameSync(fn) { this._eventEmitter.on('StopFrameSync', fn); }
    offStopFrameSync(fn) { this._eventEmitter.off('StopFrameSync', fn); }
    /**
     * @internal
     */
    __emitRecvFrame(syncFrame, dt) { this._eventEmitter.emit('RecvFrame', ...arguments); }
    /**【在房间中才能收到】房间中收到一个同步帧*/
    onRecvFrame(fn) { this._eventEmitter.on('RecvFrame', fn); }
    offRecvFrame(fn) { this._eventEmitter.off('RecvFrame', fn); }
    /**
     * @internal
     */
    __emitRequirePlayerSyncState() { this._eventEmitter.emit('RequirePlayerSyncState', ...arguments); }
    /**【在房间中才能收到】服务端要求玩家上传状态同步数据 (调用 playerSendSyncState 方法)*/
    onRequirePlayerSyncState(fn) { this._eventEmitter.on('RequirePlayerSyncState', fn); }
    offRequirePlayerSyncState(fn) { this._eventEmitter.off('RequirePlayerSyncState', fn); }
    /**
     * @internal
     */
    __emitChangePlayerNetworkState(player) { this._eventEmitter.emit('RequirePlayerSyncState', ...arguments); }
    /**【在房间中才能收到】其他玩家的网络状态变更(离线/上线)*/
    onChangePlayerNetworkState(fn) { this._eventEmitter.on('RequirePlayerSyncState', fn); }
    offChangePlayerNetworkState(fn) { this._eventEmitter.off('RequirePlayerSyncState', fn); }
    /**
     * @internal
     */
    __emitChangeCustomPlayerProfile(changeInfo) { this._eventEmitter.emit('ChangeCustomPlayerProfile', ...arguments); }
    /**【在房间中才能收到】有玩家修改了自定义属性(只要在房间,自己也会收到)*/
    onChangeCustomPlayerProfile(fn) { this._eventEmitter.on('ChangeCustomPlayerProfile', fn); }
    offChangeCustomPlayerProfile(fn) { this._eventEmitter.off('ChangeCustomPlayerProfile', fn); }
    /**
     * @internal
     */
    __emitChangeCustomPlayerStatus(changeInfo) { this._eventEmitter.emit('ChangeCustomPlayerStatus', ...arguments); }
    /**【在房间中才能收到】有玩家修改了自定义状态(只要在房间,自己也会收到)*/
    onChangeCustomPlayerStatus(fn) { this._eventEmitter.on('ChangeCustomPlayerStatus', fn); }
    offChangeCustomPlayerStatus(fn) { this._eventEmitter.off('ChangeCustomPlayerStatus', fn); }
    /**
     * @internal
     */
    __emitChangeRoom(roomInfo) { this._eventEmitter.emit('ChangeRoom', ...arguments); }
    /**【在房间中才能收到】房间信息有修改*/
    onChangeRoom(fn) { this._eventEmitter.on('ChangeRoom', fn); }
    offChangeRoom(fn) { this._eventEmitter.off('ChangeRoom', fn); }
    /**
     * @internal
     */
    __emitChangePlayerTeam(changeInfo) { this._eventEmitter.emit('ChangePlayerTeam', ...arguments); }
    /**【在房间中才能收到】有玩家修改了所在队伍(只要在房间,自己也会收到)*/
    onChangePlayerTeam(fn) { this._eventEmitter.on('ChangePlayerTeam', fn); }
    offChangePlayerTeam(fn) { this._eventEmitter.off('ChangePlayerTeam', fn); }
    /**
     * @internal
     */
    __emitRoomAllPlayersMatchStart(matchReqId, reqPlayerId, matchParams) { this._eventEmitter.emit('RoomAllPlayersMatchStart', ...arguments); }
    /**
     * 【在房间中才能收到】有玩家发起了全房间玩家匹配(自己也会收到)
     * @internal
     */
    onRoomAllPlayersMatchStart(fn) { this._eventEmitter.on('RoomAllPlayersMatchStart', fn); }
    /**
     * @internal
     */
    offRoomAllPlayersMatchStart(fn) { this._eventEmitter.on('RoomAllPlayersMatchStart', fn); }
    /**
     * @internal
     */
    __emitRoomAllPlayersMatchResult(errMsg, errCode, matchResult) { this._eventEmitter.emit('RoomAllPlayersMatchResult', ...arguments); }
    /**【在房间中才能收到】全房间玩家匹配有结果了(自己也会收到)
     * @internal
     */
    onRoomAllPlayersMatchResult(fn) { this._eventEmitter.on('RoomAllPlayersMatchResult', fn); }
    /**
     * @internal
     */
    offRoomAllPlayersMatchResult(fn) { this._eventEmitter.on('RoomAllPlayersMatchResult', fn); }
}
/**
 * 房间功能模块
 *
 * [同时只能在一个房间中]
 *
 * 如果用了 GroupRoom , 则在相关事件中需要使用 if(GroupRoom.ins.currGroupRoom) 来判断当前是在组队房间中
 *
 */
class Room {
    constructor(game) {
        this._enabledReconnect = true;
        this._reconnectWaitSec = 2;
        /**
         * 房间的所有事件
         */
        this.events = new RoomEvents();
        this._game = game;
    }
    async dispose() {
        var _a;
        await ((_a = this.__gameClient) === null || _a === void 0 ? void 0 : _a.disconnect());
        this.__gameClient = undefined;
        await this.events.dispose();
        //@ts-ignore
        this._game = undefined;
    }
    /**
     * 是否启用断线重连,启用则在断开后,reconnectWaitSec秒后重连
     */
    get enabledReconnect() {
        return this._enabledReconnect;
    }
    set enabledReconnect(v) {
        this._enabledReconnect = v;
        if (this.__gameClient)
            this.__gameClient.enabledReconnect = v;
    }
    /**
     * 断线重连等待秒数
     */
    get reconnectWaitSec() {
        return this._reconnectWaitSec;
    }
    set reconnectWaitSec(v) {
        this._reconnectWaitSec = v;
        if (this.__gameClient)
            this.__gameClient.reconnectWaitSec = v;
    }
    /**可设置房间中断线后等待重连的毫秒数(认证和重连时使用),默认为60000ms(60秒),设成0表示断线后直接清理(按退出房间处理)不等待重连*/
    get roomWaitReconnectTime() {
        return this._roomWaitReconnectTime;
    }
    set roomWaitReconnectTime(v) {
        this._roomWaitReconnectTime = v;
        if (this.__gameClient)
            this.__gameClient.roomWaitReconnectTime = v;
    }
    /**
     * 获取当前所在房间信息
    */
    get currRoomInfo() {
        var _a, _b;
        return (_b = (_a = this.__gameClient) === null || _a === void 0 ? void 0 : _a.currRoomInfo) !== null && _b !== void 0 ? _b : null;
    }
    /**
     * 在房间中才有的当前玩家信息对象, 请不要保存本属性, 因为每次数据有更新都会改变引用, 请每次都读取本属性
    */
    get myPlayerInfo() {
        var _a, _b;
        return (_b = (_a = this.__gameClient) === null || _a === void 0 ? void 0 : _a.currPlayerInfo) !== null && _b !== void 0 ? _b : null;
    }
    /**将事件注册到gameClient中*/
    _setGameClientHandler() {
        if (this.__gameClient) {
            this.__gameClient.enabledReconnect = this._enabledReconnect;
            this.__gameClient.reconnectWaitSec = this._reconnectWaitSec;
            this.__gameClient.onJoinRoom = (r) => this.events.__emitJoinRoom(r);
            this.__gameClient.onLeaveRoom = (r) => this.events.__emitLeaveRoom(r);
            this.__gameClient.onDisconnected = (r) => this.events.__emitDisconnected(r);
            this.__gameClient.onDisconnected = (r) => this.events.__emitDisconnected(r);
            this.__gameClient.onReconnectStart = (r) => this.events.__emitReconnectStart(r);
            this.__gameClient.onReconnectResult = (r, r2) => this.events.__emitReconnectResult(r, r2);
            this.__gameClient.onRecvRoomMsg = (msg) => this.events.__emitRecvRoomMsg(msg);
            this.__gameClient.onPlayerJoinRoom = (r, r2) => this.events.__emitPlayerJoinRoom(r, r2);
            this.__gameClient.onPlayerLeaveRoom = (r, r2) => this.events.__emitPlayerLeaveRoom(r, r2);
            this.__gameClient.onKicked = (r) => this.events.__emitKicked(r);
            this.__gameClient.onDismissRoom = (r) => this.events.__emitDismissRoom(r);
            this.__gameClient.onStartFrameSync = (r, r2) => this.events.__emitStartFrameSync(r, r2);
            this.__gameClient.onStopFrameSync = (r, r2) => this.events.__emitStopFrameSync(r, r2);
            this.__gameClient.onRecvFrame = (r, r2) => this.events.__emitRecvFrame(r, r2);
            this.__gameClient.onRequirePlayerSyncState = () => this.events.__emitRequirePlayerSyncState();
            this.__gameClient.onChangePlayerNetworkState = (r) => this.events.__emitChangePlayerNetworkState(r);
            this.__gameClient.onChangeCustomPlayerProfile = (r) => this.events.__emitChangeCustomPlayerProfile(r);
            this.__gameClient.onChangeCustomPlayerStatus = (r) => this.events.__emitChangeCustomPlayerStatus(r);
            this.__gameClient.onChangeRoom = (r) => this.events.__emitChangeRoom(r);
            this.__gameClient.onChangePlayerTeam = (r) => this.events.__emitChangePlayerTeam(r);
            this.__gameClient.onRoomAllPlayersMatchStart = (r, r2, r3) => this.events.__emitRoomAllPlayersMatchStart(r, r2, r3);
            this.__gameClient.onRoomAllPlayersMatchResult = (r, r2, r3) => this.events.__emitRoomAllPlayersMatchResult(r, r2, r3);
        }
    }
    /**关闭和释放gameClient*/
    async _disposeGameClient() {
        if (this.__gameClient) {
            await this.__gameClient.disconnect();
            this.__gameClient = undefined;
        }
    }
    /**
     * 创建gameClient并连接和认证
     * @internal
    */
    async __createGameClient(gameServerUrl, playerPara) {
        await this._disposeGameClient();
        this.__gameClient = new GameClient(gameServerUrl, this._game.__myPlayerToken, undefined, this._roomWaitReconnectTime);
        let authRet = await this.__gameClient.authorize(playerPara);
        if (!authRet.succ) {
            await this._disposeGameClient();
            return Result.transition(authRet);
        }
        this._setGameClientHandler();
        return Result.buildSucc(null);
    }
    /**
     * 使用当前指定的玩家id和token，进行认证并尝试恢复之前所在房间(如果玩家之前在房间中断线的该房间还保留着玩家的信息才可以恢复)
     * @param updateShowName 可同时更新玩家显示名
     */
    async recoverPlayerRoom(updateShowName) {
        let ret = await this._game.__hallClient
            .recoverPlayerRoom(this._game.__myPlayerId, this._game.__myPlayerToken, updateShowName);
        //这一步失败，一般是认证没通过
        if (!ret.succ)
            return Result.transition(ret);
        //如果不在房间中，就没必要恢复房间数据了
        let roomOnlineInfo = ret.data;
        if (!roomOnlineInfo || !roomOnlineInfo.gameServerUrl) {
            return Result.buildErr('当前不在房间中，请到大厅操作！', exports.ErrorCodes.RoomNotIn);
        }
        //开始游戏服务器的重连操作
        await this._disposeGameClient();
        this.__gameClient = new GameClient(roomOnlineInfo.gameServerUrl, this._game.__myPlayerToken, undefined, this._roomWaitReconnectTime);
        let reconnectRet = await this.__gameClient.reconnect();
        if (!reconnectRet.succ) {
            await this._disposeGameClient();
            return Result.transition(reconnectRet);
        }
        this._setGameClientHandler();
        //成功
        return Result.buildSucc(this.__gameClient.currRoomInfo);
    }
    /**
     * 获取房间在线信息（不进入房间也可以获取）
     *
     * @param roomId 房间ID
     */
    async getOnlineRoomInfo(roomId) {
        let ret = await this._game.__hallClient.getRoomOnlineInfo(this._game.__myPlayerToken, roomId);
        if (!ret.succ)
            return Result.transition(ret);
        return Result.buildSucc(ret.data);
    }
    /**
     * 筛选在线房间列表（不进入房间也可以获取）
     * @param filter
     * @param [skip]
     * @param [limit]
     */
    async filterRooms(filter, skip, limit) {
        let ret = await this._game.__hallClient
            .filterRooms(this._game.__myPlayerToken, filter, skip, limit);
        if (!ret.succ)
            return Result.transition(ret);
        return Result.buildSucc(ret.data);
    }
    /**
     * 创建一个自定义房间并进入, 成功则可使用 this.currRoomInfo 可获取当前所在的房间信息
     *
     * @param playerPara 玩家信息参数
     * @param roomPara 房间信息参数
     * @param teamId 同时加入的队伍id
     */
    async createRoom(playerPara, roomPara, teamId) {
        let ret = await this._game.__hallClient.createRoom(this._game.__myPlayerToken, roomPara);
        if (!ret.succ)
            return Result.transition(ret);
        let createRet = await this.__createGameClient(ret.data.gameServerUrl, playerPara);
        if (!createRet.succ)
            return Result.transition(createRet);
        let joinRet = await this.__gameClient.joinRoom({ roomId: ret.data.roomId, teamId });
        if (!joinRet.succ)
            return Result.transition(joinRet);
        return joinRet;
    }
    /**
     * Determines whether join game server room
     * @param gameServerUrl
     * @param playerPara
     * @param roomId
     * @param teamId
     * @returns  join result
     * @internal
     */
    async __joinGameServerRoom(gameServerUrl, playerPara, joinRoomPara) {
        let createRet = await this.__createGameClient(gameServerUrl, playerPara);
        if (!createRet.succ)
            return Result.transition(createRet);
        let joinRet = await this.__gameClient.joinRoom(joinRoomPara);
        if (!joinRet.succ)
            return Result.transition(joinRet);
        return joinRet;
    }
    /**
     * 加入指定房间, 成功则可使用 this.currRoomInfo 可获取当前所在的房间信息
     *
     * @param playerPara 玩家信息参数
     * @param roomId 房间ID
     * @param teamId 同时加入的队伍id
     */
    async joinRoom(playerPara, para, teamId) {
        let joinRoomPara;
        if (typeof (para) === 'string') {
            joinRoomPara = {
                roomId: para,
                teamId,
            };
        }
        else {
            joinRoomPara = para;
        }
        let ret = await this._game.__hallClient.getRoomOnlineInfo(this._game.__myPlayerToken, joinRoomPara.roomId);
        if (!ret.succ)
            return Result.transition(ret);
        return await this.__joinGameServerRoom(ret.data.gameServerUrl, playerPara, joinRoomPara);
    }
    /**
     * 加入指定游戏服务器的房间, 成功则可使用 this.currRoomInfo 可获取当前所在的房间信息
     *
     * @deprecated 本重载已弃用, 将在下个版本移除!! 请使用 joinRoom
     *
     * @param gameServerUrl 游戏服务器地址
     * @param playerPara 玩家信息参数
     * @param para 加入房间参数|房间ID
     * @param teamId 同时加入的队伍id
     */
    async joinRoomByServer(gameServerUrl, playerPara, para, teamId) {
        let joinRoomPara;
        if (typeof (para) === 'string') {
            joinRoomPara = {
                roomId: para,
                teamId,
            };
        }
        else {
            joinRoomPara = para;
        }
        return await this.__joinGameServerRoom(gameServerUrl, playerPara, joinRoomPara);
    }
    /**
     * 加入或创建指定条件的房间, 服务器存在指定条件并且未满房间, 则优先加入房间, 否则创建同条件的房间, 可能存在创建失败(匹配条件的房间超过服务器限额)
     * @param playerPara
     * @param joinRoomPara
     * @param matchOrCreateRoomPara
     */
    async joinOrCreateRoom(playerPara, joinRoomPara, matchOrCreateRoomPara) {
        var _a;
        let getOrCreateRet = await this._game.__hallClient.getOrCreateRoom(this._game.__myPlayerToken, matchOrCreateRoomPara);
        if (!getOrCreateRet.succ)
            return Result.transition(getOrCreateRet);
        if (getOrCreateRet.data.createRoomOnlineInfo) {
            // 创建了房间, 则直接进入   
            return await this.__joinGameServerRoom(getOrCreateRet.data.createRoomOnlineInfo.gameServerUrl, playerPara, joinRoomPara);
        }
        if ((_a = getOrCreateRet.data.matchRoomOnlineInfoList) === null || _a === void 0 ? void 0 : _a.length) {
            // 匹配到房间了, 按顺序尝试加入
            for (const room of getOrCreateRet.data.matchRoomOnlineInfoList) {
                let joinRet = await this.__joinGameServerRoom(room.gameServerUrl, playerPara, joinRoomPara);
                if (joinRet.succ)
                    return joinRet;
            }
            // 都失败了,则客户端自行选择创建房间!
            return await this.createRoom(playerPara, matchOrCreateRoomPara.createRoomPara, joinRoomPara.teamId);
        }
        return Result.buildErr('未知错误: 没有匹配的结果类型!', exports.ErrorCodes.Exception);
    }
    /**
     * 退出当前房间
     * @returns
     */
    async leaveRoom() {
        if (!this.__gameClient)
            return Result.buildErr('当前不在房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.leaveRoom();
        return ret;
    }
    /**
     * 【仅房主】踢出房间玩家
     * @param playerId
     */
    async kickPlayer(playerId) {
        if (!this.__gameClient)
            return Result.buildErr('当前不在房间中!', exports.ErrorCodes.RoomNotIn);
        if (this.__gameClient.currRoomInfo.ownerPlayerId !== this._game.__myPlayerId)
            return Result.buildErr('只有房主才能踢人!', exports.ErrorCodes.RoomPermissionDenied);
        if (playerId === this._game.__myPlayerId)
            return Result.buildErr('您是房主，不能踢自己!', exports.ErrorCodes.RoomPermissionDenied);
        let ret = await this.__gameClient.kickPlayer(playerId);
        return ret;
    }
    /**
     * 【仅房主】解散当前房间
     * @returns
     */
    async dismissRoom() {
        if (!this.__gameClient)
            return Result.buildErr('当前不在房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.dismissRoom();
        return ret;
    }
    /**
     * 修改房间信息(注意,只能房主操作),同时同步更新本地当前房间信息
     *
     * @param changePara
     */
    async changeRoom(changePara) {
        if (!this.__gameClient)
            return Result.buildErr('当前不在房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.changeRoom(changePara);
        return ret;
    }
    /**
     * 修改自己的玩家自定义属性,如果当前在房间中会同时会触发通知(房间中所有玩家)
     *
     * @param customPlayerProfile
     * @param [robotPlayerId] 可以指定自己的房间机器人
     */
    async changeCustomPlayerProfile(customPlayerProfile, robotPlayerId) {
        if (!this.__gameClient)
            return Result.buildErr('当前不在房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.changeCustomPlayerProfile(customPlayerProfile, robotPlayerId);
        return ret;
    }
    /**
     * 修改自己的玩家自定义状态,如果当前在房间中会同时会触发通知(房间中所有玩家)
     *
     * @param customPlayerStatus
     * @param [robotPlayerId] 可以指定自己的房间机器人
     */
    async changeCustomPlayerStatus(customPlayerStatus, robotPlayerId) {
        if (!this.__gameClient)
            return Result.buildErr('当前不在房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.changeCustomPlayerStatus(customPlayerStatus, robotPlayerId);
        return ret;
    }
    /**
     *变更自己所在队伍
     *
     * @param newTeamId 传undefined表示改为无队伍; 如果有指定队伍, 但房间不存在该队伍id, 则需要房间开启自由队伍选项
     * @param [robotPlayerId] 可以指定自己的房间机器人
     */
    async changePlayerTeam(newTeamId, robotPlayerId) {
        if (!this.__gameClient)
            return Result.buildErr('当前不在房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.changePlayerTeam(newTeamId, robotPlayerId);
        return ret;
    }
    /**
     * 发送房间消息（自定义消息），可以指定房间里的全部玩家或部分玩家或其他玩家
     *
     * @public
     * @param roomMsg
     * @param [robotPlayerId] 可以指定自己的房间机器人
     */
    async sendRoomMsg(roomMsg, robotPlayerId) {
        if (!this.__gameClient)
            return Result.buildErr('当前不在房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.sendRoomMsg(roomMsg, robotPlayerId);
        return ret;
    }
    /**
     * 开始帧同步
     *
     * @public
     */
    async startFrameSync() {
        if (!this.__gameClient)
            return Result.buildErr('当前不在房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.startFrameSync();
        return ret;
    }
    /**
     * 停止帧同步
     *
     * @public
     */
    async stopFrameSync() {
        if (!this.__gameClient)
            return Result.buildErr('当前不在房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.stopFrameSync();
        return ret;
    }
    /**
     * 发送玩家输入帧(加入到下一帧的操作列表)
     *
     * @public
     * @param inpOperates
     * @param [robotPlayerId] 可以指定自己的房间机器人
     */
    async sendFrame(inpOperates, robotPlayerId) {
        if (!this.__gameClient)
            return Result.buildErr('当前不在房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.playerInpFrame(inpOperates, robotPlayerId);
        return ret;
    }
    /**
     * 请求追帧数据(当前的所有帧数据[+同步状态数据])
     *
     * @public
     */
    async requestAfterFrames() {
        if (!this.__gameClient)
            return Result.buildErr('当前不在房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.requestAfterFrames();
        return ret;
    }
    /**
     * 自主请求帧数组
     *
     * @public
     * @param beginFrameIndex 起始帧索引(包含)
     * @param endFrameIndex 结束帧索引(包含)
     */
    async requestFrames(beginFrameIndex, endFrameIndex) {
        if (!this.__gameClient)
            return Result.buildErr('当前不在房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.requestFrames(beginFrameIndex, endFrameIndex);
        return ret;
    }
    /**
     * 玩家发送本地的同步状态数据(有启用状态同步的时候才可以用)
     *
     * @public
     * @param stateData
     * @param stateFrameIndex
     */
    async playerSendSyncState(stateData, stateFrameIndex) {
        if (!this.__gameClient)
            return Result.buildErr('当前不在房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.playerSendSyncState(stateData, stateFrameIndex);
        return ret;
    }
    /**
     * [在或不在房间中都可以发起匹配] 发起单独的玩家匹配, 成功则返回 [匹配请求id, 即 matchReqId] , 指定匹配结果回调来获得本次匹配请求结果
     *
     * @param matchParamsFromPlayer 匹配参数, 注意,参与匹配的这些玩家不会收到服务器通知
     * @param matchResultCallback 可指定匹配结果回调
     */
    async requestMatchFromPlayers(matchParamsFromPlayer, matchResultCallback) {
        return await this.requestPlayersMatch(matchParamsFromPlayer, matchResultCallback).waitResult();
    }
    /**
     * [在或不在房间中都可以发起匹配] 发起单独的玩家匹配, 成功则返回 [匹配请求id, 即 matchReqId] , 指定匹配结果回调来获得本次匹配请求结果
     *
     * @param matchParamsFromPlayer 匹配参数, 注意,参与匹配的这些玩家不会收到服务器通知
     * @param matchResultCallback 可指定匹配结果回调
     */
    requestPlayersMatch(matchParamsFromPlayer, matchResultCallback) {
        let waitCancel = null;
        let task = new Promise(async (res) => {
            let ret = await this._game.__hallClient.requestMatch(this._game.__myPlayerToken, matchParamsFromPlayer);
            if (!ret.succ) {
                return res(ret);
            }
            //成功请求匹配, 开始异步等待结果
            waitCancel = this._startWaitMatchResultFromPlayers(matchParamsFromPlayer, ret.data);
            waitCancel.waitResult().then(matchResultCallback);
            //先把请求匹配结果返回
            return res(ret);
        });
        return {
            waitResult() {
                return task;
            },
            async cancel() {
                await (waitCancel === null || waitCancel === void 0 ? void 0 : waitCancel.cancel());
            },
        };
    }
    /**
     * 开始等待单独的玩家匹配结果, 有结果会触发回调
     *
     * @param matchParamsFromPlayer
     * @param matchReqId 匹配请求id
     */
    _startWaitMatchResultFromPlayers(matchParamsFromPlayer, matchReqId) {
        var _a;
        let timeoutTS = Date.now() + ((_a = matchParamsFromPlayer.matchTimeoutSec) !== null && _a !== void 0 ? _a : 60) * 1000 + 2000;
        let isCancel = false;
        let currDelayCancel = null;
        let task = new Promise(async (res) => {
            while (Date.now() < timeoutTS) {
                if (isCancel) {
                    break;
                }
                currDelayCancel = delayCanCancel(500);
                await currDelayCancel.waitResult();
                if (isCancel) {
                    break;
                }
                let ret = await this._game.__hallClient.queryMatch(this._game.__myPlayerToken, matchReqId);
                if (ret) {
                    return res(ret);
                }
            }
            if (isCancel) {
                res(Result.buildErr('匹配取消', exports.ErrorCodes.MatchRequestCancelled));
            }
            else {
                res(Result.buildErr('匹配超时', exports.ErrorCodes.MatchQueryTimeout));
            }
        });
        return {
            waitResult() {
                return task;
            },
            async cancel() {
                isCancel = true;
                await (currDelayCancel === null || currDelayCancel === void 0 ? void 0 : currDelayCancel.cancel());
            },
        };
    }
    /**
     * 取消单独的玩家匹配, 也会触发匹配回调. 同时因为有并发可能, 即在结果已出即将收到时,提交取消成功,但还是会触发匹配成功的回调
     *
     * @param matchReqId 匹配请求id
     */
    async cancelMatchFromPlayers(matchReqId) {
        let ret = await this._game.__hallClient.cancelMatch(this._game.__myPlayerToken, matchReqId);
        return ret;
    }
    /**
     * 玩家创建房间机器人(退出房间会同步退出)
     * @param createPa
     * @param [teamId]
     * @returns 创建的机器人信息
     */
    async createRoomRobot(createPa, teamId) {
        if (!this.__gameClient)
            return Result.buildErr('当前不在房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.createRoomRobot(createPa, teamId);
        return ret;
    }
    /**
     * 玩家的指定房间机器人退出房间(即销毁)
     * @param robotPlayerId
     * @returns 销毁的机器人信息
     */
    async roomRobotLeave(robotPlayerId) {
        if (!this.__gameClient)
            return Result.buildErr('当前不在房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this.__gameClient.roomRobotLeave(robotPlayerId);
        return ret;
    }
}

/**
 * Factory
 */
class Factory {
    /**
     * 用玩家信息构建玩家参数, 用于连接服务器加入房间等操作
     * @param playerInfo
     * @returns player para
     */
    static buildPlayerParaFromInfo(playerInfo) {
        return {
            showName: playerInfo.showName,
            customPlayerProfile: playerInfo.customPlayerProfile,
            customPlayerStatus: playerInfo.customPlayerStatus,
        };
    }
}

class GroupRoomEvents {
    /**
     */
    constructor() {
        this.eventEmitter = new EventEmitter();
    }
    dispose() {
        this.eventEmitter.removeAllListeners();
    }
    /**
     * @internal
     */
    __emitLeaveGroup(roomInfo) { this.eventEmitter.emit('LeaveGroup', ...arguments); }
    /**当前玩家不管什么原因离开了组队(主动离开,主动解散,房间被解散等等),都会触发*/
    onLeaveGroup(fn) { this.eventEmitter.on('LeaveGroup', fn); }
    offLeaveGroup(fn) { this.eventEmitter.off('LeaveGroup', fn); }
    /**
     * @internal
     */
    __emitJoinGroup(roomInfo) { this.eventEmitter.emit('JoinGroup', ...arguments); }
    /**当前玩家加入到组队后触发*/
    onJoinGroup(fn) { this.eventEmitter.on('JoinGroup', fn); }
    offJoinGroup(fn) { this.eventEmitter.off('JoinGroup', fn); }
    /**
     * @internal
     */
    __emitGroupMatchStart(matchReqId, reqPlayerId, matchParams) { this.eventEmitter.emit('GroupMatchStart', ...arguments); }
    /**
     * 组队发起了匹配时触发
     * @param fn
     */
    onGroupMatchStart(fn) { this.eventEmitter.on('GroupMatchStart', fn); }
    offGroupMatchStart(fn) { this.eventEmitter.off('GroupMatchStart', fn); }
    /**
     * @internal
     */
    __emitGroupMatchResult(errMsg, errCode, matchResult) { this.eventEmitter.emit('GroupMatchResult', ...arguments); }
    /**
     * 组队匹配有结果了触发
     *
     * 注意: 如果是成功的, 则会自动进入房间 (事件: onGroupMatchEnterRoom )
     * @param fn
     */
    onGroupMatchResult(fn) { this.eventEmitter.on('GroupMatchResult', fn); }
    offGroupMatchResult(fn) { this.eventEmitter.off('GroupMatchResult', fn); }
    /**
     * @internal
     */
    __emitGroupMatchEnterRoom(result) { this.eventEmitter.emit('GroupMatchEnterRoom', ...arguments); }
    /**
     * 当组队匹配成功并进入房间后触发
     *
     * 如果进入匹配房间失败了就会再尝试回到组队, 可以使用 this.currGroupRoom 来判断是否成功回到组队房间
     *
     * @param fn result.data === Room.ins.currRoomInfo
     */
    onGroupMatchEnterRoom(fn) { this.eventEmitter.on('GroupMatchEnterRoom', fn); }
    offGroupMatchEnterRoom(fn) { this.eventEmitter.off('GroupMatchEnterRoom', fn); }
    /**
     * @internal
     */
    __emitPlayerJoinGroup(player, roomInfo) { this.eventEmitter.emit('PlayerJoinGroup', ...arguments); }
    /**玩家加入当前组队（自己操作的不触发）*/
    onPlayerJoinGroup(fn) { this.eventEmitter.on('PlayerJoinGroup', fn); }
    offPlayerJoinGroup(fn) { this.eventEmitter.off('PlayerJoinGroup', fn); }
    /**
     * @internal
     */
    __emitPlayerLeaveGroup(player, roomInfo) { this.eventEmitter.emit('PlayerLeaveGroup', ...arguments); }
    /**玩家退出当前组队（自己操作的不触发）*/
    onPlayerLeaveGroup(fn) { this.eventEmitter.on('PlayerLeaveGroup', fn); }
    offPlayerLeaveGroup(fn) { this.eventEmitter.off('PlayerLeaveGroup', fn); }
    /**
     * @internal
     */
    __emitDismissGroup(roomInfo) { this.eventEmitter.emit('DismissGroup', ...arguments); }
    /**当前组队被解散（自己操作的不触发）*/
    onDismissGroupRoom(fn) { this.eventEmitter.on('DismissGroup', fn); }
    offDismissGroup(fn) { this.eventEmitter.off('DismissGroup', fn); }
    /**
     * @internal
     */
    __emitRecvGroupMsg(msg) { this.eventEmitter.emit('RecvGroupMsg', ...arguments); }
    /**收到组队中玩家发的自定义消息*/
    onRecvGroupMsg(fn) { this.eventEmitter.on('RecvGroupMsg', fn); }
    offRecvGroupMsg(fn) { this.eventEmitter.off('RecvGroupMsg', fn); }
    /**
     * @internal
     */
    __emitChangePlayerNetworkState(player) { this.eventEmitter.emit('RequirePlayerSyncState', ...arguments); }
    /**组队中其他玩家的网络状态变更(离线/上线)*/
    onChangePlayerNetworkState(fn) { this.eventEmitter.on('RequirePlayerSyncState', fn); }
    offChangePlayerNetworkState(fn) { this.eventEmitter.off('RequirePlayerSyncState', fn); }
    /**
     * @internal
     */
    __emitChangeCustomPlayerProfile(changeInfo) { this.eventEmitter.emit('ChangeCustomPlayerProfile', ...arguments); }
    /**有玩家修改了自定义属性(只要在房间,自己也会收到)*/
    onChangeCustomPlayerProfile(fn) { this.eventEmitter.on('ChangeCustomPlayerProfile', fn); }
    offChangeCustomPlayerProfile(fn) { this.eventEmitter.off('ChangeCustomPlayerProfile', fn); }
    /**
     * @internal
     */
    __emitChangeCustomPlayerStatus(changeInfo) { this.eventEmitter.emit('ChangeCustomPlayerStatus', ...arguments); }
    /**有玩家修改了自定义状态(只要在房间,自己也会收到)*/
    onChangeCustomPlayerStatus(fn) { this.eventEmitter.on('ChangeCustomPlayerStatus', fn); }
    offChangeCustomPlayerStatus(fn) { this.eventEmitter.off('ChangeCustomPlayerStatus', fn); }
    /**
     * @internal
     */
    __emitChangeGroup(roomInfo) { this.eventEmitter.emit('ChangeGroup', ...arguments); }
    /**组队房间信息有修改*/
    onChangeGroup(fn) { this.eventEmitter.on('ChangeGroup', fn); }
    offChangeGroup(fn) { this.eventEmitter.off('ChangeGroup', fn); }
}
/**
 * 组队房间功能模块
 *
 * - 使用房间功能来实现的组队功能模块, 即: 同时只能在`组队房间`或者`普通房间`中
 * - 只要在组队房间中, 组队房间有的事件, 都将由组队房间接管, 房间事件不会触发
 *
 */
class GroupRoom {
    /**
     * 当前如果在组队房间中则能获取到房间信息, (即使在房间中,但不是组队房间依旧返回null)
     */
    get currGroupRoom() {
        if (!this._currGroupRoomId || !this._room.currRoomInfo)
            return null;
        if (this._room.currRoomInfo.roomId !== this._currGroupRoomId)
            return null;
        return this._room.currRoomInfo;
    }
    ;
    /**
     * @internal
     */
    constructor(game, room) {
        /**当前保留的组队房间id*/
        this._currGroupRoomId = null;
        /**当前保留的组队房间是否是房主*/
        this._currGroupRoomIsOwn = false;
        /**上一个组队房间id,因为触发顺序问题,需要保存一下最后一次的组队房间*/
        this._lastGroupRoomId = null;
        /**
         * 所有事件
         */
        this.events = new GroupRoomEvents();
        this._game = game;
        this._room = room;
        //hook, 区分组队房间和非组队房间, 消息各自走自己的事件
        this._hookRoomEmitHandler('__emitJoinRoom', (roomInfo) => this.events.__emitJoinGroup(roomInfo));
        this._hookRoomEmitHandler('__emitRecvRoomMsg', (msg) => this.events.__emitRecvGroupMsg(msg));
        this._hookRoomEmitHandler('__emitPlayerJoinRoom', (player, roomInfo) => this.events.__emitPlayerJoinGroup(player, roomInfo));
        this._hookRoomEmitHandler('__emitPlayerLeaveRoom', (player, roomInfo) => this.events.__emitPlayerLeaveGroup(player, roomInfo));
        this._hookRoomEmitHandler('__emitChangeRoom', (roomInfo) => this.events.__emitChangeGroup(roomInfo));
        this._hookRoomEmitHandler('__emitChangePlayerNetworkState', (player) => this.events.__emitChangePlayerNetworkState(player));
        this._hookRoomEmitHandler('__emitChangeCustomPlayerProfile', (changeInfo) => this.events.__emitChangeCustomPlayerProfile(changeInfo));
        this._hookRoomEmitHandler('__emitChangeCustomPlayerStatus', (changeInfo) => this.events.__emitChangeCustomPlayerStatus(changeInfo));
        this._hookRoomEmitHandler('__emitRoomAllPlayersMatchStart', (matchReqId, reqPlayerId, matchParams) => this.events.__emitGroupMatchStart(matchReqId, reqPlayerId, matchParams));
        //下面的劫持过来后需要定制处理
        this._hookRoomEmitHandler('__emitRoomAllPlayersMatchResult', this._procRoomAllPlayersMatchResult);
        //下面是定制房间事件
        let emitLeaveRoomOld = this._room.events.__emitLeaveRoom;
        this._room.events.__emitLeaveRoom = (roomInfo) => {
            if (this._lastGroupRoomId === roomInfo.roomId) {
                this._currGroupRoomId = null;
                this.events.__emitLeaveGroup(roomInfo);
            }
            else {
                //离开的不是组队房间,则照常触发
                emitLeaveRoomOld.call(this._room.events, roomInfo);
            }
        };
        let emitDismissRoomOld = this._room.events.__emitDismissRoom;
        this._room.events.__emitDismissRoom = (roomInfo) => {
            if (this._lastGroupRoomId === roomInfo.roomId) {
                //因为可能触发顺序, 导致 this._currGroupRoomId 先被置空, 就用 _lastGroupRoomId 来判断
                this.events.__emitDismissGroup(roomInfo);
            }
            else {
                //解散的不是组队房间,则照常触发
                emitDismissRoomOld.call(this._room.events, roomInfo);
            }
        };
    }
    async dispose() {
        if (this._currGroupRoomId && this._currGroupRoomIsOwn) {
            // 如果已经在自己创建的组队房间中,则直接解散之前的
            this.dismissGroup();
        }
        this.events.dispose();
        //@ts-ignore
        this.eventEmitter = undefined;
        //@ts-ignore
        this._game = undefined;
    }
    _hookRoomEmitHandler(key, bindGroupHandler) {
        let oldFn = this._room.events[key];
        let t = this;
        this._room.events[key] = async function () {
            const args = arguments;
            if (t.currGroupRoom) {
                bindGroupHandler.apply(t, args);
            }
            else {
                //@ts-ignore
                oldFn === null || oldFn === void 0 ? void 0 : oldFn.apply(t._room.events, args);
            }
        };
    }
    async _procRoomAllPlayersMatchResult(errMsg, errCode, matchResult) {
        //触发组队房间匹配结果事件
        this.events.__emitGroupMatchResult(errMsg, errCode, matchResult);
        //匹配不成功忽略
        if (!matchResult)
            return;
        //组队房间匹配成功了, 实现自动进入房间的逻辑
        let currGroupRoomId = this._currGroupRoomId;
        let playerPara = Factory.buildPlayerParaFromInfo(this._room.__gameClient.currPlayerInfo);
        //使用保留房间的方式离开房间,便于之后再回到组队房间
        let leaveRet = await this._room.leaveRoom();
        if (!leaveRet.succ) {
            //离开组队房间还失败...这一般不可能, 除非通讯错误等
            //就当作还在组队房间
            this._currGroupRoomId = currGroupRoomId;
            this.events.__emitGroupMatchEnterRoom(Result.transition(leaveRet));
            return;
        }
        //因为离开操作会让标志被清理, 这里重新设置一下
        this._currGroupRoomId = currGroupRoomId;
        //离开组队房间后,进入匹配房间
        let joinRet = await this._room.joinRoomByServer(matchResult.gameServerUrl, playerPara, {
            roomId: matchResult.roomId,
            teamId: matchResult.teamId
        });
        if (!joinRet.succ) {
            //进入匹配房间失败了
            //准备回到组队房间
            let backGroupRoomRet = await this.joinGroup(playerPara, currGroupRoomId);
            if (!backGroupRoomRet.succ) {
                //回到组队房间还失败.那没办法了
                logger.error('匹配成功,进入匹配房间失败:', joinRet, '尝试回到组队房间还失败:', backGroupRoomRet);
            }
            this.events.__emitGroupMatchEnterRoom(Result.transition(joinRet));
            return;
        }
        this.events.__emitGroupMatchEnterRoom(joinRet);
    }
    /**
     * 如果之前是组队匹配进入新房间的, 则可以离开房间并回到之前的组队房间
     * @returns group
     */
    async backGroup() {
        if (!this._currGroupRoomId)
            return Result.buildErr('已经离开组队房间', exports.ErrorCodes.RoomNotIn);
        if (this._room.currRoomInfo && this._room.currRoomInfo.roomId === this._currGroupRoomId) {
            //当前已经在组队房间了,直接返回成功
            return Result.buildSucc(this._room.currRoomInfo);
        }
        let playerPara = Factory.buildPlayerParaFromInfo(this._room.__gameClient.currPlayerInfo);
        let ret = await this.joinGroup(playerPara, this._currGroupRoomId);
        return ret;
    }
    /**
     * 创建一个组队房间并进入, 之前有在其他房间将自动退出, 成功则 this.currGroupRoom 有值
     *
     * @param playerPara
     * @returns groupRoomId
     */
    async createGroup(playerPara) {
        if (this._currGroupRoomId && this._currGroupRoomIsOwn) {
            // 如果之前有在自己另外创建的组队房间中,则直接解散之前的(使用大厅房主接口,不管当前连接是否连着,最稳妥)
            Game.ins.__hallClient.ownDismissRoom(Game.ins.__myPlayerToken, this._currGroupRoomId);
        }
        let roomPara = {
            isPrivate: true,
            maxPlayers: 99,
            ownerPlayerId: this._game.__myPlayerId,
            roomName: '自定义组队房间',
            retainEmptyRoomTime: 5 * 60000, // 组队房间保留空房间5个小时, 方便全房间玩家匹配到其他房间去玩了还能回来
        };
        let ret = await this._game.__hallClient.createRoom(this._game.__myPlayerToken, roomPara);
        if (!ret.succ)
            return Result.transition(ret);
        this._currGroupRoomId = ret.data.roomId;
        this._currGroupRoomIsOwn = true;
        this._lastGroupRoomId = ret.data.roomId;
        let joinRet = await this._room.joinRoom(playerPara, { roomId: this._currGroupRoomId });
        return Result.transition(joinRet, () => ret.data.roomId);
    }
    /**
     * 加入指定组队房间, 成功则 this.currGroupRoom 有值
     *
     * @param playerPara 玩家信息参数
     * @param groupRoomId 组队房间ID
     */
    async joinGroup(playerPara, groupRoomId) {
        if (this._currGroupRoomId && this._currGroupRoomId !== groupRoomId && this._currGroupRoomIsOwn) {
            // 如果之前有在自己另外创建的组队房间中,则直接解散之前的(使用大厅房主接口,不管当前连接是否连着,最稳妥)
            Game.ins.__hallClient.ownDismissRoom(Game.ins.__myPlayerToken, this._currGroupRoomId);
        }
        this._currGroupRoomId = groupRoomId; //因为加入房间消息可能在下面返回前就收到了,所以提前设置好,发现失败后再移除
        this._currGroupRoomIsOwn = false;
        let ret = await this._room.joinRoom(playerPara, { roomId: groupRoomId });
        if (!ret.succ) {
            this._currGroupRoomId = null;
        }
        else {
            this._lastGroupRoomId = ret.data.roomId;
        }
        return Result.transition(ret, () => ret.data);
    }
    /**
     * 退出当前组队房间
     * @returns
     */
    async leaveGroup() {
        if (!this.currGroupRoom)
            return Result.buildErr('当前不在组队房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this._room.leaveRoom();
        return ret;
    }
    /**
     * 【仅房主】解散当前组队房间
     * @returns
     */
    async dismissGroup() {
        if (!this.currGroupRoom)
            return Result.buildErr('当前不在组队房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this._room.dismissRoom();
        return ret;
    }
    /**
     * [**在组队房间中才可以发起**] 发起组队匹配请求(请求成功即返回), 后续匹配成功则组队中所有玩家会自动进入匹配的房间
     *
     * - 成功发起匹配通知: onGroupMatchStart
     * - 匹配结果的通知: onGroupMatchResult
     * - 匹配成功开始进入匹配房间的通知: onGroupMatchEnterRoom
     *
     * 另外: 可由一个玩家(仅一个)调用 queryMatch 等待完整匹配结果(即房间所有玩家各自的匹配结果信息)
     *
     * @param matchParams
     * @returns 匹配请求id
     */
    async requestMatch(matchParams) {
        if (!this.currGroupRoom)
            return Result.buildErr('当前不在组队房间中!', exports.ErrorCodes.RoomNotIn);
        let matchP = matchParams;
        matchP.matchFromType = exports.EMatchFromType.RoomAllPlayers;
        matchP.matchFromInfo = {};
        let ret = await this._room.__gameClient.requestMatch(matchP);
        return ret;
    }
    /**
     * [**在组队房间中才可以发起**] 取消组队匹配请求
     *
     * 可能发生并发,导致虽然取消成功了,但还是收到了匹配成功的通知
     *
     * @returns
     */
    async cancelMatch() {
        if (!this.currGroupRoom)
            return Result.buildErr('当前不在组队房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this._room.__gameClient.cancelMatch();
        return ret;
    }
    /**
     * [在组队房间中才可以发起] 查询完整的组队匹配结果
     *
     * 会等到有结果了才返回!
     *
     * 注意: 同时只能只有一个玩家进行查询等待,一般使用相关事件来获取结果即可
     *
     * @returns
     */
    async queryMatch() {
        if (!this.currGroupRoom)
            return Result.buildErr('当前不在组队房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this._room.__gameClient.queryMatch();
        return ret;
    }
    /**
     * 发送组队内消息（自定义消息），可以指定全部玩家或部分玩家或其他玩家 来接收
     *
     * @public
     * @param roomMsg
     */
    async sendGroupMsg(roomMsg) {
        if (!this.currGroupRoom)
            return Result.buildErr('当前不在组队房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this._room.sendRoomMsg(roomMsg);
        return ret;
    }
    /**
     * 修改自己的玩家自定义属性,如果当前在房间中会同时会触发通知(房间中所有玩家)
     *
     * @param customPlayerProfile
     */
    async changeCustomPlayerProfile(customPlayerProfile) {
        if (!this.currGroupRoom)
            return Result.buildErr('当前不在组队房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this._room.changeCustomPlayerProfile(customPlayerProfile);
        return ret;
    }
    /**
     * 修改自己的玩家自定义状态,如果当前在房间中会同时会触发通知(房间中所有玩家)
     *
     * @param customPlayerStatus
     */
    async changeCustomPlayerStatus(customPlayerStatus) {
        if (!this.currGroupRoom)
            return Result.buildErr('当前不在组队房间中!', exports.ErrorCodes.RoomNotIn);
        let ret = await this._room.changeCustomPlayerStatus(customPlayerStatus);
        return ret;
    }
}

/**
 * Inits sdk
 * @param provider 由 import \{ buildSDKProvider \} from "tsgf-sdk-*" 提供, 如: tsgf-sdk-browser, tsgf-sdk-miniapp
 */
function initSDK(provider) {
    Game.ins = new Game();
    Room.ins = new Room(Game.ins);
    GroupRoom.ins = new GroupRoom(Game.ins, Room.ins);
    initSDKProvider(provider);
}

exports.AHttpClient = AHttpClient;
exports.AWsClient = AWsClient;
exports.EventEmitter = EventEmitter;
exports.EventHandlers = EventHandlers;
exports.Game = Game;
exports.GameClient = GameClient;
exports.GroupRoom = GroupRoom;
exports.GroupRoomEvents = GroupRoomEvents;
exports.HallClient = HallClient;
exports.MatcherKeys = MatcherKeys;
exports.Result = Result;
exports.Room = Room;
exports.RoomEvents = RoomEvents;
exports.arrCount = arrCount;
exports.arrGroup = arrGroup;
exports.arrItemArrMerge = arrItemArrMerge;
exports.arrItemArrMergeConcat = arrItemArrMergeConcat;
exports.arrRemoveItems = arrRemoveItems;
exports.arrSkipAndLimit = arrSkipAndLimit;
exports.arrSum = arrSum;
exports.arrUpdateItems = arrUpdateItems;
exports.arrWinner = arrWinner;
exports.delay = delay;
exports.delayCanCancel = delayCanCancel;
exports.getGlobalSDKProvider = getGlobalSDKProvider;
exports.hasProperty = hasProperty;
exports.initSDK = initSDK;
exports.initSDKProvider = initSDKProvider;
exports.numbersAdd = numbersAdd;
exports.parseProcessArgv = parseProcessArgv;
exports.parseProcessEnv = parseProcessEnv;
