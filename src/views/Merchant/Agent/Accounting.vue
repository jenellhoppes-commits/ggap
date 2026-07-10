<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { NAlert, NCard, NDataTable, NGrid, NGridItem, NStatistic, NTabPane, NTabs, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { withTableSorters } from '../../../utils/tableSort'

interface SettlementRow {
  subject_type: '下級代理' | '商戶'
  subject_id: string
  subject_name: string
  level?: 'L2' | 'L3'
  period: string
  display_currency: string
  settlement_currency: 'USDT'
  settlement_ggr: number
  rate: number
  receivable: number
  status: 'open' | 'confirmed' | 'paid'
}

interface PlatformPayableRow {
  bill_id: string
  period: string
  settlement_ggr: number
  ggap_rate: number
  payable: number
  paid_amount: number
  status: 'pending' | 'confirmed' | 'partially_paid' | 'paid'
}

const activeTab = ref('summary')

const platformRows: PlatformPayableRow[] = [
  { bill_id: 'AGB-202607-001', period: '2026-07', settlement_ggr: 932400, ggap_rate: 7.66, payable: 71400, paid_amount: 0, status: 'confirmed' },
  { bill_id: 'AGB-202606-001', period: '2026-06', settlement_ggr: 812100, ggap_rate: 7.4, payable: 60000, paid_amount: 60000, status: 'paid' }
]

const rows: SettlementRow[] = [
  { subject_type: '下級代理', subject_id: 'AGT-SEA-L2', subject_name: 'SEA L2 Agency', level: 'L2', period: '2026-07', display_currency: 'TWD', settlement_currency: 'USDT', settlement_ggr: 42100, rate: 7.8, receivable: 3283.8, status: 'open' },
  { subject_type: '下級代理', subject_id: 'AGT-VN-L3', subject_name: 'VN L3 Agency', level: 'L3', period: '2026-07', display_currency: 'VND', settlement_currency: 'USDT', settlement_ggr: 18300, rate: 8.4, receivable: 1537.2, status: 'confirmed' },
  { subject_type: '商戶', subject_id: 'OP-1001', subject_name: 'Blue Whale Interactive', period: '2026-07', display_currency: 'TWD', settlement_currency: 'USDT', settlement_ggr: 27600, rate: 8.5, receivable: 2346, status: 'open' },
  { subject_type: '商戶', subject_id: 'OP-1002', subject_name: 'HyperWin Network', period: '2026-07', display_currency: 'IDR', settlement_currency: 'USDT', settlement_ggr: 39200, rate: 9.2, receivable: 3606.4, status: 'paid' }
]

const childRows = computed(() => rows.filter(row => row.subject_type === '下級代理'))
const merchantRows = computed(() => rows.filter(row => row.subject_type === '商戶'))
const agentPayable = computed(() => platformRows.filter(row => row.status !== 'paid').reduce((sum, row) => sum + row.payable - row.paid_amount, 0))
const childReceivable = computed(() => childRows.value.reduce((sum, row) => sum + row.receivable, 0))
const merchantReceivable = computed(() => merchantRows.value.reduce((sum, row) => sum + row.receivable, 0))
const totalReceivable = computed(() => childReceivable.value + merchantReceivable.value)

const statusLabel = {
  open: '可開帳',
  confirmed: '已確認',
  paid: '已收款',
  pending: '待確認',
  partially_paid: '部分付款'
}

const statusType = {
  open: 'warning',
  confirmed: 'info',
  paid: 'success',
  pending: 'warning',
  partially_paid: 'warning'
} as const

const settlementColumns: DataTableColumns<SettlementRow> = [
  { title: '結算對象', key: 'subject_type', width: 110, render: row => h(NTag, { type: row.subject_type === '商戶' ? 'success' : 'info', size: 'small', bordered: false }, { default: () => row.subject_type }) },
  { title: '代碼', key: 'subject_id', width: 135, render: row => h('span', { class: 'font-mono text-cyan-300' }, row.subject_id) },
  { title: '名稱', key: 'subject_name', minWidth: 180 },
  { title: '層級', key: 'level', width: 80, render: row => row.level || '-' },
  { title: '帳期', key: 'period', width: 105 },
  { title: '顯示幣別', key: 'display_currency', width: 100 },
  { title: '結算幣別', key: 'settlement_currency', width: 100, render: row => h(NTag, { type: 'success', size: 'small', bordered: false }, { default: () => row.settlement_currency }) },
  { title: '結算 GGR', key: 'settlement_ggr', width: 130, align: 'right', render: row => `USDT ${row.settlement_ggr.toLocaleString()}` },
  { title: '費率', key: 'rate', width: 90, align: 'right', render: row => `${row.rate}%` },
  { title: '應收', key: 'receivable', width: 125, align: 'right', render: row => h('span', { class: 'text-emerald-400' }, `USDT ${row.receivable.toLocaleString()}`) },
  { title: '狀態', key: 'status', width: 105, render: row => h(NTag, { type: statusType[row.status], size: 'small', bordered: false }, { default: () => statusLabel[row.status] }) }
]

const platformColumns: DataTableColumns<PlatformPayableRow> = [
  { title: '帳單編號', key: 'bill_id', width: 150, render: row => h('span', { class: 'font-mono text-cyan-300' }, row.bill_id) },
  { title: '帳期', key: 'period', width: 105 },
  { title: '結算 GGR', key: 'settlement_ggr', align: 'right', render: row => `USDT ${row.settlement_ggr.toLocaleString()}` },
  { title: 'GGAP 費率', key: 'ggap_rate', width: 110, align: 'right', render: row => `${row.ggap_rate}%` },
  { title: '應付 GGAP', key: 'payable', align: 'right', render: row => h('span', { class: 'text-amber-300' }, `USDT ${row.payable.toLocaleString()}`) },
  { title: '已付款', key: 'paid_amount', align: 'right', render: row => `USDT ${row.paid_amount.toLocaleString()}` },
  { title: '未付', key: 'unpaid', align: 'right', render: row => `USDT ${(row.payable - row.paid_amount).toLocaleString()}` },
  { title: '狀態', key: 'status', width: 120, render: row => h(NTag, { type: statusType[row.status], size: 'small', bordered: false }, { default: () => statusLabel[row.status] }) }
]
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-white">代理帳務</h1>
      <p class="mt-2 text-sm text-gray-500">
        代理查看對 GGAP 的平台應付、下級代理結算與商戶結算；供應商結算不在代理帳務內處理。
      </p>
    </header>

    <n-alert type="info" :show-icon="false" class="!bg-[#14283a]">
      平台正式只對代理收款；代理再依下級代理與商戶報價自行收款。此頁保留下級代理結算與商戶結算，方便後續代理報表直接使用。
    </n-alert>

    <n-grid cols="1 m:2 l:4" :x-gap="16" :y-gap="16" responsive="screen">
      <n-grid-item><n-card><n-statistic label="應付 GGAP" :value="`USDT ${agentPayable.toLocaleString()}`" /></n-card></n-grid-item>
      <n-grid-item><n-card><n-statistic label="下級代理應收" :value="`USDT ${childReceivable.toLocaleString()}`" /></n-card></n-grid-item>
      <n-grid-item><n-card><n-statistic label="商戶應收" :value="`USDT ${merchantReceivable.toLocaleString()}`" /></n-card></n-grid-item>
      <n-grid-item><n-card><n-statistic label="可收總額" :value="`USDT ${totalReceivable.toLocaleString()}`" /></n-card></n-grid-item>
    </n-grid>

    <n-card>
      <n-tabs v-model:value="activeTab" type="line" animated>
        <n-tab-pane name="summary" tab="總覽">
          <div class="grid gap-4 md:grid-cols-3">
            <n-card size="small" title="平台應付">
              <p class="text-sm text-gray-400">本代理需支付 GGAP 的正式帳單金額，以 USDT 結算。</p>
              <p class="mt-3 text-xl font-bold text-amber-300">USDT {{ agentPayable.toLocaleString() }}</p>
            </n-card>
            <n-card size="small" title="下級代理結算">
              <p class="text-sm text-gray-400">下級代理應付給本代理的結算來源。</p>
              <p class="mt-3 text-xl font-bold text-emerald-400">USDT {{ childReceivable.toLocaleString() }}</p>
            </n-card>
            <n-card size="small" title="商戶結算">
              <p class="text-sm text-gray-400">直屬或代理樹商戶應付給代理的參考應收。</p>
              <p class="mt-3 text-xl font-bold text-emerald-400">USDT {{ merchantReceivable.toLocaleString() }}</p>
            </n-card>
          </div>
        </n-tab-pane>

        <n-tab-pane name="platform" tab="平台應付">
          <n-data-table :columns="withTableSorters(platformColumns)" :data="platformRows" :scroll-x="980" :pagination="{ pageSize: 10 }" striped />
        </n-tab-pane>

        <n-tab-pane name="children" tab="下級代理結算">
          <n-data-table :columns="withTableSorters(settlementColumns)" :data="childRows" :scroll-x="1280" :pagination="{ pageSize: 10 }" striped />
        </n-tab-pane>

        <n-tab-pane name="merchants" tab="商戶結算">
          <n-data-table :columns="withTableSorters(settlementColumns)" :data="merchantRows" :scroll-x="1280" :pagination="{ pageSize: 10 }" striped />
        </n-tab-pane>

        <n-tab-pane name="records" tab="操作紀錄">
          <div class="space-y-3 text-sm text-gray-400">
            <p><span class="text-emerald-400">●</span> 2026/7/7 09:00 產生代理日結來源</p>
            <p><span class="text-emerald-400">●</span> 2026/7/7 09:20 建立平台應付帳單</p>
            <p><span class="text-emerald-400">●</span> 2026/7/7 09:40 更新下級代理與商戶結算摘要</p>
          </div>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>
