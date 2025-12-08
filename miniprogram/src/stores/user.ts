/**
 * 用户状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { wechatLogin, getCurrentUser, logout as apiLogout, type User } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => !!user.value)

  // 登录
  async function login(userInfo?: { nickname?: string; avatar_url?: string }) {
    try {
      await wechatLogin(userInfo)
      await fetchUser()
      return true
    } catch (e) {
      console.error('登录失败:', e)
      return false
    }
  }

  // 获取用户信息
  async function fetchUser() {
    try {
      user.value = await getCurrentUser()
    } catch (e) {
      user.value = null
      throw e
    }
  }

  // 退出登录
  function logout() {
    apiLogout()
    user.value = null
  }

  // 检查登录状态
  function checkLogin(): boolean {
    const token = uni.getStorageSync('access_token')
    return !!token
  }

  return {
    user,
    isLoggedIn,
    login,
    fetchUser,
    logout,
    checkLogin
  }
})
