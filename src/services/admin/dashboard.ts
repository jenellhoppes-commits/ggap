import { mockApiResponse } from '../apiClient'
import { adminDashboardDemo } from '../demo/adminDashboard'

export type DashboardTone = 'success' | 'warning' | 'error' | 'info' | 'default'

export interface DashboardKpi {
  label: string
  value: number | string
  note: string
  tone: DashboardTone
  tag?: string
  money?: boolean
}

export interface DashboardTrendPoint {
  date: string
  agent_receivable: number
  provider_payable: number
  platform_margin: number
}

export interface DashboardPieItem {
  name: string
  value: number
}

export interface DashboardActionItem {
  id: string
  source: string
  type: string
  impact: string
  owner: string
  status: string
  route: string
}

export interface DashboardProviderHealth {
  provider: string
  status: 'healthy' | 'warning' | 'error'
  latency_ms: number
  success_rate: number
}

export interface DashboardAccountingProgress {
  module: string
  pending: number
  difference: number
  locked: number
  done: number
}

export interface AdminDashboardData {
  updated_at: string
  operation_kpis: DashboardKpi[]
  finance_kpis: DashboardKpi[]
  trend_7d: DashboardTrendPoint[]
  margin_breakdown: DashboardPieItem[]
  action_items: DashboardActionItem[]
  provider_health: DashboardProviderHealth[]
  accounting_progress: DashboardAccountingProgress[]
  quality_summary: {
    risk_events: number
    monitoring_alerts: number
    operation_anomalies: number
  }
}

export const adminDashboardService = {
  async getOverview() {
    return mockApiResponse<AdminDashboardData>(adminDashboardDemo)
  }
}
