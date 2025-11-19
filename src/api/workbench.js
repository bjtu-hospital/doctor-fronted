// 工作台 API 调用封装
// 生产环境调用真实接口，开发环境使用 Mock 数据

import { workbenchAPI } from "../views/workbench/mock/workbench-mock"

// 小程序运行时没有全局 `process`，直接访问会抛 ReferenceError.
// 这里只使用安全的 `process` 判断；若不可用（小程序环境），
// 默认使用 Mock（避免真机调用未配置的接口）。
const _hasProcess = (typeof process !== 'undefined' && process && process.env)
const BASE_URL = _hasProcess ? (process.env.VITE_API_BASE_URL || process.env.VUE_APP_API_BASE_URL || '/api') : '/api'
const NODE_ENV = _hasProcess ? (process.env.NODE_ENV || process.env.MODE || '') : ''
// 如果能读取到 NODE_ENV，按其判断；否则在小程序/未知环境下默认使用 Mock（更安全）
const useApi = _hasProcess ? (NODE_ENV === 'development') : true

/**
 * 获取工作台首页数据
 * @param {string} scenario - Mock 场景选择（开发时使用）
 */
export function getDashboardData(scenario = 'notCheckin') {
  if (useApi) {
    return workbenchAPI.getDashboard(scenario)
  }
  // 生产环境实际请求
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/workbench/dashboard`,
      method: 'GET',
      success: (res) => {
        if (res.data.code === 0) {
          resolve(res.data.message)
        } else {
          reject(res.data)
        }
      },
      fail: reject
    })
  })
}

/**
 * 医生签到
 * @param {number} shiftId - 班次 ID
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 */
export function checkin(shiftId, latitude, longitude) {
  if (useApi) {
    return workbenchAPI.checkin({ latitude, longitude, shiftId })
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/workbench/checkin`,
      method: 'POST',
      data: { latitude, longitude, shiftId },
      success: (res) => {
        if (res.data.code === 0) {
          resolve(res.data.message)
        } else {
          reject(res.data)
        }
      },
      fail: reject
    })
  })
}

/**
 * 医生签退
 * @param {number} shiftId - 班次 ID
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 */
export function checkout(shiftId, latitude, longitude) {
  if (useApi) {
    return workbenchAPI.checkout({ latitude, longitude, shiftId })
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/workbench/checkout`,
      method: 'POST',
      data: { latitude, longitude, shiftId },
      success: (res) => {
        if (res.data.code === 0) {
          resolve(res.data.message)
        } else {
          reject(res.data)
        }
      },
      fail: reject
    })
  })
}

/**
 * 获取班次信息
 * @param {number} doctorId - 医生 ID
 * @param {string} date - 日期 YYYY-MM-DD（可选）
 */
export function getShifts(doctorId, date) {
  if (useApi) {
    return workbenchAPI.getShifts({ doctorId, date })
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/workbench/shifts`,
      method: 'GET',
      data: { doctorId, date },
      success: (res) => {
        if (res.data.code === 0) {
          resolve(res.data.message)
        } else {
          reject(res.data)
        }
      },
      fail: reject
    })
  })
}

/**
 * 获取接诊统计
 * @param {number} doctorId - 医生 ID
 */
export function getConsultationStats(doctorId) {
  if (useApi) {
    return workbenchAPI.getConsultationStats({ doctorId })
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/workbench/consultation-stats`,
      method: 'GET',
      data: { doctorId },
      success: (res) => {
        if (res.data.code === 0) {
          resolve(res.data.message)
        } else {
          reject(res.data)
        }
      },
      fail: reject
    })
  })
}

/**
 * 获取待办提醒
 * @param {number} doctorId - 医生 ID
 */
export function getReminders(doctorId) {
  if (useApi) {
    return workbenchAPI.getReminders({ doctorId })
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/workbench/reminders`,
      method: 'GET',
      data: { doctorId },
      success: (res) => {
        if (res.data.code === 0) {
          resolve(res.data.message)
        } else {
          reject(res.data)
        }
      },
      fail: reject
    })
  })
}

/**
 * 获取最近接诊记录
 * @param {number} doctorId - 医生 ID
 * @param {number} limit - 数量限制（默认 3）
 */
export function getRecentConsultations(doctorId, limit = 3) {
  if (useApi) {
    return workbenchAPI.getRecentConsultations({ doctorId, limit })
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/workbench/recent-consultations`,
      method: 'GET',
      data: { doctorId, limit },
      success: (res) => {
        if (res.data.code === 0) {
          resolve(res.data.message)
        } else {
          reject(res.data)
        }
      },
      fail: reject
    })
  })
}
