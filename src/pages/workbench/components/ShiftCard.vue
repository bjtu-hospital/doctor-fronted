<template>
  <view class="shift-card-wrapper">
    <!-- 状态1：未签到 -->
    <view
      v-if="status === 'not_checkin'"
      class="shift-card not-checkin"
    >
      <view class="shift-content">
        <view class="shift-header">
          <text class="shift-name">{{ shiftInfo.name }}</text>
          <text class="countdown">{{ countdown }}</text>
        </view>
        <view class="shift-time">
          <text>⏰ {{ shiftInfo.startTime }} - {{ shiftInfo.endTime }}</text>
        </view>
        <view class="shift-location">
          <text>📍 {{ shiftInfo.location }}</text>
        </view>
      </view>
      <button
        class="action-button checkin-btn"
        :loading="loading"
        :disabled="loading"
        @tap="handleCheckin"
      >
        立即签到
      </button>
    </view>

    <!-- 状态2：已签到 工作中 -->
    <view
      v-else-if="status === 'checked_in'"
      class="shift-card checked-in"
    >
      <view class="left-border"></view>
      <view class="shift-content">
        <view class="checkin-status">
          <text class="status-icon">✓</text>
          <text class="status-text">已签到 {{ checkinTime }}</text>
        </view>
        <view class="shift-info">
          <text class="info-label">当前班次</text>
          <text class="info-value">{{ shiftInfo.name }}</text>
        </view>
        <view class="work-stats">
          <view class="stat-item">
            <text class="stat-label">已工作</text>
            <text class="stat-value">{{ workDuration }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">距离下班</text>
            <text class="stat-value">{{ timeToCheckout }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 状态3：待签退 -->
    <view
      v-else-if="status === 'checkout_pending'"
      class="shift-card checkout-pending"
    >
      <view class="shift-content">
        <view class="warning">
          <text class="warning-icon">⚠️</text>
          <text class="warning-text">请记得签退</text>
        </view>
        <view class="shift-info">
          <text class="info-label">班次名称</text>
          <text class="info-value">{{ shiftInfo.name }}</text>
        </view>
        <view class="work-duration">
          <text>已工作时长：{{ workDuration }}</text>
        </view>
      </view>
      <button
        class="action-button checkout-btn"
        :loading="loading"
        :disabled="loading"
        @tap="handleCheckout"
      >
        立即签退
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ShiftCard',
  props: {
    status: {
      type: String,
      default: 'not_checkin', // 'not_checkin' | 'checked_in' | 'checkout_pending'
      validator: (val) => ['not_checkin', 'checked_in', 'checkout_pending'].includes(val)
    },
    shiftInfo: {
      type: Object,
      default: () => ({
        id: 1,
        name: '上午门诊',
        startTime: '08:30',
        endTime: '12:00',
        location: '门诊 3 诊室'
      })
    },
    checkinTime: {
      type: String,
      default: ''
    },
    workDuration: {
      type: String,
      default: ''
    },
    timeToCheckout: {
      type: String,
      default: ''
    },
    countdown: {
      type: String,
      default: '距离开始还有 15 分钟'
    }
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {
    handleCheckin() {
      this.loading = true
      this.$emit('checkin', this.shiftInfo.id)
      // 加载状态由父组件控制
    },
    handleCheckout() {
      this.loading = true
      this.$emit('checkout', this.shiftInfo.id)
    }
  },
  watch: {
    loading(newVal) {
      if (!newVal) {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.shift-card-wrapper {
  padding: 0 24rpx 24rpx;
}

.shift-card {
  border-radius: 28rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 10rpx 30rpx rgba(15, 27, 48, 0.08);
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  position: relative;

  &.not-checkin {
    background: linear-gradient(135deg, #87cefa, #6bb6ff);
    color: #fff;

    .shift-name {
      font-size: 28rpx;
      font-weight: 600;
      color: #fff;
    }

    .countdown {
      font-size: 22rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-left: auto;
    }

    .shift-time,
    .shift-location {
      font-size: 22rpx;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 8rpx;
    }

    .checkin-btn {
      background: rgba(255, 255, 255, 0.3);
      color: #fff;
      border-radius: 20rpx;
      height: 72rpx;
      line-height: 72rpx;
      font-weight: 600;
      font-size: 28rpx;
      border: 2rpx solid rgba(255, 255, 255, 0.5);
      animation: pulse 2s infinite;

      &:active {
        opacity: 0.9;
      }
    }
  }

  &.checked-in {
    background: #fff;
    border-left: 8rpx solid #4CAF50;

    .left-border {
      position: absolute;
      left: 0;
      top: 0;
      width: 8rpx;
      height: 100%;
      background: #4CAF50;
      border-radius: 28rpx 0 0 28rpx;
    }

    .checkin-status {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-bottom: 12rpx;

      .status-icon {
        font-size: 32rpx;
        color: #4CAF50;
        font-weight: bold;
      }

      .status-text {
        font-size: 24rpx;
        color: #4CAF50;
        font-weight: 600;
      }
    }

    .shift-info {
      display: flex;
      flex-direction: column;
      gap: 4rpx;

      .info-label {
        font-size: 20rpx;
        color: #8a96ad;
      }

      .info-value {
        font-size: 26rpx;
        color: #1d2b53;
        font-weight: 600;
      }
    }

    .work-stats {
      display: flex;
      gap: 24rpx;
      margin-top: 16rpx;
      padding-top: 16rpx;
      border-top: 1rpx solid #f0f0f0;

      .stat-item {
        display: flex;
        flex-direction: column;
        gap: 4rpx;

        .stat-label {
          font-size: 20rpx;
          color: #8a96ad;
        }

        .stat-value {
          font-size: 26rpx;
          color: #1d2b53;
          font-weight: 600;
        }
      }
    }
  }

  &.checkout-pending {
    background: #fff;
    border: 2rpx solid #FF9800;

    .warning {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 12rpx 16rpx;
      background: rgba(255, 152, 0, 0.1);
      border-radius: 12rpx;
      margin-bottom: 12rpx;

      .warning-icon {
        font-size: 28rpx;
      }

      .warning-text {
        font-size: 24rpx;
        color: #FF9800;
        font-weight: 600;
      }
    }

    .shift-info {
      display: flex;
      flex-direction: column;
      gap: 4rpx;

      .info-label {
        font-size: 20rpx;
        color: #8a96ad;
      }

      .info-value {
        font-size: 26rpx;
        color: #1d2b53;
        font-weight: 600;
      }
    }

    .work-duration {
      font-size: 22rpx;
      color: #5c6475;
      margin-top: 12rpx;
      padding-top: 12rpx;
      border-top: 1rpx solid #f0f0f0;
    }

    .checkout-btn {
      background: #FF9800;
      color: #fff;
      border-radius: 20rpx;
      height: 72rpx;
      line-height: 72rpx;
      font-weight: 600;
      font-size: 28rpx;

      &:active {
        opacity: 0.9;
      }
    }
  }
}

.shift-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.shift-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-button {
  border: none;
  outline: none;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}
</style>
