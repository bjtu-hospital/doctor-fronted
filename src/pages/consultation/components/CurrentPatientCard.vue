<template>
  <view class="patient-card" v-if="patient">
    <view class="card-header">
      <text class="title">当前就诊</text>
      <view class="next-info" v-if="nextPatient">
        <text>下一位: {{ nextPatient.name }} ({{ nextPatient.queueNumber }})</text>
      </view>
    </view>
    
    <view class="card-body" @click="$emit('viewDetail', patient)">
      <view class="main-info">
        <text class="queue-number">{{ patient.queueNumber }}</text>
        <view class="patient-basic">
          <text class="name">{{ patient.name }}</text>
          <text class="sub-text">{{ patient.gender }} | {{ patient.age }}岁</text>
        </view>
      </view>
      <view class="symptoms" v-if="patient.symptoms">
        <text class="label">主诉：</text>
        <text class="content">{{ patient.symptoms }}</text>
      </view>
    </view>

    <view class="card-actions">
      <u-button 
        type="error" 
        text="过号" 
        :customStyle="{width: '45%'}"
        @click="$emit('pass', patient)"
      ></u-button>
      <u-button 
        type="success" 
        text="下一位" 
        :customStyle="{width: '45%'}"
        @click="$emit('next', patient)"
      ></u-button>
    </view>
    
    <view class="view-queue-btn" @click="$emit('viewQueue')">
      <text>查看完整队列 ></text>
    </view>
  </view>
  <view class="empty-card" v-else>
    <u-empty mode="data" text="当前无就诊患者"></u-empty>
    <u-button 
      type="primary" 
      text="刷新队列" 
      :customStyle="{marginTop: '20px', width: '200px'}"
      @click="$emit('refresh')"
    ></u-button>
  </view>
</template>

<script setup>
defineProps({
  patient: {
    type: Object,
    default: null
  },
  nextPatient: {
    type: Object,
    default: null
  }
})

defineEmits(['viewDetail', 'pass', 'next', 'viewQueue', 'refresh'])
</script>

<style lang="scss" scoped>
.patient-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 30rpx;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    padding-bottom: 20rpx;
    border-bottom: 1px solid #f0f0f0;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      position: relative;
      padding-left: 20rpx;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 8rpx;
        height: 32rpx;
        background: #2979ff;
        border-radius: 4rpx;
      }
    }

    .next-info {
      font-size: 24rpx;
      color: #999;
    }
  }

  .card-body {
    margin-bottom: 40rpx;

    .main-info {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      .queue-number {
        font-size: 60rpx;
        font-weight: bold;
        color: #2979ff;
        margin-right: 30rpx;
      }

      .patient-basic {
        display: flex;
        flex-direction: column;

        .name {
          font-size: 36rpx;
          font-weight: bold;
          color: #333;
          margin-bottom: 8rpx;
        }

        .sub-text {
          font-size: 24rpx;
          color: #666;
        }
      }
    }

    .symptoms {
      background: #f8faff;
      padding: 20rpx;
      border-radius: 8rpx;
      font-size: 26rpx;
      
      .label {
        color: #666;
      }
      
      .content {
        color: #333;
      }
    }
  }

  .card-actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
  }

  .view-queue-btn {
    text-align: center;
    font-size: 24rpx;
    color: #999;
    padding-top: 20rpx;
  }
}

.empty-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 60rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}
</style>
