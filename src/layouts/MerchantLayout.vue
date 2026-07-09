<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton,
  NConfigProvider,
  NDrawer,
  NDrawerContent,
  NIcon,
  NLayout,
  NLayoutContent,
  NLayoutFooter,
  NLayoutHeader,
  NLayoutSider,
  NMenu,
  NTag,
  darkTheme
} from 'naive-ui'
import type { GlobalThemeOverrides, MenuOption } from 'naive-ui'
import { ExitToAppOutlined } from '@vicons/material'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import { agentMenuOptions } from '../config/menu-agent'
import { merchantMenuOptions } from '../config/menu-merchant'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const currentRoute = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()

const collapsed = ref(false)
const showMobileMenu = ref(false)

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('md')
const isDesktop = breakpoints.greaterOrEqual('md')

const isAgentPortal = computed(() => currentRoute.path.startsWith('/agent'))
const portalTitle = computed(() => isAgentPortal.value ? '代理後台' : '商戶後台')
const portalSubtitle = computed(() => isAgentPortal.value ? '帳務與商戶管理' : '會員、投注與串接')
const portalTag = computed(() => isAgentPortal.value ? 'AGENT' : 'MERCHANT')
const collapsedMark = computed(() => isAgentPortal.value ? '代' : '商')
const menuOptions = computed<MenuOption[]>(() => isAgentPortal.value ? agentMenuOptions(t) : merchantMenuOptions(t))
const activeKey = computed(() => currentRoute.name as string)

const handleLogout = () => {
  authStore.logout()
  router.push(isAgentPortal.value ? '/agent/login' : '/merchant/login')
}

const handleVersionClick = () => {
  console.log(`${portalTitle.value} v0.1.0`)
}

const themeOverrides: GlobalThemeOverrides = {
  Layout: {
    siderColor: '#18181c',
    headerColor: '#18181c',
    headerBorderColor: '#333'
  }
}
</script>

<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <n-layout has-sider class="h-screen bg-[#101014]">
      <n-layout-sider
        v-if="isDesktop"
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        :collapsed="collapsed"
        show-trigger="bar"
        @collapse="collapsed = true"
        @expand="collapsed = false"
      >
        <div class="flex h-16 items-center justify-center overflow-hidden whitespace-nowrap border-b border-[#333]">
          <span v-if="!collapsed" class="pl-4 text-xl font-bold tracking-widest text-white">{{ portalTitle }}</span>
          <span v-else class="text-xl font-bold text-white">{{ collapsedMark }}</span>
        </div>
        <n-menu
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
          :value="activeKey"
          :inverted="true"
        />
      </n-layout-sider>

      <n-drawer v-model:show="showMobileMenu" :width="240" placement="left" class="bg-[#18181c]">
        <n-drawer-content body-content-style="padding: 0;">
          <div class="flex h-16 items-center justify-center border-b border-[#333] bg-[#18181c]">
            <span class="text-xl font-bold tracking-widest text-white">{{ portalTitle }}</span>
          </div>
          <n-menu
            :options="menuOptions"
            :value="activeKey"
            :inverted="true"
            @update:value="showMobileMenu = false"
          />
        </n-drawer-content>
      </n-drawer>

      <n-layout>
        <n-layout-header bordered class="flex h-16 items-center justify-between bg-[#18181c] px-6">
          <div class="flex items-center">
            <n-button quaternary circle @click="isMobile ? showMobileMenu = true : collapsed = !collapsed">
              <template #icon>
                <n-icon size="24" color="#ccc">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </n-icon>
              </template>
            </n-button>
            <n-tag :type="isAgentPortal ? 'warning' : 'info'" size="small" class="ml-4">{{ portalTag }}</n-tag>
          </div>

          <div class="flex items-center gap-4">
            <div class="hidden text-right md:block">
              <div class="text-sm font-bold text-white">{{ portalTitle }}</div>
              <div class="text-xs text-gray-400">{{ portalSubtitle }}</div>
            </div>
            <LanguageSwitcher />
            <div class="ml-2 flex items-center gap-3">
              <span class="text-sm text-gray-400">
                {{ t('common.hi') }} <span class="font-bold text-gray-200">{{ authStore.userInfo?.name || portalTag }}</span>
              </span>
              <n-button strong secondary type="error" size="small" @click="handleLogout">
                <template #icon><n-icon><ExitToAppOutlined /></n-icon></template>
                {{ t('common.logout') }}
              </n-button>
            </div>
          </div>
        </n-layout-header>

        <n-layout-content class="min-h-[85vh] bg-[#101014] p-6">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </n-layout-content>
        <n-layout-footer bordered class="p-4 text-center">
          <n-tag :bordered="false" size="small" class="cursor-pointer opacity-50 transition-opacity hover:opacity-100" @click="handleVersionClick">
            Version: v0.1.0 ({{ portalTitle }})
          </n-tag>
        </n-layout-footer>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>
