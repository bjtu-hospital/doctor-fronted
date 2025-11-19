<template>
  <view class="profile-page">
    <view class="placeholder">
      <text class="icon">👤</text>
      <text class="text">个人中心</text>
      <text class="desc">（开发中...）</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ProfilePage',
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.profile-page {
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
