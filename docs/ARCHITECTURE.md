# 📐 Architecture Overview

## System Summary

The **Subscription Management System (SMS)** is a full-stack monorepo application that supports three user roles: **Admin**, **Staff**, and **Customer**. It is built with a React/TypeScript frontend and an Express/TypeScript backend backed by MongoDB.

---

## Technology Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Frontend     | React 18, TypeScript, Vite, React Router |
| Styling      | Vanilla CSS (CSS Variables + Custom Design System) |
| State Mgmt   | React Context API + Custom Hooks        |
| Backend      | Node.js, Express, TypeScript            |
| Database     | MongoDB (via Mongoose ODM)              |
| Auth         | JWT (Access + Refresh tokens)           |
| Scheduling   | node-cron (recurring billing jobs)      |
| Logging      | Winston                                 |
| Email        | Nodemailer                              |

---

## Repository Structure

```
subscription-management-system/
├── client/          # React + TypeScript frontend
├── server/          # Express + TypeScript backend
├── docs/            # Project documentation
├── .env.example     # Environment variable template
├── .gitignore
└── package.json     # Root workspace scripts
```

---

## Frontend Architecture

```
client/src/
├── components/
│   ├── ui/          # Atomic: Button, Input, Modal, Badge, etc.
│   ├── layout/      # AppShell, Sidebar, Topbar, Footer
│   └── shared/      # DataTable, Charts, EmptyState, Loader
├── pages/
│   ├── auth/        # Login, Register, ForgotPassword
│   ├── admin/       # Dashboard, Users, Products, Plans, Reports
│   ├── staff/       # Dashboard, Customers, Quotations, Subscriptions
│   └── customer/    # Portal, Subscriptions, Invoices, Profile
├── routes/          # Role-based route guards + router config
├── services/        # Axios API service layer (auth, users, etc.)
├── hooks/           # Custom React hooks (useAuth, usePagination)
├── context/         # AuthContext, ThemeContext, NotificationContext
├── types/           # TypeScript interfaces shared across the frontend
├── lib/             # Utility functions, date formatters, validators
└── App.tsx          # Root component with router + providers
```

---

## Backend Architecture

```
server/src/
├── config/          # env.ts, database.ts
├── models/          # Mongoose schemas (User, Product, Subscription, …)
├── controllers/     # Request handlers per domain
├── routes/          # Express route definitions per domain
├── services/        # Business logic layer (InvoiceService, etc.)
├── middleware/       # auth, errorHandler, notFound, validation
├── validators/      # express-validator rule sets
├── jobs/            # node-cron scheduled tasks (recurring billing)
├── utils/           # logger, apiResponse, dateHelpers
├── types/           # Shared TypeScript types & interfaces
├── app.ts           # Express app configuration
└── server.ts        # Entry point (DB connect + listen)
```

---

## Role-Based Access Control

| Permission                  | Admin | Staff | Customer |
|-----------------------------|:-----:|:-----:|:--------:|
| Manage Users                |  ✅   |  ❌   |    ❌    |
| Manage Staff                |  ✅   |  ❌   |    ❌    |
| Manage Products & Plans     |  ✅   |  ✅   |    ❌    |
| Manage Taxes & Discounts    |  ✅   |  ❌   |    ❌    |
| Create Quotations           |  ✅   |  ✅   |    ❌    |
| Approve Quotations          |  ✅   |  ❌   |    ❌    |
| View Own Subscriptions      |  ✅   |  ✅   |    ✅    |
| View Own Invoices           |  ✅   |  ✅   |    ✅    |
| View Revenue Analytics      |  ✅   |  ❌   |    ❌    |
| Self-Service Portal         |  ❌   |  ❌   |    ✅    |

---

## Data Flow

```
Browser → React App → Axios Service → Express API → Controller → Service → Mongoose → MongoDB
                                                         ↓
                                              node-cron (billing jobs)
                                                         ↓
                                               Nodemailer (emails)
```

---

## Authentication Flow

1. User `POST /api/auth/login` → receives `accessToken` (7d) + `refreshToken` (30d).
2. Client stores `accessToken` in memory and `refreshToken` in a `httpOnly` cookie.
3. All protected requests include `Authorization: Bearer <token>`.
4. On expiry, client calls `POST /api/auth/refresh` with the `refreshToken` cookie.

---

## Scheduled Jobs

| Job                  | Cron Expression | Description                              |
|----------------------|-----------------|------------------------------------------|
| Recurring Invoice    | `0 0 * * *`     | Generate invoices for due subscriptions  |
| Subscription Expire  | `0 1 * * *`     | Mark expired subscriptions               |
| Payment Reminders    | `0 9 * * *`     | Email reminders for upcoming payments    |
