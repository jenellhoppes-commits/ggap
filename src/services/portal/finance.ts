import { apiClient } from '../apiClient'

export interface PortalWallet {
  credit_limit: number
  balance: number
  outstanding_amount: number
  currency: string
  exchange_rate: number
  credit_request_status: 'none' | 'pending' | 'rejected'
}

export interface PortalInvoice {
  id: string
  period: string
  total_ggr: number
  commission_rate: number
  amount_due: number | null
  status: 'pending' | 'paid'
  verification_status: 'none' | 'verifying' | 'verified'
  created_at: string
}

export interface PortalFundRecord {
  id: string
  merchant_id: string
  merchant_name: string
  type: 'top-up' | 'credit-limit' | 'manual-adjust'
  amount: number
  previous_balance?: number
  previous_credit_limit?: number
  proof?: string
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at?: string
  reviewer?: string
}

export const portalFinanceService = {
  async getWallet() {
    const response = await apiClient.get<PortalWallet>('/api/v2/merchant/wallet')
    return response.data
  },

  async listInvoices() {
    const response = await apiClient.get<{ list: PortalInvoice[]; total: number }>('/api/v2/merchant/invoices')
    return response.data
  },

  async listFunds() {
    const response = await apiClient.get<{ list: PortalFundRecord[]; total: number }>('/api/v2/merchant/funds')
    return response.data
  },

  async submitTopUp(amount: number, txid = '') {
    const response = await apiClient.post('/api/v2/merchant/wallet/top-up', { amount, txid })
    return response.data
  },

  async submitInvoicePayment(invoiceId: string, txid: string) {
    const response = await apiClient.post(`/api/v2/merchant/invoices/${invoiceId}/payment`, { txid })
    return response.data
  },

  async submitCreditLimitRequest(desiredLimit: number, reason: string) {
    const response = await apiClient.post('/api/v2/merchant/wallet/credit-limit-request', {
      desired_limit: desiredLimit,
      reason
    })
    return response.data
  }
}
