import type { RouteRecordRaw } from 'vue-router'

export const agentRoutes: RouteRecordRaw = {
    path: '/agent',
    component: () => import('../../layouts/MerchantLayout.vue'),
    redirect: '/agent/dashboard',
    meta: { requiresAuth: true, portal: 'agent', allowedRoles: ['AGENT'] },
    children: [
        { path: 'dashboard', name: 'agent-dashboard', component: () => import('../../views/Merchant/Dashboard/Index.vue'), meta: { title: '代理總覽' } },
        { path: 'merchants', name: 'agent-merchants', component: () => import('../../views/Merchant/Agent/MerchantList.vue'), meta: { title: '商戶管理' } },
        { path: 'organization/sub-list', redirect: '/agent/organization/sub-agents' },
        { path: 'organization/sub-agents', name: 'agent-sub-agents', component: () => import('../../views/Merchant/Organization/SubAgentList.vue'), meta: { title: '下級代理' } },
        { path: 'finance/accounting', name: 'agent-accounting', component: () => import('../../views/Merchant/Agent/Accounting.vue'), meta: { title: '代理帳務' } },
        { path: 'finance/invoices', name: 'AgentInvoices', component: () => import('../../views/Merchant/Finance/MyInvoices.vue'), meta: { title: '帳單與收款' } },
        { path: 'reports/daily', redirect: '/agent/reports/merchants' },
        { path: 'reports/win-loss', redirect: '/agent/reports/sub-agents' },
        { path: 'reports/bet-query', redirect: '/agent/reports/bet-trace' },
        { path: 'reports/merchants', name: 'agent-merchant-report', component: () => import('../../views/Merchant/Agent/MerchantReport.vue'), meta: { title: '商戶報表' } },
        { path: 'reports/sub-agents', name: 'agent-sub-agent-report', component: () => import('../../views/Merchant/Agent/SubAgentReport.vue'), meta: { title: '下級代理報表' } },
        { path: 'reports/bet-trace', name: 'agent-bet-trace', component: () => import('../../views/Merchant/Reports/BetQuery.vue'), meta: { title: '注單追蹤' } },
        { path: 'developer', name: 'AgentDeveloperCenter', component: () => import('../../views/Merchant/Developer/Index.vue'), meta: { title: 'API 與白名單' } }
    ]
}
