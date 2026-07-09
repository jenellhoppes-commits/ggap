<script setup lang="ts">
import { computed, h, ref } from 'vue'
import {
  NAlert,
  NButton,
  NDataTable,
  NDescriptions,
  NDescriptionsItem,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSpace,
  NStatistic,
  NTabPane,
  NTabs,
  NTag,
  NTimeline,
  NTimelineItem,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { AddOutlined, ContentCopyOutlined, EditOutlined, SearchOutlined, VisibilityOutlined } from '@vicons/material'
import { withTableSorters } from '../../../utils/tableSort'

type GroupType = 'system' | 'provider' | 'category' | 'merchant' | 'campaign'
type GroupStatus = 'active' | 'disabled' | 'draft'

interface GroupGame {
  game_id: string
  game_name: string
  provider_name: string
  game_type: string
  status: 'active' | 'maintenance'
  sort_order: number
}

interface AppliedMerchant {
  merchant_id: string
  merchant_name: string
  agent_name: string
  status: 'applied' | 'paused'
  applied_at: string
}

interface OperationLog {
  action: string
  operator: string
  operated_at: string
  trace_id: string
}

interface GameGroupRow {
  group_id: string
  group_code: string
  group_name: string
  group_type: GroupType
  status: GroupStatus
  sort_order: number
  provider_count: number
  game_count: number
  applied_merchant_count: number
  default_language: string
  description: string
  updated_at: string
  games: GroupGame[]
  merchants: AppliedMerchant[]
  logs: OperationLog[]
}

const message = useMessage()
const showDetail = ref(false)
const showEditor = ref(false)
const detailTab = ref('basic')
const editorMode = ref<'create' | 'edit'>('create')
const currentRow = ref<GameGroupRow | null>(null)
const keyword = ref('')
const typeFilter = ref<GroupType | null>(null)
const statusFilter = ref<GroupStatus | null>(null)

const blankGroup = (): GameGroupRow => ({
  group_id: `GRP-${Date.now()}`,
  group_code: '',
  group_name: '',
  group_type: 'merchant',
  status: 'draft',
  sort_order: 100,
  provider_count: 0,
  game_count: 0,
  applied_merchant_count: 0,
  default_language: 'zh-TW',
  description: '',
  updated_at: new Date().toISOString(),
  games: [],
  merchants: [],
  logs: []
})

const formValue = ref<GameGroupRow>(blankGroup())

const rows = ref<GameGroupRow[]>([
  {
    group_id: 'GRP-HOT-SLOT',
    group_code: 'HOT_SLOT',
    group_name: '熱門電子',
    group_type: 'category',
    status: 'active',
    sort_order: 10,
    provider_count: 3,
    game_count: 42,
    applied_merchant_count: 18,
    default_language: 'zh-TW',
    description: '跨供應商熱門電子遊戲集合。',
    updated_at: '2026-07-07T09:00:00.000Z',
    games: [
      { game_id: 'PG-001', game_name: 'Mahjong Ways 2', provider_name: 'PG Soft', game_type: 'Slot', status: 'active', sort_order: 1 },
      { game_id: 'PG-002', game_name: 'Lucky Neko', provider_name: 'PG Soft', game_type: 'Slot', status: 'active', sort_order: 2 },
      { game_id: 'PP-001', game_name: 'Sweet Bonanza', provider_name: 'Pragmatic Play', game_type: 'Slot', status: 'active', sort_order: 3 }
    ],
    merchants: [
      { merchant_id: 'OP-1001', merchant_name: 'Blue Whale Interactive', agent_name: '平台直營代理', status: 'applied', applied_at: '2026-07-01T09:00:00.000Z' },
      { merchant_id: 'OP-1006', merchant_name: 'Lucky Panda Studio', agent_name: 'SEA Growth Agent', status: 'applied', applied_at: '2026-07-02T12:00:00.000Z' }
    ],
    logs: [
      { action: '建立分組', operator: 'Content', operated_at: '2026-07-01T09:00:00.000Z', trace_id: 'trace-group-hot-slot-create' },
      { action: '調整遊戲排序', operator: 'Content', operated_at: '2026-07-07T09:00:00.000Z', trace_id: 'trace-group-hot-slot-sort' }
    ]
  },
  {
    group_id: 'GRP-PG-SLOT',
    group_code: 'PG_SLOT',
    group_name: 'PG 精選',
    group_type: 'provider',
    status: 'active',
    sort_order: 20,
    provider_count: 1,
    game_count: 28,
    applied_merchant_count: 12,
    default_language: 'zh-TW',
    description: 'PG Soft 專屬遊戲包。',
    updated_at: '2026-07-07T08:30:00.000Z',
    games: [
      { game_id: 'PG-001', game_name: 'Mahjong Ways 2', provider_name: 'PG Soft', game_type: 'Slot', status: 'active', sort_order: 1 },
      { game_id: 'PG-002', game_name: 'Lucky Neko', provider_name: 'PG Soft', game_type: 'Slot', status: 'active', sort_order: 2 }
    ],
    merchants: [
      { merchant_id: 'OP-1008', merchant_name: 'NovaPlay Entertainment', agent_name: 'L2 Asia Agent', status: 'applied', applied_at: '2026-07-05T13:00:00.000Z' }
    ],
    logs: [
      { action: '同步 Provider 遊戲包', operator: 'System', operated_at: '2026-07-07T08:30:00.000Z', trace_id: 'trace-group-pg-slot-sync' }
    ]
  },
  {
    group_id: 'GRP-LIVE-CASINO',
    group_code: 'LIVE_CASINO',
    group_name: '真人娛樂',
    group_type: 'category',
    status: 'active',
    sort_order: 30,
    provider_count: 1,
    game_count: 16,
    applied_merchant_count: 11,
    default_language: 'zh-TW',
    description: '真人遊戲集合。',
    updated_at: '2026-07-07T07:40:00.000Z',
    games: [
      { game_id: 'EVO-001', game_name: 'Crazy Time', provider_name: 'Evolution', game_type: 'Live', status: 'active', sort_order: 1 }
    ],
    merchants: [
      { merchant_id: 'OP-1008', merchant_name: 'NovaPlay Entertainment', agent_name: 'L2 Asia Agent', status: 'applied', applied_at: '2026-07-05T13:05:00.000Z' }
    ],
    logs: [
      { action: '建立真人分組', operator: 'Content', operated_at: '2026-07-03T10:00:00.000Z', trace_id: 'trace-group-live-create' }
    ]
  },
  {
    group_id: 'GRP-CAMPAIGN-JULY',
    group_code: 'JULY_CAMPAIGN',
    group_name: '七月活動',
    group_type: 'campaign',
    status: 'active',
    sort_order: 5,
    provider_count: 2,
    game_count: 12,
    applied_merchant_count: 6,
    default_language: 'zh-TW',
    description: '活動頁與商戶活動遊戲集合。',
    updated_at: '2026-07-07T09:15:00.000Z',
    games: [
      { game_id: 'PP-001', game_name: 'Sweet Bonanza', provider_name: 'Pragmatic Play', game_type: 'Slot', status: 'active', sort_order: 1 },
      { game_id: 'PG-001', game_name: 'Mahjong Ways 2', provider_name: 'PG Soft', game_type: 'Slot', status: 'active', sort_order: 2 }
    ],
    merchants: [
      { merchant_id: 'OP-1009', merchant_name: 'Golden Dragon Gaming', agent_name: 'L3 Growth Team', status: 'applied', applied_at: '2026-07-07T09:20:00.000Z' }
    ],
    logs: [
      { action: '建立活動分組', operator: 'Marketing', operated_at: '2026-07-07T09:15:00.000Z', trace_id: 'trace-group-july-create' }
    ]
  },
  {
    group_id: 'GRP-JILI',
    group_code: 'JILI_OBSERVE',
    group_name: 'JILI 測試',
    group_type: 'provider',
    status: 'draft',
    sort_order: 90,
    provider_count: 1,
    game_count: 7,
    applied_merchant_count: 0,
    default_language: 'zh-TW',
    description: 'JILI 接入測試用草稿分組。',
    updated_at: '2026-07-07T10:12:00.000Z',
    games: [
      { game_id: 'JILI-001', game_name: 'Boxing King', provider_name: 'JILI Gaming', game_type: 'Slot', status: 'maintenance', sort_order: 1 }
    ],
    merchants: [],
    logs: [
      { action: '建立草稿分組', operator: 'Ops', operated_at: '2026-07-07T10:12:00.000Z', trace_id: 'trace-group-jili-draft' }
    ]
  }
])

const groupTypeMeta: Record<GroupType, { label: string; type: 'success' | 'info' | 'warning' | 'default' }> = {
  system: { label: '系統預設', type: 'default' },
  provider: { label: '供應商分組', type: 'info' },
  category: { label: '類型分組', type: 'success' },
  merchant: { label: '商戶專屬', type: 'warning' },
  campaign: { label: '活動分組', type: 'warning' }
}

const statusMeta: Record<GroupStatus, { label: string; type: 'success' | 'warning' | 'default' }> = {
  active: { label: '啟用', type: 'success' },
  disabled: { label: '停用', type: 'default' },
  draft: { label: '草稿', type: 'warning' }
}

const typeOptions = Object.entries(groupTypeMeta).map(([value, meta]) => ({ label: meta.label, value }))
const statusOptions = Object.entries(statusMeta).map(([value, meta]) => ({ label: meta.label, value }))

const filteredRows = computed(() => {
  const text = keyword.value.trim().toLowerCase()
  return rows.value.filter(row => {
    const matchesText = !text || [row.group_code, row.group_name, row.description]
      .some(value => value.toLowerCase().includes(text))
    const matchesType = !typeFilter.value || row.group_type === typeFilter.value
    const matchesStatus = !statusFilter.value || row.status === statusFilter.value
    return matchesText && matchesType && matchesStatus
  })
})

const summary = computed(() => ({
  total: rows.value.length,
  active: rows.value.filter(row => row.status === 'active').length,
  games: rows.value.reduce((sum, row) => sum + row.game_count, 0),
  merchants: rows.value.reduce((sum, row) => sum + row.applied_merchant_count, 0),
  campaigns: rows.value.filter(row => row.group_type === 'campaign').length
}))

const formatDateTime = (value?: string) => value ? new Date(value).toLocaleString('zh-TW') : '-'

const resetFilters = () => {
  keyword.value = ''
  typeFilter.value = null
  statusFilter.value = null
}

const openDetail = (row: GameGroupRow) => {
  currentRow.value = row
  detailTab.value = 'basic'
  showDetail.value = true
}

const openEditor = (mode: 'create' | 'edit', row?: GameGroupRow) => {
  editorMode.value = mode
  formValue.value = row ? JSON.parse(JSON.stringify(row)) : blankGroup()
  showEditor.value = true
}

const saveGroup = () => {
  if (!formValue.value.group_code || !formValue.value.group_name) {
    message.warning('請填寫分組代碼與分組名稱')
    return
  }

  const next: GameGroupRow = {
    ...formValue.value,
    group_code: formValue.value.group_code.toUpperCase(),
    updated_at: new Date().toISOString()
  }

  if (editorMode.value === 'create') {
    rows.value.unshift({
      ...next,
      group_id: `GRP-${next.group_code}`,
      logs: [
        { action: '建立遊戲分組', operator: 'Content', operated_at: new Date().toISOString(), trace_id: `trace-group-${next.group_code.toLowerCase()}-create` }
      ]
    })
    message.success('分組已建立')
  } else {
    const index = rows.value.findIndex(row => row.group_id === next.group_id)
    if (index >= 0) {
      rows.value[index] = next
      message.success('分組已更新')
    }
  }
  showEditor.value = false
}

const copyGroup = (row: GameGroupRow) => {
  const copy = JSON.parse(JSON.stringify(row)) as GameGroupRow
  copy.group_id = `GRP-${row.group_code}-COPY`
  copy.group_code = `${row.group_code}_COPY`
  copy.group_name = `${row.group_name} 複製`
  copy.status = 'draft'
  copy.updated_at = new Date().toISOString()
  copy.logs = [
    { action: `複製自 ${row.group_name}`, operator: 'Content', operated_at: new Date().toISOString(), trace_id: `trace-group-${row.group_code.toLowerCase()}-copy` }
  ]
  rows.value.unshift(copy)
  message.success('分組已複製')
}

const actionMessage = (label: string, row?: GameGroupRow) => {
  message.info(`${label}${row ? `：${row.group_name}` : ''}，演示操作已保留。`)
}

const columns: DataTableColumns<GameGroupRow> = [
  {
    title: '分組',
    key: 'group_name',
    width: 240,
    fixed: 'left',
    render: row => h('div', {}, [
      h('div', { class: 'font-semibold text-slate-100' }, row.group_name),
      h('div', { class: 'mt-1 font-mono text-xs text-slate-500' }, row.group_code)
    ])
  },
  { title: '類型', key: 'group_type', width: 130, render: row => h(NTag, { type: groupTypeMeta[row.group_type].type, size: 'small', bordered: false }, { default: () => groupTypeMeta[row.group_type].label }) },
  { title: '狀態', key: 'status', width: 100, render: row => h(NTag, { type: statusMeta[row.status].type, size: 'small', bordered: false }, { default: () => statusMeta[row.status].label }) },
  { title: '排序', key: 'sort_order', width: 90, align: 'right' },
  { title: '遊戲數', key: 'game_count', width: 100, align: 'right' },
  { title: '供應商數', key: 'provider_count', width: 110, align: 'right' },
  { title: '套用商戶', key: 'applied_merchant_count', width: 110, align: 'right', render: row => `${row.applied_merchant_count} 家` },
  { title: '預設語系', key: 'default_language', width: 110 },
  { title: '更新時間', key: 'updated_at', width: 175, render: row => formatDateTime(row.updated_at) },
  {
    title: '操作',
    key: 'actions',
    width: 270,
    fixed: 'right',
    render: row => h(NSpace, { size: 'small' }, {
      default: () => [
        h(NButton, { size: 'small', secondary: true, onClick: () => openDetail(row) }, { icon: () => h(NIcon, { component: VisibilityOutlined }), default: () => '查看' }),
        h(NButton, { size: 'small', secondary: true, onClick: () => openEditor('edit', row) }, { icon: () => h(NIcon, { component: EditOutlined }), default: () => '編輯' }),
        h(NButton, { size: 'small', secondary: true, onClick: () => copyGroup(row) }, { icon: () => h(NIcon, { component: ContentCopyOutlined }), default: () => '複製' })
      ]
    })
  }
]

const gameColumns: DataTableColumns<GroupGame> = [
  { title: '排序', key: 'sort_order', width: 80, align: 'right' },
  { title: '遊戲 ID', key: 'game_id', width: 120 },
  { title: '遊戲名稱', key: 'game_name' },
  { title: '供應商', key: 'provider_name', width: 150 },
  { title: '類型', key: 'game_type', width: 90 },
  { title: '狀態', key: 'status', width: 110, render: row => h(NTag, { type: row.status === 'active' ? 'success' : 'warning', size: 'small', bordered: false }, { default: () => row.status === 'active' ? '啟用' : '維護' }) }
]

const merchantColumns: DataTableColumns<AppliedMerchant> = [
  { title: '商戶', key: 'merchant_name', render: row => h('div', {}, [h('div', row.merchant_name), h('div', { class: 'text-xs text-slate-500' }, row.merchant_id)]) },
  { title: '代理', key: 'agent_name' },
  { title: '狀態', key: 'status', width: 110, render: row => h(NTag, { type: row.status === 'applied' ? 'success' : 'warning', size: 'small', bordered: false }, { default: () => row.status === 'applied' ? '已套用' : '暫停' }) },
  { title: '套用時間', key: 'applied_at', width: 175, render: row => formatDateTime(row.applied_at) }
]
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">遊戲分組</h1>
        <p class="mt-1 text-sm text-slate-500">
          建立遊戲包、類型分組、供應商分組、商戶專屬分組與活動分組，供商戶遊戲權限與前台展示套用。
        </p>
      </div>
      <n-button type="primary" @click="openEditor('create')">
        <template #icon><n-icon :component="AddOutlined" /></template>
        新增分組
      </n-button>
    </div>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-5">
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="分組總數" :value="summary.total" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="啟用分組" :value="summary.active" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="分組遊戲數" :value="summary.games" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="套用商戶" :value="summary.merchants" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="活動分組" :value="summary.campaigns" /></div>
    </div>

    <n-alert type="info" :show-icon="false">
      遊戲分組只影響內容展示、商戶遊戲包、排序與活動集合；不改變 Provider API，也不影響交易流水。
    </n-alert>

    <div class="flex flex-wrap items-center gap-3 rounded border border-white/10 bg-[#18181c] p-4">
      <n-input v-model:value="keyword" clearable placeholder="搜尋分組名稱 / 分組代碼 / 描述" style="width: 320px; max-width: 100%;">
        <template #prefix><n-icon :component="SearchOutlined" /></template>
      </n-input>
      <n-select v-model:value="typeFilter" clearable :options="typeOptions" placeholder="分組類型" style="width: 150px;" />
      <n-select v-model:value="statusFilter" clearable :options="statusOptions" placeholder="狀態" style="width: 120px;" />
      <n-button secondary @click="resetFilters">重置</n-button>
    </div>

    <n-data-table
      :columns="withTableSorters(columns)"
      :data="filteredRows"
      :pagination="{ pageSize: 10 }"
      :bordered="false"
      :scroll-x="1360"
      striped
    />

    <n-drawer v-model:show="showDetail" :width="1040">
      <n-drawer-content closable>
        <template #header>
          <div v-if="currentRow" class="flex flex-wrap items-center gap-3">
            <span class="text-lg font-semibold">{{ currentRow.group_name }}</span>
            <n-tag size="small" :bordered="false">{{ currentRow.group_code }}</n-tag>
            <n-tag size="small" :type="groupTypeMeta[currentRow.group_type].type" :bordered="false">{{ groupTypeMeta[currentRow.group_type].label }}</n-tag>
            <n-tag size="small" :type="statusMeta[currentRow.status].type" :bordered="false">{{ statusMeta[currentRow.status].label }}</n-tag>
          </div>
        </template>

        <template v-if="currentRow">
          <div class="mb-5 grid grid-cols-1 gap-3 md:grid-cols-4">
            <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="遊戲數" :value="currentRow.game_count" /></div>
            <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="供應商數" :value="currentRow.provider_count" /></div>
            <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="套用商戶" :value="currentRow.applied_merchant_count" /></div>
            <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="排序" :value="currentRow.sort_order" /></div>
          </div>

          <n-tabs v-model:value="detailTab" type="line" animated>
            <n-tab-pane name="basic" tab="基本資料">
              <n-descriptions bordered :column="2" label-placement="left">
                <n-descriptions-item label="分組代碼">{{ currentRow.group_code }}</n-descriptions-item>
                <n-descriptions-item label="分組名稱">{{ currentRow.group_name }}</n-descriptions-item>
                <n-descriptions-item label="分組類型">{{ groupTypeMeta[currentRow.group_type].label }}</n-descriptions-item>
                <n-descriptions-item label="狀態">{{ statusMeta[currentRow.status].label }}</n-descriptions-item>
                <n-descriptions-item label="排序">{{ currentRow.sort_order }}</n-descriptions-item>
                <n-descriptions-item label="預設語系">{{ currentRow.default_language }}</n-descriptions-item>
                <n-descriptions-item label="描述" :span="2">{{ currentRow.description }}</n-descriptions-item>
              </n-descriptions>
            </n-tab-pane>

            <n-tab-pane name="games" tab="遊戲清單">
              <n-data-table :columns="withTableSorters(gameColumns)" :data="currentRow.games" :pagination="false" />
            </n-tab-pane>

            <n-tab-pane name="merchants" tab="套用商戶">
              <n-data-table :columns="withTableSorters(merchantColumns)" :data="currentRow.merchants" :pagination="false" />
            </n-tab-pane>

            <n-tab-pane name="sorting" tab="排序設定">
              <n-alert type="info" :show-icon="false">
                排序只影響商戶後台與前台展示，不改變 Provider API 或交易流程。
              </n-alert>
              <n-data-table class="mt-4" :columns="withTableSorters(gameColumns)" :data="currentRow.games" :pagination="false" />
            </n-tab-pane>

            <n-tab-pane name="logs" tab="操作紀錄">
              <n-timeline>
                <n-timeline-item v-for="log in currentRow.logs" :key="log.trace_id" type="success" :title="log.action" :time="formatDateTime(log.operated_at)">
                  <div class="text-sm text-slate-500">{{ log.operator }} / {{ log.trace_id }}</div>
                </n-timeline-item>
              </n-timeline>
            </n-tab-pane>
          </n-tabs>
        </template>

        <template #footer>
          <div v-if="currentRow" class="flex flex-wrap justify-end gap-2">
            <n-button secondary @click="openEditor('edit', currentRow)">編輯分組</n-button>
            <n-button secondary @click="actionMessage('匯入遊戲', currentRow)">匯入遊戲</n-button>
            <n-button secondary @click="actionMessage('調整排序', currentRow)">調整排序</n-button>
            <n-button secondary @click="actionMessage('套用商戶', currentRow)">套用商戶</n-button>
            <n-button type="primary" secondary @click="copyGroup(currentRow)">複製分組</n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>

    <n-modal v-model:show="showEditor" preset="card" :title="editorMode === 'create' ? '新增遊戲分組' : '編輯遊戲分組'" class="max-w-[720px]" :bordered="false">
      <n-form label-placement="left" label-width="130">
        <n-form-item label="分組代碼" required><n-input v-model:value="formValue.group_code" :disabled="editorMode === 'edit'" placeholder="例如 HOT_SLOT" /></n-form-item>
        <n-form-item label="分組名稱" required><n-input v-model:value="formValue.group_name" placeholder="例如 熱門電子" /></n-form-item>
        <n-form-item label="分組類型"><n-select v-model:value="formValue.group_type" :options="typeOptions" /></n-form-item>
        <n-form-item label="狀態"><n-select v-model:value="formValue.status" :options="statusOptions" /></n-form-item>
        <n-form-item label="排序"><n-input-number v-model:value="formValue.sort_order" :min="1" :step="1" /></n-form-item>
        <n-form-item label="預設語系"><n-input v-model:value="formValue.default_language" /></n-form-item>
        <n-form-item label="描述"><n-input v-model:value="formValue.description" type="textarea" /></n-form-item>
        <n-alert type="info" :show-icon="false">
          建立分組後可再匯入遊戲、調整排序、套用商戶或設定活動集合。
        </n-alert>
      </n-form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showEditor = false">取消</n-button>
          <n-button type="primary" @click="saveGroup">儲存</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>
