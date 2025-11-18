<template>
  <scroll-view class="login-page" scroll-y>
    <view class="login-wrapper">
      <view class="mobile-frame">
        <view class="login-card">
          <view class="logo-wrapper">
            <image class="hospital-logo" src="/static/hospital_logo.png" mode="aspectFit"></image>
          </view>
          <text class="hospital-name">BJTU HOSPITAL</text>
          <text class="hospital-subtitle">医生工作系统</text>

          <view class="form-area">
            <view class="input-group">
              <text class="input-label">医生工号</text>
              <view class="input-wrapper">
                <view class="input-icon user-icon" />
                <input
                  class="form-input"
                  type="text"
                  v-model="form.username"
                  placeholder="请输入医生工号"
                  placeholder-class="placeholder"
                  confirm-type="next"
                />
              </view>
            </view>

            <view class="input-group">
              <text class="input-label">登录密码</text>
              <view class="input-wrapper">
                <view class="input-icon lock-icon" />
                <input
                  class="form-input"
                  type="text"
                  v-model="form.password"
                  :password="!passwordVisible"
                  placeholder="请输入登录密码"
                  placeholder-class="placeholder"
                  confirm-type="done"
                />
                <view
                  class="eye-toggle"
                  :class="{ 'is-visible': passwordVisible }"
                  @tap="togglePassword"
                >
                  <view class="eye-shape" />
                  <view class="eye-dot" />
                </view>
              </view>
            </view>

            <button
              class="login-button"
              type="default"
              :loading="loading"
              :disabled="loading"
              @tap="handleSubmit"
            >
              登录
            </button>

            <text class="form-hint">若忘记密码，请联系信息科管理员重置。</text>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        username: '',
        password: '',
      },
      passwordVisible: false,
      loading: false,
    }
  },
  methods: {
    togglePassword() {
      this.passwordVisible = !this.passwordVisible
    },
    handleSubmit() {
      if (!this.form.username.trim()) {
        uni.showToast({
          title: '请输入医生工号',
          icon: 'none',
        })
        return
      }
      if (!this.form.password.trim()) {
        uni.showToast({
          title: '请输入登录密码',
          icon: 'none',
        })
        return
      }
      this.loading = true
      // 模拟请求
      setTimeout(() => {
        this.loading = false
        uni.showToast({
          title: '登录成功',
          icon: 'success',
        })
      }, 1200)
    },
  },
}
</script>

<style lang="scss">
.login-page {
  min-height: 100vh;
  background: #f2f4f8;
}

.login-wrapper {
  width: 100%;
  min-height: 100vh;
  padding: 80rpx 30rpx 120rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-frame {
  width: 90vw;
  max-width: 700rpx;
  min-width: 320rpx;
  background: transparent;
  padding: 0;
}

.login-card {
  background: #ffffff;
  border-radius: 32rpx;
  padding: 60rpx 40rpx 50rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.logo-wrapper {
  width: 160rpx;
  height: 160rpx;
  border-radius: 24rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 80rpx;
  box-shadow: 0 12rpx 30rpx rgba(15, 27, 48, 0.08);
}

.hospital-logo {
  width: 160rpx;
  height: 160rpx;
  transform: scale(1.5);
}

.hospital-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #1d2b53;
  letter-spacing: 4rpx;
}

.hospital-subtitle {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #6d7b91;
}

.form-area {
  width: 100%;
  margin-top: 40rpx;
}

.input-group + .input-group {
  margin-top: 30rpx;
}

.input-label {
  font-size: 26rpx;
  color: #5c6475;
  margin-bottom: 12rpx;
  display: block;
}

.input-wrapper {
  width: 100%;
  background: #f7f9fc;
  border-radius: 24rpx;
  padding: 0 24rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 10rpx 30rpx rgba(15, 27, 48, 0.08);
  border: 2rpx solid transparent;
  transition: border 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.input-wrapper:focus-within {
  border-color: #87cefa;
  box-shadow: 0 12rpx 34rpx rgba(135, 206, 250, 0.4);
}

.input-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 16rpx;
  background: #e8f3ff;
  margin-right: 18rpx;
  position: relative;
}

.user-icon::before,
.user-icon::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: #87cefa;
}

.user-icon::before {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  top: 6rpx;
}

.user-icon::after {
  width: 28rpx;
  height: 12rpx;
  border-radius: 12rpx 12rpx 8rpx 8rpx;
  bottom: 8rpx;
}

.lock-icon::before,
.lock-icon::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: #87cefa;
}

.lock-icon::before {
  width: 28rpx;
  height: 18rpx;
  border-radius: 6rpx;
  bottom: 6rpx;
}

.lock-icon::after {
  width: 22rpx;
  height: 18rpx;
  border-radius: 40rpx 40rpx 0 0;
  top: 6rpx;
  border: 4rpx solid #87cefa;
  background: transparent;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #1d2b53;
}

.placeholder {
  color: #9aa3b5;
}

.eye-toggle {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #e8f3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10rpx;
  transition: background 0.2s ease;
  position: relative;
}

.eye-toggle.is-visible {
  background: #d1ecff;
}

.eye-shape {
  width: 32rpx;
  height: 18rpx;
  border: 2rpx solid #87cefa;
  border-radius: 18rpx / 10rpx;
  position: relative;
}

.eye-dot {
  width: 10rpx;
  height: 10rpx;
  background: #87cefa;
  border-radius: 50%;
  position: absolute;
}

.eye-toggle.is-visible .eye-dot {
  width: 10rpx;
  height: 10rpx;
}

.login-button {
  margin-top: 40rpx;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #87cefa, #6bb6ff);
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  box-shadow: 0 20rpx 40rpx rgba(135, 206, 250, 0.5);
}

.login-button:active {
  opacity: 0.9;
}

.form-hint {
  display: block;
  text-align: center;
  margin-top: 24rpx;
  font-size: 24rpx;
  color: #9aa3b5;
}

@media screen and (max-width: 480px) {
  .login-wrapper {
    align-items: flex-start;
    padding-top: 60rpx;
  }

  .mobile-frame {
    width: 100%;
    max-width: none;
  }
}
</style>

