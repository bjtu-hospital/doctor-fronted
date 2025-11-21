import { get } from '@/utils/request'
import { mockGetSchedules, mockGetWeekSchedules } from '../pages/schedule/schedule-mock'

// Mock 开关
const USE_MOCK = false

// 请求缓存
const requestCache = new Map()
// 缓存过期时间（5分钟）
const CACHE_EXPIRE_TIME = 5 * 60 * 1000
// 正在进行的请求（防止重复请求）
const pendingRequests = new Map()

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

  const startDate = formatDate(startOfWeek)
  const endDate = formatDate(endOfWeek)
  const cacheKey = `schedules_${doctorId}_${startDate}_${endDate}`
  
  // 检查缓存
  const cached = requestCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRE_TIME) {
    console.log('使用API缓存数据:', cacheKey)
    return Promise.resolve(cached.data)
  }
  
  // 检查是否有相同的请求正在进行
  if (pendingRequests.has(cacheKey)) {
    console.log('等待现有请求完成:', cacheKey)
    return pendingRequests.get(cacheKey)
  }

  // 发起新请求
  console.log('发起新API请求:', cacheKey)
  const requestPromise = get('/doctor/schedules', {
    start_date: startDate,
    end_date: endDate
  }).then(response => {
    // 缓存响应数据
    requestCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    })
    // 移除待处理请求
    pendingRequests.delete(cacheKey)
    return response
  }).catch(error => {
    // 移除待处理请求
    pendingRequests.delete(cacheKey)
    throw error
  })
  
  // 记录待处理请求
  pendingRequests.set(cacheKey, requestPromise)
  
  return requestPromise
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

/**
 * 清除排班缓存
 * @param {string} doctorId - 可选，指定医生ID则只清除该医生的缓存
 */
export function clearScheduleCache(doctorId = null) {
  if (doctorId) {
    // 清除指定医生的所有缓存
    const keysToDelete = []
    requestCache.forEach((value, key) => {
      if (key.includes(`_${doctorId}_`)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => requestCache.delete(key))
    console.log(`已清除医生 ${doctorId} 的缓存，共 ${keysToDelete.length} 条`)
  } else {
    // 清除所有缓存
    const size = requestCache.size
    requestCache.clear()
    console.log(`已清除所有排班缓存，共 ${size} 条`)
  }
}
