import axios from 'axios'

const BASE_URL = '/api/v1'

// 创建axios实例
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('auth_token')
    
    // 如果有token且不是登录请求，则添加到header
    if (token && !config.url.includes('/auth/login')) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 如果是401错误，可能是token过期
    if (error.response?.status === 401) {
      // 清除本地存储的token
      localStorage.removeItem('auth_token')
      // 可以在这里添加重定向到登录页面的逻辑
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance 