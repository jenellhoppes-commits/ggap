import type { AgentMerchantRow } from './merchants'
import type { BetLog } from './reports'
import type { PlayerWallet } from '../admin/transactions'
import { createResourceService } from '../resourceAdapter'

export const agentMerchantResource = createResourceService<AgentMerchantRow>({
  list: '/api/v2/agent/merchants',
  detail: (id) => `/api/v2/agent/merchants/${id}`,
  create: '/api/v2/agent/merchants',
  update: (id) => `/api/v2/agent/merchants/${id}`,
  toggleStatus: (id) => `/api/v2/agent/merchants/${id}/status`,
  export: '/api/v2/agent/merchants/export'
})

export const agentBetTraceResource = createResourceService<BetLog>({
  list: '/api/v2/agent/reports/bet-trace',
  detail: (id) => `/api/v2/agent/reports/bet-trace/${id}`,
  export: '/api/v2/agent/reports/bet-trace/export'
})

export const merchantPlayerResource = createResourceService<PlayerWallet>({
  list: '/api/v2/merchant/players',
  detail: (id) => `/api/v2/merchant/players/${id}`,
  update: (id) => `/api/v2/merchant/players/${id}`,
  toggleStatus: (id) => `/api/v2/merchant/players/${id}/status`,
  export: '/api/v2/merchant/players/export'
})

export const merchantBetResource = createResourceService<BetLog>({
  list: '/api/v2/merchant/bets',
  detail: (id) => `/api/v2/merchant/bets/${id}`,
  export: '/api/v2/merchant/bets/export'
})
