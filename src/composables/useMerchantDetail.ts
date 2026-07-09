import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import type { MerchantDetail } from '../types/merchant'
import { legacyService } from '../services/legacy'

export function useMerchantDetail() {
    const message = useMessage()
    const loading = ref(false)
    const saving = ref(false)
    const formModel = ref<MerchantDetail | null>(null)
    const error = ref<string | null>(null)

    async function fetchDetail(id: number) {
        loading.value = true
        error.value = null
        try {
            formModel.value = await legacyService.getMerchantDetail(id)
        } catch (err: unknown) {
            console.error('Fetch Merchant Detail Error:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to load merchant details'
            error.value = errorMessage
            message.error(errorMessage)
        } finally {
            loading.value = false
        }
    }

    async function updateDetail() {
        if (!formModel.value) return

        saving.value = true
        try {
            await legacyService.updateMerchantDetail(formModel.value)
            message.success('Merchant configuration updated successfully')
        } catch (err: unknown) {
            console.error('Update Merchant Error:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to update configuration'
            message.error(errorMessage)
        } finally {
            saving.value = false
        }
    }

    const regenerateKey = () => {
        if (formModel.value) {
            // Mock client-side generation for preview, real logic should likely be a backend call
            formModel.value.secret_key = crypto.randomUUID()
            message.info('New secret key generated (unsaved)')
        }
    }

    return {
        loading,
        saving,
        formModel,
        error,
        fetchDetail,
        updateDetail,
        regenerateKey
    }
}
