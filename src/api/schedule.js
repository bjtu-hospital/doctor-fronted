import { get } from '@/utils/request'
import { mockGetSchedules, mockGetWeekSchedules } from '../pages/schedule/schedule-mock'

// Mock 开关
const USE_MOCK = false

/**
 * 获取医生排班信息
 * @param {string} doctorId - 医生ID
 * @param {string} startDate - 开始日期 YYYY-MM-DD
 * @param {string} endDate - 结束日期 YYYY-MM-DD
 * @returns {code: 0, message: {schedules: array}}
 */
export function getSchedules(doctorId, startDate, endDate) {
  if (USE_MOCK) {
    return mockGetSchedules(startDate, endDate)
  }
  return get('/doctor/schedules', {
    start_date: startDate,
    end_date: endDate
  })
}

/**
 * 获取历史排班
 * @param {string} doctorId - 医生ID
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 */
export function getHistorySchedules(doctorId, page = 1, pageSize = 10) {
  if (USE_MOCK) {
    // 简单的 Mock 实现，返回空列表或模拟数据
    return Promise.resolve({
      code: 0,
      message: {
        total: 0,
        list: []
      }
    })
  }
  return get('/doctor/schedules/history', {
    page,
    page_size: pageSize
  })
}

/**
 * 获取指定周的排班
 * @param {string} doctorId - 医生ID
 * @param {number} weekOffset - 周偏移量（0=当前周，1=下一周，-1=上一周）
 */
export function getWeekSchedules(doctorId, weekOffset = 0) {
  if (USE_MOCK) {
    return mockGetWeekSchedules(weekOffset)
  }
  
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return getSchedules(doctorId, formatDate(startOfWeek), formatDate(endOfWeek))
}
