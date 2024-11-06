
import { assert } from 'chai';
import { FrameSyncExecutor } from "../../../src/gameServer/FrameSyncExecutor";
import { MsgNotifySyncFrame } from '../../../src/shared/gameClient/protocols/MsgNotifySyncFrame';
import { EPlayerInputFrameType } from '../../../src/shared/tsgf/room/IGameFrame';

describe('FrameSyncExecutor', function () {

    test('同步1个空帧', async function () {
        let onSyncOneFrame: ((msg: MsgNotifySyncFrame) => void) | null = null;
        let fse = new FrameSyncExecutor((msg) => {
            if (onSyncOneFrame) onSyncOneFrame(msg);
        });
        fse._syncing = true;//模拟已经开始同步

        onSyncOneFrame = (msg) => {
            assert.ok(msg.syncFrame.frameIndex === 0, `应该为0, 实际为${msg.syncFrame.frameIndex}`);
        };
        //运行1帧后
        fse._syncOneFrameHandler();
        //验证相关索引是否正确
        assert.ok(fse.nextSyncFrameIndex === 1, `应为1,实际为${fse.nextSyncFrameIndex}`);
        assert.ok(fse.maxSyncFrameIndex === 0, `应为0,实际为${fse.maxSyncFrameIndex}`);
        assert.ok(fse.allFrames.length == 0, `应为0,实际为${fse.allFrames.length}`);
        assert.ok(fse.prevSyncFrameIndexArrIndex === -1, `应为-1,实际为${fse.maxSyncFrameIndex}`);
        //验证追帧信息是否正确
        let afterFramesMsg = fse.buildAfterFrames();
        assert.ok(afterFramesMsg.afterEndFrameIndex === 0, "应为0,实际为" + afterFramesMsg.afterEndFrameIndex);
        assert.ok(afterFramesMsg.stateFrameIndex === -1, "应为-1,实际为" + afterFramesMsg.stateFrameIndex);
        assert.ok(afterFramesMsg.afterFrames.length === 0, "应为0,实际为" + afterFramesMsg.afterFrames.length);

    });


    test('同步1空帧,输入,再同步1帧', async function () {
        let onSyncOneFrame: ((msg: MsgNotifySyncFrame) => void) | null = null;
        let fse = new FrameSyncExecutor((msg) => {
            if (onSyncOneFrame) onSyncOneFrame(msg);
        });
        fse._syncing = true;//模拟已经开始同步

        onSyncOneFrame = (msg) => {
            //第一个空帧
            assert.ok(msg.syncFrame.frameIndex === 0, `应该为0, 实际为${msg.syncFrame.frameIndex}`);
            assert.ok(msg.syncFrame.playerInputs === null, `应该为null, 实际为${msg.syncFrame.playerInputs}`);
        };
        //同步第1个帧
        fse._syncOneFrameHandler();
        //验证相关索引是否正确
        assert.ok(fse.nextSyncFrameIndex === 1, `应为1,实际为${fse.nextSyncFrameIndex}`);
        assert.ok(fse.maxSyncFrameIndex === 0, `应为0,实际为${fse.maxSyncFrameIndex}`);
        assert.ok(fse.prevSyncFrameIndexArrIndex === -1, `应为-1,实际为${fse.maxSyncFrameIndex}`);
        assert.ok(fse.allFrames.length == 0, `应为0,实际为${fse.allFrames.length}`);
        //验证追帧信息是否正确
        let afterFramesMsg = fse.buildAfterFrames();
        assert.ok(afterFramesMsg.afterEndFrameIndex === 0, "应为0,实际为" + afterFramesMsg.afterEndFrameIndex);
        assert.ok(afterFramesMsg.stateFrameIndex === -1, "应为-1,实际为" + afterFramesMsg.stateFrameIndex);
        assert.ok(afterFramesMsg.afterFrames.length === 0, "应为0,实际为" + afterFramesMsg.afterFrames.length);

        fse.addPlayerInpFrame("1", EPlayerInputFrameType.Operates,
            (inp) => inp.operates = [{ test: "t1" }]);
        onSyncOneFrame = (msg) => {
            //第2个,应该为输入帧
            assert.ok(msg.syncFrame.frameIndex == 1,
                `应为1,实际为${msg.syncFrame.frameIndex}`);
            assert.ok(msg.syncFrame.playerInputs,
                `应不为null,实际为${msg.syncFrame.playerInputs}`);
            assert.ok(msg.syncFrame.playerInputs!.length === 1,
                `应为1,实际为${msg.syncFrame.playerInputs!.length}`);
            assert.ok(msg.syncFrame.playerInputs![0].playerId === '1',
                `应为1,实际为${msg.syncFrame.playerInputs![0].playerId}`);
            assert.ok(msg.syncFrame.playerInputs![0].operates!.length === 1,
                `应为1,实际为${msg.syncFrame.playerInputs![0].operates!.length}`);
            assert.ok(msg.syncFrame.playerInputs![0].operates![0].test === 't1',
                `应为t1,实际为${msg.syncFrame.playerInputs![0].operates![0].test}`);
        };
        //同步第2个帧
        fse._syncOneFrameHandler();
        //验证帧执行器的相关索引是否正确
        assert.ok(fse.nextSyncFrameIndex === 2, "应为2,实际为" + fse.nextSyncFrameIndex);
        assert.ok(fse.maxSyncFrameIndex === 1, "应为1,实际为" + fse.maxSyncFrameIndex);
        assert.ok(fse.allFrames.length == 1, `应为1,实际为${fse.allFrames.length}`);
        assert.ok(fse.prevSyncFrameIndexArrIndex === 0, `应为0,实际为${fse.maxSyncFrameIndex}`);
        //验证追帧信息是否正确
        afterFramesMsg = fse.buildAfterFrames();
        assert.ok(afterFramesMsg.afterEndFrameIndex === 1, "应为1,实际为" + afterFramesMsg.afterEndFrameIndex);
        assert.ok(afterFramesMsg.stateFrameIndex === -1, "应为-1,实际为" + afterFramesMsg.stateFrameIndex);
        assert.ok(afterFramesMsg.afterFrames.length === 1, "应为1,实际为" + afterFramesMsg.afterFrames.length);
    });

})