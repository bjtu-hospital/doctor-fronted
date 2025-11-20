/**
 * uni-app 网络请求封装
 * 基于 uni.request
 */

// 1. 基础配置
// 优先使用环境变量，否则回退到本地后端默认端口 8000
const getBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_BASE_URL
    if (envUrl && envUrl !== '/') {
        return envUrl
    }
    return 'http://localhost:8000'
}

export const BASE_URL = getBaseUrl()
console.log('当前 API Base URL:', BASE_URL)

const TIMEOUT = 10000

// 2. 辅助函数：处理认证失效
const normalizeMsg = (raw, fallback = '请求失败') => {
    if (!raw) return fallback
    if (typeof raw === 'string') return raw
    if (typeof raw === 'object') {
        if (typeof raw.message === 'string') return raw.message
        if (typeof raw.msg === 'string') return raw.msg
        if (typeof raw.error === 'string') return raw.error
        try { return JSON.stringify(raw) } catch { return fallback }
    }
    return String(raw)
}

const handleAuthError = (msg = '认证失效，请重新登录') => {
    const title = normalizeMsg(msg, '认证失效，请重新登录')
    uni.showToast({ title, icon: 'none' })
    uni.removeStorageSync('token')
    setTimeout(() => {
        uni.reLaunch({ url: '/pages/login/login' })
    }, 1500)
}

/**
 * 核心请求函数
 * @param {Object} options 请求配置
 * @returns {Promise}
 */
const request = (options = {}) => {
    // 组装完整 URL
    // 如果 options.url 已经是完整路径（http开头），则不拼接 BASE_URL
    const url = options.url.startsWith('http')
        ? options.url
        : BASE_URL + options.url

    // 获取 Token
    const token = uni.getStorageSync('token')

    // 组装 Header
    const header = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
    }

    return new Promise((resolve, reject) => {
        uni.request({
            url: url,
            method: options.method || 'GET',
            data: options.data || {},
            header: header,
            timeout: options.timeout || TIMEOUT,
            success: (res) => {
                const { statusCode, data } = res

                // 1. HTTP 状态码错误
                if (statusCode === 401) {
                    handleAuthError()
                    return reject(new Error('未授权'))
                }

                if (statusCode !== 200) {
                    const msg = normalizeMsg(data?.message, `请求失败 [${statusCode}]`)
                    uni.showToast({ title: msg, icon: 'none' })
                    return reject(new Error(msg))
                }

                // 2. 业务状态码错误 (假设后端返回结构为 { code, message, data })
                if (data && typeof data.code !== 'undefined') {
                    if (data.code === 0) {
                        // 成功
                        resolve(data)
                    } else if (data.code === 105) {
                        handleAuthError(data.message || '登录已过期')
                        reject(new Error(normalizeMsg(data.message)))
                    } else {
                        const msg = normalizeMsg(data.message, '业务处理失败')
                        uni.showToast({ title: msg, icon: 'none' })
                        reject(new Error(msg))
                    }
                } else {
                    // 兼容不规范的返回结构，直接返回 data
                    resolve(data)
                }
            },
            fail: (err) => {
                console.error('网络请求失败:', err)
                uni.showToast({ title: '网络连接失败', icon: 'none' })
                reject(err)
            }
        })
    })
}

// 导出常用方法
export const get = (url, data, options) => request({ ...options, url, data, method: 'GET' })
export const post = (url, data, options) => request({ ...options, url, data, method: 'POST' })
export const put = (url, data, options) => request({ ...options, url, data, method: 'PUT' })
export const del = (url, data, options) => request({ ...options, url, data, method: 'DELETE' })

// 文件上传封装
export const upload = (url, filePath, formData = {}) => {
    const uploadUrl = url.startsWith('http') ? url : BASE_URL + url
    const token = uni.getStorageSync('token')

    return new Promise((resolve, reject) => {
        uni.uploadFile({
            url: uploadUrl,
            filePath: filePath,
            name: 'file',
            formData: formData,
            header: {
                'Authorization': token ? `Bearer ${token}` : ''
            },
            success: (res) => {
                // uni.uploadFile 返回的 data 是字符串，需要解析
                try {
                    const data = JSON.parse(res.data)
                    if (res.statusCode === 200 && data.code === 0) {
                        resolve(data)
                    } else {
                        reject(new Error(data.message || '上传失败'))
                    }
                } catch (e) {
                    reject(e)
                }
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}

export default {
    request,
    get,
    post,
    put,
    del,
    upload
}
