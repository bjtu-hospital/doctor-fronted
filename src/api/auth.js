import { post } from '@/utils/request'
import { authMock } from '../pages/login/login-mock'

const useMock = true


/**
 * 登录
 * @returns {code: 0, message: {token: string, doctor: object}}
 */
export function login({ username, password }) {
  if (useMock) return authMock.login({ username, password })
  return post('/auth/login', { username, password })
}

/**
 * 登出
 * @returns {code: 0, message: string}
 */
export function logout() {
  if (useMock) return authMock.logout()
  return post('/auth/logout')
}

/**
 * 刷新 token
 * @returns {code: 0, message: {token: string}}
 */
export function refreshToken() {
  if (useMock) return authMock.refreshToken()
  return post('/auth/refresh-token')
}

/**
 * 获取用户信息
 * @returns {code: 0, message: {doctor: object}}
 */
export function getUserInfo() {
  if (useMock) return authMock.getUserInfo()
  return post('/auth/user-info')
}

