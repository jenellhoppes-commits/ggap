import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { ApiRequestError, apiClient } from '../services/apiClient'
import { shouldUseDemoData } from '../config/runtime'

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

const rolePortalMap: Record<UserRole, Portal> = {
  MASTER: 'admin',
  AGENT: 'agent',
  MERCHANT: 'merchant'
}

const roleDataScopeMap: Record<UserRole, DataScope> = {
  MASTER: 'global',
  AGENT: 'agent_tree',
  MERCHANT: 'merchant_self'
}

const wrongPortalMessage = '帳號角色與目前登入入口不符，請切換到正確入口。'
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

export const defaultPathByPortal: Record<Portal, string> = {
  admin: '/admin/dashboard',
  agent: '/agent/dashboard',
  merchant: '/merchant/dashboard'
}

export const loginPathByPortal: Record<Portal, string> = {
  admin: '/admin/login',
  agent: '/agent/login',
  merchant: '/merchant/login'
}

export const useAuthStore = defineStore('auth', () => {
  const token = useStorage<string | null>('auth_token', null)
  const userRole = useStorage<UserRole | null>('auth_role', null)
  const userInfo = useStorage<UserInfo | null>('auth_user', null)

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
    if (!requiredPortal) return true
    return portal.value === requiredPortal
  }

  const canAccessRole = (allowedRoles?: UserRole[]) => {
    if (!isAuthenticated.value || !userRole.value) return false
    if (!allowedRoles || allowedRoles.length === 0) return true
    return allowedRoles.includes(userRole.value)
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
