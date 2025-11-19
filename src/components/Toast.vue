<template>
  <view v-if="visible" class="toast-container" :class="position">
    <view class="toast-wrapper" :class="[type, position]">
      <view v-if="icon" class="toast-icon">
        <text v-if="type === 'success'">✓</text>
        <text v-else-if="type === 'error'">✕</text>
        <text v-else-if="type === 'warning'">⚠</text>
        <text v-else-if="type === 'info'">ℹ</text>
        <text v-else>{{ icon }}</text>
      </view>
      <text class="toast-text">{{ message }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Toast',
  data() {
    return {
      visible: false,
      message: '',
      type: 'default',
      icon: '',
      position: 'center',
      duration: 2000,
      timer: null
    }
  },
  methods: {
    show(options) {
      if (typeof options === 'string') {
        this.message = options
        this.type = 'default'
      } else {
        this.message = options.message || ''
        this.type = options.type || 'default'
        this.icon = options.icon || ''
        this.position = options.position || 'center'
        this.duration = options.duration || 2000
      }

      this.visible = true

      if (this.timer) {
        clearTimeout(this.timer)
      }

      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          this.hide()
        }, this.duration)
      }
    },
    hide() {
      this.visible = false
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.toast-container {
  position: fixed;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 9999;
  pointer-events: none;

  &.top {
    top: 80rpx;
  }

  &.center {
    top: 50%;
    transform: translateY(-50%);
  }

  &.bottom {
    bottom: 120rpx;
  }
}

.toast-wrapper {
  max-width: 80%;
  min-width: 200rpx;
  padding: 24rpx 32rpx;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(10rpx);

  &.success {
    background: rgba(52, 199, 89, 0.95);
  }

  &.error {
    background: rgba(255, 59, 48, 0.95);
  }

  &.warning {
    background: rgba(255, 149, 0, 0.95);
  }

  &.info {
    background: rgba(48, 209, 88, 0.95);
  }
}

.toast-icon {
  font-size: 40rpx;
  color: #fff;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-text {
  font-size: 28rpx;
  color: #fff;
  line-height: 1.5;
  word-break: break-word;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
