<template>
  <view class="week-header-container" :style="{ paddingTop: headerPaddingTop + 'px' }">
    <view class="header-controls">
      <view class="control-side"></view>
      
      <view class="control-center">
        <view class="nav-btn" @tap="handlePrevWeek">
          <text class="nav-icon">❮</text>
        </view>
        <view class="date-info">
          <text class="week-text">第 {{ weekNumber }} 周</text>
          <text class="date-range">{{ displayDateRange }}</text>
        </view>
        <view class="nav-btn" @tap="handleNextWeek">
          <text class="nav-icon">❯</text>
        </view>
      </view>

      <view class="control-side right">
        <view class="today-btn" @tap="handleToday">
          <text>今天</text>
        </view>
      </view>
    </view>
    
    <view class="week-grid-header">
      <view class="time-axis-placeholder"></view>
      <view class="days-row">
        <view
          v-for="(day, index) in weekDays"
          :key="index"
          class="day-col"
          :class="{ active: isToday(day.date) }"
        >
          <text class="day-name">{{ day.name }}</text>
          <text class="day-date">{{ day.date.split('-')[2] }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'WeekHeader',
  props: {
    currentDate: {
      type: String,
      required: true // YYYY-MM-DD (周一的日期)
    }
  },
  data() {
    return {
      weekDays: [],
      headerPaddingTop: 0
    }
  },
  mounted() {
    this.initHeaderPadding()
  },
  computed: {
    displayDateRange() {
      if (this.weekDays.length === 0) return ''
      const start = this.weekDays[0].date
      const end = this.weekDays[6].date
      return `${start} ~ ${end}`
    },
    weekNumber() {
      const date = new Date(this.currentDate)
      const firstDay = new Date(date.getFullYear(), 0, 1)
      const days = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000))
      return Math.ceil((days + firstDay.getDay() + 1) / 7)
    }
  },
  watch: {
    currentDate: {
      handler() {
        this.updateWeekDays()
      },
      immediate: true
    }
  },
  methods: {
    updateWeekDays() {
      const date = new Date(this.currentDate)
      // 确保 currentDate 是周一
      const dayOfWeek = date.getDay() || 7
      const startOfWeek = new Date(date)
      startOfWeek.setDate(date.getDate() - dayOfWeek + 1)

      const weekDays = []
      const weekNames = ['一', '二', '三', '四', '五', '六', '日']

      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek)
        currentDay.setDate(startOfWeek.getDate() + i)
        
        const year = currentDay.getFullYear()
        const month = String(currentDay.getMonth() + 1).padStart(2, '0')
        const day = String(currentDay.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`

        weekDays.push({
          name: weekNames[i],
          date: dateStr
        })
      }

      this.weekDays = weekDays
    },
    isToday(dateStr) {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const todayStr = `${year}-${month}-${day}`
      return dateStr === todayStr
    },
    handlePrevWeek() {
      const date = new Date(this.currentDate)
      date.setDate(date.getDate() - 7)
      this.emitChange(date)
    },
    handleNextWeek() {
      const date = new Date(this.currentDate)
      date.setDate(date.getDate() + 7)
      this.emitChange(date)
    },
    handleToday() {
      const today = new Date()
      // 确保返回的是本周一的日期
      const day = today.getDay() || 7
      today.setDate(today.getDate() - day + 1)
      this.emitChange(today)
    },
    emitChange(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      this.$emit('week-change', `${year}-${month}-${day}`)
    },
    initHeaderPadding() {
      let paddingTop = 8
      // #ifdef MP-WEIXIN
      try {
        const menuButton = uni.getMenuButtonBoundingClientRect()
        if (menuButton) {
          // 胶囊底部 + 更小的留白
          paddingTop = menuButton.bottom + 4
        }
      } catch (e) {
        console.error('获取胶囊位置失败', e)
      }
      // #endif

      // #ifndef MP-WEIXIN
      const sysInfo = uni.getSystemInfoSync()
      paddingTop = (sysInfo.statusBarHeight || 20) + 8
      // #endif

      this.headerPaddingTop = paddingTop
    },
  }
}
</script>

<style lang="scss" scoped>
.week-header-container {
  background: #fff;
  padding-top: 0;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 24rpx 16rpx;
}

.control-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
}

.date-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .week-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #1d2b53;
  }
  
  .date-range {
    font-size: 20rpx;
    color: #8a96ad;
    margin-top: 4rpx;
  }
}

.nav-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  .nav-icon {
    font-size: 24rpx;
    color: #5c6475;
    margin-top: 2rpx;
  }
  
  &:active {
    background: #e8f3ff;
    transform: scale(0.95);
    .nav-icon { color: #2979ff; }
  }
}

.control-side {
  width: 100rpx;
  display: flex;
  
  &.right {
    justify-content: flex-end;
  }
}

.today-btn {
  padding: 8rpx 24rpx;
  background: rgba(41, 121, 255, 0.1);
  border-radius: 28rpx;
  
  text {
    font-size: 24rpx;
    color: #2979ff;
    font-weight: 600;
  }
  
  &:active {
    opacity: 0.7;
  }
}

.week-grid-header {
  display: flex;
  padding-bottom: 12rpx;
}

.time-axis-placeholder {
  width: 80rpx;
  flex-shrink: 0;
}

.days-row {
  flex: 1;
  display: flex;
  justify-content: space-around;
}

.day-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  padding: 8rpx 0;
  border-radius: 8rpx;

  &.active {
    background: #e8f3ff;
    
    .day-name, .day-date {
      color: #2979ff;
      font-weight: 600;
    }
  }

  .day-name {
    font-size: 22rpx;
    color: #8a96ad;
  }

  .day-date {
    font-size: 26rpx;
    color: #1d2b53;
    font-weight: 500;
  }
}
</style>

