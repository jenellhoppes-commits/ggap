import { apiClient } from '../apiClient'
import type { Agent } from '../../types/agent'

export interface UpsertAgentPayload {
  id?: number
  account: string
  password?: string
  commission_rate: number
  status?: boolean
  state: 'active' | 'disabled'
  note?: string
}

export const portalOrganizationService = {
  async listAgents(params: { parent_id?: number | null; level?: number }) {
    const response = await apiClient.get<{ list: Agent[]; total: number }>('/api/v2/agents', {
      parent_id: params.parent_id || undefined,
      level: params.level
    })
    return response.data
  },

  async listSubAgents() {
    const response = await apiClient.get<{ list: Agent[]; total: number }>('/api/v2/agent/sub-agents')
    return response.data
  },

  async updateAgentState(agentId: number, state: 'active' | 'disabled') {
    const response = await apiClient.put(`/api/v2/merchant/agents/${agentId}`, { state })
    return response.data
  },

  async createAgent(payload: UpsertAgentPayload) {
    const response = await apiClient.post('/api/v2/merchant/agents', payload)
    return response.data
  },

  async updateAgent(agentId: number, payload: UpsertAgentPayload) {
    const response = await apiClient.put(`/api/v2/merchant/agents/${agentId}`, payload)
    return response.data
  },

  async transferToAgent(agentId: number, amount: number, type: 'deposit' | 'withdraw') {
    const response = await apiClient.post(`/api/v2/merchant/agents/${agentId}/transfer`, { amount, type })
    return response.data
  },

  async saveLegacyAgent(payload: Record<string, unknown>, mode: 'create' | 'edit') {
    const path = mode === 'create' ? '/api/v1/agent/create' : '/api/v1/agent/update'
    const response = mode === 'create'
      ? await apiClient.post(path, payload)
      : await apiClient.put(path, payload)
    return response.data
  }
}
