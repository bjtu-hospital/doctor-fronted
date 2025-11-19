import { get, post } from '@/utils/request'
import { workbenchAPI } from '../pages/workbench/workbench-mock'

const useMock = true

/**
 * 获取工作台数据
 * @param {string} scenario - Mock场景: 'notCheckin' | 'checkedIn' | 'checkoutPending'
 * @returns {code: 0, message: {doctor: object, shiftStatus: object, todayData: object, reminders: array, recentRecords: array}}
 */
export function getDashboardData(scenario = 'notCheckin') {
  if (useMock) return workbenchAPI.getDashboard(scenario)
  return get('/workbench/dashboard')
}

/**
 * 签到
 * @param {number} shiftId - 班次ID
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @returns {code: 0, message: {checkinTime: string, status: string, message: string, workDuration: string}}
 */
export function checkin(shiftId, latitude, longitude) {
  if (useMock) return workbenchAPI.checkin({ latitude, longitude, shiftId })
  return post('/workbench/checkin', { latitude, longitude, shiftId })
}

/**
 * 签退
 * @param {number} shiftId - 班次ID
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @returns {code: 0, message: {checkoutTime: string, workDuration: string, status: string, message: string}}
 */
export function checkout(shiftId, latitude, longitude) {
  if (useMock) return workbenchAPI.checkout({ latitude, longitude, shiftId })
  return post('/workbench/checkout', { latitude, longitude, shiftId })
}

/**
 * 获取班次
 * @param {number} doctorId - 医生ID
 * @param {string} date - 日期 YYYY-MM-DD
 * @returns {code: 0, message: {shifts: [{id, name, startTime, endTime, location, status}]}}
 */
export function getShifts(doctorId, date) {
  if (useMock) return workbenchAPI.getShifts({ doctorId, date })
  return get('/workbench/shifts', { doctorId, date })
}

/**
 * 获取接诊统计
 * @param {number} doctorId - 医生ID
 * @returns {code: 0, message: {pending: number, ongoing: number, completed: number, total: number}}
 */
export function getConsultationStats(doctorId) {
  if (useMock) return workbenchAPI.getConsultationStats({ doctorId })
  return get('/workbench/consultation-stats', { doctorId })
}

/**
 * 获取待办提醒
 * @param {number} doctorId - 医生ID
 * @returns {code: 0, message: {reminders: [{id, type, title, icon, time}]}}
 */
export function getReminders(doctorId) {
  if (useMock) return workbenchAPI.getReminders({ doctorId })
  return get('/workbench/reminders', { doctorId })
}

/**
 * 获取最近接诊记录
 * @param {number} doctorId - 医生ID
 * @param {number} limit - 数量限制，默认3
 * @returns {code: 0, message: {records: [{id, patientName, consultationTime, diagnosis}]}}
 */
export function getRecentConsultations(doctorId, limit = 3) {
  if (useMock) return workbenchAPI.getRecentConsultations({ doctorId, limit })
  return get('/workbench/recent-consultations', { doctorId, limit })
}
