// 模拟 auth 接口封装
export function login({ username, password } = {}) {
  return new Promise((resolve, reject) => {
    // 简单校验
    if (!username || !password) {
      setTimeout(() => reject({ code: 400, message: '缺少用户名或密码' }), 300)
      return
    }

    // 模拟网络延迟
    setTimeout(() => {
      // 简单的 mock 验证逻辑：如果用户名以 "100" 开头则登录成功
      if (String(username).startsWith('100')) {
        resolve({
          code: 200,
          message: '登录成功',
          data: {
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
}
