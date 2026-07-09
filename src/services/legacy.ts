import { apiClient } from './apiClient'
import type { BetLog } from '../types/report'
import type { Merchant, MerchantDetail } from '../types/merchant'

export const legacyService = {
  async queryBetLogs(payload: Record<string, unknown>) {
    const response = await apiClient.post<{ list: BetLog[]; total: number }>('/api/v2/report/bet-logs', payload)
    return response.data
  },

  async listMerchants(params: { level?: number; parent_id?: number; search?: string }) {
    const response = await apiClient.get<{ list: Merchant[]; total: number }>('/api/v2/agent/list', params)
    return response.data
  },

  async getMerchantDetail(id: number) {
    const response = await apiClient.get<MerchantDetail>(`/api/v2/agent/${id}`)
    return response.data
  },

  async updateMerchantDetail(payload: MerchantDetail) {
    const response = await apiClient.post('/api/v2/agent/update', payload)
    return response.data
  },

  async createMerchant(payload: Record<string, unknown>) {
    const response = await apiClient.post('/api/v2/agent/management/agents', payload)
    return response.data
  }
}
