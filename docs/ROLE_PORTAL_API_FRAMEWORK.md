# GGAP 三入口登入 / 角色權限 / API 串接框架

## 入口定義

| 入口 | URL | 角色 | 資料範圍 | 預設首頁 |
| --- | --- | --- | --- | --- |
| 管理者後台 | `/admin/login` | `MASTER` | `global` | `/admin/dashboard` |
| 代理後台 | `/agent/login` | `AGENT` | `agent_tree` | `/agent/dashboard` |
| 商戶後台 | `/merchant/login` | `MERCHANT` | `merchant_self` | `/merchant/dashboard` |

`/login` 保留為通用登入頁，可在 Demo 中切換三種入口；正式產品可改為入口選擇頁或導向管理者登入。

## 權限規則

1. 管理者後台只允許 `MASTER`。
2. 代理後台只允許 `AGENT`。
3. 商戶後台只允許 `MERCHANT`。
4. 登入後若進入錯誤入口，前端導向 `403`，不自動混用其他入口內容。
5. 三個入口可共用同一套 Vue page component，但 route、menu、資料範圍與 API request scope 必須分開。

## 資料範圍

| data_scope | 說明 |
| --- | --- |
| `global` | 管理者可看平台全域資料，包含供應商、代理、商戶、交易、財務、品質與系統管理。 |
| `agent_tree` | 代理只能看自身代理樹，包含下級代理、所屬商戶、所屬會員與代理帳務。 |
| `merchant_self` | 商戶只能看自身商戶資料，包含自身遊戲、會員、注單、報表與串接資訊。 |

## API Request Header

前端統一由 `src/services/apiClient.ts` 自動帶入：

| Header | 範例 | 說明 |
| --- | --- | --- |
| `Authorization` | `Bearer xxx` | 登入 token。 |
| `X-GGAP-Portal` | `admin` / `agent` / `merchant` | 目前入口。 |
| `X-GGAP-Role` | `MASTER` / `AGENT` / `MERCHANT` | 登入角色。 |
| `X-GGAP-Data-Scope` | `global` / `agent_tree` / `merchant_self` | 後端資料過濾範圍。 |
| `X-GGAP-Agent-Id` | `AGT-SEA-001` | 代理後台與商戶所屬代理使用。 |
| `X-GGAP-Merchant-Id` | `OP-1007` | 商戶後台使用。 |

後端串接時應以 token 內的 server-side claims 為準，Header 作為前端展示與除錯輔助；不可只信任前端 Header 進行資料授權。

## 後端授權建議

1. Login API 回傳 `token`、`role`、`portal`、`data_scope`、`agent_id`、`merchant_id`。
2. API Gateway 或 middleware 解析 token，決定正式資料範圍。
3. `MASTER` API 可查全域資料。
4. `AGENT` API 必須加上代理樹限制，例如 `agent_id in descendant_agent_ids(current_agent)` 或商戶歸屬於該代理樹。
5. `MERCHANT` API 必須固定 `merchant_id = current_merchant_id`。
6. 財務正式結算仍以後端帳務資料為準，前端入口只影響可見範圍，不改變帳務主體。

## 前端檔案對應

| 功能 | 檔案 |
| --- | --- |
| 角色與登入狀態 | `src/stores/auth.ts` |
| API Header 與 request wrapper | `src/services/apiClient.ts` |
| 三入口路由與 guard | `src/router/index.ts` |
| 登入畫面 | `src/views/Auth/index.vue` |
| 管理者版面 | `src/layouts/MasterLayout.vue` |
| 代理 / 商戶版面 | `src/layouts/MerchantLayout.vue` |
| 管理者選單 | `src/config/menu-master.ts` |
| 代理選單 | `src/config/menu-agent.ts` |
| 商戶選單 | `src/config/menu-merchant.ts` |

## API Service Layer

原則：

1. Vue page 不直接呼叫 `fetch`。
2. Vue page 只處理 loading、form、table、modal 與 message。
3. API path、request body、response shape 集中在 service。
4. 後端正式串接時優先替換 service，不逐頁翻 UI。

目前 `src/views`、`src/components`、`src/composables` 已不再直接呼叫 `fetch`；唯一原生 fetch 出口保留在 `src/services/apiClient.ts`。

## 共用 API Client

| Service | 負責範圍 |
| --- | --- |
| `src/services/apiClient.ts` | 統一 request、token、portal、role、data scope header。 |
| `src/services/legacy.ts` | 舊版未掛主選單但仍存在的商戶 / 代理 composables。 |

## 代理 / 商戶端 Service

| Service | 負責範圍 |
| --- | --- |
| `src/services/portal/dashboard.ts` | 代理 / 商戶儀錶板。 |
| `src/services/portal/games.ts` | 我的遊戲、遊戲啟停。 |
| `src/services/portal/reports.ts` | 每日營收、交易明細、注單查詢、輸贏報表。 |
| `src/services/portal/finance.ts` | 錢包、帳單、資金紀錄、充值申請、額度申請。 |
| `src/services/portal/developer.ts` | API 憑證、IP 白名單。 |
| `src/services/portal/organization.ts` | 下級代理、代理狀態、代理新增 / 編輯、代理轉點。 |

## 管理者端 Service

| Service | 負責範圍 |
| --- | --- |
| `src/services/admin/dashboard.ts` | 管理者儀錶板。 |
| `src/services/admin/transactions.ts` | 交易中心資料。 |
| `src/services/admin/reports.ts` | 報表中心。 |
| `src/services/admin/content.ts` | 遊戲列表、遊戲設定、供應商設定、RTP。 |
| `src/services/admin/finance.ts` | 管理者資金審核、人工調帳。 |
| `src/services/admin/merchants.ts` | 商戶供應商授權。 |

## 已完成的 API 收斂項目

| 區塊 | 檔案 / 元件 | Service |
| --- | --- | --- |
| 報表中心 | `src/views/Master/DataCenter/Report.vue` | `services/admin/reports.ts` |
| 遊戲中心舊入口 | `src/views/Master/GameCenter/List.vue` | `services/admin/content.ts` |
| 供應商設定 modal | `src/views/Master/GameCenter/components/ProviderConfigModal.vue` | `services/admin/content.ts` |
| 遊戲設定 modal | `src/views/Master/GameCenter/components/GameConfigModal.vue` | `services/admin/content.ts` |
| 管理者資金審核 | `src/views/Master/Finance/FundManagement.vue` | `services/admin/finance.ts` |
| 商戶供應商授權 | `src/views/Master/Merchant/components/MerchantSubscriptionModal.vue` | `services/admin/merchants.ts` |
| RTP 共用元件 | `src/components/Business/RTPSelector.vue` | `services/admin/content.ts` |

## 後續建議

1. 後端先接 `/api/login`，確定三種角色回傳資料一致。
2. 接 API Gateway / middleware，驗證 token claims 與 `X-GGAP-*` header。
3. 先驗證代理樹與商戶自身資料隔離。
4. 逐步替換 mock response，保持 response shape 與 service type 一致。
5. 若 bundle size 需要優化，再做 manual chunks 或延遲載入策略。
