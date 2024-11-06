

import './Env';
import { initGame } from "./TestUnit";
import { assert } from 'chai';
import { ERoomMsgRecvType, IRecvRoomMsg } from '../../src/tsgf/room/IRoomMsg';
import { delay } from '../../src/tsgf/Utils';
import { ISingleMatcherParams, MatcherKeys } from '../../src/tsgf/match/Models';
import { logger } from '../../src/tsgf/logger';
import { ErrorCodes } from '../../src/tsgf/Result';


describe("组队房间", () => {

    test('3个玩家组队发消息', async function () {

        let initRet1 = await initGame('3个玩家组队发消息_z1', 'z1');
        assert.ok(initRet1.succ, initRet1.err);
        let z1SDK = initRet1.data!;
        let initRet2 = await initGame('3个玩家组队发消息_z2', 'z2');
        assert.ok(initRet2.succ, initRet2.err);
        let z2SDK = initRet2.data!;
        let initRet3 = await initGame('3个玩家组队发消息_z3', 'z3');
        assert.ok(initRet3.succ, initRet3.err);
        let z3SDK = initRet3.data!;

        let gMsgCount = 0, rMsgCount = 0, gJoinCount = 0, rJoinCount = 0, gLeaveCount = 0, rLeaveCount = 0;
        z1SDK.group.events.onRecvGroupMsg(msg => gMsgCount++);
        z2SDK.group.events.onRecvGroupMsg(msg => gMsgCount++);
        z3SDK.group.events.onRecvGroupMsg(msg => gMsgCount++);
        z1SDK.room.events.onRecvRoomMsg(msg => rMsgCount++);
        z2SDK.room.events.onRecvRoomMsg(msg => rMsgCount++);
        z3SDK.room.events.onRecvRoomMsg(msg => rMsgCount++);

        z1SDK.group.events.onJoinGroup(msg => gJoinCount++);
        z2SDK.group.events.onJoinGroup(msg => gJoinCount++);
        z3SDK.group.events.onJoinGroup(msg => gJoinCount++);
        z1SDK.room.events.onJoinRoom(msg => rJoinCount++);
        z2SDK.room.events.onJoinRoom(msg => rJoinCount++);
        z3SDK.room.events.onJoinRoom(msg => rJoinCount++);

        z1SDK.group.events.onLeaveGroup(msg => gLeaveCount++);
        z2SDK.group.events.onLeaveGroup(msg => gLeaveCount++);
        z3SDK.group.events.onLeaveGroup(msg => gLeaveCount++);
        z1SDK.room.events.onLeaveRoom(msg => rLeaveCount++);
        z2SDK.room.events.onLeaveRoom(msg => rLeaveCount++);
        z3SDK.room.events.onLeaveRoom(msg => rLeaveCount++);

        let gPJoin = 0, rPJoin = 0, gPLeave = 0, rPLeave = 0;
        z1SDK.group.events.onPlayerJoinGroup(msg => gPJoin++);
        z2SDK.group.events.onPlayerJoinGroup(msg => gPJoin++);
        z3SDK.group.events.onPlayerJoinGroup(msg => gPJoin++);
        z1SDK.room.events.onPlayerJoinRoom(msg => rPJoin++);
        z2SDK.room.events.onPlayerJoinRoom(msg => rPJoin++);
        z3SDK.room.events.onPlayerJoinRoom(msg => rPJoin++);

        z1SDK.group.events.onPlayerLeaveGroup(msg => gPLeave++);
        z2SDK.group.events.onPlayerLeaveGroup(msg => gPLeave++);
        z3SDK.group.events.onPlayerLeaveGroup(msg => gPLeave++);
        z1SDK.room.events.onPlayerLeaveRoom(msg => rPLeave++);
        z2SDK.room.events.onPlayerLeaveRoom(msg => rPLeave++);
        z3SDK.room.events.onPlayerLeaveRoom(msg => rPLeave++);

        let gDismiss = 0, rDismiss = 0;
        z1SDK.group.events.onDismissGroupRoom(msg => gDismiss++);
        z2SDK.group.events.onDismissGroupRoom(msg => gDismiss++);
        z3SDK.group.events.onDismissGroupRoom(msg => gDismiss++);
        z1SDK.room.events.onDismissRoom(msg => rDismiss++);
        z2SDK.room.events.onDismissRoom(msg => rDismiss++);
        z3SDK.room.events.onDismissRoom(msg => rDismiss++);

        gMsgCount = 0, rMsgCount = 0, gJoinCount = 0, rJoinCount = 0, gLeaveCount = 0, rLeaveCount = 0;
        let cRet = await z1SDK.group.createGroup({});
        assert.ok(cRet.succ, cRet.err);
        await delay(50);
        assert.ok(gJoinCount === 1, `玩家创建组队,应该收到1条消息, 实际为${gJoinCount},${rJoinCount}`);
        assert.ok(rJoinCount === 0, `应该收到0条消息, 实际为${rJoinCount}`);

        gMsgCount = 0, rMsgCount = 0, gJoinCount = 0, rJoinCount = 0, gLeaveCount = 0, rLeaveCount = 0;
        gPJoin = 0, rPJoin = 0, gPLeave = 0, rPLeave = 0;
        let joinRet = await z2SDK.group.joinGroup({}, cRet.data!);
        assert.ok(joinRet.succ, joinRet.err);
        await delay(50);
        assert.ok(gJoinCount === 1, `玩家2加入组队后,应该收到1条消息, 实际为${gJoinCount}`);
        assert.ok(rJoinCount === 0, `应该收到0条消息, 实际为${rJoinCount}`);
        assert.ok(gPJoin === 1, `应该收到1条消息, 实际为${gPJoin}`);
        assert.ok(rPJoin === 0, `应该收到0条消息, 实际为${rPJoin}`);

        gMsgCount = 0, rMsgCount = 0, gJoinCount = 0, rJoinCount = 0, gLeaveCount = 0, rLeaveCount = 0;
        let sendRet = await z1SDK.group.sendGroupMsg({
            recvType: ERoomMsgRecvType.ROOM_ALL,
            msg: 'test'
        });
        assert.ok(sendRet.succ, sendRet.err);
        await delay(100);
        assert.ok(gMsgCount === 2, `应该收到2条自定义消息, 实际为${gMsgCount}`);
        assert.ok(rMsgCount === 0, `应该收到0条消息, 实际为${rMsgCount}`);

        gMsgCount = rMsgCount = 0;
        sendRet = await z1SDK.room.sendRoomMsg({
            recvType: ERoomMsgRecvType.ROOM_ALL,
            msg: 'test'
        });
        assert.ok(sendRet.succ, sendRet.err);
        await delay(100);
        assert.ok(gMsgCount === 2, `应该收到2条消息, 实际为${gMsgCount}`);
        assert.ok(rMsgCount === 0, `应该收到0条消息, 实际为${rMsgCount}`);

        gMsgCount = 0, rMsgCount = 0, gJoinCount = 0, rJoinCount = 0, gLeaveCount = 0, rLeaveCount = 0;
        gPJoin = 0, rPJoin = 0, gPLeave = 0, rPLeave = 0;
        joinRet = await z3SDK.group.joinGroup({}, cRet.data!);
        assert.ok(joinRet.succ, joinRet.err);
        assert.ok(gJoinCount === 1, `应该收到1条消息, 实际为${gJoinCount}`);
        assert.ok(rJoinCount === 0, `应该收到0条消息, 实际为${rJoinCount}`);
        assert.ok(gPJoin === 2, `应该收到2条消息, 实际为${gPJoin}`);
        assert.ok(rPJoin === 0, `应该收到0条消息, 实际为${rPJoin}`);

        gMsgCount = rMsgCount = 0;
        sendRet = await z1SDK.group.sendGroupMsg({
            recvType: ERoomMsgRecvType.ROOM_ALL,
            msg: 'test'
        });
        assert.ok(sendRet.succ, sendRet.err);
        await delay(100);
        assert.ok(gMsgCount === 3, `应该收到3条消息, 实际为${gMsgCount}`);
        assert.ok(rMsgCount === 0, `应该收到0条消息, 实际为${rMsgCount}`);

        gMsgCount = rMsgCount = 0;
        sendRet = await z1SDK.group.sendGroupMsg({
            recvType: ERoomMsgRecvType.ROOM_OTHERS,
            msg: 'test'
        });
        assert.ok(sendRet.succ, sendRet.err);
        await delay(50);
        assert.ok(gMsgCount === 2, `应该收到2条消息, 实际为${gMsgCount}`);
        assert.ok(rMsgCount === 0, `应该收到0条消息, 实际为${rMsgCount}`);

        gMsgCount = rMsgCount = 0;
        sendRet = await z1SDK.group.sendGroupMsg({
            recvType: ERoomMsgRecvType.ROOM_SOME,
            recvPlayerList: [z2SDK.game.__myPlayerId],
            msg: 'test'
        });
        assert.ok(sendRet.succ, sendRet.err);
        await delay(50);
        assert.ok(gMsgCount === 1, `应该收到1条消息, 实际为${gMsgCount}`);
        assert.ok(rMsgCount === 0, `应该收到0条消息, 实际为${rMsgCount}`);

        gLeaveCount = 0, rLeaveCount = 0;

        gPLeave = 0, rPLeave = 0;
        let leaveRet = await z2SDK.group.leaveGroup();
        assert.ok(leaveRet.succ, leaveRet.err);
        await delay(50);
        assert.ok(gPLeave === 2, `应该收到2条消息, 实际为${gPLeave}`);
        assert.ok(rPLeave === 0, `应该收到0条消息, 实际为${rPLeave}`);

        gDismiss = 0, rDismiss = 0;
        let dismissRet = await z1SDK.group.dismissGroup();
        assert.ok(dismissRet.succ, dismissRet.err);
        await delay(50);
        assert.ok(gDismiss === 1, `应该收到1条消息, 实际为${gDismiss}`);
        assert.ok(rDismiss === 0, `应该收到0条消息, 实际为${rDismiss}`);
        assert.ok(gLeaveCount === 3, `应该收到3条消息, 实际为${gLeaveCount}`);
        assert.ok(rLeaveCount === 0, `应该收到0条消息, 实际为${rLeaveCount}`);

        //下面进房间再测试一次
        gJoinCount = 0, rJoinCount = 0;
        gPJoin = 0, rPJoin = 0;
        let createRoomRet = await z1SDK.room.createRoom({}, {
            isPrivate: true,
            roomName: 'test',
            maxPlayers: 3,
            ownerPlayerId: z1SDK.game.__myPlayerId,
        });
        assert.ok(createRoomRet.succ, createRoomRet.err);

        let joinRoomRet = await z2SDK.room.joinRoom({}, { roomId: createRoomRet.data!.roomId });
        assert.ok(joinRoomRet.succ, joinRoomRet.err);
        joinRoomRet = await z3SDK.room.joinRoom({}, { roomId: createRoomRet.data!.roomId });
        assert.ok(joinRoomRet.succ, joinRoomRet.err);
        assert.ok(gPJoin === 0, `应该收到0条消息, 实际为${gPJoin}`);
        assert.ok(rPJoin === 3, `应该收到1+2条消息, 实际为${rPJoin}`);

        sendRet = await z1SDK.group.sendGroupMsg({
            recvType: ERoomMsgRecvType.ROOM_ALL,
            msg: 'test'
        });
        assert.ok(sendRet.code === ErrorCodes.RoomNotIn, '应该提示不在组队房间!');

        gMsgCount = rMsgCount = 0;
        sendRet = await z1SDK.room.sendRoomMsg({
            recvType: ERoomMsgRecvType.ROOM_ALL,
            msg: 'test'
        });
        assert.ok(sendRet.succ, sendRet.err);
        await delay(50);
        assert.ok(gMsgCount === 0, `应该收到0条消息, 实际为${gMsgCount}`);
        assert.ok(rMsgCount === 3, `应该收到3条消息, 实际为${rMsgCount}`);

        await z1SDK.dispose();
        await z2SDK.dispose();
        await z3SDK.dispose();

    }, 600000);

    test('3个玩家组队匹配进房间后再回到组队', async function () {

        let initRet1 = await initGame('3个玩家组队匹配进房间后再回到组队_z1', 'z1');
        assert.ok(initRet1.succ, initRet1.err);
        let z1SDK = initRet1.data!;
        let initRet2 = await initGame('3个玩家组队匹配进房间后再回到组队_z2', 'z2');
        assert.ok(initRet2.succ, initRet2.err);
        let z2SDK = initRet2.data!;
        let initRet3 = await initGame('3个玩家组队匹配进房间后再回到组队_z3', 'z3');
        assert.ok(initRet3.succ, initRet3.err);
        let z3SDK = initRet3.data!;

        let cRet = await z1SDK.group.createGroup({});
        assert.ok(cRet.succ, cRet.err);
        let joinRet = await z2SDK.group.joinGroup({}, cRet.data!);
        assert.ok(joinRet.succ, joinRet.err);
        joinRet = await z3SDK.group.joinGroup({}, cRet.data!);
        assert.ok(joinRet.succ, joinRet.err);


        let startM = 0, cancelM = 0;
        z1SDK.group.events.onGroupMatchStart(() => startM++);
        z2SDK.group.events.onGroupMatchStart(() => startM++);
        z3SDK.group.events.onGroupMatchStart(() => startM++);
        z1SDK.group.events.onGroupMatchResult((errMsg, errCode, ret) => {
            if (errCode === ErrorCodes.MatchRequestCancelled) cancelM++;
        });
        z2SDK.group.events.onGroupMatchResult((errMsg, errCode, ret) => {
            if (errCode === ErrorCodes.MatchRequestCancelled) cancelM++;
        });
        z3SDK.group.events.onGroupMatchResult((errMsg, errCode, ret) => {
            if (errCode === ErrorCodes.MatchRequestCancelled) cancelM++;
        });

        let reqMatchRet = await z1SDK.group.requestMatch({
            matchType: 'test_请求一个暂时不会有结果的,用来测试取消',
            matcherKey: MatcherKeys.Single,
            matcherParams: {
                minPlayers: 4
            } as ISingleMatcherParams,
            maxPlayers: 4,
        });
        assert.ok(reqMatchRet.succ, reqMatchRet.err);
        await delay(500);
        assert.ok(startM === 3, `应该收到3条消息, 实际为${startM}`);

        let cancelRet = await z1SDK.group.cancelMatch();
        assert.ok(cancelRet.succ, cancelRet.err);
        await delay(500);
        assert.ok(cancelM === 3, `应该收到3条消息, 实际为${cancelM}`);

        let msgCount = 0;
        z1SDK.group.events.onGroupMatchEnterRoom(ret => {
            if (ret.succ) msgCount++;
            else logger.error('z1进入匹配房间失败:', ret);
        });
        z2SDK.group.events.onGroupMatchEnterRoom(ret => {
            if (ret.succ) msgCount++;
            else logger.error('z2进入匹配房间失败:', ret);
        });
        z3SDK.group.events.onGroupMatchEnterRoom(ret => {
            if (ret.succ) msgCount++;
            else logger.error('z3进入匹配房间失败:', ret);
        });

        reqMatchRet = await z1SDK.group.requestMatch({
            matchType: 'test_3个玩家组队匹配进房间后再回到组队',
            matcherKey: MatcherKeys.Single,
            matcherParams: {
                minPlayers: 3
            } as ISingleMatcherParams,
            maxPlayers: 3,
        });
        assert.ok(reqMatchRet.succ, reqMatchRet.err);
        await delay(500);
        assert.ok(msgCount === 3, `应该收到3条消息, 实际为${msgCount}`);
        assert.ok(z1SDK.group.currGroupRoom === null, `应该不在组队房间中了!实际还在`);
        assert.ok(z2SDK.group.currGroupRoom === null, `应该不在组队房间中了!实际还在`);
        assert.ok(z3SDK.group.currGroupRoom === null, `应该不在组队房间中了!实际还在`);
        assert.ok(z1SDK.room.currRoomInfo !== null, `应该在匹配房间中了!实际不在`);
        assert.ok(z2SDK.room.currRoomInfo !== null, `应该在匹配房间中了!实际不在`);
        assert.ok(z3SDK.room.currRoomInfo !== null, `应该在匹配房间中了!实际不在`);

        await delay(200);

        let backRet = await z1SDK.group.backGroup();
        assert.ok(backRet.succ, backRet.err);
        backRet = await z2SDK.group.backGroup();
        assert.ok(backRet.succ, backRet.err);
        backRet = await z3SDK.group.backGroup();
        assert.ok(backRet.succ, backRet.err);
        assert.ok(z1SDK.group.currGroupRoom !== null, `应该在组队房间中了!实际不在`);
        assert.ok(z2SDK.group.currGroupRoom !== null, `应该在组队房间中了!实际不在`);
        assert.ok(z3SDK.group.currGroupRoom !== null, `应该在组队房间中了!实际不在`);


        await z1SDK.dispose();
        await z2SDK.dispose();
        await z3SDK.dispose();

    }, 600000);


});