<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue'
import {
  NAlert,
  NButton,
  NCard,
  NDataTable,
  NGrid,
  NGridItem,
  NInput,
  NSelect,
  NStatistic,
  NTag
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import MerchantCreateDrawer from '../../../components/Merchant/MerchantCreateDrawer.vue'
import { portalMerchantService } from '../../../services/portal/merchants'
import type { AgentMerchantRow } from '../../../services/portal/merchants'
import type { Merchant } from '../../../types/merchant'

const keyword = ref('')
const status = ref<string | null>(null)
const showCreate = ref(false)
const loading = ref(false)
const rows = ref<AgentMerchantRow[]>([])

const filteredRows = computed(() => rows.value)
const totalBetUsdt = computed(() => rows.value.reduce((sum, row) => sum + row.today_bet_usdt, 0))
const totalGgrUsdt = computed(() => rows.value.reduce((sum, row) => sum + row.today_ggr_usdt, 0))
const activeMerchantCount = computed(() => rows.value.filter(row => row.status === 'active').length)

const loadMerchants = async () => {
  loading.value = true
  try {
    rows.value = await portalMerchantService.listMerchants({
      keyword: keyword.value,
      status: status.value
    })
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  showCreate.value = true
}

const merchantToAgentRow = (merchant: Merchant): AgentMerchantRow => {
  const firstQuoteRate = merchant.merchant_quote_rates?.[0]?.merchant_quote_rate ?? 0

  return {
    merchant_id: merchant.display_id,
    merchant_name: merchant.merchant_name || merchant.name || '-',
    agent_path: merchant.agent_path || merchant.agent_name || '平台直營代理',
    status: merchant.status === 'active' ? 'active' : merchant.status === 'disabled' ? 'disabled' : 'maintenance',
    wallet_mode: (merchant.wallet_mode || merchant.walletMode) === 'transfer' ? 'Transfer' : 'Seamless',
    currencies: merchant.display_currencies || [merchant.default_display_currency || merchant.currency_type || 'TWD'],
    settlement_currency: 'USDT',
    merchant_rate: Number((firstQuoteRate * 100).toFixed(2)),
    today_bet_usdt: merchant.settlement_today_bet || 0,
    today_ggr_usdt: merchant.settlement_today_ggr || 0
  }
}

const handleMerchantCreated = (merchant: Merchant) => {
  rows.value.unshift(merchantToAgentRow(merchant))
}

watch([keyword, status], () => {
  loadMerchants()
})

onMounted(() => {
  loadMerchants()
})

const columns: DataTableColumns<AgentMerchantRow> = [
  { title: '商戶代碼', key: 'merchant_id', sorter: 'default', render: (row) => h('span', { class: 'font-mono text-cyan-300' }, row.merchant_id) },
  { title: '商戶名稱', key: 'merchant_name', sorter: 'default' },
  { title: '代理路徑', key: 'agent_path', sorter: 'default', ellipsis: { tooltip: true } },
  {
    title: '狀態',
    key: 'status',
    width: 100,
    sorter: 'default',
    render: (row) => {
      const typeMap = { active: 'success', disabled: 'error', maintenance: 'warning' } as const
      const labelMap = { active: '啟用', disabled: '停用', maintenance: '維護' }
      return h(NTag, { type: typeMap[row.status], size: 'small', bordered: false }, { default: () => labelMap[row.status] })
    }
  },
  { title: '錢包模式', key: 'wallet_mode', width: 120, sorter: 'default' },
  {
    title: '顯示幣別',
    key: 'currencies',
    render: (row) => h('div', { class: 'flex gap-1' }, row.currencies.map(item => h(NTag, { size: 'small', bordered: false }, { default: () => item })))
  },
  { title: '商戶費率', key: 'merchant_rate', align: 'right', sorter: (a, b) => a.merchant_rate - b.merchant_rate, render: (row) => `${row.merchant_rate}%` },
  { title: '今日投注', key: 'today_bet_usdt', align: 'right', sorter: (a, b) => a.today_bet_usdt - b.today_bet_usdt, render: (row) => `USDT ${row.today_bet_usdt.toLocaleString()}` },
  { title: '今日 GGR', key: 'today_ggr_usdt', align: 'right', sorter: (a, b) => a.today_ggr_usdt - b.today_ggr_usdt, render: (row) => h('span', { class: row.today_ggr_usdt >= 0 ? 'text-emerald-400' : 'text-red-400' }, `USDT ${row.today_ggr_usdt.toLocaleString()}`) },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    render: () => h('div', { class: 'flex gap-2' }, [
      h(NButton, { size: 'small', secondary: true }, { default: () => '查看' }),
      h(NButton, { size: 'small', secondary: true }, { default: () => '費率' }),
      h(NButton, { size: 'small', secondary: true }, { default: () => '帳務' })
    ])
  }
]
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-white">商戶管理</h1>
        <p class="mt-2 text-sm text-gray-500">代理可下開商戶；商戶只能掛在本代理或下級代理樹內，費率由代理對商戶報價。</p>
      </div>
      <n-button type="primary" @click="openCreate">新增商戶</n-button>
    </header>

    <n-alert type="info" :show-icon="false" class="!bg-[#14283a]">
      代理建立商戶時，系統會帶入本代理費率作為成本基準；商戶報價可依供應商覆寫，未覆寫則套用統一結算服務費率。
    </n-alert>

    <n-grid :cols="4" :x-gap="16" :y-gap="16" responsive="screen">
      <n-grid-item><n-card><n-statistic label="商戶數" :value="rows.length" /></n-card></n-grid-item>
      <n-grid-item><n-card><n-statistic label="啟用商戶" :value="activeMerchantCount" /></n-card></n-grid-item>
      <n-grid-item><n-card><n-statistic label="今日投注" :value="`USDT ${totalBetUsdt.toLocaleString()}`" /></n-card></n-grid-item>
      <n-grid-item><n-card><n-statistic label="今日 GGR" :value="`USDT ${totalGgrUsdt.toLocaleString()}`" /></n-card></n-grid-item>
    </n-grid>

    <n-card>
      <div class="mb-4 flex flex-wrap gap-3">
        <n-input v-model:value="keyword" clearable placeholder="搜尋商戶代碼 / 名稱 / 代理路徑" class="max-w-[420px]" />
        <n-select
          v-model:value="status"
          clearable
          placeholder="狀態"
          class="max-w-[180px]"
          :options="[
            { label: '啟用', value: 'active' },
            { label: '停用', value: 'disabled' },
            { label: '維護', value: 'maintenance' }
          ]"
        />
      </div>
      <n-data-table :loading="loading" :columns="columns" :data="filteredRows" :pagination="{ pageSize: 10 }" striped />
    </n-card>

    <merchant-create-drawer
      v-model:show="showCreate"
      mode="agent"
      @created="handleMerchantCreated"
    />
  </div>
</template>
