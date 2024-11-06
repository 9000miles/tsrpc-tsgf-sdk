

import './Env';
import { initGame } from "./TestUnit";
import { assert } from 'chai';
import { ERoomMsgRecvType, IRecvRoomMsg } from '../../src/tsgf/room/IRoomMsg';
import { delay } from '../../src/tsgf/Utils';
import { ISingleMatcherParams, MatcherKeys } from '../../src/tsgf/match/Models';
import { logger } from '../../src/tsgf/logger';
import { ErrorCodes } from '../../src/tsgf/Result';


describe("房间", () => {
    test('获取房间在线信息', async function () {

        let initRet1 = await initGame('获取房间在线信息_z1', 'z1');
        assert.ok(initRet1.succ, initRet1.err);
        let z1SDK = initRet1.data!;
        let initRet2 = await initGame('获取房间在线信息_z2', 'z2');
        assert.ok(initRet2.succ, initRet2.err);
        let z2SDK = initRet2.data!;

        let z1CreateRet = await z1SDK.room.createRoom({}, {
            roomName: 'test',
            maxPlayers: 2,
            ownerPlayerId: initRet1.data!.playerId,
            isPrivate: true,
        });
        assert.ok(z1CreateRet.succ, z1CreateRet.err);

        let getRet = await z2SDK.room.getOnlineRoomInfo(z1CreateRet.data!.roomId);
        assert.ok(getRet.succ, getRet.err);

        await z1SDK.dispose();
        await z2SDK.dispose();

    }, 600000);

    test('筛选房间', async function () {

        let initRet1 = await initGame('筛选房间_z1', 'z1');
        assert.ok(initRet1.succ, initRet1.err);
        let z1SDK = initRet1.data!;
        let initRet2 = await initGame('筛选房间_z2', 'z2');
        assert.ok(initRet2.succ, initRet2.err);
        let z2SDK = initRet2.data!;

        let z1CreateRet = await z1SDK.room.createRoom({}, {
            roomName: 'test',
            maxPlayers: 2,
            ownerPlayerId: initRet1.data!.playerId,
            isPrivate: true,
        });
        assert.ok(z1CreateRet.succ, z1CreateRet.err);

        let getRet = await z2SDK.room.filterRooms({
            roomNameFullMatch: 'test',
        });
        assert.ok(getRet.succ, getRet.err);
        assert.ok(getRet.data!.rooms.length === 1, '应该匹配到1个');

        await z1SDK.dispose();
        await z2SDK.dispose();

    }, 600000);

});