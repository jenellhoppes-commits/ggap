import { mockApiResponse } from '../apiClient'
import type { ListResult, QueryParams } from '../apiClient'
import {
  betDetails,
  betList,
  callbackRecords,
  ledgerWallets,
  playerList,
  repairDetails,
  repairList,
  transactionDetails,
  transactionList,
  transferRecords,
  walletRouteRecords
} from '../demo/adminTransactions'

export type WalletMode = 'seamless' | 'transfer'
export type GameType = 'Slot' | 'Live' | 'Fishing' | 'Sports'
export type BetStatus = 'settled' | 'unsettled' | 'cancelled' | 'provider_pending' | 'repairing' | 'abnormal'
export type TransactionType = 'Balance' | 'Bet' | 'Win' | 'Refund' | 'Rollback' | 'Adjustment'
export type TransactionStatus = 'success' | 'pending' | 'failed' | 'callback_failed' | 'provider_pending' | 'amount_mismatch' | 'repaired' | 'voided' | 'manual_review'
export type RepairType = 'Callback Failed' | 'Provider Pending' | 'Ledger Failed' | 'Amount Mismatch' | 'Rollback Required'
export type RepairStatus = 'new' | 'processing' | 'waiting' | 'done' | 'failed' | 'manual_review'
export type RepairPriority = 'high' | 'medium' | 'low'
export type RouterStatus = 'success' | 'pending' | 'failed' | 'manual_review'
export type TransferAction = 'Transfer In' | 'Transfer Out' | 'Lock' | 'Unlock' | 'Manual Adjust'
export type CallbackStatus = 'success' | 'pending' | 'failed' | 'duplicated' | 'skipped'
export type PlayerStatus = 'active' | 'locked' | 'risk_review'

export interface OperationLog {
  action: string
  operator: string
  operated_at: string
  trace_id: string
}

export interface FlowStep {
  name: string
  status: 'success' | 'pending' | 'failed' | 'skipped'
  time: string
  trace_id: string
  note: string
}

export interface MoneySnapshot {
  display_currency: string
  display_amount: number
  settlement_currency: 'USDT'
  settlement_amount: number
  exchange_rate_id: string
  exchange_rate: number
  exchange_fee_rate: number
  rate_locked_at: string
}

export interface BetListItem {
  bet_id: string
  round_id: string
  transaction_id: string
  merchant_id: string
  merchant_name: string
  agent_id: string
  agent_name: string
  player_id: string
  merchant_player_id: string
  wallet_mode: WalletMode
  provider_id: string
  provider_name: string
  game_id: string
  game_name: string
  game_type: GameType
  status: BetStatus
  display_currency: string
  display_bet_amount: number
  display_payout_amount: number
  display_ggr: number
  settlement_currency: 'USDT'
  settlement_bet_amount: number
  settlement_payout_amount: number
  settlement_ggr: number
  provider_tx_id: string
  provider_round_status: string
  created_at: string
  settled_at?: string
}

export interface BetDetail extends BetListItem {
  settlement_bet_amount: number
  settlement_payout_amount: number
  exchange_rate_id: string
  exchange_rate: number
  exchange_fee_rate: number
  rate_locked_at: string
  provider_payload: string
  wallet_payload: string
  transaction_flows: Array<{
    flow_id: string
    flow_type: TransactionType
    status: 'success' | 'pending' | 'failed'
    amount: number
    currency: string
    created_at: string
  }>
  repair_records: Array<{
    repair_id: string
    reason: string
    status: 'created' | 'processing' | 'done' | 'failed'
    operator: string
    created_at: string
  }>
  logs: OperationLog[]
}

export interface TransactionListItem {
  transaction_id: string
  round_id: string
  provider_tx_id: string
  type: TransactionType
  status: TransactionStatus
  merchant_id: string
  merchant_name: string
  agent_id: string
  agent_name: string
  merchant_player_id: string
  player_wallet_id: string
  provider_id: string
  provider_name: string
  game_code: string
  game_name: string
  wallet_mode: WalletMode
  display_currency: string
  display_amount: number
  settlement_currency: 'USDT'
  settlement_amount: number
  exchange_rate_id: string
  has_difference: boolean
  repairable: boolean
  idempotency_key: string
  callback_status: 'success' | 'pending' | 'failed' | 'skipped'
  created_at: string
  completed_at?: string
}

export interface TransactionDetail extends TransactionListItem {
  exchange_rate: number
  exchange_fee_rate: number
  rate_locked_at: string
  merchant_callback_url: string
  provider_status_code: string
  provider_returned_at: string
  request_payload: string
  response_payload: string
  provider_request_payload: string
  provider_response_payload: string
  flow_steps: FlowStep[]
  transfer_records: TransferRecord[]
  repair_records: Array<{
    repair_id: string
    reason: string
    status: 'created' | 'processing' | 'done'
    operator: string
    created_at: string
  }>
}

export interface RepairJobListItem {
  repair_id: string
  repair_type: RepairType
  status: RepairStatus
  priority: RepairPriority
  merchant_id: string
  merchant_name: string
  agent_id: string
  agent_name: string
  merchant_player_id: string
  wallet_mode: WalletMode
  provider_name: string
  transaction_id: string
  round_id: string
  transfer_id: string
  callback_id: string
  display_currency: string
  display_amount: number
  settlement_currency: 'USDT'
  settlement_amount: number
  reason: string
  suggested_action: string
  retry_count: number
  max_retry: number
  created_at: string
  updated_at: string
}

export interface RepairJobDetail extends RepairJobListItem {
  current_blocker: string
  idempotency_key: string
  request_payload: string
  response_payload: string
  provider_payload: string
  ledger_payload: string
  steps: Array<{
    step: string
    action: string
    status: RepairStatus
    operator: string
    operated_at: string
    trace_id: string
    note: string
  }>
  logs: Array<{
    action: string
    operator: string
    operated_at: string
    result: string
  }>
}

export interface WalletRouteRecord {
  route_id: string
  merchant_id: string
  merchant_name: string
  agent_id: string
  agent_name: string
  merchant_player_id: string
  display_currency: string
  wallet_mode: WalletMode
  route_target: string
  trigger: string
  idempotency_key: string
  status: RouterStatus
  latency_ms: number
  related_transaction_id: string
  related_round_id: string
  created_at: string
}

export interface TransferRecord {
  transfer_id: string
  ledger_id: string
  merchant_id: string
  merchant_name: string
  agent_id: string
  agent_name: string
  merchant_player_id: string
  player_wallet_id: string
  display_currency: string
  action: TransferAction
  display_amount: number
  settlement_currency: 'USDT'
  settlement_amount: number
  before_balance: number
  after_balance: number
  locked_balance: number
  status: RouterStatus
  idempotency_key: string
  related_transaction_id: string
  related_round_id: string
  created_at: string
  completed_at?: string
}

export interface LedgerWallet {
  ledger_id: string
  player_wallet_id: string
  merchant_id: string
  merchant_name: string
  agent_id: string
  agent_name: string
  merchant_player_id: string
  display_currency: string
  settlement_currency: 'USDT'
  available_balance: number
  locked_balance: number
  ledger_status: 'active' | 'locked' | 'frozen'
  last_action: TransferAction
  last_transfer_id: string
  last_changed_at: string
}

export interface CallbackRecord {
  callback_id: string
  callback_type: string
  merchant_id: string
  merchant_name: string
  wallet_mode: WalletMode
  endpoint: string
  idempotency_key: string
  status: CallbackStatus
  retry_count: number
  related_transaction_id: string
  related_transfer_id: string
  created_at: string
  last_attempt_at: string
}

export interface PlayerWallet {
  player_wallet_id: string
  merchant_id: string
  merchant_name: string
  agent_id: string
  agent_name: string
  merchant_player_id: string
  display_currency: string
  settlement_currency: 'USDT'
  wallet_mode: WalletMode
  status: PlayerStatus
  available_balance: number
  locked_balance: number
  total_bet_settlement: number
  total_ggr_settlement: number
  last_session_at: string
}

const listResult = <T>(items: T[], params?: QueryParams): ListResult<T> => ({
  items,
  page: params?.page || 1,
  page_size: params?.page_size || items.length,
  total: items.length
})

export const adminTransactionService = {
  listBets(params?: QueryParams) {
    return mockApiResponse(listResult<BetListItem>(betList, params))
  },

  getBetDetail(betId: string) {
    return mockApiResponse<BetDetail>(betDetails[betId] || betDetails['BET-20260707-000884']!)
  },

  listTransactions(params?: QueryParams) {
    return mockApiResponse(listResult<TransactionListItem>(transactionList, params))
  },

  getTransactionDetail(transactionId: string) {
    return mockApiResponse<TransactionDetail>(transactionDetails[transactionId] || transactionDetails['TX-20260707-000184']!)
  },

  listRepairs(params?: QueryParams) {
    return mockApiResponse(listResult<RepairJobListItem>(repairList, params))
  },

  getRepairDetail(repairId: string) {
    return mockApiResponse<RepairJobDetail>(repairDetails[repairId] || repairDetails['RP-20260707-000011']!)
  },

  retryRepair(repairId: string, action: string) {
    return mockApiResponse({ repair_id: repairId, action, status: 'queued' })
  },

  listWalletRoutes(params?: QueryParams) {
    return mockApiResponse(listResult<WalletRouteRecord>(walletRouteRecords, params))
  },

  listTransfers(params?: QueryParams) {
    return mockApiResponse(listResult<TransferRecord>(transferRecords, params))
  },

  listLedgerWallets(params?: QueryParams) {
    return mockApiResponse(listResult<LedgerWallet>(ledgerWallets, params))
  },

  listCallbacks(params?: QueryParams) {
    return mockApiResponse(listResult<CallbackRecord>(callbackRecords, params))
  },

  listPlayers(params?: QueryParams) {
    return mockApiResponse(listResult<PlayerWallet>(playerList, params))
  }
}
