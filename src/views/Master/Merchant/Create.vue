<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NSpin } from 'naive-ui'

const router = useRouter()

onMounted(() => {
  router.replace({ name: 'merchant-list', query: { create: '1' } })
})
</script>

<template>
  <div class="flex min-h-[50vh] items-center justify-center">
    <n-spin size="large">
      <div class="mt-3 text-sm text-gray-400">正在開啟新版新增商戶流程...</div>
    </n-spin>
  </div>
</template>
