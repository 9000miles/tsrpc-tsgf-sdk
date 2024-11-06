
import { assert } from 'chai';
import { CryptoHelper } from "../../../src/shared/tsgfServer/CryptoHelper";

describe('CryptoHelper', function () {

    test('des加解密', async function () {
        let keyStr = "我是密钥，长度超过8个字节即可，只会取前8个字节";
        let inputText = "我是要加密的原文我是要加密的原文我是要加密的原文我是要加密的原文我是要加密的原文我是要加密的原文我是要加密的原文";
        let enText = CryptoHelper.desEncryptECB_PKCS7_Base64(inputText, keyStr);
        console.log(enText);
        let deText = CryptoHelper.desDecryptECB_PKCS7_Base64(enText, keyStr);
        console.log(deText);
        assert.ok(deText === inputText, `有问题:不一致：${inputText}\r\n${deText}`);
    });

})