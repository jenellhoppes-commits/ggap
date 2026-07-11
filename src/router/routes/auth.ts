import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../../views/Auth/index.vue'),
    meta: { title: '登入', public: true }
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('../../views/Auth/index.vue'),
    meta: { title: '管理者登入', public: true, portal: 'admin' }
  },
  {
    path: '/agent/login',
    name: 'agent-login',
    component: () => import('../../views/Auth/index.vue'),
    meta: { title: '代理登入', public: true, portal: 'agent' }
  },
  {
    path: '/merchant/login',
    name: 'merchant-login',
    component: () => import('../../views/Auth/index.vue'),
    meta: { title: '商戶登入', public: true, portal: 'merchant' }
  }
]
