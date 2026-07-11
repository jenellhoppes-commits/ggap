<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NCard, NDataTable, NInput, NSelect, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { DEFAULT_TABLE_PAGINATION, withTableSorters } from '../../../utils/tableSort'

interface BetTraceRow {
  round_id: string
  bet_id: string
  agent_path: string
  merchant_id: string
  merchant_name: string
  player_id: string
  provider: string
  game_name: string
  display_currency: string
  display_bet: number
  display_win: number
  settlement_currency: 'USDT'
  settlement_bet: number
  settlement_ggr: number
  wallet_mode: 'Seamless' | 'Transfer'
  provider_tx_id: string
  limit_snapshot: string
  status: 'settled' | 'pending' | 'voided' | 'abnormal'
  created_at: string
  settled_at: string
}

const route = useRoute()
const isAgentPortal = computed(() => route.path.startsWith('/agent'))
const keyword = ref('')
const status = ref<string | null>(null)
const walletMode = ref<string | null>(null)

const rows: BetTraceRow[] = [
  { round_id: 'R-20260708-8811', bet_id: 'BET-0001', agent_path: '平台直營代理 / SEA L2', merchant_id: 'OP-1001', merchant_name: 'Blue Whale Interactive', player_id: 'P-TWD-10001', provider: 'PG Soft', game_name: 'Mahjong Ways', display_currency: 'TWD', display_bet: 1200, display_win: 860, settlement_currency: 'USDT', settlement_bet: 37.21, settlement_ggr: 10.54, wallet_mode: 'Seamless', provider_tx_id: 'PG-TX-99801', limit_snapshot: 'Slot 一般會員', status: 'settled', created_at: '2026/7/8 13:41:10', settled_at: '2026/7/8 13:41:35' },
  { round_id: 'R-20260708-8812', bet_id: 'BET-0002', agent_path: '平台直營代理 / SEA L2', merchant_id: 'OP-1002', merchant_name: 'HyperWin Network', player_id: 'P-IDR-10022', provider: 'JILI', game_name: 'Super Ace', display_currency: 'IDR', display_bet: 300000, display_win: 0, settlement_currency: 'USDT', settlement_bet: 18.24, settlement_ggr: 18.24, wallet_mode: 'Transfer', provider_tx_id: 'JL-TX-19381', limit_snapshot: 'Slot VIP 2000-5000', status: 'settled', created_at: '2026/7/8 12:55:47', settled_at: '2026/7/8 12:56:04' },
  { round_id: 'R-20260708-8813', bet_id: 'BET-0003', agent_path: '平台直營代理', merchant_id: 'OP-1003', merchant_name: 'Lucky Star Digital', player_id: 'P-PHP-10018', provider: 'Evolution', game_name: 'Baccarat A', display_currency: 'PHP', display_bet: 5000, display_win: 7250, settlement_currency: 'USDT', settlement_bet: 85.41, settlement_ggr: -38.43, wallet_mode: 'Seamless', provider_tx_id: 'EV-TX-77001', limit_snapshot: '百家樂一般會員', status: 'pending', created_at: '2026/7/8 11:20:33', settled_at: '-' },
  { round_id: 'R-20260708-8814', bet_id: 'BET-0004', agent_path: '平台直營代理 / SEA L2 / VN L3', merchant_id: 'OP-1004', merchant_name: 'NovaPlay Entertainment', player_id: 'P-VND-10044', provider: 'CQ9', game_name: 'Lucky Fishing', display_currency: 'VND', display_bet: 2200000, display_win: 0, settlement_currency: 'USDT', settlement_bet: 86.12, settlement_ggr: 86.12, wallet_mode: 'Transfer', provider_tx_id: 'CQ-TX-11890', limit_snapshot: 'Fishing 一般會員', status: 'abnormal', created_at: '2026/7/8 10:02:12', settled_at: '-' }
]

const visibleRows = computed(() => rows.filter((row) => {
  const text = `${row.round_id} ${row.bet_id} ${row.merchant_id} ${row.merchant_name} ${row.player_id} ${row.provider_tx_id} ${row.game_name}`.toLowerCase()
  return (!keyword.value || text.includes(keyword.value.toLowerCase())) &&
    (!status.value || row.status === status.value) &&
    (!walletMode.value || row.wallet_mode === walletMode.value)
}))

const statusOptions = [
  { label: '已結算', value: 'settled' },
  { label: '待處理', value: 'pending' },
  { label: '作廢', value: 'voided' },
  { label: '異常', value: 'abnormal' }
]

const walletOptions = [
  { label: 'Seamless', value: 'Seamless' },
  { label: 'Transfer', value: 'Transfer' }
]

const columns = computed<DataTableColumns<BetTraceRow>>(() => [
  { title: 'Round ID', key: 'round_id', width: 150, render: row => h('span', { class: 'font-mono text-cyan-300' }, row.round_id) },
  { title: '注單 ID', key: 'bet_id', width: 120, render: row => h('span', { class: 'font-mono' }, row.bet_id) },
  ...(isAgentPortal.value ? [
    { title: '商戶 / 代理', key: 'merchant_name', minWidth: 220, render: (row: BetTraceRow) => h('div', {}, [
      h('div', { class: 'font-medium' }, row.merchant_name),
      h('div', { class: 'text-xs text-gray-500' }, row.agent_path)
    ]) }
  ] : []),
  { title: '會員', key: 'player_id', width: 130, render: row => h('span', { class: 'font-mono' }, row.player_id) },
  { title: 'Provider / 遊戲', key: 'game_name', minWidth: 180, render: row => h('div', {}, [h('div', row.provider), h('div', { class: 'text-xs text-gray-500' }, row.game_name)]) },
  { title: '顯示投注', key: 'display_bet', width: 130, align: 'right', render: row => `${row.display_currency} ${row.display_bet.toLocaleString()}` },
  { title: '顯示派彩', key: 'display_win', width: 130, align: 'right', render: row => `${row.display_currency} ${row.display_win.toLocaleString()}` },
  { title: 'USDT 投注', key: 'settlement_bet', width: 120, align: 'right', render: row => `USDT ${row.settlement_bet.toLocaleString()}` },
  { title: 'USDT GGR', key: 'settlement_ggr', width: 120, align: 'right', render: row => h('span', { class: row.settlement_ggr >= 0 ? 'text-emerald-400' : 'text-red-400' }, `USDT ${row.settlement_ggr.toLocaleString()}`) },
  { title: 'Wallet', key: 'wallet_mode', width: 105 },
  { title: 'Provider Tx', key: 'provider_tx_id', width: 140, render: row => h('span', { class: 'font-mono text-xs' }, row.provider_tx_id) },
  { title: '單槍快照', key: 'limit_snapshot', width: 150, ellipsis: { tooltip: true } },
  {
    title: '狀態',
    key: 'status',
    width: 100,
    render: row => {
      const typeMap = { settled: 'success', pending: 'warning', voided: 'default', abnormal: 'error' } as const
      const labelMap = { settled: '已結算', pending: '待處理', voided: '作廢', abnormal: '異常' }
      return h(NTag, { type: typeMap[row.status], size: 'small', bordered: false }, { default: () => labelMap[row.status] })
    }
  },
  { title: '建立時間', key: 'created_at', width: 160 },
  { title: '結算時間', key: 'settled_at', width: 160 },
  {
    title: '操作',
    key: 'actions',
    width: 170,
    fixed: 'right',
    render: () => h('div', { class: 'flex flex-wrap gap-2' }, [
      h(NButton, { size: 'small', secondary: true }, { default: () => '詳情' }),
      h(NButton, { size: 'small', secondary: true }, { default: () => '流水' })
    ])
  }
])
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-white">{{ isAgentPortal ? '注單追蹤' : '注單查詢' }}</h1>
      <p class="mt-2 text-sm text-gray-500">
        {{ isAgentPortal ? '代理僅可查看自身代理樹範圍內的注單、商戶與會員。' : '商戶僅可查看自身會員注單、雙幣別金額、Wallet 與單槍快照。' }}
      </p>
    </header>

    <n-card>
      <div class="mb-4 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_160px_160px_auto]">
        <n-input v-model:value="keyword" clearable placeholder="搜尋 Round ID / 注單 ID / 會員 / Provider Tx / 遊戲" />
        <n-select v-model:value="status" clearable placeholder="注單狀態" :options="statusOptions" />
        <n-select v-model:value="walletMode" clearable placeholder="Wallet 模式" :options="walletOptions" />
        <n-button tertiary @click="keyword = ''; status = null; walletMode = null">重置</n-button>
      </div>
      <n-data-table :columns="withTableSorters(columns)" :data="visibleRows" :pagination="DEFAULT_TABLE_PAGINATION" :scroll-x="isAgentPortal ? 1900 : 1700" striped />
    </n-card>
  </div>
</template>
