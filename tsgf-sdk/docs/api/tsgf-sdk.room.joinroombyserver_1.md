<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tsgf-sdk](./tsgf-sdk.md) &gt; [Room](./tsgf-sdk.room.md) &gt; [joinRoomByServer](./tsgf-sdk.room.joinroombyserver_1.md)

## Room.joinRoomByServer() method

> Warning: This API is now obsolete.
> 
> 本重载已弃用, 将在下个版本移除!! 请使用 joinRoom
> 

加入指定游戏服务器的房间, 成功则可使用 this.currRoomInfo 可获取当前所在的房间信息

**Signature:**

```typescript
joinRoomByServer(gameServerUrl: string, playerPara: IPlayerInfoPara, para: IJoinRoomPara): Promise<IResult<IRoomInfo>>;
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

gameServerUrl


</td><td>

string


</td><td>

游戏服务器地址


</td></tr>
<tr><td>

playerPara


</td><td>

[IPlayerInfoPara](./tsgf-sdk.iplayerinfopara.md)


</td><td>

玩家信息参数


</td></tr>
<tr><td>

para


</td><td>

[IJoinRoomPara](./tsgf-sdk.ijoinroompara.md)


</td><td>

加入房间参数\|房间ID


</td></tr>
</tbody></table>
**Returns:**

Promise&lt;[IResult](./tsgf-sdk.iresult.md)<!-- -->&lt;[IRoomInfo](./tsgf-sdk.iroominfo.md)<!-- -->&gt;&gt;

