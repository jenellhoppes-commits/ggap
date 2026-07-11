# GGAP Frontend Integration Notes

This note documents the frontend contracts that should stay stable when replacing demo data with backend APIs.

## Portal and Permission Matrix

Portal rules are centralized in `src/config/permissions.ts`.

| Portal | Role | Data scope | Login | Default page |
| --- | --- | --- | --- | --- |
| admin | MASTER | global | `/admin/login` | `/admin/dashboard` |
| agent | AGENT | agent_tree | `/agent/login` | `/agent/dashboard` |
| merchant | MERCHANT | merchant_self | `/merchant/login` | `/merchant/dashboard` |

Use this file as the single source of truth for:

- route guard checks
- login redirect paths
- 401 redirect handling
- default portal landing pages
- request scope expectations

## API Request Scope

`src/services/apiClient.ts` automatically sends portal scope headers when `auth_user` exists:

- `X-GGAP-Portal`
- `X-GGAP-Role`
- `X-GGAP-Data-Scope`
- `X-GGAP-Agent-Id`
- `X-GGAP-Merchant-Id`

Backend APIs should use these headers to apply data scope:

- `global`: platform-wide data
- `agent_tree`: current agent, sub-agents, and bound merchants
- `merchant_self`: current merchant only

## Standard API Response

The preferred response envelope is:

```json
{
  "code": 0,
  "message": "OK",
  "data": {},
  "trace_id": "trace-id"
}
```

For list endpoints, return either:

```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "items": [],
    "meta": {
      "page": 1,
      "page_size": 10,
      "total": 100
    }
  }
}
```

or the legacy-compatible form:

```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "list": [],
    "page": 1,
    "page_size": 10,
    "total": 100
  }
}
```

## Resource Adapter

`src/services/resourceAdapter.ts` provides a reusable CRUD wrapper:

```ts
const merchantResource = createResourceService({
  list: '/api/v2/admin/merchants',
  detail: (id) => `/api/v2/admin/merchants/${id}`,
  create: '/api/v2/admin/merchants',
  update: (id) => `/api/v2/admin/merchants/${id}`,
  toggleStatus: (id) => `/api/v2/admin/merchants/${id}/status`,
  export: '/api/v2/admin/merchants/export'
})
```

The adapter normalizes list responses to:

```ts
{
  items: T[],
  page: number,
  page_size: number,
  total: number
}
```

It also maps frontend sort values:

- `ascend` -> `asc`
- `descend` -> `desc`

## Table Rules

All `n-data-table` instances should use:

```ts
DEFAULT_TABLE_PAGINATION
withTableSorters(columns)
```

`DEFAULT_TABLE_PAGINATION` is defined in `src/utils/tableSort.ts`:

```ts
{
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50]
}
```

Do not inline per-page pagination unless a table is intentionally static and documented as such.
