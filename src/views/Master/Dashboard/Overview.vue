<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NGrid,
  NGridItem,
  NIcon,
  NList,
  NListItem,
  NProgress,
  NSkeleton,
  NStatistic,
  NTag,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  AssessmentOutlined,
  ContentCopyOutlined,
  ReceiptLongOutlined,
  SearchOutlined
} from '@vicons/material'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import MoneyText from '../../../components/Common/MoneyText.vue'
import { DEFAULT_TABLE_PAGINATION, withTableSorters } from '../../../utils/tableSort'
import { adminDashboardService } from '../../../services/admin/dashboard'
import type {
  AdminDashboardData,
  DashboardActionItem,
  DashboardProviderHealth,
  DashboardTone
} from '../../../services/admin/dashboard'

use([CanvasRenderer, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent])

const message = useMessage()
const loading = ref(true)
const dashboard = ref<AdminDashboardData | null>(null)

const toneClass = (tone: DashboardTone) => {
  const map: Record<DashboardTone, string> = {
    success: 'border-emerald-400/30 bg-emerald-500/5',
    warning: 'border-amber-400/30 bg-amber-500/5',
    error: 'border-rose-400/30 bg-rose-500/5',
    info: 'border-cyan-400/30 bg-cyan-500/5',
    default: 'border-white/10 bg-[#202026]'
  }
  return map[tone]
}

const providerTagType = (status: DashboardProviderHealth['status']) => {
  if (status === 'healthy') return 'success'
  if (status === 'warning') return 'warning'
  return 'error'
}

const providerProgressStatus = providerTagType

const trendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: {
    data: ['代理應收', '供應商應付', '平台毛利'],
    bottom: 0,
    textStyle: { color: '#cbd5e1' }
  },
  grid: { left: '3%', right: '4%', bottom: '14%', top: '6%', containLabel: true },
  xAxis: {
    type: 'category',
    data: dashboard.value?.trend_7d.map(item => item.date) || [],
    axisLine: { lineStyle: { color: '#475569' } },
    axisLabel: { color: '#94a3b8' }
  },
  yAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: '#475569' } },
    axisLabel: { color: '#94a3b8' },
    splitLine: { lineStyle: { color: '#262932' } }
  },
  series: [
    {
      name: '代理應收',
      type: 'line',
      smooth: true,
      data: dashboard.value?.trend_7d.map(item => item.agent_receivable) || [],
      itemStyle: { color: '#63e2b7' },
      areaStyle: { opacity: 0.12, color: '#63e2b7' }
    },
    {
      name: '供應商應付',
      type: 'line',
      smooth: true,
      data: dashboard.value?.trend_7d.map(item => item.provider_payable) || [],
      itemStyle: { color: '#f2c97d' }
    },
    {
      name: '平台毛利',
      type: 'line',
      smooth: true,
      data: dashboard.value?.trend_7d.map(item => item.platform_margin) || [],
      itemStyle: { color: '#70c0e8' },
      areaStyle: { opacity: 0.08, color: '#70c0e8' }
    }
  ]
}))

const marginOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: {
    orient: 'horizontal',
    bottom: 0,
    textStyle: { color: '#cbd5e1' }
  },
  series: [
    {
      name: '平台毛利組成',
      type: 'pie',
      radius: ['46%', '72%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#1c1c21',
        borderWidth: 2
      },
      label: { color: '#e5e7eb' },
      data: dashboard.value?.margin_breakdown || []
    }
  ]
}))

const actionColumns: DataTableColumns<DashboardActionItem> = [
  {
    title: '任務 ID',
    key: 'id',
    width: 170,
    render: row => h('span', { class: 'font-mono text-xs text-cyan-300' }, row.id)
  },
  { title: '來源', key: 'source', width: 110 },
  { title: '類型', key: 'type', width: 150 },
  { title: '影響', key: 'impact', minWidth: 150 },
  { title: '負責人', key: 'owner', width: 110 },
  {
    title: '狀態',
    key: 'status',
    width: 110,
    render: row => h(NTag, { bordered: false, type: row.status.includes('待') ? 'warning' : 'info' }, { default: () => row.status })
  },
  {
    title: '操作',
    key: 'actions',
    width: 105,
    fixed: 'right',
    render: row => h(NButton, { size: 'small', secondary: true, onClick: () => actionMessage(`前往 ${row.route}`) }, {
      icon: () => h(NIcon, null, { default: () => h(SearchOutlined) }),
      default: () => '查看'
    })
  }
]

const actionMessage = (text: string) => {
  message.info(`${text}，正式串接時會帶入對應查詢條件。`)
}

const copySummary = () => {
  message.success('總覽摘要已複製')
}

const loadDashboard = async () => {
  loading.value = true
  try {
    const response = await adminDashboardService.getOverview()
    dashboard.value = response.data
  } catch {
    message.error('總覽資料載入失敗')
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<template>
  <div class="space-y-6 p-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">儀錶板</h1>
        <p class="mt-1 text-sm text-gray-500">
          GGAP 營運總覽，集中查看交易、帳務、匯率、錢包路由與品質告警。
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <n-tag type="success" size="small" :bordered="false">
          {{ dashboard?.updated_at ? `更新 ${new Date(dashboard.updated_at).toLocaleString()}` : '載入中' }}
        </n-tag>
        <n-button secondary @click="copySummary">
          <template #icon><n-icon :component="ContentCopyOutlined" /></template>
          複製摘要
        </n-button>
        <n-button type="primary" secondary @click="actionMessage('產生日報')">
          <template #icon><n-icon :component="AssessmentOutlined" /></template>
          產生日報
        </n-button>
      </div>
    </div>

    <n-grid x-gap="12" y-gap="12" cols="1 s:2 m:4" responsive="screen">
      <n-grid-item v-for="item in dashboard?.operation_kpis || []" :key="item.label">
        <n-card size="small" :class="['h-full border', toneClass(item.tone)]">
          <div class="flex items-start justify-between gap-2">
            <div class="text-sm text-gray-400">{{ item.label }}</div>
            <n-tag v-if="item.tag" size="small" :type="item.tone" :bordered="false">{{ item.tag }}</n-tag>
          </div>
          <div v-if="loading" class="mt-3 h-8">
            <n-skeleton text width="60%" />
          </div>
          <div v-else class="mt-3 text-2xl font-bold tabular-nums">{{ item.value }}</div>
          <div class="mt-2 text-xs text-gray-500">{{ item.note }}</div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-grid x-gap="12" y-gap="12" cols="1 s:2 m:4" responsive="screen">
      <n-grid-item v-for="item in dashboard?.finance_kpis || []" :key="item.label">
        <n-card size="small" :class="['h-full border', toneClass(item.tone)]">
          <div class="text-sm text-gray-400">{{ item.label }}</div>
          <div v-if="loading" class="mt-3 h-8">
            <n-skeleton text width="70%" />
          </div>
          <div v-else class="mt-3 text-2xl font-bold">
            <MoneyText v-if="item.money && typeof item.value === 'number'" :value="item.value" currency="USDT" compact color="text-slate-100" />
            <span v-else>{{ item.value }}</span>
          </div>
          <div class="mt-2 text-xs text-gray-500">{{ item.note }}</div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-grid x-gap="12" y-gap="12" cols="1 m:3" responsive="screen">
      <n-grid-item span="2">
        <n-card size="small" title="近 7 日帳務趨勢">
          <div class="h-[310px] w-full">
            <n-skeleton v-if="loading" text :repeat="8" />
            <v-chart v-else :option="trendOption" autoresize style="height: 310px; width: 100%;" />
          </div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card size="small" title="平台毛利組成">
          <div class="h-[310px] w-full">
            <n-skeleton v-if="loading" circle size="medium" />
            <v-chart v-else :option="marginOption" autoresize style="height: 310px; width: 100%;" />
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-grid x-gap="12" y-gap="12" cols="1 m:3" responsive="screen">
      <n-grid-item>
        <n-card size="small" title="Provider 健康度">
          <n-list>
            <n-list-item v-for="item in dashboard?.provider_health || []" :key="item.provider">
              <div class="mb-2 flex items-center justify-between">
                <span class="font-bold">{{ item.provider }}</span>
                <n-tag :type="providerTagType(item.status)" size="small" round>
                  {{ item.latency_ms }} ms
                </n-tag>
              </div>
              <div class="mb-2 flex justify-between text-xs text-gray-500">
                <span>成功率</span>
                <span class="font-mono">{{ item.success_rate }}%</span>
              </div>
              <n-progress
                type="line"
                :percentage="item.success_rate"
                :status="providerProgressStatus(item.status)"
                :show-indicator="false"
                processing
              />
            </n-list-item>
          </n-list>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card size="small" title="帳務進度">
          <n-list>
            <n-list-item v-for="item in dashboard?.accounting_progress || []" :key="item.module">
              <div class="mb-3 flex items-center justify-between">
                <span class="font-bold">{{ item.module }}</span>
                <n-icon class="text-emerald-300"><ReceiptLongOutlined /></n-icon>
              </div>
              <div class="grid grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <div class="font-mono text-base text-amber-300">{{ item.pending }}</div>
                  <div class="text-gray-500">待處理</div>
                </div>
                <div>
                  <div class="font-mono text-base text-rose-300">{{ item.difference }}</div>
                  <div class="text-gray-500">差異</div>
                </div>
                <div>
                  <div class="font-mono text-base text-cyan-300">{{ item.locked }}</div>
                  <div class="text-gray-500">已鎖定</div>
                </div>
                <div>
                  <div class="font-mono text-base text-emerald-300">{{ item.done }}</div>
                  <div class="text-gray-500">完成</div>
                </div>
              </div>
            </n-list-item>
          </n-list>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card size="small" title="品質中心">
          <div class="grid grid-cols-3 gap-3">
            <div class="rounded border border-white/10 bg-[#18181c] p-3 text-center">
              <n-statistic label="風控事件" :value="dashboard?.quality_summary.risk_events || 0" />
            </div>
            <div class="rounded border border-white/10 bg-[#18181c] p-3 text-center">
              <n-statistic label="監控告警" :value="dashboard?.quality_summary.monitoring_alerts || 0" />
            </div>
            <div class="rounded border border-white/10 bg-[#18181c] p-3 text-center">
              <n-statistic label="操作異常" :value="dashboard?.quality_summary.operation_anomalies || 0" />
            </div>
          </div>
          <div class="mt-4 rounded border border-amber-400/20 bg-amber-500/5 p-3 text-sm text-amber-100">
            API Gateway、Wallet Router、Provider Adapter 的串接品質會彙整到品質中心告警。
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-card size="small" title="待處理事項">
      <n-data-table
        :columns="withTableSorters(actionColumns)"
        :data="dashboard?.action_items || []"
        :pagination="DEFAULT_TABLE_PAGINATION"
        :bordered="false"
        :scroll-x="880"
      />
    </n-card>
  </div>
</template>
