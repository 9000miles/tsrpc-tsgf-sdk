/*!
 * TSGF SDK For Browser v1.4.0
 * -----------------------------------------
 * Copyright (c) zum.
 * MIT License
 * https://gitee.com/fengssy/ts-gameframework
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tsrpcBrowser = require('tsrpc-browser');

/**
 * 获取当前实现的SDK供应商实现
 */
function buildSDKProvider() {
    return {
        env: {
            getHttpClient: (proto, options) => {
                return new tsrpcBrowser.HttpClient(proto, options);
            },
            getWsClient: (proto, options) => {
                return new tsrpcBrowser.WsClient(proto, options);
            },
        }
    };
}

exports.buildSDKProvider = buildSDKProvider;
