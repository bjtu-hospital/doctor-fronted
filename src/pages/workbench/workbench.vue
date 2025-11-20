<template>
  <view class="workbench-container">
    <scroll-view
      class="page-content"
      scroll-y
      @scrolltolower="onReachBottom"
    >
      <!-- 开发环境时间模拟器 -->
      <view v-if="showTimeSimulator" class="time-simulator">
        <text class="simulator-title">🕒 时间模拟器（仅开发）</text>
        <view class="simulator-controls">
          <input 
            class="time-input" 
            type="text" 
            v-model="simulatedTime" 
            placeholder="HH:mm 如 08:00"
          />
          <button class="sim-btn" size="mini" @tap="applySimulatedTime">应用</button>
          <button class="sim-btn reset" size="mini" @tap="resetSimulatedTime">重置</button>
        </view>
        <text class="simulator-hint">当前模拟: {{ simulatedTime || '实际时间' }}</text>
      </view>

      <!-- 问候区 -->
      <GreetingSection :doctor-name="doctorInfo.name" />

      <!-- 班次卡片 -->
      <ShiftCard
        :status="currentShiftData.status"
        :shift-info="currentShiftData.shiftInfo"
        :checkin-time="currentShiftData.checkinTime"
        :checkout-time="currentShiftData.checkoutTime"
        :work-duration="currentShiftData.workDuration"
        :time-to-checkout="currentShiftData.timeToCheckout"
        :countdown="countdown"
        :location-loading="locationInfo.loading"
        :signed-in="isSignedIn"
        :signed-out="isSignedOut"
        :shift-date="currentShiftDate"
        :simulated-time="simulatedTime"
        :key="`shift-${currentShiftData.status}-${currentShiftDate}-${simulatedTime}`"
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
import { useAuthStore } from '@/store/auth'

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

      // 班次列表（独立接口返回）
      shifts: [],

      // 接诊统计（独立接口返回）
      consultationStats: {
        pending: 0,
        ongoing: 0,
        completed: 0,
        total: 0
      },

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

      // 加载状态
      loading: false,
      
      // 当前班次日期（用于跨天判断）
      currentShiftDate: '',

      // 开发环境时间模拟（用于测试）
      simulatedTime: null, // 格式: 'HH:mm' 或 null
      showTimeSimulator: process.env.NODE_ENV === 'development'
    }
  },

  computed: {
    // 当前班次数据（根据时间智能选择）
    currentShiftData() {
      // 如果有 shifts 数据，根据当前时间选择应显示的班次
      if (this.shifts && this.shifts.length > 0) {
        const selectedShift = this.selectCurrentShift(this.shifts)
        if (selectedShift) {
          return {
            status: this.mapShiftStatus(selectedShift.status),
            shiftInfo: {
              id: selectedShift.id,
              name: selectedShift.name,
              startTime: selectedShift.startTime,
              endTime: selectedShift.endTime,
              location: selectedShift.location
            },
            checkinTime: selectedShift.status === 'checked_in' || selectedShift.status === 'checkout_pending' || selectedShift.status === 'checked_out' ? selectedShift.startTime : '',
            checkoutTime: selectedShift.status === 'checked_out' ? selectedShift.endTime : '',
            workDuration: '',
            timeToCheckout: ''
          }
        }
      }
      // 否则使用 dashboard 接口返回的数据
      return {
        status: this.shiftStatus.status,
        shiftInfo: this.shiftStatus.currentShift,
        checkinTime: this.shiftStatus.checkinTime,
        checkoutTime: this.shiftStatus.checkoutTime,
        workDuration: this.shiftStatus.workDuration,
        timeToCheckout: this.shiftStatus.timeToCheckout
      }
    },
    // 是否已签到
    isSignedIn() {
      const status = this.currentShiftData.status
      return status === 'checked_in' || 
             status === 'checkout_pending' || 
             status === 'checked_out'
    },
    // 是否已签退
    isSignedOut() {
      return this.currentShiftData.status === 'checked_out'
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
    // 初始化当前班次日期为今天
    this.currentShiftDate = this.formatDate(new Date())
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
        const response = await getDashboardData()
        if (response && response.code === 0) {
          const data = response.message
          this.doctorInfo = data.doctor
          this.shiftStatus = data.shiftStatus
          this.todayData = data.todayData
          this.reminders = data.reminders
          this.recentRecords = data.recentRecords
          this.updateCountdown()

          // 同步排班ID到全局Store
          const authStore = useAuthStore()
          if (data.shiftStatus && data.shiftStatus.currentShift && data.shiftStatus.currentShift.id) {
            authStore.setScheduleId(data.shiftStatus.currentShift.id)
          } else {
            // 如果没有当前排班（如未签到），可以考虑清除或保留上次的
            // authStore.setScheduleId(null) 
          }
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
     * 加载附加数据：班次列表 + 接诊统计 + 最近接诊记录（独立接口）
     */
    async loadAdditionalData(doctorId) {
      console.log('[Workbench] 开始加载附加数据 doctorId=', doctorId)
      try {
        const dateStr = this.formatDate(new Date())
        const [shiftsRes, statsRes, recentRes] = await Promise.all([
          getShifts(doctorId, dateStr),
          getConsultationStats(doctorId),
          getRecentConsultations(doctorId, 5)
        ])

        console.log('[Workbench] shifts raw:', shiftsRes)
        console.log('[Workbench] consultation-stats raw:', statsRes)
        console.log('[Workbench] recent-consultations raw:', recentRes)

        if (shiftsRes?.code === 0) {
          this.shifts = shiftsRes.message?.shifts || []
          // 更新 currentShiftDate 为班次日期
          if (this.shifts.length > 0) {
            // 假设所有班次日期相同，使用第一个班次的日期（或传入的 dateStr）
            this.currentShiftDate = dateStr
          }
        }
        if (statsRes?.code === 0) {
          // 后端定义为 pending/ongoing/completed/total
          this.consultationStats = {
            pending: statsRes.message?.pending || 0,
            ongoing: statsRes.message?.ongoing || 0,
            completed: statsRes.message?.completed || 0,
            total: statsRes.message?.total || 0
          }
          // 可同步到 todayData 若希望实时覆盖仪表盘统计
          this.todayData = {
            pendingConsultation: this.consultationStats.pending,
            ongoingConsultation: this.consultationStats.ongoing,
            completedConsultation: this.consultationStats.completed,
            totalConsultation: this.consultationStats.total
          }
        }
        if (recentRes?.code === 0) {
          const records = recentRes.message?.records || []
          // 用接口最新数据覆盖仪表盘中的 recentRecords
          this.recentRecords = records
        }
      } catch (e) {
        console.error('[Workbench] 附加数据加载失败:', e)
        uni.showToast({ title: '附加数据加载失败', icon: 'none' })
      }
    },

    /**
     * 格式化日期为 YYYY-MM-DD
     */
    formatDate(date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },

    /**
     * 根据当前时间选择应显示的班次
     */
    selectCurrentShift(shifts) {
      if (!shifts || shifts.length === 0) return null
      if (shifts.length === 1) return shifts[0]

      // 使用模拟时间或实际时间
      let currentTime
      if (this.simulatedTime && /^\d{2}:\d{2}$/.test(this.simulatedTime)) {
        const [h, m] = this.simulatedTime.split(':').map(Number)
        currentTime = h * 60 + m
      } else {
        const now = new Date()
        currentTime = now.getHours() * 60 + now.getMinutes()
      }

      // 将班次按开始时间排序
      const sortedShifts = [...shifts].sort((a, b) => {
        const [aH, aM] = a.startTime.split(':').map(Number)
        const [bH, bM] = b.startTime.split(':').map(Number)
        return (aH * 60 + aM) - (bH * 60 + bM)
      })

      // 1. 优先查找已签到但未签退的班次
      const activeShift = sortedShifts.find(s => 
        s.status === 'checked_in' || s.status === 'checkout_pending'
      )
      if (activeShift) return activeShift

      // 2. 查找当前时间段内的班次（开始前30分钟到结束后2小时）
      for (const shift of sortedShifts) {
        const [startH, startM] = shift.startTime.split(':').map(Number)
        const [endH, endM] = shift.endTime.split(':').map(Number)
        const startTime = startH * 60 + startM
        const endTime = endH * 60 + endM
        const allowStart = startTime - 30 // 开始前30分钟
        const allowEnd = endTime + 120 // 结束后2小时

        if (currentTime >= allowStart && currentTime <= allowEnd) {
          return shift
        }
      }

      // 3. 如果当前时间在所有班次之前，返回第一个班次
      const firstShiftStart = (() => {
        const [h, m] = sortedShifts[0].startTime.split(':').map(Number)
        return h * 60 + m - 30
      })()
      if (currentTime < firstShiftStart) {
        return sortedShifts[0]
      }

      // 4. 如果当前时间在所有班次之后，返回最后一个班次
      return sortedShifts[sortedShifts.length - 1]
    },

    /**
     * 映射后端班次状态到前端状态
     */
    mapShiftStatus(backendStatus) {
      // 后端状态: not_started, checked_in, checkout_pending, checked_out
      // 前端状态: not_checkin, checked_in, checkout_pending, checked_out
      const statusMap = {
        'not_started': 'not_checkin',
        'checked_in': 'checked_in',
        'checkout_pending': 'checkout_pending',
        'checked_out': 'checked_out'
      }
      return statusMap[backendStatus] || 'not_checkin'
    },

    /**
     * 更新倒计时文本
     */
    updateCountdown() {
      const shiftData = this.currentShiftData
      if (shiftData.status === 'not_checkin' && shiftData.shiftInfo) {
        const startTime = shiftData.shiftInfo.startTime
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
          // 保存 scheduleId 到 store，供接诊页面使用
          this.authStore.setScheduleId(shiftId)
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
     * 应用模拟时间
     */
    applySimulatedTime() {
      if (!this.simulatedTime) {
        uni.showToast({ title: '请输入时间', icon: 'none' })
        return
      }
      if (!/^\d{2}:\d{2}$/.test(this.simulatedTime)) {
        uni.showToast({ title: '格式错误，请使用 HH:mm', icon: 'none' })
        return
      }
      uni.showToast({ 
        title: `已应用模拟时间: ${this.simulatedTime}`, 
        icon: 'success' 
      })
      // 强制刷新卡片显示
      this.$forceUpdate()
    },

    /**
     * 重置模拟时间
     */
    resetSimulatedTime() {
      this.simulatedTime = null
      uni.showToast({ title: '已重置为实际时间', icon: 'success' })
      this.$forceUpdate()
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

.time-simulator {
  margin: 0 24rpx 24rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);

  .simulator-title {
    font-size: 26rpx;
    font-weight: 700;
    display: block;
    margin-bottom: 16rpx;
  }

  .simulator-controls {
    display: flex;
    gap: 12rpx;
    align-items: center;
    margin-bottom: 12rpx;
  }

  .time-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.2);
    border: 1rpx solid rgba(255, 255, 255, 0.3);
    border-radius: 8rpx;
    padding: 12rpx 16rpx;
    color: #fff;
    font-size: 24rpx;

    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
  }

  .sim-btn {
    background: rgba(255, 255, 255, 0.9);
    color: #667eea;
    border: none;
    border-radius: 8rpx;
    padding: 0 24rpx;
    height: 56rpx;
    line-height: 56rpx;
    font-size: 22rpx;
    font-weight: 600;

    &.reset {
      background: rgba(255, 255, 255, 0.3);
      color: #fff;
    }
  }

  .simulator-hint {
    font-size: 20rpx;
    opacity: 0.85;
    display: block;
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
