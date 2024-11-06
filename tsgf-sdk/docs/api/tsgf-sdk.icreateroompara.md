<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tsgf-sdk](./tsgf-sdk.md) &gt; [ICreateRoomPara](./tsgf-sdk.icreateroompara.md)

## ICreateRoomPara interface

创建房间的参数

**Signature:**

```typescript
export interface ICreateRoomPara extends ITeamParams 
```
**Extends:** [ITeamParams](./tsgf-sdk.iteamparams.md)

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

[customProperties?](./tsgf-sdk.icreateroompara.customproperties.md)


</td><td>


</td><td>

string


</td><td>

_(Optional)_ 自定义房间属性字符串


</td></tr>
<tr><td>

[isPrivate](./tsgf-sdk.icreateroompara.isprivate.md)


</td><td>


</td><td>

boolean


</td><td>

是否私有房间，私有房间不参与匹配，同时需要给 privateRoomJoinMode 赋值，默认为使用房间id即可加入


</td></tr>
<tr><td>

[matcherKey?](./tsgf-sdk.icreateroompara.matcherkey.md)


</td><td>


</td><td>

string


</td><td>

_(Optional)_ 如果参与匹配,则使用的匹配器标识


</td></tr>
<tr><td>

[maxPlayers](./tsgf-sdk.icreateroompara.maxplayers.md)


</td><td>


</td><td>

number


</td><td>

进入房间的最大玩家数量


</td></tr>
<tr><td>

[ownerPlayerId](./tsgf-sdk.icreateroompara.ownerplayerid.md)


</td><td>


</td><td>

string


</td><td>

房主玩家ID，创建后，只有房主玩家的客户端才可以调用相关的管理操作, 如果不想任何人操作,可以直接设置为''


</td></tr>
<tr><td>

[privateRoomJoinMode?](./tsgf-sdk.icreateroompara.privateroomjoinmode.md)


</td><td>


</td><td>

[EPrivateRoomJoinMode](./tsgf-sdk.eprivateroomjoinmode.md)


</td><td>

_(Optional)_ 私有房间的加入模式, 私有房间则需要赋值, 默认为使用房间id即可加入


</td></tr>
<tr><td>

[privateRoomPassword?](./tsgf-sdk.icreateroompara.privateroompassword.md)


</td><td>


</td><td>

string


</td><td>

_(Optional)_ 如果私有房间的加入模式是密码, 则必填本密码字段


</td></tr>
<tr><td>

[randomRequirePlayerSyncStateInvMs?](./tsgf-sdk.icreateroompara.randomrequireplayersyncstateinvms.md)


</td><td>


</td><td>

number


</td><td>

_(Optional)_ 随机要求玩家同步状态给服务端的间隔毫秒（不设置和设0表示不开启）,方便大大缩短追帧时间，但要求客户端实现状态数据全量同步，每隔一段时间要求一个玩家上报自己的全量状态数据，之后的追帧将从本状态开始同步+追帧


</td></tr>
<tr><td>

[retainEmptyRoomTime?](./tsgf-sdk.icreateroompara.retainemptyroomtime.md)


</td><td>


</td><td>

number


</td><td>

_(Optional)_ 保留空房间毫秒数,重新进人再退出后重新计时,放空或为0表示不保留空房间,直接销毁


</td></tr>
<tr><td>

[retainOwnSeat?](./tsgf-sdk.icreateroompara.retainownseat.md)


</td><td>


</td><td>

boolean


</td><td>

_(Optional)_ 是否为房主保留固定位置,即使房主离开后"满房"还是可以加入,即房主离开后房间真实最大人数=maxPlayers-1


</td></tr>
<tr><td>

[roomId?](./tsgf-sdk.icreateroompara.roomid.md)


</td><td>


</td><td>

string


</td><td>

_(Optional)_ 指定房间ID,必须全局唯一, 放空则会自动生成guid


</td></tr>
<tr><td>

[roomName](./tsgf-sdk.icreateroompara.roomname.md)


</td><td>


</td><td>

string


</td><td>

房间名字，查询房间和加入房间时会获取到


</td></tr>
<tr><td>

[roomType?](./tsgf-sdk.icreateroompara.roomtype.md)


</td><td>


</td><td>

string


</td><td>

_(Optional)_ 房间类型自定义字符串


</td></tr>
</tbody></table>