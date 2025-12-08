/**
 * 认证相关 API
 */
import request from './request'

// 用户信息接口
export interface User {
  id: string
  openid: string
  nickname: string
  avatar_url: string
  created_at: string
}

// 登录响应接口
export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

/**
 * 微信登录
 */
export async function wechatLogin(userInfo?: { nickname?: string; avatar_url?: string }): Promise<LoginResponse> {
  // 获取微信登录 code
  const loginResult = await uni.login({})

  if (!loginResult.code) {
    throw new Error('微信登录失败')
  }

  // 调用后端登录接口
  const res = await request.post<LoginResponse>('/auth/wechat/login', {
    code: loginResult.code,
    user_info: userInfo
  })

  // 保存 Token
  uni.setStorageSync('access_token', res.access_token)
  uni.setStorageSync('refresh_token', res.refresh_token)

  return res
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<User> {
  return request.get<User>('/auth/me')
}

/**
 * 退出登录
 */
export function logout() {
  uni.removeStorageSync('access_token')
  uni.removeStorageSync('refresh_token')
}
