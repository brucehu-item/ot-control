<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { api } from '../api/api-config'
import { enrichUserInfo } from '../utils/user-utils'

const router = useRouter()

const loginForm = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const loginFormRef = ref(null)

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    const response = await api.auth.login(loginForm)
    localStorage.setItem('token', response.token)

    const userInfo = await api.auth.getCurrentUser()
    const { enrichedInfo } = await enrichUserInfo(userInfo)
    localStorage.setItem('userInfo', JSON.stringify(enrichedInfo))
    
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="header">
        <h1 class="title">加班管理系统</h1>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="copyright">
      © 2023 加班管理系统 版权所有
    </div>
  </div>
</template>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #6B238E 0%, #9B4BC3 100%);
}

.login-card {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 24px;
  color: #6B238E;
  margin: 0;
}

.login-button {
  width: 100%;
}

.copyright {
  margin-top: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #6B238E;
}

:deep(.el-button--primary) {
  background-color: #6B238E;
  border-color: #6B238E;
}

:deep(.el-button--primary:hover) {
  background-color: #9B4BC3;
  border-color: #9B4BC3;
}
</style> 