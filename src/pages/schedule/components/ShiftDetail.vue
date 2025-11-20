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
            <view class="label">诊室名称</view>
            <view class="value">{{ shift.clinic_name }}</view>
          </view>
          <view class="detail-item">
            <view class="label">日期</view>
            <view class="value">{{ shift.date }} 星期{{ getWeekDayText(shift.week_day) }}</view>
          </view>
          <view class="detail-item">
            <view class="label">时段</view>
            <view class="value">{{ shift.time_section }}</view>
          </view>
          <view class="detail-item">
            <view class="label">号源类型</view>
            <view class="value">{{ shift.slot_type }}</view>
          </view>
          <view class="detail-item">
            <view class="label">诊室类型</view>
            <view class="value">{{ getClinicTypeText(shift.clinic_type) }}</view>
          </view>
          <view class="detail-item">
            <view class="label">挂号费用</view>
            <view class="value">￥{{ shift.price.toFixed(2) }}</view>
          </view>
          <view class="detail-item">
            <view class="label">排班状态</view>
            <view class="value" :class="'status-' + shift.status">{{ shift.status }}</view>
          </view>
        </view>

        <view class="detail-section">
          <text class="section-title">就诊统计</text>
          <view class="stats-grid">
            <view class="stat-card">
              <text class="stat-number">{{ shift.total_slots }}</text>
              <text class="stat-label">总号源</text>
            </view>
            <view class="stat-card">
              <text class="stat-number">{{ shift.total_slots - shift.remaining_slots }}</text>
              <text class="stat-label">已挂号</text>
            </view>
            <view class="stat-card">
              <text class="stat-number">{{ shift.remaining_slots }}</text>
              <text class="stat-label">剩余号源</text>
            </view>
            <view class="stat-card">
              <text class="stat-number">{{ getRegistrationRate() }}%</text>
              <text class="stat-label">挂号率</text>
            </view>
          </view>
        </view>

        <view class="detail-section">
          <text class="section-title">医生信息</text>
          <view class="detail-item">
            <view class="label">医生姓名</view>
            <view class="value">{{ shift.doctor_name }}</view>
          </view>
          <view class="detail-item">
            <view class="label">医生ID</view>
            <view class="value">{{ shift.doctor_id }}</view>
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
    getWeekDayText(weekDay) {
      const weekDayMap = {
        1: '一',
        2: '二',
        3: '三',
        4: '四',
        5: '五',
        6: '六',
        7: '日'
      }
      return weekDayMap[weekDay] || ''
    },
    getClinicTypeText(clinicType) {
      const typeMap = {
        0: '普通门诊',
        1: '国疗门诊',
        2: '特需门诊'
      }
      return typeMap[clinicType] || '未知'
    },
    getRegistrationRate() {
      if (!this.shift.total_slots || this.shift.total_slots === 0) return 0
      const registered = this.shift.total_slots - this.shift.remaining_slots
      return Math.round((registered / this.shift.total_slots) * 100)
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

    &.status-正常 {
      color: #87cefa;
    }

    &.status-暂停 {
      color: #faad14;
    }

    &.status-取消 {
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
