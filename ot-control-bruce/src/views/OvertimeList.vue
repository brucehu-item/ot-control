<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { api } from '../api/api-config'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

// 搜索条件
const searchForm = ref({
  startDate: '',
  endDate: '',
  status: '',
  departmentId: '',
  workerId: '',
  facilityId: '',
  customerId: '',
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const totalDuration = ref(0)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 详情弹窗
const detailVisible = ref(false)
const currentDetail = ref(null)

// 状态选项
const statusOptions = [
  { label: t('overtime.list.status.PENDING_SUPERVISOR'), value: 'PENDING_SUPERVISOR' },
  { label: t('overtime.list.status.SUPERVISOR_APPROVED'), value: 'SUPERVISOR_APPROVED' },
  { label: t('overtime.list.status.PENDING_MANAGER'), value: 'PENDING_MANAGER' },
  { label: t('overtime.list.status.PENDING_CUSTOMER'), value: 'PENDING_CUSTOMER' },
  { label: t('overtime.list.status.APPROVED'), value: 'APPROVED' },
  { label: t('overtime.list.status.REJECTED'), value: 'REJECTED' },
  { label: t('overtime.list.status.CANCELLED'), value: 'CANCELLED' }
]

// 获取当前用户信息
const currentUser = ref(null)

// 检查是否有取消权限
const hasPermissionToCancel = (row) => {
  if (!currentUser.value) return false
  
  const { role, userId, departmentId, facilityId } = currentUser.value
  
  switch (role) {
    case 'WORKER':
      return userId === row.workerId && row.status === 'PENDING_SUPERVISOR'
    case 'SUPERVISOR':
      return departmentId === row.departmentId && 
             ['PENDING_SUPERVISOR', 'SUPERVISOR_APPROVED'].includes(row.status)
    case 'MANAGER':
      return facilityId === row.facilityId && 
             ['PENDING_SUPERVISOR', 'SUPERVISOR_APPROVED', 'PENDING_MANAGER', 'PENDING_CUSTOMER'].includes(row.status)
    default:
      return false
  }
}

// 检查是否有审批权限
const hasPermissionToApprove = (row) => {
  if (!currentUser.value) return false
  
  const { role, userId, departmentId, facilityId } = currentUser.value
  
  switch (role) {
    case 'SUPERVISOR':
      return departmentId === row.departmentId && row.status === 'PENDING_SUPERVISOR'
    case 'MANAGER':
      return facilityId === row.facilityId && 
             (row.status === 'PENDING_MANAGER' || row.status === 'SUPERVISOR_APPROVED')
    case 'CUSTOMER':
      return row.customerId === currentUser.value.customerId && 
             (row.status === 'PENDING_CUSTOMER' || row.status === 'SUPERVISOR_APPROVED')
    default:
      return false
  }
}

// 审批弹窗
const approvalVisible = ref(false)
const approvalForm = ref({
  action: 'APPROVE',
  comment: ''
})
const currentApprovalRequest = ref(null)

// 打开审批弹窗
const showApproval = (row) => {
  currentApprovalRequest.value = row
  approvalVisible.value = true
}

// 处理审批
const handleApproval = async () => {
  try {
    if (approvalForm.value.action === 'APPROVE') {
      await api.overtime.approveOvertimeRequest(currentApprovalRequest.value.id, {
        approverId: currentUser.value.userId,
        role: currentUser.value.role,
        comment: approvalForm.value.comment
      })
    } else {
      await api.overtime.rejectOvertimeRequest(currentApprovalRequest.value.id, {
        approverId: currentUser.value.userId,
        role: currentUser.value.role,
        comment: approvalForm.value.comment
      })
    }
    ElMessage.success(t('overtime.list.dialog.approval.success'))
    approvalVisible.value = false
    approvalForm.value = { action: 'APPROVE', comment: '' }
    fetchData()
  } catch (error) {
    console.error('审批失败：', error)
    ElMessage.error(error.message || t('overtime.list.dialog.approval.error'))
  }
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    // 先从 localStorage 获取
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      const userInfo = JSON.parse(storedUserInfo)
      console.log('从 localStorage 获取的用户信息：', userInfo)
      currentUser.value = userInfo
      initSearchFormByRole(userInfo)
      return
    }

    // 如果 localStorage 没有，则从服务器获取
    const userInfo = await api.auth.getCurrentUser()
    console.log('从服务器获取的用户信息：', userInfo)
    currentUser.value = userInfo
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    initSearchFormByRole(userInfo)
  } catch (error) {
    console.error('获取用户信息失败：', error)
    ElMessage.error('获取用户信息失败')
    // 如果获取用户信息失败，可能是 token 过期，跳转到登录页
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.push('/login')
  }
}

// 根据用户角色初始化搜索条件
const initSearchFormByRole = (userInfo) => {
  const { role, userId, departmentId, facilityId } = userInfo
  console.log('初始化搜索条件，用户信息：', userInfo)
  
  // 根据角色设置应的搜索条件
  switch (role) {
    case 'WORKER':
      searchForm.value.workerId = userId
      break
    case 'SUPERVISOR':
      searchForm.value.departmentId = departmentId
      break
    case 'MANAGER':
      searchForm.value.facilityId = facilityId
      break
    case 'CUSTOMER':
      searchForm.value.customerId = userInfo.customerId
      break
  }
  
  console.log('初始化后的searchForm：', searchForm.value)
}

// 重置搜索
const resetSearch = async () => {
  if (currentUser.value) {
    searchForm.value = {
      startDate: '',
      endDate: '',
      status: '',
      departmentId: '',
      workerId: '',
      facilityId: '',
      customerId: '',
    }
    initSearchFormByRole(currentUser.value)
    console.log('重置搜索后的searchForm.value', searchForm.value)
  }
  currentPage.value = 1
  await fetchData()
}

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    // 构建请求参数
    const params = {
      ...searchForm.value,
      page: currentPage.value,
      pageSize: pageSize.value
    }

    // 移除空值参数
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })

    console.log('发送请求的参数：', params)
    const { requests, total: totalCount, totalDuration: duration } = await api.overtime.getOvertimeRequests(params)
    console.log('获取到的数据：', requests)
    
    tableData.value = requests
    total.value = totalCount
    totalDuration.value = duration
  } catch (error) {
    console.error('获取加班记录失败：', error)
    ElMessage.error('获取加班记录失败')
  } finally {
    loading.value = false
  }
}

// 查看详情
const showDetail = (row) => {
  currentDetail.value = row
  detailVisible.value = true
}

// 取消申请
const handleCancel = async (id) => {
  try {
    await api.overtime.cancelOvertimeRequest(id)
    ElMessage.success(t('overtime.list.message.cancelSuccess'))
    fetchData()
  } catch (error) {
    ElMessage.error(t('overtime.list.message.cancelError'))
  }
}

// 新建申请
const createRequest = () => {
  router.push('/overtime/create')
}

// 处理分页大小改变
const handleSizeChange = async (val) => {
  pageSize.value = val
  await fetchData()
}

// 处理页码改变
const handleCurrentChange = async (val) => {
  currentPage.value = val
  await fetchData()
}

// 监听状态变化
watch(() => searchForm.value.status, (newVal) => {
  console.log('状态变化：', newVal)
})

// 部门列表
const departmentOptions = ref([])

// 获取部门列表
const fetchDepartments = async () => {
  try {
    const departments = await api.organization.getDepartments(currentUser.value.facilityId)
    departmentOptions.value = departments
  } catch (error) {
    console.error('获取部门列表失败：', error)
    ElMessage.error('获取部门列表失败')
  }
}

onMounted(async () => {
  await fetchUserInfo()
  if (currentUser.value?.role === 'MANAGER' && currentUser.value?.facilityId) {
    await fetchDepartments()
  }
  await fetchData()
})
</script>

<template>
  <div class="overtime-record">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>{{ t('overtime.list.title') }}</h2>
      <el-button 
        v-if="currentUser?.role === 'WORKER'"
        type="primary" 
        @click="createRequest"
      >
        {{ t('overtime.create.title') }}
      </el-button>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-area">
      <el-form :model="searchForm" inline>
        <el-form-item :label="t('overtime.list.search.startDate')">
          <el-date-picker
            v-model="searchForm.startDate"
            v-model:end="searchForm.endDate"
            type="daterange"
            range-separator="至"
            :start-placeholder="t('overtime.list.search.startDate')"
            :end-placeholder="t('overtime.list.search.endDate')"
            value-format="YYYY-MM-DD"
            :shortcuts="[
              { text: t('overtime.list.search.lastWeek'), value: () => {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                return [start, end]
              }},
              { text: t('overtime.list.search.lastMonth'), value: () => {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                return [start, end]
              }},
              { text: t('overtime.list.search.lastThreeMonths'), value: () => {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                return [start, end]
              }}
            ]"
          />
        </el-form-item>
        <el-form-item :label="t('overtime.list.search.status')">
          <el-select
            v-model="searchForm.status"
            :placeholder="t('overtime.list.search.status')"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <span style="float: left">{{ item.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="currentUser?.role === 'MANAGER'" :label="t('overtime.list.search.department')">
          <el-select
            v-model="searchForm.departmentId"
            :placeholder="t('overtime.list.search.department')"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="item in departmentOptions"
              :key="item.departmentId"
              :label="item.name"
              :value="item.departmentId"
            />
          </el-select>
        </el-form-item>
        <el-button type="primary" @click="fetchData">{{ t('common.search') }}</el-button>
        <el-button @click="resetSearch">{{ t('common.reset') }}</el-button>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-area">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" :label="t('overtime.list.table.id')" min-width="120" />
        <el-table-column prop="workerName" :label="t('overtime.list.table.worker')" min-width="120">
          <template #default="{ row }">
            {{ row.workerName || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="departmentName" :label="t('overtime.list.table.department')" min-width="150">
          <template #default="{ row }">
            {{ row.departmentName || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="facilityName" :label="t('overtime.list.table.facility')" min-width="150">
          <template #default="{ row }">
            {{ row.facilityName || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="startTime" :label="t('overtime.list.table.startTime')" min-width="180">
          <template #default="{ row }">
            {{ new Date(row.startTime).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" :label="t('overtime.list.table.endTime')" min-width="180">
          <template #default="{ row }">
            {{ new Date(row.endTime).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" :label="t('overtime.list.table.duration')" min-width="120">
          <template #default="{ row }">
            {{ ((new Date(row.endTime) - new Date(row.startTime)) / (1000 * 60 * 60)).toFixed(1) }}{{ t('overtime.list.table.hour') }}
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="t('overtime.list.table.status')" min-width="150">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'APPROVED' ? 'success' :
                     row.status === 'PENDING_SUPERVISOR' ? 'primary' :
                     row.status === 'SUPERVISOR_APPROVED' ? 'warning' :
                     row.status === 'PENDING_MANAGER' || row.status === 'PENDING_CUSTOMER' ? 'warning' :
                     row.status === 'REJECTED' ? 'danger' : 'info'"
            >
              {{ t(`overtime.list.status.${row.status}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="t('overtime.list.table.createdAt')" min-width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column :label="t('overtime.list.table.operation')" min-width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">{{ t('overtime.list.action.view') }}</el-button>
            <el-button
              v-if="hasPermissionToCancel(row)"
              link
              type="danger"
              @click="handleCancel(row.id)"
            >
              {{ t('overtime.list.action.cancel') }}
            </el-button>
            <el-button
              v-if="hasPermissionToApprove(row)"
              link
              type="success"
              @click="showApproval(row)"
            >
              {{ t('overtime.list.action.approve') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[5, 10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      :title="t('overtime.list.dialog.detail.title')"
      width="800px"
    >
      <template v-if="currentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="t('overtime.list.table.id')">{{ currentDetail.id }}</el-descriptions-item>
          <el-descriptions-item :label="t('overtime.list.table.worker')">{{ currentDetail.workerName }}</el-descriptions-item>
          <el-descriptions-item :label="t('overtime.list.table.department')">{{ currentDetail.departmentName }}</el-descriptions-item>
          <el-descriptions-item :label="t('overtime.list.table.facility')">{{ currentDetail.facilityName }}</el-descriptions-item>
          <el-descriptions-item :label="t('overtime.list.table.status')">
            <el-tag
              :type="currentDetail.status === 'APPROVED' ? 'success' :
                     currentDetail.status === 'PENDING_SUPERVISOR' ? 'primary' :
                     currentDetail.status === 'SUPERVISOR_APPROVED' ? 'warning' :
                     currentDetail.status === 'PENDING_MANAGER' || currentDetail.status === 'PENDING_CUSTOMER' ? 'warning' :
                     currentDetail.status === 'REJECTED' ? 'danger' : 'info'"
            >
              {{ t(`overtime.list.status.${currentDetail.status}`) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('overtime.list.table.startTime')" :span="2">{{ currentDetail.startTime }}</el-descriptions-item>
          <el-descriptions-item :label="t('overtime.list.table.endTime')" :span="2">{{ currentDetail.endTime }}</el-descriptions-item>
          <el-descriptions-item :label="t('overtime.list.table.duration')" :span="2">{{ currentDetail.duration }}{{ t('overtime.list.table.hour') }}</el-descriptions-item>
          <el-descriptions-item :label="t('overtime.list.table.reason')" :span="2">{{ currentDetail.reason }}</el-descriptions-item>
        </el-descriptions>

        <!-- 审批流程 -->
        <div class="approval-records" v-if="currentDetail">
          <h3>{{ t('overtime.list.dialog.detail.approvalProcess') }}</h3>
          <el-timeline>
            <el-timeline-item
              v-for="record in currentDetail.approvalRecords"
              :key="record.timestamp"
              :type="record.action === 'APPROVE' ? 'success' : 'danger'"
              :timestamp="new Date(record.timestamp).toLocaleString()"
            >
              <h4>{{ record.approverName }} ({{ record.role }})</h4>
              <p>{{ t('overtime.list.dialog.detail.approvalResult') }}：{{ record.action === 'APPROVE' ? t('overtime.list.dialog.approval.approve') : t('overtime.list.dialog.approval.reject') }}</p>
              <p>{{ t('overtime.list.dialog.approval.comment') }}：{{ record.comment }}</p>
            </el-timeline-item>
          </el-timeline>
        </div>
      </template>
    </el-dialog>

    <!-- 审批弹窗 -->
    <el-dialog
      v-model="approvalVisible"
      :title="t('overtime.list.dialog.approval.title')"
      width="500px"
    >
      <el-form :model="approvalForm" label-width="80px">
        <el-form-item :label="t('overtime.list.table.worker')">
          <span>{{ currentApprovalRequest?.workerName }}</span>
        </el-form-item>
        <el-form-item :label="t('overtime.list.table.startTime')">
          <span>{{ new Date(currentApprovalRequest?.startTime).toLocaleString() }}</span>
        </el-form-item>
        <el-form-item :label="t('overtime.list.table.endTime')">
          <span>{{ new Date(currentApprovalRequest?.endTime).toLocaleString() }}</span>
        </el-form-item>
        <el-form-item :label="t('overtime.list.table.reason')">
          <span>{{ currentApprovalRequest?.reason }}</span>
        </el-form-item>
        <el-form-item :label="t('overtime.list.dialog.approval.action')">
          <el-radio-group v-model="approvalForm.action">
            <el-radio label="APPROVE">{{ t('overtime.list.dialog.approval.approve') }}</el-radio>
            <el-radio label="REJECT">{{ t('overtime.list.dialog.approval.reject') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('overtime.list.dialog.approval.comment')">
          <el-input
            v-model="approvalForm.comment"
            type="textarea"
            :rows="3"
            :placeholder="t('overtime.list.dialog.approval.commentPlaceholder')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approvalVisible = false">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleApproval">{{ t('common.confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.overtime-record {
  padding: 12px;
  background-color: #F5F7FA;
  min-height: calc(100vh - 60px);
  width: 100%;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-header h2 {
  font-size: 18px;
  color: #303133;
  margin: 0;
  font-weight: 500;
}

.search-area {
  margin-bottom: 12px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.table-area {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.pagination {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
}

:deep(.el-card__body) {
  padding: 12px;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 12px;
  margin-bottom: 0;
}

:deep(.el-form-item__content) {
  line-height: 32px;
}

:deep(.el-table td, .el-table th) {
  padding: 8px 0;
}

:deep(.el-table .cell) {
  line-height: 20px;
}

.approval-process {
  margin-top: 16px;
}

.approval-process h3 {
  margin-bottom: 12px;
  font-size: 16px;
  color: #303133;
}

/* 色主题定 */
:deep(.el-button--primary) {
  --el-button-bg-color: #6B238E;
  --el-button-border-color: #6B238E;
  --el-button-hover-bg-color: #9B4BC3;
  --el-button-hover-border-color: #9B4BC3;
  --el-button-active-bg-color: #6B238E;
  --el-button-active-border-color: #6B238E;
}

:deep(.el-tag) {
  height: 22px;
  line-height: 20px;
  padding: 0 8px;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #FAFAFA;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: #E6D5F2;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #6B238E;
}

:deep(.el-select-dropdown__item.selected) {
  color: #6B238E;
}

:deep(.el-date-table td.current:not(.disabled) span) {
  background-color: #6B238E;
}

/* 表格内链接按钮样式 */
:deep(.el-button--link) {
  padding: 4px 8px;
  height: auto;
  color: #6B238E;
}

:deep(.el-button--link:hover) {
  color: #9B4BC3;
}

/* 弹窗样式 */
:deep(.el-dialog) {
  border-radius: 4px;
  margin-top: 15vh !important;
}

:deep(.el-dialog__header) {
  padding: 16px;
  border-bottom: 1px solid #E4E7ED;
}

:deep(.el-dialog__body) {
  padding: 16px;
}

:deep(.el-descriptions) {
  padding: 16px;
  background-color: #F5F7FA;
  border-radius: 4px;
}

:deep(.el-descriptions__label) {
  color: #606266;
  padding: 8px 12px;
}

:deep(.el-descriptions__content) {
  padding: 8px 12px;
}

:deep(.el-timeline-item__node--primary) {
  background-color: #6B238E;
}

:deep(.el-timeline-item__content) {
  color: #606266;
  padding-top: 0;
}

:deep(.el-timeline-item__timestamp) {
  font-size: 12px;
  color: #909399;
}

/* 选择器样式 */
:deep(.el-select .el-input__wrapper) {
  width: 160px;
  background-color: #fff;
}

:deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #6B238E inset !important;
}

:deep(.el-select-dropdown__item.selected) {
  color: #6B238E;
  font-weight: bold;
  background-color: #E6D5F2;
}

:deep(.el-select-dropdown__item:hover) {
  background-color: #F5F7FA;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #6B238E inset !important;
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #6B238E inset !important;
}

:deep(.el-select .el-select__tags) {
  background-color: transparent;
}

:deep(.el-select-dropdown.is-multiple .el-select-dropdown__item.selected) {
  background-color: #E6D5F2;
}

:deep(.el-select-dropdown__item.selected::after) {
  content: '';
  position: absolute;
  top: 50%;
  right: 20px;
  width: 6px;
  height: 6px;
  background-color: #6B238E;
  border-radius: 50%;
  transform: translateY(-50%);
}

/* 审批弹窗样式 */
:deep(.el-radio) {
  margin-right: 20px;
}

:deep(.el-form-item__content span) {
  line-height: 32px;
  color: #606266;
}

:deep(.el-form--inline) {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 0;
  margin-bottom: 12px;
  flex-grow: 0;
  flex-shrink: 0;
}

:deep(.el-table) {
  width: 100% !important;
}

:deep(.el-table__body-wrapper) {
  overflow-x: auto;
}

:deep(.el-tag) {
  white-space: normal;
  height: auto;
  min-height: 22px;
  line-height: 1.4;
  padding: 4px 8px;
  text-align: center;
}

@media screen and (max-width: 768px) {
  .overtime-record {
    padding: 8px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  :deep(.el-form--inline) {
    flex-direction: column;
  }

  :deep(.el-form--inline .el-form-item) {
    width: 100%;
    margin-right: 0;
  }

  :deep(.el-dialog) {
    width: 90% !important;
    margin: 10vh auto !important;
  }

  :deep(.el-form-item__label) {
    float: none;
    display: block;
    text-align: left;
    margin-bottom: 8px;
  }

  :deep(.el-dialog__body) {
    padding: 12px;
  }
}
</style> 