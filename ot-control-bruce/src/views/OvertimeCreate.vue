<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { api } from '@/api/api-config'

const router = useRouter()

// 表单数据
const form = ref({
  startTime: '',
  endTime: '',
  reason: '',
  customerId: '',
})

// 表单规则
const rules = {
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请输入加班原因', trigger: 'blur' },
    { min: 5, max: 200, message: '加班原因长度应在 5 到 200 个字符之间', trigger: 'blur' }
  ],
  customerId: [
    { required: true, message: '请选择客户', trigger: 'change' }
  ]
}

const formRef = ref(null)

// 当前用户信息
const currentUser = ref(null)

// 客户列表
const customerOptions = ref([])

// 同步用户组织信息（部门和场所名称）
const syncUserOrgInfo = async (userInfo) => {
  let isUpdated = false

  if (userInfo.departmentId && !userInfo.departmentName) {
    try {
      const departments = await api.organization.getDepartments(userInfo.facilityId)
      const department = departments.find(d => d.departmentId === userInfo.departmentId)
      if (department) {
        userInfo.departmentName = department.name
        isUpdated = true
      }
    } catch (error) {
      console.error('获取部门信息失败：', error)
    }
  }

  if (userInfo.facilityId && !userInfo.facilityName) {
    try {
      const facility = await api.organization.getFacilityDetails(userInfo.facilityId)
      userInfo.facilityName = facility.name
      isUpdated = true
    } catch (error) {
      console.error('获取场所信息失败：', error)
    }
  }

  if (isUpdated) {
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
  }

  return userInfo
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    // 先从 localStorage 获取
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      const userInfo = JSON.parse(storedUserInfo)
      console.log('从 localStorage 获取的用户信息：', userInfo)
      const updatedUserInfo = await syncUserOrgInfo(userInfo)
      currentUser.value = updatedUserInfo
      return updatedUserInfo
    }

    // 如果 localStorage 没有，则从服务器获取
    const userInfo = await api.auth.getCurrentUser()
    console.log('从服务器获取的用户信息：', userInfo)
    const updatedUserInfo = await syncUserOrgInfo(userInfo)
    currentUser.value = updatedUserInfo
    localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo))
    return updatedUserInfo
  } catch (error) {
    console.error('获取用户信息失败：', error)
    ElMessage.error('获取用户信息失败')
    // 如果获取用户信息失败，可能是 token 过期，跳转到登录页
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.push('/login')
  }
}

// 获取客户列表
const fetchCustomers = async () => {
  try {
    const userInfo = await fetchUserInfo()
    if (!userInfo?.facilityId) {
      throw new Error('未找到用户所属场所')
    }
    
    const customers = await api.organization.getFacilityCustomers(userInfo.facilityId)
    customerOptions.value = customers.map(customer => ({
      value: customer.userId,
      label: `${customer.lastName}${customer.firstName}`
    }))
  } catch (error) {
    console.error('获取客户列表失败：', error)
    ElMessage.error(error.message || '获取客户列表失败')
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (!currentUser.value) {
          throw new Error('未获取到用户信息')
        }

        await api.overtime.createOvertimeRequest({
          startTime: form.value.startTime,
          endTime: form.value.endTime,
          reason: form.value.reason,
          customerId: form.value.customerId,
          // 添加申请者信息
          workerId: currentUser.value.userId,
          workerName: `${currentUser.value.lastName}${currentUser.value.firstName}`,
          // 添加部门信息
          departmentId: currentUser.value.departmentId,
          departmentName: currentUser.value.departmentName || '', // 如果后端返回的用户信息中没有部门名称，需要额外获取
          // 添加场所信息
          facilityId: currentUser.value.facilityId,
          facilityName: currentUser.value.facilityName || '' // 如果后端返回的用户信息中没有场所名称，需要额外获取
        })
        ElMessage.success('加班申请提交成功')
        router.push('/overtime/record')
      } catch (error) {
        console.error('提交加班申请失败：', error)
        ElMessage.error(error.message || '提交加班申请失败')
      }
    }
  })
}

// 取消
const cancel = () => {
  router.push('/overtime/record')
}

// 禁用的日期（过去的日期）
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7 // 禁用今天之前的日期
}

// 禁用的时间
const disabledTime = (date) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  if (selectedDate.getTime() === today.getTime()) {
    return {
      hours: Array.from({ length: now.getHours() }, (_, i) => i),
      minutes: date.getHours() === now.getHours() 
        ? Array.from({ length: now.getMinutes() }, (_, i) => i) 
        : []
    }
  }
  return {
    hours: [],
    minutes: []
  }
}

// 监听开始时间变化
const handleStartTimeChange = (val) => {
  if (form.value.endTime && new Date(val) > new Date(form.value.endTime)) {
    form.value.endTime = ''
    ElMessage.warning('结束时间不能早于开始时间')
  }
}

// 监听结束时间变化
const handleEndTimeChange = (val) => {
  if (form.value.startTime && new Date(val) < new Date(form.value.startTime)) {
    form.value.endTime = ''
    ElMessage.warning('结束时间不能早于开始时间')
  }
}

onMounted(async () => {
  await fetchCustomers()
})
</script>

<template>
  <div class="overtime-create">
    <div class="page-header">
      <h2>新建加班申请</h2>
    </div>
    
    <el-card class="form-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="disabledDate"
            :disabled-time="disabledTime"
            @change="handleStartTimeChange"
          />
        </el-form-item>
        
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="disabledDate"
            :disabled-time="disabledTime"
            @change="handleEndTimeChange"
          />
        </el-form-item>
        
        <el-form-item label="客户" prop="customerId">
          <el-select
            v-model="form.customerId"
            placeholder="请选择客户"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="item in customerOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="加班原因" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入加班原因（5-200字）"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="cancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.overtime-create {
  padding: 12px;
  background-color: #F5F7FA;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 12px;
}

.page-header h2 {
  font-size: 18px;
  color: #303133;
  margin: 0;
  font-weight: 500;
}

.form-card {
  max-width: 600px;
  margin: 0 auto;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-form) {
  padding: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-button--primary) {
  --el-button-bg-color: #6B238E;
  --el-button-border-color: #6B238E;
  --el-button-hover-bg-color: #9B4BC3;
  --el-button-hover-border-color: #9B4BC3;
  --el-button-active-bg-color: #6B238E;
  --el-button-active-border-color: #6B238E;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #6B238E inset !important;
}

:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #6B238E inset !important;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-date-editor) {
  width: 100%;
}

:deep(.el-button) {
  padding: 12px 20px;
  font-size: 14px;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
  text-align: center;
}

:deep(.el-button + .el-button) {
  margin-left: 20px;
}
</style> 