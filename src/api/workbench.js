import { get, post } from '@/utils/request'
import { workbenchAPI } from '../pages/workbench/workbench-mock'

// 根据需要切换是否使用 Mock 数据
const useMock = false

/**
 * 获取工作台仪表盘数据
 * 后端：GET /doctor/workbench/dashboard
 * @param {string} scenario - Mock 场景: 'notCheckin' | 'checkedIn' | 'checkoutPending'
 * @returns {code: 0, message: {doctor, shiftStatus, todayData, reminders, recentRecords}}
 */
export function getDashboardData(scenario = 'notCheckin') {
  if (useMock) return workbenchAPI.getDashboard(scenario)
  return get('/doctor/workbench/dashboard')
}

/**
 * 签到
 * 后端：POST /doctor/workbench/checkin
 * @param {number} shiftId 班次ID
 * @param {number} latitude 纬度
 * @param {number} longitude 经度
 * @returns {code: 0, message: {checkinTime, status, message, workDuration}}
 */
export function checkin(shiftId, latitude, longitude) {
  if (useMock) return workbenchAPI.checkin({ latitude, longitude, shiftId })
  return post('/doctor/workbench/checkin', { shiftId, latitude, longitude })
}

/**
 * 签退
 * 后端：POST /doctor/workbench/checkout
 * @param {number} shiftId 班次ID
 * @param {number} latitude 纬度
 * @param {number} longitude 经度
 * @returns {code: 0, message: {checkoutTime, workDuration, status, message}}
 */
export function checkout(shiftId, latitude, longitude) {
  if (useMock) return workbenchAPI.checkout({ latitude, longitude, shiftId })
  return post('/doctor/workbench/checkout', { shiftId, latitude, longitude })
}

/**
 * 获取排班班次列表
 * 后端：GET /doctor/workbench/shifts?doctorId=&date_str=
 * @param {number} doctorId 医生ID
 * @param {string} dateStr 日期 YYYY-MM-DD (对应后端参数 date_str)
 * @returns {code: 0, message: {shifts: [{id,name,startTime,endTime,location,status}]}}
 */
export function getShifts(doctorId, dateStr) {
  if (useMock) return workbenchAPI.getShifts({ doctorId, date: dateStr })
  return get('/doctor/workbench/shifts', { doctorId, date_str: dateStr })
}

/**
 * 获取接诊统计
 * 后端：GET /doctor/workbench/consultation-stats?doctorId=
 * @param {number} doctorId 医生ID
 * @returns {code: 0, message: {pending, ongoing, completed, total}}
 */
export function getConsultationStats(doctorId) {
  if (useMock) return workbenchAPI.getConsultationStats({ doctorId })
  return get('/doctor/workbench/consultation-stats', { doctorId })
}

/**
 * 获取最近接诊记录
 * 后端：GET /doctor/workbench/recent-consultations?doctorId=&limit=
 * @param {number} doctorId 医生ID
 * @param {number} limit 返回条数，默认3
 * @returns {code: 0, message: {records: [{id,patientName,consultationTime,diagnosis}]}}
 */
export function getRecentConsultations(doctorId, limit = 3) {
  if (useMock) return workbenchAPI.getRecentConsultations({ doctorId, limit })
  return get('/doctor/workbench/recent-consultations', { doctorId, limit })
}

/**
 * 获取考勤历史记录
 * 后端：GET /doctor/workbench/attendance-records?doctorId=&start_date=&end_date=&page=&page_size=
 * @param {number} doctorId 医生ID
 * @param {string} startDate 开始日期 YYYY-MM-DD
 * @param {string} endDate 结束日期 YYYY-MM-DD
 * @param {number} page 页码，默认1
 * @param {number} pageSize 每页数量，默认20 (对应后端 page_size)
 * @returns {code: 0, message: {records: [{record_id,schedule_id,checkin_time,checkout_time,work_duration_minutes,status,created_at}], total}}
 */
export function getAttendanceRecords(doctorId, startDate, endDate, page = 1, pageSize = 20) {
  if (useMock) {
    // Mock 不一定实现，按需要扩展。这里复用 dashboard / shifts 数据组合或返回空结构
    return Promise.resolve({
      code: 0,
      message: {
        records: [],
        total: 0
      }
    })
  }
  return get('/doctor/workbench/attendance-records', {
    doctorId,
    start_date: startDate,
    end_date: endDate,
    page,
    page_size: pageSize
  })
}

/**
 * 提醒：后端未提供单独 /reminders 接口，提醒数据包含在 dashboard 返回中。
 * 若已有调用处使用该函数，可临时返回 dashboard 中的 reminders（Mock 模式支持）。
 * 生产环境建议直接使用 getDashboardData().
 * @deprecated 请改用 getDashboardData。
 */
export async function getReminders(doctorId) {
  if (useMock) return workbenchAPI.getReminders({ doctorId })
  const dashboard = await getDashboardData()
  return { code: 0, message: { reminders: dashboard?.message?.reminders || [] } }
}
