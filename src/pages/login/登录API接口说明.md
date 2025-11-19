# 登录模块 API 接口

## 1. 登录
**接口**: `POST /auth/login`

**请求参数**:
```json
{
  "username": "string",  // 工号
  "password": "string"   // 密码
}
```

**返回数据**:
```json
{
  "code": 0,
  "message": {
    "token": "string",
    "doctor": {
      "id": "number|string",
      "name": "string",
      "department": "string",
      "hospital": "string"
    }
  }
}
```

---

## 2. 登出
**接口**: `POST /auth/logout`

**请求参数**: 无

**返回数据**:
```json
{
  "code": 0,
  "message": "登出成功"
}
```

---

## 3. 刷新Token
**接口**: `POST /auth/refresh-token`

**请求参数**: 无

**返回数据**:
```json
{
  "code": 0,
  "message": {
    "token": "string"
  }
}
```

---

## 4. 获取用户信息
**接口**: `POST /auth/user-info`

**请求参数**: 无（需要token认证）

**返回数据**:
```json
{
  "code": 0,
  "message": {
    "doctor": {
      "id": "number|string",
      "name": "string",
      "department": "string",
      "hospital": "string",
      "title": "string",
      "photo_path": "string"
    }
  }
}
```
