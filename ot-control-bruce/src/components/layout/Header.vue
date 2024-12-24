<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { api } from '../../api/api-config'
import { enrichUserInfo } from '../../utils/user-utils'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const userInfo = ref(null)

const fetchUserInfo = async () => {
  try {
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      userInfo.value = JSON.parse(storedUserInfo)
      return
    }

    const response = await api.auth.getCurrentUser()
    const { enrichedInfo } = await enrichUserInfo(response)
    userInfo.value = enrichedInfo
    localStorage.setItem('userInfo', JSON.stringify(enrichedInfo))
  } catch (error) {
    console.error('获取用户信息失败：', error)
    ElMessage.error(t('header.fetchUserError'))
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.push('/login')
  }
}

const handleLogout = async () => {
  try {
    await api.auth.logout()
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.push('/login')
    ElMessage.success(t('header.logoutSuccess'))
  } catch (error) {
    console.error('退出登录失败：', error)
    ElMessage.error(t('header.logoutError'))
  }
}

onMounted(fetchUserInfo)
</script>

<template>
  <div class="header">
    <div class="logo">
      <h1>{{ t('header.title') }}</h1>
    </div>
    <div class="user-info" v-if="userInfo">
      <el-dropdown trigger="click">
        <span class="user-info-content">
          <div class="user-details">
            <span class="user-name">{{ userInfo.lastName }}{{ userInfo.firstName }}</span>
            <span class="user-role">{{ t(`header.role.${userInfo.role}`) }}</span>
          </div>
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled>
              <span class="dropdown-label">{{ t('header.department') }}：</span>
              {{ userInfo.departmentName || t('header.none') }}
            </el-dropdown-item>
            <el-dropdown-item disabled>
              <span class="dropdown-label">{{ t('header.facility') }}：</span>
              {{ userInfo.facilityName || t('header.none') }}
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">{{ t('header.logout') }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
.header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}

.logo {
  display: flex;
  align-items: center;
}

.logo h1 {
  font-size: 20px;
  color: #6B238E;
  margin: 0;
  font-weight: 500;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info-content {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info-content:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  background-color: #6B238E;
  color: #fff;
  font-size: 14px;
  margin-right: 8px;
}

.user-details {
  display: flex;
  flex-direction: column;
  margin-right: 8px;
  line-height: 1.2;
}

.user-name {
  font-size: 14px;
  color: #303133;
}

.user-role {
  font-size: 12px;
  color: #909399;
}

.dropdown-label {
  color: #909399;
  margin-right: 4px;
}

:deep(.el-dropdown-menu__item.is-disabled) {
  cursor: default;
  background-color: transparent !important;
}

:deep(.el-dropdown-menu__item.is-disabled:hover) {
  background-color: transparent !important;
}
</style> 