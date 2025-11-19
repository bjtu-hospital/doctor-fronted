/**
 * uni-app 请求封装
 * 统一的网络请求配置和拦截器
 */

// 检测是否有 process 环境变量
const _hasProcess = (typeof process !== 'undefined' && process && process.env)

// API 基础路径
const BASE_URL = _hasProcess
    ? (process.env.VITE_API_BASE_URL || process.env.VUE_APP_API_BASE_URL || '/api')
    : '/api'

// 请求超时时间
const TIMEOUT = 10000

/**
 * 请求拦截器
 */
function requestInterceptor(config) {
    // 添加 token
    const token = uni.getStorageSync('token')
    if (token) {
        config.header = config.header || {}
        config.header.Authorization = `Bearer ${token}`
    }

    // 添加时间戳防止缓存
    if (config.method === 'GET') {
        config.data = config.data || {}
        config.data._t = Date.now()
    }

    return config
}

/**
 * 响应拦截器
 */
function responseInterceptor(response) {
    const { statusCode, data } = response

    // HTTP 状态码检查
    if (statusCode === 401) {
        handleAuthError('认证失败，请重新登录')
        return Promise.reject(new Error('认证失败'))
    }

    if (statusCode >= 400) {
        const errorMsg = data?.message || `请求失败 (${statusCode})`
        return Promise.reject(new Error(errorMsg))
    }

    // 业务代码检查
    if (data && data.code !== undefined) {
        // code: 105 表示认证失效
        if (data.code === 105) {
            handleAuthError(data.message?.msg || '认证失效')
            return Promise.reject(new Error('认证失效'))
        }

        // code: 0 表示成功
        if (data.code === 0) {
            return data
        }

        // 其他业务错误
        const errorMsg = data.message || data.msg || '请求失败'
        return Promise.reject(new Error(errorMsg))
    }

    return data
}

/**
 * 处理认证错误
 */
function handleAuthError(message) {
    // 清除 token
    uni.removeStorageSync('token')

    // 提示用户
    uni.showToast({
        title: message,
        icon: 'none',
        duration: 2000
    })

    // 延迟跳转到登录页
    setTimeout(() => {
        const pages = getCurrentPages()
        const currentPage = pages[pages.length - 1]

        // 如果当前不在登录页，则跳转
        if (currentPage && currentPage.route !== 'pages/login/login') {
            uni.reLaunch({
                url: '/pages/login/login'
            })
        }
    }, 2000)
}

/**
 * 统一的请求方法
 * @param {Object} options - 请求配置
 * @returns {Promise}
 */
function request(options) {
    // 合并默认配置
    const config = {
        url: BASE_URL + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
            'Content-Type': 'application/json',
            ...options.header
        },
        timeout: options.timeout || TIMEOUT,
        ...options
    }

    // 执行请求拦截器
    const interceptedConfig = requestInterceptor(config)

    return new Promise((resolve, reject) => {
        uni.request({
            ...interceptedConfig,
            success: (res) => {
                responseInterceptor(res)
                    .then(resolve)
                    .catch(reject)
            },
            fail: (err) => {
                console.error('请求失败:', err)
                uni.showToast({
                    title: err.errMsg || '网络请求失败',
                    icon: 'none'
                })
                reject(err)
            }
        })
    })
}

/**
 * GET 请求
 */
export function get(url, data, options = {}) {
    return request({
        url,
        method: 'GET',
        data,
        ...options
    })
}

/**
 * POST 请求
 */
export function post(url, data, options = {}) {
    return request({
        url,
        method: 'POST',
        data,
        ...options
    })
}

/**
 * PUT 请求
 */
export function put(url, data, options = {}) {
    return request({
        url,
        method: 'PUT',
        data,
        ...options
    })
}

/**
 * DELETE 请求
 */
export function del(url, data, options = {}) {
    return request({
        url,
        method: 'DELETE',
        data,
        ...options
    })
}

/**
 * 文件上传
 */
export function upload(url, filePath, formData = {}, options = {}) {
    const token = uni.getStorageSync('token')

    return new Promise((resolve, reject) => {
        uni.uploadFile({
            url: BASE_URL + url,
            filePath,
            name: 'file',
            formData,
            header: {
                Authorization: token ? `Bearer ${token}` : '',
                ...options.header
            },
            success: (res) => {
                try {
                    const data = JSON.parse(res.data)
                    responseInterceptor({ statusCode: res.statusCode, data })
                        .then(resolve)
                        .catch(reject)
                } catch (e) {
                    reject(new Error('响应数据解析失败'))
                }
            },
            fail: (err) => {
                console.error('上传失败:', err)
                uni.showToast({
                    title: '上传失败',
                    icon: 'none'
                })
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
