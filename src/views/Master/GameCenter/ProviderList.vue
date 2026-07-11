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
  NIcon,
  NInput,
  NSelect,
  NSpace,
  NStatistic,
  NTabPane,
  NTabs,
  NTag,
  NTimeline,
  NTimelineItem,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { AddOutlined, SearchOutlined, SettingsOutlined, SportsEsportsOutlined, VisibilityOutlined } from '@vicons/material'
import { DEFAULT_TABLE_PAGINATION, withTableSorters } from '../../../utils/tableSort'

type ProviderStatus = 'active' | 'maintenance' | 'disabled'
type ApiStatus = 'connected' | 'testing' | 'disabled'
type NegativeGgrPolicy = 'carry_forward' | 'zero_out'

interface ProviderGame {
  game_id: string
  game_name: string
  game_type: string
  status: ProviderStatus
}

interface ProviderCostRate {
  version: string
  provider_cost_rate: number
  negative_ggr_policy: NegativeGgrPolicy
  effective_at: string
  changed_by: string
  note: string
}

interface ProviderLog {
  action: string
  operator: string
  operated_at: string
  trace_id: string
}

interface ProviderRecord {
  provider_id: string
  provider_code: string
  provider_name: string
  provider_type: string
  status: ProviderStatus
  api_status: ApiStatus
  provider_wallet_currency: 'USDT'
  provider_settlement_currency: 'USDT'
  provider_cost_rate: number
  cost_rate_version: string
  negative_ggr_policy: NegativeGgrPolicy
  game_count: number
  enabled_game_count: number
  api_base_url: string
  callback_ip_whitelist: string[]
  secret_mask: string
  maintenance_window: string
  remark: string
  updated_at: string
  games: ProviderGame[]
  rates: ProviderCostRate[]
  logs: ProviderLog[]
}

const message = useMessage()
const showDetail = ref(false)
const currentRow = ref<ProviderRecord | null>(null)
const detailTab = ref('basic')
const searchText = ref('')
const statusFilter = ref<ProviderStatus | null>(null)
const typeFilter = ref<string | null>(null)
const apiFilter = ref<ApiStatus | null>(null)

const rows = ref<ProviderRecord[]>([
  {
    provider_id: 'PROV-PG',
    provider_code: 'PG',
    provider_name: 'PG Soft',
    provider_type: 'Slot',
    status: 'active',
    api_status: 'connected',
    provider_wallet_currency: 'USDT',
    provider_settlement_currency: 'USDT',
    provider_cost_rate: 0.04,
    cost_rate_version: 'PG-COST-2026.07',
    negative_ggr_policy: 'carry_forward',
    game_count: 42,
    enabled_game_count: 40,
    api_base_url: 'https://api.pg.example',
    callback_ip_whitelist: ['34.120.18.10', '34.120.18.11'],
    secret_mask: 'pg_live_********',
    maintenance_window: '每週三 05:00-05:30',
    remark: '主要電子供應商，正式結算幣別固定 USDT。',
    updated_at: '2026-07-07T08:20:00.000Z',
    games: [
      { game_id: 'PG-001', game_name: 'Fortune Tiger', game_type: 'Slot', status: 'active' },
      { game_id: 'PG-002', game_name: 'Mahjong Ways', game_type: 'Slot', status: 'active' }
    ],
    rates: [
      { version: 'PG-COST-2026.07', provider_cost_rate: 0.04, negative_ggr_policy: 'carry_forward', effective_at: '2026-07-01T00:00:00.000Z', changed_by: 'Finance', note: 'MVP 統一 USDT 成本費率。' },
      { version: 'PG-COST-2026.06', provider_cost_rate: 0.045, negative_ggr_policy: 'carry_forward', effective_at: '2026-06-01T00:00:00.000Z', changed_by: 'Finance', note: '前一版成本費率。' }
    ],
    logs: [
      { action: '測試 Provider USDT Wallet API', operator: 'System', operated_at: '2026-07-07T08:20:00.000Z', trace_id: 'trace-provider-pg-wallet' }
    ]
  },
  {
    provider_id: 'PROV-EVO',
    provider_code: 'EVO',
    provider_name: 'Evolution',
    provider_type: 'Live',
    status: 'active',
    api_status: 'connected',
    provider_wallet_currency: 'USDT',
    provider_settlement_currency: 'USDT',
    provider_cost_rate: 0.06,
    cost_rate_version: 'EVO-COST-2026.07',
    negative_ggr_policy: 'carry_forward',
    game_count: 18,
    enabled_game_count: 18,
    api_base_url: 'https://api.evo.example',
    callback_ip_whitelist: ['35.201.18.42'],
    secret_mask: 'evo_live_********',
    maintenance_window: '未設定',
    remark: '真人供應商，接入時已設定成本費率。',
    updated_at: '2026-07-07T07:40:00.000Z',
    games: [
      { game_id: 'EVO-001', game_name: 'Baccarat A', game_type: 'Live', status: 'active' }
    ],
    rates: [
      { version: 'EVO-COST-2026.07', provider_cost_rate: 0.06, negative_ggr_policy: 'carry_forward', effective_at: '2026-07-01T00:00:00.000Z', changed_by: 'Finance', note: '真人遊戲成本費率。' }
    ],
    logs: [
      { action: 'Provider API 連線成功', operator: 'System', operated_at: '2026-07-07T07:40:00.000Z', trace_id: 'trace-provider-evo-api' }
    ]
  },
  {
    provider_id: 'PROV-PP',
    provider_code: 'PP',
    provider_name: 'Pragmatic Play',
    provider_type: 'Slot',
    status: 'maintenance',
    api_status: 'testing',
    provider_wallet_currency: 'USDT',
    provider_settlement_currency: 'USDT',
    provider_cost_rate: 0.05,
    cost_rate_version: 'PP-COST-2026.07',
    negative_ggr_policy: 'zero_out',
    game_count: 35,
    enabled_game_count: 31,
    api_base_url: 'https://api.pp.example',
    callback_ip_whitelist: ['35.241.88.90'],
    secret_mask: 'pp_live_********',
    maintenance_window: '每月第 1 個週日 04:00-05:00',
    remark: '負 GGR 依合約清零。',
    updated_at: '2026-07-06T04:10:00.000Z',
    games: [
      { game_id: 'PP-001', game_name: 'Gates of Olympus', game_type: 'Slot', status: 'maintenance' }
    ],
    rates: [
      { version: 'PP-COST-2026.07', provider_cost_rate: 0.05, negative_ggr_policy: 'zero_out', effective_at: '2026-07-01T00:00:00.000Z', changed_by: 'Finance', note: '負 GGR 清零。' }
    ],
    logs: [
      { action: '設定負 GGR 清零', operator: 'Finance', operated_at: '2026-06-24T04:10:00.000Z', trace_id: 'trace-provider-pp-ggr' }
    ]
  },
  {
    provider_id: 'PROV-JILI',
    provider_code: 'JILI',
    provider_name: 'JILI Gaming',
    provider_type: 'Slot',
    status: 'disabled',
    api_status: 'disabled',
    provider_wallet_currency: 'USDT',
    provider_settlement_currency: 'USDT',
    provider_cost_rate: 0.052,
    cost_rate_version: 'JILI-COST-2026.07',
    negative_ggr_policy: 'zero_out',
    game_count: 21,
    enabled_game_count: 0,
    api_base_url: 'https://api.jili.example',
    callback_ip_whitelist: [],
    secret_mask: 'jili_live_********',
    maintenance_window: '未設定',
    remark: '暫停接入測試。',
    updated_at: '2026-07-07T10:12:00.000Z',
    games: [
      { game_id: 'JILI-001', game_name: 'Super Ace', game_type: 'Slot', status: 'disabled' }
    ],
    rates: [
      { version: 'JILI-COST-2026.07', provider_cost_rate: 0.052, negative_ggr_policy: 'zero_out', effective_at: '2026-07-01T00:00:00.000Z', changed_by: 'Finance', note: '維持 5.2% 成本。' }
    ],
    logs: [
      { action: '切換維護模式', operator: 'Ops', operated_at: '2026-07-07T10:12:00.000Z', trace_id: 'trace-provider-jili-maintenance' }
    ]
  }
])

const statusMeta: Record<ProviderStatus, { label: string; type: 'success' | 'warning' | 'error' }> = {
  active: { label: '啟用', type: 'success' },
  maintenance: { label: '維護中', type: 'warning' },
  disabled: { label: '停用', type: 'error' }
}
const apiMeta: Record<ApiStatus, { label: string; type: 'success' | 'warning' | 'default' }> = {
  connected: { label: '已連線', type: 'success' },
  testing: { label: '測試中', type: 'warning' },
  disabled: { label: '未啟用', type: 'default' }
}
const negativeGgrMeta: Record<NegativeGgrPolicy, string> = {
  carry_forward: '保留到下期',
  zero_out: '清零'
}

const statusOptions = [
  { label: '啟用', value: 'active' },
  { label: '維護中', value: 'maintenance' },
  { label: '停用', value: 'disabled' }
]
const apiOptions = [
  { label: '已連線', value: 'connected' },
  { label: '測試中', value: 'testing' },
  { label: '未啟用', value: 'disabled' }
]
const typeOptions = computed(() => Array.from(new Set(rows.value.map(row => row.provider_type))).map(value => ({ label: value, value })))

const formatRate = (value: number) => `${(value * 100).toFixed(2)}%`
const formatDateTime = (value?: string) => value ? new Date(value).toLocaleString('zh-TW') : '-'

const filteredRows = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  return rows.value.filter(row => {
    const inKeyword = !keyword
      || row.provider_code.toLowerCase().includes(keyword)
      || row.provider_name.toLowerCase().includes(keyword)
      || row.provider_id.toLowerCase().includes(keyword)
    const inStatus = !statusFilter.value || row.status === statusFilter.value
    const inType = !typeFilter.value || row.provider_type === typeFilter.value
    const inApi = !apiFilter.value || row.api_status === apiFilter.value
    return inKeyword && inStatus && inType && inApi
  })
})

const summary = computed(() => ({
  total: rows.value.length,
  active: rows.value.filter(row => row.status === 'active').length,
  maintenance: rows.value.filter(row => row.status === 'maintenance').length,
  games: rows.value.reduce((sum, row) => sum + row.game_count, 0),
  enabledGames: rows.value.reduce((sum, row) => sum + row.enabled_game_count, 0)
}))

const resetFilters = () => {
  searchText.value = ''
  statusFilter.value = null
  typeFilter.value = null
  apiFilter.value = null
}

const openDetail = (row: ProviderRecord) => {
  currentRow.value = row
  detailTab.value = 'basic'
  showDetail.value = true
}

const actionMessage = (label: string, row?: ProviderRecord) => {
  message.info(`${label}${row ? `：${row.provider_name}` : ''}，演示操作已保留。`)
}

const columns: DataTableColumns<ProviderRecord> = [
  {
    title: '供應商',
    key: 'provider_name',
    width: 230,
    fixed: 'left',
    render: row => h('button', { class: 'text-left hover:text-cyan-300', onClick: () => openDetail(row) }, [
      h('div', { class: 'font-semibold' }, row.provider_name),
      h('div', { class: 'font-mono text-xs text-slate-500' }, `${row.provider_code} / ${row.provider_id}`)
    ])
  },
  { title: '類型', key: 'provider_type', width: 90, render: row => h(NTag, { size: 'small', bordered: false }, { default: () => row.provider_type }) },
  { title: '狀態', key: 'status', width: 110, render: row => h(NTag, { type: statusMeta[row.status].type, bordered: false }, { default: () => statusMeta[row.status].label }) },
  { title: 'API 狀態', key: 'api_status', width: 110, render: row => h(NTag, { type: apiMeta[row.api_status].type, bordered: false }, { default: () => apiMeta[row.api_status].label }) },
  { title: '錢包幣別', key: 'provider_wallet_currency', width: 100, render: row => h(NTag, { type: 'success', size: 'small', bordered: false }, { default: () => row.provider_wallet_currency }) },
  { title: '結算幣別', key: 'provider_settlement_currency', width: 110, render: row => h(NTag, { type: 'success', size: 'small', bordered: false }, { default: () => row.provider_settlement_currency }) },
  { title: '成本費率', key: 'provider_cost_rate', width: 110, align: 'right', sorter: (a, b) => a.provider_cost_rate - b.provider_cost_rate, render: row => formatRate(row.provider_cost_rate) },
  { title: '負 GGR', key: 'negative_ggr_policy', width: 120, render: row => negativeGgrMeta[row.negative_ggr_policy] },
  { title: '費率版本', key: 'cost_rate_version', width: 150, render: row => h('span', { class: 'font-mono text-xs text-slate-400' }, row.cost_rate_version) },
  { title: '遊戲數', key: 'game_count', width: 100, align: 'right', render: row => `${row.enabled_game_count}/${row.game_count}` },
  { title: '更新時間', key: 'updated_at', width: 175, render: row => formatDateTime(row.updated_at) },
  {
    title: '操作',
    key: 'actions',
    width: 260,
    fixed: 'right',
    render: row => h(NSpace, { size: 6, wrap: false }, {
      default: () => [
        h(NButton, { size: 'small', secondary: true, onClick: () => openDetail(row) }, { icon: () => h(NIcon, { component: VisibilityOutlined }), default: () => '查看' }),
        h(NButton, { size: 'small', secondary: true, onClick: () => actionMessage('測試 API', row) }, { default: () => '測試' }),
        h(NButton, { size: 'small', secondary: true, onClick: () => actionMessage('同步遊戲', row) }, { icon: () => h(NIcon, { component: SportsEsportsOutlined }), default: () => '同步' })
      ]
    })
  }
]

const gameColumns: DataTableColumns<ProviderGame> = [
  { title: '遊戲 ID', key: 'game_id', width: 120 },
  { title: '遊戲名稱', key: 'game_name' },
  { title: '類型', key: 'game_type', width: 100 },
  { title: '狀態', key: 'status', width: 120, render: row => h(NTag, { type: statusMeta[row.status].type, bordered: false }, { default: () => statusMeta[row.status].label }) }
]

const rateColumns: DataTableColumns<ProviderCostRate> = [
  { title: '版本', key: 'version', width: 150 },
  { title: '成本費率', key: 'provider_cost_rate', width: 120, render: row => formatRate(row.provider_cost_rate) },
  { title: '負 GGR', key: 'negative_ggr_policy', width: 130, render: row => negativeGgrMeta[row.negative_ggr_policy] },
  { title: '生效時間', key: 'effective_at', width: 175, render: row => formatDateTime(row.effective_at) },
  { title: '異動人', key: 'changed_by', width: 100 },
  { title: '備註', key: 'note' }
]
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">供應商管理</h1>
        <p class="mt-1 text-sm text-gray-500">
          管理 Provider 接入、USDT 單一錢包、供應商成本費率、負 GGR 與遊戲同步。
        </p>
      </div>
      <n-button type="primary" @click="actionMessage('新增供應商')">
        <template #icon><n-icon><AddOutlined /></n-icon></template>
        新增供應商
      </n-button>
    </div>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-5">
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="供應商總數" :value="summary.total" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="啟用" :value="summary.active" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="維護中" :value="summary.maintenance" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="遊戲總數" :value="summary.games" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="啟用遊戲" :value="summary.enabledGames" /></div>
    </div>

    <n-alert type="info" :show-icon="false">
      供應商成本費率只在供應商管理維護；代理與商戶費率設定可讀取此成本作為報價參考，但供應商帳務不掛代理或商戶。
    </n-alert>

    <div class="flex flex-wrap items-center gap-3 rounded border border-white/10 bg-[#202026] p-4">
      <n-input v-model:value="searchText" clearable placeholder="搜尋供應商代碼 / 名稱 / ID" style="width: 320px; max-width: 100%;">
        <template #prefix><n-icon :component="SearchOutlined" class="opacity-60" /></template>
      </n-input>
      <n-select v-model:value="statusFilter" clearable placeholder="狀態" :options="statusOptions" style="width: 140px;" />
      <n-select v-model:value="typeFilter" clearable placeholder="類型" :options="typeOptions" style="width: 140px;" />
      <n-select v-model:value="apiFilter" clearable placeholder="API 狀態" :options="apiOptions" style="width: 150px;" />
      <n-button secondary @click="resetFilters">重置</n-button>
    </div>

    <n-data-table
      :columns="withTableSorters(columns)"
      :data="filteredRows"
      :pagination="DEFAULT_TABLE_PAGINATION"
      :scroll-x="1715"
    />

    <n-drawer v-model:show="showDetail" width="min(1040px, 100vw)">
      <n-drawer-content closable>
        <template #header>
          <div v-if="currentRow" class="flex flex-wrap items-center gap-3">
            <span class="text-lg font-semibold">{{ currentRow.provider_name }}</span>
            <span class="font-mono text-sm text-slate-500">{{ currentRow.provider_code }}</span>
            <n-tag :type="statusMeta[currentRow.status].type" :bordered="false">{{ statusMeta[currentRow.status].label }}</n-tag>
            <n-tag type="success" :bordered="false">USDT</n-tag>
          </div>
        </template>

        <template v-if="currentRow">
          <div class="mb-5 grid grid-cols-1 gap-3 md:grid-cols-4">
            <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="成本費率">{{ formatRate(currentRow.provider_cost_rate) }}</n-statistic></div>
            <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="啟用遊戲">{{ currentRow.enabled_game_count }} / {{ currentRow.game_count }}</n-statistic></div>
            <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="負 GGR">{{ negativeGgrMeta[currentRow.negative_ggr_policy] }}</n-statistic></div>
            <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="費率版本">{{ currentRow.cost_rate_version }}</n-statistic></div>
          </div>

          <n-tabs v-model:value="detailTab" type="line" animated>
            <n-tab-pane name="basic" tab="基本資料">
              <n-descriptions bordered :column="2" label-placement="left">
                <n-descriptions-item label="供應商 ID">{{ currentRow.provider_id }}</n-descriptions-item>
                <n-descriptions-item label="供應商代碼">{{ currentRow.provider_code }}</n-descriptions-item>
                <n-descriptions-item label="類型">{{ currentRow.provider_type }}</n-descriptions-item>
                <n-descriptions-item label="狀態">{{ statusMeta[currentRow.status].label }}</n-descriptions-item>
                <n-descriptions-item label="維護時段">{{ currentRow.maintenance_window }}</n-descriptions-item>
                <n-descriptions-item label="更新時間">{{ formatDateTime(currentRow.updated_at) }}</n-descriptions-item>
                <n-descriptions-item label="備註" :span="2">{{ currentRow.remark }}</n-descriptions-item>
              </n-descriptions>
            </n-tab-pane>

            <n-tab-pane name="api" tab="API 設定">
              <n-descriptions bordered :column="2" label-placement="left">
                <n-descriptions-item label="API 狀態"><n-tag :type="apiMeta[currentRow.api_status].type" :bordered="false">{{ apiMeta[currentRow.api_status].label }}</n-tag></n-descriptions-item>
                <n-descriptions-item label="API Base URL">{{ currentRow.api_base_url }}</n-descriptions-item>
                <n-descriptions-item label="Secret">{{ currentRow.secret_mask }}</n-descriptions-item>
                <n-descriptions-item label="Provider Wallet">GGAP 單一 USDT 錢包</n-descriptions-item>
                <n-descriptions-item label="IP 白名單" :span="2">{{ currentRow.callback_ip_whitelist.join(', ') || '未設定' }}</n-descriptions-item>
                <n-descriptions-item label="Provider 不需要知道" :span="2">商戶錢包模式 / 會員顯示幣別 / 代理層級</n-descriptions-item>
              </n-descriptions>
            </n-tab-pane>

            <n-tab-pane name="rates" tab="成本費率">
              <n-data-table :columns="withTableSorters(rateColumns)" :data="currentRow.rates" :pagination="DEFAULT_TABLE_PAGINATION" :scroll-x="900" />
            </n-tab-pane>

            <n-tab-pane name="games" tab="遊戲清單">
              <n-data-table :columns="withTableSorters(gameColumns)" :data="currentRow.games" :pagination="DEFAULT_TABLE_PAGINATION" :scroll-x="620" />
            </n-tab-pane>

            <n-tab-pane name="logs" tab="操作紀錄">
              <n-timeline>
                <n-timeline-item v-for="log in currentRow.logs" :key="log.trace_id" type="success" :title="log.action" :time="formatDateTime(log.operated_at)">
                  <div class="text-sm text-gray-500">{{ log.operator }} / {{ log.trace_id }}</div>
                </n-timeline-item>
              </n-timeline>
            </n-tab-pane>
          </n-tabs>
        </template>

        <template #footer>
          <div v-if="currentRow" class="flex flex-wrap justify-end gap-2">
            <n-button secondary @click="actionMessage('測試 API', currentRow)">
              <template #icon><n-icon><SettingsOutlined /></n-icon></template>
              測試 API
            </n-button>
            <n-button secondary @click="actionMessage('同步遊戲', currentRow)">同步遊戲</n-button>
            <n-button type="primary" secondary @click="actionMessage('更新成本費率', currentRow)">更新成本費率</n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>
