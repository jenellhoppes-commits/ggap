import { apiClient } from '../apiClient'

export interface PortalCredentials {
  merchant_code: string
  secret_key: string
  whitelist: string[]
}

export const portalDeveloperService = {
  async getCredentials() {
    const response = await apiClient.get<PortalCredentials>('/api/v2/agent/credentials')
    return response.data
  },

  async updateWhitelist(whitelist: string[]) {
    const response = await apiClient.post('/api/v2/agent/whitelist', { whitelist })
    return response.data
  }
}
