<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { NButton, NCard, NDataTable, NGrid, NGridItem, NInput, NSelect, NStatistic, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface PlayerRow {
  player_id: string
  display_currency: string
  wallet_mode: 'Seamless' | 'Transfer'
  balance: number
  today_bet: number
  today_ggr: number
  last_bet_at: string
  status: 'active' | 'locked' | 'risk'
}

const keyword = ref('')
const currency = ref<string | null>(null)

const players: PlayerRow[] = [
  { player_id: 'P-TWD-10001', display_currency: 'TWD', wallet_mode: 'Seamless', balance: 128800, today_bet: 44200, today_ggr: 3180, last_bet_at: '2026/7/8 13:42:10', status: 'active' },
  { player_id: 'P-PHP-10018', display_currency: 'PHP', wallet_mode: 'Transfer', balance: 84200, today_bet: 27300, today_ggr: -920, last_bet_at: '2026/7/8 13:16:44', status: 'active' },
  { player_id: 'P-IDR-10022', display_currency: 'IDR', wallet_mode: 'Seamless', balance: 9360000, today_bet: 1810000, today_ggr: 224000, last_bet_at: '2026/7/8 12:58:03', status: 'risk' },
  { player_id: 'P-VND-10037', display_currency: 'VND', wallet_mode: 'Transfer', balance: 4280000, today_bet: 0, today_ggr: 0, last_bet_at: '2026/7/7 23:12:11', status: 'locked' },
  { player_id: 'P-THB-10045', display_currency: 'THB', wallet_mode: 'Seamless', balance: 21900, today_bet: 12800, today_ggr: 1460, last_bet_at: '2026/7/8 11:08:55', status: 'active' }
]

const filteredPlayers = computed(() => players.filter((player) => {
  const hitKeyword = !keyword.value || player.player_id.toLowerCase().includes(keyword.value.toLowerCase())
  const hitCurrency = !currency.value || player.display_currency === currency.value
  return hitKeyword && hitCurrency
}))

const columns: DataTableColumns<PlayerRow> = [
  {
    title: '會員 ID',
    key: 'player_id',
    sorter: 'default',
    render: (row) => h('span', { class: 'font-mono text-cyan-300' }, row.player_id)
  },
  { title: '顯示幣別', key: 'display_currency', width: 110, sorter: 'default' },
  {
    title: '錢包模式',
    key: 'wallet_mode',
    width: 120,
    sorter: 'default',
    render: (row) => h(NTag, { size: 'small', bordered: false, type: row.wallet_mode === 'Transfer' ? 'warning' : 'info' }, { default: () => row.wallet_mode })
  },
  {
    title: '餘額 / 額度',
    key: 'balance',
    align: 'right',
    sorter: (a, b) => a.balance - b.balance,
    render: (row) => `${row.display_currency} ${row.balance.toLocaleString()}`
  },
  {
    title: '今日投注',
    key: 'today_bet',
    align: 'right',
    sorter: (a, b) => a.today_bet - b.today_bet,
    render: (row) => `${row.display_currency} ${row.today_bet.toLocaleString()}`
  },
  {
    title: '今日輸贏',
    key: 'today_ggr',
    align: 'right',
    sorter: (a, b) => a.today_ggr - b.today_ggr,
    render: (row) => h('span', { class: row.today_ggr >= 0 ? 'text-emerald-400' : 'text-red-400' }, `${row.display_currency} ${row.today_ggr.toLocaleString()}`)
  },
  { title: '最後投注時間', key: 'last_bet_at', width: 170, sorter: 'default' },
  {
    title: '狀態',
    key: 'status',
    width: 100,
    sorter: 'default',
    render: (row) => {
      const typeMap = { active: 'success', locked: 'error', risk: 'warning' } as const
      const labelMap = { active: '正常', locked: '鎖定', risk: '風控' }
      return h(NTag, { type: typeMap[row.status], size: 'small', bordered: false }, { default: () => labelMap[row.status] })
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: () => h('div', { class: 'flex gap-2' }, [
      h(NButton, { size: 'small', secondary: true }, { default: () => '投注' }),
      h(NButton, { size: 'small', secondary: true }, { default: () => '流水' })
    ])
  }
]
</script>

<template>
  <div class="space-y-6">
    <header class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">會員管理</h1>
        <p class="mt-2 text-sm text-gray-500">商戶查看自身會員、幣別錢包、投注概況與最近投注時間。</p>
      </div>
    </header>

    <n-grid :cols="4" :x-gap="16" :y-gap="16" responsive="screen">
      <n-grid-item>
        <n-card><n-statistic label="會員總數" :value="12846" /></n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card><n-statistic label="今日活躍" :value="842" /></n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card><n-statistic label="風控標記" :value="12" /></n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card><n-statistic label="支援幣別" value="5" /></n-card>
      </n-grid-item>
    </n-grid>

    <n-card>
      <div class="mb-4 flex flex-wrap gap-3">
        <n-input v-model:value="keyword" clearable placeholder="搜尋會員 ID" class="max-w-[360px]" />
        <n-select
          v-model:value="currency"
          clearable
          placeholder="顯示幣別"
          class="max-w-[180px]"
          :options="['TWD', 'PHP', 'IDR', 'VND', 'THB'].map(value => ({ label: value, value }))"
        />
      </div>
      <n-data-table :columns="columns" :data="filteredPlayers" :pagination="{ pageSize: 10 }" striped />
    </n-card>
  </div>
</template>
