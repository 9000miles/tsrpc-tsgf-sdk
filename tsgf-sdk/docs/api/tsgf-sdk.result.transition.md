<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tsgf-sdk](./tsgf-sdk.md) &gt; [Result](./tsgf-sdk.result.md) &gt; [transition](./tsgf-sdk.result.transition.md)

## Result.transition() method

将一个类型的成功结果转为另外一个

**Signature:**

```typescript
static transition<TSource, TTarget>(source: IResultSucc<TSource>, ifSuccGetData: () => TTarget): IResult<TTarget>;
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

source


</td><td>

[IResultSucc](./tsgf-sdk.iresultsucc.md)<!-- -->&lt;TSource&gt;


</td><td>

成功的对象, 注意必须传入ifSuccGetData参数!


</td></tr>
<tr><td>

ifSuccGetData


</td><td>

() =&gt; TTarget


</td><td>

如果结果是正确的则需要换一个目标类型的data


</td></tr>
</tbody></table>
**Returns:**

[IResult](./tsgf-sdk.iresult.md)<!-- -->&lt;TTarget&gt;

