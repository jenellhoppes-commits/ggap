export const runtimeConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  useMock: import.meta.env.VITE_USE_MOCK === 'true',
  disableMock: import.meta.env.VITE_USE_MOCK === 'false',
  apiTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000)
}

export const shouldUseDemoData = () => {
  if (runtimeConfig.useMock) return true
  if (runtimeConfig.disableMock) return false

  return import.meta.env.DEV && !runtimeConfig.apiBaseUrl
}
