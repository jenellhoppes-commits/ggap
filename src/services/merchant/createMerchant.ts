import { shouldUseDemoData } from '../../config/runtime'
import type { Merchant, MerchantCurrency, MerchantQuoteRate, MerchantStatus, MerchantWalletMode } from '../../types/merchant'
import { apiClient, mockApiResponse } from '../apiClient'

export type MerchantCreateMode = 'admin' | 'agent'

export interface MerchantCreatePayload {
  mode: MerchantCreateMode
  merchant_name: string
  site_code: string
  manager_account: string
  initial_password?: string
  contact_name?: string
  contact_email?: string
  telegram?: string
  phone?: string
  remarks?: string
  status: MerchantStatus
  agent_id: number
  agent_code: string
  agent_name: string
  agent_path: string
  agent_level: 1 | 2 | 3
  settlement_agent_id: string
  wallet_mode: MerchantWalletMode
  display_currencies: MerchantCurrency[]
  default_display_currency: MerchantCurrency
  settlement_currency: 'USDT'
  api_status: 'testing' | 'active' | 'disabled'
  environment: 'sandbox' | 'production'
  sign_method: 'HMAC-SHA256' | 'RSA'
  callback_url?: string
  ip_whitelist: string[]
  timeout_ms: number
  retry_count: number
  allow_negative_balance: boolean
  idempotency_enabled: boolean
  credit_limit: number
  authorized_providers: string[]
  game_package: string
  service_fee_rate: number
  merchant_provider_rates: MerchantQuoteRate[]
}

export interface AgentOption {
  label: string
  value: string
  id: number
  code: string
  name: string
  direct: boolean
  level: 1 | 2 | 3
  parent: string | null
  root: string
  settlement: string
  path: string
  rates: Record<string, number>
}

export interface ProviderRateOption {
  key: string
  provider_id: string
  provider_name: string
  provider_cost_rate: number
}

export const providerRateOptions: ProviderRateOption[] = [
  { key: 'pg', provider_id: 'PG', provider_name: 'PG Soft', provider_cost_rate: 0.04 },
  { key: 'jili', provider_id: 'JILI', provider_name: 'JILI', provider_cost_rate: 0.05 },
  { key: 'evo', provider_id: 'EVO', provider_name: 'Evolution', provider_cost_rate: 0.06 },
  { key: 'pp', provider_id: 'PP', provider_name: 'Pragmatic Play', provider_cost_rate: 0.05 },
  { key: 'habanero', provider_id: 'HAB', provider_name: 'Habanero', provider_cost_rate: 0.055 }
]

const agentOptions: AgentOption[] = [
  { label: 'L1 平台直營代理', value: '平台直營代理', id: 1, code: 'AGT-DIRECT', name: '平台直營代理', direct: true, level: 1, parent: null, root: 'AGT-DIRECT', settlement: 'AGT-DIRECT', path: 'AGT-DIRECT', rates: { pg: 0.07, jili: 0.085, evo: 0.1, pp: 0.082, habanero: 0.09 } },
  { label: 'L1 SEA Growth Agent', value: 'SEA Growth Agent', id: 2, code: 'AGT-SEA-001', name: 'SEA Growth Agent', direct: false, level: 1, parent: null, root: 'AGT-SEA-001', settlement: 'AGT-SEA-001', path: 'AGT-SEA-001', rates: { pg: 0.075, jili: 0.09, evo: 0.095, pp: 0.078, habanero: 0.088 } },
  { label: 'L2 SEA Sub Agent 01', value: 'SEA Sub Agent 01', id: 3, code: 'AGT-SEA-SUB01', name: 'SEA Sub Agent 01', direct: false, level: 2, parent: 'AGT-SEA-001', root: 'AGT-SEA-001', settlement: 'AGT-SEA-001', path: 'AGT-SEA-001 / AGT-SEA-SUB01', rates: { pg: 0.088, jili: 0.102, evo: 0.108, pp: 0.092, habanero: 0.1 } },
  { label: 'L3 SEA Local Desk L3', value: 'SEA Local Desk L3', id: 4, code: 'AGT-SEA-SUB01-L3', name: 'SEA Local Desk L3', direct: false, level: 3, parent: 'AGT-SEA-SUB01', root: 'AGT-SEA-001', settlement: 'AGT-SEA-001', path: 'AGT-SEA-001 / AGT-SEA-SUB01 / AGT-SEA-SUB01-L3', rates: { pg: 0.096, jili: 0.11, evo: 0.116, pp: 0.1, habanero: 0.108 } }
]

export const listAvailableMerchantAgents = async (mode: MerchantCreateMode) => {
  if (shouldUseDemoData()) {
    const filtered = mode === 'admin'
      ? agentOptions
      : agentOptions.filter(agent => agent.code === 'AGT-DIRECT' || agent.root === 'AGT-DIRECT')

    const response = await mockApiResponse(filtered)
    return response.data
  }

  const response = await apiClient.get<AgentOption[]>(mode === 'admin' ? '/api/v2/admin/agents/options' : '/api/v2/agent/merchant-agent-options')
  return response.data
}

export const buildMerchantFromPayload = (payload: MerchantCreatePayload): Merchant => {
  const now = new Date().toISOString()
  const displayId = `OP-${Math.floor(1000 + Math.random() * 9000)}`

  return {
    id: Date.now(),
    display_id: displayId,
    site_code: payload.site_code,
    merchant_name: payload.merchant_name,
    merchant_type: 'merchant',
    account: payload.manager_account,
    name: payload.merchant_name,
    contact_name: payload.contact_name,
    contact_email: payload.contact_email,
    telegram: payload.telegram,
    phone: payload.phone,
    remarks: payload.remarks,
    currency_type: payload.default_display_currency,
    multi_currency_enabled: payload.display_currencies.length > 1,
    display_currencies: payload.display_currencies,
    default_display_currency: payload.default_display_currency,
    settlement_currency: 'USDT',
    callback_amount_mode: 'settlement_currency',
    service_fee_rate: payload.service_fee_rate,
    percent: 0,
    settlement_cycle: 'daily',
    authorized_providers: payload.authorized_providers,
    enabled_provider_count: payload.authorized_providers.length,
    enabled_game_count: 0,
    game_package: payload.game_package,
    state: payload.status === 'active' ? 1 : 0,
    status: payload.status,
    created_at: now,
    updated_at: now,
    walletMode: payload.wallet_mode,
    wallet_mode: payload.wallet_mode,
    api_key: `ak_${displayId.toLowerCase()}`,
    api_secret_masked: 'sk_live_****************',
    callback_url: payload.callback_url,
    ipWhitelist: payload.ip_whitelist,
    ip_whitelist: payload.ip_whitelist,
    sign_method: payload.sign_method,
    api_status: payload.api_status,
    environment: payload.environment,
    timeout_ms: payload.timeout_ms,
    retry_count: payload.retry_count,
    allow_negative_balance: payload.allow_negative_balance,
    idempotency_enabled: payload.idempotency_enabled,
    credit_limit: payload.credit_limit,
    agent_id: payload.agent_id,
    agent_code: payload.agent_code,
    agent_name: payload.agent_name,
    agent_level: payload.agent_level,
    root_agent_code: payload.settlement_agent_id,
    settlement_agent_code: payload.settlement_agent_id,
    agent_path: payload.agent_path,
    settlement_owner_type: 'agent',
    agent_binding: true,
    merchant_quote_rates: payload.merchant_provider_rates,
    agent_effective_at: now,
    today_bet: 0,
    today_payout: 0,
    today_ggr: 0,
    settlement_today_ggr: 0,
    transaction_success_rate: 100
  }
}

export const createMerchant = async (payload: MerchantCreatePayload) => {
  if (shouldUseDemoData()) {
    const response = await mockApiResponse(buildMerchantFromPayload(payload))
    return response.data
  }

  const endpoint = payload.mode === 'admin' ? '/api/v2/admin/merchants' : '/api/v2/agent/merchants'
  const response = await apiClient.post<Merchant>(endpoint, payload)
  return response.data
}
