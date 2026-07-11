import type {
  BetListItem,
  LedgerWallet,
  PlayerWallet,
  RepairJobDetail,
  RepairJobListItem,
  TransactionDetail,
  TransactionListItem,
  WalletRouteRecord
} from './transactions'
import type { Game } from '../../types/game'
import type { Merchant } from '../../types/merchant'
import type { Provider } from '../../types/provider'
import { createResourceService } from '../resourceAdapter'

export const adminMerchantResource = createResourceService<Merchant>({
  list: '/api/v2/admin/merchants',
  detail: (id) => `/api/v2/admin/merchants/${id}`,
  create: '/api/v2/admin/merchants',
  update: (id) => `/api/v2/admin/merchants/${id}`,
  toggleStatus: (id) => `/api/v2/admin/merchants/${id}/status`,
  export: '/api/v2/admin/merchants/export'
})

export const adminProviderResource = createResourceService<Provider>({
  list: '/api/v2/admin/providers',
  detail: (id) => `/api/v2/admin/providers/${id}`,
  create: '/api/v2/admin/providers',
  update: (id) => `/api/v2/admin/providers/${id}`,
  toggleStatus: (id) => `/api/v2/admin/providers/${id}/status`
})

export const adminGameResource = createResourceService<Game>({
  list: '/api/v2/admin/games',
  detail: (id) => `/api/v2/admin/games/${id}`,
  create: '/api/v2/admin/games',
  update: (id) => `/api/v2/admin/games/${id}`,
  toggleStatus: (id) => `/api/v2/admin/games/${id}/status`
})

export const adminBetResource = createResourceService<BetListItem>({
  list: '/api/v2/admin/transactions/bets',
  detail: (id) => `/api/v2/admin/transactions/bets/${id}`,
  export: '/api/v2/admin/transactions/bets/export'
})

export const adminTransactionResource = createResourceService<TransactionListItem, TransactionDetail>({
  list: '/api/v2/admin/transactions/ledger',
  detail: (id) => `/api/v2/admin/transactions/ledger/${id}`,
  export: '/api/v2/admin/transactions/ledger/export'
})

export const adminRepairResource = createResourceService<RepairJobListItem, RepairJobDetail>({
  list: '/api/v2/admin/transactions/repairs',
  detail: (id) => `/api/v2/admin/transactions/repairs/${id}`,
  update: (id) => `/api/v2/admin/transactions/repairs/${id}`
})

export const adminWalletRouteResource = createResourceService<WalletRouteRecord>({
  list: '/api/v2/admin/transactions/wallet-routes',
  export: '/api/v2/admin/transactions/wallet-routes/export'
})

export const adminPlayerWalletResource = createResourceService<PlayerWallet>({
  list: '/api/v2/admin/transactions/player-wallets',
  export: '/api/v2/admin/transactions/player-wallets/export'
})

export const adminLedgerWalletResource = createResourceService<LedgerWallet>({
  list: '/api/v2/admin/transactions/ledger-wallets',
  export: '/api/v2/admin/transactions/ledger-wallets/export'
})
