<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { NAlert, NButton, NCard, NDataTable, NGrid, NGridItem, NInput, NSelect, NStatistic, NTag, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { DEFAULT_TABLE_PAGINATION, withTableSorters } from '../../../utils/tableSort'

interface SubAgentRow {
  agent_id: string
  agent_name: string
  level: 'L2' | 'L3'
  parent_agent: string
  child_count: number
  merchant_count: number
  base_rate: number
  provider_override_count: number
  monthly_ggr_usdt: number
  receivable_usdt: number
  status: 'active' | 'disabled' | 'settlement_hold'
}

const message = useMessage()
const keyword = ref('')
const level = ref<string | null>(null)

const rows = ref<SubAgentRow[]>([
  { agent_id: 'AGT-SEA-L2', agent_name: 'SEA L2 Agency', level: 'L2', parent_agent: 'SEA Master Agent', child_count: 2, merchant_count: 18, base_rate: 7.8, provider_override_count: 4, monthly_ggr_usdt: 42100, receivable_usdt: 3283.8, status: 'active' },
  { agent_id: 'AGT-VN-L3', agent_name: 'VN L3 Agency', level: 'L3', parent_agent: 'SEA L2 Agency', child_count: 0, merchant_count: 7, base_rate: 8.4, provider_override_count: 2, monthly_ggr_usdt: 18300, receivable_usdt: 1537.2, status: 'active' },
  { agent_id: 'AGT-PH-L2', agent_name: 'PH Channel', level: 'L2', parent_agent: 'SEA Master Agent', child_count: 1, merchant_count: 5, base_rate: 8.1, provider_override_count: 3, monthly_ggr_usdt: -260, receivable_usdt: 0, status: 'settlement_hold' },
  { agent_id: 'AGT-ID-L3', agent_name: 'ID Local Desk', level: 'L3', parent_agent: 'PH Channel', child_count: 0, merchant_count: 3, base_rate: 8.9, provider_override_count: 1, monthly_ggr_usdt: 9600, receivable_usdt: 854.4, status: 'disabled' }
])

const filteredRows = computed(() => rows.value.filter((row) => {
  const text = `${row.agent_id} ${row.agent_name} ${row.parent_agent}`.toLowerCase()
  return (!keyword.value || text.includes(keyword.value.toLowerCase())) && (!level.value || row.level === level.value)
}))

const totalReceivable = computed(() => filteredRows.value.reduce((sum, row) => sum + row.receivable_usdt, 0))
const l2Count = computed(() => rows.value.filter(row => row.level === 'L2').length)
const l3Count = computed(() => rows.value.filter(row => row.level === 'L3').length)
const merchantCount = computed(() => rows.value.reduce((sum, row) => sum + row.merchant_count, 0))

const handleCreate = () => {
  message.info('演示：L1 可新增 L2，L2 可新增 L3，L3 不可再新增下級代理。')
}

const columns: DataTableColumns<SubAgentRow> = [
  { title: '代理代碼', key: 'agent_id', width: 140, render: row => h('span', { class: 'font-mono text-cyan-300' }, row.agent_id) },
  { title: '代理名稱', key: 'agent_name', minWidth: 160 },
  { title: '層級', key: 'level', width: 80, render: row => h(NTag, { type: row.level === 'L2' ? 'info' : 'warning', size: 'small', bordered: false }, { default: () => row.level }) },
  { title: '上級代理', key: 'parent_agent', minWidth: 150 },
  { title: '下級代理', key: 'child_count', width: 100, align: 'right' },
  { title: '商戶數', key: 'merchant_count', width: 90, align: 'right' },
  { title: '基準費率', key: 'base_rate', width: 110, align: 'right', render: row => `${row.base_rate}%` },
  { title: '供應商覆寫', key: 'provider_override_count', width: 120, align: 'right', render: row => `${row.provider_override_count} 組` },
  { title: '本月 GGR', key: 'monthly_ggr_usdt', width: 130, align: 'right', render: row => h('span', { class: row.monthly_ggr_usdt >= 0 ? 'text-emerald-400' : 'text-red-400' }, `USDT ${row.monthly_ggr_usdt.toLocaleString()}`) },
  { title: '應收', key: 'receivable_usdt', width: 120, align: 'right', render: row => `USDT ${row.receivable_usdt.toLocaleString()}` },
  {
    title: '狀態',
    key: 'status',
    width: 110,
    render: row => {
      const typeMap = { active: 'success', disabled: 'error', settlement_hold: 'warning' } as const
      const labelMap = { active: '啟用', disabled: '停用', settlement_hold: '結算觀察' }
      return h(NTag, { type: typeMap[row.status], size: 'small', bordered: false }, { default: () => labelMap[row.status] })
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 210,
    fixed: 'right',
    render: row => h('div', { class: 'flex flex-wrap gap-2' }, [
      h(NButton, { size: 'small', secondary: true }, { default: () => '查看' }),
      h(NButton, { size: 'small', secondary: true }, { default: () => '費率' }),
      h(NButton, { size: 'small', secondary: true, disabled: row.level === 'L3' }, { default: () => '新增下級' })
    ])
  }
]
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-white">下級代理</h1>
        <p class="mt-2 text-sm text-gray-500">代理最多三級；L1 可開 L2，L2 可開 L3，L3 不可再開下級代理。</p>
      </div>
      <n-button type="primary" @click="handleCreate">新增下級代理</n-button>
    </header>

    <n-alert type="warning" :show-icon="false" class="!bg-[#3a2b14]">
      費率可依供應商覆寫；未指定供應商費率時，套用該代理的統一結算服務費率。下級代理與商戶只用於代理帳務，不會影響供應商結算。
    </n-alert>

    <n-grid cols="1 m:2 l:4" :x-gap="16" :y-gap="16" responsive="screen">
      <n-grid-item><n-card><n-statistic label="L2 / L3" :value="`${l2Count} / ${l3Count}`" /></n-card></n-grid-item>
      <n-grid-item><n-card><n-statistic label="關聯商戶" :value="merchantCount" /></n-card></n-grid-item>
      <n-grid-item><n-card><n-statistic label="下級應收" :value="`USDT ${totalReceivable.toLocaleString()}`" /></n-card></n-grid-item>
      <n-grid-item><n-card><n-statistic label="結算幣別" value="USDT" /></n-card></n-grid-item>
    </n-grid>

    <n-card>
      <div class="mb-4 grid gap-3 md:grid-cols-[minmax(260px,1fr)_180px_auto]">
        <n-input v-model:value="keyword" clearable placeholder="搜尋代理代碼 / 名稱 / 上級代理" />
        <n-select v-model:value="level" clearable placeholder="代理層級" :options="[{ label: 'L2', value: 'L2' }, { label: 'L3', value: 'L3' }]" />
        <n-button tertiary @click="keyword = ''; level = null">重置</n-button>
      </div>
      <n-data-table :columns="withTableSorters(columns)" :data="filteredRows" :pagination="DEFAULT_TABLE_PAGINATION" :scroll-x="1480" striped />
    </n-card>
  </div>
</template>
