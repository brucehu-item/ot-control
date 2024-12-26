import axiosInstance from './axios-instance'

export const organizationApi = {
  // 获取场所列表
  getFacilities: async () => {
    const response = await axiosInstance.get('/organization/facilities')
    return response.data
  },

  // 创建新场所
  createFacility: async (facilityData) => {
    const response = await axiosInstance.post('/organization/facilities', facilityData)
    return response.data
  },

  // 获取场所详情
  getFacilityDetails: async (facilityId) => {
    const response = await axiosInstance.get(`/organization/facilities/${facilityId}`)
    return response.data
  },

  // 获取场所的客户列表
  getFacilityCustomers: async (facilityId) => {
    const response = await axiosInstance.get(`/organization/facilities/${facilityId}/customers`)
    return response.data
  },

  // 获取部门列表
  getDepartments: async (facilityId = null) => {
    const params = facilityId ? { facilityId } : {}
    const response = await axiosInstance.get('/organization/departments', { params })
    return response.data
  },

  // 创建新部门
  createDepartment: async (departmentData) => {
    const response = await axiosInstance.post('/organization/departments', departmentData)
    return response.data
  }
} 