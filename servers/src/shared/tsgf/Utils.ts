import { ICancelableExec } from "./ICancelable";


/**
 * 对象里是否有属性,通常用于判断将object当作键值对来使用的场景
 *
 * @param object
 * @returns
 */
export function hasProperty(object: any): boolean {
    if (!object) return false;
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
export async function delay(ms: number): Promise<void> {
    await delayCanCancel(ms).waitResult();
}
/**
 * 可取消的异步延时
 *
 * @param ms
 * @returns
 */
export function delayCanCancel(ms: number): ICancelableExec<any> {
    let tHD: any = 0;
    let task = new Promise<any>((resolve) => {
        tHD = setTimeout(resolve, ms)
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
export function arrWinner<T>(arr: Iterable<T>, compareFn: (winner: T, next: T) => T, filter?: (item: T) => boolean): T | null {
    let winner: T | null = null;
    for (let item of arr) {
        if (filter?.call(null, item) === false) continue;
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
export function arrRemoveItems<T>(arr: Array<T>, itemCanRemove: (item: T) => boolean): number {
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
export function arrGroup<Item, GroupBy>(arr: Item[], grouper: (v: Item) => GroupBy): Map<GroupBy, Item[]> {
    let groups: Map<GroupBy, Item[]> = new Map<GroupBy, Item[]>();

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
export function arrItemArrMerge<ArrItem, ItemArrItem>(arr: ArrItem[],
    itemArrGet: (item: ArrItem) => ItemArrItem[],
    mergeProc: (merge: ItemArrItem[], currItem: ItemArrItem[]) => void | false
): ItemArrItem[] {
    let merge: ItemArrItem[] = [];
    for (let item of arr) {
        let itemArr = itemArrGet(item);
        if (mergeProc(merge, itemArr) === false) return merge;
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
export function arrItemArrMergeConcat<ArrItem, ItemArrItem>(arr: ArrItem[],
    itemArrGet: (item: ArrItem) => ItemArrItem[],
): ItemArrItem[] {
    return arrItemArrMerge(arr, itemArrGet, (m, curr) => {
        m = m.concat(...curr);
    })
}


/**
 * 数组元素值累加
 *
 * @typeParam Item
 * @param arr
 * @param mapper
 * @returns
 */
export function arrSum<Item>(arr: Item[], mapper: (item: Item) => number): number {
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
export function arrCount<Item>(arr: Item[], filter: (item: Item) => boolean): number {
    let count = 0;
    for (let item of arr) {
        if (filter(item)) count++;
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
export function arrSkipAndLimit<T>(arr: T[], skip?: number, limit?: number): T[] {
    let start = skip !== undefined ? skip : 0;
    // 如果跳过数量剩下没了，直接返回空数组
    if (start >= arr.length) return [];
    let end = limit !== undefined ? start + limit : arr.length;
    if (end > arr.length) end = arr.length;
    return arr.slice(start, end);
}

/**
 *将两个一样长度的数值数组相加,输出到另外一个一样长度的数值数组
 *
 * @param out
 * @param a
 * @param b
 */
export function numbersAdd(out: number[], a: number[], b: number[]) {
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
export function arrUpdateItems<Item>(out: Item[], set: (oldVal: Item, index: number) => Item) {
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
export function parseProcessArgv(args: string[], configNamePrefix: string = '-'): { [configName: string]: string } {
    let setOption: { [configName: string]: string } = {};
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
export function parseProcessEnv(env: any): { [configName: string]: string } {
    let setOption: { [configName: string]: string } = {};
    for (let key in env) {
        if (key.startsWith('ARGV_')) {
            let argvName = key.substring('ARGV_'.length);
            setOption[argvName] = env[key];
        }
    }
    return setOption;
}


