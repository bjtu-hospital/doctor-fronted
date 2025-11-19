# 通用组件

此文件夹用于存放可复用的通用组件。

## 文件结构建议
- `Button/` - 按钮组件
- `Modal/` - 对话框组件
- `Loading/` - 加载组件
- `Header/` - 顶部栏组件
- 等等...

## 使用示例
```vue
<template>
  <BaseButton @click="handleClick">点击</BaseButton>
</template>

<script>
import BaseButton from '@/components/Button/BaseButton.vue'
export default {
  components: { BaseButton }
}
</script>
```
