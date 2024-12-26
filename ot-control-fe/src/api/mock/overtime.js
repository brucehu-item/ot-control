import mockOvertimeRequests from '../../../../mock_data/overtime_requests.json'

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 生成新的加班申请ID
const generateRequestId = () => {
  const nextId = mockOvertimeRequests.overtimeRequests.length + 1
  return `OT${nextId.toString().padStart(3, '0')}`
}

// 获取当前时间
const getCurrentTime = () => new Date().toISOString()

export const overtimeApi = {
  // 创建加班申请
  createOvertimeRequest: async (requestData) => {
    await delay(500)
    const newRequest = {
      id: generateRequestId(),
      ...requestData,
      status: 'PENDING_SUPERVISOR',
      createdAt: getCurrentTime(),
      updatedAt: getCurrentTime(),
      approvalRecords: []
    }
    mockOvertimeRequests.overtimeRequests.push(newRequest)
    return newRequest
  },

  // 查询加班申请列表
  getOvertimeRequests: async (params = {}) => {
    await delay(300)
    let filteredRequests = [...mockOvertimeRequests.overtimeRequests]

    // 应用过滤条件
    if (params.workerId) {
      filteredRequests = filteredRequests.filter(r => r.workerId === params.workerId)
    }
    if (params.departmentId) {
      filteredRequests = filteredRequests.filter(r => r.departmentId === params.departmentId)
    }
    if (params.facilityId) {
      filteredRequests = filteredRequests.filter(r => r.facilityId === params.facilityId)
    }
    if (params.customerId) {
      filteredRequests = filteredRequests.filter(r => r.customerId === params.customerId)
    }
    if (params.status) {
      filteredRequests = filteredRequests.filter(r => r.status === params.status)
    }
    if (params.startDate) {
      const startDate = new Date(params.startDate)
      filteredRequests = filteredRequests.filter(r => new Date(r.startTime) >= startDate)
    }
    if (params.endDate) {
      const endDate = new Date(params.endDate)
      filteredRequests = filteredRequests.filter(r => new Date(r.endTime) <= endDate)
    }

    // 分页处理
    const page = params.page || 1
    const pageSize = params.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedRequests = filteredRequests.slice(start, end)

    return {
      requests: paginatedRequests,
      total: filteredRequests.length
    }
  },

  // 审批通过加班申请
  approveOvertimeRequest: async (requestId, approvalData) => {
    await delay(500)
    const request = mockOvertimeRequests.overtimeRequests.find(r => r.id === requestId)
    if (!request) {
      throw new Error('Overtime request not found')
    }

    const approvalRecord = {
      approverId: approvalData.approverId,
      role: approvalData.role,
      action: 'APPROVE',
      comment: approvalData.comment,
      timestamp: getCurrentTime()
    }

    request.approvalRecords.push(approvalRecord)
    request.updatedAt = getCurrentTime()

    // 更新状态
    switch (request.status) {
      case 'PENDING_SUPERVISOR':
        request.status = 'SUPERVISOR_APPROVED'
        break
      case 'SUPERVISOR_APPROVED':
        request.status = 'PENDING_CUSTOMER'
        break
      case 'PENDING_CUSTOMER':
        request.status = 'APPROVED'
        break
      default:
        break
    }

    return request
  },

  // 拒绝加班申请
  rejectOvertimeRequest: async (requestId, rejectionData) => {
    await delay(500)
    const request = mockOvertimeRequests.overtimeRequests.find(r => r.id === requestId)
    if (!request) {
      throw new Error('Overtime request not found')
    }

    const rejectionRecord = {
      approverId: rejectionData.approverId,
      role: rejectionData.role,
      action: 'REJECT',
      comment: rejectionData.comment,
      timestamp: getCurrentTime()
    }

    request.approvalRecords.push(rejectionRecord)
    request.status = 'REJECTED'
    request.updatedAt = getCurrentTime()

    return request
  },

  // 取消加班申请
  cancelOvertimeRequest: async (requestId) => {
    await delay(300)
    const request = mockOvertimeRequests.overtimeRequests.find(r => r.id === requestId)
    if (!request) {
      throw new Error('Overtime request not found')
    }

    request.status = 'CANCELLED'
    request.updatedAt = getCurrentTime()

    return request
  }
} 