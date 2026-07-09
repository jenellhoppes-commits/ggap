<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    value: number
    currency?: string
    showSign?: boolean
    compact?: boolean
    color?: string
}

const props = withDefaults(defineProps<Props>(), {
    currency: 'USD',
    showSign: false,
    compact: false,
    color: ''
})

const formattedValue = computed(() => {
    const absValue = Math.abs(props.value)

    if (props.compact && absValue >= 1000000) {
        return `${(absValue / 1000000).toFixed(2)}M`
    }

    if (props.compact && absValue >= 1000) {
        return `${(absValue / 1000).toFixed(1)}K`
    }

    return absValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
})

const currencySymbol = computed(() => {
    const symbols: Record<string, string> = {
        USD: '$',
        TWD: 'NT$',
        CNY: 'CNY ',
        PHP: 'PHP ',
        THB: 'THB ',
        VND: 'VND ',
        IDR: 'IDR ',
        USDT: 'USDT '
    }

    return symbols[props.currency] || `${props.currency} `
})

const colorClass = computed(() => {
    if (props.color) return props.color
    if (props.value > 0) return 'text-green-500'
    if (props.value < 0) return 'text-red-500'
    return 'text-gray-400'
})

const signPrefix = computed(() => {
    if (!props.showSign) return ''
    if (props.value > 0) return '+'
    if (props.value < 0) return '-'
    return ''
})
</script>

<template>
    <span :class="['font-mono tabular-nums', colorClass]">
        {{ signPrefix }}{{ currencySymbol }}{{ formattedValue }}
    </span>
</template>
