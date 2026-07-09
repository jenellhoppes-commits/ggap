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
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSpace,
  NStatistic,
  NTag,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import MoneyText from '../../../components/Common/MoneyText.vue'
import { withTableSorters } from '../../../utils/tableSort'

type AdjustmentStatus = 'draft' | 'pending' | 'approved' | 'posted' | 'rejected'
type TargetType = 'AGENT' | 'PROVIDER' | 'PLATFORM'

interface AdjustmentRecord {
  adjustment_no: string
  target_type: TargetType
  target_id: string
  target_name: string
  accounting_line: string
  period: string
  settlement_currency: 'USDT'
  amount: number
  reason: string
  source_ref: string
  status: AdjustmentStatus
  created_by: string
  created_at: string
  approved_by?: string
  rejected_by?: string
  rejected_at?: string
  posted_at?: string
  impact_note: string
}

const message = useMessage()
const searchText = ref('')
const statusFilter = ref<AdjustmentStatus | null>(null)
const targetFilter = ref<TargetType | null>(null)
const showDetail = ref(false)
const showCreateModal = ref(false)
const currentRow = ref<AdjustmentRecord | null>(null)

const createForm = ref({
  target_type: 'AGENT' as TargetType,
  target_id: 'AGT-SEA-001',
  target_name: 'SEA Growth Agent',
  period: '2026-07-06',
  amount: 0,
  reason: '',
  source_ref: ''
})

const rows = ref<AdjustmentRecord[]>([
  {
    adjustment_no: 'ADJ-202607-PG-001',
    target_type: 'PROVIDER',
    target_id: 'PROV-PG',
    target_name: 'PG Soft',
    accounting_line: '供應商帳務',
    period: '2026-07-06',
    settlement_currency: 'USDT',
    amount: -120,
    reason: '供應商報表與平台 Provider 交易快照差異',
    source_ref: 'PINV-202607-PG',
    status: 'posted',
    created_by: 'Finance',
    created_at: '2026-07-07T02:15:00.000Z',
    approved_by: 'Finance Manager',
    posted_at: '2026-07-07T02:30:00.000Z',
    impact_note: '只影響供應商應付與平台毛利，不回寫代理帳務。'
  },
  {
    adjustment_no: 'ADJ-202607-AGT-002',
    target_type: 'AGENT',
    target_id: 'AGT-SEA-001',
    target_name: 'SEA Growth Agent',
    accounting_line: '代理帳務',
    period: '2026-07-06',
    settlement_currency: 'USDT',
    amount: 1200,
    reason: '代理月費折抵後補收',
    source_ref: 'AINV-202607-SEA',
    status: 'approved',
    created_by: 'Ops',
    created_at: '2026-07-07T03:10:00.000Z',
    approved_by: 'Finance Manager',
    impact_note: '影響 L1 代理最終應收，不產生商戶正式應收帳。'
  },
  {
    adjustment_no: 'ADJ-202607-FX-003',
    target_type: 'PLATFORM',
    target_id: 'GGAP',
    target_name: 'GGAP Platform',
    accounting_line: '平台毛利',
    period: '2026-07-06',
    settlement_currency: 'USDT',
    amount: -35.5,
    reason: '匯率服務費差額修正',
    source_ref: 'FX-20260706',
    status: 'pending',
    created_by: 'System',
    created_at: '2026-07-07T03:30:00.000Z',
    impact_note: '只影響平台毛利管理報表，不改動代理或供應商帳單。'
  }
])

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '待審核', value: 'pending' },
  { label: '已核准', value: 'approved' },
  { label: '已入帳', value: 'posted' },
  { label: '已拒絕', value: 'rejected' }
]

const targetOptions = [
  { label: '代理', value: 'AGENT' },
  { label: '供應商', value: 'PROVIDER' },
  { label: '平台', value: 'PLATFORM' }
]

const statusMeta: Record<AdjustmentStatus, { label: string; type: 'default' | 'info' | 'success' | 'warning' | 'error' }> = {
  draft: { label: '草稿', type: 'default' },
  pending: { label: '待審核', type: 'warning' },
  approved: { label: '已核准', type: 'info' },
  posted: { label: '已入帳', type: 'success' },
  rejected: { label: '已拒絕', type: 'error' }
}

const targetTypeLabel: Record<TargetType, string> = {
  AGENT: '代理',
  PROVIDER: '供應商',
  PLATFORM: '平台'
}

const accountingLineByTarget: Record<TargetType, AdjustmentRecord['accounting_line']> = {
  AGENT: '代理帳務',
  PROVIDER: '供應商帳務',
  PLATFORM: '平台毛利'
}

const impactNoteByTarget: Record<TargetType, string> = {
  AGENT: '影響 L1 代理最終應收，不產生商戶正式應收帳。',
  PROVIDER: '影響供應商應付與平台毛利，不回寫代理帳務。',
  PLATFORM: '只影響平台毛利管理報表，不改動代理或供應商帳單。'
}

const targetEntityOptions = computed(() => {
  const options: Record<TargetType, Array<{ label: string; value: string; name: string }>> = {
    AGENT: [
      { label: 'SEA Growth Agent / AGT-SEA-001', value: 'AGT-SEA-001', name: 'SEA Growth Agent' },
      { label: '平台直營代理 / AGT-DIRECT', value: 'AGT-DIRECT', name: '平台直營代理' }
    ],
    PROVIDER: [
      { label: 'PG Soft / PROV-PG', value: 'PROV-PG', name: 'PG Soft' },
      { label: 'Evolution / PROV-EVO', value: 'PROV-EVO', name: 'Evolution' },
      { label: 'Pragmatic Play / PROV-PP', value: 'PROV-PP', name: 'Pragmatic Play' }
    ],
    PLATFORM: [
      { label: 'GGAP Platform / GGAP', value: 'GGAP', name: 'GGAP Platform' }
    ]
  }
  return options[createForm.value.target_type]
})

const formatDateTime = (value?: string) => value ? new Date(value).toLocaleString() : '-'

const filteredRows = computed(() => rows.value.filter((row) => {
  const keyword = searchText.value.trim().toLowerCase()
  const inKeyword = !keyword
    || row.adjustment_no.toLowerCase().includes(keyword)
    || row.target_name.toLowerCase().includes(keyword)
    || row.target_id.toLowerCase().includes(keyword)
    || row.reason.toLowerCase().includes(keyword)
  const inStatus = !statusFilter.value || row.status === statusFilter.value
  const inTarget = !targetFilter.value || row.target_type === targetFilter.value
  return inKeyword && inStatus && inTarget
}))

const summary = computed(() => ({
  total: filteredRows.value.length,
  pending: filteredRows.value.filter(row => row.status === 'pending').length,
  postedAmount: filteredRows.value.filter(row => row.status === 'posted').reduce((sum, row) => sum + row.amount, 0),
  approvedAmount: filteredRows.value.filter(row => row.status === 'approved').reduce((sum, row) => sum + row.amount, 0)
}))

const resetFilters = () => {
  searchText.value = ''
  statusFilter.value = null
  targetFilter.value = null
}

const openDetail = (row: AdjustmentRecord) => {
  currentRow.value = row
  showDetail.value = true
}

const syncCreateTarget = () => {
  const first = targetEntityOptions.value[0]
  if (!first) return
  createForm.value.target_id = first.value
  createForm.value.target_name = first.name
}

const selectCreateTarget = (targetId: string) => {
  const found = targetEntityOptions.value.find(option => option.value === targetId)
  if (!found) return
  createForm.value.target_id = found.value
  createForm.value.target_name = found.name
}

const openCreate = () => {
  createForm.value = {
    target_type: 'AGENT',
    target_id: 'AGT-SEA-001',
    target_name: 'SEA Growth Agent',
    period: '2026-07-06',
    amount: 0,
    reason: '',
    source_ref: ''
  }
  showCreateModal.value = true
}

const submitCreate = () => {
  if (!createForm.value.reason.trim()) {
    message.warning('請輸入調帳原因')
    return
  }
  if (!createForm.value.amount) {
    message.warning('請輸入調帳金額')
    return
  }
  const targetType = createForm.value.target_type
  const record: AdjustmentRecord = {
    adjustment_no: `ADJ-${Date.now().toString().slice(-8)}`,
    target_type: targetType,
    target_id: createForm.value.target_id,
    target_name: createForm.value.target_name,
    accounting_line: accountingLineByTarget[targetType],
    period: createForm.value.period,
    settlement_currency: 'USDT',
    amount: Number(createForm.value.amount),
    reason: createForm.value.reason,
    source_ref: createForm.value.source_ref || 'MANUAL',
    status: 'pending',
    created_by: 'Finance',
    created_at: new Date().toISOString(),
    impact_note: impactNoteByTarget[targetType]
  }
  rows.value.unshift(record)
  currentRow.value = record
  showCreateModal.value = false
  showDetail.value = true
  message.success(`${record.adjustment_no} 已建立待審核`)
}

const approveAdjustment = (row: AdjustmentRecord) => {
  if (row.status !== 'pending') return
  row.status = 'approved'
  row.approved_by = 'Finance Manager'
  message.success(`${row.adjustment_no} 已核准`)
}

const rejectAdjustment = (row: AdjustmentRecord) => {
  if (row.status !== 'pending') return
  row.status = 'rejected'
  row.rejected_by = 'Finance Manager'
  row.rejected_at = new Date().toISOString()
  message.success(`${row.adjustment_no} 已拒絕`)
}

const postAdjustment = (row: AdjustmentRecord) => {
  if (row.status !== 'approved') return
  row.status = 'posted'
  row.posted_at = new Date().toISOString()
  message.success(`${row.adjustment_no} 已入帳`)
}

const columns: DataTableColumns<AdjustmentRecord> = [
  {
    title: '調帳單號',
    key: 'adjustment_no',
    width: 180,
    render: row => h('button', { class: 'font-mono text-cyan-500 hover:text-cyan-400', onClick: () => openDetail(row) }, row.adjustment_no)
  },
  {
    title: '調帳對象',
    key: 'target_name',
    width: 220,
    render: row => h('div', { class: 'flex flex-col gap-1' }, [
      h('span', { class: 'font-semibold' }, row.target_name),
      h('span', { class: 'font-mono text-xs text-gray-500' }, `${row.target_type} / ${row.target_id}`)
    ])
  },
  { title: '帳務線', key: 'accounting_line', width: 130 },
  { title: '帳期', key: 'period', width: 120 },
  { title: '金額', key: 'amount', width: 150, align: 'right', render: row => h(MoneyText, { value: row.amount, currency: row.settlement_currency, showSign: true, color: 'text-slate-100' }) },
  { title: '原因', key: 'reason', minWidth: 260 },
  { title: '狀態', key: 'status', width: 110, render: row => h(NTag, { type: statusMeta[row.status].type, bordered: false, size: 'small' }, { default: () => statusMeta[row.status].label }) },
  { title: '建立人', key: 'created_by', width: 110 },
  {
    title: '操作',
    key: 'actions',
    width: 230,
    fixed: 'right',
    render: row => h(NSpace, { size: 6 }, {
      default: () => [
        h(NButton, { size: 'small', secondary: true, onClick: () => openDetail(row) }, { default: () => '查看' }),
        row.status === 'pending' ? h(NButton, { size: 'small', type: 'primary', secondary: true, onClick: () => approveAdjustment(row) }, { default: () => '核准' }) : null,
        row.status === 'pending' ? h(NButton, { size: 'small', type: 'error', secondary: true, onClick: () => rejectAdjustment(row) }, { default: () => '拒絕' }) : null,
        row.status === 'approved' ? h(NButton, { size: 'small', type: 'success', secondary: true, onClick: () => postAdjustment(row) }, { default: () => '入帳' }) : null
      ].filter(Boolean)
    })
  }
]
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">調帳紀錄</h1>
        <p class="mt-1 text-sm text-gray-500">
          管理代理帳務、供應商帳務與平台毛利的人工調整，所有調整皆以 target_type / target_id 表示對象。
        </p>
      </div>
      <n-button type="primary" @click="openCreate">新增調帳</n-button>
    </div>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
      <div class="rounded border border-white/10 bg-[#202026] p-4">
        <n-statistic label="調帳總數" :value="summary.total" />
      </div>
      <div class="rounded border border-white/10 bg-[#202026] p-4">
        <n-statistic label="待審核" :value="summary.pending" />
      </div>
      <div class="rounded border border-white/10 bg-[#202026] p-4">
        <n-statistic label="已核准金額">
          <MoneyText :value="summary.approvedAmount" currency="USDT" show-sign />
        </n-statistic>
      </div>
      <div class="rounded border border-white/10 bg-[#202026] p-4">
        <n-statistic label="已入帳金額">
          <MoneyText :value="summary.postedAmount" currency="USDT" show-sign />
        </n-statistic>
      </div>
    </div>

    <n-alert type="info" :show-icon="false">
      調帳對象使用 target_type + target_id。AGENT 影響代理應收，PROVIDER 影響供應商應付，PLATFORM 只影響平台毛利。
    </n-alert>

    <div class="rounded border border-white/10 bg-[#202026] p-4">
      <div class="grid gap-3 xl:grid-cols-12">
        <n-input v-model:value="searchText" clearable placeholder="搜尋調帳單號 / 對象 / 原因" class="xl:col-span-4" />
        <n-select v-model:value="targetFilter" clearable placeholder="調帳對象" :options="targetOptions" class="xl:col-span-2" />
        <n-select v-model:value="statusFilter" clearable placeholder="狀態" :options="statusOptions" class="xl:col-span-2" />
        <n-button secondary class="xl:col-span-1" @click="resetFilters">重置</n-button>
      </div>
    </div>

    <n-data-table
      :columns="withTableSorters(columns)"
      :data="filteredRows"
      :pagination="{ pageSize: 10 }"
      :scroll-x="1420"
    />

    <n-drawer v-model:show="showDetail" :width="780">
      <n-drawer-content closable>
        <template #header>
          <div v-if="currentRow" class="flex items-center gap-3">
            <span class="font-semibold">{{ currentRow.adjustment_no }}</span>
            <n-tag :bordered="false">{{ targetTypeLabel[currentRow.target_type] }}</n-tag>
            <n-tag :type="statusMeta[currentRow.status].type" :bordered="false">{{ statusMeta[currentRow.status].label }}</n-tag>
          </div>
        </template>

        <template v-if="currentRow">
          <n-descriptions bordered :column="2" label-placement="left">
            <n-descriptions-item label="調帳對象">{{ currentRow.target_type }} / {{ currentRow.target_id }}</n-descriptions-item>
            <n-descriptions-item label="對象名稱">{{ currentRow.target_name }}</n-descriptions-item>
            <n-descriptions-item label="帳務線">{{ currentRow.accounting_line }}</n-descriptions-item>
            <n-descriptions-item label="帳期">{{ currentRow.period }}</n-descriptions-item>
            <n-descriptions-item label="調帳金額">
              <MoneyText :value="currentRow.amount" currency="USDT" show-sign color="text-slate-100" />
            </n-descriptions-item>
            <n-descriptions-item label="來源單號">{{ currentRow.source_ref }}</n-descriptions-item>
            <n-descriptions-item label="建立人">{{ currentRow.created_by }}</n-descriptions-item>
            <n-descriptions-item label="建立時間">{{ formatDateTime(currentRow.created_at) }}</n-descriptions-item>
            <n-descriptions-item label="核准人">{{ currentRow.approved_by || '-' }}</n-descriptions-item>
            <n-descriptions-item label="拒絕人">{{ currentRow.rejected_by || '-' }}</n-descriptions-item>
            <n-descriptions-item label="拒絕時間">{{ formatDateTime(currentRow.rejected_at) }}</n-descriptions-item>
            <n-descriptions-item label="入帳時間">{{ formatDateTime(currentRow.posted_at) }}</n-descriptions-item>
            <n-descriptions-item label="原因" :span="2">{{ currentRow.reason }}</n-descriptions-item>
            <n-descriptions-item label="影響說明" :span="2">{{ currentRow.impact_note }}</n-descriptions-item>
          </n-descriptions>
        </template>

        <template #footer>
          <div v-if="currentRow" class="flex flex-wrap justify-end gap-2">
            <n-button v-if="currentRow.status === 'pending'" type="error" secondary @click="rejectAdjustment(currentRow)">拒絕</n-button>
            <n-button v-if="currentRow.status === 'pending'" type="primary" secondary @click="approveAdjustment(currentRow)">核准</n-button>
            <n-button v-if="currentRow.status === 'approved'" type="success" secondary @click="postAdjustment(currentRow)">入帳</n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>

    <n-modal v-model:show="showCreateModal" preset="card" title="新增調帳" style="width: min(640px, 92vw);">
      <n-alert type="info" :show-icon="false" class="mb-4">
        調帳只能選擇一條帳務線。AGENT 影響代理帳務，PROVIDER 影響供應商帳務，PLATFORM 影響平台毛利。
      </n-alert>
      <n-form label-placement="left" label-width="110">
        <n-form-item label="調帳對象">
          <n-select v-model:value="createForm.target_type" :options="targetOptions" @update:value="syncCreateTarget" />
        </n-form-item>
        <n-form-item label="對象名稱">
          <n-select :value="createForm.target_id" :options="targetEntityOptions" @update:value="selectCreateTarget" />
        </n-form-item>
        <n-form-item label="帳期">
          <n-input v-model:value="createForm.period" placeholder="YYYY-MM-DD" />
        </n-form-item>
        <n-form-item label="金額">
          <n-input-number v-model:value="createForm.amount" class="w-full" :step="100">
            <template #prefix>USDT</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="來源單號">
          <n-input v-model:value="createForm.source_ref" placeholder="MANUAL / AINV / PINV / FX" />
        </n-form-item>
        <n-form-item label="原因">
          <n-input v-model:value="createForm.reason" type="textarea" placeholder="請輸入調帳原因" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button secondary @click="showCreateModal = false">取消</n-button>
          <n-button type="primary" @click="submitCreate">建立</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>
