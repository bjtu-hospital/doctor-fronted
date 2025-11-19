# 样式文件

此文件夹用于存放全局样式和 SCSS 变量。

## 文件结构建议
- `variables.scss` - 全局变量（颜色、间距等）
- `mixins.scss` - 混入函数
- `global.scss` - 全局样式
- 等等...

## 使用示例
```scss
@import '@/styles/variables.scss'

.btn {
  color: $primary-color;
}
```
