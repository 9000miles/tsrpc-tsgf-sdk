<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tsgf-sdk](./tsgf-sdk.md) &gt; [EPlayerInputFrameType](./tsgf-sdk.eplayerinputframetype.md)

## EPlayerInputFrameType enum

玩家输入帧类型

**Signature:**

```typescript
export declare enum EPlayerInputFrameType 
```

## Enumeration Members

<table><thead><tr><th>

Member


</th><th>

Value


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

JoinRoom


</td><td>

`2`


</td><td>

房间帧同步期间, 玩家进入房间, 系统会插入一个进入房间的输入帧(再收到通知后才有), 额外字段:IPlayerInputFrame.playerInfo:IPlayerInfo


</td></tr>
<tr><td>

LeaveRoom


</td><td>

`3`


</td><td>

房间帧同步期间, 玩家离开房间(或断线不再重连后), 系统会插入一个离开房间的输入帧, 额外字段:IPlayerInputFrame.playerInfo:IPlayerInfo


</td></tr>
<tr><td>

Operates


</td><td>

`1`


</td><td>

输入操作


</td></tr>
<tr><td>

PlayerEnterGame


</td><td>

`4`


</td><td>

玩家进入游戏: 房间开始帧同步时,每个在房间的玩家都加入一帧


</td></tr>
</tbody></table>
