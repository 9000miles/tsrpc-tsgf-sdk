<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tsgf-sdk](./tsgf-sdk.md) &gt; [HallClient](./tsgf-sdk.hallclient.md) &gt; [recoverPlayerRoom](./tsgf-sdk.hallclient.recoverplayerroom.md)

## HallClient.recoverPlayerRoom() method

认证并返回尝试恢复玩家房间信息，如果玩家还被保留在房间中,则返回之前所在房间id,需要再调用GameClient的重连方法

**Signature:**

```typescript
recoverPlayerRoom(playerId: string, playerToken: string, updateShowName?: string): Promise<IResult<IRoomOnlineInfo | null>>;
```

## Parameters

<table><thead><tr><th>

Parameter


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

playerId


</td><td>

string


</td><td>


</td></tr>
<tr><td>

playerToken


</td><td>

string


</td><td>


</td></tr>
<tr><td>

updateShowName


</td><td>

string


</td><td>

_(Optional)_ 可更新玩家显示名


</td></tr>
</tbody></table>
**Returns:**

Promise&lt;[IResult](./tsgf-sdk.iresult.md)<!-- -->&lt;[IRoomOnlineInfo](./tsgf-sdk.iroomonlineinfo.md) \| null&gt;&gt;

player room

