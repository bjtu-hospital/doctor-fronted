import { get, post } from '@/utils/request'
import { workbenchAPI } from '../pages/workbench/workbench-mock'

const useMock = true

/**
 * 获取工作台数据
 * @returns {code: 0, message: {doctor, shiftStatus, todayData, reminders, recentRecords}}
 */
export function getDashboardData(scenario = 'notCheckin') {
  if (useMock) return workbenchAPI.getDashboard(scenario)
  return get('/workbench/dashboard')
}

/**
 * 签到
 * @returns {code: 0, message: {checkinTime, status, message, workDuration}}
 */
export function checkin(shiftId, latitude, longitude) {
  if (useMock) return workbenchAPI.checkin({ latitude, longitude, shiftId })
  return post('/workbench/checkin', { latitude, longitude, shiftId })
}

/**
 * 签退
 * @returns {code: 0, message: {checkoutTime, workDuration, status, message}}
 */
export function checkout(shiftId, latitude, longitude) {
  if (useMock) return workbenchAPI.checkout({ latitude, longitude, shiftId })
  return post('/workbench/checkout', { latitude, longitude, shiftId })
}

/**
 * 获取班次
 * @returns {code: 0, message: {shifts: array}}
 */
export function getShifts(doctorId, date) {
  if (useMock) return workbenchAPI.getShifts({ doctorId, date })
  return get('/workbench/shifts', { doctorId, date })
}

/**
 * 获取接诊统计
 * @returns {code: 0, message: {pending, ongoing, completed, total}}
 */
export function getConsultationStats(doctorId) {
  if (useMock) return workbenchAPI.getConsultationStats({ doctorId })
  return get('/workbench/consultation-stats', { doctorId })
}

/**
 * 获取待办提醒
 * @returns {code: 0, message: {reminders: array}}
 */
export function getReminders(doctorId) {
  if (useMock) return workbenchAPI.getReminders({ doctorId })
  return get('/workbench/reminders', { doctorId })
}

/**
 * 获取最近接诊记录
 * @returns {code: 0, message: {records: array}}
 */
export function getRecentConsultations(doctorId, limit = 3) {
  if (useMock) return workbenchAPI.getRecentConsultations({ doctorId, limit })
  return get('/workbench/recent-consultations', { doctorId, limit })
}
