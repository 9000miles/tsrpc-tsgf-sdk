
function formatObj(obj: any) {
    if (obj.stack) {
        return obj.stack;
    } else if (typeof (obj) === 'object') {
        return JSON.stringify(obj, null, 4);
    }
    return obj;
}
function objArrJoin(arr: any[]) {
    let str = "", sp = "";
    for (let i = 0; i < arr.length; i++) {
        str += sp;
        str += formatObj(arr[i]);
        sp = "\n";
    }
    return str
}

export const logger = {
    ignoreKeys: ["SyncFrame", "ClusterSyncNodeInfo", "InpFrame", "AfterFrames", "SyncState"],
    debug(...args: any[]) {
        // 什么也不做，相当于隐藏了日志
    },
    log(...args: any[]) {
        if (!args || args.length <= 0) return;
        // 让日志仍然输出到控制台
        if (
            args.find(a => a && a.indexOf && this.ignoreKeys.find(k => a.indexOf(k) > -1))
        ) {
            //有忽略的关键字，跳过
            return;
        }
        console.log(new Date().toLocaleString() + "|" + objArrJoin(args));
        //console.log(...args);
    },
    warn(...args: any[]) {
        if (!args || args.length <= 0) return;
        console.warn(new Date().toLocaleString() + "|" + objArrJoin(args));
        //console.warn(...args);
    },
    error(...args: any[]) {
        if (!args || args.length <= 0) return;
        console.error(new Date().toLocaleString() + "|" + objArrJoin(args));
        //console.error(...args);
    },
}