import { apiClient } from '../apiClient'

export interface MerchantProviderSubscription {
  providerId: number
  code?: string
  name?: string
  globalStatus?: 'active' | 'maintenance' | 'disabled'
  status: 'active' | 'disabled'
  revenueShare: number
  excludedGames?: string[]
}

export const adminMerchantService = {
  async listProviderSubscriptions(merchantId: number) {
    const response = await apiClient.get<MerchantProviderSubscription[]>(`/api/v2/merchant/${merchantId}/providers`)
    return response.data
  },

  async saveProviderSubscriptions(merchantId: number, subscriptions: MerchantProviderSubscription[]) {
    const response = await apiClient.post(`/api/v2/merchant/${merchantId}/providers`, subscriptions)
    return response.data
  }
}
