import type { DataScope, Portal, UserRole } from '../stores/auth'

export interface PortalPermission {
  portal: Portal
  role: UserRole
  dataScope: DataScope
  loginPath: string
  defaultPath: string
  label: string
  description: string
}

export const PORTAL_PERMISSIONS: Record<Portal, PortalPermission> = {
  admin: {
    portal: 'admin',
    role: 'MASTER',
    dataScope: 'global',
    loginPath: '/admin/login',
    defaultPath: '/admin/dashboard',
    label: '管理者後台',
    description: '全域營運、商務、內容、交易、財務、品質與系統管理。'
  },
  agent: {
    portal: 'agent',
    role: 'AGENT',
    dataScope: 'agent_tree',
    loginPath: '/agent/login',
    defaultPath: '/agent/dashboard',
    label: '代理後台',
    description: '查看代理帳務、下級代理、關聯商戶與代理範圍報表。'
  },
  merchant: {
    portal: 'merchant',
    role: 'MERCHANT',
    dataScope: 'merchant_self',
    loginPath: '/merchant/login',
    defaultPath: '/merchant/dashboard',
    label: '商戶後台',
    description: '查看會員、投注、遊戲、帳務參考與 API 串接資訊。'
  }
}

export const loginPathByPortal = Object.fromEntries(
  Object.entries(PORTAL_PERMISSIONS).map(([portal, permission]) => [portal, permission.loginPath])
) as Record<Portal, string>

export const defaultPathByPortal = Object.fromEntries(
  Object.entries(PORTAL_PERMISSIONS).map(([portal, permission]) => [portal, permission.defaultPath])
) as Record<Portal, string>

export const rolePortalMap = Object.fromEntries(
  Object.entries(PORTAL_PERMISSIONS).map(([portal, permission]) => [permission.role, portal])
) as Record<UserRole, Portal>

export const roleDataScopeMap = Object.fromEntries(
  Object.values(PORTAL_PERMISSIONS).map((permission) => [permission.role, permission.dataScope])
) as Record<UserRole, DataScope>

export const canAccessPortal = (currentPortal: Portal | null | undefined, requiredPortal?: Portal) => {
  if (!requiredPortal) return true
  return currentPortal === requiredPortal
}

export const canAccessRole = (currentRole: UserRole | null | undefined, allowedRoles?: UserRole[]) => {
  if (!allowedRoles || allowedRoles.length === 0) return true
  if (!currentRole) return false
  return allowedRoles.includes(currentRole)
}

export const resolvePortalByRole = (role: UserRole) => rolePortalMap[role]
export const resolveDataScopeByRole = (role: UserRole) => roleDataScopeMap[role]
