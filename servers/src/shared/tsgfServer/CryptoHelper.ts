

import CryptoJS from 'crypto-js';

export class CryptoHelper {

    /**
     * 字符串MD5加密
     * @param str 
     * @returns md5 
     */
    public static md5(str: string): string {
        let wordArray = CryptoJS.MD5(str);
        return CryptoJS.enc.Hex.stringify(wordArray);
    }

    /**
     * des加密，ECB模式，PKCS7填充，密钥用UTF8提取前8个字节，输入字符串使用UTF8编码解析，输出加密后的base64编码字符串
     *
     * @public
     * @param input 要加密的字符串（明文）
     * @param strKey 长度超过8个字节即可，只会取前8个字节
     * @returns
     */
    public static desEncryptECB_PKCS7_Base64(input: string, strKey: string): string {
        //转为utf8字节,并只取前8个字节
        let keyBytes = CryptoJS.lib.WordArray.create(CryptoJS.enc.Utf8.parse(strKey).words.slice(0, 8), 8);
        let inputBytes = CryptoJS.enc.Utf8.parse(input);
        let enResult = CryptoJS.DES.encrypt(inputBytes, keyBytes, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        let retStr = enResult.ciphertext.toString(CryptoJS.enc.Base64);

        return retStr;
    }
    /**
     * des解密，ECB模式，PKCS7填充，密钥用UTF8提取前8个字节，输入字符串使用UTF8编码解析，输出加密后的base64编码字符串
     *
     * @public
     * @param inputBase64 密文（base64格式）
     * @param strKey
     * @returns
     */
    public static desDecryptECB_PKCS7_Base64(inputBase64: string, strKey: string): string {
        //转为utf8字节,并只取前8个字节
        let keyBytes = CryptoJS.lib.WordArray.create(CryptoJS.enc.Utf8.parse(strKey).words.slice(0, 8), 8);
        let inputBytes = CryptoJS.enc.Base64.parse(inputBase64);
        let cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: inputBytes,
        });
        let enResult = CryptoJS.DES.decrypt(cipherParams, keyBytes, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });
        let retStr = enResult.toString(CryptoJS.enc.Utf8);

        return retStr;
    }

}