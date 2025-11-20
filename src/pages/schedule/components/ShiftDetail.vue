<template>
  <view v-if="visible" class="detail-mask" @tap="handleClose">
    <view class="detail-panel" @tap.stop>
      <view class="detail-header">
        <text class="title">班次详情</text>
        <text class="close-btn" @tap="handleClose">✕</text>
      </view>

      <scroll-view scroll-y class="detail-content">
        <view class="detail-section">
          <text class="section-title">基本信息</text>
          <view class="detail-item">
            <view class="label">班次名称</view>
            <view class="value">{{ shift.name }}</view>
          </view>
          <view class="detail-item">
            <view class="label">班次时间</view>
            <view class="value">{{ shift.startTime }} - {{ shift.endTime }}</view>
          </view>
          <view class="detail-item">
            <view class="label">值班地点</view>
            <view class="value">{{ shift.location }}</view>
          </view>
          <view class="detail-item">
            <view class="label">科室</view>
            <view class="value">{{ shift.department }}</view>
          </view>
          <view class="detail-item">
            <view class="label">班次状态</view>
            <view class="value" :class="'status-' + shift.status">{{ getStatusText(shift.status) }}</view>
          </view>
        </view>

        <view class="detail-section">
          <text class="section-title">就诊统计</text>
          <view class="stats-grid">
            <view class="stat-card">
              <text class="stat-number">{{ shift.capacity }}</text>
              <text class="stat-label">总号源</text>
            </view>
            <view class="stat-card">
              <text class="stat-number">{{ shift.registered }}</text>
              <text class="stat-label">已挂号</text>
            </view>
            <view class="stat-card">
              <text class="stat-number">{{ shift.consultationCount }}</text>
              <text class="stat-label">已就诊</text>
            </view>
            <view class="stat-card">
              <text class="stat-number">{{ shift.capacity - shift.registered }}</text>
              <text class="stat-label">剩余号源</text>
            </view>
          </view>
        </view>

        <view class="detail-section">
          <text class="section-title">统计信息</text>
          <view class="detail-item">
            <view class="label">挂号率</view>
            <view class="value">{{ getRegistrationRate() }}%</view>
          </view>
          <view class="detail-item">
            <view class="label">就诊率</view>
            <view class="value">{{ getConsultationRate() }}%</view>
          </view>
        </view>
      </scroll-view>

      <view class="detail-footer">
        <button class="btn btn-close" @tap="handleClose">关闭</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ShiftDetail',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    shift: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    getStatusText(status) {
      const statusMap = {
        scheduled: '排班中',
        completed: '已完成',
        cancelled: '已取消'
      }
      return statusMap[status] || '未知'
    },
    getRegistrationRate() {
      if (this.shift.capacity === 0) return 0
      return Math.round((this.shift.registered / this.shift.capacity) * 100)
    },
    getConsultationRate() {
      if (this.shift.registered === 0) return 0
      return Math.round((this.shift.consultationCount / this.shift.registered) * 100)
    },
    handleClose() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.detail-panel {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;

  .title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1d2b53;
  }

  .close-btn {
    font-size: 36rpx;
    color: #8a96ad;
    padding: 8rpx;
    line-height: 1;
  }
}

.detail-content {
  flex: 1;
  padding: 24rpx;
  box-sizing: border-box;
  width: 100%;
}

.detail-section {
  margin-bottom: 40rpx;
  width: 100%;
  box-sizing: border-box;

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1d2b53;
    margin-bottom: 20rpx;
    display: block;
  }
}

.detail-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f7fa;
  min-height: 60rpx;

  .label {
    font-size: 28rpx;
    color: #8a96ad;
    width: 150rpx;
    flex-shrink: 0;
  }

  .value {
    font-size: 28rpx;
    color: #1d2b53;
    font-weight: 500;
    flex: 1;
    word-wrap: break-word;
    text-align: left;
    padding-left: 20rpx;

    &.status-scheduled {
      color: #87cefa;
    }

    &.status-completed {
      color: #4CAF50;
    }

    &.status-cancelled {
      color: #ff5252;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  width: 100%;

  .stat-card {
    background: #f5f7fa;
    border-radius: 16rpx;
    padding: 28rpx 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    min-height: 120rpx;
    justify-content: center;
    box-sizing: border-box;

    .stat-number {
      font-size: 44rpx;
      font-weight: 700;
      color: #87cefa;
      line-height: 1;
    }

    .stat-label {
      font-size: 24rpx;
      color: #8a96ad;
    }
  }
}

.detail-footer {
  padding: 20rpx 24rpx;
  /* #ifdef MP-WEIXIN */
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  /* #endif */
  border-top: 1rpx solid #f0f0f0;
  flex-shrink: 0;

  .btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 16rpx;
    background: #87cefa;
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    border: none;

    &::after {
      border: none;
    }

    &:active {
      opacity: 0.8;
    }
  }
}
</style>
