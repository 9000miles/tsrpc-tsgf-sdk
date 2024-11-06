<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tsgf-sdk](./tsgf-sdk.md) &gt; [Room](./tsgf-sdk.room.md) &gt; [changeRoom](./tsgf-sdk.room.changeroom.md)

## Room.changeRoom() method

修改房间信息(注意,只能房主操作),同时同步更新本地当前房间信息

**Signature:**

```typescript
changeRoom(changePara: IChangeRoomPara): Promise<IResult<IRoomInfo>>;
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

changePara


</td><td>

[IChangeRoomPara](./tsgf-sdk.ichangeroompara.md)


</td><td>


</td></tr>
</tbody></table>
**Returns:**

Promise&lt;[IResult](./tsgf-sdk.iresult.md)<!-- -->&lt;[IRoomInfo](./tsgf-sdk.iroominfo.md)<!-- -->&gt;&gt;
