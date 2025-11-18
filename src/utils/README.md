# 工具函数

此文件夹用于存放项目中常用的工具函数。

## 文件结构建议
- `request.js` - HTTP 请求封装
- `storage.js` - 本地存储工具
- `format.js` - 数据格式化函数
- `validate.js` - 数据验证函数
- 等等...

## 使用示例
```javascript
import { request } from '@/utils/request'
import { formatDate } from '@/utils/format'

request.get('/api/data').then(res => {
  console.log(formatDate(res.data.date))
})
```
