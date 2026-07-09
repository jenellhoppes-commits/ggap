<script setup lang="ts">
import { h } from 'vue'
import { NCard, NDataTable, NGrid, NGridItem, NStatistic, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface SettlementRow {
  subject_type: '下級代理' | '商戶'
  subject_name: string
  period: string
  settlement_ggr: number
  agent_rate: number
  receivable: number
  status: 'open' | 'confirmed' | 'paid'
}

const rows: SettlementRow[] = [
  { subject_type: '下級代理', subject_name: 'SEA L2 Agency', period: '2026-07', settlement_ggr: 42100, agent_rate: 7.8, receivable: 3283.8, status: 'open' },
  { subject_type: '下級代理', subject_name: 'VN L3 Agency', period: '2026-07', settlement_ggr: 18300, agent_rate: 8.4, receivable: 1537.2, status: 'confirmed' },
  { subject_type: '商戶', subject_name: 'Blue Whale Interactive', period: '2026-07', settlement_ggr: 27600, agent_rate: 8.5, receivable: 2346, status: 'open' },
  { subject_type: '商戶', subject_name: 'HyperWin Network', period: '2026-07', settlement_ggr: 39200, agent_rate: 9.2, receivable: 3606.4, status: 'paid' }
]

const columns: DataTableColumns<SettlementRow> = [
  { title: '結算對象', key: 'subject_type', width: 120, sorter: 'default' },
  { title: '名稱', key: 'subject_name', sorter: 'default' },
  { title: '帳期', key: 'period', width: 110, sorter: 'default' },
  { title: '結算 GGR', key: 'settlement_ggr', align: 'right', sorter: (a, b) => a.settlement_ggr - b.settlement_ggr, render: (row) => `USDT ${row.settlement_ggr.toLocaleString()}` },
  { title: '費率', key: 'agent_rate', align: 'right', sorter: (a, b) => a.agent_rate - b.agent_rate, render: (row) => `${row.agent_rate}%` },
  { title: '應收', key: 'receivable', align: 'right', sorter: (a, b) => a.receivable - b.receivable, render: (row) => h('span', { class: 'text-emerald-400' }, `USDT ${row.receivable.toLocaleString()}`) },
  {
    title: '狀態',
    key: 'status',
    width: 110,
    sorter: 'default',
    render: (row) => {
      const typeMap = { open: 'warning', confirmed: 'info', paid: 'success' } as const
      const labelMap = { open: '可開帳', confirmed: '已確認', paid: '已收款' }
      return h(NTag, { type: typeMap[row.status], size: 'small', bordered: false }, { default: () => labelMap[row.status] })
    }
  }
]
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-white">代理帳務</h1>
      <p class="mt-2 text-sm text-gray-500">代理查看平台應收、下級代理結算與商戶結算。平台正式只對代理收款。</p>
    </header>

    <n-grid :cols="4" :x-gap="16" :y-gap="16" responsive="screen">
      <n-grid-item><n-card><n-statistic label="平台對本代理應收" value="USDT 71.4K" /></n-card></n-grid-item>
      <n-grid-item><n-card><n-statistic label="下級代理應收" value="USDT 4.8K" /></n-card></n-grid-item>
      <n-grid-item><n-card><n-statistic label="商戶應收" value="USDT 5.9K" /></n-card></n-grid-item>
      <n-grid-item><n-card><n-statistic label="未收金額" value="USDT 10.7K" /></n-card></n-grid-item>
    </n-grid>

    <n-card title="結算明細">
      <n-data-table :columns="columns" :data="rows" :pagination="{ pageSize: 10 }" striped />
    </n-card>
  </div>
</template>
