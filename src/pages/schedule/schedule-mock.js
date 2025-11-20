/**
 * 排班页面 Mock 数据
 * 包含医生在指定日期范围内的所有排班信息
 */

/**
 * 生成模拟排班数据
 * @param {string} startDate - 开始日期 YYYY-MM-DD
 * @param {string} endDate - 结束日期 YYYY-MM-DD
 * @returns {Promise} 返回排班数据
 */
export function mockGetSchedules(startDate, endDate) {
  const start = new Date(startDate)
  const schedules = []
  const weekNames = ['日', '一', '二', '三', '四', '五', '六']

  // 生成7天的数据
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(start)
    currentDate.setDate(start.getDate() + i)
    
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const day = String(currentDate.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    const dayOfWeek = weekNames[currentDate.getDay()]

    const shifts = []
    
    // 移除随机性，确保周一至周五都有排班
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      // 上午班次 - 每天都有
      shifts.push({
        id: i * 10 + 1,
        name: '上午门诊',
        period: 'morning',
        startTime: '08:00',
        endTime: '11:30',
        location: '门诊 3 诊室',
        department: '心内科',
        status: 'scheduled',
        capacity: 30,
        registered: 15 + (i % 5), // 伪随机但固定
        consultationCount: 5 + (i % 3)
      })
      
      // 下午班次 - 周三下午休息，其他时间有
      if (currentDate.getDay() !== 3) {
        shifts.push({
          id: i * 10 + 2,
          name: '下午门诊',
          period: 'afternoon',
          startTime: '14:00',
          endTime: '17:30',
          location: '门诊 3 诊室',
          department: '心内科',
          status: 'scheduled',
          capacity: 25,
          registered: 10 + (i % 4),
          consultationCount: 0
        })
      }

      // 晚上班次 - 周二、周四有
      if (currentDate.getDay() === 2 || currentDate.getDay() === 4) {
        shifts.push({
          id: i * 10 + 3,
          name: '晚间急诊',
          period: 'night',
          startTime: '19:00',
          endTime: '22:00',
          location: '急诊 1 诊室',
          department: '急诊科',
          status: 'scheduled',
          capacity: 20,
          registered: 5 + (i % 3),
          consultationCount: 0
        })
      }
    }

    schedules.push({
      id: i + 1,
      date: dateStr,
      dayOfWeek: dayOfWeek,
      shifts: shifts
    })
  }

  return Promise.resolve({
    code: 0,
    message: {
      startDate,
      endDate,
      doctorId: '10001',
      schedules
    }
  })
}

/**
 * 获取当前周的排班数据
 */
export function mockGetCurrentWeekSchedules() {
  const today = new Date()
  const startOfWeek = new Date(today)
  // 如果今天是周日(0)，则减去6天回到周一；否则减去 day-1
  const day = today.getDay() || 7
  startOfWeek.setDate(today.getDate() - day + 1)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return mockGetSchedules(formatDate(startOfWeek), formatDate(endOfWeek))
}

/**
 * 获取指定周的排班数据
 * @param {number} weekOffset - 周偏移量（0=当前周，1=下一周，-1=上一周）
 */
export function mockGetWeekSchedules(weekOffset = 0) {
  const today = new Date()
  const startOfWeek = new Date(today)
  const day = today.getDay() || 7
  startOfWeek.setDate(today.getDate() - day + 1 + weekOffset * 7)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return mockGetSchedules(formatDate(startOfWeek), formatDate(endOfWeek))
}
