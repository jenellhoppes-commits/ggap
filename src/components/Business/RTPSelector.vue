<script setup lang="ts">
import { ref, watch } from 'vue'
import { NButton, NCard, NInputNumber, NSlider, useDialog, useMessage } from 'naive-ui'
import { adminContentService } from '../../services/admin/content'

const props = defineProps<{
  merchantId?: number
  value?: number
  showSaveButton?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:value', value: number): void
  (e: 'save'): void
}>()

const dialog = useDialog()
const message = useMessage()
const loading = ref(false)
const localRtpValue = ref<number>(props.value || 96)

watch(() => props.value, (newVal) => {
  if (newVal !== undefined) localRtpValue.value = newVal
})

watch(localRtpValue, (newVal) => {
  emit('update:value', newVal)
})

const minRtp = 90
const maxRtp = 99

const handleSave = () => {
  if (localRtpValue.value < minRtp || localRtpValue.value > maxRtp) {
    message.error(`RTP must be between ${minRtp}% and ${maxRtp}%`)
    return
  }

  dialog.warning({
    title: '重要設定變更',
    content: `即將把 RTP 調整為 ${localRtpValue.value}%，此設定會影響後續遊戲局。請確認是否套用。`,
    positiveText: '確認變更',
    negativeText: '取消',
    onPositiveClick: async () => {
      await executeUpdate()
    }
  })
}

const executeUpdate = async () => {
  loading.value = true
  try {
    await adminContentService.updateRtp({
      merchant_id: props.merchantId,
      rtp: localRtpValue.value
    })
    message.success('RTP Configuration Updated: ' + localRtpValue.value + '%')
    emit('save')
  } catch (error) {
    const messageText = error instanceof Error ? error.message : 'Failed to update RTP'
    message.error(messageText)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <n-card title="Game Math Configuration (RTP)" size="small">
    <div class="space-y-6">
      <div class="flex items-center justify-between rounded-lg bg-gray-800 p-4">
        <div>
          <div class="text-xs uppercase tracking-wider text-gray-400">Current Setting</div>
          <div class="font-mono text-2xl font-bold text-green-400">{{ localRtpValue }}%</div>
        </div>
        <div class="text-right">
          <div class="text-xs text-gray-400">Est. House Edge</div>
          <div class="font-mono text-xl font-bold text-red-400">{{ (100 - localRtpValue).toFixed(2) }}%</div>
        </div>
      </div>

      <div class="space-y-1">
        <label class="text-xs text-gray-500">Target RTP Percentage</label>
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <n-slider
              v-model:value="localRtpValue"
              :min="minRtp"
              :max="maxRtp"
              :step="0.1"
              :marks="{ 90: '90%', 95: '95%', 99: '99%' }"
            />
          </div>
          <div class="w-24">
            <n-input-number
              v-model:value="localRtpValue"
              :min="minRtp"
              :max="maxRtp"
              :step="0.1"
              size="small"
            >
              <template #suffix>%</template>
            </n-input-number>
          </div>
        </div>
      </div>

      <div v-if="showSaveButton" class="flex justify-end border-t border-gray-700 pt-4">
        <n-button type="error" secondary :loading="loading" @click="handleSave">
          Update RTP Configuration
        </n-button>
      </div>
    </div>
  </n-card>
</template>
