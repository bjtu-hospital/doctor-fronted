<template>
  <view class="shift-card-wrapper">
    <!-- 状态1：未签到 -->
      <view v-if="status === 'not_checkin'" class="shift-card not-checkin">
      <view class="realtime-display">{{ currentTime }}</view>
      <view class="notcheckin-row">
        <view class="notcheckin-left">
          <text class="shift-name">{{ shiftInfo.name }}</text>
          <text class="realtime">今日排班时间：{{ shiftInfo.startTime }} - {{ shiftInfo.endTime }}</text>
          <text class="location">值班地点：{{ shiftInfo.location }}</text>
        </view>

        <view class="notcheckin-right">
          <view class="right-top-btn">
            <text class="refresh-btn" @click="handleRefreshLocation">重新定位</text>
          </view>
          <button
            class="action-button checkin-btn"
            :loading="loading"
            :disabled="loading"
            @tap="handleCheckin"
          >
            签到
          </button>
        </view>
      </view>
      <view class="location-info">
        <text class="location-place">定位地点：{{ locatedPlace }}</text>
      </view>
    </view>    <!-- 状态2：已签到 工作中 -->
    <view v-else-if="status === 'checked_in'" class="shift-card checked-in">
      <view class="realtime-display">{{ currentTime }}</view>
      <view class="left-border"></view>
      <view class="shift-content">
        <view class="checkin-status">
          <text class="status-icon">✓</text>
          <view class="checkin-texts">
            <text class="status-text big">已签到</text>
            <text class="status-time">{{ checkinTime }}</text>
          </view>
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
    <view v-else-if="status === 'checkout_pending'" class="shift-card checkout-pending">
      <view class="realtime-display">{{ currentTime }}</view>
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
      <button class="action-button checkout-btn" :loading="loading" :disabled="loading" @tap="handleCheckout">立即签退</button>
    </view>

    <!-- 状态4：已签退 -->
    <view v-else-if="status === 'checked_out'" class="shift-card checked-out">
      <view class="realtime-display">{{ currentTime }}</view>
      <view class="shift-content">
        <text class="checked-out-title">已签退，辛苦了</text>
        <text class="checked-out-sub">本次工作时长：{{ workDuration }}</text>
        <view class="checked-out-actions">
          <button class="view-summary" @tap="$emit('view-summary', shiftInfo.id)">查看详情</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ShiftCard',
  props: {
    status: {
      type: String,
      default: 'not_checkin', // 'not_checkin' | 'checked_in' | 'checkout_pending' | 'checked_out'
      validator: (val) => ['not_checkin', 'checked_in', 'checkout_pending', 'checked_out'].includes(val)
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
      loading: false,
      currentTime: this.formatCurrentTime(),
      locatedPlace: '显示定位的地址'  // 定位显示地址
    }
  },
  mounted() {
    // 每秒更新时间（小程序端用$set保证响应式）
    this.timeInterval = setInterval(() => {
      if (typeof this.$set === 'function') {
        this.$set(this, 'currentTime', this.formatCurrentTime())
      } else {
        this.currentTime = this.formatCurrentTime()
      }
    }, 1000)
  },
  beforeDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval)
    }
  },
  methods: {
    formatCurrentTime() {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      return `${hours}:${minutes}:${seconds}`
    },
    handleRefreshLocation() {
      // 重新定位
      uni.showToast({
        title: '正在获取定位...',
        icon: 'loading',
        duration: 2000
      })
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.locatedPlace = `纬度:${res.latitude.toFixed(4)}, 经度:${res.longitude.toFixed(4)}`
          uni.showToast({
            title: '定位成功',
            icon: 'success',
            duration: 1000
          })
        },
        fail: () => {
          uni.showToast({
            title: '定位失败，请检查权限',
            icon: 'none'
          })
        }
      })
    },
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

.realtime-display {
  font-size: 44rpx;
  font-weight: 700;
  color: inherit;
  margin-bottom: 12rpx;
  line-height: 1;
  letter-spacing: 2rpx;
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

    .notcheckin-row {
      display: flex;
      flex-direction: row;
      gap: 12rpx;
      align-items: center;
    }

    .notcheckin-left {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8rpx;
    }

    .shift-name {
      font-size: 30rpx;
      font-weight: 700;
      color: #fff;
    }

    .realtime {
      font-size: 20rpx;
      color: rgba(255,255,255,0.9);
    }

    .location {
      font-size: 18rpx;
      color: rgba(255,255,255,0.85);
    }

    .location-info {
      display: flex;
      flex-direction: column;
      gap: 4rpx;
      margin-top: 4rpx;
    }

    .location-place {
      font-size: 16rpx;
      color: rgba(255,255,255,0.8);
    }

    .refresh-btn {
      font-size: 14rpx;
      color: #fff;
      text-decoration: underline;
      cursor: pointer;
    }

    .notcheckin-right {
      width: 220rpx;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: flex-start;
    }
    .right-top-btn {
      z-index: 2;
    }
    .right-top-btn {
      /* 放到卡片的右上角：依赖 .shift-card 的 position: relative */
      position: absolute;
      top: 20rpx;
      right: 20rpx;
      background: rgba(255,255,255,0.12);
      padding: 6rpx 10rpx;
      border-radius: 12rpx;
    }

    .checkin-btn {
      background: #fff;
      color: #1d2b53;
      border-radius: 14rpx;
      height: 64rpx;
      line-height: 64rpx;
      font-weight: 700;
      font-size: 20rpx;
      width: 180rpx;
      box-shadow: 0 6rpx 18rpx rgba(0,0,0,0.12);

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
      gap: 12rpx;
      margin-bottom: 12rpx;

      .status-icon {
        font-size: 36rpx;
        color: #4CAF50;
        font-weight: bold;
      }

      .checkin-texts {
        display: flex;
        flex-direction: column;
      }

      .status-text.big {
        font-size: 22rpx;
        color: #4CAF50;
        font-weight: 700;
      }

      .status-time {
        font-size: 20rpx;
        color: #8a96ad;
      }
    }

    .shift-info {
      display: flex;
      flex-direction: column;
      gap: 4rpx;

      .info-label {
        font-size: 18rpx;
        color: #8a96ad;
      }

      .info-value {
        font-size: 22rpx;
        color: #1d2b53;
        font-weight: 600;
      }
    }

    .work-stats {
      display: flex;
      gap: 16rpx;
      margin-top: 12rpx;
      padding-top: 12rpx;
      border-top: 1rpx solid #f0f0f0;

      .stat-item {
        display: flex;
        flex-direction: column;
        gap: 4rpx;

        .stat-label {
          font-size: 16rpx;
          color: #8a96ad;
        }

        .stat-value {
          font-size: 20rpx;
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
        font-size: 20rpx;
        color: #FF9800;
        font-weight: 600;
      }
    }

    .shift-info {
      display: flex;
      flex-direction: column;
      gap: 4rpx;

      .info-label {
        font-size: 16rpx;
        color: #8a96ad;
      }

      .info-value {
        font-size: 20rpx;
        color: #1d2b53;
        font-weight: 600;
      }
    }

    .work-duration {
      font-size: 18rpx;
      color: #5c6475;
      margin-top: 12rpx;
      padding-top: 12rpx;
      border-top: 1rpx solid #f0f0f0;
    }

    .checkout-btn {
      background: #FF9800;
      color: #fff;
      border-radius: 14rpx;
      height: 56rpx;
      line-height: 56rpx;
      font-weight: 700;
      font-size: 18rpx;
      padding: 0 20rpx;

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

.checked-out-title {
  font-size: 22rpx;
  color: #1d2b53;
  font-weight: 700;
}

.checked-out-sub {
  font-size: 16rpx;
  color: #8a96ad;
  margin-top: 8rpx;
}

.checked-out-actions {
  margin-top: 12rpx;
}

.checked-out-actions .view-summary {
  background: #f0f5ff;
  color: #1d2b53;
  border-radius: 12rpx;
  padding: 8rpx 12rpx;
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
