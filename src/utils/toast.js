import { getCurrentInstance } from 'vue'

let toastInstance = null

/**
 * 获取Toast实例
 */
function getToastInstance() {
    if (!toastInstance) {
        const instance = getCurrentInstance()
        if (instance) {
            toastInstance = instance.appContext.config.globalProperties.$toast
        }
    }
    return toastInstance
}

/**
 * 显示Toast
 * @param {string|object} options - 消息内容或配置对象
 */
export function showToast(options) {
    const toast = getToastInstance()
    if (toast) {
        toast.show(options)
    } else {
        uni.showToast({
            title: typeof options === 'string' ? options : options.message,
            icon: 'none'
        })
    }
}

/**
 * 成功提示
 * @param {string} message - 消息内容
 */
export function success(message) {
    showToast({
        message,
        type: 'success',
        icon: '✓',
        position: 'top'
    })
}

/**
 * 错误提示
 * @param {string} message - 消息内容
 */
export function error(message) {
    showToast({
        message,
        type: 'error',
        icon: '✕',
        position: 'top'
    })
}

/**
 * 警告提示
 * @param {string} message - 消息内容
 */
export function warning(message) {
    showToast({
        message,
        type: 'warning',
        icon: '⚠',
        position: 'top'
    })
}

/**
 * 信息提示
 * @param {string} message - 消息内容
 */
export function info(message) {
    showToast({
        message,
        type: 'info',
        icon: 'ℹ',
        position: 'top'
    })
}

/**
 * 加载提示
 * @param {string} message - 消息内容
 */
export function loading(message = '加载中...') {
    showToast({
        message,
        type: 'default',
        icon: '⏳',
        duration: 0
    })
}

/**
 * 隐藏Toast
 */
export function hideToast() {
    const toast = getToastInstance()
    if (toast) {
        toast.hide()
    } else {
        uni.hideToast()
    }
}

export default {
    showToast,
    success,
    error,
    warning,
    info,
    loading,
    hideToast
}
