# Rent-A-Car Management System — API

Express 5 (ESM) + PostgreSQL backend for the rent-a-car platform: a web panel
for Super Admin/Manager, and mobile apps for Customers and Drivers.

## Stack

- **Runtime**: Node.js, Express 5, ESM (`"type": "module"`)
- **Database**: PostgreSQL, accessed via raw parameterized SQL through `pg`
  (no ORM). See `config/db.js` for the pool/query helper.
- **Auth**: JWT (`jsonwebtoken`), passwords hashed with `bcryptjs`
- **Validation**: Joi

## Getting started

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to your Postgres
   connection string, plus `JWT_SECRET` (and `SETUP_SECRET` for the one-time
   superadmin bootstrap endpoint).
2. Apply the schema: `npm run migrate` (runs `database/schema.sql`).
3. `npm run dev` to start the server with nodemon.

## Module structure

Every module under `v1/modules/<name>/` follows the same layout:

```
v1/modules/<name>/
  model/<name>.model.js       raw SQL queries against Postgres, snake_case ↔ camelCase mapping
  service/<name>.service.js   business logic, throws { statusCode, message } errors
  controller/<name>.controller.js  thin req/res wrapper around the service
  validation/<name>.validation.js  Joi schemas
  route/<name>.route.js       the actual endpoint definitions
  route/index.js              mounts the same router under both /web and /app
```

`route.js` at the project root auto-discovers every `v1/modules/<name>/route/index.js`
and mounts it at `/api/v1/<name>` — no manual wiring needed when adding a module.

### Web vs. mobile-app APIs

Every module exposes its endpoints **twice**: once under `/web` and once under
`/app`, e.g. `POST /api/v1/vehicle/web` and `POST /api/v1/vehicle/app` hit the
exact same controller today. This keeps the web panel (Super Admin/Manager)
and the mobile apps (Customer/Driver) on independently versionable URLs, so
either client's contract can diverge later without touching the other.

## Modules

| Module | Base path | Covers |
|---|---|---|
| `auth` | `/api/v1/auth` | registration, login, OTP, profile, staff/superadmin creation, role-based user management |
| `vehicle` | `/api/v1/vehicle` | browsing/search/filter, vehicle entry & approval |
| `vehicle-category` | `/api/v1/vehicle-category` | vehicle category CRUD |
| `location` | `/api/v1/location` | pickup/drop-off/popular locations |
| `rental-request` | `/api/v1/rental-request` | the core booking workflow: request → review → confirm → assign vehicle/driver |
| `trip` | `/api/v1/trip` | post-confirmation trip lifecycle, driver actions, live tracking |
| `payment` | `/api/v1/payment` | payment recording and status |
| `invoice` | `/api/v1/invoice` | invoice generation |
| `notification` | `/api/v1/notification` | in-app notifications |
| `review` | `/api/v1/review` | driver/vehicle ratings & reviews |

All write endpoints require `Authorization: Bearer <JWT>` and are
role-gated (`superadmin`, `manager`, `driver`, `customer`) via
`v1/middleware/authenticate.middleware.js`.
