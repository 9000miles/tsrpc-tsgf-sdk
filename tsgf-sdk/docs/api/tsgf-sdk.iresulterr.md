<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tsgf-sdk](./tsgf-sdk.md) &gt; [IResultErr](./tsgf-sdk.iresulterr.md)

## IResultErr type

结果是失败的

**Signature:**

```typescript
export type IResultErr<T> = {
    succ: false;
    code: number;
    err: string;
    data?: T;
};
```