# 登录模块 - API 接口说明

## 概述
登录模块负责医生的身份验证和登录流程。

## 接口列表

### 1. 医生登录
**接口名称**: 登录  
**请求方式**: `POST`  
**请求地址**: `/api/auth/login`  
**描述**: 医生输入工号和密码进行登录

#### 请求参数
| 参数名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `username` | string | 是 | 工号 |
| `password` | string | 是 | 密码 |

#### 响应示例
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "doctor": {
      "id": "123",
      "name": "张医生",
      "department": "心内科",
      "hospital": "北京交通大学附属医院"
    }
  }
}
```

---

### 2. 验证码获取
**接口名称**: 获取验证码  
**请求方式**: `GET`  
**请求地址**: `/api/auth/captcha`  
**描述**: 获取图形验证码

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "captchaId": "abc123xyz",
    "imageBase64": "data:image/png;base64,iVBORw0KGgo..."
  }
}
```

---

### 3. 登出
**接口名称**: 登出  
**请求方式**: `POST`  
**请求地址**: `/api/auth/logout`  
**描述**: 医生登出，清除登录状态

#### 响应示例
```json
{
  "code": 200,
  "message": "登出成功"
}
```

---

## 错误处理

| 错误代码 | 描述 |
|---------|------|
| 401 | 未授权 - 工号或密码错误 |
| 400 | 请求参数错误 |
| 429 | 请求过于频繁，请稍后再试 |
| 500 | 服务器错误 |

---

## 调用示例

```javascript
// 登录请求
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: '10001',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log(data))
```
