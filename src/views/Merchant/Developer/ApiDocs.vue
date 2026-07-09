<script setup lang="ts">
import { h } from 'vue'
import { NCard, NDataTable, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface ApiDocRow {
  name: string
  method: 'GET' | 'POST'
  path: string
  description: string
  scope: string
}

const rows: ApiDocRow[] = [
  { name: 'Launch Game', method: 'POST', path: '/api/v2/game/launch', description: '建立遊戲入口並鎖定 display_currency 與匯率快照。', scope: '商戶' },
  { name: 'Get Balance', method: 'POST', path: '/api/v2/wallet/balance', description: 'Seamless Wallet 查詢會員餘額。', scope: '商戶' },
  { name: 'Bet Callback', method: 'POST', path: '/callback/bet', description: '投注扣款 Callback。', scope: '商戶' },
  { name: 'Win Callback', method: 'POST', path: '/callback/win', description: '派彩入款 Callback。', scope: '商戶' },
  { name: 'Transfer Ledger', method: 'GET', path: '/api/v2/transfer/ledger', description: 'Transfer Wallet 轉點流水查詢。', scope: '商戶' }
]

const columns: DataTableColumns<ApiDocRow> = [
  { title: '文件名稱', key: 'name', sorter: 'default' },
  {
    title: 'Method',
    key: 'method',
    width: 100,
    sorter: 'default',
    render: (row) => h(NTag, { type: row.method === 'POST' ? 'success' : 'info', size: 'small', bordered: false }, { default: () => row.method })
  },
  { title: 'Endpoint', key: 'path', sorter: 'default', render: (row) => h('span', { class: 'font-mono text-cyan-300' }, row.path) },
  { title: '說明', key: 'description' },
  { title: '可見範圍', key: 'scope', width: 110 }
]
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-white">API 文件</h1>
      <p class="mt-2 text-sm text-gray-500">商戶串接 GGAP 遊戲、錢包與 Callback 的文件入口。</p>
    </header>

    <n-card>
      <n-data-table :columns="columns" :data="rows" :pagination="false" striped />
    </n-card>
  </div>
</template>
