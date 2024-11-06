<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tsgf-sdk](./tsgf-sdk.md) &gt; [RoomEvents](./tsgf-sdk.roomevents.md) &gt; [onDisconnected](./tsgf-sdk.roomevents.ondisconnected.md)

## RoomEvents.onDisconnected() method

彻底断开触发, 如下情况: 1. 断开连接时没启用断线重连则触发 2. 主动断开时触发, reason='ManualDisconnect' 3. 断线重连失败并不再重连时触发, reason='ReconnectFailed' 4. 认证失败时会断开连接, 同时触发, reason='AuthorizeFailed'

**Signature:**

```typescript
onDisconnected(fn: (reason?: string) => void): void;
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

(reason?: string) =&gt; void


</td><td>

reason:断开原因


</td></tr>
</tbody></table>
**Returns:**

void
