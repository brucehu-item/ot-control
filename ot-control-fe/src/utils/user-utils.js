import { api } from '../api/api-config'

/**
 * 补充用户信息中的部门和场所名称
 * @param {Object} userInfo - 用户信息对象
 * @returns {Object} - 补充后的用户信息对象
 */
export const enrichUserInfo = async (userInfo) => {
  let enrichedInfo = { ...userInfo }
  let isUpdated = false

  if (enrichedInfo.departmentId && !enrichedInfo.departmentName) {
    try {
      const departments = await api.organization.getDepartments(enrichedInfo.facilityId)
      const department = departments.find(d => d.departmentId === enrichedInfo.departmentId)
      if (department) {
        enrichedInfo.departmentName = department.name
        isUpdated = true
      }
    } catch (error) {
      console.error('获取部门信息失败：', error)
    }
  }

  if (enrichedInfo.facilityId && !enrichedInfo.facilityName) {
    try {
      const facility = await api.organization.getFacilityDetails(enrichedInfo.facilityId)
      enrichedInfo.facilityName = facility.name
      isUpdated = true
    } catch (error) {
      console.error('获取场所信息失败：', error)
    }
  }

  return { enrichedInfo, isUpdated }
} 