<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NCard, NForm, NFormItem, NInput, NSelect, useMessage } from 'naive-ui'

const message = useMessage()
const eventType = ref('bet')
const roundId = ref('R-20260708-TEST')
const callbackUrl = ref('https://merchant.example.com/ggap/callback')
const payload = computed(() => JSON.stringify({
  event: eventType.value,
  round_id: roundId.value,
  merchant_player_id: 'P-TWD-10001',
  display_currency: 'TWD',
  settlement_currency: 'USDT',
  amount: 1200,
  settlement_amount: 37.21,
  trace_id: 'demo-callback-test'
}, null, 2))

const submit = () => {
  message.success('已送出測試 Callback')
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-white">Callback 測試</h1>
      <p class="mt-2 text-sm text-gray-500">商戶可用測試 payload 驗證 Callback URL、簽章與回應時間。</p>
    </header>

    <n-card>
      <n-form label-placement="top" class="max-w-3xl">
        <n-form-item label="事件類型">
          <n-select
            v-model:value="eventType"
            :options="[
              { label: 'Bet', value: 'bet' },
              { label: 'Win', value: 'win' },
              { label: 'Refund', value: 'refund' }
            ]"
          />
        </n-form-item>
        <n-form-item label="Round ID">
          <n-input v-model:value="roundId" />
        </n-form-item>
        <n-form-item label="Callback URL">
          <n-input v-model:value="callbackUrl" />
        </n-form-item>
        <n-form-item label="Payload">
          <n-input :value="payload" type="textarea" readonly :autosize="{ minRows: 10 }" />
        </n-form-item>
        <n-button type="primary" @click="submit">送出測試</n-button>
      </n-form>
    </n-card>
  </div>
</template>
