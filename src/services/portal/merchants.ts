import { shouldUseDemoData } from '../../config/runtime'
import { apiClient, mockApiResponse } from '../apiClient'

export interface AgentMerchantRow {
  merchant_id: string
  merchant_name: string
  agent_path: string
  status: 'active' | 'disabled' | 'maintenance'
  wallet_mode: 'Seamless' | 'Transfer'
  currencies: string[]
  settlement_currency: 'USDT'
  merchant_rate: number
  today_bet_usdt: number
  today_ggr_usdt: number
}

export interface AgentMerchantCreatePayload {
  merchant_name: string
  site_code: string
  manager_account: string
  callback_url?: string
  agent_path: string
  wallet_mode: AgentMerchantRow['wallet_mode']
  currencies: string[]
  service_fee_rate: number
  provider_rate_mode: string
  status: AgentMerchantRow['status']
}

export interface AgentMerchantListParams {
  keyword?: string
  status?: string | null
}

const demoRows: AgentMerchantRow[] = [
  { merchant_id: 'OP-1001', merchant_name: 'Blue Whale Interactive', agent_path: '平台直營代理', status: 'active', wallet_mode: 'Seamless', currencies: ['TWD', 'PHP'], settlement_currency: 'USDT', merchant_rate: 8.5, today_bet_usdt: 42100, today_ggr_usdt: 3180 },
  { merchant_id: 'OP-1002', merchant_name: 'HyperWin Network', agent_path: '平台直營代理 / SEA L2', status: 'active', wallet_mode: 'Transfer', currencies: ['IDR', 'VND'], settlement_currency: 'USDT', merchant_rate: 9.2, today_bet_usdt: 58200, today_ggr_usdt: 4960 },
  { merchant_id: 'OP-1003', merchant_name: 'Lucky Star Digital', agent_path: '平台直營代理 / SEA L2', status: 'maintenance', wallet_mode: 'Seamless', currencies: ['THB'], settlement_currency: 'USDT', merchant_rate: 7.8, today_bet_usdt: 12800, today_ggr_usdt: -430 },
  { merchant_id: 'OP-1004', merchant_name: 'NovaPlay Entertainment', agent_path: '平台直營代理 / SEA L2 / VN L3', status: 'disabled', wallet_mode: 'Transfer', currencies: ['VND'], settlement_currency: 'USDT', merchant_rate: 9.8, today_bet_usdt: 0, today_ggr_usdt: 0 }
]

let demoStore = [...demoRows]

const filterRows = (rows: AgentMerchantRow[], params: AgentMerchantListParams = {}) => rows.filter((row) => {
  const text = `${row.merchant_id} ${row.merchant_name} ${row.agent_path}`.toLowerCase()
  const keyword = params.keyword?.toLowerCase()

  return (!keyword || text.includes(keyword)) && (!params.status || row.status === params.status)
})

const createDemoMerchant = (payload: AgentMerchantCreatePayload, defaultMerchantRate: number): AgentMerchantRow => ({
  merchant_id: `OP-${Math.floor(1000 + Math.random() * 9000)}`,
  merchant_name: payload.merchant_name,
  agent_path: payload.agent_path,
  status: payload.status,
  wallet_mode: payload.wallet_mode,
  currencies: [...payload.currencies],
  settlement_currency: 'USDT',
  merchant_rate: Number(defaultMerchantRate.toFixed(2)),
  today_bet_usdt: 0,
  today_ggr_usdt: 0
})

export const portalMerchantService = {
  async listMerchants(params: AgentMerchantListParams = {}) {
    if (shouldUseDemoData()) {
      const response = await mockApiResponse(filterRows(demoStore, params))
      return response.data
    }

    const response = await apiClient.get<AgentMerchantRow[]>('/api/v2/agent/merchants', {
      keyword: params.keyword,
      status: params.status || undefined
    })
    return response.data
  },

  async createMerchant(payload: AgentMerchantCreatePayload, defaultMerchantRate: number) {
    if (shouldUseDemoData()) {
      const merchant = createDemoMerchant(payload, defaultMerchantRate)
      demoStore = [merchant, ...demoStore]
      const response = await mockApiResponse(merchant)
      return response.data
    }

    const response = await apiClient.post<AgentMerchantRow>('/api/v2/agent/merchants', payload)
    return response.data
  }
}
