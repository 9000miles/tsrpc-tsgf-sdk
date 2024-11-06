<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tsgf-sdk](./tsgf-sdk.md) &gt; [IFreeTeamsMatcherParams](./tsgf-sdk.ifreeteamsmatcherparams.md)

## IFreeTeamsMatcherParams interface

自由队伍匹配器 的匹配属性

**Signature:**

```typescript
export interface IFreeTeamsMatcherParams 
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

[allPlayersSameTeam?](./tsgf-sdk.ifreeteamsmatcherparams.allplayerssameteam.md)


</td><td>


</td><td>

boolean


</td><td>

_(Optional)_ \[队伍参数\] 所有玩家都在同一个队伍


</td></tr>
<tr><td>

[allPlayersSameTeamId?](./tsgf-sdk.ifreeteamsmatcherparams.allplayerssameteamid.md)


</td><td>


</td><td>

string


</td><td>

_(Optional)_ \[队伍参数\] 所有玩家都在指定的队伍id中


</td></tr>
<tr><td>

[minPlayers?](./tsgf-sdk.ifreeteamsmatcherparams.minplayers.md)


</td><td>


</td><td>

number


</td><td>

_(Optional)_ 至少几个玩家匹配,才算匹配成功(创建房间), 不设置视为匹配满 如不配置则需注意: 最大人数如果不能被队伍人数整除, 会导致人数永远无法匹配满!


</td></tr>
<tr><td>

[minTeams?](./tsgf-sdk.ifreeteamsmatcherparams.minteams.md)


</td><td>


</td><td>

number


</td><td>

_(Optional)_ 至少几个队伍,才算匹配成功(创建房间), 不设置视为匹配满 如不配置则需注意: 最大人数如果不能被队伍人数整除, 会导致人数永远无法匹配满!


</td></tr>
<tr><td>

[resultsContinueRoomJoinUsMatch?](./tsgf-sdk.ifreeteamsmatcherparams.resultscontinueroomjoinusmatch.md)


</td><td>


</td><td>

boolean


</td><td>

_(Optional)_ 满足最小玩家数但未满足最大玩家数时, 是否继续开启房间招人匹配,直到满员


</td></tr>
</tbody></table>