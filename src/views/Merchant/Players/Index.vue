<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { NButton, NCard, NDataTable, NGrid, NGridItem, NInput, NSelect, NStatistic, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { DEFAULT_TABLE_PAGINATION, withTableSorters } from '../../../utils/tableSort'

interface PlayerRow {
  player_id: string
  display_currency: string
  wallet_mode: 'Seamless' | 'Transfer'
  available_balance: number
  locked_balance: number
  today_bet: number
  today_ggr: number
  limit_group: string
  risk_status: 'normal' | 'locked' | 'risk'
  last_bet_at: string
}

const keyword = ref('')
const currency = ref<string | null>(null)
const walletMode = ref<string | null>(null)

const players: PlayerRow[] = [
  { player_id: 'P-TWD-10001', display_currency: 'TWD', wallet_mode: 'Seamless', available_balance: 128800, locked_balance: 1200, today_bet: 44200, today_ggr: 3180, limit_group: 'Slot VIP 2000-5000', risk_status: 'normal', last_bet_at: '2026/7/8 13:42:10' },
  { player_id: 'P-PHP-10018', display_currency: 'PHP', wallet_mode: 'Transfer', available_balance: 84200, locked_balance: 0, today_bet: 27300, today_ggr: -920, limit_group: 'Slot 一般會員', risk_status: 'normal', last_bet_at: '2026/7/8 13:16:44' },
  { player_id: 'P-IDR-10022', display_currency: 'IDR', wallet_mode: 'Seamless', available_balance: 9360000, locked_balance: 300000, today_bet: 1810000, today_ggr: 224000, limit_group: 'Slot VIP 5000-10000', risk_status: 'risk', last_bet_at: '2026/7/8 12:58:03' },
  { player_id: 'P-VND-10037', display_currency: 'VND', wallet_mode: 'Transfer', available_balance: 4280000, locked_balance: 0, today_bet: 0, today_ggr: 0, limit_group: 'Fishing 一般會員', risk_status: 'locked', last_bet_at: '2026/7/7 23:12:11' },
  { player_id: 'P-THB-10045', display_currency: 'THB', wallet_mode: 'Seamless', available_balance: 21900, locked_balance: 500, today_bet: 12800, today_ggr: 1460, limit_group: '百家樂一般會員', risk_status: 'normal', last_bet_at: '2026/7/8 11:08:55' }
]

const filteredPlayers = computed(() => players.filter((player) => {
  const hitKeyword = !keyword.value || `${player.player_id} ${player.limit_group}`.toLowerCase().includes(keyword.value.toLowerCase())
  const hitCurrency = !currency.value || player.display_currency === currency.value
  const hitWallet = !walletMode.value || player.wallet_mode === walletMode.value
  return hitKeyword && hitCurrency && hitWallet
}))

const columns: DataTableColumns<PlayerRow> = [
  { title: '商戶會員 ID', key: 'player_id', width: 145, render: row => h('span', { class: 'font-mono text-cyan-300' }, row.player_id) },
  { title: '顯示幣別', key: 'display_currency', width: 100 },
  {
    title: '錢包模式',
    key: 'wallet_mode',
    width: 115,
    render: row => h(NTag, { size: 'small', bordered: false, type: row.wallet_mode === 'Transfer' ? 'warning' : 'info' }, { default: () => row.wallet_mode })
  },
  { title: '可用餘額', key: 'available_balance', align: 'right', render: row => `${row.display_currency} ${row.available_balance.toLocaleString()}` },
  { title: '鎖定餘額', key: 'locked_balance', align: 'right', render: row => `${row.display_currency} ${row.locked_balance.toLocaleString()}` },
  { title: '今日投注', key: 'today_bet', align: 'right', render: row => `${row.display_currency} ${row.today_bet.toLocaleString()}` },
  { title: '今日輸贏', key: 'today_ggr', align: 'right', render: row => h('span', { class: row.today_ggr >= 0 ? 'text-emerald-400' : 'text-red-400' }, `${row.display_currency} ${row.today_ggr.toLocaleString()}`) },
  { title: '單槍限額群組', key: 'limit_group', minWidth: 160, ellipsis: { tooltip: true } },
  {
    title: '風控',
    key: 'risk_status',
    width: 100,
    render: row => {
      const typeMap = { normal: 'success', locked: 'error', risk: 'warning' } as const
      const labelMap = { normal: '正常', locked: '鎖定', risk: '觀察' }
      return h(NTag, { type: typeMap[row.risk_status], size: 'small', bordered: false }, { default: () => labelMap[row.risk_status] })
    }
  },
  { title: '最後投注時間', key: 'last_bet_at', width: 170 },
  {
    title: '操作',
    key: 'actions',
    width: 210,
    fixed: 'right',
    render: () => h('div', { class: 'flex flex-wrap gap-2' }, [
      h(NButton, { size: 'small', secondary: true }, { default: () => '投注' }),
      h(NButton, { size: 'small', secondary: true }, { default: () => '流水' }),
      h(NButton, { size: 'small', secondary: true }, { default: () => '限額' })
    ])
  }
]
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-white">會員列表</h1>
      <p class="mt-2 text-sm text-gray-500">商戶查看自身會員、多幣別錢包、投注概況、風控與單槍限額群組。</p>
    </header>

    <n-grid cols="1 m:2 l:4" :x-gap="16" :y-gap="16" responsive="screen">
      <n-grid-item><n-card><n-statistic label="會員總數" :value="12846" /></n-card></n-grid-item>
      <n-grid-item><n-card><n-statistic label="今日活躍" :value="842" /></n-card></n-grid-item>
      <n-grid-item><n-card><n-statistic label="風控標記" :value="12" /></n-card></n-grid-item>
      <n-grid-item><n-card><n-statistic label="支援幣別" value="5" /></n-card></n-grid-item>
    </n-grid>

    <n-card>
      <div class="mb-4 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_160px_160px_auto]">
        <n-input v-model:value="keyword" clearable placeholder="搜尋會員 ID / 單槍群組" />
        <n-select v-model:value="currency" clearable placeholder="顯示幣別" :options="['TWD', 'PHP', 'IDR', 'VND', 'THB'].map(value => ({ label: value, value }))" />
        <n-select v-model:value="walletMode" clearable placeholder="Wallet 模式" :options="['Seamless', 'Transfer'].map(value => ({ label: value, value }))" />
        <n-button tertiary @click="keyword = ''; currency = null; walletMode = null">重置</n-button>
      </div>
      <n-data-table :columns="withTableSorters(columns)" :data="filteredPlayers" :pagination="DEFAULT_TABLE_PAGINATION" :scroll-x="1450" striped />
    </n-card>
  </div>
</template>
