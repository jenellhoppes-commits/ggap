import type { DataScope, Portal, UserRole } from '../stores/auth'
import { runtimeConfig } from '../config/runtime'
import { loginPathByPortal } from '../config/permissions'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  trace_id?: string
}

export interface ListResult<T> {
  items: T[]
  page: number
  page_size: number
  total: number
}

export interface RequestScope {
  portal: Portal
  role: UserRole
  data_scope: DataScope
  agent_id?: string
  merchant_id?: string
}

export interface QueryParams {
  [key: string]: string | number | boolean | undefined | null
  keyword?: string
  date_from?: string
  date_to?: string
  status?: string
  merchant_id?: string
  agent_id?: string
  provider_id?: string
  display_currency?: string
  settlement_currency?: string
  page?: number
  page_size?: number
}

interface RequestOptions extends RequestInit {
  params?: QueryParams
  timeoutMs?: number
  skipAuthRedirect?: boolean
}

const API_BASE_URL = runtimeConfig.apiBaseUrl
const DEFAULT_TIMEOUT_MS = runtimeConfig.apiTimeoutMs

const buildUrl = (path: string, params?: QueryParams) => {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin)

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

const readRequestScope = (): Partial<RequestScope> => {
  const raw = localStorage.getItem('auth_user')

  if (!raw) return {}

  try {
    const user = JSON.parse(raw)
    return {
      portal: user.portal,
      role: user.role,
      data_scope: user.dataScope,
      agent_id: user.agentId,
      merchant_id: user.merchantId || user.merchantCode
    }
  } catch {
    return {}
  }
}

const buildScopeHeaders = () => {
  const scope = readRequestScope()

  return {
    ...(scope.portal ? { 'X-GGAP-Portal': scope.portal } : {}),
    ...(scope.role ? { 'X-GGAP-Role': scope.role } : {}),
    ...(scope.data_scope ? { 'X-GGAP-Data-Scope': scope.data_scope } : {}),
    ...(scope.agent_id ? { 'X-GGAP-Agent-Id': scope.agent_id } : {}),
    ...(scope.merchant_id ? { 'X-GGAP-Merchant-Id': scope.merchant_id } : {})
  }
}

const buildHeaders = (options: RequestOptions) => {
  const token = localStorage.getItem('auth_token')

  return {
    'Content-Type': 'application/json',
    ...buildScopeHeaders(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }
}

const parsePayload = async <T>(response: Response): Promise<T> => {
  const text = await response.text()

  if (!text) return null as T

  try {
    return JSON.parse(text) as T
  } catch {
    return {
      code: response.status,
      message: text,
      data: null
    } as T
  }
}

const clearAuthStorage = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_role')
  localStorage.removeItem('auth_user')
}

const readStoredPortal = (): Portal | null => {
  const scope = readRequestScope()
  return scope.portal || null
}

const resolveAppPath = (path: string) => {
  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${normalizedBase}${normalizedPath}` || normalizedPath
}

const handleAuthStatus = (status: number, path: string, options: RequestOptions) => {
  if (options.skipAuthRedirect || typeof window === 'undefined') return
  if (path.includes('/login')) return

  if (status === 401) {
    const portal = readStoredPortal()
    const loginPath = portal ? loginPathByPortal[portal] : '/login'
    clearAuthStorage()
    window.location.assign(`${resolveAppPath(loginPath)}?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)
  }

  if (status === 403 && window.location.pathname !== resolveAppPath('/403')) {
    window.location.assign(resolveAppPath('/403'))
  }
}

const fetchWithTimeout = async (url: string, options: RequestOptions) => {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS)

  try {
    return await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
      headers: buildHeaders(options)
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiRequestError('API request timeout', 408)
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export class ApiRequestError extends Error {
  code: number
  traceId?: string

  constructor(message: string, code: number, traceId?: string) {
    super(message)
    this.name = 'ApiRequestError'
    this.code = code
    this.traceId = traceId
  }
}

export const apiClient = {
  async rawRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetchWithTimeout(buildUrl(path, options.params), options)

    const payload = await parsePayload<T>(response)

    if (!response.ok) {
      const errorPayload = payload as Partial<ApiResponse<unknown>>
      handleAuthStatus(response.status, path, options)
      throw new ApiRequestError(errorPayload.message || 'API request failed', errorPayload.code || response.status, errorPayload.trace_id)
    }

    return payload
  },

  async request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const response = await fetchWithTimeout(buildUrl(path, options.params), options)

    const payload = await parsePayload<ApiResponse<T>>(response)

    if (!response.ok || payload.code !== 0) {
      handleAuthStatus(response.status, path, options)
      throw new ApiRequestError(payload.message || 'API request failed', payload.code || response.status, payload.trace_id)
    }

    return payload
  },

  get<T>(path: string, params?: QueryParams) {
    return this.request<T>(path, { method: 'GET', params })
  },

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body || {}) })
  },

  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PUT', body: JSON.stringify(body || {}) })
  },

  delete<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined })
  }
}

export const mockApiResponse = async <T>(data: T, delay = 120): Promise<ApiResponse<T>> => {
  await new Promise(resolve => window.setTimeout(resolve, delay))

  return {
    code: 0,
    message: 'OK',
    data,
    trace_id: `mock-${Date.now()}`
  }
}
