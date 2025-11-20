<template>
  <view class="tabbar-container">
    <view class="tabbar-wrapper">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        class="tabbar-item"
        :class="{ active: activeIndex === index }"
        @tap="handleTabClick(index, tab.path)"
      >
        <view class="tab-icon">{{ tab.icon }}</view>
        <text class="tab-label">{{ tab.label }}</text>
        <view
          v-if="tab.badge"
          class="tab-badge"
        >
          {{ tab.badge }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TabBar',
  props: {
    activeIndex: {
      type: Number,
      default: 0
    },
    badges: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      tabs: [
        {
          icon: '▦',
          label: '工作台',
          path: '/pages/workbench/workbench',
          badge: ''
        },
        {
          icon: '⊕',
          label: '接诊',
          path: '/pages/consultation/consultation',
          badge: ''
        },
        {
          icon: '☷',
          label: '排班',
          path: '/pages/schedule/schedule',
          badge: ''
        },
        {
          icon: '◎',
          label: '我的',
          path: '/pages/profile/profile',
          badge: ''
        }
      ]
    }
  },
  watch: {
    badges: {
      handler(newVal) {
        if (newVal && newVal.consultation) {
          this.tabs[1].badge = newVal.consultation
        }
      },
      deep: true
    }
  },
  mounted() {
    // 初始化徽章
    if (this.badges && this.badges.consultation) {
      this.tabs[1].badge = this.badges.consultation
    }
  },
  methods: {
    handleTabClick(index, path) {
      this.$emit('tab-change', index)
      // 使用 switchTab 切换标签页（Uni-app）
      uni.switchTab({
        url: path
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.tabbar-container {
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  /* 适配安全区域（iPhoneX等） */
  padding-bottom: max(0px, env(safe-area-inset-bottom));
}

.tabbar-wrapper {
  display: flex;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.04);
  height: 100rpx;
  align-items: center;
}

.tabbar-item {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  position: relative;
  color: #9aa3b5;
  transition: color 0.3s ease;

  &.active {
    color: #1d2b53;

    .tab-icon {
      color: #87cefa;
    }

    .tab-label {
      color: #1d2b53;
      font-weight: 600;
    }
  }

  .tab-icon {
    font-size: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s ease;
  }

  .tab-label {
    font-size: 20rpx;
    transition: all 0.3s ease;
  }

  .tab-badge {
    position: absolute;
    top: 10rpx;
    right: 16rpx;
    min-width: 32rpx;
    height: 32rpx;
    line-height: 32rpx;
    border-radius: 50%;
    background: #ff5252;
    color: #fff;
    font-size: 18rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8rpx;
  }
}
</style>
