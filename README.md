# 📦 Subscription Management System

A unified, full-stack Subscription Management System supporting **Admin**, **Staff**, and **Customer** roles.

---

## ✨ Features (Planned)

- 🔐 Role-based authentication (Admin / Staff / Customer)
- 👥 Staff management
- 📦 Product & variant management
- 📋 Subscription plans
- 💼 Quotation templates & customer quotations
- 🔄 Subscription lifecycle (activate, pause, cancel, renew)
- 🧾 Automatic recurring invoice generation
- 💳 Payment tracking
- 📊 Revenue & analytics dashboard
- 🏷️ Discount & tax management
- 🌐 Customer self-service portal

---

## 🛠️ Tech Stack

| Layer     | Technology                                |
|-----------|-------------------------------------------|
| Frontend  | React 18 · TypeScript · Vite · React Router |
| Styling   | Vanilla CSS with Custom Design System      |
| Backend   | Node.js · Express · TypeScript             |
| Database  | MongoDB (Mongoose)                         |
| Auth      | JWT (Access + Refresh tokens)              |
| Jobs      | node-cron                                  |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB ≥ 6 (local or Atlas)

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd subscription-management-system

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, and SMTP settings

# 3. Install all dependencies
npm run install:all

# 4. Start development servers
npm run dev
```

- **Client**: http://localhost:5173
- **Server**: http://localhost:5000
- **Health check**: http://localhost:5000/api/health

---

## 📁 Project Structure

```
subscription-management-system/
├── client/          # React + TypeScript frontend (Vite)
├── server/          # Express + TypeScript backend
├── docs/            # Architecture, API contracts, DB schema, guidelines
├── .env.example     # Environment variable template
├── .gitignore
└── package.json     # Root workspace scripts
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, tech stack, data flow |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | All MongoDB collection schemas |
| [API_CONTRACTS.md](docs/API_CONTRACTS.md) | All REST endpoint definitions |
| [TEAM_GUIDELINES.md](docs/TEAM_GUIDELINES.md) | Coding standards, git workflow, task roadmap |

---

## 📌 Task Roadmap

- [x] TASK 1 — Initialize project structure
- [ ] TASK 2 — User authentication
- [ ] TASK 3 — Staff management
- [ ] TASK 4 — Product & Variant management
- [ ] TASK 5 — Subscription plans
- [ ] TASK 6 — Tax & Discount management
- [ ] TASK 7 — Quotation management
- [ ] TASK 8 — Subscription lifecycle
- [ ] TASK 9 — Recurring invoice generation
- [ ] TASK 10 — Payment tracking
- [ ] TASK 11 — Revenue analytics
- [ ] TASK 12 — Customer self-service portal
