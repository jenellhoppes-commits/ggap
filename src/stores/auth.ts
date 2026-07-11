import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { ApiRequestError, apiClient } from '../services/apiClient'
import { shouldUseDemoData } from '../config/runtime'
import {
  canAccessPortal as canAccessPortalPermission,
  canAccessRole as canAccessRolePermission,
  defaultPathByPortal,
  loginPathByPortal,
  resolveDataScopeByRole,
  resolvePortalByRole,
  roleDataScopeMap,
  rolePortalMap
} from '../config/permissions'

export type Portal = 'admin' | 'agent' | 'merchant'
export type UserRole = 'MASTER' | 'AGENT' | 'MERCHANT'
export type DataScope = 'global' | 'agent_tree' | 'merchant_self'

export interface UserInfo {
  id: string
  name: string
  account: string
  role: UserRole
  portal: Portal
  dataScope: DataScope
  agentId?: string
  agentLevel?: 1 | 2 | 3
  merchantId?: string
  merchantCode?: string
}

export interface LoginResult {
  success: boolean
  message?: string
}

interface LoginApiResponse {
  success: boolean
  message?: string
  token: string
  id?: string
  code?: string | null
  role: UserRole
  portal?: Portal
  data_scope?: DataScope
  name?: string
  agent_id?: string
  agent_level?: 1 | 2 | 3
  merchant_id?: string
  merchant_code?: string
}

const userInfoSerializer = {
  read: (raw: string): UserInfo | null => {
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as Partial<UserInfo> | null
      if (!parsed?.role) return null
      const role = parsed.role
      return {
        id: parsed.id || parsed.account || role,
        name: parsed.name || parsed.account || role,
        account: parsed.account || '',
        role,
        portal: parsed.portal || resolvePortalByRole(role),
        dataScope: parsed.dataScope || resolveDataScopeByRole(role),
        agentId: parsed.agentId,
        agentLevel: parsed.agentLevel,
        merchantId: parsed.merchantId,
        merchantCode: parsed.merchantCode
      }
    } catch {
      return null
    }
  },
  write: (value: UserInfo | null) => JSON.stringify(value)
}

const wrongPortalMessage = '請使用對應入口登入，此帳號不屬於目前入口。'
const invalidLoginMessage = '帳號或密碼錯誤，請重新確認。'
const loginFailedMessage = '登入失敗，請稍後再試。'

const createDemoLoginResponse = (username: string, password: string, expectedPortal?: Portal): LoginApiResponse => {
  const rejectWrongPortal = (accountPortal: Portal) => {
    if (!expectedPortal || expectedPortal === accountPortal) return null
    return {
      success: false,
      message: wrongPortalMessage,
      token: '',
      role: accountPortal === 'admin' ? 'MASTER' : accountPortal === 'agent' ? 'AGENT' : 'MERCHANT'
    } satisfies LoginApiResponse
  }

  if (username === 'admin' && password === 'admin123') {
    const wrongPortal = rejectWrongPortal('admin')
    if (wrongPortal) return wrongPortal

    return {
      success: true,
      token: `mock-master-token-${Date.now()}`,
      id: 'USR-MASTER',
      role: 'MASTER',
      portal: 'admin',
      data_scope: 'global',
      name: 'Super Admin',
      code: null
    }
  }

  if (username === 'agent' && password === 'agent123') {
    const wrongPortal = rejectWrongPortal('agent')
    if (wrongPortal) return wrongPortal

    return {
      success: true,
      token: `mock-agent-token-${Date.now()}`,
      id: 'USR-AGENT-L1',
      role: 'AGENT',
      portal: 'agent',
      data_scope: 'agent_tree',
      name: 'SEA Master Agent',
      agent_id: 'AGT-SEA-001',
      agent_level: 1,
      code: 'AGT-SEA-001'
    }
  }

  if (username === 'merchant' && password === '123456') {
    const wrongPortal = rejectWrongPortal('merchant')
    if (wrongPortal) return wrongPortal

    return {
      success: true,
      token: `mock-merchant-token-${Date.now()}`,
      id: 'USR-MERCHANT',
      role: 'MERCHANT',
      portal: 'merchant',
      data_scope: 'merchant_self',
      name: 'Golden Dragon',
      merchant_id: 'OP-1007',
      merchant_code: 'OP-1007',
      agent_id: 'AGT-SEA-001',
      code: 'OP-1007'
    }
  }

  return {
    success: false,
    message: invalidLoginMessage,
    token: '',
    role: expectedPortal === 'agent' ? 'AGENT' : expectedPortal === 'merchant' ? 'MERCHANT' : 'MASTER'
  }
}

export { defaultPathByPortal, loginPathByPortal }

export const useAuthStore = defineStore('auth', () => {
  const token = useStorage<string | null>('auth_token', null)
  const userRole = useStorage<UserRole | null>('auth_role', null)
  const userInfo = useStorage<UserInfo | null>('auth_user', null, undefined, { serializer: userInfoSerializer })

  const isAuthenticated = computed(() => !!token.value && !!userRole.value && !!userInfo.value)
  const portal = computed<Portal | null>(() => userInfo.value?.portal ?? (userRole.value ? rolePortalMap[userRole.value] : null))
  const dataScope = computed<DataScope | null>(() => userInfo.value?.dataScope ?? (userRole.value ? roleDataScopeMap[userRole.value] : null))
  const isMaster = computed(() => userRole.value === 'MASTER')
  const isAgent = computed(() => userRole.value === 'AGENT')
  const isMerchant = computed(() => userRole.value === 'MERCHANT')

  const login = async (username: string, password: string, expectedPortal?: Portal): Promise<LoginResult> => {
    try {
      const data = shouldUseDemoData()
        ? createDemoLoginResponse(username, password, expectedPortal)
        : await apiClient.rawRequest<LoginApiResponse>('/api/login', {
          method: 'POST',
          body: JSON.stringify({ username, password, portal: expectedPortal })
        })

      if (!data.success) return { success: false, message: data.message || invalidLoginMessage }

      const role = data.role as UserRole
      const resolvedPortal = (data.portal || rolePortalMap[role]) as Portal

      if (expectedPortal && resolvedPortal !== expectedPortal) {
        return { success: false, message: wrongPortalMessage }
      }

      token.value = data.token
      userRole.value = role
      userInfo.value = {
        id: data.id || data.code || username,
        name: data.name || username,
        account: username,
        role,
        portal: resolvedPortal,
        dataScope: (data.data_scope || roleDataScopeMap[role]) as DataScope,
        agentId: data.agent_id,
        agentLevel: data.agent_level,
        merchantId: data.merchant_id,
        merchantCode: data.merchant_code || data.code || undefined
      }

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      if (error instanceof ApiRequestError) return { success: false, message: error.message }
      return { success: false, message: loginFailedMessage }
    }
  }

  const logout = () => {
    token.value = null
    userRole.value = null
    userInfo.value = null
  }

  const checkAuth = () => isAuthenticated.value

  const canAccessPortal = (requiredPortal?: Portal) => {
    if (!isAuthenticated.value) return false
    return canAccessPortalPermission(portal.value, requiredPortal)
  }

  const canAccessRole = (allowedRoles?: UserRole[]) => {
    if (!isAuthenticated.value || !userRole.value) return false
    return canAccessRolePermission(userRole.value, allowedRoles)
  }

  return {
    token,
    userRole,
    userInfo,
    portal,
    dataScope,
    isAuthenticated,
    isMaster,
    isAgent,
    isMerchant,
    login,
    logout,
    checkAuth,
    canAccessPortal,
    canAccessRole
  }
})
