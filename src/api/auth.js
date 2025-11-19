import { post } from '@/utils/request'
import { authMock } from '../pages/login/login-mock'

const useMock = true


/**
 * 登录
 * @param {string} username - 用户名/工号
 * @param {string} password - 密码
 * @returns {code: 0, message: {token: string, doctor: {id, name, department, hospital}}}
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
 * @returns {code: 0, message: {doctor: {id, name, department, hospital, title, photo_path}}}
 */
export function getUserInfo() {
  if (useMock) return authMock.getUserInfo()
  return post('/auth/user-info')
}

