import { apiClient, type ApiResponse, type ListResult, type QueryParams } from './apiClient'

export interface ApiListMeta {
  page: number
  page_size: number
  total: number
}

export interface ApiListEnvelope<T> {
  items?: T[]
  list?: T[]
  rows?: T[]
  meta?: Partial<ApiListMeta>
  page?: number
  page_size?: number
  total?: number
}

export interface ListQuery extends QueryParams {
  sort_by?: string
  sort_order?: 'ascend' | 'descend' | 'asc' | 'desc'
}

export interface ResourceEndpoints {
  list: string
  detail?: (id: string | number) => string
  create?: string
  update?: (id: string | number) => string
  toggleStatus?: (id: string | number) => string
  export?: string
}

export interface ResourceService<TList, TDetail = TList, TCreate = Partial<TDetail>, TUpdate = Partial<TDetail>> {
  list(params?: ListQuery): Promise<ListResult<TList>>
  detail(id: string | number): Promise<TDetail>
  create(payload: TCreate): Promise<TDetail>
  update(id: string | number, payload: TUpdate): Promise<TDetail>
  toggleStatus(id: string | number, payload?: unknown): Promise<TDetail>
  export(params?: ListQuery): Promise<unknown>
}

const normalizeSortOrder = (sortOrder?: ListQuery['sort_order']) => {
  if (sortOrder === 'ascend') return 'asc'
  if (sortOrder === 'descend') return 'desc'
  return sortOrder
}

export const toBackendListParams = (params: ListQuery = {}): QueryParams => ({
  ...params,
  sort_order: normalizeSortOrder(params.sort_order)
})

export const normalizeListResult = <T>(payload: ApiListEnvelope<T> | T[]): ListResult<T> => {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      page: 1,
      page_size: payload.length,
      total: payload.length
    }
  }

  const items = payload.items || payload.list || payload.rows || []
  const page = payload.meta?.page || payload.page || 1
  const pageSize = payload.meta?.page_size || payload.page_size || items.length || 10
  const total = payload.meta?.total || payload.total || items.length

  return {
    items,
    page,
    page_size: pageSize,
    total
  }
}

const unwrap = <T>(response: ApiResponse<T>) => response.data

const requireEndpoint = (endpoint: string | undefined, action: string) => {
  if (!endpoint) throw new Error(`Resource endpoint for ${action} is not configured`)
  return endpoint
}

export const createResourceService = <TList, TDetail = TList, TCreate = Partial<TDetail>, TUpdate = Partial<TDetail>>(
  endpoints: ResourceEndpoints
): ResourceService<TList, TDetail, TCreate, TUpdate> => ({
  async list(params: ListQuery = {}) {
    const response = await apiClient.get<ApiListEnvelope<TList> | TList[]>(endpoints.list, toBackendListParams(params))
    return normalizeListResult(unwrap(response))
  },

  async detail(id) {
    const response = await apiClient.get<TDetail>(requireEndpoint(endpoints.detail?.(id), 'detail'))
    return unwrap(response)
  },

  async create(payload) {
    const response = await apiClient.post<TDetail>(requireEndpoint(endpoints.create, 'create'), payload)
    return unwrap(response)
  },

  async update(id, payload) {
    const response = await apiClient.put<TDetail>(requireEndpoint(endpoints.update?.(id), 'update'), payload)
    return unwrap(response)
  },

  async toggleStatus(id, payload = {}) {
    const response = await apiClient.post<TDetail>(requireEndpoint(endpoints.toggleStatus?.(id), 'toggleStatus'), payload)
    return unwrap(response)
  },

  async export(params: ListQuery = {}) {
    const response = await apiClient.get<unknown>(requireEndpoint(endpoints.export, 'export'), toBackendListParams(params))
    return unwrap(response)
  }
})
