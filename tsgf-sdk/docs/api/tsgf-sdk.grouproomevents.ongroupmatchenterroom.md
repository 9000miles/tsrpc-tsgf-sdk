<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tsgf-sdk](./tsgf-sdk.md) &gt; [GroupRoomEvents](./tsgf-sdk.grouproomevents.md) &gt; [onGroupMatchEnterRoom](./tsgf-sdk.grouproomevents.ongroupmatchenterroom.md)

## GroupRoomEvents.onGroupMatchEnterRoom() method

当组队匹配成功并进入房间后触发

如果进入匹配房间失败了就会再尝试回到组队, 可以使用 this.currGroupRoom 来判断是否成功回到组队房间

**Signature:**

```typescript
onGroupMatchEnterRoom(fn: (result: IResult<IRoomInfo>) => void): void;
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

fn


</td><td>

(result: [IResult](./tsgf-sdk.iresult.md)<!-- -->&lt;[IRoomInfo](./tsgf-sdk.iroominfo.md)<!-- -->&gt;) =&gt; void


</td><td>

result.data === Room.ins.currRoomInfo


</td></tr>
</tbody></table>
**Returns:**

void
