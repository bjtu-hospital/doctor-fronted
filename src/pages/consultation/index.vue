<template>
  <view class="consultation-page">
    <view class="placeholder">
      <text class="icon">👨‍⚕️</text>
      <text class="text">接诊页面</text>
      <text class="desc">（开发中...）</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ConsultationPage',
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.consultation-page {
  width: 100%;
  min-height: 100vh;
  background: #f8faff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 120rpx;

  .placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .icon {
      font-size: 120rpx;
      margin-bottom: 30rpx;
    }

    .text {
      font-size: 36rpx;
      color: #1d2b53;
      font-weight: 600;
      margin-bottom: 16rpx;
    }

    .desc {
      font-size: 24rpx;
      color: #8a96ad;
    }
  }
}
</style>
