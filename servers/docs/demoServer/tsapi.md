
# TSRPC API 接口文档

## 通用说明

- 所有请求方法均为 `POST`
- 所有请求均需加入以下 Header :
    - `Content-Type: application/json`

## 目录

- [模拟应用简单实现用户体系对接玩家体系](#/PlayerAuth)

---

## 模拟应用简单实现用户体系对接玩家体系 <a id="/PlayerAuth"></a>

**路径**
- POST `/PlayerAuth`

**请求**
```ts
interface ReqPlayerAuth {
    showName: string,
    openId: string
}
```

**响应**
```ts
interface ResPlayerAuth {
    playerId: string,
    playerToken: string
}
```

