# 状态管理

此文件夹用于存放状态管理相关的文件（Pinia 或 Vuex）。

## 文件结构建议
- `modules/` - 状态模块
  - `auth.js` - 认证状态
  - `user.js` - 用户状态
  - 等等...

## 使用示例
```javascript
import { useAuthStore } from '@/stores/modules/auth'
const authStore = useAuthStore()
```
