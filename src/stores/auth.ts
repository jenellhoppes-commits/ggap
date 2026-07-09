import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { ApiRequestError, apiClient } from '../services/apiClient'

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
            const data = await apiClient.rawRequest<LoginApiResponse>('/api/login', {
                method: 'POST',
                body: JSON.stringify({ username, password, portal: expectedPortal })
            })

            if (!data.success) {
                return { success: false, message: data.message || '登入失敗，請確認帳號與密碼。' }
            }

            const role = data.role as UserRole
            const resolvedPortal = (data.portal || rolePortalMap[role]) as Portal

            if (expectedPortal && resolvedPortal !== expectedPortal) {
                return { success: false, message: '此帳號不可登入目前入口，請切換正確後台。' }
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
                merchantCode: data.code || data.merchant_code
            }

            return { success: true }
        } catch (error) {
            console.error('Login error:', error)
            if (error instanceof ApiRequestError) {
                return { success: false, message: error.message }
            }
            return { success: false, message: '登入連線失敗，請稍後再試。' }
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
