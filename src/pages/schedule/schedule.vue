<template>
  <view class="schedule-page">
    <!-- 周选择器 -->
    <view class="week-header-wrapper">
      <WeekHeader
        :current-date="currentDate"
        @week-change="handleWeekChange"
      />
    </view>

    <!-- 课程表主体 -->
    <scroll-view class="schedule-grid" scroll-y="true">
      <!-- 上午行 -->
      <view class="grid-row">
        <view class="time-axis">
          <text class="time-text">1</text>
          <text class="time-label">08:00</text>
          <text class="time-label">12:00</text>
        </view>
        <view class="grid-cells">
          <view
            v-for="(day, index) in 7"
            :key="'am-' + index"
            class="grid-cell"
            :class="{ 'today-cell': isToday(index) }"
          >
            <ShiftItem
              v-if="getShift(index, 'morning')"
              :shift="getShift(index, 'morning')"
              @shift-click="handleShiftClick"
            />
          </view>
        </view>
      </view>

      <!-- 下午行 -->
      <view class="grid-row">
        <view class="time-axis">
          <text class="time-text">2</text>
          <text class="time-label">14:00</text>
          <text class="time-label">18:00</text>
        </view>
        <view class="grid-cells">
          <view
            v-for="(day, index) in 7"
            :key="'pm-' + index"
            class="grid-cell"
            :class="{ 'today-cell': isToday(index) }"
          >
            <ShiftItem
              v-if="getShift(index, 'afternoon')"
              :shift="getShift(index, 'afternoon')"
              @shift-click="handleShiftClick"
            />
          </view>
        </view>
      </view>

      <!-- 晚上行 -->
      <view class="grid-row" style="margin-bottom: 0;">
        <view class="time-axis">
          <text class="time-text">3</text>
          <text class="time-label">19:00</text>
          <text class="time-label">22:00</text>
        </view>
        <view class="grid-cells">
          <view
            v-for="(day, index) in 7"
            :key="'night-' + index"
            class="grid-cell"
            :class="{ 'today-cell': isToday(index) }"
          >
            <ShiftItem
              v-if="getShift(index, 'night')"
              :shift="getShift(index, 'night')"
              @shift-click="handleShiftClick"
            />
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 排班详情弹窗 -->
    <ShiftDetail
      :visible="detailVisible"
      :shift="selectedShift"
      @close="detailVisible = false"
    />
  </view>
</template>

<script>
import WeekHeader from './components/WeekHeader.vue'
import ShiftItem from './components/ShiftItem.vue'
import ShiftDetail from './components/ShiftDetail.vue'
import { getWeekSchedules } from '@/api/schedule'

export default {
  name: 'SchedulePage',
  components: {
    WeekHeader,
    ShiftItem,
    ShiftDetail
  },
  data() {
    return {
      doctorInfo: { id: null, name: '' },
      schedules: [], // 直接存储 API 返回的 schedules 数组
      currentDate: this.getTodayDate(), // 周一日期
      loading: false,
      detailVisible: false,
      selectedShift: null,
      weekDates: [] // 存储当前周的7天日期字符串
    }
  },

  mounted() {
    const doctorInfo = uni.getStorageSync('doctorInfo')
    if (doctorInfo) {
      this.doctorInfo = doctorInfo
    }
    this.initWeek()
    this.loadSchedules()
  },
  methods: {
    getTodayDate() {
      const today = new Date()
      const day = today.getDay() || 7
      const monday = new Date(today)
      monday.setDate(today.getDate() - day + 1)
      
      const y = monday.getFullYear()
      const m = String(monday.getMonth() + 1).padStart(2, '0')
      const d = String(monday.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },

    getWeekOffset() {
      const today = new Date()
      const current = new Date(this.currentDate)
      
      // Reset to start of week (Monday) for both
      const todayDay = today.getDay() || 7
      const todayMonday = new Date(today)
      todayMonday.setDate(today.getDate() - todayDay + 1)
      todayMonday.setHours(0,0,0,0)

      const currentDay = current.getDay() || 7
      const currentMonday = new Date(current)
      currentMonday.setDate(current.getDate() - currentDay + 1)
      currentMonday.setHours(0,0,0,0)

      const diffTime = currentMonday - todayMonday
      const diffWeeks = Math.round(diffTime / (7 * 24 * 60 * 60 * 1000))
      
      return diffWeeks
    },

    initWeek() {
      // 确保从周一开始生成
      const date = new Date(this.currentDate)
      const dayOfWeek = date.getDay() || 7
      const start = new Date(date)
      start.setDate(date.getDate() - dayOfWeek + 1)

      const dates = []
      for(let i=0; i<7; i++) {
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        dates.push(`${y}-${m}-${day}`)
      }
      this.weekDates = dates
    },

    async loadSchedules() {
      this.loading = true
      try {
        const offset = this.getWeekOffset()
        const response = await getWeekSchedules(this.doctorInfo.id || '6', offset)
        
        if (response && response.code === 0) {
          // 直接使用 API 返回的 schedules 数组
          this.schedules = response.message.schedules || []
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    handleWeekChange(newDate) {
      this.currentDate = newDate
      this.initWeek()
      // 重新加载数据
      this.loadSchedules()
    },

    getShift(dayIndex, period) {
      const targetDate = this.weekDates[dayIndex]
      if (!targetDate || !this.schedules) return null
      
      // 将时段映射为中文
      const periodMap = {
        'morning': '上午',
        'afternoon': '下午',
        'night': '晚上'
      }
      const timeSectionChinese = periodMap[period]
      
      // 在 schedules 中查找匹配日期和时段的班次
      // 新格式中，schedules 是一个数组，每个元素就是一个排班
      return this.schedules.find(s => 
        s.date === targetDate && s.time_section === timeSectionChinese
      ) || null
    },

    handleShiftClick(shift) {
      this.selectedShift = shift
      this.detailVisible = true
    },

    isToday(index) {
      if (!this.weekDates[index]) return false
      const dateStr = this.weekDates[index]
      const today = new Date()
      const y = today.getFullYear()
      const m = String(today.getMonth() + 1).padStart(2, '0')
      const d = String(today.getDate()).padStart(2, '0')
      return dateStr === `${y}-${m}-${d}`
    }
  }
}
</script>

<style lang="scss" scoped>
.schedule-page {
  width: 100%;
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.week-header-wrapper {
  flex-shrink: 0;
}

.schedule-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24rpx 0;
  box-sizing: border-box;
  /* #ifdef MP-WEIXIN */
  /* 小程序中自动计算高度 */
  height: auto;
  /* #endif */
}

.grid-row {
  display: flex;
  min-height: 360rpx;
  margin-bottom: 32rpx;
}

.grid-row:last-child {
  margin-bottom: 24rpx;
}

.time-axis {
  width: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: #8a96ad;
  
  .time-text {
    font-size: 36rpx;
    font-weight: 600;
    color: #1d2b53;
    margin-bottom: 8rpx;
  }
  
  .time-label {
    font-size: 24rpx;
  }
}

.grid-cells {
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  padding-right: 12rpx;
}

.grid-cell {
  flex: 1;
  min-height: 100%;
  margin: 0 6rpx;
  background: #fafafa;
  border-radius: 16rpx;
  position: relative;
  
  /* 虚线边框效果 */
  border: 2rpx dashed #e8e8e8;
  transition: all 0.3s ease;

  &:hover {
    background: #f5f7fa;
    border-color: #d9d9d9;
  }

  &.today-cell {
    background: #f0f9ff;
    border-color: #bae7ff;
    border-style: solid;
  }
}

</style>
