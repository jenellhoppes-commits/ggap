import { h } from 'vue'
import type { Component } from 'vue'
import { RouterLink } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import { NIcon } from 'naive-ui'
import {
  AccountBalanceWalletOutlined,
  BarChartOutlined,
  CodeOutlined,
  DashboardOutlined,
  DescriptionOutlined,
  PeopleAltOutlined
} from '@vicons/material'

const renderIcon = (icon: Component) => () => h(NIcon, null, { default: () => h(icon) })
const renderLink = (to: string, label: string) => () => h(RouterLink, { to, title: label }, { default: () => label })

export const agentMenuOptions = (): MenuOption[] => [
  {
    type: 'group',
    label: '總覽',
    key: 'overview-group',
    children: [
      { label: renderLink('/agent/dashboard', '代理總覽'), key: 'agent-dashboard', icon: renderIcon(DashboardOutlined) }
    ]
  },
  {
    type: 'group',
    label: '商戶與下級',
    key: 'business-group',
    children: [
      { label: renderLink('/agent/merchants', '商戶管理'), key: 'agent-merchants', icon: renderIcon(PeopleAltOutlined) },
      { label: renderLink('/agent/organization/sub-agents', '下級代理'), key: 'agent-sub-agents', icon: renderIcon(PeopleAltOutlined) }
    ]
  },
  {
    type: 'group',
    label: '代理帳務',
    key: 'finance-group',
    children: [
      { label: renderLink('/agent/finance/accounting', '代理帳務'), key: 'agent-accounting', icon: renderIcon(AccountBalanceWalletOutlined) },
      { label: renderLink('/agent/finance/invoices', '平台帳單'), key: 'AgentInvoices', icon: renderIcon(AccountBalanceWalletOutlined) }
    ]
  },
  {
    type: 'group',
    label: '報表中心',
    key: 'report-group',
    children: [
      { label: renderLink('/agent/reports/merchants', '商戶報表'), key: 'agent-merchant-report', icon: renderIcon(BarChartOutlined) },
      { label: renderLink('/agent/reports/sub-agents', '下級代理報表'), key: 'agent-sub-agent-report', icon: renderIcon(BarChartOutlined) },
      { label: renderLink('/agent/reports/bet-trace', '注單追蹤'), key: 'agent-bet-trace', icon: renderIcon(DescriptionOutlined) }
    ]
  },
  {
    type: 'group',
    label: '串接資訊',
    key: 'developer-group',
    children: [
      { label: renderLink('/agent/developer', '代理報表 API'), key: 'AgentDeveloperCenter', icon: renderIcon(CodeOutlined) }
    ]
  }
]
