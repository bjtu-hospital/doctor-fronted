import { get } from '@/utils/request'
import { mockGetSchedules, mockGetWeekSchedules } from '../pages/schedule/schedule-mock'

// Mock 开关
const USE_MOCK = false

/**
 * 获取医生排班信息
 * @param {string} doctorId - 医生ID
 * @param {number} weekOffset - 周偏移量（0=当前周，1=下一周，-1=上一周）
 * @returns {Promise} 返回格式: {
 *   code: 0,
 *   message: {
 *     schedules: [{
 *       schedule_id: number,        // 排班ID
 *       doctor_id: number,          // 医生ID
 *       doctor_name: string,        // 医生姓名
 *       clinic_id: number,          // 诊室ID
 *       clinic_name: string,        // 诊室名称
 *       clinic_type: number,        // 诊室类型 (0:普通, 1:国疗, 2:特需)
 *       date: string,               // 日期 YYYY-MM-DD
 *       week_day: number,           // 星期几 (1-7)
 *       time_section: string,       // 时段 (上午/下午/晚上)
 *       slot_type: string,          // 号源类型 (专家/特需/普通)
 *       total_slots: number,        // 总号源数
 *       remaining_slots: number,    // 剩余号源数
 *       status: string,             // 状态 (正常/暂停/取消)
 *       price: number               // 挂号费用
 *     }]
 *   }
 * }
 */
export function getSchedules(doctorId, weekOffset = 0) {
  if (USE_MOCK) {
    return mockGetSchedules(doctorId, weekOffset)
  }
  
  // 计算指定周的开始和结束日期
  const today = new Date()
  const startOfWeek = new Date(today)
  const day = today.getDay() || 7 // 周日为7
  startOfWeek.setDate(today.getDate() - day + 1 + weekOffset * 7)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return get('/doctor/schedules', {
    start_date: formatDate(startOfWeek),
    end_date: formatDate(endOfWeek)
  })
}

/**
 * 获取指定周的排班（别名函数）
 * @param {string} doctorId - 医生ID
 * @param {number} weekOffset - 周偏移量（0=当前周，1=下一周，-1=上一周）
 * @returns {Promise} 返回排班数据，格式同 getSchedules
 */
export function getWeekSchedules(doctorId, weekOffset = 0) {
  if (USE_MOCK) {
    return mockGetWeekSchedules(doctorId, weekOffset)
  }
  return getSchedules(doctorId, weekOffset)
}
