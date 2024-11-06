import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { assert } from "chai";
import { GameClient } from "../../src/shared/gameClient/GameClient";
import { IResult, Result } from "../../src/shared/tsgf/Result";
import { delay } from "../../src/shared/tsgf/Utils";
import { authPlayerToken, createAndEnterRoom, ICreateAndEnterResult, joinRoomUseGameServerResult, setLogEnabled } from "../unitTest/api/ApiUtils";

interface IWorkerData {
    id: number;
    roomId: string;
    gameServerUrl: string;
    inputFS: number;
}
interface IWorkerState {
    isEnd: boolean;
    isReady: boolean;
    fsList: number[];
    fsAverage: number;
    inputFsList: number[];
    inputFsAverage: number;
    calculateInputFS: number;
}
function createWorkerState(): IWorkerState {
    return {
        isEnd: false,
        isReady: false,
        fsList: [],
        fsAverage: 0,
        inputFsList: [],
        inputFsAverage: 0,
        calculateInputFS: 0,
    };
}
interface IMockInputFSHandler {
    calculateInputFS: number;
    cancel: () => void;
}
interface ITestReportData {
    allState: Map<number, IWorkerState>;
    allFsAverage: number;
    allInputFsAverage: number;
    allCalculateInputFSAverage: number;
}

async function createPlayerJoin(openId: string, roomId: string, gameServerUrl: string): Promise<IResult<GameClient>> {
    let auth = await authPlayerToken(openId, openId);
    if (!auth) return Result.buildErr(`auth失败：${openId}`);
    let ret = await joinRoomUseGameServerResult(gameServerUrl, auth.playerToken, roomId, openId);

    return ret;
}
async function createRoomRet(openId: string, count: number): Promise<ICreateAndEnterResult> {
    let auth = await authPlayerToken(openId, openId);
    assert.isOk(auth, `auth失败：zum1`);
    let createRet = await createAndEnterRoom(auth.playerToken, auth.playerId, 'zum1', {
        maxPlayers: count,
    });
    assert.isOk(createRet.succ, createRet.err);
    return createRet.data!;
}

async function workerRun({ id, roomId, gameServerUrl, inputFS }: IWorkerData) {
    let ret = await createPlayerJoin(`open${id}`, roomId, gameServerUrl);
    if (!ret.succ) {
        parentPort?.postMessage({ step: 'error', ret });
        process.exit(0);
    }
    let gameClient = ret.data;
    let mockInputFS: IMockInputFSHandler | null = null;
    let frameBatchCount = 0;
    let framePrevTime = 0;
    gameClient.onStartFrameSync = () => {
        framePrevTime = Date.now();
        mockInputFS = startInputFrame(id, gameClient, inputFS, { test: '测试我是个输入帧' }, (rtInputFS) => {
            parentPort?.postMessage({ step: 'rtInputFS', ret: { data: { rtInputFS } } });
        });
        parentPort?.postMessage({
            step: 'startInputFrame', ret: {
                data: {
                    calculateInputFS: mockInputFS.calculateInputFS,
                }
            }
        });
    };
    gameClient.onRecvFrame = () => {
        frameBatchCount++;
        if (frameBatchCount >= 10) {
            let useTime = Date.now() - framePrevTime;
            let fs = frameBatchCount / useTime * 1000;
            parentPort?.postMessage({ step: 'frameState', ret: { data: { fs } } });
            frameBatchCount = 0;
            framePrevTime = Date.now();
        }
    };
    gameClient.onStopFrameSync = async () => {
        mockInputFS?.cancel();
        await gameClient.disconnect();
        endFn?.();
        endFn = null;
    };

    let endFn: ((...args: any[]) => void) | null = null;
    parentPort?.postMessage({ step: 'ready' });
    await new Promise(res => {
        endFn = (d) => res(d);
    })
}

function runWorker(id: number, cb: (data: { id: number, step: string, ret?: any }) => void, workerData: IWorkerData) {
    const worker = new Worker(__filename, { workerData });
    worker.on('message', (d) => cb({ ...d, id, }));
    worker.on('error', (err) => cb({ id, step: 'initError', ret: { err: err.message } }));
    worker.on('exit', (exitCode) => {
        if (exitCode === 0) {
            return null;
        }
        cb({ id, step: 'exitError', ret: { id, err: `Worker has stopped with code ${exitCode}` } });
    });
    return worker;
}

/**
 * 开始模拟输入帧率额
 * @param gameClient 
 * @param inputFS 计划的输入帧，因为是会换算成每多少毫秒发送一次，如果不能整除，将会替换为最接近的帧率来模拟
 * @param frameData 发送的帧数据
 * @param outRTInputFS 间隔通知外部实际输入帧率
 * @returns mock input frame 
 */
function startInputFrame(id: number, gameClient: GameClient, inputFS: number, frameData: any, outRTInputFS: (rtInputFS: number) => void): IMockInputFSHandler {
    // 计算出期望间隔时间
    let expectInterval = Math.floor(1000 / inputFS);
    if (expectInterval < 4) expectInterval = 4;//定时任务实际最小间隔为4ms
    // 再反算出这个间隔时间对应的输入帧率,叫做计算输入帧率
    let calculateInputFS = Math.floor(1000 / expectInterval);
    let prev = Date.now();
    let timerHandler: any = null;
    let rtBatchCount = 0;
    let rtPrevTime = Date.now();
    let next = async () => {
        if (!timerHandler) return;
        if (!gameClient.client || !gameClient.client.isConnected) return;
        await gameClient.playerInpFrame([frameData]);
        if (!timerHandler) return;//await回来，可能外部取消了，直接返回
        rtBatchCount++;
        if (rtBatchCount >= 10) {
            //每10次发送，计算一次实际输入帧率   
            let useTime = Date.now() - rtPrevTime;
            let rtFS = rtBatchCount / useTime * 1000;
            outRTInputFS(rtFS);//通知外部收集
            rtPrevTime = Date.now();
            rtBatchCount = 0;
        }
        //距离上次定时过去的时间,正常情况下应该超过interval，毕竟是间隔+发送数据的开销
        let prevSendInvTime = Date.now() - prev;
        //动态计算下次间隔
        let nextInv = 2 * expectInterval - prevSendInvTime;
        //实际耗时都超过想要的间隔了, 按最少4ms来计算
        if (nextInv < 4) nextInv = 4;
        prev = Date.now();
        timerHandler = setTimeout(next, nextInv);
        return timerHandler;
    };
    timerHandler = setTimeout(next, expectInterval);
    return {
        calculateInputFS,
        cancel() {
            clearTimeout(timerHandler);
            timerHandler = null;
        },
    };
}


async function runOnline(allPlayerCount: number, inputFS: number, syncFrameSec: number): Promise<ITestReportData> {
    let workerCount = allPlayerCount - 1;
    let roomId = '';
    let gameServerUrl = '';

    let allFsAverage = 0;
    let allInputFsAverage = 0;
    let allCalculateInputFSAverage = 0;

    let ret = await createRoomRet('zum1', allPlayerCount);
    roomId = ret.roomId;
    gameServerUrl = ret.gameServerUrl;
    let gameClient = ret.gameClient;
    gameClient.client.logger!.log = () => { };//将普通日志都停掉，防止消息太多
    let waitAllReady: ((...args: string[]) => void) | null = null;
    let workerRet: Map<number, IWorkerState> = new Map();
    let workers: Worker[] = [];
    for (let id = 1; id <= workerCount; id++) {
        let worker = runWorker(id, ({ id, step, ret }) => {
            let d = workerRet.get(id);
            if (!d) {
                d = createWorkerState();
                workerRet.set(id, d);
            }
            switch (step) {
                case 'ready': {
                    console.log(`id:${id} [${step}]`);
                    d.isReady = true;
                    break;
                }
                case 'startInputFrame': {
                    d.calculateInputFS = ret.data.calculateInputFS;
                    break;
                }
                case 'frameState': {
                    d.fsList.push(ret.data.fs);
                    break;
                }
                case 'rtInputFS': {
                    d.inputFsList.push(ret.data.rtInputFS);
                    break;
                }
                default: {
                    console.log(`id:${id} [${step}]`, ret);
                    d.isEnd = true;
                    break;
                }
            }

            if (workerRet.size === workerCount) {
                waitAllReady?.();
                waitAllReady = null;
            }
        }, { id, roomId, gameServerUrl, inputFS });
        workers.push(worker);
    }


    await new Promise(res => {
        waitAllReady = (args) => res(args)
    });
    let tmpWorkers = [...workerRet.values()];
    if (tmpWorkers.count(d => d.isReady) !== workerCount) {
        // 说明有问题，停止
        console.log('线程等待时间完成');// 后续改成主线程通知完成才退出
        await gameClient.disconnect();
        return {
            allState: workerRet,
            allFsAverage,
            allInputFsAverage,
            allCalculateInputFSAverage,
        };
    }
    // 如果都是准备的状态，则正常开始
    console.log(`开始帧同步（运行${syncFrameSec}秒）`);
    await gameClient.startFrameSync();

    //在都准备好后，帧同步运行10秒
    await delay(syncFrameSec * 1000);

    await gameClient.stopFrameSync();
    console.log('停止帧同步');

    let allFsCount = 0;
    let allInputFsCount = 0;
    let allCalculateInputFSCount = 0;
    for (let [id, d] of workerRet) {
        if (d.fsList.length) {
            d.fsAverage = d.fsList.sum() / d.fsList.length;
            d.fsList.length = 0;
            allFsAverage += d.fsAverage;
            allFsCount++;
        }
        if (d.inputFsList.length) {
            d.inputFsAverage = d.inputFsList.sum() / d.inputFsList.length;
            d.inputFsList.length = 0;
            allInputFsAverage += d.inputFsAverage;
            allInputFsCount++;
        }
        if (d.calculateInputFS) {
            allCalculateInputFSAverage += d.calculateInputFS;
            allCalculateInputFSCount++;
        }
    }
    if (allFsCount && allFsAverage) {
        allFsAverage = allFsAverage / allFsCount;
    }
    if (allInputFsAverage && allInputFsCount) {
        allInputFsAverage = allInputFsAverage / allInputFsCount;
    }
    if (allCalculateInputFSAverage && allCalculateInputFSCount) {
        allCalculateInputFSAverage = allCalculateInputFSAverage / allCalculateInputFSCount;
    }
    return {
        allState: workerRet,
        allFsAverage,
        allInputFsAverage,
        allCalculateInputFSAverage,
    };
}


//要把通讯的日志关掉，不然太多会出问题
setLogEnabled(false);

let playerCount = 50;//再大话，目前的机制，worker内部的通讯效率会变成瓶颈，除非数据在worker内部算好，结束后一次性推送
let inputFS = 10;
let frameSyncSec = 20;

if (!isMainThread) {
    workerRun(workerData);
} else {
    console.log(`开始运行${playerCount}人在线,${inputFS}输入帧率`);
    runOnline(playerCount, inputFS, frameSyncSec).then(function (res) {
        console.log(`结束运行`, res);
        process.exit(0);
    })
}
