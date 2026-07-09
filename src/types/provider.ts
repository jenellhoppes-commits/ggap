export interface Provider {
    id: number;
    code: string;
    name: string;
    status: 'active' | 'maintenance';
    apiConfig: {
        apiUrl?: string;
        merchantCode?: string;
        secretKey?: string;
        revenueShare?: number;
        currency?: string;
        [key: string]: string | number | boolean | undefined;
    };
    type?: string;
    gameCount?: number;
    provider_settlement_currency?: 'USDT';
    provider_wallet_currency?: 'USDT';
    cost_billing_mode?: 'GGR';
    provider_cost_rate?: number;
    negative_ggr_policy?: 'carry_forward' | 'zero_out';
    cost_rate_version?: string;
    cost_rate_effective_at?: string;
    cost_rate_history?: Array<{
        version: string;
        provider_cost_rate: number;
        negative_ggr_policy: 'carry_forward' | 'zero_out';
        effective_at: string;
        changed_by: string;
        changed_at: string;
        remarks?: string;
    }>;
    service_status?: 'active' | 'maintenance';
    integration_status?: 'connected' | 'testing' | 'disabled';
    contract?: {
        costPercent: number;
        expiryDate: number | string;
    };
    contractConfig?: {
        settlement_currency: string;
        rules: {
            slot_free_spin: { enabled: boolean; provider_share: number };
            live_tip: { enabled: boolean; provider_share: number };
            card_fee: { enabled: boolean; provider_share: number };
        };
    };
    maintenanceConfig?: {
        isEmergency: boolean;
        startTime?: number;
        endTime?: number;
    };
}

export interface ProviderListResponse {
    code: number;
    msg: string;
    data: {
        list: Provider[];
        total: number;
    };
}
