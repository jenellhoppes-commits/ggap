import { h } from 'vue'
import type { Component } from 'vue'
import { RouterLink } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import { NIcon } from 'naive-ui'
import {
  AccountBalanceWalletOutlined,
  CodeOutlined,
  DashboardOutlined,
  DescriptionOutlined,
  PeopleAltOutlined,
  SportsEsportsOutlined,
  SyncAltOutlined
} from '@vicons/material'

const renderIcon = (icon: Component) => () => h(NIcon, null, { default: () => h(icon) })
const renderLink = (to: string, label: string) => () => h(RouterLink, { to, title: label }, { default: () => label })

export const merchantMenuOptions = (): MenuOption[] => [
  {
    type: 'group',
    label: '總覽',
    key: 'overview-group',
    children: [
      { label: renderLink('/merchant/dashboard', '商戶總覽'), key: 'merchant-dashboard', icon: renderIcon(DashboardOutlined) }
    ]
  },
  {
    type: 'group',
    label: '會員管理',
    key: 'player-group',
    children: [
      { label: renderLink('/merchant/players', '會員管理'), key: 'merchant-players', icon: renderIcon(PeopleAltOutlined) }
    ]
  },
  {
    type: 'group',
    label: '投注管理',
    key: 'betting-group',
    children: [
      { label: renderLink('/merchant/betting/bets', '注單查詢'), key: 'merchant-betting-bets', icon: renderIcon(DescriptionOutlined) },
      { label: renderLink('/merchant/betting/transactions', '交易流水'), key: 'merchant-betting-transactions', icon: renderIcon(SyncAltOutlined) },
      { label: renderLink('/merchant/betting/repairs', '補單 / 重送'), key: 'merchant-betting-repairs', icon: renderIcon(SyncAltOutlined) }
    ]
  },
  {
    type: 'group',
    label: '遊戲與帳務',
    key: 'operation-group',
    children: [
      { label: renderLink('/merchant/games', '我的遊戲'), key: 'merchant-games', icon: renderIcon(SportsEsportsOutlined) },
      { label: renderLink('/merchant/finance/invoices', '錢包與帳務參考'), key: 'merchant-finance', icon: renderIcon(AccountBalanceWalletOutlined) }
    ]
  },
  {
    type: 'group',
    label: '串接資訊',
    key: 'developer-group',
    children: [
      { label: renderLink('/merchant/developer/docs', 'API 文件'), key: 'merchant-developer-docs', icon: renderIcon(CodeOutlined) },
      { label: renderLink('/merchant/developer/credentials', 'API 金鑰 / 憑證'), key: 'DeveloperCenter', icon: renderIcon(CodeOutlined) },
      { label: renderLink('/merchant/developer/callback-test', 'Callback 測試'), key: 'merchant-callback-test', icon: renderIcon(CodeOutlined) },
      { label: renderLink('/merchant/developer/callback-logs', 'Callback 紀錄'), key: 'merchant-callback-logs', icon: renderIcon(DescriptionOutlined) }
    ]
  }
]
