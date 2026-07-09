import { apiClient } from '../apiClient'

export interface PortalGame {
  game_id: string
  game_code: string
  name_en: string
  name_zh?: string
  provider: string
  type: string
  rtp: number
  merchant_enabled: boolean
  master_enabled: boolean
  thumbnail?: string
  release_date: string
  admin_status: 'active' | 'maintenance' | 'disabled'
}

export const portalGameService = {
  async listGames() {
    const response = await apiClient.get<{ list: PortalGame[]; total: number }>('/api/v2/agent/games')
    return response.data
  },

  async toggleGame(gameId: string, enabled: boolean) {
    const response = await apiClient.post('/api/v2/agent/games/toggle', {
      game_id: gameId,
      enabled
    })
    return response.data
  }
}
