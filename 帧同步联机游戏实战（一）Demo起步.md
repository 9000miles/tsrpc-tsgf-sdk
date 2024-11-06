
联机游戏的优势就不多叙述，缺点大多是实现门槛和实现质量问题。而联机游戏，我更喜欢IO类联机游戏，短平快的玩法互动，或一局一局的对战形式，能充分贴合移动设备的使用场景。IO类联机游戏，无疑更适合使用帧同步。

相对简单的联机实现，以及单机改造联机的便利性，是最终我选择帧同步作为联机方案的主要原因。同样，帧同步的缺点也需明确：
1. 适合房间型的联机场景，大型多人在线就不合适了

       如果不打算做大型多人在线类游戏，也就可以忽略这个缺点。
2. 需要有足够的方案应对不同步的情况。包含了预防、发生后的处理、后续的排查等

       接下来，我会用一系列课程，分享帧同步中我的相关设计方案。


本章主要是快速实现一个帧同步demo，让初学者能够简单入门并获得一个成功案例！


# 1. 联机服务端
[开源的游戏联机对战引擎 tsgf（https://gitee.com/fengssy/ts-gameframework）](https://gitee.com/fengssy/ts-gameframework)

部署很简单，推荐使用 CocosCreator 的 tsgf 服务端免费插件：[tsgf-servers-dev（https://store.cocos.com/app/detail/3910）](https://store.cocos.com/app/detail/3910)

也可以自行下载[源码](https://gitee.com/fengssy/ts-gameframework)启动服务，`npm i` + `npm run dev` 即可启动！

# 2. 将“最简Demo”跑起来！
部署完服务端后，打开免费示例项目：[tsgf-sdk-demos-baseMatch（https://store.cocos.com/app/detail/3877）](https://store.cocos.com/app/detail/3877)
预览启动即可！
![Demo预览](https://fengssy.gitee.io/zgame/Games/TSGF/PlayShow.gif?v=1.1.0)

# 3. 解析Demo

![tsgf-demo流程图](https://fengssy.gitee.io/zgame/Games/TSGF/tsgf-demo-flow.png?v=3)

* 流程注解
  * **获取tsgf 玩家授权信息**：为了保证通讯安全，必须使用 tsgf 的玩家授权信息（玩家id 和 token），才能连上 tsgf 服务器。通过调用tsgf服务端接口，传入用户信息（用户id+昵称等）得到的玩家授权信息。而用户信息就由开发者自行决定怎么来，Demo 中简单的使用随机字符串作为 用户id ，让每次登录都是新用户。正式项目应由开发者自己的用户系统来实现这个流程。比如当前是微信小游戏：用户在登录时通过微信授权，获得微信 openid，以及微信用户昵称头像等附加信息，在开发者自己的用户系统中匹配或者注册得到 用户id，使用这个 用户id 在服务端调用 tsgf 的玩家授权接口，换取到玩家授权信息，最后给到客户端用于连接tsgf服务器（在初始化 tsgf-sdk 时传入）。可参考 [tsgf 玩家使用时序图](https://gitee.com/fengssy/ts-gameframework#%E7%8E%A9%E5%AE%B6%E4%BD%BF%E7%94%A8%E6%97%B6%E5%BA%8F%E5%9B%BE)
  * **初始化sdk**：需要大厅服务器地址，玩家授权信息，所有api使用前必须调用
  * **进入房间**：不管是自己创建或加入房间，还是匹配房间，都是先得到房间信息，再调用 tsgf-sdk 的连接房间api，关于tsgf服务端架构的信息可打开 [tsgf-服务器结构图](https://gitee.com/fengssy/ts-gameframework#%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%BB%93%E6%9E%84%E5%9B%BE) 查看
  * **发送输入帧**：对游戏逻辑进行的任何操作，都需要发送输入帧，而不能直接修改逻辑数据。具体哪些定义为输入帧，最简单粗暴的方式是将键盘或鼠标触发的动作作为输入帧
  * **接收并执行同步帧**：来自tsgf服务端下发的同步帧，游戏所有逻辑修改都由此驱动，这个是帧同步最重要的思维方式，所有修改的起始都需要发送输入帧，所有逻辑都由同步帧驱动！
  * **游戏逻辑数据**：一般而言，将游戏数据和逻辑都独立出来是联机游戏最首要需要处理的事情
  * **渲染循环**：渲染层指的是游戏渲染引擎，比如cocos，渲染层和逻辑层分离能大大减少后期遇到的同步问题。以及带来很多好处（渲染层实现方案变更，实现服务端机器人，服务端验证逻辑等等）
  



* 几个关键文件：

  * `assets\scripts\demo1\Demo1SceneManager.ts` 主要逻辑实现
  * `preview-template\index.ejs` 预览时，服务器地址在此配置
  * `build-templates\web-mobile\index.ejs` 发布H5时，服务器地址在此配置
  * `build-templates\wechatgame\game.ejs` 构建微信小游戏时，服务器地址在此配置
  * `assets\scripts\env.ts`    构建不同平台，来对接不同的SDK环境供应商。注意，这里使用了一个收费的插件 [ifdef-creator（3元）](https://store.cocos.com/app/detail/3580) ，能在构建时自动选择对应代码，避免将不同平台的包都引入，增大无谓的包体，如果不需要可以在每次构建时修改要用的npm包的代码

* 主要逻辑的注解（`assets\scripts\demo1\Demo1SceneManager.ts`），建议对照着流程图观看！

``` typescript
    onLoad() {
        initSdkEnv();// 初始化SDK运行环境
        // 初始化demo的客户端
        //   由于我们的玩家有自己的用户体系（比如来自自己微信公众号的授权等），需要将用户映射为tsgf中的玩家，如果不熟悉没关系，可以直接使用 `tsgf-dev-demo-client` 封装好的客户端先用着，这里传入的是自己的Web服务器地址，也可以使用tsgf里自带的Demo服务端
        this.demoClient = new DemoClient(typeof (demoServerUrl) === "undefined" ? "http://127.0.0.1:7901/" : demoServerUrl);
    }
    async start() {
        //...
        //Room.ins.events.on.. // tsgf的各种事件注册 玩家进入房间/离开房间等等，主要用于UI的交互。请注意，游戏逻辑不能从这里触发，游戏逻辑的修改入口只能来自同步帧！
        //...
        // 帧同步执行器, 将Demo1SceneManager配置为帧同步输入帧执行器, 即要求实现几个方法:
        //  execInputOperates_<输入类型> 各个输入帧的逻辑实现
        //  execInputOthers 其他输入帧(内置) 比如玩家进入加入游戏等
        // 注册了逻辑帧事件 executeOneFrame 每一帧执行时都会触发, 用来刷新逻辑世界的数据
        this.frameSyncExecutor = new FrameSyncExecutor(
            new SDKFrameSyncConnectAdp(),
            'inputType', // 指定发送的输入帧对象中,哪个字段表示"输入类型"
            this,
            (dt, frameIndex) => this.executeOneFrame(dt, frameIndex),
            () => this.allPlayers);
        //...
    }
    //...
    // 登录
    async onLoginClick() {
        //...
        // 这里就是将自己的用户映射为tsgf的玩家了（即获得tsgf的玩家id和token）
        let result = await this.demoClient.playerAuth(tmpOpenId, this.playerInfoPara.showName);
        //...
        // 初始化 tsgf-sdk，将游戏大厅服务器地址和tsgf玩家授权信息传入
        var hallSvUrl = typeof (hallServerUrl) === "undefined" ? "http://127.0.0.1:7100/" : hallServerUrl;
        Game.ins.init(hallSvUrl, result.data.playerId, result.data.playerToken);
        //...
    }
    //...
    // 匹配房间
    protected async startPlayersMatchBaseMelee(playerIds: string[], minPlayers: number, maxPlayers: number): Promise<IResult<IMatchResult>> {
        return await new Promise(async (resolve) => {
            let hasResult = false;
            let reqMatchRet = await Room.ins.requestMatchFromPlayers({  // 玩家匹配的基础方法, 可以定义更复杂的匹配逻辑
                matchFromType: EMatchFromType.Player, // 玩家匹配类型
                matchFromInfo: {
                    playerIds: playerIds, // 要匹配的玩家id, 通常只要传[当前玩家id]即可
                },
                maxPlayers: maxPlayers, // 房间最大玩家数，不同的最大玩家数不会相互匹配到
                matcherKey: MatcherKeys.Single, // 单人玩家匹配模式（即无组队）matcherParams 类型为 ISingleMatcherParams
                matcherParams: {
                    minPlayers: minPlayers, // 最少要匹配到几个玩家才创建房间
                    resultsContinueRoomJoinUsMatch: true, // 匹配出房间后（满足最少玩家数），是否可以继续匹配进人
                } as ISingleMatcherParams, // 这里用 `as` 接口的写法，可以让字段获得vscode中的注释提示
            }, (result) => {
                if (!hasResult) {
                    hasResult = true;
                    return resolve(result);// 匹配成功后, 会拿到匹配的房间（房间和服务器相关信息）, 需要调用 Room.ins.joinRoomByServer 加入房间
                }
            });
            if (!reqMatchRet.succ) {
                if (!hasResult) {
                    hasResult = true;
                    return resolve(Result.buildErr(reqMatchRet.err, reqMatchRet.code));
                }
            }
        });
    }

    // 发送输入帧, 注意,所有逻辑修改入口必须来自收到的同步帧, 而本地想要修改, 就必须发送输入帧!
    onJoysickMoveStart(move: IMoveDirection) {
        Room.ins.sendFrame([{
            inputType: InputType.MoveDirStart,
            signRadFromX: move.signRadFromX,
        }]);
    }
    onJoysickMoveEnd() {
        Room.ins.sendFrame([{
            inputType: InputType.MoveDirEnd,
        }]);
    }

    //==== 逻辑帧的实现 ====
    onNewPlayer(playerId: string, playerInfo: IPlayerInfo, dt: number): void {
        // 新玩家, 创建玩家数据(PlayerData), 以及玩家渲染的cocos节点数据
        //...
    }
    onRemovePlayer(playerId: string, dt: number): void {
        // 移除玩家节点以及相关数据
        //...
    }
    //特殊帧, 由tsgf定义和下发
    execInputOthers(playerId: string, inputFrame: IFramePlayerInput, dt: number, FrameIndex: number) {
        switch (inputFrame.inputFrameType) {
            case EPlayerInputFrameType.PlayerEnterGame:
                //开始游戏时,房间中的玩家都触发一次
                this.onNewPlayer(playerId, inputFrame.playerInfo, dt);
                break;
            case EPlayerInputFrameType.JoinRoom:
                //游戏开始后再加入的玩家
                this.onNewPlayer(playerId, inputFrame.playerInfo, dt);
                break;
            case EPlayerInputFrameType.LeaveRoom:
                //游戏开始后再离开的玩家
                this.onRemovePlayer(playerId, dt);
                break;
        }
    }
    // 所有的同步帧, 推荐都只修改数据层, 而不动渲染层,有需要推荐通过事件方式通知, 是最佳做法
    // 逻辑中不能有"我"的概念, 因为可能本帧是其他玩家的输入帧!
    execInputOperates_MoveDirStart(playerId: string, inputFrame: IPlayerInputOperate, dt: number): void {
        // 移动开始, 修改玩家数据的朝向和移动状态(PlayerData), 注意, 这里不修改渲染数据(Cocos节点数据)
        //...
    }
    execInputOperates_MoveDirEnd(playerId: string, inputFrame: IPlayerInputOperate, dt: number): void {
        // 移动结束, 修改玩家数据的朝向和移动状态(PlayerData), 注意, 这里不修改渲染数据(Cocos节点数据)
        //...
    }
    executeOneFrame(dt: number, frameIndex: number): void {
        // 因为本demo比较简单, 只有移动需要每帧计算位置, 所以简单一个循环, 完善的项目应该配套一个状态管理系统,根据每个对象的状态去计算下个状态应该的数据修改
        this.frameIndex = frameIndex;
        for (var playerId in this.allPlayers) {
            var p = this.allPlayers[playerId];
            this.playerUpdate(p, dt);
        }
        // 在玩家的渲染组件(PlayerComponent) 会在渲染循环中(update)去刷新渲染数据(比如模型节点的position), 逻辑帧中不推荐直接修改渲染数据, 但稍微复杂一点的游戏逻辑, 都会有和逻辑有关的渲染动作, 比如角色移动到某个位置发了一个技能, 渲染层分离后, 可以这么做:
        //   逻辑层更新位置, 发送技能动作照样修改逻辑数据, 多触发一个"发动某技能"的事件, 渲染层采用过渡方式更新渲染, 收到这个事件后, 可以简单的判断位置瞬移过来, 也可以将渲染动作设计为一个渲染队列, 移动 / 旋转 / 发技能, 都加入队列, 一样采用过渡方式渲染, 过渡时间为20ms, 这样既可以最短的方式准确响应预期动作, 也可以得到最顺畅的渲染效果
    }
```

*对tsgf设计有兴趣的可以浏览“[tsgf 3-设计说明](https://gitee.com/fengssy/ts-gameframework#3-%E8%AE%BE%E8%AE%A1%E8%AF%B4%E6%98%8E)”*

# 4. 加点互动

一般学会一个新的东西后，我会尝试加点什么来明确我真的懂了，目前的最简 Demo 只是实现了多人在地上跑动，正常一个完整的游戏至少要有一点互动，所以我想加上一点“攻击”的元素。设想中，一个角色发出攻击，只要有角色在攻击范围内就视为被击中，触发效果我设定为往攻击方向推动一段距离。

OK，想法有了，开始整理实现思路。

**习惯性的先做状态数据设计，再到逻辑实现，最后再考虑渲染。**

### 1. 首先，状态数据的设计

攻击和被攻击，需要有状态来记录，并且需要记录攻击和被攻击相关信息，方便每一个逻辑帧进行计算：

```typescript
/**为了方便之后状态序列化, 统一采用接口对象而不是class实例*/
/**玩家状态数据*/
export interface PlayerData {
    playerId: string;
    showName: string;

    /**位置, 所有距离单位皆为地图单位, 换算成引擎单位需要除以30, 从主相机视角看,这个坐标系为 x:→ y:↓*/
    pos: IVec2Like;
    /**当前是否在移动中*/
    inMoving: boolean;
    /**归一化的朝向向量*/
    dir: IVec2Like;
    /**朝向在水平面的弧度 (从X轴转到目标方向所需的旋转弧度)*/
    dirRadFromX: number;
    /**每秒移动的距离*/
    speed: number;

    /**当前是否在攻击中*/
    inAttacking: boolean;
    /**攻击是否已经生效过*/
    attacked: boolean;
    /**攻击动作已经经过的时间(单位秒)*/
    attackUseTime: number;

    /**攻击动作前摇时长(单位秒), 即攻击动作执行过这个时间才产生攻击计算*/
    attackPrevTime: number;
    /**攻击动作持续多久(单位秒), 即攻击整体僵持住时间*/
    attackAllTime: number;

    /**当前是否被击中*/
    beAttacked: boolean;
    /**被击中动作已经经过的时间(单位秒)*/
    beAttackedUseTime: number;
    /**被击中后推飞的方向(已归一化)*/
    beAttackedDriveDir: IVec2Like;
    /**被击中后已经推飞的距离*/
    beAttackedDrivePassDistance: number;

    /**被击中后要推飞的距离*/
    beAttackedDriveAllDistance: number;
    /**被击中后推飞的速度(每秒移动距离)*/
    beAttackedDriveSpeed: number;
}
```

### 2. 接着到逻辑层

#### 可以先从输入开始实现，界面上加一个按钮，然后按钮事件去发送新的输入帧：攻击

```typescript
    onAttackClick() {
        Room.ins.sendFrame([{
			inputType: InputType.Attack,
		}]);
    }
```

#### 实现这个同步帧的逻辑：在收到这个帧后进行状态修改

```typescript
    execInputOperates_Attack(playerId: string, inputFrame: IPlayerInputOperate, dt: number): void {
        const player = this.allPlayers[playerId];
        if (!player) return;
        // 玩家被攻击中或被击中, 都无法继续发起攻击
        if (player.inAttacking || player.beAttacked) return;
        // 状态改为攻击中
        player.inAttacking = true;
        player.attacked = false;
        player.inMoving = false;
        player.attackUseTime = 0;
    }
```

#### 再到逻辑帧的循环里，加上玩家攻击或被攻击状态的状态计算

```typescript
    // 每个逻辑帧的计算
    executeOneFrame(dt: number, frameIndex: number): void {
        this.frameIndex = frameIndex;
        for (var playerId in this.allPlayers) {
            var p = this.allPlayers[playerId];
            this.playerUpdate(p, dt);
        }
    }
    playerUpdate(player: PlayerData, dt: number) {
        if (player.inMoving) {
            //有移动
            let distance = player.speed * dt;//本帧移动的距离
            //根据方向,算出本帧移动向量
            Vec2.multiplyScalar(this.tmpV2, player.dir, distance);
            //加到老坐标
            Vec2.add(player.pos, player.pos, this.tmpV2);
        } else if (player.beAttacked) {
            // 被击中
            player.beAttackedUseTime += dt;
            let distance = player.beAttackedDriveSpeed * dt;//本帧移动的距离
            //根据方向,算出本帧移动向量
            Vec2.multiplyScalar(this.tmpV2, player.beAttackedDriveDir, distance);
            //加到老坐标
            Vec2.add(player.pos, player.pos, this.tmpV2);
            player.beAttackedDrivePassDistance += distance;
            if (player.beAttackedDrivePassDistance > player.beAttackedDriveAllDistance) {
                // 推动的距离满足了, 则停下
                player.beAttacked = false;
            }
        } else if (player.inAttacking) {
            // 攻击中
            player.attackUseTime += dt;
            if (player.attackUseTime >= player.attackPrevTime && !player.attacked) {
				// 实现攻击前摇时间到了, 才进行攻击检测
                player.attacked = true;
                this.playerAttack(player);
            }
            if (player.attackUseTime >= player.attackAllTime) {
				// 攻击动作完成
                player.inAttacking = false;
            }
        }
    }
    playerAttack(player: PlayerData) {
        // 攻击的范围是当前位置往当前朝向一段长度的矩形区域
        let attackWidth = 120, attackWidthF2 = attackWidth / 2;
        let attackDistance = 250;
        // 先计算出朝向攻击距离终点
        let target = { x: attackDistance, y: 0 }
        this.rotate(target, player.dirRadFromX);
        Vec2.add(target, player.pos, target);
        //假设从下往上攻击来定义攻击范围矩形的四个点
        // 攻击范围判定第1个点,为位置左边90度
        let posLeft: IVec2Like = { x: attackWidthF2, y: 0 };
        this.rotate(posLeft, player.dirRadFromX + 90 * macro.RAD);
        Vec2.add(posLeft, player.pos, posLeft);
        // 攻击范围判定第2个点,为位置右边90度
        let posRight: IVec2Like = { x: attackWidthF2, y: 0 };
        this.rotate(posRight, player.dirRadFromX - 90 * macro.RAD);
        Vec2.add(posRight, player.pos, posRight);
        // 攻击范围判定第3个点,为目标右边90度
        let targetRight: IVec2Like = { x: attackWidthF2, y: 0 };
        this.rotate(targetRight, player.dirRadFromX - 90 * macro.RAD);
        Vec2.add(targetRight, target, targetRight);
        // 攻击范围判定第4个点,为目标左边90度
        let targetLeft: IVec2Like = { x: attackWidthF2, y: 0 };
        this.rotate(targetLeft, player.dirRadFromX + 90 * macro.RAD);
        Vec2.add(targetLeft, target, targetLeft);
        let checkPointList = [posLeft, posRight, targetRight, targetLeft];
        // 最后循环所有玩家角色是否在攻击范围内
        for (var playerId in this.allPlayers) {
            var p = this.allPlayers[playerId];
            if (p.playerId === player.playerId) continue;
            if (this.testInArea(p.pos, checkPointList)) {
                // 击中, 不管什么状态都取消, 变为击中状态
                p.inAttacking = false;
                p.inMoving = false;
                p.beAttacked = true;
                p.beAttackedUseTime = 0;
                p.beAttackedDrivePassDistance = 0;
                // 被推开的方向就是攻击方向
                Vec2.set(p.beAttackedDriveDir, player.dir.x, player.dir.y);
            }
        }
    }
    /**检测一个点是否在几个点组成的多边形中 (射线法，即计算射线与多边形各边的交点，如果是偶数，则点在多边形外，否则在多边形内)*/
    testInArea(test: IVec2Like, _pointList: IVec2Like[]): boolean {
        let result = false;
        for (let i = 0, j = _pointList.length - 1; i < _pointList.length; j = i++) {
            if ((_pointList[i].y > test.y) != (_pointList[j].y > test.y) &&
                (test.x < (_pointList[j].x - _pointList[i].x) * (test.y - _pointList[i].y) / (_pointList[j].y - _pointList[i].y) + _pointList[i].x)) {
                result = !result;
            }
        }
        return result;
    }
```

### 最终效果完成！

![最终效果](https://fengssy.gitee.io/zgame/Games/TSGF/tsgf-sdk-demos-attack.gif)

源码位置：[https://gitee.com/fengssy/tsgf-demos](https://gitee.com/fengssy/tsgf-demos) `/attack` 目录

#### 帧同步写联机是不是 so easy ?!

#### 想必各位已经蠢蠢欲动了吧！想继续加血条？胜利逻辑？请大胆去尝试！



# 5. 实战项目

前段时间完成了《奔跑吧小仙女》单机游戏到联机游戏的改造，命名为《奔跑吧小仙女联机版》，现已在 Rokid AR Store 上线！（有 Rokid 眼镜的同学可以去官方App的应用商店下载体验）

后续课程将开始讲解将这个改造过程，以及项目中需要的各种系统设计。

[奔跑吧小仙女联机Rokid版](https://store.cocos.com/app/detail/4505) 源码已经开放购买，购买即可获得源码授权！

项目中包含了大量帧同步需要的解决方案，想学习帧同步的同学不可错过！

# QQ交流群
![qq群](https://fengssy.gitee.io/zgame/Games/TSGF/TSGF_QQGroupQRCode.png?v=1.1.1)
对帧同步和 tsgf 有兴趣的同学可以入群讨论