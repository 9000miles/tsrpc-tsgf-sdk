<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tsgf-sdk](./tsgf-sdk.md) &gt; [IChangeRoomPara](./tsgf-sdk.ichangeroompara.md)

## IChangeRoomPara interface

修改房间信息的参数

**Signature:**

```typescript
export interface IChangeRoomPara 
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

[customProperties?](./tsgf-sdk.ichangeroompara.customproperties.md)


</td><td>


</td><td>

string


</td><td>

_(Optional)_ \[不修改请不要赋值\] 自定义房间属性字符串


</td></tr>
<tr><td>

[isPrivate?](./tsgf-sdk.ichangeroompara.isprivate.md)


</td><td>


</td><td>

boolean


</td><td>

_(Optional)_ \[不修改请不要赋值\] 是否私有房间，私有房间不参与匹配，同时需要给 privateRoomJoinMode 赋值，否则默认为使用房间id即可加入


</td></tr>
<tr><td>

[privateRoomJoinMode?](./tsgf-sdk.ichangeroompara.privateroomjoinmode.md)


</td><td>


</td><td>

[EPrivateRoomJoinMode](./tsgf-sdk.eprivateroomjoinmode.md)


</td><td>

_(Optional)_ \[不修改请不要赋值\] 私有房间的加入模式, 私有房间则需要赋值, 默认为使用房间id即可加入


</td></tr>
<tr><td>

[privateRoomPassword?](./tsgf-sdk.ichangeroompara.privateroompassword.md)


</td><td>


</td><td>

string


</td><td>

_(Optional)_ \[不修改请不要赋值\] 如果私有房间的加入模式是密码, 则必填本密码字段


</td></tr>
<tr><td>

[roomName?](./tsgf-sdk.ichangeroompara.roomname.md)


</td><td>


</td><td>

string


</td><td>

_(Optional)_ \[不修改请不要赋值\] 房间名称


</td></tr>
</tbody></table>
