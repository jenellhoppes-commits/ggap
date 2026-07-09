<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NResult, NButton } from 'naive-ui'

const router = useRouter()
</script>

<template>
  <div class="h-screen flex items-center justify-center bg-[#101014]">
    <n-result
      status="404"
      title="404 找不到頁面"
      description="你要進入的頁面不存在，或目前入口沒有開放此模組。"
    >
      <template #footer>
        <n-button @click="router.push('/')">回到首頁</n-button>
      </template>
    </n-result>
  </div>
</template>
