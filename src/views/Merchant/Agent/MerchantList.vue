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
  NTag,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import MerchantCreateDrawer from '../../../components/Merchant/MerchantCreateDrawer.vue'
import { portalMerchantService } from '../../../services/portal/merchants'
import type { AgentMerchantRow } from '../../../services/portal/merchants'
import type { Merchant } from '../../../types/merchant'
import { withTableSorters } from '../../../utils/tableSort'

const message = useMessage()

const keyword = ref('')
const status = ref<string | null>(null)
const showCreate = ref(false)
const loading = ref(false)
const rows = ref<AgentMerchantRow[]>([])

const filteredRows = computed(() => rows.value)
const totalBetUsdt = computed(() => rows.value.reduce((sum, row) => sum + row.today_bet_usdt, 0))
const totalGgrUsdt = computed(() => rows.value.reduce((sum, row) => sum + row.today_ggr_usdt, 0))
const totalReceivableUsdt = computed(() => rows.value.reduce((sum, row) => sum + row.receivable_usdt, 0))
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
    provider_override_count: merchant.merchant_quote_rates?.length || 0,
    limit_group: 'Slot 一般會員',
    today_bet_usdt: merchant.settlement_today_bet || 0,
    today_ggr_usdt: merchant.settlement_today_ggr || 0,
    receivable_usdt: Math.max(merchant.settlement_today_ggr || 0, 0) * firstQuoteRate
  }
}

const handleMerchantCreated = (merchant: Merchant) => {
  rows.value.unshift(merchantToAgentRow(merchant))
  message.success('商戶已建立，費率與遊戲限額可於列表操作中調整。')
}

watch([keyword, status], () => {
  loadMerchants()
})

onMounted(() => {
  loadMerchants()
})

const statusOptions = [
  { label: '啟用', value: 'active' },
  { label: '停用', value: 'disabled' },
  { label: '維護', value: 'maintenance' }
]

const columns: DataTableColumns<AgentMerchantRow> = [
  { title: '商戶代碼', key: 'merchant_id', width: 130, render: (row) => h('span', { class: 'font-mono text-cyan-300' }, row.merchant_id) },
  { title: '商戶名稱', key: 'merchant_name', minWidth: 180 },
  { title: '代理路徑', key: 'agent_path', minWidth: 190, ellipsis: { tooltip: true } },
  {
    title: '狀態',
    key: 'status',
    width: 95,
    render: (row) => {
      const typeMap = { active: 'success', disabled: 'error', maintenance: 'warning' } as const
      const labelMap = { active: '啟用', disabled: '停用', maintenance: '維護' }
      return h(NTag, { type: typeMap[row.status], size: 'small', bordered: false }, { default: () => labelMap[row.status] })
    }
  },
  { title: '錢包模式', key: 'wallet_mode', width: 110 },
  {
    title: '顯示幣別',
    key: 'currencies',
    minWidth: 150,
    render: (row) => h('div', { class: 'flex flex-wrap gap-1' }, row.currencies.map(item => h(NTag, { size: 'small', bordered: false }, { default: () => item })))
  },
  { title: '結算幣別', key: 'settlement_currency', width: 100, render: (row) => h(NTag, { type: 'success', size: 'small', bordered: false }, { default: () => row.settlement_currency }) },
  { title: '商戶費率', key: 'merchant_rate', width: 105, align: 'right', render: (row) => `${row.merchant_rate}%` },
  { title: '供應商覆寫', key: 'provider_override_count', width: 115, align: 'right', render: (row) => `${row.provider_override_count} 組` },
  { title: '單槍群組', key: 'limit_group', minWidth: 150, ellipsis: { tooltip: true } },
  { title: '今日投注', key: 'today_bet_usdt', width: 130, align: 'right', render: (row) => `USDT ${row.today_bet_usdt.toLocaleString()}` },
  { title: '今日 GGR', key: 'today_ggr_usdt', width: 120, align: 'right', render: (row) => h('span', { class: row.today_ggr_usdt >= 0 ? 'text-emerald-400' : 'text-red-400' }, `USDT ${row.today_ggr_usdt.toLocaleString()}`) },
  { title: '商戶應收', key: 'receivable_usdt', width: 125, align: 'right', render: (row) => h('span', { class: 'text-emerald-400' }, `USDT ${row.receivable_usdt.toLocaleString()}`) },
  {
    title: '操作',
    key: 'actions',
    width: 230,
    fixed: 'right',
    render: () => h('div', { class: 'flex flex-wrap gap-2' }, [
      h(NButton, { size: 'small', secondary: true }, { default: () => '查看' }),
      h(NButton, { size: 'small', secondary: true }, { default: () => '費率' }),
      h(NButton, { size: 'small', secondary: true }, { default: () => '限額' }),
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
        <p class="mt-2 text-sm text-gray-500">
          代理可下開商戶；商戶只能掛在本代理或下級代理樹內，費率由代理對商戶報價。
        </p>
      </div>
      <n-button type="primary" @click="showCreate = true">新增商戶</n-button>
    </header>

    <n-alert type="info" :show-icon="false" class="!bg-[#14283a]">
      建立商戶時系統會帶入本代理成本費率作為基準；商戶報價可依供應商覆寫，未覆寫則套用統一結算服務費率。
    </n-alert>

    <n-grid :cols="1" :x-gap="16" :y-gap="16" responsive="screen" item-responsive>
      <n-grid-item span="1 m:2 l:1"><n-card><n-statistic label="商戶總數" :value="rows.length" /></n-card></n-grid-item>
      <n-grid-item span="1 m:2 l:1"><n-card><n-statistic label="啟用商戶" :value="activeMerchantCount" /></n-card></n-grid-item>
      <n-grid-item span="1 m:2 l:1"><n-card><n-statistic label="今日投注" :value="`USDT ${totalBetUsdt.toLocaleString()}`" /></n-card></n-grid-item>
      <n-grid-item span="1 m:2 l:1"><n-card><n-statistic label="今日 GGR" :value="`USDT ${totalGgrUsdt.toLocaleString()}`" /></n-card></n-grid-item>
      <n-grid-item span="1 m:2 l:1"><n-card><n-statistic label="商戶應收" :value="`USDT ${totalReceivableUsdt.toLocaleString()}`" /></n-card></n-grid-item>
    </n-grid>

    <n-card>
      <div class="mb-4 grid gap-3 md:grid-cols-[minmax(260px,1fr)_180px_auto]">
        <n-input v-model:value="keyword" clearable placeholder="搜尋商戶代碼 / 名稱 / 代理路徑 / 單槍群組" />
        <n-select v-model:value="status" clearable placeholder="狀態" :options="statusOptions" />
        <n-button tertiary @click="keyword = ''; status = null">重置</n-button>
      </div>
      <n-data-table
        :loading="loading"
        :columns="withTableSorters(columns)"
        :data="filteredRows"
        :pagination="{ pageSize: 10 }"
        :scroll-x="1760"
        striped
      />
    </n-card>

    <merchant-create-drawer
      v-model:show="showCreate"
      mode="agent"
      @created="handleMerchantCreated"
    />
  </div>
</template>
