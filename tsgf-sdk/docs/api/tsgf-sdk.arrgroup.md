<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tsgf-sdk](./tsgf-sdk.md) &gt; [arrGroup](./tsgf-sdk.arrgroup.md)

## arrGroup() function

分组

**Signature:**

```typescript
export declare function arrGroup<Item, GroupBy>(arr: Item[], grouper: (v: Item) => GroupBy): Map<GroupBy, Item[]>;
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

arr


</td><td>

Item\[\]


</td><td>


</td></tr>
<tr><td>

grouper


</td><td>

(v: Item) =&gt; GroupBy


</td><td>


</td></tr>
</tbody></table>
**Returns:**

Map&lt;GroupBy, Item\[\]&gt;

