<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { NAlert, NButton, NCard, NDataTable, NInput, NSelect, NTag, NTooltip, useMessage } from 'naive-ui'
import type { DataTableColumns, DataTableRowKey } from 'naive-ui'
import StatusSwitch from '../../../components/Common/StatusSwitch.vue'
import { portalGameService } from '../../../services/portal/games'
import type { PortalGame } from '../../../services/portal/games'
import { DEFAULT_TABLE_PAGINATION, withTableSorters } from '../../../utils/tableSort'

interface MerchantGame extends PortalGame {
  limit_group?: string
  supported_currencies?: string[]
  maintenance_rule?: string
}

const message = useMessage()
const loading = ref(false)
const games = ref<MerchantGame[]>([])
const searchValue = ref('')
const typeFilter = ref('all')
const providerFilter = ref('all')
const checkedRowKeys = ref<DataTableRowKey[]>([])
const switchStates = ref<Record<string, boolean>>({})

const limitGroupPool = ['Slot 一般會員', 'Slot VIP 2000-5000', 'Slot VIP 5000-10000', '百家樂一般會員', 'Fishing 一般會員']
const currencyPool = [['TWD', 'PHP'], ['IDR', 'VND'], ['THB'], ['PHP', 'VND']]
const maintenancePool = ['無固定維護', '每週二 03:00-04:00', '每月 1 日 02:00-05:00']

const typeOptions = [
  { label: '所有類型', value: 'all' },
  { label: 'Slot', value: 'Slot' },
  { label: 'Live', value: 'Live' },
  { label: 'Fishing', value: 'Fishing' }
]

const providerOptions = computed(() => {
  const providers = Array.from(new Set(games.value.map(g => g.provider)))
  return [
    { label: '全部供應商', value: 'all' },
    ...providers.map(p => ({ label: p, value: p }))
  ]
})

const fetchGames = async () => {
  loading.value = true
  try {
    const data = await portalGameService.listGames()
    games.value = (data.list || []).map((game, index) => ({
      ...game,
      limit_group: limitGroupPool[index % limitGroupPool.length],
      supported_currencies: currencyPool[index % currencyPool.length],
      maintenance_rule: game.admin_status === 'maintenance' ? '平台臨時維護' : maintenancePool[index % maintenancePool.length]
    }))
    games.value.forEach(g => {
      switchStates.value[g.game_id] = g.merchant_enabled
    })
  } catch {
    message.error('遊戲資料載入失敗')
  } finally {
    loading.value = false
  }
}

const handleToggle = async (row: MerchantGame, newVal: boolean) => {
  if (newVal && !row.master_enabled) {
    message.warning('平台已停用的遊戲無法由商戶啟用')
    return
  }

  switchStates.value[row.game_id] = newVal
  row.merchant_enabled = newVal

  try {
    await portalGameService.toggleGame(row.game_id, newVal)
    message.success(newVal ? '遊戲已啟用' : '遊戲已停用')
  } catch {
    switchStates.value[row.game_id] = !newVal
    row.merchant_enabled = !newVal
    message.error('遊戲狀態更新失敗')
  }
}

const handleBatchAction = async (enable: boolean) => {
  const selectedIds = checkedRowKeys.value as string[]
  if (selectedIds.length === 0) return

  loading.value = true
  try {
    selectedIds.forEach(id => {
      const game = games.value.find(g => g.game_id === id)
      if (!game || (enable && !game.master_enabled)) return
      game.merchant_enabled = enable
      switchStates.value[id] = enable
    })

    await new Promise(resolve => setTimeout(resolve, 500))
    message.success('批次更新完成')
    checkedRowKeys.value = []
  } catch {
    message.error('批次更新失敗')
    await fetchGames()
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchValue.value = ''
  typeFilter.value = 'all'
  providerFilter.value = 'all'
}

const filteredGames = computed(() => games.value.filter(g => {
  const matchesSearch = !searchValue.value ||
    g.name_en.toLowerCase().includes(searchValue.value.toLowerCase()) ||
    g.game_code.toLowerCase().includes(searchValue.value.toLowerCase()) ||
    g.limit_group?.toLowerCase().includes(searchValue.value.toLowerCase())
  const matchesType = typeFilter.value === 'all' || g.type === typeFilter.value
  const matchesProvider = providerFilter.value === 'all' || g.provider === providerFilter.value
  return matchesSearch && matchesType && matchesProvider
}))

const columns: DataTableColumns<MerchantGame> = [
  { type: 'selection' },
  {
    title: '遊戲',
    key: 'name_en',
    width: 250,
    render: row => h('div', { class: 'flex items-center gap-3' }, [
      h('img', {
        src: row.thumbnail || 'https://placehold.co/60x60?text=Game',
        class: 'h-10 w-10 rounded object-cover bg-gray-800',
        onError: (event: Event) => {
          ;(event.target as HTMLImageElement).src = 'https://placehold.co/60x60?text=Game'
        }
      }),
      h('div', {}, [
        h('div', { class: 'font-medium text-sm' }, row.name_zh || row.name_en),
        h('div', { class: 'text-xs text-gray-400 font-mono' }, row.game_code)
      ])
    ])
  },
  { title: '供應商', key: 'provider', width: 120, render: row => h(NTag, { size: 'small', bordered: false }, { default: () => row.provider }) },
  { title: '類型', key: 'type', width: 100 },
  { title: 'RTP', key: 'rtp', width: 80, align: 'right', render: row => `${row.rtp}%` },
  {
    title: '支援幣別',
    key: 'supported_currencies',
    width: 150,
    render: row => h('div', { class: 'flex flex-wrap gap-1' }, (row.supported_currencies || []).map(currency => h(NTag, { size: 'small', bordered: false }, { default: () => currency })))
  },
  { title: '單槍群組', key: 'limit_group', minWidth: 160, ellipsis: { tooltip: true } },
  { title: '維護狀態', key: 'maintenance_rule', minWidth: 170, ellipsis: { tooltip: true } },
  {
    title: '平台狀態',
    key: 'admin_status',
    width: 120,
    render: row => {
      const type = row.admin_status === 'active' ? 'success' : row.admin_status === 'maintenance' ? 'warning' : 'error'
      const label = row.admin_status === 'active' ? '可用' : row.admin_status === 'maintenance' ? '維護中' : '平台停用'
      return h(NTag, { type, size: 'small', bordered: false }, { default: () => label })
    }
  },
  {
    title: '我的狀態',
    key: 'merchant_enabled',
    width: 130,
    render: row => {
      const switchComp = h(StatusSwitch, {
        value: switchStates.value[row.game_id] ?? row.merchant_enabled,
        disabled: !row.master_enabled,
        'onUpdate:value': (val: boolean) => {
          if (row.master_enabled) switchStates.value[row.game_id] = val
        },
        onConfirm: (val: boolean) => handleToggle(row, val)
      }, {
        checked: () => '已啟用',
        unchecked: () => '已停用'
      })

      if (!row.master_enabled) {
        return h(NTooltip, null, {
          trigger: () => h('div', { class: 'inline-block cursor-not-allowed opacity-60' }, [switchComp]),
          default: () => '平台已停用的遊戲無法由商戶啟用'
        })
      }

      return switchComp
    }
  },
  { title: '操作', key: 'actions', width: 150, fixed: 'right', render: () => h('div', { class: 'flex gap-2' }, [
    h(NButton, { size: 'small', secondary: true }, { default: () => '限額' }),
    h(NButton, { size: 'small', secondary: true }, { default: () => '維護' })
  ]) }
]

onMounted(fetchGames)
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-white">我的遊戲</h1>
      <p class="mt-2 text-sm text-gray-500">商戶查看已授權遊戲、支援幣別、單槍群組與維護狀態；平台停用遊戲不可自行啟用。</p>
    </header>

    <n-alert type="info" :bordered="false" class="!bg-[#14283a]">
      單槍群組由 GGAP 或上級代理開放給商戶，商戶可查看目前套用範圍與維護時間。
    </n-alert>

    <n-card>
      <div class="mb-4 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_160px_180px_auto]">
        <n-input v-model:value="searchValue" clearable placeholder="搜尋遊戲名稱 / 代碼 / 單槍群組" />
        <n-select v-model:value="typeFilter" :options="typeOptions" placeholder="遊戲類型" />
        <n-select v-model:value="providerFilter" :options="providerOptions" placeholder="供應商" />
        <n-button tertiary @click="handleReset">重置</n-button>
      </div>

      <div v-if="checkedRowKeys.length > 0" class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded border border-gray-700 bg-gray-800 p-3">
        <span class="text-sm text-gray-200">已選擇 {{ checkedRowKeys.length }} 款遊戲</span>
        <div class="flex gap-2">
          <n-button size="small" type="error" ghost @click="handleBatchAction(false)">停用所選</n-button>
          <n-button size="small" type="primary" @click="handleBatchAction(true)">啟用所選</n-button>
        </div>
      </div>

      <n-data-table
        v-model:checked-row-keys="checkedRowKeys"
        :columns="withTableSorters(columns)"
        :data="filteredGames"
        :loading="loading"
        :pagination="DEFAULT_TABLE_PAGINATION"
        :row-key="row => row.game_id"
        :scroll-x="1540"
        striped
      />
    </n-card>
  </div>
</template>
