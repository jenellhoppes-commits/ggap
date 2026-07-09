import { apiClient } from '../apiClient'
import type { Game } from '../../types/game'
import type { Provider } from '../../types/provider'

export interface GameUpdatePayload {
  id: string
  status: 'active' | 'maintenance'
  rtp: number
  max_bet: number
}

export const adminContentService = {
  async listGames() {
    const response = await apiClient.get<{ list: Game[]; total: number }>('/api/v2/game/list')
    return response.data
  },

  async updateGame(payload: GameUpdatePayload) {
    const response = await apiClient.post('/api/v2/game/update', payload)
    return response.data
  },

  async saveProvider(payload: Partial<Provider>, mode: 'create' | 'edit') {
    const path = mode === 'create' ? '/api/admin/providers' : '/api/v2/providers/update'
    const response = await apiClient.post(path, payload)
    return response.data
  },

  async updateRtp(payload: { merchant_id?: number; rtp: number }) {
    const response = await apiClient.post('/api/v2/game/rtp', payload)
    return response.data
  }
}
