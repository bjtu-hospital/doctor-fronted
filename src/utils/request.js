/**
 * utils/request.js
 * uni-app 网络请求通用封装
 */

// 1. 基础配置
// 获取环境变量中的 BaseUrl，如果没有则使用本地默认
const getBaseUrl = () => {
    // 注意：在 vite.config.js 或 .env 文件中定义 VITE_API_BASE_URL
    const envUrl = import.meta.env.VITE_API_BASE_URL
    // 简单判断 URL 格式，避免 undefined 或空字符串
    if (envUrl && (envUrl.startsWith('http') || envUrl.startsWith('/'))) {
        return envUrl
    }
    // 默认回退地址
    return 'http://localhost:8000'
}

export const BASE_URL = getBaseUrl()
const TIMEOUT = 15000 // 超时时间 15s

// 2. 辅助函数：统一处理认证失效
const handleAuthError = (msg = '认证失效，请重新登录') => {
    // 避免短时间内重复触发提示
    const isLocked = uni.getStorageSync('isLoginRedirecting')
    if (isLocked) return

    uni.setStorageSync('isLoginRedirecting', true)
    uni.removeStorageSync('token')

    uni.showToast({ title: msg, icon: 'none', duration: 2000 })

    setTimeout(() => {
        uni.removeStorageSync('isLoginRedirecting')
        uni.reLaunch({ url: '/pages/login/login' })
    }, 1500)
}

/**
 * 3. 核心请求函数
 */
const request = (options = {}) => {
    // 3.1 url 拼接
    const url = options.url.startsWith('http')
        ? options.url
        : BASE_URL + options.url

    // 3.2 动态获取 Token
    const token = uni.getStorageSync('token')

    // 3.3 组装 Header
    const header = {
        'Content-Type': 'application/json',
        ...options.header // 允许外部传入 header 覆盖默认值
    }

    // 只有 Token 存在时才添加 Authorization，避免发送空头
    if (token) {
        header['Authorization'] = `Bearer ${token}`
    }

    // 3.4 返回 Promise
    return new Promise((resolve, reject) => {
        uni.request({
            url: url,
            method: options.method || 'GET',
            data: options.data || {},
            header: header,
            timeout: options.timeout || TIMEOUT,
            success: (res) => {
                const { statusCode, data } = res

                // === HTTP 状态码层 ===
                if (statusCode === 401) {
                    handleAuthError()
                    return reject(new Error('未授权'))
                }

                if (statusCode !== 200) {
                    let msg = `HTTP异常 [${statusCode}]`
                    if (data) {
                        if (typeof data === 'string') {
                            msg = data
                        } else if (typeof data === 'object') {
                            // 确保提取的值是字符串
                            const extracted = data.message || data.error || data.detail || data.msg
                            msg = typeof extracted === 'string' ? extracted : JSON.stringify(extracted) || msg
                        }
                    }
                    uni.showToast({ title: String(msg), icon: 'none' })
                    return reject(new Error(msg))
                }

                // === 业务状态码层 (根据后端结构调整) ===
                // 假设结构: { code: 0, message: "ok", data: ... }
                if (data && typeof data.code !== 'undefined') {
                    if (data.code === 0) {
                        // 成功：直接返回完整 data，方便 Store 层取 message 或 data
                        resolve(data)
                    } else if (data.code === 105 || data.code === 401) {
                        // 业务层面的 Token 过期
                        handleAuthError(data.message || '登录已过期')
                        reject(new Error(data.message))
                    } else {
                        // 其他业务错误
                        const msg = data.message || '请求失败'
                        uni.showToast({ title: msg, icon: 'none' })
                        reject(new Error(msg))
                    }
                } else {
                    // 兼容非标准结构（如第三方 API），直接放行
                    resolve(data)
                }
            },
            fail: (err) => {
                console.error('Request Fail:', err)
                let errMsg = '网络连接失败'
                if (err.errMsg && err.errMsg.includes('timeout')) {
                    errMsg = '请求超时'
                }
                uni.showToast({ title: errMsg, icon: 'none' })
                reject(err)
            }
        })
    })
}

/**
 * 4. 文件上传封装
 */
export const upload = (url, filePath, formData = {}) => {
    const uploadUrl = url.startsWith('http') ? url : BASE_URL + url
    const token = uni.getStorageSync('token')

    const header = {}
    if (token) {
        header['Authorization'] = `Bearer ${token}`
    }

    return new Promise((resolve, reject) => {
        uni.uploadFile({
            url: uploadUrl,
            filePath: filePath,
            name: 'file', // 后端接收文件的字段名
            formData: formData,
            header: header,
            success: (res) => {
                // uni.uploadFile 返回的 data 是字符串，必须 parse
                try {
                    const data = JSON.parse(res.data)
                    // 简单的业务状态判断，可根据需要扩展
                    if (res.statusCode === 200 && data.code === 0) {
                        resolve(data)
                    } else if (res.statusCode === 401) {
                        handleAuthError()
                        reject(new Error('未授权'))
                    } else {
                        uni.showToast({ title: data.message || '上传失败', icon: 'none' })
                        reject(new Error(data.message))
                    }
                } catch (e) {
                    reject(new Error('解析响应失败'))
                }
            },
            fail: (err) => {
                uni.showToast({ title: '上传失败', icon: 'none' })
                reject(err)
            }
        })
    })
}

// 5. 导出快捷方法
export const get = (url, data, options) => request({ ...options, url, data, method: 'GET' })
export const post = (url, data, options) => request({ ...options, url, data, method: 'POST' })
export const put = (url, data, options) => request({ ...options, url, data, method: 'PUT' })
export const del = (url, data, options) => request({ ...options, url, data, method: 'DELETE' })

// 默认导出
export default {
    request,
    get,
    post,
    put,
    del,
    upload,
    BASE_URL
}