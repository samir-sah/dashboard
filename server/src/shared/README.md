# Shared Domain

## Purpose
Shared business domains used by both Admin and Client modules.

Examples of domains located here:
* `orders`
* `products`
* `inventory`
* `invoices`
* `forecasting`
* `sales`

## Dependency Rules

### Allowed:
```text
Admin ↓ Shared
Client ↓ Shared
```

### Forbidden:
```text
Client ↓ Admin
Admin ↓ Client
```

## Shared Layer Responsibilities

**Contains:**
* Shared business workflows
* Shared domain services
* Shared aggregation logic
* Shared reusable operations

**Does NOT contain:**
* Route handlers
* Controllers
* Middleware
* UI-specific logic
* Admin-only logic
* Client-only logic
