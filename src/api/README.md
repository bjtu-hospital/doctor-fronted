# API 模块

此文件夹用于存放所有 API 接口调用的相关文件。

## 文件结构建议
- `auth.js` - 认证相关的 API 调用
- `schedule.js` - 排班相关的 API 调用
- `doctor.js` - 医生信息相关的 API 调用
- 等等...

## 使用示例
```javascript
import { login } from '@/api/auth'

async function handleLogin(username, password) {
  const result = await login(username, password)
  // ...
}
```
