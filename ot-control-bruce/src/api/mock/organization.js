import mockOrganization from '../../../../mock_data/organization.json'
import mockUsers from '../../../../mock_data/users.json'

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const organizationApi = {
  // 获取场所列表
  getFacilities: async () => {
    await delay(300)
    return mockOrganization.facilities
  },

  // 创建新场所
  createFacility: async (facilityData) => {
    await delay(500)
    const newFacility = {
      facilityId: `F${mockOrganization.facilities.length + 1}`.padStart(3, '0'),
      ...facilityData,
      customerIds: []
    }
    mockOrganization.facilities.push(newFacility)
    return newFacility
  },

  // 获取场所详情
  getFacilityDetails: async (facilityId) => {
    await delay(300)
    const facility = mockOrganization.facilities.find(f => f.facilityId === facilityId)
    if (!facility) {
      throw new Error('Facility not found')
    }
    return facility
  },

  // 获取场所的客户列表
  getFacilityCustomers: async (facilityId) => {
    await delay(300)
    const facility = mockOrganization.facilities.find(f => f.facilityId === facilityId)
    if (!facility) {
      throw new Error('Facility not found')
    }
    return mockUsers.users.filter(user => 
      facility.customerIds.includes(user.userId) && user.role === 'CUSTOMER'
    )
  },

  // 获取部门列表
  getDepartments: async (facilityId = null) => {
    await delay(300)
    if (facilityId) {
      return mockOrganization.departments.filter(d => d.facilityId === facilityId)
    }
    return mockOrganization.departments
  },

  // 创建新部门
  createDepartment: async (departmentData) => {
    await delay(500)
    const newDepartment = {
      departmentId: `D${mockOrganization.departments.length + 1}`.padStart(3, '0'),
      ...departmentData
    }
    mockOrganization.departments.push(newDepartment)
    return newDepartment
  }
} 