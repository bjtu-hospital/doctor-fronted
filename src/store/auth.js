import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { login as apiLogin } from "@/api/auth"

export const useAuthStore = defineStore("auth", () => {
    // 从 uni.getStorageSync 获取 token
    const storedToken = uni.getStorageSync("token")
    const token = ref("")

    // 初始化 token，确保不是无效值
    if (storedToken && storedToken !== "undefined" && storedToken !== "null") {
        token.value = storedToken
    } else if (storedToken) {
        // 清除无效的 token
        uni.removeStorageSync("token")
    }

    const isAuthenticated = computed(() => !!token.value)

    async function login(credentials) {
        try {
            const response = await apiLogin(credentials)
            console.log('Login API response:', response) // 调试日志

            // API 返回格式适配
            let accessToken = response.message

            // 情况1: message 是对象 (如 { access_token: "..." } 或 { token: "..." })
            if (typeof accessToken === 'object' && accessToken !== null) {
                if (accessToken.access_token) {
                    accessToken = accessToken.access_token
                } else if (accessToken.token) {
                    accessToken = accessToken.token
                }
            }
            // 情况2: message 直接是字符串 (如 "eyJ...") -> 此时 accessToken 已经是字符串，无需处理

            if (!accessToken || typeof accessToken !== 'string') {
                console.error('Invalid token received:', response.message)
                throw new Error('未收到有效的访问令牌')
            }

            // 设置 token
            token.value = accessToken
            uni.setStorageSync("token", accessToken)

            console.log('Login successful, token set:', accessToken.substring(0, 30) + '...')

            return { success: true }
        } catch (error) {
            console.error('Login error:', error)
            // 清除可能存在的无效 token
            token.value = ""
            uni.removeStorageSync("token")
            return { success: false, error: error.message || '登录失败' }
        }
    }

    function logout() {
        token.value = ""
        uni.removeStorageSync("token")
        console.log('User logged out')
    }

    return {
        token,
        isAuthenticated,
        login,
        logout,
    }
})