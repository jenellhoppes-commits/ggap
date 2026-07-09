import { apiClient } from '../apiClient'
import type { FundRecord } from '../../types/finance'

export const adminFinanceService = {
  async listFunds(params: {
    type?: string
    status?: string
    merchant_name?: string
  }) {
    const response = await apiClient.get<{ list: FundRecord[]; total: number }>('/api/admin/funds', params)
    return response.data
  },

  async reviewFund(id: string, payload: { action: 'approve' | 'reject'; reason?: string }) {
    const response = await apiClient.post(`/api/admin/funds/${id}/review`, payload)
    return response.data
  },

  async manualAdjust(payload: {
    merchant_id: string
    merchant_name: string
    type: 'manual-adjust'
    amount: number
    reason: string
  }) {
    const response = await apiClient.post('/api/admin/funds/adjust', payload)
    return response.data
  }
}
