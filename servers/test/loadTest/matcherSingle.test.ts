
import { assert } from 'chai';
import { delay } from '../../src/shared/tsgf/Utils';
import { authPlayerToken, queryMatch, requestMatchOneSingle } from '../unitTest/api/ApiUtils';

let stopTime = Date.parse('2022-06-20 14:00:00');

test('单人匹配器的负载_匹配不进房间', async function () {
    return;// 不需要常规执行
    const auth1 = await authPlayerToken("zum0001_单人匹配器的负载_匹配不进房间", "zum1");
    const auth2 = await authPlayerToken("zum0002_单人匹配器的负载_匹配不进房间", "zum2");
    const auth3 = await authPlayerToken("zum0003_单人匹配器的负载_匹配不进房间", "zum3");
    let playerToken1 = auth1.playerToken;
    let playerId1 = auth1.playerId;
    let playerToken2 = auth2.playerToken;
    let playerId2 = auth2.playerId;
    let playerToken3 = auth3.playerToken;
    let playerId3 = auth3.playerId;

    while (Date.now() < stopTime) {

        await requestMatchOneSingle(playerToken1, playerId1, 3, 3);
        await requestMatchOneSingle(playerToken2, playerId2, 3, 3);
        await requestMatchOneSingle(playerToken3, playerId3, 3, 3);
        
        await delay(100);
    }

}, stopTime - Date.now() + 50000);
