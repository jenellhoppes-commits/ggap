<script setup lang="ts">
import { computed, h } from 'vue'
import { useRoute } from 'vue-router'
import { NAlert, NButton, NCard, NDataTable, NGrid, NGridItem, NStatistic, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { withTableSorters } from '../../../utils/tableSort'

interface AgentInvoiceRow {
  invoice_id: string
  period: string
  settlement_currency: 'USDT'
  settlement_ggr: number
  ggap_receivable: number
  paid_amount: number
  unpaid_amount: number
  status: 'pending' | 'confirmed' | 'partial' | 'paid'
}

interface MerchantAccountingRow {
  period: string
  display_currency: string
  display_ggr: number
  settlement_currency: 'USDT'
  settlement_ggr: number
  merchant_rate: number
  payable_to_agent: number
  status: 'open' | 'confirmed' | 'paid'
}

const route = useRoute()
const isAgentPortal = computed(() => route.path.startsWith('/agent'))

const agentRows: AgentInvoiceRow[] = [
  { invoice_id: 'AGB-202607-001', period: '2026-07', settlement_currency: 'USDT', settlement_ggr: 932400, ggap_receivable: 71400, paid_amount: 0, unpaid_amount: 71400, status: 'confirmed' },
  { invoice_id: 'AGB-202606-001', period: '2026-06', settlement_currency: 'USDT', settlement_ggr: 812100, ggap_receivable: 60000, paid_amount: 30000, unpaid_amount: 30000, status: 'partial' },
  { invoice_id: 'AGB-202605-001', period: '2026-05', settlement_currency: 'USDT', settlement_ggr: 774000, ggap_receivable: 57000, paid_amount: 57000, unpaid_amount: 0, status: 'paid' }
]

const merchantRows: MerchantAccountingRow[] = [
  { period: '2026-07-08', display_currency: 'TWD', display_ggr: 318000, settlement_currency: 'USDT', settlement_ggr: 9820, merchant_rate: 8.5, payable_to_agent: 834.7, status: 'open' },
  { period: '2026-07-08', display_currency: 'PHP', display_ggr: 142000, settlement_currency: 'USDT', settlement_ggr: 2420, merchant_rate: 8.5, payable_to_agent: 205.7, status: 'confirmed' },
  { period: '2026-07-07', display_currency: 'IDR', display_ggr: -2200000, settlement_currency: 'USDT', settlement_ggr: -134.2, merchant_rate: 8.5, payable_to_agent: 0, status: 'paid' }
]

const statusLabel = {
  pending: '待確認',
  confirmed: '已確認',
  partial: '部分收款',
  paid: '已收款',
  open: '可開帳'
}

const statusType = {
  pending: 'warning',
  confirmed: 'info',
  partial: 'warning',
  paid: 'success',
  open: 'warning'
} as const

const agentUnpaid = computed(() => agentRows.reduce((sum, row) => sum + row.unpaid_amount, 0))
const agentReceivable = computed(() => agentRows.reduce((sum, row) => sum + row.ggap_receivable, 0))
const merchantPayable = computed(() => merchantRows.reduce((sum, row) => sum + row.payable_to_agent, 0))
const merchantSettlementGgr = computed(() => merchantRows.reduce((sum, row) => sum + row.settlement_ggr, 0))

const agentColumns: DataTableColumns<AgentInvoiceRow> = [
  { title: '帳單編號', key: 'invoice_id', width: 150, render: row => h('span', { class: 'font-mono text-cyan-300' }, row.invoice_id) },
  { title: '帳期', key: 'period', width: 110 },
  { title: '結算幣別', key: 'settlement_currency', width: 100, render: row => h(NTag, { type: 'success', size: 'small', bordered: false }, { default: () => row.settlement_currency }) },
  { title: '結算 GGR', key: 'settlement_ggr', align: 'right', render: row => `USDT ${row.settlement_ggr.toLocaleString()}` },
  { title: 'GGAP 應收', key: 'ggap_receivable', align: 'right', render: row => h('span', { class: 'text-amber-300' }, `USDT ${row.ggap_receivable.toLocaleString()}`) },
  { title: '已收金額', key: 'paid_amount', align: 'right', render: row => `USDT ${row.paid_amount.toLocaleString()}` },
  { title: '未收金額', key: 'unpaid_amount', align: 'right', render: row => h('span', { class: row.unpaid_amount > 0 ? 'text-red-300' : 'text-emerald-400' }, `USDT ${row.unpaid_amount.toLocaleString()}`) },
  { title: '狀態', key: 'status', width: 110, render: row => h(NTag, { type: statusType[row.status], size: 'small', bordered: false }, { default: () => statusLabel[row.status] }) },
  { title: '操作', key: 'actions', width: 140, render: () => h(NButton, { size: 'small', secondary: true }, { default: () => '查看詳情' }) }
]

const merchantColumns: DataTableColumns<MerchantAccountingRow> = [
  { title: '帳期', key: 'period', width: 120 },
  { title: '顯示幣別', key: 'display_currency', width: 100 },
  { title: '顯示 GGR', key: 'display_ggr', align: 'right', render: row => `${row.display_currency} ${row.display_ggr.toLocaleString()}` },
  { title: '結算幣別', key: 'settlement_currency', width: 100, render: row => h(NTag, { type: 'success', size: 'small', bordered: false }, { default: () => row.settlement_currency }) },
  { title: 'USDT 結算 GGR', key: 'settlement_ggr', align: 'right', render: row => h('span', { class: row.settlement_ggr >= 0 ? 'text-emerald-400' : 'text-red-400' }, `USDT ${row.settlement_ggr.toLocaleString()}`) },
  { title: '商戶費率', key: 'merchant_rate', width: 100, align: 'right', render: row => `${row.merchant_rate}%` },
  { title: '對代理應付參考', key: 'payable_to_agent', align: 'right', render: row => h('span', { class: 'text-amber-300' }, `USDT ${row.payable_to_agent.toLocaleString()}`) },
  { title: '狀態', key: 'status', width: 110, render: row => h(NTag, { type: statusType[row.status], size: 'small', bordered: false }, { default: () => statusLabel[row.status] }) }
]
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-white">{{ isAgentPortal ? '平台帳單' : '錢包與帳務參考' }}</h1>
      <p class="mt-2 text-sm text-gray-500">
        <template v-if="isAgentPortal">代理查看 GGAP 對自己的正式應收帳單與收款狀態，正式結算幣別為 USDT。</template>
        <template v-else>商戶查看自身錢包模式、交易日結與對代理應付參考；商戶不是 GGAP 正式開帳對象。</template>
      </p>
    </header>

    <n-alert v-if="!isAgentPortal" type="warning" :show-icon="false" class="!bg-[#3a2b14]">
      商戶端金額僅作營運與對代理帳務參考；GGAP 正式收款對象為代理，商戶正式帳單由代理自行對商戶處理。
    </n-alert>
    <n-alert v-else type="info" :show-icon="false" class="!bg-[#14283a]">
      供應商帳單不會出現在代理端；供應商結算由 GGAP 平台自行處理。
    </n-alert>

    <template v-if="isAgentPortal">
      <n-grid cols="1 m:2 l:4" :x-gap="16" :y-gap="16" responsive="screen">
        <n-grid-item><n-card><n-statistic label="帳單總額" :value="`USDT ${agentReceivable.toLocaleString()}`" /></n-card></n-grid-item>
        <n-grid-item><n-card><n-statistic label="未收金額" :value="`USDT ${agentUnpaid.toLocaleString()}`" /></n-card></n-grid-item>
        <n-grid-item><n-card><n-statistic label="正式幣別" value="USDT" /></n-card></n-grid-item>
        <n-grid-item><n-card><n-statistic label="帳單數" :value="agentRows.length" /></n-card></n-grid-item>
      </n-grid>

      <n-card title="平台帳單">
        <n-data-table :columns="withTableSorters(agentColumns)" :data="agentRows" :pagination="{ pageSize: 10 }" :scroll-x="1180" striped />
      </n-card>
    </template>

    <template v-else>
      <n-grid cols="1 m:2 l:4" :x-gap="16" :y-gap="16" responsive="screen">
        <n-grid-item><n-card><n-statistic label="錢包模式" value="Seamless / Transfer" /></n-card></n-grid-item>
        <n-grid-item><n-card><n-statistic label="USDT 結算 GGR" :value="`USDT ${merchantSettlementGgr.toLocaleString()}`" /></n-card></n-grid-item>
        <n-grid-item><n-card><n-statistic label="對代理應付參考" :value="`USDT ${merchantPayable.toLocaleString()}`" /></n-card></n-grid-item>
        <n-grid-item><n-card><n-statistic label="正式開帳對象" value="代理" /></n-card></n-grid-item>
      </n-grid>

      <n-card title="交易日結摘要">
        <n-data-table :columns="withTableSorters(merchantColumns)" :data="merchantRows" :pagination="{ pageSize: 10 }" :scroll-x="1080" striped />
      </n-card>
    </template>
  </div>
</template>
