<template>
  <view class="greeting-section">
    <view class="greeting-text">
      <text class="greeting">{{ greetingText }}，{{ doctorName }}</text>
      <text class="date">{{ currentDate }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'GreetingSection',
  props: {
    doctorName: {
      type: String,
      default: '医生'
    }
  },
  data() {
    return {
      currentTime: new Date(),
      currentDate: ''
    }
  },
  computed: {
    greetingText() {
      const hour = this.currentTime.getHours()
      if (hour >= 5 && hour < 12) {
        return '早上好'
      } else if (hour >= 12 && hour < 18) {
        return '下午好'
      } else {
        return '晚上好'
      }
    }
  },
  methods: {
    updateDateTime() {
      this.currentTime = new Date()
      this.updateDateText()
    },
    updateDateText() {
      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const week = weekDays[date.getDay()]
      this.currentDate = `${year}年${month}月${day}日 ${week}`
    }
  },
  mounted() {
    this.updateDateText()
    // 每分钟更新一次问候语（根据时间变化）
    setInterval(() => {
      this.updateDateTime()
    }, 60000)
  }
}
</script>

<style lang="scss" scoped>
.greeting-section {
  padding: 24rpx;
  background: #fff;
  padding-bottom: 24rpx;
}

.greeting-text {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.greeting {
  font-size: 32rpx;
  font-weight: 600;
  color: #1d2b53;
  letter-spacing: 1rpx;
}

.date {
  font-size: 24rpx;
  color: #8a96ad;
  font-weight: 400;
}
</style>
