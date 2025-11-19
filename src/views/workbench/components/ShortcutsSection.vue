<template>
  <view class="shortcuts-section">
    <view class="shortcuts-grid">
      <view
        class="shortcut-card"
        @tap="handleShortcutClick('schedule')"
      >
        <view class="icon-box icon-schedule"></view>
        <text class="shortcut-name">查看排班</text>
      </view>
      <view
        class="shortcut-card"
        @tap="handleShortcutClick('consultation')"
      >
        <view class="icon-box icon-consultation"></view>
        <text class="shortcut-name">接诊列表</text>
      </view>
      <view
        class="shortcut-card"
        @tap="handleShortcutClick('notes')"
      >
        <view class="icon-box icon-notes"></view>
        <text class="shortcut-name">工作笔记</text>
      </view>
      <view
        class="shortcut-card"
        @tap="handleShortcutClick('message')"
      >
        <view class="icon-box icon-message"></view>
        <text class="shortcut-name">消息中心</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ShortcutsSection',
  methods: {
    handleShortcutClick(type) {
      if (type === 'schedule') {
        // 跳转到排班页面（Tab3）
        uni.switchTab({
          url: '/views/schedule/index' // 需要更新路径
        })
      } else if (type === 'consultation') {
        // 跳转到接诊页面（Tab2）
        uni.switchTab({
          url: '/views/consultation/index' // 需要更新路径
        })
      } else if (type === 'notes' || type === 'message') {
        // 待开发功能
        uni.showToast({
          title: '即将上线，敬请期待',
          icon: 'none',
          duration: 2000
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.shortcuts-section {
  padding: 0 24rpx 24rpx;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10rpx;
}

.shortcut-card {
  background: #fff;
  border-radius: 14rpx;
  padding: 18rpx 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  box-shadow: 0 3rpx 10rpx rgba(15, 27, 48, 0.05);
  transition: opacity 0.2s ease;

  &:active {
    opacity: 0.8;
  }

  .icon-box {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    background: #f0f5ff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
  }

  .shortcut-name {
    font-size: 18rpx;
    color: #1d2b53;
    font-weight: 500;
    text-align: center;
    line-height: 1.2;
  }
}

/* Icon styles using CSS lines for simple, professional icons */
.icon-schedule::before,
.icon-schedule::after {
  content: '';
  position: absolute;
}

.icon-schedule::before {
  width: 28rpx;
  height: 28rpx;
  border: 2rpx solid #87cefa;
  border-radius: 4rpx;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.icon-schedule::after {
  width: 2rpx;
  height: 14rpx;
  background: #87cefa;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -20%);
}

.icon-consultation {
  background: linear-gradient(135deg, #87cefa 0%, #6bb6ff 100%);
}

.icon-consultation::before,
.icon-consultation::after {
  content: '';
  position: absolute;
  background: #fff;
}

.icon-consultation::before {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  top: 12rpx;
}

.icon-consultation::after {
  width: 16rpx;
  height: 10rpx;
  border-radius: 8rpx 8rpx 6rpx 6rpx;
  top: 24rpx;
}

.icon-notes::before,
.icon-notes::after {
  content: '';
  position: absolute;
}

.icon-notes::before {
  width: 20rpx;
  height: 28rpx;
  border: 2rpx solid #87cefa;
  border-radius: 2rpx;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.icon-notes::after {
  width: 12rpx;
  height: 2rpx;
  background: #87cefa;
  left: 50%;
  top: 45%;
  transform: translateX(-50%);
}

.icon-message::before,
.icon-message::after {
  content: '';
  position: absolute;
  background: #87cefa;
}

.icon-message::before {
  width: 22rpx;
  height: 18rpx;
  border-radius: 3rpx;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -45%);
}

.icon-message::after {
  width: 0;
  height: 0;
  border-left: 4rpx solid transparent;
  border-right: 4rpx solid transparent;
  border-top: 6rpx solid #87cefa;
  left: 50%;
  top: 62%;
  transform: translateX(-50%);
}
</style>

