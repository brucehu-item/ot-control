import axiosInstance from './axios-instance'

export const overtimeApi = {
  // 创建加班申请
  createOvertimeRequest: async (requestData) => {
    const response = await axiosInstance.post('/overtime/overtime-requests', requestData)
    return response.data
  },

  // 查询加班申请列表
  getOvertimeRequests: async (params) => {
    const response = await axiosInstance.get('/overtime/overtime-requests', { params })
    return response.data
  },

  // 审批通过加班申请
  approveOvertimeRequest: async (requestId, approvalData) => {
    const response = await axiosInstance.post(
      `/overtime/overtime-requests/${requestId}/approve`,
      approvalData
    )
    return response.data
  },

  // 拒绝加班申请
  rejectOvertimeRequest: async (requestId, rejectionData) => {
    const response = await axiosInstance.post(
      `/overtime/overtime-requests/${requestId}/reject`,
      rejectionData
    )
    return response.data
  },

  // 取消加班申请
  cancelOvertimeRequest: async (requestId) => {
    const response = await axiosInstance.post(`/overtime/overtime-requests/${requestId}/cancel`)
    return response.data
  }
} 