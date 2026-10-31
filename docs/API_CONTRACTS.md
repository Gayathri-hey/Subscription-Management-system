# 📡 API Contracts

> Base URL: `http://localhost:5000/api`
> Authentication: `Authorization: Bearer <accessToken>`

---

## Auth

| Method | Endpoint                  | Auth | Description              |
|--------|---------------------------|------|--------------------------|
| POST   | `/auth/register`          | ❌   | Register new customer     |
| POST   | `/auth/login`             | ❌   | Login, receive tokens     |
| POST   | `/auth/refresh`           | ❌   | Refresh access token      |
| POST   | `/auth/logout`            | ✅   | Invalidate refresh token  |
| POST   | `/auth/forgot-password`   | ❌   | Send password reset email |
| POST   | `/auth/reset-password`    | ❌   | Reset password via token  |
| GET    | `/auth/me`                | ✅   | Get current user profile  |

---

## Users (Admin only)

| Method | Endpoint                  | Auth       | Description              |
|--------|---------------------------|------------|--------------------------|
| GET    | `/users`                  | Admin      | List all users (paginated)|
| POST   | `/users`                  | Admin      | Create staff/admin user   |
| GET    | `/users/:id`              | Admin      | Get user by ID            |
| PUT    | `/users/:id`              | Admin      | Update user               |
| PATCH  | `/users/:id/status`       | Admin      | Activate / suspend user   |
| DELETE | `/users/:id`              | Admin      | Delete user               |

---

## Products (Admin, Staff)

| Method | Endpoint                      | Auth         | Description                |
|--------|-------------------------------|--------------|----------------------------|
| GET    | `/products`                   | Auth         | List all products           |
| POST   | `/products`                   | Admin/Staff  | Create product              |
| GET    | `/products/:id`               | Auth         | Get product                 |
| PUT    | `/products/:id`               | Admin/Staff  | Update product              |
| DELETE | `/products/:id`               | Admin        | Delete product              |
| POST   | `/products/:id/variants`      | Admin/Staff  | Add variant to product      |
| PUT    | `/products/:id/variants/:vid` | Admin/Staff  | Update variant              |
| DELETE | `/products/:id/variants/:vid` | Admin        | Remove variant              |

---

## Plans

| Method | Endpoint          | Auth        | Description               |
|--------|-------------------|-------------|---------------------------|
| GET    | `/plans`          | Auth        | List all plans            |
| POST   | `/plans`          | Admin       | Create plan               |
| GET    | `/plans/:id`      | Auth        | Get plan                  |
| PUT    | `/plans/:id`      | Admin       | Update plan               |
| DELETE | `/plans/:id`      | Admin       | Deactivate plan           |

---

## Subscriptions

| Method | Endpoint                          | Auth              | Description                    |
|--------|-----------------------------------|-------------------|--------------------------------|
| GET    | `/subscriptions`                  | Admin/Staff       | List all subscriptions          |
| POST   | `/subscriptions`                  | Admin/Staff       | Create subscription             |
| GET    | `/subscriptions/:id`              | Admin/Staff/Owner | Get subscription                |
| PUT    | `/subscriptions/:id`              | Admin/Staff       | Update subscription             |
| PATCH  | `/subscriptions/:id/pause`        | Admin/Staff       | Pause subscription              |
| PATCH  | `/subscriptions/:id/resume`       | Admin/Staff       | Resume subscription             |
| PATCH  | `/subscriptions/:id/cancel`       | Admin/Staff/Owner | Cancel subscription             |
| GET    | `/subscriptions/my`               | Customer          | Get own subscriptions           |

---

## Quotations

| Method | Endpoint                      | Auth        | Description                  |
|--------|-------------------------------|-------------|------------------------------|
| GET    | `/quotations`                 | Admin/Staff | List quotations              |
| POST   | `/quotations`                 | Admin/Staff | Create quotation             |
| GET    | `/quotations/:id`             | Auth        | Get quotation                |
| PUT    | `/quotations/:id`             | Admin/Staff | Update quotation             |
| PATCH  | `/quotations/:id/send`        | Admin/Staff | Send quotation to customer   |
| PATCH  | `/quotations/:id/approve`     | Admin       | Approve quotation            |
| PATCH  | `/quotations/:id/reject`      | Admin       | Reject quotation             |

---

## Invoices

| Method | Endpoint                      | Auth              | Description             |
|--------|-------------------------------|-------------------|-------------------------|
| GET    | `/invoices`                   | Admin/Staff       | List all invoices        |
| POST   | `/invoices`                   | Admin/Staff       | Create manual invoice    |
| GET    | `/invoices/:id`               | Admin/Staff/Owner | Get invoice              |
| PATCH  | `/invoices/:id/send`          | Admin/Staff       | Send invoice by email    |
| PATCH  | `/invoices/:id/cancel`        | Admin             | Cancel invoice           |
| GET    | `/invoices/my`                | Customer          | Get own invoices         |

---

## Payments

| Method | Endpoint                      | Auth              | Description               |
|--------|-------------------------------|-------------------|---------------------------|
| GET    | `/payments`                   | Admin             | List all payments          |
| POST   | `/payments`                   | Admin/Staff       | Record manual payment      |
| GET    | `/payments/:id`               | Admin/Staff/Owner | Get payment                |
| GET    | `/payments/invoice/:id`       | Admin/Staff       | Payments for an invoice    |

---

## Taxes

| Method | Endpoint      | Auth  | Description    |
|--------|---------------|-------|----------------|
| GET    | `/taxes`      | Auth  | List taxes     |
| POST   | `/taxes`      | Admin | Create tax     |
| PUT    | `/taxes/:id`  | Admin | Update tax     |
| DELETE | `/taxes/:id`  | Admin | Delete tax     |

---

## Discounts

| Method | Endpoint             | Auth  | Description           |
|--------|----------------------|-------|-----------------------|
| GET    | `/discounts`         | Admin | List discounts        |
| POST   | `/discounts`         | Admin | Create discount       |
| GET    | `/discounts/:id`     | Admin | Get discount          |
| PUT    | `/discounts/:id`     | Admin | Update discount       |
| DELETE | `/discounts/:id`     | Admin | Delete discount       |

---

## Analytics (Admin only)

| Method | Endpoint                    | Auth  | Description                  |
|--------|-----------------------------|-------|------------------------------|
| GET    | `/analytics/revenue`        | Admin | Revenue over time             |
| GET    | `/analytics/subscriptions`  | Admin | Subscription growth stats     |
| GET    | `/analytics/churn`          | Admin | Churn rate metrics            |
| GET    | `/analytics/mrr`            | Admin | Monthly Recurring Revenue     |

---

## Standard Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```
