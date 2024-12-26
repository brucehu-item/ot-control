import { authenticationApi } from './authentication'
import { organizationApi } from './organization'
import { overtimeApi } from './overtime'

import { authenticationApi as mockAuthenticationApi } from './mock/authentication'
import { organizationApi as mockOrganizationApi } from './mock/organization'
import { overtimeApi as mockOvertimeApi } from './mock/overtime'

const VITE_USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const api = {
  auth: VITE_USE_MOCK ? mockAuthenticationApi : authenticationApi,
  organization: VITE_USE_MOCK ? mockOrganizationApi : organizationApi,
  overtime: VITE_USE_MOCK ? mockOvertimeApi : overtimeApi
} 