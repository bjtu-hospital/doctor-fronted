import request from '@/utils/request'
import {
    mockGetInitialData,
    mockGetPatientDetail,
    mockSearchPatients,
} from '../pages/consultation/consultation-mock'

// Mock 开关（开发测试用）
const USE_MOCK = false

/**
 * 获取接诊队列信息
 * @param {number|string} scheduleId - 排班ID
 */
export function getConsultationQueue(scheduleId) {
    console.log('📡 [API] getConsultationQueue 被调用，scheduleId:', scheduleId)
    if (USE_MOCK) {
        console.log('🎭 使用 Mock 数据')
        return mockGetInitialData()
    }
    console.log('🌐 发送真实请求: GET /doctor/consultation/queue', { schedule_id: scheduleId })
    return request.get('/doctor/consultation/queue', { schedule_id: scheduleId })
}

/**
 * 叫下一个患者
 * @param {number|string} scheduleId - 排班ID
 */
export function callNextPatient(scheduleId) {
    return request.post('/doctor/consultation/next', { schedule_id: scheduleId })
}

/**
 * 患者过号（未到场）
 * @param {number|string} patientOrderId - 患者排队订单ID
 */
export function passPatient(patientOrderId) {
    return request.post('/doctor/consultation/pass', { patient_order_id: patientOrderId })
}

/**
 * 完成患者就诊
 * @param {number|string} patientId - 患者ID
 * @param {number|string} scheduleId - 排班ID
 */
export function completeConsultation(patientId, scheduleId) {
    return request.post('/doctor/consultation/complete', { patient_id: patientId, schedule_id: scheduleId })
}

/**
 * 获取患者详细信息
 * @param {string} patientId - 患者ID
 */
export function getPatientDetail(patientId) {
    if (USE_MOCK) {
        return mockGetPatientDetail(patientId)
    }
    return request.get('/patient/detail', { patient_id: patientId })
}

/**
 * 搜索患者
 * @param {object} params - { name, phone, patient_id }
 */
export function searchPatients(params) {
    if (USE_MOCK) {
        return Promise.resolve(mockSearchPatients(params))
    }
    return request.get('/patients', params)
}

/**
 * 申请加号
 * @param {object} data - { schedule_id, patient_id, priority, reason }
 */
export function applyAddPatient(data) {
    // 注意：mock数据时，此操作在前端完成，真实API调用后端
    return request.post('/doctor/consultation/add', data)
}
