<template>
  <u-popup :show="show" @close="$emit('close')" mode="bottom" round="16">
    <view class="queue-popup">
      <view class="popup-header">
        <text class="title">候诊队列</text>
        <view class="close-icon" @click="$emit('close')">
          <u-icon name="close" size="20"></u-icon>
        </view>
      </view>
      
      <scroll-view scroll-y class="queue-list">
        <view 
          class="queue-item" 
          v-for="(item, index) in list" 
          :key="item.id"
          :class="{ 'active': item.status === 'consulting', 'passed': item.status === 'passed' }"
        >
          <view class="left">
            <text class="number">{{ item.queueNumber }}</text>
            <view class="info">
              <text class="name">{{ item.name }}</text>
              <text class="desc">{{ item.gender }} | {{ item.age }}岁</text>
            </view>
          </view>
          <view class="right">
            <u-tag 
              :text="getStatusText(item.status)" 
              :type="getStatusType(item.status)" 
              size="mini"
            ></u-tag>
          </view>
        </view>
      </scroll-view>
    </view>
  </u-popup>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  list: {
    type: Array,
    default: () => []
  }
})

defineEmits(['close'])

const getStatusText = (status) => {
  const map = {
    waiting: '候诊中',
    consulting: '就诊中',
    completed: '已完成',
    passed: '已过号',
    invalid: '已作废'
  }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = {
    waiting: 'primary',
    consulting: 'success',
    completed: 'info',
    passed: 'warning',
    invalid: 'error'
  }
  return map[status] || 'info'
}
</script>

<style lang="scss" scoped>
.queue-popup {
  height: 60vh;
  display: flex;
  flex-direction: column;
  background: #fff;

  .popup-header {
    padding: 30rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;

    .title {
      font-size: 32rpx;
      font-weight: bold;
    }
  }

  .queue-list {
    flex: 1;
    height: 0; // Important for scroll-view in flex container
    padding: 20rpx;

    .queue-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx;
      border-bottom: 1px solid #f5f5f5;
      
      &.active {
        background: #f0f9eb;
      }
      
      &.passed {
        opacity: 0.7;
      }

      .left {
        display: flex;
        align-items: center;

        .number {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
          width: 100rpx;
        }

        .info {
          display: flex;
          flex-direction: column;

          .name {
            font-size: 28rpx;
            font-weight: bold;
            color: #333;
          }

          .desc {
            font-size: 24rpx;
            color: #999;
            margin-top: 4rpx;
          }
        }
      }
    }
  }
}
</style>
