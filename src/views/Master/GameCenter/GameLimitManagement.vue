<script setup lang="ts">
import { computed, h, ref } from 'vue'
import {
  NAlert,
  NButton,
  NDataTable,
  NDescriptions,
  NDescriptionsItem,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSpace,
  NStep,
  NSteps,
  NStatistic,
  NSwitch,
  NTabPane,
  NTabs,
  NTag,
  NTimeline,
  NTimelineItem,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { AddOutlined, ContentCopyOutlined, EditOutlined, SearchOutlined, SettingsOutlined, VisibilityOutlined } from '@vicons/material'
import { withTableSorters } from '../../../utils/tableSort'

type GameType = 'Slot' | 'Baccarat' | 'Table' | 'Fish' | 'Arcade'
type GroupLevel = 'GENERAL' | 'HIGH' | 'VIP'
type LimitStatus = 'active' | 'disabled' | 'draft'
type NativeSupport = 'full' | 'partial' | 'none'
type ApprovalStatus = 'pending' | 'approved' | 'rejected'

interface CurrencyLimit {
  display_currency: string
  min_bet_display: number
  max_bet_display: number
  bet_step_display: number
  default_bet_display: number
  amount_decimal_places: number
  allow_decimal: boolean
  min_bet_usdt: number
  max_bet_usdt: number
  exchange_rate_id: string
  status: LimitStatus
}

interface ProviderLimitMapping {
  provider_id: string
  provider_name: string
  game_type: GameType
  game_id: string
  game_name: string
  display_currency: string
  provider_limit_code: string
  provider_limit_name: string
  provider_min_bet: number
  provider_max_bet: number
  provider_bet_step: number
  support_native_limit: boolean
  status: LimitStatus
}

interface GameBinding {
  provider_name: string
  game_id: string
  game_name: string
  game_type: GameType
  is_default: boolean
  status: LimitStatus
}

interface AccessRow {
  target_id: string
  target_name: string
  parent_name?: string
  display_currencies: string[]
  status: LimitStatus
  effective_at: string
}

interface PlayerTierLimit {
  merchant_id: string
  merchant_name: string
  player_tier_id: string
  tier_name: string
  display_currency: string
  status: LimitStatus
  effective_at: string
}

interface PlayerOverride {
  merchant_id: string
  merchant_name: string
  merchant_player_id: string
  display_currency: string
  custom_min_bet_display: number
  custom_max_bet_display: number
  custom_min_bet_usdt: number
  custom_max_bet_usdt: number
  reason: string
  approval_status: ApprovalStatus
  status: LimitStatus
  expired_at: string
}

interface SessionSnapshot {
  snapshot_id: string
  session_id: string
  merchant_id: string
  merchant_player_id: string
  game_name: string
  display_currency: string
  min_bet_display: number
  max_bet_display: number
  min_bet_usdt: number
  max_bet_usdt: number
  provider_limit_code: string
  created_at: string
}

interface OperationLog {
  action: string
  operator: string
  operated_at: string
  trace_id: string
}

interface BetLimitGroup {
  limit_group_id: string
  limit_group_code: string
  limit_group_name: string
  game_type: GameType
  group_level: GroupLevel
  native_support: NativeSupport
  supported_currencies: string[]
  bound_game_count: number
  agent_access_count: number
  merchant_access_count: number
  player_tier_count: number
  player_override_count: number
  status: LimitStatus
  effective_at: string
  updated_at: string
  description: string
  currency_limits: CurrencyLimit[]
  provider_mappings: ProviderLimitMapping[]
  game_bindings: GameBinding[]
  agent_access: AccessRow[]
  merchant_access: AccessRow[]
  player_tiers: PlayerTierLimit[]
  player_overrides: PlayerOverride[]
  snapshots: SessionSnapshot[]
  logs: OperationLog[]
}

const message = useMessage()
const showDetail = ref(false)
const showEditor = ref(false)
const detailTab = ref('currency')
const currentRow = ref<BetLimitGroup | null>(null)
const keyword = ref('')
const gameTypeFilter = ref<GameType | null>(null)
const levelFilter = ref<GroupLevel | null>(null)
const statusFilter = ref<LimitStatus | null>(null)
const currencyFilter = ref<string | null>(null)
const nativeFilter = ref<NativeSupport | null>(null)
const editorStep = ref(1)

const groupLevelMeta: Record<GroupLevel, { label: string; type: 'default' | 'warning' | 'success' }> = {
  GENERAL: { label: '一般', type: 'default' },
  HIGH: { label: '高額', type: 'warning' },
  VIP: { label: 'VIP', type: 'success' }
}

const statusMeta: Record<LimitStatus, { label: string; type: 'success' | 'warning' | 'default' }> = {
  active: { label: '啟用', type: 'success' },
  disabled: { label: '停用', type: 'default' },
  draft: { label: '草稿', type: 'warning' }
}

const nativeSupportMeta: Record<NativeSupport, { label: string; type: 'success' | 'warning' | 'default' }> = {
  full: { label: '是', type: 'success' },
  partial: { label: '部分', type: 'warning' },
  none: { label: '否', type: 'default' }
}

const approvalMeta: Record<ApprovalStatus, { label: string; type: 'success' | 'warning' | 'error' }> = {
  pending: { label: '待審核', type: 'warning' },
  approved: { label: '已核准', type: 'success' },
  rejected: { label: '已拒絕', type: 'error' }
}

const makeCurrencyLimits = (base: Array<[string, number, number, number, number, number, boolean, number, number]>): CurrencyLimit[] => base.map((item) => ({
  display_currency: item[0],
  min_bet_display: item[1],
  max_bet_display: item[2],
  bet_step_display: item[3],
  default_bet_display: item[4],
  amount_decimal_places: item[5],
  allow_decimal: item[6],
  min_bet_usdt: item[7],
  max_bet_usdt: item[8],
  exchange_rate_id: `FX-${item[0]}-USDT-20260710`,
  status: 'active'
}))

const rows = ref<BetLimitGroup[]>([
  {
    limit_group_id: 'BLG-SLOT-GENERAL',
    limit_group_code: 'SLOT_GENERAL',
    limit_group_name: 'Slot_一般',
    game_type: 'Slot',
    group_level: 'GENERAL',
    native_support: 'full',
    supported_currencies: ['TWD', 'USD', 'CNY', 'VND', 'USDT'],
    bound_game_count: 126,
    agent_access_count: 4,
    merchant_access_count: 38,
    player_tier_count: 9,
    player_override_count: 3,
    status: 'active',
    effective_at: '2026-07-01T00:00:00.000Z',
    updated_at: '2026-07-09T12:20:00.000Z',
    description: '電子遊戲一般會員單轉下注區間，作為商戶預設與會員分層基準。',
    currency_limits: makeCurrencyLimits([
      ['TWD', 0.1, 2000, 0.1, 1, 1, true, 0.0031, 62.5],
      ['USD', 0.01, 200, 0.01, 1, 2, true, 0.01, 200],
      ['CNY', 0.1, 500, 0.1, 1, 1, true, 0.014, 69.44],
      ['VND', 10000, 200000, 10000, 10000, 0, false, 0.39, 7.84],
      ['USDT', 0.01, 200, 0.01, 1, 2, true, 0.01, 200]
    ]),
    provider_mappings: [
      { provider_id: 'PROV-PG', provider_name: 'PG Soft', game_type: 'Slot', game_id: 'PG-001', game_name: 'Mahjong Ways 2', display_currency: 'TWD', provider_limit_code: 'PG_TWD_LOW', provider_limit_name: 'TWD Low', provider_min_bet: 0.1, provider_max_bet: 10000, provider_bet_step: 0.1, support_native_limit: true, status: 'active' },
      { provider_id: 'PROV-PP', provider_name: 'Pragmatic Play', game_type: 'Slot', game_id: 'PP-001', game_name: 'Sweet Bonanza', display_currency: 'USDT', provider_limit_code: 'PP_USDT_STD', provider_limit_name: 'USDT Standard', provider_min_bet: 0.01, provider_max_bet: 500, provider_bet_step: 0.01, support_native_limit: true, status: 'active' }
    ],
    game_bindings: [
      { provider_name: 'PG Soft', game_id: 'PG-001', game_name: 'Mahjong Ways 2', game_type: 'Slot', is_default: true, status: 'active' },
      { provider_name: 'PG Soft', game_id: 'PG-002', game_name: 'Lucky Neko', game_type: 'Slot', is_default: true, status: 'active' },
      { provider_name: 'Pragmatic Play', game_id: 'PP-001', game_name: 'Sweet Bonanza', game_type: 'Slot', is_default: true, status: 'active' }
    ],
    agent_access: [
      { target_id: 'AGT-DIRECT', target_name: '平台直營代理', display_currencies: ['TWD', 'USD', 'USDT'], status: 'active', effective_at: '2026-07-01T00:00:00.000Z' },
      { target_id: 'AGT-SEA-001', target_name: 'SEA Growth Agent', display_currencies: ['TWD', 'PHP', 'VND'], status: 'active', effective_at: '2026-07-01T00:00:00.000Z' }
    ],
    merchant_access: [
      { target_id: 'OP-1001', target_name: 'Blue Whale Interactive', parent_name: '平台直營代理', display_currencies: ['TWD', 'USDT'], status: 'active', effective_at: '2026-07-02T10:00:00.000Z' },
      { target_id: 'OP-1002', target_name: 'HyperWin Network', parent_name: 'SEA Growth Agent', display_currencies: ['VND', 'TWD'], status: 'active', effective_at: '2026-07-03T11:00:00.000Z' }
    ],
    player_tiers: [
      { merchant_id: 'OP-1001', merchant_name: 'Blue Whale Interactive', player_tier_id: 'TIER-GENERAL', tier_name: '一般會員', display_currency: 'TWD', status: 'active', effective_at: '2026-07-02T10:00:00.000Z' }
    ],
    player_overrides: [
      { merchant_id: 'OP-1001', merchant_name: 'Blue Whale Interactive', merchant_player_id: 'BW-VIP-0092', display_currency: 'TWD', custom_min_bet_display: 0.1, custom_max_bet_display: 10000, custom_min_bet_usdt: 0.0031, custom_max_bet_usdt: 312.5, reason: '商戶指定高活躍會員提高單轉上限', approval_status: 'approved', status: 'active', expired_at: '2026-09-30T23:59:59.000Z' }
    ],
    snapshots: [
      { snapshot_id: 'SBL-900101', session_id: 'SES-20260710-001', merchant_id: 'OP-1001', merchant_player_id: 'BW-P-7781', game_name: 'Mahjong Ways 2', display_currency: 'TWD', min_bet_display: 0.1, max_bet_display: 2000, min_bet_usdt: 0.0031, max_bet_usdt: 62.5, provider_limit_code: 'PG_TWD_LOW', created_at: '2026-07-10T09:12:30.000Z' }
    ],
    logs: [
      { action: '建立單槍群組', operator: 'Content Admin', operated_at: '2026-07-01T00:00:00.000Z', trace_id: 'trace-limit-slot-general-create' },
      { action: '更新 TWD 最高下注', operator: 'Risk Admin', operated_at: '2026-07-09T12:20:00.000Z', trace_id: 'trace-limit-slot-general-twd' }
    ]
  },
  {
    limit_group_id: 'BLG-SLOT-VIP',
    limit_group_code: 'SLOT_VIP',
    limit_group_name: 'Slot_VIP',
    game_type: 'Slot',
    group_level: 'VIP',
    native_support: 'full',
    supported_currencies: ['TWD', 'USD', 'USDT'],
    bound_game_count: 88,
    agent_access_count: 2,
    merchant_access_count: 11,
    player_tier_count: 4,
    player_override_count: 8,
    status: 'active',
    effective_at: '2026-07-01T00:00:00.000Z',
    updated_at: '2026-07-09T16:10:00.000Z',
    description: '電子遊戲 VIP 會員單轉高額區間，需由代理開放後商戶才能套用。',
    currency_limits: makeCurrencyLimits([
      ['TWD', 5000, 10000, 100, 5000, 0, false, 156.25, 312.5],
      ['USD', 200, 10000, 10, 200, 2, true, 200, 10000],
      ['USDT', 200, 10000, 10, 200, 2, true, 200, 10000]
    ]),
    provider_mappings: [
      { provider_id: 'PROV-PG', provider_name: 'PG Soft', game_type: 'Slot', game_id: 'PG-001', game_name: 'Mahjong Ways 2', display_currency: 'TWD', provider_limit_code: 'PG_TWD_VIP', provider_limit_name: 'TWD VIP', provider_min_bet: 0.1, provider_max_bet: 10000, provider_bet_step: 0.1, support_native_limit: true, status: 'active' }
    ],
    game_bindings: [
      { provider_name: 'PG Soft', game_id: 'PG-001', game_name: 'Mahjong Ways 2', game_type: 'Slot', is_default: false, status: 'active' },
      { provider_name: 'Pragmatic Play', game_id: 'PP-001', game_name: 'Sweet Bonanza', game_type: 'Slot', is_default: false, status: 'active' }
    ],
    agent_access: [
      { target_id: 'AGT-DIRECT', target_name: '平台直營代理', display_currencies: ['TWD', 'USDT'], status: 'active', effective_at: '2026-07-01T00:00:00.000Z' },
      { target_id: 'AGT-SEA-001', target_name: 'SEA Growth Agent', display_currencies: ['TWD'], status: 'active', effective_at: '2026-07-04T00:00:00.000Z' }
    ],
    merchant_access: [
      { target_id: 'OP-1001', target_name: 'Blue Whale Interactive', parent_name: '平台直營代理', display_currencies: ['TWD'], status: 'active', effective_at: '2026-07-04T10:00:00.000Z' }
    ],
    player_tiers: [
      { merchant_id: 'OP-1001', merchant_name: 'Blue Whale Interactive', player_tier_id: 'TIER-VIP', tier_name: 'VIP 會員', display_currency: 'TWD', status: 'active', effective_at: '2026-07-04T10:00:00.000Z' }
    ],
    player_overrides: [
      { merchant_id: 'OP-1001', merchant_name: 'Blue Whale Interactive', merchant_player_id: 'BW-HIGH-1020', display_currency: 'TWD', custom_min_bet_display: 5000, custom_max_bet_display: 10000, custom_min_bet_usdt: 156.25, custom_max_bet_usdt: 312.5, reason: 'VIP 活動週期', approval_status: 'pending', status: 'draft', expired_at: '2026-08-31T23:59:59.000Z' }
    ],
    snapshots: [
      { snapshot_id: 'SBL-900201', session_id: 'SES-20260710-088', merchant_id: 'OP-1001', merchant_player_id: 'BW-HIGH-1020', game_name: 'Mahjong Ways 2', display_currency: 'TWD', min_bet_display: 5000, max_bet_display: 10000, min_bet_usdt: 156.25, max_bet_usdt: 312.5, provider_limit_code: 'PG_TWD_VIP', created_at: '2026-07-10T10:20:00.000Z' }
    ],
    logs: [
      { action: '開放 VIP 單槍群組給平台直營代理', operator: 'Super Admin', operated_at: '2026-07-04T00:00:00.000Z', trace_id: 'trace-limit-slot-vip-access' }
    ]
  },
  {
    limit_group_id: 'BLG-BACCARAT-GENERAL',
    limit_group_code: 'BACCARAT_GENERAL',
    limit_group_name: 'Baccarat_一般',
    game_type: 'Baccarat',
    group_level: 'GENERAL',
    native_support: 'partial',
    supported_currencies: ['TWD', 'PHP', 'USDT'],
    bound_game_count: 18,
    agent_access_count: 3,
    merchant_access_count: 19,
    player_tier_count: 6,
    player_override_count: 1,
    status: 'active',
    effective_at: '2026-07-01T00:00:00.000Z',
    updated_at: '2026-07-08T09:30:00.000Z',
    description: '百家樂一般桌台限額，P0 先展示單局與下注區規則，P1 才做完整下注區 API 同步。',
    currency_limits: makeCurrencyLimits([
      ['TWD', 100, 5000, 100, 100, 0, false, 3.125, 156.25],
      ['PHP', 100, 8000, 100, 100, 0, false, 1.72, 137.93],
      ['USDT', 5, 200, 5, 5, 2, true, 5, 200]
    ]),
    provider_mappings: [
      { provider_id: 'PROV-EVO', provider_name: 'Evolution', game_type: 'Baccarat', game_id: 'EVO-BAC-01', game_name: 'Baccarat A', display_currency: 'TWD', provider_limit_code: 'EVO_TABLE_01', provider_limit_name: 'Table 01', provider_min_bet: 100, provider_max_bet: 200000, provider_bet_step: 100, support_native_limit: true, status: 'active' }
    ],
    game_bindings: [
      { provider_name: 'Evolution', game_id: 'EVO-BAC-01', game_name: 'Baccarat A', game_type: 'Baccarat', is_default: true, status: 'active' },
      { provider_name: 'Evolution', game_id: 'EVO-BAC-02', game_name: 'Speed Baccarat', game_type: 'Baccarat', is_default: true, status: 'active' }
    ],
    agent_access: [
      { target_id: 'AGT-DIRECT', target_name: '平台直營代理', display_currencies: ['TWD', 'USDT'], status: 'active', effective_at: '2026-07-01T00:00:00.000Z' }
    ],
    merchant_access: [
      { target_id: 'OP-1008', target_name: 'NovaPlay Entertainment', parent_name: '平台直營代理', display_currencies: ['TWD', 'USDT'], status: 'active', effective_at: '2026-07-03T12:00:00.000Z' }
    ],
    player_tiers: [
      { merchant_id: 'OP-1008', merchant_name: 'NovaPlay Entertainment', player_tier_id: 'TIER-GENERAL', tier_name: '一般會員', display_currency: 'TWD', status: 'active', effective_at: '2026-07-03T12:00:00.000Z' }
    ],
    player_overrides: [],
    snapshots: [
      { snapshot_id: 'SBL-900301', session_id: 'SES-20260710-202', merchant_id: 'OP-1008', merchant_player_id: 'NP-P-5510', game_name: 'Baccarat A', display_currency: 'TWD', min_bet_display: 100, max_bet_display: 5000, min_bet_usdt: 3.125, max_bet_usdt: 156.25, provider_limit_code: 'EVO_TABLE_01', created_at: '2026-07-10T11:00:00.000Z' }
    ],
    logs: [
      { action: '建立百家樂一般群組', operator: 'Content Admin', operated_at: '2026-07-01T00:00:00.000Z', trace_id: 'trace-limit-baccarat-general-create' }
    ]
  },
  {
    limit_group_id: 'BLG-FISH-VIP',
    limit_group_code: 'FISH_VIP',
    limit_group_name: 'Fish_VIP',
    game_type: 'Fish',
    group_level: 'VIP',
    native_support: 'none',
    supported_currencies: ['PHP', 'VND', 'USDT'],
    bound_game_count: 9,
    agent_access_count: 1,
    merchant_access_count: 4,
    player_tier_count: 2,
    player_override_count: 0,
    status: 'draft',
    effective_at: '2026-08-01T00:00:00.000Z',
    updated_at: '2026-07-10T08:00:00.000Z',
    description: '捕魚 VIP 單發炮值區間草稿。Provider 不支援原生代碼時，由 GGAP 交易層檢查。',
    currency_limits: makeCurrencyLimits([
      ['PHP', 1000, 50000, 1000, 1000, 0, false, 17.24, 862.06],
      ['VND', 500000, 5000000, 500000, 500000, 0, false, 19.6, 196.08],
      ['USDT', 20, 1000, 20, 20, 2, true, 20, 1000]
    ]),
    provider_mappings: [
      { provider_id: 'PROV-JILI', provider_name: 'JILI Gaming', game_type: 'Fish', game_id: 'JILI-FISH-01', game_name: 'Ocean King', display_currency: 'USDT', provider_limit_code: '-', provider_limit_name: '不支援', provider_min_bet: 20, provider_max_bet: 1000, provider_bet_step: 20, support_native_limit: false, status: 'draft' }
    ],
    game_bindings: [
      { provider_name: 'JILI Gaming', game_id: 'JILI-FISH-01', game_name: 'Ocean King', game_type: 'Fish', is_default: false, status: 'draft' }
    ],
    agent_access: [],
    merchant_access: [],
    player_tiers: [],
    player_overrides: [],
    snapshots: [],
    logs: [
      { action: '建立捕魚 VIP 草稿', operator: 'Content Admin', operated_at: '2026-07-10T08:00:00.000Z', trace_id: 'trace-limit-fish-vip-draft' }
    ]
  }
])

const editorForm = ref({
  limit_group_code: '',
  limit_group_name: '',
  game_type: 'Slot' as GameType,
  group_level: 'GENERAL' as GroupLevel,
  display_currency: 'TWD',
  min_bet_display: 0.1,
  max_bet_display: 2000,
  bet_step_display: 0.1,
  default_bet_display: 1,
  provider_limit_code: '',
  effective_at: '2026-07-10T00:00:00.000Z'
})

const gameTypeOptions = ['Slot', 'Baccarat', 'Table', 'Fish', 'Arcade'].map(value => ({ label: value, value }))
const levelOptions = Object.entries(groupLevelMeta).map(([value, meta]) => ({ label: meta.label, value }))
const statusOptions = Object.entries(statusMeta).map(([value, meta]) => ({ label: meta.label, value }))
const currencyOptions = ['TWD', 'USD', 'CNY', 'PHP', 'THB', 'VND', 'IDR', 'USDT'].map(value => ({ label: value, value }))
const nativeOptions = Object.entries(nativeSupportMeta).map(([value, meta]) => ({ label: meta.label, value }))

const filteredRows = computed(() => {
  const text = keyword.value.trim().toLowerCase()

  return rows.value.filter(row => {
    const matchesText = !text || [
      row.limit_group_code,
      row.limit_group_name,
      row.game_type,
      row.description
    ].some(value => value.toLowerCase().includes(text))
    const matchesType = !gameTypeFilter.value || row.game_type === gameTypeFilter.value
    const matchesLevel = !levelFilter.value || row.group_level === levelFilter.value
    const matchesStatus = !statusFilter.value || row.status === statusFilter.value
    const matchesCurrency = !currencyFilter.value || row.supported_currencies.includes(currencyFilter.value)
    const matchesNative = !nativeFilter.value || row.native_support === nativeFilter.value

    return matchesText && matchesType && matchesLevel && matchesStatus && matchesCurrency && matchesNative
  })
})

const summary = computed(() => ({
  total: rows.value.length,
  active: rows.value.filter(row => row.status === 'active').length,
  currencies: new Set(rows.value.flatMap(row => row.supported_currencies)).size,
  games: rows.value.reduce((sum, row) => sum + row.bound_game_count, 0),
  merchants: rows.value.reduce((sum, row) => sum + row.merchant_access_count, 0),
  overrides: rows.value.reduce((sum, row) => sum + row.player_override_count, 0)
}))

const formatDateTime = (value?: string) => value ? new Date(value).toLocaleString('zh-TW') : '-'
const formatAmount = (value: number, currency = '') => `${currency ? `${currency} ` : ''}${value.toLocaleString('en-US', { maximumFractionDigits: 4 })}`

const resetFilters = () => {
  keyword.value = ''
  gameTypeFilter.value = null
  levelFilter.value = null
  statusFilter.value = null
  currencyFilter.value = null
  nativeFilter.value = null
}

const openDetail = (row: BetLimitGroup, tab = 'currency') => {
  currentRow.value = row
  detailTab.value = tab
  showDetail.value = true
}

const openEditor = () => {
  editorStep.value = 1
  editorForm.value = {
    limit_group_code: '',
    limit_group_name: '',
    game_type: 'Slot',
    group_level: 'GENERAL',
    display_currency: 'TWD',
    min_bet_display: 0.1,
    max_bet_display: 2000,
    bet_step_display: 0.1,
    default_bet_display: 1,
    provider_limit_code: '',
    effective_at: '2026-07-10T00:00:00.000Z'
  }
  showEditor.value = true
}

const saveLimitGroup = () => {
  if (!editorForm.value.limit_group_code || !editorForm.value.limit_group_name) {
    message.warning('請填寫群組代碼與群組名稱')
    return
  }

  const code = editorForm.value.limit_group_code.toUpperCase()
  rows.value.unshift({
    limit_group_id: `BLG-${code}`,
    limit_group_code: code,
    limit_group_name: editorForm.value.limit_group_name,
    game_type: editorForm.value.game_type,
    group_level: editorForm.value.group_level,
    native_support: editorForm.value.provider_limit_code ? 'partial' : 'none',
    supported_currencies: [editorForm.value.display_currency],
    bound_game_count: 0,
    agent_access_count: 0,
    merchant_access_count: 0,
    player_tier_count: 0,
    player_override_count: 0,
    status: 'draft',
    effective_at: editorForm.value.effective_at,
    updated_at: new Date().toISOString(),
    description: '新增單槍群組草稿，需設定遊戲綁定與代理開放後才能套用。',
    currency_limits: makeCurrencyLimits([[editorForm.value.display_currency, editorForm.value.min_bet_display, editorForm.value.max_bet_display, editorForm.value.bet_step_display, editorForm.value.default_bet_display, editorForm.value.display_currency === 'USDT' ? 2 : 1, editorForm.value.display_currency !== 'VND', editorForm.value.min_bet_display, editorForm.value.max_bet_display]]),
    provider_mappings: [],
    game_bindings: [],
    agent_access: [],
    merchant_access: [],
    player_tiers: [],
    player_overrides: [],
    snapshots: [],
    logs: [
      { action: '新增單槍群組草稿', operator: 'Content Admin', operated_at: new Date().toISOString(), trace_id: `trace-limit-${code.toLowerCase()}-create` }
    ]
  })

  showEditor.value = false
  message.success('單槍群組草稿已建立')
}

const copyLimitGroup = (row: BetLimitGroup) => {
  const next = JSON.parse(JSON.stringify(row)) as BetLimitGroup
  next.limit_group_id = `${row.limit_group_id}-COPY`
  next.limit_group_code = `${row.limit_group_code}_COPY`
  next.limit_group_name = `${row.limit_group_name} 複製`
  next.status = 'draft'
  next.updated_at = new Date().toISOString()
  next.logs = [
    { action: `複製自 ${row.limit_group_name}`, operator: 'Content Admin', operated_at: new Date().toISOString(), trace_id: `trace-limit-${row.limit_group_code.toLowerCase()}-copy` }
  ]
  rows.value.unshift(next)
  message.success('單槍群組已複製為草稿')
}

const actionMessage = (label: string, row?: BetLimitGroup) => {
  message.info(`${label}${row ? `：${row.limit_group_name}` : ''}，演示操作已保留。`)
}

const columns: DataTableColumns<BetLimitGroup> = [
  {
    title: '單槍群組',
    key: 'limit_group_name',
    width: 250,
    fixed: 'left',
    render: row => h('button', { class: 'text-left hover:text-cyan-300', onClick: () => openDetail(row) }, [
      h('div', { class: 'font-semibold text-slate-100' }, row.limit_group_name),
      h('div', { class: 'mt-1 font-mono text-xs text-slate-500' }, row.limit_group_code)
    ])
  },
  { title: '遊戲類型', key: 'game_type', width: 110, render: row => h(NTag, { size: 'small', bordered: false }, { default: () => row.game_type }) },
  { title: '群組等級', key: 'group_level', width: 110, render: row => h(NTag, { type: groupLevelMeta[row.group_level].type, size: 'small', bordered: false }, { default: () => groupLevelMeta[row.group_level].label }) },
  { title: '支援幣別', key: 'supported_currencies', width: 220, render: row => h('div', { class: 'flex flex-wrap gap-1' }, row.supported_currencies.map(currency => h(NTag, { size: 'small', bordered: false }, { default: () => currency }))) },
  { title: '綁定遊戲', key: 'bound_game_count', width: 105, align: 'right', render: row => `${row.bound_game_count} 款` },
  { title: '開放代理', key: 'agent_access_count', width: 105, align: 'right', render: row => `${row.agent_access_count} 個` },
  { title: '套用商戶', key: 'merchant_access_count', width: 105, align: 'right', render: row => `${row.merchant_access_count} 家` },
  { title: '會員分層', key: 'player_tier_count', width: 105, align: 'right' },
  { title: '特殊會員', key: 'player_override_count', width: 105, align: 'right' },
  { title: 'Provider 原生', key: 'native_support', width: 130, render: row => h(NTag, { type: nativeSupportMeta[row.native_support].type, size: 'small', bordered: false }, { default: () => nativeSupportMeta[row.native_support].label }) },
  { title: '狀態', key: 'status', width: 100, render: row => h(NTag, { type: statusMeta[row.status].type, size: 'small', bordered: false }, { default: () => statusMeta[row.status].label }) },
  { title: '生效時間', key: 'effective_at', width: 175, render: row => formatDateTime(row.effective_at) },
  {
    title: '操作',
    key: 'actions',
    width: 320,
    fixed: 'right',
    render: row => h(NSpace, { size: 6, wrap: false }, {
      default: () => [
        h(NButton, { size: 'small', secondary: true, onClick: () => openDetail(row) }, { icon: () => h(NIcon, { component: VisibilityOutlined }), default: () => '查看' }),
        h(NButton, { size: 'small', secondary: true, onClick: () => openDetail(row, 'currency') }, { icon: () => h(NIcon, { component: SettingsOutlined }), default: () => '幣別' }),
        h(NButton, { size: 'small', secondary: true, onClick: () => actionMessage('編輯單槍群組', row) }, { icon: () => h(NIcon, { component: EditOutlined }), default: () => '編輯' }),
        h(NButton, { size: 'small', secondary: true, onClick: () => copyLimitGroup(row) }, { icon: () => h(NIcon, { component: ContentCopyOutlined }), default: () => '複製' })
      ]
    })
  }
]

const currencyColumns: DataTableColumns<CurrencyLimit> = [
  { title: '幣別', key: 'display_currency', width: 90, fixed: 'left', render: row => h(NTag, { type: row.display_currency === 'USDT' ? 'success' : 'default', size: 'small', bordered: false }, { default: () => row.display_currency }) },
  { title: '最低下注', key: 'min_bet_display', width: 120, align: 'right', render: row => formatAmount(row.min_bet_display) },
  { title: '最高下注', key: 'max_bet_display', width: 130, align: 'right', render: row => formatAmount(row.max_bet_display) },
  { title: '下注級距', key: 'bet_step_display', width: 120, align: 'right', render: row => formatAmount(row.bet_step_display) },
  { title: '預設下注', key: 'default_bet_display', width: 120, align: 'right', render: row => formatAmount(row.default_bet_display) },
  { title: '小數位', key: 'amount_decimal_places', width: 90, align: 'right' },
  { title: '允許小數', key: 'allow_decimal', width: 100, render: row => row.allow_decimal ? '是' : '否' },
  { title: 'USDT 最低', key: 'min_bet_usdt', width: 120, align: 'right', render: row => formatAmount(row.min_bet_usdt, 'USDT') },
  { title: 'USDT 最高', key: 'max_bet_usdt', width: 130, align: 'right', render: row => formatAmount(row.max_bet_usdt, 'USDT') },
  { title: '匯率 ID', key: 'exchange_rate_id', width: 190, render: row => h('span', { class: 'font-mono text-xs text-slate-400' }, row.exchange_rate_id) },
  { title: '狀態', key: 'status', width: 90, render: row => h(NTag, { type: statusMeta[row.status].type, size: 'small', bordered: false }, { default: () => statusMeta[row.status].label }) }
]

const providerColumns: DataTableColumns<ProviderLimitMapping> = [
  { title: '供應商', key: 'provider_name', width: 150 },
  { title: '遊戲', key: 'game_name', width: 180, render: row => h('div', {}, [h('div', row.game_name), h('div', { class: 'font-mono text-xs text-slate-500' }, row.game_id)]) },
  { title: '幣別', key: 'display_currency', width: 90 },
  { title: 'Provider Code', key: 'provider_limit_code', width: 170, render: row => h('span', { class: 'font-mono text-xs text-cyan-300' }, row.provider_limit_code) },
  { title: 'Provider 區間', key: 'provider_range', width: 180, render: row => `${formatAmount(row.provider_min_bet)} - ${formatAmount(row.provider_max_bet)}` },
  { title: '級距', key: 'provider_bet_step', width: 100, align: 'right', render: row => formatAmount(row.provider_bet_step) },
  { title: '原生支援', key: 'support_native_limit', width: 110, render: row => h(NTag, { type: row.support_native_limit ? 'success' : 'default', size: 'small', bordered: false }, { default: () => row.support_native_limit ? '支援' : '不支援' }) },
  { title: '狀態', key: 'status', width: 90, render: row => h(NTag, { type: statusMeta[row.status].type, size: 'small', bordered: false }, { default: () => statusMeta[row.status].label }) }
]

const gameBindingColumns: DataTableColumns<GameBinding> = [
  { title: '供應商', key: 'provider_name', width: 150 },
  { title: '遊戲', key: 'game_name', render: row => h('div', {}, [h('div', row.game_name), h('div', { class: 'font-mono text-xs text-slate-500' }, row.game_id)]) },
  { title: '類型', key: 'game_type', width: 110 },
  { title: '預設群組', key: 'is_default', width: 110, render: row => row.is_default ? '是' : '否' },
  { title: '狀態', key: 'status', width: 100, render: row => h(NTag, { type: statusMeta[row.status].type, size: 'small', bordered: false }, { default: () => statusMeta[row.status].label }) }
]

const accessColumns: DataTableColumns<AccessRow> = [
  { title: '對象', key: 'target_name', render: row => h('div', {}, [h('div', row.target_name), h('div', { class: 'font-mono text-xs text-slate-500' }, row.target_id)]) },
  { title: '上層', key: 'parent_name', render: row => row.parent_name || '-' },
  { title: '可用幣別', key: 'display_currencies', render: row => h('div', { class: 'flex flex-wrap gap-1' }, row.display_currencies.map(currency => h(NTag, { size: 'small', bordered: false }, { default: () => currency }))) },
  { title: '狀態', key: 'status', width: 100, render: row => h(NTag, { type: statusMeta[row.status].type, size: 'small', bordered: false }, { default: () => statusMeta[row.status].label }) },
  { title: '生效時間', key: 'effective_at', width: 175, render: row => formatDateTime(row.effective_at) }
]

const tierColumns: DataTableColumns<PlayerTierLimit> = [
  { title: '商戶', key: 'merchant_name', render: row => h('div', {}, [h('div', row.merchant_name), h('div', { class: 'font-mono text-xs text-slate-500' }, row.merchant_id)]) },
  { title: '會員分層', key: 'tier_name', render: row => h('div', {}, [h('div', row.tier_name), h('div', { class: 'font-mono text-xs text-slate-500' }, row.player_tier_id)]) },
  { title: '幣別', key: 'display_currency', width: 90 },
  { title: '狀態', key: 'status', width: 100, render: row => h(NTag, { type: statusMeta[row.status].type, size: 'small', bordered: false }, { default: () => statusMeta[row.status].label }) },
  { title: '生效時間', key: 'effective_at', width: 175, render: row => formatDateTime(row.effective_at) }
]

const overrideColumns: DataTableColumns<PlayerOverride> = [
  { title: '特殊會員', key: 'merchant_player_id', width: 160, render: row => h('span', { class: 'font-mono text-cyan-300' }, row.merchant_player_id) },
  { title: '商戶', key: 'merchant_name', width: 190 },
  { title: '幣別', key: 'display_currency', width: 90 },
  { title: '自訂區間', key: 'custom_range', width: 190, render: row => `${formatAmount(row.custom_min_bet_display)} - ${formatAmount(row.custom_max_bet_display)}` },
  { title: 'USDT 區間', key: 'custom_usdt_range', width: 210, render: row => `${formatAmount(row.custom_min_bet_usdt, 'USDT')} - ${formatAmount(row.custom_max_bet_usdt, 'USDT')}` },
  { title: '審核', key: 'approval_status', width: 100, render: row => h(NTag, { type: approvalMeta[row.approval_status].type, size: 'small', bordered: false }, { default: () => approvalMeta[row.approval_status].label }) },
  { title: '原因', key: 'reason', minWidth: 220 },
  { title: '失效時間', key: 'expired_at', width: 175, render: row => formatDateTime(row.expired_at) }
]

const snapshotColumns: DataTableColumns<SessionSnapshot> = [
  { title: 'Snapshot ID', key: 'snapshot_id', width: 140, fixed: 'left', render: row => h('span', { class: 'font-mono text-xs text-cyan-300' }, row.snapshot_id) },
  { title: 'Session', key: 'session_id', width: 170, render: row => h('span', { class: 'font-mono text-xs text-slate-400' }, row.session_id) },
  { title: '商戶 / 會員', key: 'merchant_player_id', width: 190, render: row => h('div', {}, [h('div', row.merchant_player_id), h('div', { class: 'font-mono text-xs text-slate-500' }, row.merchant_id)]) },
  { title: '遊戲', key: 'game_name', width: 170 },
  { title: '幣別', key: 'display_currency', width: 80 },
  { title: 'Display 區間', key: 'display_range', width: 190, render: row => `${formatAmount(row.min_bet_display)} - ${formatAmount(row.max_bet_display)}` },
  { title: 'USDT 區間', key: 'usdt_range', width: 210, render: row => `${formatAmount(row.min_bet_usdt, 'USDT')} - ${formatAmount(row.max_bet_usdt, 'USDT')}` },
  { title: 'Provider Code', key: 'provider_limit_code', width: 150 },
  { title: '建立時間', key: 'created_at', width: 175, render: row => formatDateTime(row.created_at) }
]
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">遊戲限額管理</h1>
        <p class="mt-1 text-sm text-slate-500">
          管理單槍群組、單注區間、幣別限額矩陣、Provider 限額對應與代理 / 商戶 / 會員分層套用。
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <n-button secondary @click="actionMessage('批量匯入單槍群組')">批量匯入</n-button>
        <n-button type="primary" @click="openEditor">
          <template #icon><n-icon :component="AddOutlined" /></template>
          新增單槍群組
        </n-button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-6">
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="群組總數" :value="summary.total" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="啟用群組" :value="summary.active" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="支援幣別" :value="summary.currencies" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="綁定遊戲" :value="summary.games" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="套用商戶" :value="summary.merchants" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="特殊會員" :value="summary.overrides" /></div>
    </div>

    <n-alert type="info" :show-icon="false">
      單槍群組以「遊戲類型 + 幣別 + 群組等級」管理單次下注區間。開放給代理時只勾選可用群組，商戶與會員分層只能從上層已開放群組中套用。
    </n-alert>

    <div class="flex flex-wrap items-center gap-3 rounded border border-white/10 bg-[#18181c] p-4">
      <n-input v-model:value="keyword" clearable placeholder="搜尋群組名稱 / 群組代碼 / 遊戲類型 / 描述" style="width: 340px; max-width: 100%;">
        <template #prefix><n-icon :component="SearchOutlined" /></template>
      </n-input>
      <n-select v-model:value="gameTypeFilter" clearable :options="gameTypeOptions" placeholder="遊戲類型" style="width: 130px;" />
      <n-select v-model:value="levelFilter" clearable :options="levelOptions" placeholder="群組等級" style="width: 130px;" />
      <n-select v-model:value="currencyFilter" clearable :options="currencyOptions" placeholder="幣別" style="width: 120px;" />
      <n-select v-model:value="nativeFilter" clearable :options="nativeOptions" placeholder="Provider 原生" style="width: 150px;" />
      <n-select v-model:value="statusFilter" clearable :options="statusOptions" placeholder="狀態" style="width: 120px;" />
      <n-button secondary @click="resetFilters">重置</n-button>
    </div>

    <n-data-table
      :columns="withTableSorters(columns)"
      :data="filteredRows"
      :pagination="{ pageSize: 10, showSizePicker: true, pageSizes: [10, 20, 50] }"
      :bordered="false"
      :scroll-x="1925"
      striped
    />

    <n-drawer v-model:show="showDetail" width="min(1120px, 100vw)">
      <n-drawer-content closable>
        <template #header>
          <div v-if="currentRow" class="flex flex-wrap items-center gap-3">
            <span class="text-lg font-semibold">{{ currentRow.limit_group_name }}</span>
            <span class="font-mono text-sm text-slate-500">{{ currentRow.limit_group_code }}</span>
            <n-tag size="small" :bordered="false">{{ currentRow.game_type }}</n-tag>
            <n-tag size="small" :type="groupLevelMeta[currentRow.group_level].type" :bordered="false">{{ groupLevelMeta[currentRow.group_level].label }}</n-tag>
            <n-tag size="small" :type="statusMeta[currentRow.status].type" :bordered="false">{{ statusMeta[currentRow.status].label }}</n-tag>
          </div>
        </template>

        <template v-if="currentRow">
          <div class="mb-5 grid grid-cols-1 gap-3 md:grid-cols-4">
            <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="綁定遊戲" :value="currentRow.bound_game_count" /></div>
            <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="開放代理" :value="currentRow.agent_access_count" /></div>
            <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="套用商戶" :value="currentRow.merchant_access_count" /></div>
            <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="特殊會員" :value="currentRow.player_override_count" /></div>
          </div>

          <n-tabs v-model:value="detailTab" type="line" animated>
            <n-tab-pane name="basic" tab="基本資料">
              <n-descriptions bordered :column="2" label-placement="left">
                <n-descriptions-item label="群組 ID">{{ currentRow.limit_group_id }}</n-descriptions-item>
                <n-descriptions-item label="群組代碼">{{ currentRow.limit_group_code }}</n-descriptions-item>
                <n-descriptions-item label="群組名稱">{{ currentRow.limit_group_name }}</n-descriptions-item>
                <n-descriptions-item label="遊戲類型">{{ currentRow.game_type }}</n-descriptions-item>
                <n-descriptions-item label="群組等級">{{ groupLevelMeta[currentRow.group_level].label }}</n-descriptions-item>
                <n-descriptions-item label="Provider 原生支援">{{ nativeSupportMeta[currentRow.native_support].label }}</n-descriptions-item>
                <n-descriptions-item label="支援幣別" :span="2">{{ currentRow.supported_currencies.join(' / ') }}</n-descriptions-item>
                <n-descriptions-item label="描述" :span="2">{{ currentRow.description }}</n-descriptions-item>
                <n-descriptions-item label="生效時間">{{ formatDateTime(currentRow.effective_at) }}</n-descriptions-item>
                <n-descriptions-item label="更新時間">{{ formatDateTime(currentRow.updated_at) }}</n-descriptions-item>
              </n-descriptions>
            </n-tab-pane>

            <n-tab-pane name="currency" tab="幣別限額">
              <n-alert type="info" :show-icon="false" class="mb-4">
                每個 display_currency 都必須獨立設定 min / max / step / default / 小數位；匯率只用於換算 USDT 檢查值，不反向推導正式下注區間。
              </n-alert>
              <n-data-table :columns="withTableSorters(currencyColumns)" :data="currentRow.currency_limits" :pagination="false" :scroll-x="1390" />
            </n-tab-pane>

            <n-tab-pane name="provider" tab="Provider 對應">
              <n-data-table :columns="withTableSorters(providerColumns)" :data="currentRow.provider_mappings" :pagination="false" :scroll-x="1180" />
            </n-tab-pane>

            <n-tab-pane name="games" tab="遊戲綁定">
              <n-data-table :columns="withTableSorters(gameBindingColumns)" :data="currentRow.game_bindings" :pagination="false" :scroll-x="780" />
            </n-tab-pane>

            <n-tab-pane name="agents" tab="代理開放">
              <n-alert type="warning" :show-icon="false" class="mb-4">
                代理只取得平台開放的單槍群組，不能自行建立超過上層範圍的限額。
              </n-alert>
              <n-data-table :columns="withTableSorters(accessColumns)" :data="currentRow.agent_access" :pagination="false" :scroll-x="900" />
            </n-tab-pane>

            <n-tab-pane name="merchants" tab="商戶套用">
              <n-data-table :columns="withTableSorters(accessColumns)" :data="currentRow.merchant_access" :pagination="false" :scroll-x="900" />
            </n-tab-pane>

            <n-tab-pane name="tiers" tab="會員分層">
              <n-data-table :columns="withTableSorters(tierColumns)" :data="currentRow.player_tiers" :pagination="false" :scroll-x="820" />
            </n-tab-pane>

            <n-tab-pane name="overrides" tab="特殊會員覆寫">
              <n-alert type="warning" :show-icon="false" class="mb-4">
                提高最高下注、設定特殊會員覆寫與開放 VIP 群組皆屬高風險操作，需輸入原因並寫入操作紀錄。
              </n-alert>
              <n-data-table :columns="withTableSorters(overrideColumns)" :data="currentRow.player_overrides" :pagination="false" :scroll-x="1320" />
            </n-tab-pane>

            <n-tab-pane name="snapshots" tab="限額快照">
              <n-alert type="info" :show-icon="false" class="mb-4">
                Launch Game 時建立 Session 單槍快照；同一 Session 內不受後續匯率、限額或代理 / 商戶設定異動影響。
              </n-alert>
              <n-data-table :columns="withTableSorters(snapshotColumns)" :data="currentRow.snapshots" :pagination="false" :scroll-x="1400" />
            </n-tab-pane>

            <n-tab-pane name="logs" tab="操作紀錄">
              <n-timeline>
                <n-timeline-item v-for="log in currentRow.logs" :key="log.trace_id" type="success" :title="log.action" :time="formatDateTime(log.operated_at)">
                  <div class="text-sm text-slate-500">{{ log.operator }} / {{ log.trace_id }}</div>
                </n-timeline-item>
              </n-timeline>
            </n-tab-pane>
          </n-tabs>
        </template>

        <template #footer>
          <div v-if="currentRow" class="flex flex-wrap justify-end gap-2">
            <n-button secondary @click="actionMessage('設定幣別限額', currentRow)">幣別限額</n-button>
            <n-button secondary @click="actionMessage('開放給代理', currentRow)">開放代理</n-button>
            <n-button secondary @click="actionMessage('套用到商戶', currentRow)">套用商戶</n-button>
            <n-button secondary @click="actionMessage('設定特殊會員', currentRow)">特殊會員</n-button>
            <n-button type="primary" secondary @click="copyLimitGroup(currentRow)">複製群組</n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>

    <n-modal v-model:show="showEditor" preset="card" title="新增單槍群組" class="max-w-[860px]" :bordered="false">
      <n-steps v-model:current="editorStep" class="mb-6">
        <n-step title="基本資料" />
        <n-step title="幣別限額" />
        <n-step title="Provider 對應" />
        <n-step title="綁定與生效" />
      </n-steps>

      <n-form label-placement="left" label-width="150">
        <template v-if="editorStep === 1">
          <n-form-item label="群組代碼" required><n-input v-model:value="editorForm.limit_group_code" placeholder="例如 SLOT_HIGH" /></n-form-item>
          <n-form-item label="群組名稱" required><n-input v-model:value="editorForm.limit_group_name" placeholder="例如 Slot_高額" /></n-form-item>
          <n-form-item label="遊戲類型"><n-select v-model:value="editorForm.game_type" :options="gameTypeOptions" /></n-form-item>
          <n-form-item label="群組等級"><n-select v-model:value="editorForm.group_level" :options="levelOptions" /></n-form-item>
        </template>

        <template v-if="editorStep === 2">
          <n-form-item label="幣別"><n-select v-model:value="editorForm.display_currency" :options="currencyOptions" /></n-form-item>
          <n-form-item label="最低下注"><n-input-number v-model:value="editorForm.min_bet_display" :min="0" /></n-form-item>
          <n-form-item label="最高下注"><n-input-number v-model:value="editorForm.max_bet_display" :min="0" /></n-form-item>
          <n-form-item label="下注級距"><n-input-number v-model:value="editorForm.bet_step_display" :min="0" /></n-form-item>
          <n-form-item label="預設下注"><n-input-number v-model:value="editorForm.default_bet_display" :min="0" /></n-form-item>
          <n-alert type="info" :show-icon="false">正式版本會支援多幣別矩陣與 Excel 批量匯入；此處先示範建立一個幣別限額。</n-alert>
        </template>

        <template v-if="editorStep === 3">
          <n-form-item label="Provider Limit Code"><n-input v-model:value="editorForm.provider_limit_code" placeholder="例如 PG_TWD_HIGH；Provider 不支援可留空" /></n-form-item>
          <n-form-item label="支援原生限額"><n-switch :value="Boolean(editorForm.provider_limit_code)" disabled /></n-form-item>
          <n-alert type="warning" :show-icon="false">若 Provider 不支援原生限額，GGAP 需於 Bet Callback 依 Session 單槍快照檢查。</n-alert>
        </template>

        <template v-if="editorStep === 4">
          <n-form-item label="生效時間"><n-input v-model:value="editorForm.effective_at" /></n-form-item>
          <n-alert type="info" :show-icon="false">
            建立後仍需設定遊戲綁定、代理開放與商戶套用；若屬高額或 VIP 群組，正式流程需寫入原因與審核紀錄。
          </n-alert>
        </template>
      </n-form>

      <template #footer>
        <div class="flex justify-between gap-2">
          <n-button :disabled="editorStep <= 1" @click="editorStep -= 1">上一步</n-button>
          <div class="flex gap-2">
            <n-button @click="showEditor = false">取消</n-button>
            <n-button v-if="editorStep < 4" type="primary" @click="editorStep += 1">下一步</n-button>
            <n-button v-else type="primary" @click="saveLimitGroup">建立草稿</n-button>
          </div>
        </div>
      </template>
    </n-modal>
  </div>
</template>
