<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { NCard, NDataTable, NInput, NSelect, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface LedgerRow {
  tx_id: string
  player_id: string
  type: 'Bet' | 'Win' | 'Refund' | 'Transfer'
  display_currency: string
  display_amount: number
  settlement_amount: number
  wallet_mode: 'Seamless' | 'Transfer'
  provider_tx_id: string
  status: 'success' | 'pending' | 'failed'
  created_at: string
}

const keyword = ref('')
const txType = ref<string | null>(null)

const rows: LedgerRow[] = [
  { tx_id: 'TX-20260708-0001', player_id: 'P-TWD-10001', type: 'Bet', display_currency: 'TWD', display_amount: 1200, settlement_amount: 37.21, wallet_mode: 'Seamless', provider_tx_id: 'PG-TX-99801', status: 'success', created_at: '2026/7/8 13:41:10' },
  { tx_id: 'TX-20260708-0002', player_id: 'P-TWD-10001', type: 'Win', display_currency: 'TWD', display_amount: 860, settlement_amount: 26.67, wallet_mode: 'Seamless', provider_tx_id: 'PG-TX-99802', status: 'success', created_at: '2026/7/8 13:41:35' },
  { tx_id: 'TX-20260708-0003', player_id: 'P-PHP-10018', type: 'Transfer', display_currency: 'PHP', display_amount: 5000, settlement_amount: 85.41, wallet_mode: 'Transfer', provider_tx_id: 'GGAP-LEDGER-7781', status: 'pending', created_at: '2026/7/8 13:12:02' },
  { tx_id: 'TX-20260708-0004', player_id: 'P-IDR-10022', type: 'Refund', display_currency: 'IDR', display_amount: 300000, settlement_amount: 18.24, wallet_mode: 'Seamless', provider_tx_id: 'JL-TX-19381', status: 'failed', created_at: '2026/7/8 12:55:47' }
]

const filteredRows = computed(() => rows.filter((row) => {
  const text = `${row.tx_id} ${row.player_id} ${row.provider_tx_id}`.toLowerCase()
  return (!keyword.value || text.includes(keyword.value.toLowerCase())) && (!txType.value || row.type === txType.value)
}))

const columns: DataTableColumns<LedgerRow> = [
  { title: '交易 ID', key: 'tx_id', sorter: 'default', render: (row) => h('span', { class: 'font-mono text-cyan-300' }, row.tx_id) },
  { title: '會員 ID', key: 'player_id', sorter: 'default', render: (row) => h('span', { class: 'font-mono' }, row.player_id) },
  {
    title: '類型',
    key: 'type',
    width: 110,
    sorter: 'default',
    render: (row) => h(NTag, { size: 'small', bordered: false, type: row.type === 'Win' ? 'success' : row.type === 'Refund' ? 'warning' : 'info' }, { default: () => row.type })
  },
  { title: '顯示幣別金額', key: 'display_amount', align: 'right', sorter: (a, b) => a.display_amount - b.display_amount, render: (row) => `${row.display_currency} ${row.display_amount.toLocaleString()}` },
  { title: 'USDT 結算金額', key: 'settlement_amount', align: 'right', sorter: (a, b) => a.settlement_amount - b.settlement_amount, render: (row) => `USDT ${row.settlement_amount.toLocaleString()}` },
  { title: 'Wallet 模式', key: 'wallet_mode', width: 130, sorter: 'default' },
  { title: 'Provider Tx ID', key: 'provider_tx_id', sorter: 'default', render: (row) => h('span', { class: 'font-mono text-xs' }, row.provider_tx_id) },
  {
    title: '狀態',
    key: 'status',
    width: 100,
    sorter: 'default',
    render: (row) => {
      const typeMap = { success: 'success', pending: 'warning', failed: 'error' } as const
      const labelMap = { success: '成功', pending: '處理中', failed: '失敗' }
      return h(NTag, { type: typeMap[row.status], size: 'small', bordered: false }, { default: () => labelMap[row.status] })
    }
  },
  { title: '時間', key: 'created_at', width: 170, sorter: 'default' }
]
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-white">交易流水</h1>
      <p class="mt-2 text-sm text-gray-500">商戶查看會員 Bet / Win / Refund / Transfer 與 USDT 結算快照。</p>
    </header>

    <n-card>
      <div class="mb-4 flex flex-wrap gap-3">
        <n-input v-model:value="keyword" clearable placeholder="搜尋交易 ID / 會員 / Provider Tx ID" class="max-w-[420px]" />
        <n-select
          v-model:value="txType"
          clearable
          placeholder="交易類型"
          class="max-w-[180px]"
          :options="['Bet', 'Win', 'Refund', 'Transfer'].map(value => ({ label: value, value }))"
        />
      </div>
      <n-data-table :columns="columns" :data="filteredRows" :pagination="{ pageSize: 10 }" striped />
    </n-card>
  </div>
</template>
