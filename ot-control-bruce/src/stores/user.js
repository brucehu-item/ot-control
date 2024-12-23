import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAuthAPI } from '@/api/api-config'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)
  const authAPI = getAuthAPI()

  const login = async (credentials) => {
    const response = await authAPI.login(credentials)
    token.value = response.token
    localStorage.setItem('token', response.token)
    await getUserInfo()
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } finally {
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
    }
  }

  const getUserInfo = async () => {
    if (!token.value) return
    const response = await authAPI.getCurrentUser()
    userInfo.value = response
  }

  return {
    token,
    userInfo,
    login,
    logout,
    getUserInfo
  }
}) 