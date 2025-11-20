<template>
  <view class="shift-cell" :class="[colorClass]" @tap="handleClick">
    <view class="cell-content">
      <text class="shift-name">{{ shift.name }}</text>
      <text class="shift-location">@{{ shift.location }}</text>
      <view class="shift-status-badge" v-if="shift.status !== 'scheduled'">
        <text class="status-text">{{ getStatusText(shift.status) }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ShiftItem',
  props: {
    shift: {
      type: Object,
      required: true
    }
  },
  computed: {
    colorClass() {
      // 根据科室或ID生成不同的柔和背景色
      const colors = ['bg-blue', 'bg-pink', 'bg-purple', 'bg-green', 'bg-orange']
      const index = (this.shift.id || 0) % colors.length
      
      if (this.shift.status === 'completed') return 'bg-gray'
      if (this.shift.status === 'cancelled') return 'bg-red-light'
      
      return colors[index]
    }
  },
  methods: {
    handleClick() {
      this.$emit('shift-click', this.shift)
    },
    getStatusText(status) {
      const map = {
        completed: '已完',
        cancelled: '取消'
      }
      return map[status] || ''
    }
  }
}
</script>

<style lang="scss" scoped>
.shift-cell {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
  padding: 12rpx 8rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
  
  /* 柔和的背景色 */
  &.bg-blue { background: #e6f7ff; color: #1890ff; }
  &.bg-pink { background: #fff0f6; color: #eb2f96; }
  &.bg-purple { background: #f9f0ff; color: #722ed1; }
  &.bg-green { background: #f6ffed; color: #52c41a; }
  &.bg-orange { background: #fff7e6; color: #fa8c16; }
  &.bg-gray { background: #f5f5f5; color: #999; }
  &.bg-red-light { background: #fff1f0; color: #f5222d; }

  &:active {
    opacity: 0.8;
  }
}

.cell-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4rpx;
  width: 100%;
}

.shift-name {
  font-size: 22rpx;
  font-weight: 600;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.shift-location {
  font-size: 18rpx;
  opacity: 0.8;
  margin-top: 2rpx;
}

.shift-status-badge {
  margin-top: 4rpx;
  background: rgba(255,255,255,0.6);
  padding: 2rpx 6rpx;
  border-radius: 4rpx;
  
  .status-text {
    font-size: 16rpx;
    font-weight: 500;
  }
}
</style>

