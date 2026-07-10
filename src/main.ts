import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'
import router from './router'
import './style.css'
import App from './App.vue'
import i18n from './i18n'
import { shouldUseDemoData } from './config/runtime'

// ECharts plugin - must be imported before vue-echarts components are used
import './plugins/echarts'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(naive)
app.use(i18n)

async function prepareApp() {
    if (!shouldUseDemoData()) return

    try {
        const { worker } = await import('./mocks/browser')
        await worker.start({
            onUnhandledRequest: 'bypass',
            serviceWorker: {
                url: `${import.meta.env.BASE_URL}mockServiceWorker.js`
            }
        })
    } catch (error) {
        const { setupManualMock } = await import('./mocks/manual')
        console.warn('Failed to start MSW, using manual mock fallback:', error)
        setupManualMock()
    }
}

prepareApp().then(() => {
    app.mount('#app')
}).catch(error => {
    console.error('Failed to prepare app:', error)
    app.mount('#app')
})
