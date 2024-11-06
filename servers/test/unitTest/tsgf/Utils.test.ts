import { assert } from "chai";
import { delay, arrGroup, arrSkipAndLimit } from "../../../src/shared/tsgf/Utils";


describe("基础方法", () => {
    test('delay', async () => {
        console.log(new Date().toLocaleString());
        await delay(5000);
        console.log(new Date().toLocaleString());
    }, 60000);


    test('groupByArr', async () => {
        let r = arrGroup([
            { key: '1', name: 'a' },
            { key: '1', name: 'b' },
            { key: '2', name: 'c' },
        ], i => i.key);
        assert.ok(r.size === 2, '应为2实为' + r.size);
        assert.ok(r.get('1')?.length === 2, '应为2实为' + r.get('1')?.length);
        assert.ok(r.get('2')?.length === 1, '应为1实为' + r.get('2')?.length);
    }, 60000);
    
    test('arrSkipAndLimit', async () => {
        let r = arrSkipAndLimit([1,2,3], undefined,undefined);
        assert.ok(r.length === 3, '应为3实为' + r.length);
        assert.ok(r.join(',') === '1,2,3', '应为1,2,3实为' + r.join(','));
        r = arrSkipAndLimit([1,2,3], 0,undefined);
        assert.ok(r.length === 3, '应为3实为' + r.length);
        assert.ok(r.join(',') === '1,2,3', '应为1,2,3实为' + r.join(','));
        r = arrSkipAndLimit([1,2,3], 1,undefined);
        assert.ok(r.length === 2, '应为2实为' + r.length);
        assert.ok(r.join(',') === '2,3', '应为2,3实为' + r.join(','));
        r = arrSkipAndLimit([1,2,3], undefined,1);
        assert.ok(r.length === 1, '应为1实为' + r.length);
        assert.ok(r.join(',') === '1', '应为1实为' + r.join(','));
        r = arrSkipAndLimit([1,2,3], 1,1);
        assert.ok(r.length === 1, '应为1实为' + r.length);
        assert.ok(r.join(',') === '2', '应为2实为' + r.join(','));
        r = arrSkipAndLimit([1,2,3], 1,3);
        assert.ok(r.length === 2, '应为2实为' + r.length);
        assert.ok(r.join(',') === '2,3', '应为2,3实为' + r.join(','));
        r = arrSkipAndLimit([1,2,3], 3,1);
        assert.ok(r.length === 0, '应为0实为' + r.length);
        assert.ok(r.join(',') === '', '应为""实为' + r.join(','));
    }, 60000);

});