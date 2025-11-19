/**
 * 认证模块 Mock 数据
 */

export const authMock = {
    /**
     * 登录
     */
    login({ username, password }) {
        return new Promise((resolve, reject) => {
            if (!username || !password) {
                setTimeout(() => reject({ code: 400, message: '缺少用户名或密码' }), 300)
                return
            }

            setTimeout(() => {
                if (String(username).startsWith('100')) {
                    resolve({
                        code: 0,
                        message: {
                            token: 'mock-token-abcdef-123456',
                            doctor: {
                                id: '10001',
                                name: '张医生',
                                department: '心内科',
                                hospital: '北京交通大学附属医院'
                            }
                        }
                    })
                } else {
                    reject({ code: 401, message: '工号或密码错误' })
                }
            }, 900)
        })
    },

    /**
     * 登出
     */
    logout() {
        return Promise.resolve({ code: 0, message: '登出成功' })
    },

    /**
     * 刷新 token
     */
    refreshToken() {
        return Promise.resolve({
            code: 0,
            message: { token: 'mock-token-refreshed-' + Date.now() }
        })
    },

    /**
     * 获取用户信息
     */
    getUserInfo() {
        return Promise.resolve({
            code: 0,
            message: {
                doctor: {
                    id: '10001',
                    name: '张医生',
                    department: '心内科',
                    hospital: '北京交通大学附属医院',
                    title: '主任医师',
                    photo_path: '/static/images/doctor/default.jpg'
                }
            }
        })
    }
}
