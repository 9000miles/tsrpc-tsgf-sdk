<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tsgf-sdk](./tsgf-sdk.md) &gt; [IAfterFrames](./tsgf-sdk.iafterframes.md)

## IAfterFrames interface

追帧数据

**Signature:**

```typescript
export interface IAfterFrames 
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

[afterEndFrameIndex](./tsgf-sdk.iafterframes.afterendframeindex.md)


</td><td>


</td><td>

number


</td><td>

追帧数组的截止帧索引(包含)


</td></tr>
<tr><td>

[afterFrames](./tsgf-sdk.iafterframes.afterframes.md)


</td><td>


</td><td>

[IGameSyncFrame](./tsgf-sdk.igamesyncframe.md)<!-- -->\[\]


</td><td>

要追帧数组, 允许仅包含输入帧, 但要求顺序, 并且范围为\[afterStartFrameIndex \~ afterEndFrameIndex\]


</td></tr>
<tr><td>

[afterStartFrameIndex](./tsgf-sdk.iafterframes.afterstartframeindex.md)


</td><td>


</td><td>

number


</td><td>

追帧数组起始帧索引(包含)


</td></tr>
<tr><td>

[serverSyncFrameRate](./tsgf-sdk.iafterframes.serversyncframerate.md)


</td><td>


</td><td>

number


</td><td>

服务端同步帧率(每秒多少帧)


</td></tr>
<tr><td>

[stateData](./tsgf-sdk.iafterframes.statedata.md)


</td><td>


</td><td>

any


</td><td>

状态同步的数据(如果没启用状态同步则可忽略)


</td></tr>
<tr><td>

[stateFrameIndex](./tsgf-sdk.iafterframes.stateframeindex.md)


</td><td>


</td><td>

number


</td><td>

状态同步所在帧索引, 即追帧的索引(afterFrames)从下一帧开始, 如果没启用状态同步则可忽略,同时值为-1


</td></tr>
</tbody></table>
