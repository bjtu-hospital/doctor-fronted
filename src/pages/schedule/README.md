# 排班页面开发文档

## 项目概述

排班页面用于展示医生的工作排班信息，支持按周查看、日期筛选和班次详情查看。

## 文件结构

```
pages/schedule/
├── schedule.vue                 # 主页面
├── schedule-mock.js             # Mock 数据
├── components/
│   ├── WeekHeader.vue          # 周选择器组件
│   ├── ShiftItem.vue           # 班次卡片组件
│   └── ShiftDetail.vue         # 班次详情弹窗组件
├── 排班API接口说明.md           # API 接口文档
└── README.md                    # 本文件

api/
└── schedule.js                  # 接口定义
```

## 功能特性

### 1. 周选择器 (WeekHeader.vue)
- **功能**：
  - 显示当前日期和周数
  - 提供"上一周"、"今天"、"下一周"按钮快速切换
  - 显示周内所有日期，支持点击选择特定日期
  - 高亮显示今天

- **Props**：
  - `currentDate` (String): 当前日期，格式 YYYY-MM-DD

- **Events**：
  - `week-change`: 周切换事件，返回新的日期
  - `day-select`: 日期选择事件，返回选中的日期

### 2. 班次卡片 (ShiftItem.vue)
- **功能**：
  - 展示班次的基本信息（时间、地点、科室）
  - 显示号源统计（总号源、已挂号、已就诊）
  - 根据班次状态显示不同的样式
  - 支持点击查看详情

- **Props**：
  - `shift` (Object): 班次对象

- **Events**：
  - `shift-click`: 班次点击事件

### 3. 班次详情弹窗 (ShiftDetail.vue)
- **功能**：
  - 展示班次的详细信息
  - 显示就诊统计数据
  - 计算挂号率和就诊率
  - 支持滚动查看更多信息

- **Props**：
  - `visible` (Boolean): 是否显示弹窗
  - `shift` (Object): 班次对象

- **Events**：
  - `close`: 关闭弹窗事件

### 4. 主页面 (schedule.vue)
- **功能**：
  - 整合所有子组件
  - 管理排班数据的加载和状态
  - 处理周切换和日期筛选
  - 展示排班列表

## 数据流

```
页面加载
  ↓
获取医生信息 (from localStorage)
  ↓
加载当前周的排班数据 (from API/Mock)
  ↓
显示排班列表
  ↓
用户交互
  ├─ 点击"上一周/下一周/今天" → 重新加载排班
  ├─ 点击日期卡片 → 筛选显示该日期的排班
  └─ 点击班次卡片 → 显示详情弹窗
```

## Mock 数据说明

Mock 数据文件 `schedule-mock.js` 包含以下函数：

### mockGetSchedules(startDate, endDate)
获取指定日期范围内的排班数据

**参数**：
- `startDate`: 开始日期 (YYYY-MM-DD)
- `endDate`: 结束日期 (YYYY-MM-DD)

**返回**：Promise，解析为排班数据

### mockGetWeekSchedules(weekOffset)
获取指定周的排班数据

**参数**：
- `weekOffset`: 周偏移量
  - 0: 当前周
  - 1: 下一周
  - -1: 上一周

**返回**：Promise，解析为排班数据

## API 接口说明

### getSchedules(doctorId, startDate, endDate)
获取医生排班信息

**参数**：
- `doctorId`: 医生ID
- `startDate`: 开始日期 (YYYY-MM-DD)
- `endDate`: 结束日期 (YYYY-MM-DD)

**返回**：Promise

### getWeekSchedules(doctorId, weekOffset)
获取指定周的排班

**参数**：
- `doctorId`: 医生ID
- `weekOffset`: 周偏移量 (0 | 1 | -1)

**返回**：Promise

### getHistorySchedules(doctorId, page, pageSize)
获取历史排班记录

**参数**：
- `doctorId`: 医生ID
- `page`: 页码 (默认 1)
- `pageSize`: 每页数量 (默认 10)

**返回**：Promise

## 使用 Mock 数据

在 `src/api/schedule.js` 中修改 `USE_MOCK` 变量：

```javascript
// 使用 Mock 数据（开发调试）
const USE_MOCK = true

// 使用真实接口（生产环境）
const USE_MOCK = false
```

## 样式设计

### 色彩方案
- **主色**：#87cefa（天蓝色）
- **文字主色**：#1d2b53（深蓝色）
- **文字辅色**：#8a96ad（灰蓝色）
- **背景色**：#f8faff（浅蓝色）
- **成功色**：#4CAF50（绿色）
- **危险色**：#ff5252（红色）

### 响应式设计
- 适配小程序端
- 支持不同屏幕尺寸
- 触摸友好的按钮大小（最小 64rpx）

## 性能优化

1. **数据缓存**：可在页面级别缓存排班数据，减少重复请求
2. **虚拟滚动**：对于大量排班数据，考虑使用虚拟滚动优化性能
3. **图片优化**：如有图片资源，使用适当的尺寸和格式
4. **防抖处理**：周切换时添加防抖，避免频繁请求

## 扩展功能

### 可考虑添加的功能
1. **排班导出**：支持导出排班表为 PDF 或 Excel
2. **排班提醒**：班次开始前发送提醒通知
3. **排班统计**：显示月度或年度的排班统计
4. **排班调整**：支持申请调班或换班
5. **班次评价**：显示患者对该班次的评价

## 常见问题

### Q1: 如何切换 Mock 数据和真实接口？
A: 在 `src/api/schedule.js` 中修改 `USE_MOCK` 常量。

### Q2: 日期格式有什么要求？
A: 必须使用 `YYYY-MM-DD` 格式，例如 `2025-11-17`。

### Q3: 如何获取医生ID？
A: 从本地存储的 `doctorInfo` 中获取，登录后自动保存。

### Q4: 班次状态有哪些？
A: 
- `scheduled`: 排班中
- `completed`: 已完成
- `cancelled`: 已取消

### Q5: 如何自定义样式？
A: 修改各组件的 `<style>` 部分，或在 `uni.scss` 中定义全局变量。

## 开发建议

1. **先使用 Mock 数据开发**，确保功能逻辑正确
2. **充分测试各种边界情况**，如无排班、跨月份查询等
3. **关注用户体验**，确保操作流畅、反馈及时
4. **添加适当的错误处理和用户提示**
5. **定期检查性能**，优化加载速度

## 联系方式

如有问题或建议，请联系开发团队。
