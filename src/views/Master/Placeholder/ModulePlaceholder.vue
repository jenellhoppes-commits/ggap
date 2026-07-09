<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NAlert, NButton, NEmpty, NIcon, NSpace, NTag } from 'naive-ui'
import { DescriptionOutlined, SettingsOutlined } from '@vicons/material'

const route = useRoute()

const title = computed(() => String(route.meta.title || '模組入口'))
const center = computed(() => String(route.meta.center || 'GGAP'))
const description = computed(() => String(route.meta.description || '此模組入口已依 MVP 資訊架構建立，後續將依規格逐步補上列表、詳情與主要操作展示。'))
const phase = computed(() => String(route.meta.phase || 'MVP'))
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center px-4">
    <div class="w-full max-w-3xl rounded border border-dashed border-gray-700 bg-[#202026] p-8 shadow-sm">
      <div class="flex flex-wrap items-center gap-3">
        <n-tag type="info" :bordered="false">{{ center }}</n-tag>
        <n-tag type="warning" :bordered="false">{{ phase }}</n-tag>
      </div>

      <n-empty class="mt-8" :description="title">
        <template #icon>
          <n-icon size="48" color="#0e7490">
            <SettingsOutlined />
          </n-icon>
        </template>
        <template #extra>
          <div class="max-w-xl text-center text-sm leading-6 text-gray-500">
            {{ description }}
          </div>
        </template>
      </n-empty>

      <n-alert class="mt-8" type="info" :show-icon="true">
        這個入口已先建立完成，後續會依照規格補上查詢、新增、欄位、修改、詳情與主要操作演示。
      </n-alert>

      <n-space class="mt-6" justify="center">
        <n-button secondary>
          <template #icon>
            <n-icon><DescriptionOutlined /></n-icon>
          </template>
          查看模組規格
        </n-button>
      </n-space>
    </div>
  </div>
</template>
