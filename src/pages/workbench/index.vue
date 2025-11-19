<template>
  <view class="workbench-container">
    <scroll-view
      class="page-content"
      scroll-y
      @scrolltolower="onReachBottom"
    >
      <!-- 问候区 -->
      <GreetingSection :doctor-name="doctorInfo.name" />

      <!-- 班次卡片 -->
      <ShiftCard
        :status="shiftStatus.status"
        :shift-info="shiftStatus.currentShift"
        :checkin-time="shiftStatus.checkinTime"
        :work-duration="shiftStatus.workDuration"
        :time-to-checkout="shiftStatus.timeToCheckout"
        :countdown="countdown"
        :key="`shift-${shiftStatus.status}`"
        @checkin="handleCheckin"
        @checkout="handleCheckout"
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
      // 需要先获取定位
      this.getLocation((lat, lng) => {
        this.performCheckin(shiftId, lat, lng)
      })
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
      // 需要先获取定位
      this.getLocation((lat, lng) => {
        this.performCheckout(shiftId, lat, lng)
      })
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
    getLocation(callback) {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          callback(res.latitude, res.longitude)
        },
        fail: (err) => {
          console.warn('获取定位失败:', err)
          // Mock 模式下使用假数据继续
          uni.showToast({
            title: '请开启定位权限',
            icon: 'none'
          })
          // 为了开发调试，使用默认坐标
          callback(39.9042, 116.4074)
        }
      })
    },

    /**
     * 页面滚动到底部
     */
    onReachBottom() {
      // 可用于加载更多数据
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

.bottom-spacer {
  height: 120rpx;
}

@media (max-width: 640px) {
  .page-content {
    font-size: 14px;
  }
}
</style>
