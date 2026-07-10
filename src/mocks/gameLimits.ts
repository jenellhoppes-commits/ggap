import type {
  AgentBetLimitAccess,
  BetLimitSnapshot,
  GameBetLimitGroup,
  MerchantBetLimitGroup,
  PlayerBetLimit
} from '../types/gameLimit'

export const gameLimitGroupsByGameId: Record<string, GameBetLimitGroup[]> = {
  'PG-001': [
    { limit_group_code: 'GL-PG-SLOT-GEN', limit_group_name: 'Slot 一般會員', group_level: 'GENERAL', display_currency: 'TWD', min_bet_display: 0.1, max_bet_display: 2000, bet_step_display: 0.1, provider_limit_code: 'PG-LIMIT-MAX', merchant_count: 18, is_default: true, status: 'active', version: '2026.07' },
    { limit_group_code: 'GL-PG-SLOT-VIP1', limit_group_name: 'Slot VIP 2000-5000', group_level: 'HIGH', display_currency: 'TWD', min_bet_display: 2000, max_bet_display: 5000, bet_step_display: 100, provider_limit_code: 'PG-LIMIT-MAX', merchant_count: 5, is_default: false, status: 'active', version: '2026.07' },
    { limit_group_code: 'GL-PG-SLOT-VIP2', limit_group_name: 'Slot VIP 5000-10000', group_level: 'VIP', display_currency: 'TWD', min_bet_display: 5000, max_bet_display: 10000, bet_step_display: 100, provider_limit_code: 'PG-LIMIT-MAX', merchant_count: 2, is_default: false, status: 'draft', version: '2026.07' }
  ],
  'PG-002': [
    { limit_group_code: 'GL-PG-SLOT-GEN', limit_group_name: 'Slot 一般會員', group_level: 'GENERAL', display_currency: 'PHP', min_bet_display: 5, max_bet_display: 30000, bet_step_display: 5, provider_limit_code: 'PG-LIMIT-MAX', merchant_count: 15, is_default: true, status: 'active', version: '2026.07' },
    { limit_group_code: 'GL-PG-SLOT-VIP1', limit_group_name: 'Slot VIP 30000-80000', group_level: 'HIGH', display_currency: 'PHP', min_bet_display: 30000, max_bet_display: 80000, bet_step_display: 1000, provider_limit_code: 'PG-LIMIT-MAX', merchant_count: 4, is_default: false, status: 'active', version: '2026.07' }
  ],
  'EVO-001': [
    { limit_group_code: 'GL-EVO-BAC-GEN', limit_group_name: '百家樂一般會員', group_level: 'GENERAL', display_currency: 'THB', min_bet_display: 20, max_bet_display: 50000, bet_step_display: 20, provider_limit_code: 'EVO-TABLE-MAX', merchant_count: 11, is_default: true, status: 'active', version: '2026.07' },
    { limit_group_code: 'GL-EVO-BAC-VIP', limit_group_name: '百家樂 VIP 桌限', group_level: 'VIP', display_currency: 'THB', min_bet_display: 50000, max_bet_display: 200000, bet_step_display: 1000, provider_limit_code: 'EVO-TABLE-MAX', merchant_count: 3, is_default: false, status: 'active', version: '2026.07' }
  ],
  'PP-001': [
    { limit_group_code: 'GL-PP-SLOT-GEN', limit_group_name: 'PP 一般會員', group_level: 'GENERAL', display_currency: 'PHP', min_bet_display: 10, max_bet_display: 40000, bet_step_display: 10, provider_limit_code: 'PP-LIMIT-HIGH', merchant_count: 20, is_default: true, status: 'active', version: '2026.07' },
    { limit_group_code: 'GL-PP-SLOT-VIP', limit_group_name: 'PP VIP 40000-100000', group_level: 'VIP', display_currency: 'PHP', min_bet_display: 40000, max_bet_display: 100000, bet_step_display: 1000, provider_limit_code: 'PP-LIMIT-HIGH', merchant_count: 6, is_default: false, status: 'active', version: '2026.07' }
  ],
  'JILI-001': [
    { limit_group_code: 'GL-JILI-SLOT-GEN', limit_group_name: 'JILI 一般會員', group_level: 'GENERAL', display_currency: 'VND', min_bet_display: 1000, max_bet_display: 25000000, bet_step_display: 1000, provider_limit_code: 'JILI-DEFAULT-MAX', merchant_count: 7, is_default: true, status: 'active', version: '2026.07' }
  ]
}

export const getGameLimitGroups = (gameId: string) => gameLimitGroupsByGameId[gameId] ?? []

export const makeAgentLimitAccess = (currency: string, childAssignable = true): AgentBetLimitAccess[] => [
  { provider_id: 'PG', provider_name: 'PG Soft', game_type: 'Slot', limit_group_code: 'GL-PG-SLOT-GEN', limit_group_name: 'Slot 一般會員', min_bet_display: currency === 'VND' ? 1000 : 0.1, max_bet_display: currency === 'VND' ? 25000000 : 2000, display_currency: currency, assignable_to_child: childAssignable, assigned_merchant_count: 8, status: 'active' },
  { provider_id: 'PG', provider_name: 'PG Soft', game_type: 'Slot', limit_group_code: 'GL-PG-SLOT-VIP1', limit_group_name: 'Slot VIP 2000-5000', min_bet_display: currency === 'PHP' ? 30000 : 2000, max_bet_display: currency === 'PHP' ? 80000 : 5000, display_currency: currency, assignable_to_child: childAssignable, assigned_merchant_count: 3, status: 'active' },
  { provider_id: 'EVO', provider_name: 'Evolution', game_type: 'Live', limit_group_code: 'GL-EVO-BAC-GEN', limit_group_name: '百家樂一般會員', min_bet_display: currency === 'THB' ? 20 : 1, max_bet_display: currency === 'THB' ? 50000 : 2000, display_currency: currency, assignable_to_child: childAssignable, assigned_merchant_count: 4, status: 'active' }
]

export const makeMerchantLimitGroups = (currencies: string[], fallbackCurrency: string): MerchantBetLimitGroup[] => {
  const primaryCurrency = currencies[0] || fallbackCurrency
  const secondaryCurrency = currencies[1] || primaryCurrency

  return [
    { provider_name: 'PG Soft', game_type: 'Slot', limit_group_name: 'Slot 一般會員', display_currency: primaryCurrency, min_bet: primaryCurrency === 'VND' ? 1000 : 0.1, max_bet: primaryCurrency === 'VND' ? 25000000 : 2000, source: '所屬代理預設', status: '啟用' },
    { provider_name: 'PG Soft', game_type: 'Slot', limit_group_name: 'Slot VIP 2000-5000', display_currency: primaryCurrency, min_bet: primaryCurrency === 'PHP' ? 30000 : 2000, max_bet: primaryCurrency === 'PHP' ? 80000 : 5000, source: '商戶覆寫', status: '啟用' },
    { provider_name: 'Evolution', game_type: 'Live', limit_group_name: '百家樂一般會員', display_currency: secondaryCurrency, min_bet: secondaryCurrency === 'THB' ? 20 : 1, max_bet: secondaryCurrency === 'THB' ? 50000 : 2000, source: '代理可用群組', status: '啟用' }
  ]
}

export const playerBetLimitsByWalletId: Record<string, PlayerBetLimit[]> = {
  'PW-OP1001-mem_8842-TWD': [
    { provider_id: 'PG', game_type: 'Slot', limit_group_name: 'Slot VIP 2000-5000', display_currency: 'TWD', min_bet: 2000, max_bet: 5000, source: 'player_override', effective_at: '2026-07-01T01:00:00.000Z', status: 'active' },
    { provider_id: 'EVO', game_type: 'Live', limit_group_name: '百家樂一般會員', display_currency: 'TWD', min_bet: 1, max_bet: 2000, source: 'merchant_default', effective_at: '2026-07-01T01:00:00.000Z', status: 'active' }
  ],
  'PW-OP1001-mem_8842-PHP': [
    { provider_id: 'JILI', game_type: 'Slot', limit_group_name: 'JILI 一般會員', display_currency: 'PHP', min_bet: 5, max_bet: 20000, source: 'merchant_default', effective_at: '2026-07-01T01:00:00.000Z', status: 'active' }
  ],
  'PW-OP1008-nova_7711-THB': [
    { provider_id: 'PG', game_type: 'Slot', limit_group_name: 'Slot VIP 30000-80000', display_currency: 'THB', min_bet: 30000, max_bet: 80000, source: 'player_override', effective_at: '2026-07-02T01:00:00.000Z', status: 'active' },
    { provider_id: 'EVO', game_type: 'Live', limit_group_name: '百家樂一般會員', display_currency: 'THB', min_bet: 20, max_bet: 50000, source: 'merchant_default', effective_at: '2026-07-01T01:00:00.000Z', status: 'active' }
  ],
  'PW-OP1009-dragon_9255-VND': [
    { provider_id: 'PP', game_type: 'Slot', limit_group_name: 'PP 一般會員', display_currency: 'VND', min_bet: 1000, max_bet: 25000000, source: 'merchant_default', effective_at: '2026-07-01T01:00:00.000Z', status: 'disabled' }
  ]
}

export const getPlayerBetLimits = (playerWalletId: string) => playerBetLimitsByWalletId[playerWalletId] ?? []

export const betLimitSnapshotsByBetId: Record<string, BetLimitSnapshot> = {
  'BET-20260707-000884': { session_id: 'SES-OP1001-TWD-8842', limit_group_code: 'GL-PG-SLOT-VIP1', limit_group_name: 'Slot VIP 2000-5000', limit_source: 'player_override', display_currency: 'TWD', min_bet_display: 2000, max_bet_display: 5000, bet_step_display: 100, provider_limit_code: 'PG-LIMIT-MAX', check_result: 'passed', checked_at: '2026-07-07T08:31:22.000Z' },
  'BET-20260707-000771': { session_id: 'SES-OP1008-THB-7711', limit_group_code: 'GL-PG-SLOT-GEN', limit_group_name: 'Slot 一般會員', limit_source: 'merchant_default', display_currency: 'THB', min_bet_display: 20, max_bet_display: 50000, bet_step_display: 20, provider_limit_code: 'PG-LIMIT-MAX', check_result: 'passed', checked_at: '2026-07-07T09:02:18.000Z' },
  'BET-20260707-000552': { session_id: 'SES-OP1006-PHP-5520', limit_group_code: 'GL-JILI-SLOT-GEN', limit_group_name: 'JILI 一般會員', limit_source: 'merchant_default', display_currency: 'PHP', min_bet_display: 5, max_bet_display: 20000, bet_step_display: 5, provider_limit_code: 'JILI-DEFAULT-MAX', check_result: 'passed', checked_at: '2026-07-07T10:06:18.000Z' },
  'BET-20260706-000925': { session_id: 'SES-OP1009-VND-9255', limit_group_code: 'GL-PP-SLOT-GEN', limit_group_name: 'PP 一般會員', limit_source: 'merchant_default', display_currency: 'VND', min_bet_display: 1000, max_bet_display: 25000000, bet_step_display: 1000, provider_limit_code: 'PP-LIMIT-HIGH', check_result: 'manual_review', checked_at: '2026-07-06T14:18:00.000Z' }
}

export const getBetLimitSnapshot = (betId: string): BetLimitSnapshot => {
  const snapshot = betLimitSnapshotsByBetId[betId]
  if (snapshot) return snapshot

  return {
    session_id: '-',
    limit_group_code: '-',
    limit_group_name: '未保存限額快照',
    limit_source: 'merchant_default',
    display_currency: 'USDT',
    min_bet_display: 0,
    max_bet_display: 0,
    bet_step_display: 0,
    provider_limit_code: '-',
    check_result: 'manual_review',
    checked_at: '-'
  }
}
