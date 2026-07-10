export type GameLimitLevel = 'GENERAL' | 'HIGH' | 'VIP'
export type GameLimitStatus = 'active' | 'draft' | 'disabled'
export type GameLimitSource = 'merchant_default' | 'player_override'
export type GameLimitCheckResult = 'passed' | 'blocked' | 'manual_review'

export interface GameBetLimitGroup {
  limit_group_id?: string
  limit_group_code: string
  limit_group_name: string
  group_level: GameLimitLevel
  display_currency: string
  min_bet_display: number
  max_bet_display: number
  bet_step_display: number
  provider_limit_code: string
  merchant_count: number
  is_default: boolean
  status: Exclude<GameLimitStatus, 'disabled'>
  version?: string
}

export interface AgentBetLimitAccess {
  provider_id: string
  provider_name: string
  game_type: string
  limit_group_code: string
  limit_group_name: string
  min_bet_display: number
  max_bet_display: number
  display_currency: string
  assignable_to_child: boolean
  assigned_merchant_count: number
  status: Extract<GameLimitStatus, 'active' | 'disabled'>
}

export interface MerchantBetLimitGroup {
  provider_name: string
  game_type: string
  limit_group_name: string
  display_currency: string
  min_bet: number
  max_bet: number
  source: string
  status: string
}

export interface PlayerBetLimit {
  provider_id: string
  game_type: string
  limit_group_name: string
  display_currency: string
  min_bet: number
  max_bet: number
  source: GameLimitSource
  effective_at: string
  status: Extract<GameLimitStatus, 'active' | 'disabled'>
}

export interface BetLimitSnapshot {
  session_id: string
  limit_group_code: string
  limit_group_name: string
  limit_source: GameLimitSource
  display_currency: string
  min_bet_display: number
  max_bet_display: number
  bet_step_display: number
  provider_limit_code: string
  check_result: GameLimitCheckResult
  checked_at: string
}

export const gameLimitLevelLabel: Record<GameLimitLevel, string> = {
  GENERAL: '一般',
  HIGH: '高額',
  VIP: 'VIP'
}

export const gameLimitStatusLabel: Record<GameLimitStatus, string> = {
  active: '啟用',
  draft: '草稿',
  disabled: '停用'
}

export const gameLimitSourceLabel: Record<GameLimitSource, string> = {
  merchant_default: '商戶預設',
  player_override: '特殊會員覆寫'
}

export const gameLimitCheckResultLabel: Record<GameLimitCheckResult, string> = {
  passed: '已通過',
  blocked: '已阻擋',
  manual_review: '人工覆核'
}
