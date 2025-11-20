<template>
  <view class="shift-card-wrapper">
    <!-- 状态1：未签到 -->
      <view v-if="derivedStatus === 'not_checkin'" class="shift-card not-checkin">
      <view class="realtime-display">{{ currentTime }}</view>
      <view class="notcheckin-row">
        <view class="notcheckin-left">
          <text class="shift-name">{{ shiftInfo ? shiftInfo.name : '' }}</text>
          <text class="realtime">今日排班时间：{{ shiftInfo ? (shiftInfo.startTime + ' - ' + shiftInfo.endTime) : '' }}</text>
          <text class="location">值班地点：{{ shiftInfo ? shiftInfo.location : '' }}</text>
        </view>

        <view class="notcheckin-right">
          <view class="right-top-btn">
            <text
              class="refresh-btn"
              :class="{ disabled: locationLoading }"
              @click="handleRefreshLocation"
            >
              {{ locationLoading ? '定位中...' : '重新定位' }}
            </text>
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
    </view>
    <!-- 状态2：已签到 工作中 -->
    <view v-else-if="derivedStatus === 'checked_in'" class="shift-card checked-in">
      <view class="checkedin-header">
        <view class="checkedin-time">{{ currentTime }}</view>
        <view class="checkedin-title">
          <text class="shift-time">今日排班时间：{{ shiftInfo ? (shiftInfo.startTime + ' - ' + shiftInfo.endTime) : '' }}</text>
          <text class="location">值班地点：{{ shiftInfo ? shiftInfo.location : '' }}</text>
        </view>
        <view class="checkedin-action">
          <button class="action-button checkedin-btn" disabled>已签到</button>
          <text class="checkin-time">{{ formatCheckinTime(checkinTime) }}</text>
        </view>
      </view>
      <view class="work-summary checkedin-summary">
        <view class="summary-item">
          <text class="summary-label">已工作</text>
          <text class="summary-value">{{ workDuration || '--' }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">距离下班</text>
          <text class="summary-value">{{ timeToCheckout || '--' }}</text>
        </view>
      </view>
    </view>

    <!-- 状态3：待签退 -->
    <view v-else-if="derivedStatus === 'checkout_pending'" class="shift-card checkout-pending">
      <view class="realtime-display">{{ currentTime }}</view>
      <view class="notcheckin-row">
        <view class="notcheckin-left">
          <text class="shift-name">{{ shiftInfo ? shiftInfo.name : '' }}</text>
          <text class="realtime">今日排班时间：{{ shiftInfo ? (shiftInfo.startTime + ' - ' + shiftInfo.endTime) : '' }}</text>
          <text class="location">值班地点：{{ shiftInfo ? shiftInfo.location : '' }}</text>
        </view>
        <view class="notcheckin-right">
          <view class="right-top-btn">
            <text
              class="refresh-btn"
              :class="{ disabled: locationLoading }"
              @click="handleRefreshLocation"
            >
              {{ locationLoading ? '定位中...' : '重新定位' }}
            </text>
          </view>
          <button
            class="action-button checkout-btn"
            :loading="loading"
            :disabled="loading"
            @tap="handleCheckout"
          >
            签退
          </button>
        </view>
      </view>
    </view>

    <!-- 状态4：已签退 -->
    <view v-else-if="derivedStatus === 'checked_out'" class="shift-card checked-out">
      <view class="checkedout-header">
        <view class="checkedin-time">{{ currentTime }}</view>
        <view class="checkedout-middle">
          <text class="checked-out-title">已签退，辛苦了！</text>
        </view>
        <view class="checkedout-inline-action">
          <button class="action-button checkedout-btn-inline" disabled>已签退</button>
          <text class="checkin-time"> {{ formatCheckinTime(checkoutTime) }}</text>
        </view>
      </view>
      <view class="work-summary checkedout-summary">
        <view class="summary-item">
          <text class="summary-label">本次工作时长</text>
          <text class="summary-value">{{ workDuration || '--' }}</text>
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
      default: 'not_checkin',
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
    checkoutTime: {
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
    },
    locationLoading: {
      type: Boolean,
      default: false
    },
    // 新增：允许父组件传递签到/签退状态和班次时间
    signedIn: {
      type: Boolean,
      default: false
    },
    signedOut: {
      type: Boolean,
      default: false
    },
    shiftDate: {
      type: String,
      default: '' // YYYY-MM-DD
    },
    // 模拟时间（用于开发测试）
    simulatedTime: {
      type: String,
      default: '' // HH:mm
    }
  },
  data() {
    return {
      loading: false,
      currentTime: this.formatCurrentTime(),
      derivedStatus: 'not_checkin' // 本地派生状态
    }
  },
  mounted() {
    // 初始化时立即更新状态
    this.updateDerivedStatus()
    // 每秒更新时间
    this.timeInterval = setInterval(() => {
      if (typeof this.$set === 'function') {
        this.$set(this, 'currentTime', this.formatCurrentTime())
      } else {
        this.currentTime = this.formatCurrentTime()
      }
      this.updateDerivedStatus()
    }, 1000)
    // 每天00:00刷新状态
    this.midnightTimer = setInterval(() => {
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() < 2) {
        this.updateDerivedStatus(true)
      }
    }, 1000)
  },
  beforeDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval)
    }
    if (this.midnightTimer) {
      clearInterval(this.midnightTimer)
    }
  },
  methods: {
    /**
     * 获取当前时间（支持模拟时间）
     */
    getCurrentTime() {
      if (this.simulatedTime && /^\d{2}:\d{2}$/.test(this.simulatedTime)) {
        const [h, m] = this.simulatedTime.split(':').map(Number)
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0)
      }
      return new Date()
    },
    formatCurrentTime() {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      return `${hours}:${minutes}:${seconds}`
    },
    formatCheckinTime(timeString) {
      if (!timeString) return '--:--'
      if (/^\d{2}:\d{2}$/.test(timeString)) {
        return timeString
      }
      const date = new Date(timeString)
      if (Number.isNaN(date.getTime())) {
        return '--:--'
      }
      const h = String(date.getHours()).padStart(2, '0')
      const m = String(date.getMinutes()).padStart(2, '0')
      return `${h}:${m}`
    },
    handleRefreshLocation() {
      this.$emit('refresh-location')
    },
    handleCheckin() {
      if (!this.shiftInfo) {
        uni.showToast({ title: '班次信息不可用', icon: 'none' })
        return
      }
      // 判断是否在签到时间窗口（使用模拟时间）
      const now = this.getCurrentTime()
      const shiftStart = this.parseTime(this.shiftInfo.startTime)
      // 签到允许窗口：开始前30分钟到开始后30分钟
      const allowStart = new Date(shiftStart.getTime() - 30 * 60000)
      const allowEnd = new Date(shiftStart.getTime() + 30 * 60000)
      if (now < allowStart) {
        uni.showToast({ title: '未到签到时间', icon: 'none' })
        return
      }
      if (now > allowEnd) {
        uni.showToast({ title: '已超过签到时间', icon: 'none' })
        return
      }
      this.loading = true
      this.$emit('checkin', this.shiftInfo.id)
    },
    handleCheckout() {
      if (!this.shiftInfo) {
        uni.showToast({ title: '班次信息不可用', icon: 'none' })
        return
      }
      // 判断是否在签退时间窗口（使用模拟时间）
      const now = this.getCurrentTime()
      const shiftEnd = this.parseTime(this.shiftInfo.endTime)
      // 签退允许窗口：结束后2小时内
      const allowStart = shiftEnd
      const allowEnd = new Date(shiftEnd.getTime() + 2 * 60 * 60000)
      if (now < allowStart) {
        uni.showToast({ title: '未到签退时间', icon: 'none' })
        return
      }
      if (now > allowEnd) {
        uni.showToast({ title: '已超过签退时间', icon: 'none' })
        return
      }
      this.loading = true
      this.$emit('checkout', this.shiftInfo.id)
    },
        // 本地派生卡片状态
        updateDerivedStatus(forceMidnight = false) {
          const now = this.getCurrentTime()
          // 每天00:00刷新为待签到，或强制刷新
          if (forceMidnight) {
            this.derivedStatus = 'not_checkin'
            return
          }
          // 如果班次日期不是今天，重置为待签到
          if (this.shiftDate) {
            const today = this.formatDate(now)
            if (this.shiftDate !== today) {
              this.derivedStatus = 'not_checkin'
              return
            }
          }
          if (!this.shiftInfo) {
            this.derivedStatus = 'not_checkin'
            return
          }
          const shiftStart = this.parseTime(this.shiftInfo.startTime)
          const shiftEnd = this.parseTime(this.shiftInfo.endTime)
          const allowCheckinEnd = new Date(shiftStart.getTime() + 30 * 60000)
          const allowCheckoutEnd = new Date(shiftEnd.getTime() + 2 * 60 * 60000)
          // 如果已签退，且班次日期是今天，显示已签退
          if (this.signedOut) {
            this.derivedStatus = 'checked_out'
            return
          }
          if (now < shiftStart) {
            this.derivedStatus = 'not_checkin'
            return
          }
          if (now >= shiftStart && now <= allowCheckinEnd) {
            this.derivedStatus = this.signedIn ? 'checked_in' : 'not_checkin'
            return
          }
          if (now > allowCheckinEnd && now < shiftEnd) {
            this.derivedStatus = this.signedIn ? 'checked_in' : 'not_checkin'
            return
          }
          if (now >= shiftEnd && now <= allowCheckoutEnd) {
            this.derivedStatus = this.signedOut ? 'checked_out' : 'checkout_pending'
            return
          }
          if (now > allowCheckoutEnd) {
            this.derivedStatus = this.signedOut ? 'checked_out' : 'checkout_pending'
            return
          }
          this.derivedStatus = 'not_checkin'
        },
        // 格式化日期为 YYYY-MM-DD
        formatDate(date) {
          const y = date.getFullYear()
          const m = String(date.getMonth() + 1).padStart(2, '0')
          const d = String(date.getDate()).padStart(2, '0')
          return `${y}-${m}-${d}`
        },
        // HH:mm转当天时间
        parseTime(timeStr) {
          const now = new Date()
          const [h, m] = timeStr.split(':').map(Number)
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0)
          return d
        },
    handleViewSummary() {
      if (!this.shiftInfo || !this.shiftInfo.id) {
        uni.showToast({ title: '无法查看详情，班次信息缺失', icon: 'none' })
        return
      }
      this.$emit('view-summary', this.shiftInfo.id)
    }
  },
  watch: {
    loading(newVal) {
      if (!newVal) {
        this.loading = false
      }
    },
    signedIn() {
      this.updateDerivedStatus()
    },
    signedOut() {
      this.updateDerivedStatus()
    },
    shiftInfo: {
      handler() {
        this.updateDerivedStatus()
      },
      deep: true
    },
    shiftDate(newDate, oldDate) {
      // 班次日期变化时（跨天）重置状态
      if (newDate !== oldDate && newDate) {
        this.updateDerivedStatus(true)
      }
    },
    simulatedTime() {
      // 模拟时间变化时，立即更新状态
      this.updateDerivedStatus()
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
  min-height: 225rpx;
  justify-content: space-between;

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

    .refresh-btn {
      font-size: 14rpx;
      color: #fff;
      text-decoration: underline;
      cursor: pointer;

      &.disabled {
        opacity: 0.6;
        pointer-events: none;
        text-decoration: none;
      }
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
      font-size: 30rpx;
      width: 180rpx;
      box-shadow: 0 8rpx 18rpx rgba(0,0,0,0.12);

      &:active {
        opacity: 0.9;
      }
    }
  }

  &.checked-in {
    background: #fff;
    border-left: 10rpx solid #4caf6a;
    color: #1f5133;

    .checkedin-header {
      display: flex;
      gap: 24rpx;
      align-items: center;
    }

    .checkedin-time {
      font-size: 42rpx;
      font-weight: 700;
      color: #1f5133;
      min-width: 160rpx;
    }

    .checkedin-title {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4rpx;
    }

    .shift-time,
    .location {
      font-size: 22rpx;
      color: rgba(31, 81, 51, 0.65);
    }

    .checkedin-action {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6rpx;
    }

    .checkedin-btn {
      width: 180rpx;
      height: 64rpx;
      line-height: 64rpx;
      background: #4caf6a;
      color: #fff;
      border: none;
      border-radius: 14rpx;
      font-weight: 700;
      font-size: 30rpx;
      box-shadow: 0 8rpx 18rpx rgba(76, 175, 106, 0.35);
    }

    .checkin-time {
      font-size: 20rpx;
      color: rgba(31, 81, 51, 0.8);
    }

    .checkedin-summary {
      display: flex;
      gap: 24rpx;
      margin-top: 16rpx;
      background: #f6fbf7;
      padding: 16rpx 20rpx;
      border-radius: 16rpx;

      .summary-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4rpx;
      }

      .summary-label {
        font-size: 18rpx;
        color: rgba(31, 81, 51, 0.7);
      }

      .summary-value {
        font-size: 24rpx;
        font-weight: 600;
        color: #1f5133;
      }
    }
  }

  &.checkout-pending {
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

    .refresh-btn {
      font-size: 14rpx;
      color: #fff;
      text-decoration: underline;
      cursor: pointer;

      &.disabled {
        opacity: 0.6;
        pointer-events: none;
        text-decoration: none;
      }
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
      position: absolute;
      top: 20rpx;
      right: 20rpx;
      background: rgba(255,255,255,0.12);
      padding: 6rpx 10rpx;
      border-radius: 12rpx;
    }

    .checkout-btn {
      background: #fff;
      color: #1d2b53;
      border-radius: 14rpx;
      height: 64rpx;
      line-height: 64rpx;
      font-weight: 700;
      font-size: 30rpx;
      width: 180rpx;
      box-shadow: 0 6rpx 18rpx rgba(0,0,0,0.12);

      &:active {
        opacity: 0.9;
      }
    }
  }
  &.checked-out {
    background: #fff;
    border-left: 10rpx solid #4caf6a;
    color: #1f5133;

    .checkedout-header {
      display: flex;
      gap: 16rpx;
      align-items: center;
    }

    .checkedout-middle {
      flex: 1;
      display: flex;
      justify-content: center;
    }
    .checkedin-time {
      font-size: 42rpx;
      font-weight: 700;
      color: #1f5133;
      min-width: 160rpx;
    }

    .checkedout-inline-action {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6rpx;
    }

    .checkedout-btn-inline {
     width: 180rpx;
      height: 64rpx;
      line-height: 64rpx;
      background: #4caf6a;
      color: #fff;
      border: none;
      border-radius: 14rpx;
      font-weight: 700;
      font-size: 30rpx;
      box-shadow: 0 8rpx 18rpx rgba(76, 175, 106, 0.35);
    }

    .checkin-time {
      font-size: 20rpx;
      color: rgba(31, 81, 51, 0.8);
      text-align: center;
      width: 100%;
    }


    .summary-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4rpx;
      }
      
    .summary-label {
        font-size: 18rpx;
        color: rgba(31, 81, 51, 0.7);
      }

      .summary-value {
        font-size: 24rpx;
        font-weight: 600;
        color: #1f5133;
      }
  }
}

.shift-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.checked-out-title {
  font-size: 30rpx;
  color: #1f5133;
  font-weight: 700;
}

.checkedout-summary {
  background: #f6fbf7;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  margin-top: 16rpx;
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
