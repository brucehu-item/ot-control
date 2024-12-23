import mockUsers from '../../../../mock_data/users.json'

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 生成模拟token
const generateToken = () => {
  return {
    token: 'mock-jwt-token-' + Math.random().toString(36).substr(2),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
  }
}

let currentUser = null

export const authenticationApi = {
  // 用户登录
  login: async (credentials) => {
    await delay(500) // 模拟网络延迟
    
    const user = mockUsers.users.find(
      u => u.username === credentials.username && u.password === credentials.password
    )
    
    if (!user) {
      throw new Error('Invalid credentials')
    }
    
    currentUser = user
    return generateToken()
  },

  // 用户登出
  logout: async () => {
    await delay(200)
    currentUser = null
    return { success: true }
  },

  // 刷新令牌
  refreshToken: async () => {
    await delay(300)
    if (!currentUser) {
      throw new Error('Not authenticated')
    }
    return generateToken()
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    await delay(300)
    if (!currentUser) {
      throw new Error('Not authenticated')
    }
    
    const { password, ...userInfo } = currentUser
    return userInfo
  },

  // 修改密码
  changePassword: async (passwordData) => {
    await delay(500)
    if (!currentUser) {
      throw new Error('Not authenticated')
    }
    
    if (passwordData.currentPassword !== currentUser.password) {
      throw new Error('Current password is incorrect')
    }
    
    currentUser.password = passwordData.newPassword
    return { success: true }
  }
} 