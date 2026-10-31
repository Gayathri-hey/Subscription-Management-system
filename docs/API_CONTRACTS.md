# 📡 API Contracts & Specification

> **Base URL**: `http://localhost:5000/api`  
> **Protocol**: HTTPS (Production) / HTTP (Local Development)  
> **Data Format**: `application/json` (UTF-8)  
> **Authentication**: `Authorization: Bearer <accessToken>` (Access tokens expire in 7d; Refresh token via `httpOnly` secure cookie expiring in 30d)  
> **Precision Standard**: All monetary values (`Decimal128`) are serialized as high-precision decimal strings (e.g., `"149.99"`, `"0.1800"`) to avoid IEEE 754 floating-point rounding errors.

---

## Table of Contents

1. [Global Standards & Conventions](#1-global-standards--conventions)
2. [Authentication Endpoints](#2-authentication-endpoints)
3. [Product Endpoints](#3-product-endpoints)
4. [Plan Endpoints](#4-plan-endpoints)
5. [Quotation Endpoints](#5-quotation-endpoints)
6. [Subscription Endpoints](#6-subscription-endpoints)
7. [Invoice Endpoints](#7-invoice-endpoints)
8. [Payment Endpoints](#8-payment-endpoints)
9. [Discount Endpoints](#9-discount-endpoints)
10. [Tax Endpoints](#10-tax-endpoints)
11. [Reporting Endpoints](#11-reporting-endpoints)

---

## 1. Global Standards & Conventions

### 1.1 Standard Success Envelope
All successful requests return HTTP status codes `200 OK` or `201 Created` with this envelope:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

When paginating collections, `meta` is included:

```json
{
  "success": true,
  "message": "Records retrieved successfully",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 128,
    "totalPages": 13
  }
}
```

### 1.2 Standard Error Envelope
Error responses return appropriate 4xx/5xx status codes and this structure:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [
    {
      "field": "email",
      "message": "A user with this email address already exists"
    }
  ]
}
```

### 1.3 Standard HTTP Status Codes

| Code | Meaning | When Returned |
|---|---|---|
| `200 OK` | Request succeeded | Successful GET, PUT, PATCH, DELETE operations |
| `201 Created` | Resource created | Successful POST creations |
| `400 Bad Request` | Malformed request | Syntax errors, invalid query parameters |
| `401 Unauthorized` | Missing / invalid token | Expired JWT, invalid bearer token |
| `403 Forbidden` | Insufficient role | User role lacks permission for this action |
| `404 Not Found` | Resource missing | Requested entity ID does not exist |
| `409 Conflict` | Unique conflict | Duplicate email, code, SKU, or concurrent mutation |
| `422 Unprocessable` | Validation failed | Field validation failed (missing required, out of bounds) |
| `500 Server Error` | Unhandled error | Unexpected database or runtime exceptions |

---

## 2. Authentication Endpoints

### 2.1 Register New Customer
Registers a new customer account and creates their linked Customer profile.

- **Method**: `POST`
- **URL**: `/auth/register`
- **Required Role**: Public (No authentication)
- **Request Body**:
```json
{
  "name": "David Miller",
  "email": "david@acmecorp.com",
  "password": "SecurePassword123!",
  "companyName": "Acme Technologies Inc.",
  "phone": "+1-555-0199",
  "billingAddress": {
    "street": "100 Market St, Suite 400",
    "city": "San Francisco",
    "state": "CA",
    "country": "US",
    "postalCode": "94105"
  }
}
```
- **Response Structure** (`201 Created`):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "672370f1a9234b8c912e0001",
      "name": "David Miller",
      "email": "david@acmecorp.com",
      "role": "customer",
      "status": "active",
      "createdAt": "2026-10-31T06:00:00.000Z"
    },
    "customer": {
      "id": "672370f1a9234b8c912e0002",
      "customerNumber": "CUST-2026-0001",
      "companyName": "Acme Technologies Inc.",
      "currency": "USD",
      "status": "active"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
- **Error Responses**:
  - `409 Conflict`: `{"success": false, "message": "Email already registered", "errors": [{"field": "email", "message": "A user with this email address already exists"}]}`
  - `422 Unprocessable Entity`: `{"success": false, "message": "Validation failed", "errors": [{"field": "password", "message": "Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and symbols"}]}`

---

### 2.2 User Login
Authenticates credentials and establishes session via JWT tokens.

- **Method**: `POST`
- **URL**: `/auth/login`
- **Required Role**: Public
- **Request Body**:
```json
{
  "email": "admin@subscriptions.io",
  "password": "AdminSuperPassword123!"
}
```
- **Response Structure** (`200 OK`):
  *Sets HTTP-only secure cookie `refreshToken=<jwt>; Path=/api/auth; HttpOnly; SameSite=Strict; Max-Age=2592000`*
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "672370f1a9234b8c912e0010",
      "name": "Alexander Wright",
      "email": "admin@subscriptions.io",
      "role": "admin",
      "status": "active"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```
- **Error Responses**:
  - `401 Unauthorized`: `{"success": false, "message": "Invalid email or password"}`
  - `403 Forbidden`: `{"success": false, "message": "Account has been suspended. Please contact support."}`

---

### 2.3 Refresh Access Token
Issues a new 7-day access token using the stored HTTP-only refresh token cookie.

- **Method**: `POST`
- **URL**: `/auth/refresh`
- **Required Role**: Public (Requires valid `refreshToken` cookie or bearer token)
- **Request Body**: None (`{}`)
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Access token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```
- **Error Responses**:
  - `401 Unauthorized`: `{"success": false, "message": "Refresh token missing, invalid, or expired"}`

---

### 2.4 User Logout
Invalidates the active refresh token and clears the authentication cookie.

- **Method**: `POST`
- **URL**: `/auth/logout`
- **Required Role**: `admin`, `staff`, `customer`
- **Request Body**: None (`{}`)
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```
- **Error Responses**:
  - `401 Unauthorized`: `{"success": false, "message": "Authentication required"}`

---

### 2.5 Forgot Password
Sends a password reset token via email to the registered address.

- **Method**: `POST`
- **URL**: `/auth/forgot-password`
- **Required Role**: Public
- **Request Body**:
```json
{
  "email": "david@acmecorp.com"
}
```
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "If the account exists, a password reset link has been dispatched to your email."
}
```
- **Error Responses**:
  - `422 Unprocessable Entity`: `{"success": false, "message": "Invalid email format"}`

---

### 2.6 Reset Password
Resets the password using the token sent via email.

- **Method**: `POST`
- **URL**: `/auth/reset-password`
- **Required Role**: Public
- **Request Body**:
```json
{
  "token": "4a7f28bc992019ab72348c",
  "password": "NewSecurePassword456!"
}
```
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Password reset successfully. You may now log in with your new password."
}
```
- **Error Responses**:
  - `400 Bad Request`: `{"success": false, "message": "Password reset token is invalid or has expired."}`

---

### 2.7 Get Current Authenticated Profile
Returns the authenticated user's profile and linked profile details.

- **Method**: `GET`
- **URL**: `/auth/me`
- **Required Role**: `admin`, `staff`, `customer`
- **Request Body**: None
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "id": "672370f1a9234b8c912e0001",
    "name": "David Miller",
    "email": "david@acmecorp.com",
    "role": "customer",
    "status": "active",
    "phone": "+1-555-0199",
    "isEmailVerified": true,
    "lastLoginAt": "2026-10-31T05:30:00.000Z",
    "customer": {
      "id": "672370f1a9234b8c912e0002",
      "customerNumber": "CUST-2026-0001",
      "companyName": "Acme Technologies Inc.",
      "currency": "USD"
    }
  }
}
```
- **Error Responses**:
  - `401 Unauthorized`: `{"success": false, "message": "Invalid or expired authorization token."}`

---

## 3. Product Endpoints

### 3.1 List Products
Retrieves catalog products with pagination, search, status, and category filters.

- **Method**: `GET`
- **URL**: `/products`
- **Required Role**: `admin`, `staff`, `customer`
- **Query Parameters**:
  - `page` (optional, integer, default: `1`)
  - `limit` (optional, integer, default: `10`)
  - `search` (optional, string)
  - `category` (optional, string)
  - `status` (optional, string: `draft`, `active`, `archived`)
- **Request Body**: None
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": "672371a1a9234b8c912e0100",
      "name": "Cloud Infrastructure Suite",
      "slug": "cloud-infrastructure-suite",
      "code": "CIS-001",
      "category": "Cloud Services",
      "status": "active",
      "isRecurring": true,
      "variantsCount": 3,
      "createdAt": "2026-10-01T00:00:00.000Z",
      "updatedAt": "2026-10-15T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```
- **Error Responses**:
  - `401 Unauthorized`: `{"success": false, "message": "Authentication required"}`

---

### 3.2 Create Product
Creates a new catalog product.

- **Method**: `POST`
- **URL**: `/products`
- **Required Role**: `admin`, `staff`
- **Request Body**:
```json
{
  "name": "Managed Security & SOC",
  "code": "SEC-104",
  "description": "Continuous 24/7 threat monitoring and automated incident response",
  "category": "Cybersecurity",
  "isRecurring": true,
  "status": "active",
  "taxRuleId": "672371f0a9234b8c912e0800"
}
```
- **Response Structure** (`201 Created`):
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "672371a1a9234b8c912e0101",
    "name": "Managed Security & SOC",
    "slug": "managed-security-soc",
    "code": "SEC-104",
    "description": "Continuous 24/7 threat monitoring and automated incident response",
    "category": "Cybersecurity",
    "isRecurring": true,
    "status": "active",
    "taxRule": "672371f0a9234b8c912e0800",
    "createdAt": "2026-10-31T06:00:00.000Z",
    "updatedAt": "2026-10-31T06:00:00.000Z"
  }
}
```
- **Error Responses**:
  - `403 Forbidden`: `{"success": false, "message": "Only Admins and Staff may create products"}`
  - `409 Conflict`: `{"success": false, "message": "Product code 'SEC-104' already exists"}`
  - `422 Unprocessable Entity`: `{"success": false, "message": "Validation failed", "errors": [{"field": "name", "message": "Product name is required"}]}`

---

### 3.3 Get Product By ID
Fetches full product details including variants.

- **Method**: `GET`
- **URL**: `/products/:id`
- **Required Role**: `admin`, `staff`, `customer`
- **Request Body**: None
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Product found",
  "data": {
    "id": "672371a1a9234b8c912e0100",
    "name": "Cloud Infrastructure Suite",
    "slug": "cloud-infrastructure-suite",
    "code": "CIS-001",
    "category": "Cloud Services",
    "status": "active",
    "isRecurring": true,
    "variants": [
      {
        "id": "672371b2a9234b8c912e0110",
        "name": "Standard Compute",
        "sku": "CIS-STD-M",
        "price": "299.00",
        "currency": "USD",
        "billingCycle": "monthly",
        "isDefault": true,
        "status": "active"
      }
    ]
  }
}
```
- **Error Responses**:
  - `404 Not Found`: `{"success": false, "message": "Product not found"}`

---

### 3.4 Update Product
Updates top-level product attributes.

- **Method**: `PUT`
- **URL**: `/products/:id`
- **Required Role**: `admin`, `staff`
- **Request Body**:
```json
{
  "name": "Cloud Infrastructure Suite v2",
  "category": "Cloud Computing",
  "status": "active",
  "description": "Updated compute clusters with NVMe storage"
}
```
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "672371a1a9234b8c912e0100",
    "name": "Cloud Infrastructure Suite v2",
    "category": "Cloud Computing",
    "status": "active"
  }
}
```
- **Error Responses**:
  - `404 Not Found`: `{"success": false, "message": "Product not found"}`

---

### 3.5 Delete Product
Deletes or archives a product if no active subscriptions reference it.

- **Method**: `DELETE`
- **URL**: `/products/:id`
- **Required Role**: `admin`
- **Request Body**: None
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```
- **Error Responses**:
  - `403 Forbidden`: `{"success": false, "message": "Admin authorization required"}`
  - `409 Conflict`: `{"success": false, "message": "Cannot delete product referenced by active subscriptions. Archive it instead."}`

---

### 3.6 Add Product Variant
Creates a specific pricing/billing variant under a product.

- **Method**: `POST`
- **URL**: `/products/:id/variants`
- **Required Role**: `admin`, `staff`
- **Request Body**:
```json
{
  "name": "High-Memory Dedicated",
  "sku": "CIS-HIMEM-M",
  "price": "599.00",
  "currency": "USD",
  "billingCycle": "monthly",
  "attributes": [
    { "name": "RAM", "value": "64GB" },
    { "name": "vCPU", "value": "16" }
  ],
  "features": ["10Gbps Network", "Free Snapshots"],
  "isDefault": false
}
```
- **Response Structure** (`201 Created`):
```json
{
  "success": true,
  "message": "Variant created successfully",
  "data": {
    "id": "672371b2a9234b8c912e0111",
    "product": "672371a1a9234b8c912e0100",
    "name": "High-Memory Dedicated",
    "sku": "CIS-HIMEM-M",
    "price": "599.00",
    "currency": "USD",
    "billingCycle": "monthly",
    "status": "active"
  }
}
```
- **Error Responses**:
  - `409 Conflict`: `{"success": false, "message": "Variant with SKU 'CIS-HIMEM-M' already exists"}`

---

### 3.7 Update Product Variant
- **Method**: `PUT`
- **URL**: `/products/:id/variants/:variantId`
- **Required Role**: `admin`, `staff`
- **Request Body**:
```json
{
  "name": "High-Memory Dedicated (Updated)",
  "price": "649.00",
  "status": "active"
}
```
- **Response Structure** (`200 OK`): Returns updated variant details.

---

### 3.8 Delete Product Variant
- **Method**: `DELETE`
- **URL**: `/products/:id/variants/:variantId`
- **Required Role**: `admin`
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Variant removed successfully"
}
```

---

## 4. Plan Endpoints

### 4.1 List Plans
Retrieves subscription plans. Public plans are accessible to all; private plans require admin/staff auth.

- **Method**: `GET`
- **URL**: `/plans`
- **Required Role**: `admin`, `staff`, `customer` (public plans visible to unauthenticated)
- **Query Parameters**: `status`, `billingCycle`, `page`, `limit`
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Plans retrieved successfully",
  "data": [
    {
      "id": "672372c0a9234b8c912e0201",
      "name": "Growth Tier",
      "code": "PLAN-GROWTH",
      "basePrice": "199.00",
      "currency": "USD",
      "billingCycle": "monthly",
      "billingInterval": 1,
      "trialPeriodDays": 14,
      "setupFee": "0.00",
      "status": "active",
      "isPublic": true,
      "products": [
        {
          "product": "672371a1a9234b8c912e0100",
          "quantity": 1,
          "pricingType": "flat_fee"
        }
      ]
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

---

### 4.2 Create Plan
Creates a recurring subscription plan tier.

- **Method**: `POST`
- **URL**: `/plans`
- **Required Role**: `admin`
- **Request Body**:
```json
{
  "name": "Enterprise Suite",
  "code": "PLAN-ENT-YEAR",
  "description": "Complete corporate subscription with annual commitment",
  "basePrice": "11880.00",
  "currency": "USD",
  "billingCycle": "yearly",
  "billingInterval": 1,
  "trialPeriodDays": 30,
  "setupFee": "499.00",
  "status": "active",
  "isPublic": true,
  "taxRuleId": "672371f0a9234b8c912e0800",
  "bundledProducts": [
    {
      "productId": "672371a1a9234b8c912e0100",
      "variantId": "672371b2a9234b8c912e0110",
      "quantity": 5,
      "pricingType": "per_unit"
    }
  ]
}
```
- **Response Structure** (`201 Created`):
```json
{
  "success": true,
  "message": "Plan created successfully",
  "data": {
    "id": "672372c0a9234b8c912e0202",
    "name": "Enterprise Suite",
    "code": "PLAN-ENT-YEAR",
    "basePrice": "11880.00",
    "currency": "USD",
    "billingCycle": "yearly",
    "status": "active",
    "createdAt": "2026-10-31T06:00:00.000Z"
  }
}
```
- **Error Responses**:
  - `403 Forbidden`: `{"success": false, "message": "Only Administrators can configure plans"}`
  - `409 Conflict`: `{"success": false, "message": "Plan code 'PLAN-ENT-YEAR' already exists"}`

---

### 4.3 Get Plan By ID
- **Method**: `GET`
- **URL**: `/plans/:id`
- **Required Role**: `admin`, `staff`, `customer`
- **Response Structure** (`200 OK`): Full plan object with bundled products.

---

### 4.4 Update Plan
- **Method**: `PUT`
- **URL**: `/plans/:id`
- **Required Role**: `admin`
- **Request Body**:
```json
{
  "name": "Enterprise Suite (2026 Refresh)",
  "basePrice": "12500.00",
  "trialPeriodDays": 14,
  "status": "active"
}
```
- **Response Structure** (`200 OK`): Returns updated plan.

---

### 4.5 Deactivate Plan
- **Method**: `DELETE`
- **URL**: `/plans/:id`
- **Required Role**: `admin`
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Plan archived. Active subscribers will remain on their grandfathered terms."
}
```

---

## 5. Quotation Endpoints

### 5.1 List Quotations
- **Method**: `GET`
- **URL**: `/quotations`
- **Required Role**: `admin`, `staff`
- **Query Parameters**: `customer`, `status` (`draft`, `sent`, `accepted`, `rejected`, `converted`), `page`, `limit`
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Quotations retrieved successfully",
  "data": [
    {
      "id": "672373a0a9234b8c912e0301",
      "quotationNumber": "QT-2026-0001",
      "customer": {
        "id": "672370f1a9234b8c912e0002",
        "companyName": "Acme Technologies Inc."
      },
      "status": "sent",
      "currency": "USD",
      "subtotal": "1200.00",
      "discountTotal": "100.00",
      "taxTotal": "88.00",
      "totalAmount": "1188.00",
      "issueDate": "2026-10-20T00:00:00.000Z",
      "validUntil": "2026-11-20T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

---

### 5.2 Create Quotation
Generates a new commercial proposal with line items, tax computations, and discounts.

- **Method**: `POST`
- **URL**: `/quotations`
- **Required Role**: `admin`, `staff`
- **Request Body**:
```json
{
  "customerId": "672370f1a9234b8c912e0002",
  "validityDays": 30,
  "currency": "USD",
  "notes": "Includes initial provisioning and migration support",
  "lines": [
    {
      "productId": "672371a1a9234b8c912e0100",
      "variantId": "672371b2a9234b8c912e0110",
      "planId": "672372c0a9234b8c912e0201",
      "description": "Growth Tier Monthly Provisioning",
      "quantity": 2,
      "unitPrice": "299.00",
      "discountAmount": "0.00",
      "taxRuleId": "672371f0a9234b8c912e0800"
    }
  ]
}
```
- **Response Structure** (`201 Created`):
```json
{
  "success": true,
  "message": "Quotation generated successfully",
  "data": {
    "id": "672373a0a9234b8c912e0302",
    "quotationNumber": "QT-2026-0002",
    "status": "draft",
    "subtotal": "598.00",
    "discountTotal": "0.00",
    "taxTotal": "47.84",
    "totalAmount": "645.84",
    "validUntil": "2026-11-30T06:00:00.000Z"
  }
}
```

---

### 5.3 Get Quotation By ID
- **Method**: `GET`
- **URL**: `/quotations/:id`
- **Required Role**: `admin`, `staff`, `customer` (customer can only view their own)
- **Response Structure** (`200 OK`): Full quotation entity including all itemized lines.

---

### 5.4 Update Quotation
- **Method**: `PUT`
- **URL**: `/quotations/:id`
- **Required Role**: `admin`, `staff`
- **Condition**: Only quotations in `draft` status may be updated.
- **Request Body**: Same schema as Create Quotation.
- **Error Responses**:
  - `400 Bad Request`: `{"success": false, "message": "Cannot modify quotation in 'sent' or 'converted' status."}`

---

### 5.5 Send Quotation to Customer
Dispatches the formal quotation PDF and notification email to the customer contact.

- **Method**: `PATCH`
- **URL**: `/quotations/:id/send`
- **Required Role**: `admin`, `staff`
- **Request Body**:
```json
{
  "customEmailMessage": "Please review the attached formal quotation for your cloud tier."
}
```
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Quotation sent to customer successfully",
  "data": {
    "id": "672373a0a9234b8c912e0302",
    "status": "sent"
  }
}
```

---

### 5.6 Approve Quotation
Approves the quotation on behalf of the client or by an administrator.

- **Method**: `PATCH`
- **URL**: `/quotations/:id/approve`
- **Required Role**: `admin`, `customer` (owner)
- **Request Body**:
```json
{
  "approvalNotes": "Accepted by customer executive via portal"
}
```
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Quotation accepted",
  "data": {
    "id": "672373a0a9234b8c912e0302",
    "status": "accepted",
    "acceptedAt": "2026-10-31T06:30:00.000Z"
  }
}
```

---

### 5.7 Reject Quotation
- **Method**: `PATCH`
- **URL**: `/quotations/:id/reject`
- **Required Role**: `admin`, `customer` (owner)
- **Request Body**:
```json
{
  "reason": "Exceeds planned quarterly budget"
}
```
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Quotation rejected",
  "data": { "id": "672373a0a9234b8c912e0302", "status": "rejected" }
}
```

---

### 5.8 Convert Quotation to Active Subscription
Instantiates an active subscription, grandfathering all agreed quotation line prices.

- **Method**: `POST`
- **URL**: `/quotations/:id/convert`
- **Required Role**: `admin`, `staff`
- **Request Body**:
```json
{
  "startDate": "2026-11-01T00:00:00.000Z",
  "generateFirstInvoice": true
}
```
- **Response Structure** (`201 Created`):
```json
{
  "success": true,
  "message": "Quotation successfully converted to active subscription",
  "data": {
    "quotationId": "672373a0a9234b8c912e0302",
    "status": "converted",
    "subscription": {
      "id": "672374b0a9234b8c912e0401",
      "subscriptionNumber": "SUB-2026-0001",
      "status": "active",
      "nextBillingDate": "2026-12-01T00:00:00.000Z"
    },
    "invoice": {
      "id": "672375c0a9234b8c912e0501",
      "invoiceNumber": "INV-2026-0001",
      "amountDue": "645.84"
    }
  }
}
```

---

## 6. Subscription Endpoints

### 6.1 List Subscriptions
- **Method**: `GET`
- **URL**: `/subscriptions`
- **Required Role**: `admin`, `staff`
- **Query Parameters**: `customer`, `status` (`trialing`, `active`, `paused`, `past_due`, `cancelled`, `expired`), `billingCycle`, `page`, `limit`
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Subscriptions retrieved",
  "data": [
    {
      "id": "672374b0a9234b8c912e0401",
      "subscriptionNumber": "SUB-2026-0001",
      "customer": {
        "id": "672370f1a9234b8c912e0002",
        "companyName": "Acme Technologies Inc."
      },
      "plan": {
        "id": "672372c0a9234b8c912e0201",
        "name": "Growth Tier"
      },
      "status": "active",
      "billingCycle": "monthly",
      "currency": "USD",
      "currentPeriodStart": "2026-10-20T00:00:00.000Z",
      "currentPeriodEnd": "2026-11-20T00:00:00.000Z",
      "nextBillingDate": "2026-11-20T00:00:00.000Z",
      "autoRenew": true
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

---

### 6.2 Create Subscription
Directly provisions a subscription for a customer.

- **Method**: `POST`
- **URL**: `/subscriptions`
- **Required Role**: `admin`, `staff`
- **Request Body**:
```json
{
  "customerId": "672370f1a9234b8c912e0002",
  "planId": "672372c0a9234b8c912e0201",
  "startDate": "2026-11-01T00:00:00.000Z",
  "billingCycle": "monthly",
  "autoRenew": true,
  "discountId": "672376d0a9234b8c912e0701",
  "items": [
    {
      "productId": "672371a1a9234b8c912e0100",
      "variantId": "672371b2a9234b8c912e0110",
      "quantity": 1
    }
  ]
}
```
- **Response Structure** (`201 Created`):
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "id": "672374b0a9234b8c912e0402",
    "subscriptionNumber": "SUB-2026-0002",
    "status": "active",
    "startDate": "2026-11-01T00:00:00.000Z",
    "currentPeriodEnd": "2026-12-01T00:00:00.000Z"
  }
}
```

---

### 6.3 Get Subscription By ID
- **Method**: `GET`
- **URL**: `/subscriptions/:id`
- **Required Role**: `admin`, `staff`, `customer` (owner)
- **Response Structure** (`200 OK`): Full subscription entity including items and pricing snapshots.

---

### 6.4 Update Subscription
- **Method**: `PUT`
- **URL**: `/subscriptions/:id`
- **Required Role**: `admin`, `staff`
- **Request Body**:
```json
{
  "autoRenew": true,
  "defaultPaymentMethod": "card"
}
```
- **Response Structure** (`200 OK`): Returns updated subscription.

---

### 6.5 Pause Subscription
Temporarily halts automated recurring invoice generation.

- **Method**: `PATCH`
- **URL**: `/subscriptions/:id/pause`
- **Required Role**: `admin`, `staff`
- **Request Body**:
```json
{
  "pauseReason": "Seasonal business hiatus requested by customer"
}
```
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Subscription paused successfully",
  "data": {
    "id": "672374b0a9234b8c912e0401",
    "status": "paused",
    "pausedAt": "2026-10-31T06:00:00.000Z"
  }
}
```

---

### 6.6 Resume Subscription
Resumes a paused subscription and recalculates the next billing date.

- **Method**: `PATCH`
- **URL**: `/subscriptions/:id/resume`
- **Required Role**: `admin`, `staff`
- **Request Body**: None (`{}`)
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Subscription resumed",
  "data": {
    "id": "672374b0a9234b8c912e0401",
    "status": "active",
    "nextBillingDate": "2026-11-30T00:00:00.000Z"
  }
}
```

---

### 6.7 Cancel Subscription
Terminates a subscription immediately or at the end of the current paid period.

- **Method**: `PATCH`
- **URL**: `/subscriptions/:id/cancel`
- **Required Role**: `admin`, `staff`, `customer` (owner)
- **Request Body**:
```json
{
  "cancellationReason": "Transitioning to in-house solution",
  "immediate": false
}
```
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Subscription cancelled. Access remains active until period end.",
  "data": {
    "id": "672374b0a9234b8c912e0401",
    "status": "cancelled",
    "cancellationEffectiveDate": "2026-11-20T00:00:00.000Z"
  }
}
```

---

### 6.8 Get Customer's Own Subscriptions
- **Method**: `GET`
- **URL**: `/subscriptions/my`
- **Required Role**: `customer`
- **Response Structure** (`200 OK`): List of subscriptions belonging to the calling customer token.

---

## 7. Invoice Endpoints

### 7.1 List All Invoices
- **Method**: `GET`
- **URL**: `/invoices`
- **Required Role**: `admin`, `staff`
- **Query Parameters**: `customer`, `subscription`, `status` (`draft`, `issued`, `paid`, `partially_paid`, `overdue`, `void`, `refunded`), `page`, `limit`
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Invoices retrieved successfully",
  "data": [
    {
      "id": "672375c0a9234b8c912e0501",
      "invoiceNumber": "INV-2026-0091",
      "customer": {
        "id": "672370f1a9234b8c912e0002",
        "companyName": "Acme Technologies Inc."
      },
      "status": "paid",
      "issueDate": "2026-10-20T00:00:00.000Z",
      "dueDate": "2026-11-03T00:00:00.000Z",
      "currency": "USD",
      "totalAmount": "1188.00",
      "amountPaid": "1188.00",
      "amountDue": "0.00"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

---

### 7.2 Create Manual Invoice
Generates an off-cycle or manual service invoice.

- **Method**: `POST`
- **URL**: `/invoices`
- **Required Role**: `admin`, `staff`
- **Request Body**:
```json
{
  "customerId": "672370f1a9234b8c912e0002",
  "dueDate": "2026-11-15T00:00:00.000Z",
  "currency": "USD",
  "paymentTerms": "net_15",
  "notes": "Custom engineering hours for API integration",
  "lines": [
    {
      "description": "Senior DevOps Integration Assistance (10 hrs)",
      "quantity": 10,
      "unitPrice": "150.00",
      "taxRuleId": "672371f0a9234b8c912e0800"
    }
  ]
}
```
- **Response Structure** (`201 Created`):
```json
{
  "success": true,
  "message": "Invoice generated successfully",
  "data": {
    "id": "672375c0a9234b8c912e0502",
    "invoiceNumber": "INV-2026-0092",
    "status": "issued",
    "subtotal": "1500.00",
    "taxTotal": "120.00",
    "totalAmount": "1620.00",
    "amountDue": "1620.00"
  }
}
```

---

### 7.3 Get Invoice By ID
- **Method**: `GET`
- **URL**: `/invoices/:id`
- **Required Role**: `admin`, `staff`, `customer` (owner)
- **Response Structure** (`200 OK`): Full legal invoice structure with customer billing snapshot, itemized lines, and payment records.

---

### 7.4 Send Invoice By Email
Dispatches official invoice statement and payment portal link to customer.

- **Method**: `PATCH`
- **URL**: `/invoices/:id/send`
- **Required Role**: `admin`, `staff`
- **Request Body**: None (`{}`)
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Invoice PDF and payment link emailed to customer."
}
```

---

### 7.5 Void / Cancel Invoice
Voids an unpaid or disputed invoice.

- **Method**: `PATCH`
- **URL**: `/invoices/:id/void`
- **Required Role**: `admin`
- **Request Body**:
```json
{
  "reason": "Billing adjustment due to duplicate credit note"
}
```
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Invoice marked as void",
  "data": {
    "id": "672375c0a9234b8c912e0502",
    "status": "void",
    "voidedAt": "2026-10-31T06:00:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: `{"success": false, "message": "Cannot void an invoice that has already been settled/paid. Issue a refund instead."}`

---

### 7.6 Get Customer's Own Invoices
- **Method**: `GET`
- **URL**: `/invoices/my`
- **Required Role**: `customer`
- **Response Structure** (`200 OK`): Array of customer's own invoices.

---

## 8. Payment Endpoints

### 8.1 List All Payments
- **Method**: `GET`
- **URL**: `/payments`
- **Required Role**: `admin`
- **Query Parameters**: `status`, `customer`, `page`, `limit`
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Payments retrieved successfully",
  "data": [
    {
      "id": "672377e0a9234b8c912e0601",
      "paymentNumber": "PAY-2026-0001",
      "invoice": "672375c0a9234b8c912e0501",
      "customer": "672370f1a9234b8c912e0002",
      "amount": "1188.00",
      "currency": "USD",
      "status": "completed",
      "method": "card",
      "transactionId": "ch_3Nkd9820k9",
      "paidAt": "2026-10-20T00:05:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

---

### 8.2 Record or Process Payment
Records an offline payment (bank transfer, check) or executes card capture.

- **Method**: `POST`
- **URL**: `/payments`
- **Required Role**: `admin`, `staff`, `customer` (owner)
- **Request Body**:
```json
{
  "invoiceId": "672375c0a9234b8c912e0502",
  "amount": "1620.00",
  "method": "bank_transfer",
  "transactionId": "WIRE-20261031-9981",
  "gatewayProvider": "manual_wire",
  "paidAt": "2026-10-31T06:00:00.000Z"
}
```
- **Response Structure** (`201 Created`):
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "id": "672377e0a9234b8c912e0602",
    "paymentNumber": "PAY-2026-0002",
    "invoiceId": "672375c0a9234b8c912e0502",
    "amount": "1620.00",
    "status": "completed",
    "invoiceUpdatedStatus": "paid"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: `{"success": false, "message": "Payment amount ($1,620.00) exceeds current invoice balance due ($1,200.00)."}`

---

### 8.3 Get Payment By ID
- **Method**: `GET`
- **URL**: `/payments/:id`
- **Required Role**: `admin`, `staff`, `customer` (owner)
- **Response Structure** (`200 OK`): Full transaction and reconciliation audit.

---

### 8.4 Get Payments for an Invoice
- **Method**: `GET`
- **URL**: `/payments/invoice/:id`
- **Required Role**: `admin`, `staff`, `customer` (owner)
- **Response Structure** (`200 OK`): Array of payment attempts and settlements for the specific invoice.

---

### 8.5 Refund Payment
Issues a full or partial refund against a completed payment.

- **Method**: `POST`
- **URL**: `/payments/:id/refund`
- **Required Role**: `admin`
- **Request Body**:
```json
{
  "refundAmount": "1620.00",
  "reason": "Customer cancellation within 30-day satisfaction window"
}
```
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "id": "672377e0a9234b8c912e0602",
    "status": "refunded",
    "refundedAmount": "1620.00",
    "refundTransactionId": "re_8910kdba",
    "refundedAt": "2026-10-31T06:45:00.000Z"
  }
}
```

---

## 9. Discount Endpoints

### 9.1 List Discounts
- **Method**: `GET`
- **URL**: `/discounts`
- **Required Role**: `admin`, `staff`
- **Query Parameters**: `status` (`draft`, `active`, `expired`, `disabled`), `type` (`percentage`, `fixed_amount`), `page`, `limit`
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Discounts retrieved",
  "data": [
    {
      "id": "672376d0a9234b8c912e0701",
      "code": "GROWTH2026",
      "name": "Q4 Growth Incentive",
      "type": "percentage",
      "value": "15.00",
      "maxUses": 500,
      "usedCount": 42,
      "minOrderAmount": "100.00",
      "validFrom": "2026-10-01T00:00:00.000Z",
      "validUntil": "2026-12-31T23:59:59.000Z",
      "status": "active"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

---

### 9.2 Create Discount
- **Method**: `POST`
- **URL**: `/discounts`
- **Required Role**: `admin`
- **Request Body**:
```json
{
  "code": "LAUNCH50",
  "name": "New Tier Launch Special",
  "description": "50 USD flat discount on annual subscriptions",
  "type": "fixed_amount",
  "value": "50.00",
  "currency": "USD",
  "maxUses": 100,
  "minOrderAmount": "200.00",
  "validFrom": "2026-10-31T00:00:00.000Z",
  "validUntil": "2026-11-30T23:59:59.000Z",
  "status": "active"
}
```
- **Response Structure** (`201 Created`):
```json
{
  "success": true,
  "message": "Discount code created successfully",
  "data": {
    "id": "672376d0a9234b8c912e0702",
    "code": "LAUNCH50",
    "value": "50.00",
    "type": "fixed_amount",
    "status": "active"
  }
}
```
- **Error Responses**:
  - `409 Conflict`: `{"success": false, "message": "Discount code 'LAUNCH50' already exists"}`

---

### 9.3 Get Discount By ID
- **Method**: `GET`
- **URL**: `/discounts/:id`
- **Required Role**: `admin`, `staff`
- **Response Structure** (`200 OK`): Discount details and audit usage count.

---

### 9.4 Update Discount
- **Method**: `PUT`
- **URL**: `/discounts/:id`
- **Required Role**: `admin`
- **Request Body**:
```json
{
  "name": "Launch Special (Extended)",
  "maxUses": 250,
  "validUntil": "2026-12-15T23:59:59.000Z",
  "status": "active"
}
```
- **Response Structure** (`200 OK`): Returns updated discount.

---

### 9.5 Delete / Disable Discount
- **Method**: `DELETE`
- **URL**: `/discounts/:id`
- **Required Role**: `admin`
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Discount disabled successfully"
}
```

---

### 9.6 Validate Coupon Code
Validates whether a coupon code is eligible for an order subtotal.

- **Method**: `POST`
- **URL**: `/discounts/validate`
- **Required Role**: `admin`, `staff`, `customer`
- **Request Body**:
```json
{
  "code": "GROWTH2026",
  "orderSubtotal": "299.00",
  "planId": "672372c0a9234b8c912e0201"
}
```
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Coupon code is valid",
  "data": {
    "discountId": "672376d0a9234b8c912e0701",
    "code": "GROWTH2026",
    "type": "percentage",
    "value": "15.00",
    "calculatedDeduction": "44.85",
    "netSubtotal": "254.15"
  }
}
```
- **Error Responses**:
  - `404 Not Found`: `{"success": false, "message": "Discount code not found or expired"}`
  - `422 Unprocessable Entity`: `{"success": false, "message": "Order subtotal ($80.00) does not meet minimum order threshold ($100.00)"}`

---

## 10. Tax Endpoints

### 10.1 List Tax Rules
- **Method**: `GET`
- **URL**: `/taxes`
- **Required Role**: `admin`, `staff`, `customer`
- **Query Parameters**: `country`, `taxType` (`sales_tax`, `vat`, `gst`, `custom`), `status`
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Tax rules retrieved",
  "data": [
    {
      "id": "672371f0a9234b8c912e0800",
      "name": "California State Sales Tax",
      "code": "US-CA-ST",
      "taxType": "sales_tax",
      "rate": "8.5000",
      "country": "US",
      "state": "CA",
      "isCompound": false,
      "isInclusive": false,
      "status": "active"
    },
    {
      "id": "672371f0a9234b8c912e0801",
      "name": "EU Standard VAT",
      "code": "EU-VAT-STD",
      "taxType": "vat",
      "rate": "20.0000",
      "country": "DE",
      "isCompound": false,
      "isInclusive": true,
      "status": "active"
    }
  ]
}
```

---

### 10.2 Create Tax Rule
- **Method**: `POST`
- **URL**: `/taxes`
- **Required Role**: `admin`
- **Request Body**:
```json
{
  "name": "United Kingdom Standard VAT",
  "code": "GB-VAT-20",
  "taxType": "vat",
  "rate": "20.0000",
  "country": "GB",
  "isCompound": false,
  "isInclusive": false,
  "status": "active",
  "effectiveFrom": "2026-01-01T00:00:00.000Z"
}
```
- **Response Structure** (`201 Created`):
```json
{
  "success": true,
  "message": "Tax rule created successfully",
  "data": {
    "id": "672371f0a9234b8c912e0802",
    "name": "United Kingdom Standard VAT",
    "code": "GB-VAT-20",
    "rate": "20.0000",
    "status": "active"
  }
}
```
- **Error Responses**:
  - `409 Conflict`: `{"success": false, "message": "Tax rule code 'GB-VAT-20' already exists"}`

---

### 10.3 Get Tax Rule By ID
- **Method**: `GET`
- **URL**: `/taxes/:id`
- **Required Role**: `admin`, `staff`, `customer`
- **Response Structure** (`200 OK`): Tax rule details.

---

### 10.4 Update Tax Rule
- **Method**: `PUT`
- **URL**: `/taxes/:id`
- **Required Role**: `admin`
- **Request Body**:
```json
{
  "name": "California State Sales Tax (Updated)",
  "rate": "8.7500",
  "status": "active"
}
```
- **Response Structure** (`200 OK`): Returns updated tax rule. Active subscriptions retain their historical snapshot until renewal.

---

### 10.5 Delete / Deprecate Tax Rule
- **Method**: `DELETE`
- **URL**: `/taxes/:id`
- **Required Role**: `admin`
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Tax rule deprecated. Existing invoices preserve historical snapshots."
}
```

---

## 11. Reporting Endpoints

### 11.1 Revenue Analytics
Returns aggregate gross revenue, net collected revenue, refunds, and time-series billings.

- **Method**: `GET`
- **URL**: `/analytics/revenue`
- **Required Role**: `admin`
- **Query Parameters**:
  - `startDate` (optional, ISO date e.g. `2026-01-01`)
  - `endDate` (optional, ISO date e.g. `2026-10-31`)
  - `interval` (optional: `day`, `week`, `month`, default: `month`)
- **Request Body**: None
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Revenue analytics calculated",
  "data": {
    "summary": {
      "grossBilled": "542380.00",
      "netCollected": "498120.00",
      "totalRefunded": "12450.00",
      "currency": "USD"
    },
    "timeline": [
      {
        "period": "2026-08",
        "billed": "162000.00",
        "collected": "154000.00",
        "refunded": "2100.00"
      },
      {
        "period": "2026-09",
        "billed": "188200.00",
        "collected": "172400.00",
        "refunded": "4150.00"
      },
      {
        "period": "2026-10",
        "billed": "192180.00",
        "collected": "171720.00",
        "refunded": "6200.00"
      }
    ]
  }
}
```
- **Error Responses**:
  - `403 Forbidden`: `{"success": false, "message": "Only Administrators have access to financial reports."}`

---

### 11.2 Monthly Recurring Revenue (MRR)
Calculates normalized Monthly Recurring Revenue and breakdown across plan tiers.

- **Method**: `GET`
- **URL**: `/analytics/mrr`
- **Required Role**: `admin`
- **Request Body**: None
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "MRR calculated successfully",
  "data": {
    "currentMRR": "48250.00",
    "arrEquivalent": "579000.00",
    "currency": "USD",
    "growthPercentMonthOverMonth": 14.2,
    "breakdownByPlan": [
      {
        "planCode": "PLAN-ENT-YEAR",
        "planName": "Enterprise Suite",
        "mrrContribution": "29700.00",
        "activeSubscribers": 30
      },
      {
        "planCode": "PLAN-GROWTH",
        "planName": "Growth Tier",
        "mrrContribution": "18550.00",
        "activeSubscribers": 93
      }
    ]
  }
}
```

---

### 11.3 Subscription Growth Metrics
Tracks new subscriber acquisitions, active accounts, pauses, and renewals.

- **Method**: `GET`
- **URL**: `/analytics/subscriptions`
- **Required Role**: `admin`
- **Query Parameters**: `startDate`, `endDate`
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Subscription metrics calculated",
  "data": {
    "totalActive": 1248,
    "totalTrialing": 48,
    "totalPaused": 19,
    "totalCancelled": 54,
    "newSubscribersLast30Days": 142,
    "netSubscriberGrowthPercent": 8.4
  }
}
```

---

### 11.4 Churn Rate Metrics
Computes customer and revenue churn over the requested reporting period.

- **Method**: `GET`
- **URL**: `/analytics/churn`
- **Required Role**: `admin`
- **Query Parameters**: `periodMonths` (optional, default: `3`)
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Churn rate calculated",
  "data": {
    "customerChurnRatePercent": 1.8,
    "revenueChurnRatePercent": 1.2,
    "churnedSubscribersCount": 22,
    "lostRevenueAmount": "3450.00",
    "currency": "USD"
  }
}
```

---

### 11.5 Invoices & Accounts Receivable Summary
Audits unpaid, overdue, and pending settlements.

- **Method**: `GET`
- **URL**: `/analytics/invoices-summary`
- **Required Role**: `admin`
- **Response Structure** (`200 OK`):
```json
{
  "success": true,
  "message": "Invoice receivables summary retrieved",
  "data": {
    "outstandingReceivables": "24980.00",
    "overdueAmount": "6450.00",
    "overdueInvoicesCount": 8,
    "paidInvoicesCount": 420,
    "currency": "USD"
  }
}
```

---

## Document Metadata

- **Specification Version**: `1.0.0`
- **Status**: Complete & Standardized
- **Aligned With**:
  - Architecture: [ARCHITECTURE.md](file:///c:/Users/user/Desktop/Subscription-Management-system/docs/ARCHITECTURE.md)
  - Database Models: [DATABASE_SCHEMA.md](file:///c:/Users/user/Desktop/Subscription-Management-system/docs/DATABASE_SCHEMA.md)
  - Backend Mongoose Models: `server/src/models/`
  - Client API Client: `client/src/services/apiClient.ts`
