<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tsgf-sdk](./tsgf-sdk.md) &gt; [IResultSucc](./tsgf-sdk.iresultsucc.md)

## IResultSucc type

结果是成功的

**Signature:**

```typescript
export type IResultSucc<T> = {
    succ: true;
    code: number;
    err?: string;
    data: T;
};
```
