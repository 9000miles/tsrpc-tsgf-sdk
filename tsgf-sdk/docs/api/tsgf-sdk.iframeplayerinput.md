<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tsgf-sdk](./tsgf-sdk.md) &gt; [IFramePlayerInput](./tsgf-sdk.iframeplayerinput.md)

## IFramePlayerInput interface

玩家输入(包含多个操作)

**Signature:**

```typescript
export interface IFramePlayerInput 
```

## Properties

<table><thead><tr><th>

Property


</th><th>

Modifiers


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

[inputFrameType](./tsgf-sdk.iframeplayerinput.inputframetype.md)


</td><td>


</td><td>

[EPlayerInputFrameType](./tsgf-sdk.eplayerinputframetype.md)


</td><td>

输入帧类型


</td></tr>
<tr><td>

[operates?](./tsgf-sdk.iframeplayerinput.operates.md)


</td><td>


</td><td>

[IPlayerInputOperate](./tsgf-sdk.iplayerinputoperate.md)<!-- -->\[\]


</td><td>

_(Optional)_ 玩家在本帧的操作列表. inputFrameType == EPlayerInputFrameType.Operates 有数据


</td></tr>
<tr><td>

[playerId](./tsgf-sdk.iframeplayerinput.playerid.md)


</td><td>


</td><td>

string


</td><td>

来源的玩家ID


</td></tr>
</tbody></table>