<script setup lang="ts">
import { h } from 'vue'
import { NCard, NDataTable, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface Row {
  agent_id: string
  agent_name: string
  level: 'L2' | 'L3'
  merchant_count: number
  total_bet: number
  settlement_ggr: number
  receivable: number
  status: 'normal' | 'attention'
}

const rows: Row[] = [
  { agent_id: 'AGT-SEA-L2', agent_name: 'SEA L2 Agency', level: 'L2', merchant_count: 18, total_bet: 98200, settlement_ggr: 6210, receivable: 484.4, status: 'normal' },
  { agent_id: 'AGT-VN-L3', agent_name: 'VN L3 Agency', level: 'L3', merchant_count: 7, total_bet: 38400, settlement_ggr: 1830, receivable: 153.7, status: 'normal' },
  { agent_id: 'AGT-PH-L2', agent_name: 'PH Channel', level: 'L2', merchant_count: 5, total_bet: 22600, settlement_ggr: -260, receivable: 0, status: 'attention' }
]

const columns: DataTableColumns<Row> = [
  { title: '代理 ID', key: 'agent_id', sorter: 'default', render: (row) => h('span', { class: 'font-mono text-cyan-300' }, row.agent_id) },
  { title: '代理名稱', key: 'agent_name', sorter: 'default' },
  { title: '層級', key: 'level', width: 90, sorter: 'default' },
  { title: '商戶數', key: 'merchant_count', width: 100, align: 'right', sorter: (a, b) => a.merchant_count - b.merchant_count },
  { title: '投注額', key: 'total_bet', align: 'right', sorter: (a, b) => a.total_bet - b.total_bet, render: (row) => `USDT ${row.total_bet.toLocaleString()}` },
  { title: '結算 GGR', key: 'settlement_ggr', align: 'right', sorter: (a, b) => a.settlement_ggr - b.settlement_ggr, render: (row) => `USDT ${row.settlement_ggr.toLocaleString()}` },
  { title: '應收', key: 'receivable', align: 'right', sorter: (a, b) => a.receivable - b.receivable, render: (row) => `USDT ${row.receivable.toLocaleString()}` },
  {
    title: '狀態',
    key: 'status',
    width: 110,
    sorter: 'default',
    render: (row) => h(NTag, { type: row.status === 'normal' ? 'success' : 'warning', size: 'small', bordered: false }, { default: () => row.status === 'normal' ? '正常' : '注意' })
  }
]
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-white">下級代理報表</h1>
      <p class="mt-2 text-sm text-gray-500">代理依下級代理查看商戶數、投注、GGR 與應收。</p>
    </header>

    <n-card>
      <n-data-table :columns="columns" :data="rows" :pagination="{ pageSize: 10 }" striped />
    </n-card>
  </div>
</template>
