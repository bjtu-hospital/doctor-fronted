<template>
  <view class="workbench-container">
    <scroll-view
      class="page-content"
      scroll-y
      @scrolltolower="onReachBottom"
    >
      <!-- 场景预览切换（仅开发环境可见） -->
      <view v-if="showScenarioPanel" class="scenario-panel">
        <text class="scenario-title">状态预览（仅开发调试）</text>
        <view class="scenario-buttons">
          <button
            v-for="option in scenarioOptions"
            :key="option.value"
            class="scenario-btn"
            size="mini"
            :class="{ active: currentScenario === option.value }"
            @tap="switchScenario(option.value)"
          >
            {{ option.label }}
          </button>
        </view>
      </view>

      <!-- 问候区 -->
      <GreetingSection :doctor-name="doctorInfo.name" />

      <!-- 班次卡片 -->
      <ShiftCard
        :status="shiftStatus.status"
        :shift-info="shiftStatus.currentShift"
        :checkin-time="shiftStatus.checkinTime"
        :checkout-time="shiftStatus.checkoutTime"
        :work-duration="shiftStatus.workDuration"
        :time-to-checkout="shiftStatus.timeToCheckout"
        :countdown="countdown"
        :location-loading="locationInfo.loading"
        :key="`shift-${shiftStatus.status}`"
        @checkin="handleCheckin"
        @checkout="handleCheckout"
        @refresh-location="handleRefreshLocation"
      />

      <!-- 今日数据看板 -->
      <DashboardSection :data="todayData" />

      <!-- 快捷操作区 -->
      <ShortcutsSection />

      <!-- 待办提醒区 -->
      <RemindersSection :reminders="reminders" />

      <!-- 最近接诊记录 -->
      <RecentRecordsSection :records="recentRecords" />

      <!-- 底部留白（给原生 TabBar 腾出空间） -->
      <view class="bottom-spacer"></view>
    </scroll-view>
  </view>
</template>

<script>
import GreetingSection from './components/GreetingSection.vue'
import ShiftCard from './components/ShiftCard.vue'
import DashboardSection from './components/DashboardSection.vue'
import ShortcutsSection from './components/ShortcutsSection.vue'
import RemindersSection from './components/RemindersSection.vue'
import RecentRecordsSection from './components/RecentRecordsSection.vue'
import { getDashboardData, checkin, checkout } from '@/api/workbench'

export default {
  name: 'WorkbenchPage',
  components: {
    GreetingSection,
    ShiftCard,
    DashboardSection,
    ShortcutsSection,
    RemindersSection,
    RecentRecordsSection
  },
  data() {
    return {
      // 医生信息
      doctorInfo: {
        id: null,
        name: '',
        title: '',
        department: '',
        photo_path: ''
      },

      // 班次信息
      shiftStatus: {
        status: 'not_checkin',
        currentShift: null,
        checkinTime: '',
        checkoutTime: '',
        workDuration: '',
        timeToCheckout: ''
      },

      // 今日数据
      todayData: {
        pendingConsultation: 0,
        ongoingConsultation: 0,
        completedConsultation: 0,
        totalConsultation: 0
      },

      // 待办提醒
      reminders: [],

      // 最近接诊记录
      recentRecords: [],

      // 倒计时
      countdown: '',

      // 定位信息
      locationInfo: {
        latitude: null,
        longitude: null,
        loading: false,
        updatedAt: null,
        accuracy: null,
        error: null
      },

      // 开发场景控制
      showScenarioPanel: process.env.NODE_ENV !== 'production',
      scenarioOptions: [
        { label: '未签到', value: 'notCheckin' },
        { label: '已签到', value: 'checkedIn' },
        { label: '待签退', value: 'checkoutPending' },
        { label: '已签退', value: 'checkedOut' }
      ],

      // 加载状态
      loading: false,
      currentScenario: 'notCheckin' // Mock 场景选择
    }
  },

  watch: {
    shiftStatus: {
      handler(newVal) {
        // 监听班次状态变化，用于刷新
      },
      deep: true
    }
  },

  mounted() {
    // 页面加载时获取工作台数据
    this.loadDashboardData()
    // 首次进入页面立即获取一次定位
    this.fetchLocation()

    // 定时刷新倒计时（每分钟）
    this.countdownInterval = setInterval(() => {
      this.updateCountdown()
    }, 60000)
  },

  unmounted() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
    }
  },

  methods: {
    /**
     * 加载工作台首页数据
     */
    async loadDashboardData() {
      this.loading = true
      try {
        const response = await getDashboardData(this.currentScenario)
        if (response && response.code === 0) {
          const data = response.message
          this.doctorInfo = data.doctor
          this.shiftStatus = data.shiftStatus
          this.todayData = data.todayData
          this.reminders = data.reminders
          this.recentRecords = data.recentRecords
          this.updateCountdown()
        } else {
          uni.showToast({
            title: '数据加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载工作台数据失败:', error)
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新倒计时文本
     */
    updateCountdown() {
      if (this.shiftStatus.status === 'not_checkin' && this.shiftStatus.currentShift) {
        const startTime = this.shiftStatus.currentShift.startTime
        const [hour, minute] = startTime.split(':').map(Number)
        const now = new Date()
        const shiftStart = new Date()
        shiftStart.setHours(hour, minute, 0, 0)

        const diff = shiftStart - now
        if (diff > 0) {
          const minutes = Math.floor(diff / 60000)
          if (minutes > 0) {
            this.countdown = `距离开始还有 ${minutes} 分钟`
          } else {
            this.countdown = '即将开始'
          }
        } else {
          this.countdown = '班次已开始'
        }
      }
    },

    /**
     * 处理签到
     */
    async handleCheckin(shiftId) {
      const hasLocation = await this.ensureLocationReady(true)
      if (!hasLocation) {
        return
      }
      this.performCheckin(shiftId, this.locationInfo.latitude, this.locationInfo.longitude)
    },

    /**
     * 执行签到请求
     */
    async performCheckin(shiftId, latitude, longitude) {
      try {
        const response = await checkin(shiftId, latitude, longitude)
        if (response && response.code === 0) {
          const data = response.message || response.data
          uni.showToast({
            title: data?.message || '签到成功',
            icon: 'success'
          })
          // 更新场景为已签到
          this.currentScenario = 'checkedIn'
          // 刷新数据
          setTimeout(() => {
            this.loadDashboardData()
          }, 800)
        } else {
          uni.showToast({
            title: response.message || '签到失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('签到失败:', error)
        uni.showToast({
          title: '签到失败，请重试',
          icon: 'none'
        })
      }
    },

    /**
     * 处理签退
     */
    async handleCheckout(shiftId) {
      const hasLocation = await this.ensureLocationReady(true)
      if (!hasLocation) {
        return
      }
      this.performCheckout(shiftId, this.locationInfo.latitude, this.locationInfo.longitude)
    },

    /**
     * 执行签退请求
     */
    async performCheckout(shiftId, latitude, longitude) {
      try {
        const response = await checkout(shiftId, latitude, longitude)
        if (response && response.code === 0) {
          const data = response.message || response.data
          uni.showToast({
            title: data?.message || '签退成功',
            icon: 'success'
          })
          // 更新场景为待签退
          this.currentScenario = 'checkoutPending'
          // 刷新数据
          setTimeout(() => {
            this.loadDashboardData()
          }, 800)
        } else {
          uni.showToast({
            title: response.message || '签退失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('签退失败:', error)
        uni.showToast({
          title: '签退失败，请重试',
          icon: 'none'
        })
      }
    },

    /**
     * 获取设备定位
     * 注意：小程序环境需要用户授权
     */
    async handleRefreshLocation() {
      await this.fetchLocation(true)
    },

    async ensureLocationReady(fetchIfMissing = false) {
      if (
        this.locationInfo.latitude !== null &&
        this.locationInfo.longitude !== null &&
        !fetchIfMissing
      ) {
        return true
      }
      if (
        (this.locationInfo.latitude === null || this.locationInfo.longitude === null) ||
        fetchIfMissing
      ) {
        await this.fetchLocation(true)
      }
      if (this.locationInfo.latitude === null || this.locationInfo.longitude === null) {
        uni.showToast({ title: '无法获取定位，禁止操作', icon: 'none' })
        return false
      }
      return true
    },

    async fetchLocation(showToast = false) {
      if (this.locationInfo.loading) {
        return
      }
      this.locationInfo = { ...this.locationInfo, loading: true, error: null }
      try {
        const location = await this.obtainLocation()
        this.locationInfo = {
          ...this.locationInfo,
          latitude: location.latitude,
          longitude: location.longitude,
          loading: false,
          updatedAt: Date.now(),
          accuracy: location.accuracy || location.horizontalAccuracy || null,
          error: null
        }
        if (showToast) {
          uni.showToast({ title: '定位成功', icon: 'success' })
        }
      } catch (error) {
        console.warn('获取定位失败:', error)
        const message = error?.errMsg || error?.message || '定位失败，请检查权限'
        this.locationInfo = {
          ...this.locationInfo,
          loading: false,
          error: message
        }
        uni.showToast({ title: message, icon: 'none' })
      }
    },

    obtainLocation() {
      return new Promise((resolve, reject) => {
        uni.getLocation({
          type: 'wgs84',
          geocode: true,
          isHighAccuracy: true,
          highAccuracyExpireTime: 8000,
          success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude,
            accuracy: res.accuracy || res.horizontalAccuracy
          })
          },
          fail: (err) => {
            const needFallback = this.isCoordinateTranslationError(err) || this.isProviderMissing(err)
            if (needFallback) {
              this.getBrowserLocation().then(resolve).catch(reject)
            } else {
              reject(err)
            }
          }
        })
      })
    },

    getBrowserLocation() {
      return new Promise((resolve, reject) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          reject(new Error('当前环境不支持浏览器定位'))
          return
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy || null
            })
          },
          (error) => {
            reject(error)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        )
      })
    },

    isCoordinateTranslationError(error) {
      const msg = error?.errMsg || ''
      return msg.includes('translate coordinate') || msg.includes('map provider not configured')
    },

    isProviderMissing(error) {
      const msg = error?.errMsg || ''
      return msg.includes('provider not support') || msg.includes('map provider')
    },

    /**
     * 页面滚动到底部
     */
    onReachBottom() {
      // 可用于加载更多数据
    },

    /**
     * 切换模拟场景
     */
    switchScenario(scenario) {
      if (this.currentScenario === scenario) {
        return
      }
      this.currentScenario = scenario
      this.loadDashboardData()
    }
  }
}
</script>

<style lang="scss" scoped>
.workbench-container {
  width: 100%;
  height: 100vh;
  background: #f8faff;
  display: flex;
  flex-direction: column;
  position: relative;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  background: #f8faff;
  padding-top: 60rpx;
}

.scenario-panel {
  margin: 0 24rpx 24rpx;
  padding: 16rpx 20rpx;
  background: #fffbe6;
  border: 1rpx solid #ffe58f;
  border-radius: 16rpx;
  color: #8c6d1f;

  .scenario-title {
    font-size: 24rpx;
    font-weight: 600;
  }

  .scenario-buttons {
    margin-top: 12rpx;
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  .scenario-btn {
    background: #fff;
    border: 1rpx solid #ffd666;
    color: #8c6d1f;
    padding: 0 20rpx;
    height: 56rpx;
    line-height: 56rpx;
    border-radius: 12rpx;
    font-size: 22rpx;

    &.active {
      background: #ffd666;
      color: #5c4311;
      box-shadow: 0 4rpx 12rpx rgba(255, 214, 102, 0.5);
    }
  }
}

.bottom-spacer {
  height: 120rpx;
}

@media (max-width: 640px) {
  .page-content {
    font-size: 14px;
  }
}
</style>
