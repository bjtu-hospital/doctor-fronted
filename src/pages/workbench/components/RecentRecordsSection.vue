<template>
  <view class="recent-records-section">
    <view class="section-header">
      <text class="section-title">最近接诊</text>
      <text
        v-if="records.length > 0"
        class="view-all"
        @tap="handleViewAll"
      >
        查看全部 >
      </text>
    </view>

    <view v-if="records.length > 0" class="records-list">
      <view
        v-for="record in records"
        :key="record.id"
        class="record-card"
      >
        <view class="record-header">
          <text class="patient-name">{{ record.patientName }}</text>
          <text class="consultation-time">{{ record.consultationTime }}</text>
        </view>
        <view class="record-diagnosis">
          <text>{{ record.diagnosis }}</text>
        </view>
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-icon">📋</text>
      <text class="empty-text">暂无接诊记录</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RecentRecordsSection',
  props: {
    records: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleViewAll() {
      // 跳转到接诊页面（Tab2）
      uni.switchTab({
        url: '/pages/consultation/consultation'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.recent-records-section {
  padding: 0 24rpx 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #1d2b53;
}

.view-all {
  font-size: 22rpx;
  color: #87cefa;
  font-weight: 500;
}

.records-list {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 20rpx rgba(15, 27, 48, 0.06);
}

.record-card {
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;

  &:last-child {
    border-bottom: none;
  }

  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .patient-name {
      font-size: 24rpx;
      color: #1d2b53;
      font-weight: 600;
    }

    .consultation-time {
      font-size: 20rpx;
      color: #8a96ad;
    }
  }

  .record-diagnosis {
    font-size: 20rpx;
    color: #5c6475;
    line-height: 1.5;
  }
}

.empty-state {
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 8rpx 20rpx rgba(15, 27, 48, 0.06);

  .empty-icon {
    font-size: 80rpx;
  }

  .empty-text {
    font-size: 24rpx;
    color: #8a96ad;
    font-weight: 500;
  }
}
</style>
