<script setup lang="ts">
import { NButton, NResult, NSpace } from 'naive-ui'
import { useRouter } from 'vue-router'
import type { Portal } from '../../stores/auth'
import { useAuthStore } from '../../stores/auth'
import { loginPathByPortal } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const portalEntries: Array<{ portal: Portal; label: string }> = [
  { portal: 'admin', label: '管理者登入' },
  { portal: 'agent', label: '代理登入' },
  { portal: 'merchant', label: '商戶登入' }
]

const switchAccount = () => {
  authStore.logout()
  router.push('/login')
}

const goPortalLogin = (portal: Portal) => {
  authStore.logout()
  router.push(loginPathByPortal[portal])
}
</script>

<template>
  <div class="flex h-screen items-center justify-center bg-[#101014]">
    <n-result
      status="403"
      title="403 無權限"
      description="目前帳號無法進入此入口或模組，請切換正確的後台帳號。"
    >
      <template #footer>
        <n-space vertical align="center" :size="14">
          <n-space justify="center">
            <n-button
              v-for="entry in portalEntries"
              :key="entry.portal"
              secondary
              @click="goPortalLogin(entry.portal)"
            >
              {{ entry.label }}
            </n-button>
          </n-space>
          <n-space justify="center">
            <n-button type="primary" @click="switchAccount">切換帳號</n-button>
            <n-button @click="router.go(-1)">返回上一頁</n-button>
          </n-space>
        </n-space>
      </template>
    </n-result>
  </div>
</template>
