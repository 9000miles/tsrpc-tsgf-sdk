<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tsgf-sdk](./tsgf-sdk.md) &gt; [GroupRoom](./tsgf-sdk.grouproom.md) &gt; [joinGroup](./tsgf-sdk.grouproom.joingroup.md)

## GroupRoom.joinGroup() method

加入指定组队房间, 成功则 this.currGroupRoom 有值

**Signature:**

```typescript
joinGroup(playerPara: IPlayerInfoPara, groupRoomId: string): Promise<IResult<IRoomInfo>>;
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

playerPara


</td><td>

[IPlayerInfoPara](./tsgf-sdk.iplayerinfopara.md)


</td><td>

玩家信息参数


</td></tr>
<tr><td>

groupRoomId


</td><td>

string


</td><td>

组队房间ID


</td></tr>
</tbody></table>
**Returns:**

Promise&lt;[IResult](./tsgf-sdk.iresult.md)<!-- -->&lt;[IRoomInfo](./tsgf-sdk.iroominfo.md)<!-- -->&gt;&gt;

