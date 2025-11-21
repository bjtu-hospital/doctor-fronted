import request from '@/utils/request'
import {
    mockGetInitialData,
    mockGetPatientDetail,
    mockSearchPatients,
    mockCallNextPatient,
    mockPassPatient,
    mockCompleteConsultation,
    mockApplyAddPatient,
    resetMockData
} from '../pages/consultation/consultation-mock'

// Mock 开关（开发测试用）
const USE_MOCK = true

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
    if (USE_MOCK) {
        return mockCallNextPatient()
    }
    return request.post('/doctor/consultation/next', { schedule_id: scheduleId })
}

/**
 * 患者过号（未到场）
 * @param {number|string} patientOrderId - 患者排队订单ID
 */
export function passPatient(patientOrderId) {
    if (USE_MOCK) {
        return mockPassPatient(patientOrderId)
    }
    return request.post('/doctor/consultation/pass', { patient_order_id: patientOrderId })
}

/**
 * 完成患者就诊
 * @param {number|string} patientId - 患者ID
 * @param {number|string} scheduleId - 排班ID
 */
export function completeConsultation(patientId, scheduleId) {
    if (USE_MOCK) {
        return mockCompleteConsultation(patientId)
    }
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
    if (USE_MOCK) {
        return mockApplyAddPatient(data)
    }
    return request.post('/doctor/consultation/add', data)
}

/**
 * 重置 Mock 数据（仅开发测试用）
 */
export function resetConsultationMockData() {
    if (USE_MOCK) {
        return Promise.resolve({ code: 0, message: '重置成功', data: resetMockData() })
    }
    return Promise.reject(new Error('非 Mock 模式'))
}
