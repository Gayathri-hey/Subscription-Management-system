# 👥 Team Guidelines

## Code Style & Standards

### TypeScript
- Always define explicit types. Avoid `any`.
- Use `interface` for object shapes; `type` for unions and primitives.
- Export types from `src/types/index.ts` (both client and server).

### Naming Conventions
| Item               | Convention          | Example                     |
|--------------------|---------------------|-----------------------------|
| Files              | camelCase           | `userController.ts`         |
| React Components   | PascalCase          | `SubscriptionCard.tsx`      |
| CSS classes        | kebab-case          | `.subscription-card`        |
| Variables          | camelCase           | `currentUser`               |
| Constants          | UPPER_SNAKE_CASE    | `MAX_PAGE_SIZE`             |
| Mongoose models    | PascalCase          | `User`, `Subscription`      |
| API routes         | kebab-case          | `/api/subscription-plans`   |

---

## Git Workflow

1. Create a feature branch from `main`: `git checkout -b feat/task-name`
2. Use **Conventional Commits**:
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation changes
   - `refactor:` code clean-up
   - `test:` adding/updating tests
   - `chore:` tooling, config updates
3. Open a Pull Request against `main`. At least 1 reviewer required.
4. Squash-merge after approval.

---

## Folder Responsibilities

### Client (`client/src`)
| Folder        | What goes here                                     |
|---------------|----------------------------------------------------|
| `components/ui`      | Reusable atomic UI (Button, Input, Modal)   |
| `components/layout`  | App shell, Sidebar, Topbar                  |
| `components/shared`  | Domain-shared: DataTable, Charts, Loader    |
| `pages/admin`        | Admin-specific pages                        |
| `pages/staff`        | Staff-specific pages                        |
| `pages/customer`     | Customer portal pages                       |
| `services/`          | Axios API calls, one file per domain        |
| `hooks/`             | Custom hooks — prefix with `use`            |
| `context/`           | React Context providers                     |
| `types/`             | Frontend-only TypeScript types              |
| `lib/`               | Pure utility functions, no React            |

### Server (`server/src`)
| Folder          | What goes here                                     |
|-----------------|----------------------------------------------------|
| `models/`       | Mongoose schemas only, no business logic           |
| `controllers/`  | HTTP handlers — thin, delegate to services         |
| `services/`     | Business logic — testable, no Express types        |
| `routes/`       | Express Router definitions + middleware chains     |
| `middleware/`   | Auth guard, error handler, validation runner       |
| `validators/`   | express-validator rule arrays per endpoint         |
| `jobs/`         | node-cron scheduled tasks                          |
| `utils/`        | Pure helpers: logger, date, response formatters    |

---

## Environment Setup

1. Clone the repo.
2. Copy `cp .env.example .env` and fill in real values.
3. Ensure MongoDB is running locally (or update `MONGO_URI` to Atlas).
4. Run `npm run install:all` to install root + client + server deps.
5. Run `npm run dev` to start both dev servers concurrently.

---

## Task Roadmap

- [x] TASK 1 — Initialize project structure
- [ ] TASK 2 — User authentication (Register, Login, JWT, Role guard)
- [ ] TASK 3 — Staff management (CRUD)
- [ ] TASK 4 — Product & Variant management
- [ ] TASK 5 — Subscription plan management
- [ ] TASK 6 — Tax & Discount management
- [ ] TASK 7 — Quotation templates & customer quotations
- [ ] TASK 8 — Subscription lifecycle management
- [ ] TASK 9 — Recurring invoice generation (cron)
- [ ] TASK 10 — Payment tracking
- [ ] TASK 11 — Revenue analytics dashboard
- [ ] TASK 12 — Customer self-service portal
