<template>
  <view class="dashboard-section">
    <view class="dashboard-grid">
      <view class="data-card pending">
        <text class="data-number">{{ data.pendingConsultation }}</text>
        <text class="data-label">待接诊</text>
      </view>
      <view class="data-card ongoing">
        <text class="data-number">{{ data.ongoingConsultation }}</text>
        <text class="data-label">接诊中</text>
      </view>
      <view class="data-card completed">
        <text class="data-number">{{ data.completedConsultation }}</text>
        <text class="data-label">已完成</text>
      </view>
      <view class="data-card total">
        <text class="data-number">{{ data.totalConsultation }}</text>
        <text class="data-label">总计</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DashboardSection',
  props: {
    data: {
      type: Object,
      default: () => ({
        pendingConsultation: 0,
        ongoingConsultation: 0,
        completedConsultation: 0,
        totalConsultation: 0
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-section {
  padding: 0 24rpx 24rpx;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.data-card {
  border-radius: 24rpx;
  padding: 24rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  box-shadow: 0 8rpx 20rpx rgba(15, 27, 48, 0.06);
  background: #fff;

  .data-number {
    font-size: 40rpx;
    font-weight: 700;
    line-height: 1;
  }

  .data-label {
    font-size: 22rpx;
    font-weight: 500;
  }

  &.pending {
    .data-number {
      color: #87cefa;
    }
    .data-label {
      color: #87cefa;
    }
  }

  &.ongoing {
    .data-number {
      color: #4CAF50;
    }
    .data-label {
      color: #4CAF50;
    }
  }

  &.completed {
    .data-number {
      color: #9aa3b5;
    }
    .data-label {
      color: #9aa3b5;
    }
  }

  &.total {
    .data-number {
      color: #1d2b53;
    }
    .data-label {
      color: #1d2b53;
    }
  }
}
</style>
