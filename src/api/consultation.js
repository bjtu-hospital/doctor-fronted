import request from '@/utils/request'
import { mockQueueData, mockPatientDetailData, mockOperationResult } from '../pages/consultation/consultation-mock'

// Mock 开关
const USE_MOCK = true

/**
 * 获取接诊队列信息
 * 包括：统计信息、当前就诊人、下一位就诊人、完整队列列表
 */
export function getConsultationQueue() {
    if (USE_MOCK) {
        return Promise.resolve(mockQueueData)
    }
    return request.get('/consultation/queue')
}

/**
 * 获取患者详细信息
 * @param {string} patientId - 患者ID
 */
export function getPatientDetail(patientId) {
    if (USE_MOCK) {
        return Promise.resolve(mockPatientDetailData)
    }
    return request.get(`/consultation/patient/${patientId}`)
}

/**
 * 叫下一位（完成当前就诊）
 * @param {string} currentPatientId - 当前患者ID
 */
export function callNextPatient(currentPatientId) {
    if (USE_MOCK) {
        return Promise.resolve(mockOperationResult)
    }
    return request.post('/consultation/next', { currentPatientId })
}

/**
 * 过号操作
 * @param {string} patientId - 患者ID
 */
export function passPatient(patientId) {
    if (USE_MOCK) {
        return Promise.resolve(mockOperationResult)
    }
    return request.post('/consultation/pass', { patientId })
}

/**
 * 申请加号
 * @param {object} data - 加号信息
 */
export function applyAddPatient(data) {
    if (USE_MOCK) {
        return Promise.resolve(mockOperationResult)
    }
    return request.post('/consultation/add', data)
}
