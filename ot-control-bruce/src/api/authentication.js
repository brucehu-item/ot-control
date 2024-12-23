import axios from 'axios'
import axiosInstance from './axios-instance'

const BASE_URL = '/api/v1'

export const authenticationApi = {
  // 用户登录 - 使用原始axios，因为不需要token
  login: async (credentials) => {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials)
    // 保存token到localStorage
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
    }
    return response.data
  },

  // 用户登出 - 使用带token的axiosInstance
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout')
    // 清除localStorage中的token
    localStorage.removeItem('auth_token')
    return response.data
  },

  // 刷新令牌 - 使用带token的axiosInstance
  refreshToken: async () => {
    const response = await axiosInstance.post('/auth/token/refresh')
    // 更新localStorage中的token
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
    }
    return response.data
  },

  // 获取当前用户信息 - 使用带token的axiosInstance
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me')
    return response.data
  },

  // 修改密码 - 使用带token的axiosInstance
  changePassword: async (passwordData) => {
    const response = await axiosInstance.put('/auth/password', passwordData)
    return response.data
  }
} 