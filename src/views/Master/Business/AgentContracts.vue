<script setup lang="ts">
import { NAlert, NButton, NResult } from 'naive-ui'
import { useRouter } from 'vue-router'

const router = useRouter()

const goAgentManagement = () => {
  router.replace('/admin/business/agents')
}
</script>

<template>
  <div class="flex min-h-[58vh] items-center justify-center px-4">
    <div class="w-full max-w-3xl space-y-5">
      <n-result
        status="info"
        title="代理費率已併入代理管理"
        description="目前不再使用獨立代理費率設定頁。代理、代理層級、供應商別費率與下層報價都在代理管理內維護。"
      >
        <template #footer>
          <n-button type="primary" @click="goAgentManagement">前往代理管理</n-button>
        </template>
      </n-result>

      <n-alert type="info" :show-icon="false">
        供應商成本費率由供應商管理維護；代理管理只讀取供應商成本作為報價參考，並可依供應商設定 GGAP 給 L1、L1 給 L2、L2 給 L3 與代理給商戶的費率。商戶報價不產生 GGAP 商戶應收。
      </n-alert>
    </div>
  </div>
</template>
