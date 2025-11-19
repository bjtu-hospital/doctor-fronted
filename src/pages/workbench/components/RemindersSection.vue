<template>
  <view v-if="reminders.length > 0" class="reminders-section">
    <view class="reminders-title">待办提醒</view>
    <view class="reminders-list">
      <view
        v-for="reminder in reminders"
        :key="reminder.id"
        class="reminder-item"
      >
        <view class="reminder-icon">{{ reminder.icon }}</view>
        <view class="reminder-content">
          <text class="reminder-title">{{ reminder.title }}</text>
        </view>
        <view class="reminder-time">{{ reminder.time }}</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RemindersSection',
  props: {
    reminders: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped>
.reminders-section {
  padding: 0 24rpx 24rpx;
}

.reminders-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #1d2b53;
  margin-bottom: 16rpx;
}

.reminders-list {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 20rpx rgba(15, 27, 48, 0.06);
}

.reminder-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .reminder-icon {
    font-size: 28rpx;
    flex-shrink: 0;
  }

  .reminder-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;

    .reminder-title {
      font-size: 24rpx;
      color: #1d2b53;
      font-weight: 500;
    }
  }

  .reminder-time {
    font-size: 20rpx;
    color: #8a96ad;
    flex-shrink: 0;
  }
}
</style>
