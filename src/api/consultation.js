import request from '@/utils/request'
import {
    mockGetInitialData,
    mockGetPatientDetail,
    mockSearchPatients,
} from '../pages/consultation/consultation-mock'

// Mock 开关
const USE_MOCK = true

/**
 * 获取接诊队列信息
 * 包括：统计信息、当前就诊人、下一位就诊人、完整队列列表
 */
export function getConsultationQueue() {
    if (USE_MOCK) {
        return mockGetInitialData()
    }
    return request.get('/consultation/queue')
}

/**
 * 获取患者详细信息
 * @param {string} patientId - 患者ID
 */
export function getPatientDetail(patientId) {
    if (USE_MOCK) {
        return mockGetPatientDetail(patientId)
    }
    return request.get(`/consultation/patient/${patientId}`)
}

/**
 * 搜索患者
 * @param {object} params - { name, phone, patient_id }
 */
export function searchPatients(params) {
    if (USE_MOCK) {
        return Promise.resolve(mockSearchPatients(params))
    }
    return request.get('/patients', { params })
}

/**
 * 叫下一位（完成当前就诊）
 * @param {string} currentPatientId - 当前患者ID
 */
export function callNextPatient(currentPatientId) {
    // 注意：mock数据时，此操作在前端完成，真实API调用后端
    return request.post('/consultation/next', { currentPatientId })
}

/**
 * 过号操作
 * @param {string} patientId - 患者ID
 */
export function passPatient(patientId) {
    // 注意：mock数据时，此操作在前端完成，真实API调用后端
    return request.post('/consultation/pass', { patientId })
}

/**
 * 申请加号
 * @param {object} data - { name, age, gender, position, reason }
 */
export function applyAddPatient(data) {
    // 注意：mock数据时，此操作在前端完成，真实API调用后端
    return request.post('/consultation/apply-add', data)
}
