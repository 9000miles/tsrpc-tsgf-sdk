<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tsgf-sdk](./tsgf-sdk.md) &gt; [GameClient](./tsgf-sdk.gameclient.md) &gt; [createRoomRobot](./tsgf-sdk.gameclient.createroomrobot.md)

## GameClient.createRoomRobot() method

玩家创建房间机器人(退出房间会同步退出)

**Signature:**

```typescript
createRoomRobot(createPa: IPlayerInfoPara, teamId?: string): Promise<IResult<IPlayerInfo>>;
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

createPa


</td><td>

[IPlayerInfoPara](./tsgf-sdk.iplayerinfopara.md)


</td><td>


</td></tr>
<tr><td>

teamId


</td><td>

string


</td><td>

_(Optional)_


</td></tr>
</tbody></table>
**Returns:**

Promise&lt;[IResult](./tsgf-sdk.iresult.md)<!-- -->&lt;[IPlayerInfo](./tsgf-sdk.iplayerinfo.md)<!-- -->&gt;&gt;

创建的机器人信息

