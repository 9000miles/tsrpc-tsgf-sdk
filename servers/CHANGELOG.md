# [1.4.0](https://gitee.com/fengssy/ts-gameframework/compare/v1.0.0...v1.4.0) (2023-04-01)


### Bug Fixes

* 修复取消匹配请求的消息流转错误导致大厅接口收不到回调 ([ad5d473](https://gitee.com/fengssy/ts-gameframework/commits/ad5d47377b315cac16ffc93eac50d3ec9462498f))
* 修复修改玩家机器人自定义信息会改到所属玩家 ([e784801](https://gitee.com/fengssy/ts-gameframework/commits/e7848018c35b80438e5e8b545b9b35e06c94c922))
* 组队房间的取消匹配失效修复 ([0adca6a](https://gitee.com/fengssy/ts-gameframework/commits/0adca6a081f14b2be7ce34284ebdfc3abf30aacf))
* tsgf-sdk@1.3.2 修复修改机器人信息同步到自身问题 ([26cbb69](https://gitee.com/fengssy/ts-gameframework/commits/26cbb699e481866946a7ebf30486ec48023729dd))


### Performance Improvements

* 重构了房间注册信息和服务器房间信息实现，以支持更多房间类功能 ([b45506f](https://gitee.com/fengssy/ts-gameframework/commits/b45506f307af4a282250a2e7388e203fad54ce67))


### Features

* 支持断线不等待 ([3e4550a](https://gitee.com/fengssy/ts-gameframework/commits/3e4550a0b0e025e4c0d03efcc902e5b3741e4cc2))
* 房间无人时的解散规则支持 ([d66c104](https://gitee.com/fengssy/ts-gameframework/commits/d66c1042fc88ff3999f7748ebe1869007cd6ed95))
* 房间中断线等待重连时间开放客户端设置 ([7335300](https://gitee.com/fengssy/ts-gameframework/commits/733530001d7e01a4e8de3033d6a532c44420c1f2))
* 实现加入或创建指定条件的房间,并能走服务器房间限额 ([21ce711](https://gitee.com/fengssy/ts-gameframework/commits/21ce7115eb771e76d569c1211443ecf0e8839e24))
* 实现筛选房间接口 ([620bb01](https://gitee.com/fengssy/ts-gameframework/commits/620bb013539c005066adf31503ee9ef53a03ad72))
* 为房主保留位置的支持 ([461e91f](https://gitee.com/fengssy/ts-gameframework/commits/461e91fc49fbc5e06f0c89a24e025e5504a8a1dd))
* 已分配但游戏服务器未提取也占配额(防止并发分配造成的峰点问题) ([e57c956](https://gitee.com/fengssy/ts-gameframework/commits/e57c956200ea02d682f46acef7b9722d8dd6ebc1))
* 增加游戏服务器分配规则(按最大玩家数) ([3d9d659](https://gitee.com/fengssy/ts-gameframework/commits/3d9d659545d1c97cb674de8b487a4fbd10886a9b))
* 支持创建房间开启玩家同步全量状态数据功能（随机策略） ([fe22963](https://gitee.com/fengssy/ts-gameframework/commits/fe2296350f71e9301027e616a8953fe7173206f9))
* 支持服务端解散房间,支持大厅的房主解散房间接口,组队房间的旧房间清理 ([a4a8955](https://gitee.com/fengssy/ts-gameframework/commits/a4a89558d7621b2a7fb731f33a8e8d5666191c07))
* 重构房间存储方案, 支持房间功能的更快响应 ([223cde8](https://gitee.com/fengssy/ts-gameframework/commits/223cde863e9ba599728b420e6421e95d83b614fd))
* SDK支持最新所有功能 ([6dd67b2](https://gitee.com/fengssy/ts-gameframework/commits/6dd67b2a91af2718cf48169bacf0d218a7a19685))

