
import { MsgPlayerInpFrame } from "../shared/gameClient/protocols/MsgPlayerInpFrame";
import { MsgNotifySyncFrame } from "../shared/gameClient/protocols/MsgNotifySyncFrame";
import { EPlayerInputFrameType, IAfterFrames, IGameSyncFrame, IFramePlayerInput, IPlayerInputOperate } from "../shared/tsgf/room/IGameFrame";

//兼容的SetImmediate
const localSetImmediate = typeof (setImmediate) !== 'undefined' ? setImmediate : (fn: () => any) => setTimeout(fn, 0);


export class FrameSyncExecutor {

    /**同步帧率(每秒多少帧),默认每秒60帧*/
    private _syncFrameRate: number;
    /**每帧的理论间隔秒数*/
    private _syncFrameIntervalMs: number;
    /**帧同步的定时器句柄*/
    private _frameUpdateHD!: NodeJS.Timeout;
    /**上一帧的时间戳*/
    private _prevFrameTime: number = 0;
    /**开始同步帧的时间戳*/
    private _startFrameTime: number = 0;
    private _runFrameAndNextBind: () => void;
    /**同步每一帧的临时消息*/
    private _syncOneFrameTempMsg: MsgNotifySyncFrame = {
        syncFrame: { frameIndex: 0, playerInputs: null },
        dt: 0,
    };
    /**同步每一帧需要的处理器*/
    private onSyncOneFrame: (msg: MsgNotifySyncFrame) => void;

    /**当前是否在执行帧同步中, 只有内部或者单元测试可以访问!*/
    _syncing: boolean = false;
    /**当前是否在执行帧同步中*/
    get syncing() {
        return this._syncing;
    }

    /**下次同步的帧索引,从0开始, 执行完一次帧同步后值会更新为下一帧的帧索引*/
    private _nextSyncFrameIndex = 0;
    /**下次同步的帧索引,从0开始, 执行完一次帧同步后值会更新为下一帧的帧索引*/
    get nextSyncFrameIndex() {
        return this._nextSyncFrameIndex;
    }
    /**上次同步的帧索引在帧数组中的索引位置, 即首次为-1, 只有非空帧时才前进一位*/
    private _prevSyncFrameIndexArrIndex = -1;
    /**上次同步的帧索引在帧数组中的索引位置, 即首次为-1, 只有非空帧时才前进一位*/
    get prevSyncFrameIndexArrIndex() {
        return this._prevSyncFrameIndexArrIndex;
    }

    /**当前最大帧索引,自动同步帧和输入帧放下一帧,都会推动和同步最大帧索引*/
    private _maxSyncFrameIndex = -1;
    /**当前最大帧索引,自动同步帧和输入帧放下一帧,都会推动和同步最大帧索引*/
    get maxSyncFrameIndex() {
        return this._maxSyncFrameIndex;
    }

    /**所有帧数据,不存储空帧 */
    private _allFrames: IGameSyncFrame[] = [];
    /**所有帧数据 */
    get allFrames() {
        return this._allFrames;
    }

    /**所有帧索引对应数组索引, 如果指向空帧,则为上一个最近的数组索引 */
    private _allFrameIndexMapArrIndex: number[] = [];
    get allFrameIndexMapArrIndex() {
        return this._allFrameIndexMapArrIndex;
    }

    /**当前最后一次游戏状态数据*/
    private _lastStateData: any = {};
    /**当前最后一次游戏状态数据*/
    get lastStateData() {
        return this._lastStateData;
    }

    /**当前最后一次游戏状态数据来自哪一帧(即从下一帧开始追帧)*/
    private _lastStateFrameIndex = -1;
    /**当前最后一次游戏状态数据来自哪一帧(即从下一帧开始追帧)*/
    get lastStateFrameIndex() {
        return this._lastStateFrameIndex;
    }

    constructor(onSyncOneFrame: (msg: MsgNotifySyncFrame) => void, syncFrameRate = 30) {
        this._syncFrameRate = syncFrameRate;
        this._syncFrameIntervalMs = 1000 / syncFrameRate;
        this.onSyncOneFrame = onSyncOneFrame;
        this._runFrameAndNextBind = this.runFrameAndNext.bind(this);
    }


    /**
     * 停止同步游戏帧
     */
    public stopSyncFrame(): void {
        this._syncing = false;
        clearTimeout(this._frameUpdateHD);

        this._lastStateData = {};
        this._lastStateFrameIndex = -1;
        this._allFrames = [];
        this._allFrameIndexMapArrIndex = [];
        this._nextSyncFrameIndex = 0;
        this._prevSyncFrameIndexArrIndex = -1;
        this._maxSyncFrameIndex = -1;
    }
    /**
     * 开始同步游戏帧(从下个间隔开始发送)
     */
    public startSyncFrame(): void {
        if (!this._syncing) {
            this._startFrameTime = this._prevFrameTime = Date.now();
            //首次按理论帧率开始
            this._frameUpdateHD = setTimeout(this._runFrameAndNextBind, this._syncFrameIntervalMs);
            this._syncing = true;
        }
    }
    private runFrameAndNext(): void {
        const now = Date.now();
        this._syncOneFrameTempMsg.dt = (now - this._prevFrameTime) / 1000;
        this._syncOneFrameHandler();
        this._prevFrameTime = now;

        //开始计算下一帧应该开始的时间

        //先计算,从开始同步到下一帧理论应该执行的时间戳
        const nextFrameRunTime = this._startFrameTime + this._nextSyncFrameIndex * this._syncFrameIntervalMs;
        //再计算出当前时间再过多久到
        let waitMs = nextFrameRunTime - now;
        //当然, 也可能是负数(即在这现在之前就应该跑到了, 但都超过时间了, 则置为0, 尽最大努力执行)
        if (waitMs < 0) {
            //需要追帧了, 则用最快的事件循环, 因为setTimeout0 相当于setTimeout4
            localSetImmediate(this._runFrameAndNextBind);
        } else {
            this._frameUpdateHD = setTimeout(this._runFrameAndNextBind, waitMs);
        }

    }


    /**
     * 同步下个游戏帧的处理器, 正常由内部定时器调用, 只有在单元测试时可以让外部调用进行测试
     */
    _syncOneFrameHandler(): void {
        //本次要同步的帧索引
        let currFrameIndex = this._nextSyncFrameIndex;
        /**下一帧的数组索引,因为可能是空帧,所以本索引可能指向不对(可能为后面某个非空帧的索引)!*/
        let currFrameArrIndex = this._prevSyncFrameIndexArrIndex + 1;
        //最大帧索引推进
        if (this._nextSyncFrameIndex > this._maxSyncFrameIndex) {
            this._maxSyncFrameIndex = this._nextSyncFrameIndex;
        }
        //下一帧索引推进
        this._nextSyncFrameIndex++;
        if (currFrameArrIndex >= this._allFrames.length
            || currFrameIndex < this._allFrames[currFrameArrIndex].frameIndex) {
            //数组长度不够, 或者 下一位帧的帧索引还没到,则视为空帧
            this._syncOneFrameTempMsg.syncFrame = { frameIndex: currFrameIndex, playerInputs: null };
            //本帧索引,对应的还是上一个数组索引
            this._allFrameIndexMapArrIndex[currFrameIndex] = this._prevSyncFrameIndexArrIndex;
        } else {
            //就是这个顺位帧了!
            this._syncOneFrameTempMsg.syncFrame = this._allFrames[currFrameArrIndex];
            //本帧的数组索引有效,记录,下个帧从这里往后找
            this._prevSyncFrameIndexArrIndex = currFrameArrIndex;
            //本帧索引对应的数组索引更新
            this._allFrameIndexMapArrIndex[currFrameIndex] = currFrameArrIndex;
        }
        //触发事件
        this.onSyncOneFrame(this._syncOneFrameTempMsg);
    }


    /**
     * 同步游戏状态数据
     * @param stateData 
     * @param stateFrameIndex 
     */
    public syncStateData(stateData: any, stateFrameIndex: number): void {
        this._lastStateData = stateData;
        this._lastStateFrameIndex = stateFrameIndex;
    }

    /**
     * [同步中才有效]添加玩家的输入帧到下一帧
     * @param playerId 
     * @param inpFrameType 输入帧类型
     * @param setOthersProp 自行设置额外字段
     */
    public addPlayerInpFrame(playerId: string, inpFrameType: EPlayerInputFrameType,
        setOthersProp?: (inpFrame: IFramePlayerInput) => void): void {
        if (!this._syncing) return;
        //收到的输入下一帧生效
        let frameIndex = this._nextSyncFrameIndex;
        /**下一帧的数组索引,因为要加入输入帧,所以本索引一定存在!*/
        let nextFrameArrIndex = this._prevSyncFrameIndexArrIndex + 1;
        //更新最大帧索引
        if (frameIndex > this._maxSyncFrameIndex) this._maxSyncFrameIndex = frameIndex;

        let nextFrame: IGameSyncFrame | undefined;
        if (this._allFrames.length > nextFrameArrIndex) {
            //数组长度够索引
            if (this._allFrames[nextFrameArrIndex].frameIndex === frameIndex) {
                //并且数组下一位元素刚好就是下一帧
                nextFrame = this._allFrames[nextFrameArrIndex];
            } else {
                //不是,说明中间是空帧,创建一个并插入
                nextFrame = {
                    frameIndex: frameIndex,
                    playerInputs: [],
                };
                this._allFrames.splice(nextFrameArrIndex, 0, nextFrame);
                //新增帧,更新该帧索引对应的数组索引
                this._allFrameIndexMapArrIndex[frameIndex] = nextFrameArrIndex;
            }
        } else {
            //数组长度不够索引下一位, 需要生成新的一帧
            nextFrame = {
                frameIndex: frameIndex,
                playerInputs: [],
            };
            this._allFrames.push(nextFrame);
            nextFrameArrIndex = this._allFrames.length - 1;
            //新增帧,更新该帧索引对应的数组索引
            this._allFrameIndexMapArrIndex[frameIndex] = nextFrameArrIndex;
        }

        //生成玩家输入
        let inpFrame: IFramePlayerInput = {
            playerId: playerId,
            inputFrameType: inpFrameType,
        };
        //如果有自定义属性
        if (setOthersProp) setOthersProp(inpFrame);
        //玩家输入加入到下一帧中
        nextFrame.playerInputs!.push(inpFrame);
    }

    /**
     * 获取给连接发追帧数据(最后状态数据+追帧包)
     * @param startFrameIndex 使用指定的帧索引开始追帧. 不传则默认使用服务端状态同步所在帧索引开始,如果没有状态同步则从头开始
     */
    public buildAfterFrames(startFrameIndex?: number): IAfterFrames {
        //没指定其实,则使用状态同步所在帧索引+1
        if (startFrameIndex === undefined) startFrameIndex = this._lastStateFrameIndex + 1;
        let aFrames = this.requestFrames(startFrameIndex);
        let msg: IAfterFrames = {
            stateData: this._lastStateData,
            stateFrameIndex: this._lastStateFrameIndex,
            afterFrames: aFrames,
            afterStartFrameIndex: startFrameIndex,
            afterEndFrameIndex: this._maxSyncFrameIndex,
            serverSyncFrameRate: this._syncFrameRate,
        };
        return msg;
    }

    /**
     * 请求帧数组,结果不包含空帧
     *
     * @public
     * @param beginFrameIndex 起始帧索引(包含)
     * @param endFrameIndex 截止帧索引(包含), 如果没传,则为当前最大帧
     * @returns 结果不包含空帧
     */
    public requestFrames(beginFrameIndex: number, endFrameIndex?: number): IGameSyncFrame[] {
        let aFrames: IGameSyncFrame[] = [];
        if (typeof endFrameIndex === 'undefined') endFrameIndex = this._maxSyncFrameIndex;
        for (let i = beginFrameIndex; i <= endFrameIndex; i++) {
            let arrIndex = this._allFrameIndexMapArrIndex[i];
            let frame = typeof arrIndex !== 'undefined' ? this._allFrames[arrIndex] : null;
            if (frame && frame.frameIndex === i) {
                aFrames.push(frame);
            }
        }
        return aFrames;
    }



}