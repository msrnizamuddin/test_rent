# API List — Rent-A-Car Backend (test_rent)

Base URL: `{API_BASE_URL}/api/v1` (e.g. `http://localhost:8000/api/v1`)

Every module is mounted twice where noted:
- **`/web`** — Super Admin / Manager panel (not yet built as a frontend — this doc is the contract for it)
- **`/app`** — Customer / Driver mobile & web apps (this is what `rent_a_car` currently talks to)

Response envelope (all endpoints):
```json
{ "success": true, "message": "...", "data": { ... } }
{ "success": false, "message": "...", "errors": [{ "field": "...", "message": "..." }] }
```

Auth: `Authorization: Bearer <jwt>`. Roles: `superadmin`, `manager`, `driver`, `customer`.

Every module also exposes a **`GET /all`** endpoint: no filters, no pagination, returns every row. Public where the module's other list endpoint is already public; `superadmin`/`manager` gated where the data is private (PII, financial, or internal).

---

## 1. Auth (`/auth`) — mounted at both `/web` and `/app`

Covers spec modules 1.1 (Registration), 1.2 (Authentication), 1.3 (Profile), and staff/account management for modules 8 & 9.

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/customer` | none | Public self-signup. Always creates role `customer`. |
| POST | `/bootstrap-superadmin` | none + `SETUP_SECRET` | One-time; blocked once any superadmin exists. |
| POST | `/staff` | superadmin | Creates `manager`, `driver`, or another `superadmin`. **Only way to create a driver account** — no public driver signup. |
| POST | `/login` | none | `{ emailOrPhone, password }` → `{ token, user }`. Role comes from the account, not from any client-side toggle. |
| POST | `/logout` | any | |
| POST | `/forgot-password` | none | |
| POST | `/reset-password` | none | |
| PATCH | `/change-password` | any | |
| POST | `/verify-otp` | none | |
| POST | `/activate` | none | Account activation via emailed/SMS'd token. |
| PATCH | `/deactivate` | any | Self-deactivation. |
| GET | `/profile` | any | Own profile. |
| GET | `/users` | superadmin, manager | List all users (paginated/filterable — see also `GET /users/all`). |
| GET | `/users/:userId` | superadmin, manager | |
| PATCH | `/profile` | any | |
| PATCH | `/profile/picture` | any | |
| PATCH | `/profile/contact` | any | |
| PATCH | `/profile/address` | any | |
| PATCH | `/profile/driving-license` | any | |
| PATCH | `/profile/identification` | any | |
| PATCH | `/account/:userId` | superadmin | **Approval/status control for any account** — body accepts `role`, `permissions`, `centralStatus` (`active/inactive/suspended/blocked`), `driverStatus` (`pending/approved/rejected/available/assigned/on-trip/offline/suspended/inactive`). This is how the superadmin panel approves/rejects/activates/deactivates a driver (spec module 8) and sets Manager permissions (spec module 9). |

Not yet built: no `GET /users/all` literal safe-getAll route exists (the paginated `/users` is the closest equivalent) — add if the superadmin panel needs the unconditioned version.

---

## 2. Vehicle Category (`/vehicle-category`) — `/web` + `/app`

Spec module 20.

| Method | Path | Auth |
|---|---|---|
| GET | `/all` | none |
| GET | `/` | none — `?status=active|inactive` |
| GET | `/:categoryId` | none |
| POST | `/` | superadmin, manager |
| PATCH | `/:categoryId` | superadmin, manager |
| DELETE | `/:categoryId` | superadmin, manager — blocked (409) if vehicles reference it |

---

## 3. Vehicle (`/vehicle`) — `/web` + `/app`

Spec modules 2 (Browsing) & 7 (Entry & Approval).

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/all` | superadmin, manager | Every vehicle regardless of status (pending/rejected/maintenance included). |
| GET | `/` | none | Search/filter — only `available`/`assigned`/`on-trip` vehicles are publicly visible. Query: `search, brand, categoryId, location, vehicleType, seatingCapacity, minPrice, maxPrice, isAC, transmission, fuelType, availability, page, limit, sortBy, sortOrder`. |
| GET | `/:vehicleId` | none | Public detail — 404 if not publicly visible. |
| POST | `/` | superadmin, manager | Vehicle Entry. Defaults `availabilityStatus: "pending"`. |
| PATCH | `/:vehicleId` | superadmin, manager | **Approval workflow lives here** — set `availabilityStatus` to `approved/rejected/available/assigned/on-trip/maintenance/inactive` to approve/reject/activate/deactivate/block a vehicle (spec module 7). No dedicated `/approve`, `/reject` etc. endpoints — the superadmin panel should call this generic PATCH with the target status. |
| DELETE | `/:vehicleId` | superadmin, manager | |

Not yet built: per-document verify/reject (spec module 25) — `documents` is a flexible JSON array on the vehicle row with no per-document status field. Add a dedicated structure if the panel needs to verify individual documents rather than the whole vehicle.

---

## 4. Location (`/location`) — `/web` + `/app`

Spec module 21 (minus live Google Maps calls — see the **Maps** module for that).

| Method | Path | Auth |
|---|---|---|
| GET | `/all` | none |
| GET | `/` | none — `?search=&city=&type=pickup\|dropoff\|popular&isActive=` |
| GET | `/:locationId` | none |
| POST | `/` | superadmin, manager |
| PATCH | `/:locationId` | superadmin, manager |
| DELETE | `/:locationId` | superadmin, manager |

---

## 5. Maps (`/maps`) — `/web` + `/app`, all public

Spec modules 2 (search-by-location), 15.5 (Navigation), 16.6 (Trip Tracking), 21 (Google Maps/GPS/Distance). Server-side proxy over Google Maps Platform — **`GOOGLE_MAPS_API_KEY` lives only in the backend's `.env`**, never sent to any client.

| Method | Path | Query params | Notes |
|---|---|---|---|
| GET | `/autocomplete` | `input`, `sessionToken?` | Location search-bar suggestions. Restricted to `country:bd`. |
| GET | `/place-details` | `placeId`, `sessionToken?` | Resolves a picked suggestion to `formattedAddress`, `latitude`, `longitude`. |
| GET | `/geocode` | `address` | Free-text address → coordinates. |
| GET | `/distance` | `origin`, `destination` | Distance/duration estimate (spec module 5: Rental Estimate; module 16.6: live trip tracking ETA). |

Requires `GOOGLE_MAPS_API_KEY` in `.env` with Places API, Geocoding API, and Distance Matrix API enabled on that key's GCP project. Currently unset in this environment (returns a clean 500 until configured).

---

## 6. Rental Request (`/rental-request`) — `/web` + `/app`

Spec modules 3 (Trip Category), 4 (Rental Request), 10 (Customer Confirmation), 11 (Review), 12 (Confirmation), 13 (Vehicle/Driver Assignment).

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/` | any (customer) | Create. `tripType: single\|round\|down`. |
| GET | `/mine` | any | Own requests, paginated, `?status=`. |
| GET | `/` | superadmin, manager | List all, paginated/filterable. |
| GET | `/all` | superadmin, manager | Every request, no filters. |
| PATCH | `/:requestId/assign-vehicle` | superadmin, manager | Blocks overlapping-trip double-booking. |
| PATCH | `/:requestId/assign-driver` | superadmin, manager | Same overlap guard for drivers. |
| PATCH | `/:requestId/review` | superadmin, manager | Sets estimate / admin notes / call notes. |
| PATCH | `/:requestId/confirm` | superadmin, manager | Confirms request → creates the `Trip` row. |
| PATCH | `/:requestId/reject` | superadmin, manager | |
| PATCH | `/:requestId/cancel` | any (owner) | Customer-side cancellation — only while in a cancellable status. |
| GET | `/:requestId` | any | Owner or staff only. |

Status enum: `draft, submitted, under_review, estimate_provided, waiting_confirmation, confirmed, vehicle_assigned, driver_assigned, trip_started, trip_completed, cancelled, rejected` — this **is** the Cancellation module (spec 23) for pre-trip cancellations; see Trip module for post-confirmation cancellation.

---

## 7. Trip (`/trip`) — `/web` + `/app`

Spec module 14 (Trip Management), 15 (Driver Mobile App actions), 16.6 (Trip Tracking), 23 (post-confirmation Cancellation).

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/mine` | any (customer) | Paginated, `?status=`. |
| GET | `/assigned` | driver | Driver's assigned trips, `?status=`. |
| GET | `/` | superadmin, manager | List all, `?status=&driverId=&customerId=`, paginated. |
| GET | `/all` | superadmin, manager | Every trip, no filters. |
| PATCH | `/:tripId/driver-action` | driver | `{ action }` one of `accept, reject, on-the-way, arrived, picked-up, start, complete` — enforces valid status transitions. |
| PATCH | `/:tripId/location` | driver | `{ latitude, longitude }` — live location for spec 16.6. |
| PATCH | `/:tripId/cancel` | superadmin, manager | `{ reason }` — logged only (no `cancellationReason` column on `trips` yet, unlike `rental_requests`). |
| GET | `/:tripId` | any | Owner (customer/driver) or staff. |

---

## 8. Payment (`/payment`) — `/web` + `/app`

Spec module 17.

| Method | Path | Auth |
|---|---|---|
| GET | `/all` | superadmin, manager |
| POST | `/` | any |
| PATCH | `/:paymentId/status` | superadmin, manager |
| GET | `/mine` | any |
| GET | `/trip/:tripId` | any (owner or staff) |
| GET | `/` | superadmin, manager — paginated/filterable |
| POST | `/:paymentId/refund` | superadmin, manager |

Methods: `cash, online, mobile_banking, card`. Status: `pending, partial, paid, failed, refunded, cancelled`.

---

## 9. Invoice (`/invoice`) — `/web` + `/app`

Spec module 18.

| Method | Path | Auth |
|---|---|---|
| GET | `/all` | superadmin, manager |
| POST | `/generate` | superadmin, manager |
| GET | `/mine` | any |
| GET | `/trip/:tripId` | any (owner or staff) |
| GET | `/` | superadmin, manager — paginated |
| GET | `/:invoiceId` | any (owner or staff) |

---

## 10. Notification (`/notification`) — `/web` + `/app`

Spec module 19 (in-app channel only — SMS/email/push dispatch is a `TODO` in the model).

| Method | Path | Auth |
|---|---|---|
| GET | `/all` | superadmin, manager |
| GET | `/mine` | any — `?isRead=&page=&limit=` |
| PATCH | `/read-all` | any |
| PATCH | `/:notificationId/read` | any |
| DELETE | `/:notificationId` | any |
| POST | `/` | superadmin, manager — manual send |
| GET | `/` | superadmin, manager — paginated, `?userId=&channel=` |

---

## 11. Review (`/review`) — `/web` + `/app`

Spec module 26.

| Method | Path | Auth |
|---|---|---|
| POST | `/` | customer |
| GET | `/mine` | customer |
| GET | `/all` | superadmin, manager — includes hidden reviews |
| GET | `/driver/:driverId` | none — visible (non-hidden) reviews + average rating |
| GET | `/vehicle/:vehicleId` | none — same, for a vehicle |
| GET | `/` | superadmin, manager — paginated, `?driverId=&vehicleId=&isHidden=` |
| PATCH | `/:reviewId/hide` | superadmin, manager |
| PATCH | `/:reviewId/unhide` | superadmin, manager |
| DELETE | `/:reviewId` | superadmin, manager |

---

## 12. Vehicle Maintenance (`/maintenance`) — `/web` only

Spec module 24. **Superadmin/manager only — no `/app` mount.**

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/all` | superadmin, manager | |
| GET | `/` | superadmin, manager | `?vehicleId=&status=` |
| POST | `/` | superadmin, manager | Creating a record sets the vehicle's `availabilityStatus` to `maintenance`. |
| PATCH | `/:maintenanceId` | superadmin, manager | Setting `status: completed` or `cancelled` reverts the vehicle to `available`. |
| DELETE | `/:maintenanceId` | superadmin, manager | |
| GET | `/:maintenanceId` | superadmin, manager | |

Status enum: `scheduled, in_progress, completed, cancelled`.

---

## 13. Support Ticket (`/ticket`) — `/web` + `/app`

Spec module 27.

| Method | Path | Auth |
|---|---|---|
| POST | `/` | any (customer/driver) |
| GET | `/mine` | any |
| GET | `/all` | superadmin, manager |
| GET | `/` | superadmin, manager — `?status=&userId=` |
| PATCH | `/:ticketId/reply` | superadmin, manager |
| PATCH | `/:ticketId/status` | superadmin, manager |
| GET | `/:ticketId` | owner or staff |

Status enum: `open, in_progress, resolved, closed`.

---

## 14. Pricing Rule (`/pricing`) — `/web` + `/app`

Spec module 22.

| Method | Path | Auth |
|---|---|---|
| GET | `/all` | none — reads are public (frontend needs rates for estimates pre-login) |
| GET | `/` | none — `?tripType=&categoryId=&vehicleId=&isActive=` |
| GET | `/:pricingId` | none |
| POST | `/` | superadmin |
| PATCH | `/:pricingId` | superadmin |
| DELETE | `/:pricingId` | superadmin |

Fields: `perKmRate, perHourRate, perDayRate, driverCharge, waitingCharge, extraKmCharge, nightCharge, serviceCharge, taxPercent`, scoped by `tripType`/`categoryId`/`vehicleId` (any combination, most-specific-wins is a frontend/consumer decision — the API just stores and lists rules).

---

## 15. Setting (`/setting`) — `/web` + `/app`

Spec module 29 (General/Business/Notification settings only — Role & Permission settings live on `User.permissions`, see Auth module).

| Method | Path | Auth |
|---|---|---|
| GET | `/all` | none — every key as `{ key: value }` |
| GET | `/:key` | none — `key` one of `general, business, notification` |
| PATCH | `/:key` | superadmin |

`value` is an open JSON object per key (e.g. `general: { websiteName, logo, favicon, email, phone, address }`, `business: { currency, taxPercent, serviceCharge, cancellationPolicy }`).

---

## 16a. Dashboard (`/dashboard`) — `/web` only

Spec module 6.1 (Super Admin Dashboard). **Superadmin/manager only.**

| Method | Path | Notes |
|---|---|---|
| GET | `/stats` | Overview: totalUsers, totalVehicles, totalDrivers, totalManagers, pendingVehicleRequests, pendingDriverRequests, pendingRentalRequests, confirmedRentals, activeTrips, completedTrips, cancelledTrips, totalRevenue, todaysTrips, upcomingTrips, recentRequests (last 10). |

Kept as its own module, separate from Reports — it's the lightweight landing-page summary, not the drill-down analytics.

---

## 16b. Report (`/report`) — `/web` only

Spec module 28 (Reports & Analytics). **Superadmin/manager only.** Deliberately a separate module from Dashboard (16a) — different growth path (pagination, date-range filters, CSV export, per-manager "Assigned" scoping per spec module 32's permission table), so it shouldn't be coupled to the dashboard's simpler overview endpoint.

| Method | Path | Notes |
|---|---|---|
| GET | `/users` | totalUsers, activeUsers, newUsersLast30Days. |
| GET | `/vehicles` | totalVehicles, availableVehicles, rentedVehicles, maintenanceVehicles, mostRentedVehicles (top 5 by trip count). |
| GET | `/drivers` | totalDrivers, activeDrivers, availableDrivers, assignedDrivers, driverEarnings (per-driver completed-trip count + total earnings). |
| GET | `/trips` | totalTrips, singleTrips, roundTrips, downTrips, completedTrips, cancelledTrips, pendingTrips. |
| GET | `/financial` | totalRevenue, totalRefunded, dailyRevenue (24h), monthlyRevenue (30d), yearlyRevenue (365d). |

No write endpoints on either module — both only read and aggregate data owned by other modules.

---

## 17. Audit Log (`/audit-log`) — `/web` only

Spec module 30 (Audit Log / Admin Activity Log). **Superadmin only.**

| Method | Path | Notes |
|---|---|---|
| GET | `/all` | Every log row, no filters. |
| GET | `/` | Paginated, `?actorId=&action=&entityType=`. |

Fields per row: `actorId, action, entityType, entityId, metadata (json), ipAddress, createdAt`.

**Wired into login** — `auth.service.login` records `login.success`, `login.failed`, `login.blocked` (account inactive/suspended/blocked), and `account.auto_locked` (5 consecutive failed attempts trips `centralStatus -> suspended`) on every attempt. The model also exposes a `recordAuditLog({ actorId, action, entityType, entityId, metadata, ipAddress })` helper (`v1/modules/audit-log/service/audit-log.service.js`) for other modules to call — nothing else calls it yet (vehicle approval, account control, rental-request review/confirm/reject are still silent). Wire those in during the superadmin-panel integration pass if a fuller audit trail is wanted.

---

## 18. Document (`/document`) — `/web` + `/app`

Spec module 25 (Document Management) — per-file upload/verify/reject, distinct from the flexible `documents: Json[]` blob still on `User`/`Vehicle` rows (that blob has no per-file status and is left as-is).

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/` | any | `{ category, fileUrl, expiryDate?, ownerType?, ownerId? }`. Omitting `ownerType` uploads against the caller's own account (`ownerType: "user"`); `ownerType: "vehicle"` requires `ownerId` and is blocked for `customer` role. |
| GET | `/mine` | any | Own uploaded documents. |
| GET | `/all` | superadmin, manager | Every document, no filters. |
| GET | `/` | superadmin, manager | `?ownerType=&ownerId=&status=&category=` |
| GET | `/owner/:ownerType/:ownerId` | superadmin, manager | All documents for one user or vehicle. |
| PATCH | `/:documentId/verify` | superadmin, manager | |
| PATCH | `/:documentId/reject` | superadmin, manager | `{ rejectionReason }` |
| DELETE | `/:documentId` | superadmin, manager | |
| GET | `/:documentId` | any | |

Status enum: `pending, verified, rejected`. `category` is a free string (e.g. `nid, passport, driving_license, registration, fitness_certificate, insurance, tax_token, other`) — not enum-constrained, so the frontend/panel decide the exact category list per owner type.

---

## Spec coverage notes (what's intentionally not a separate module)

- **Module 6 (Super Admin Module)** → `/dashboard`.
- **Module 8 (Driver Management)** → driver entry is `/auth/staff`, approval/status is `/auth/account/:userId` (`driverStatus`).
- **Module 9 (Manager/Admin)** → manager entry is `/auth/staff`, permissions are `User.permissions` (json), edited via `/auth/account/:userId`.
- **Module 23 (Cancellation)** → pre-confirmation: `/rental-request/:id/cancel` (now wired into the customer frontend, see `rent_a_car`'s order detail page). Post-confirmation: `/trip/:id/cancel`.
- **Module 30 (Security & Audit)** → Role-Based Access Control is `authenticate`/`authorize` middleware everywhere; Password Hashing is bcrypt in `auth.model.js`; OTP Verification is the `/auth/verify-otp` flow; Login History / Failed Login Tracking / Account Blocking are the audit-log wiring described in Module 17 above; API Authentication is JWT via `authenticate`. Not built: a literal "Secure Document Access" gate beyond normal auth (documents are plain `fileUrl` strings — add signed/expiring URLs if documents shouldn't be link-shareable).

## Known follow-ups before superadmin-panel integration

1. Set a real `GOOGLE_MAPS_API_KEY` in `.env` (Places + Geocoding + Distance Matrix enabled).
2. Decide whether `/auth/users` needs a literal `/auth/users/all` (unconditioned) alongside the existing paginated version, for consistency with every other module.
3. Wire `recordAuditLog` into more admin mutation endpoints (vehicle approval, account control, rental-request review/confirm/reject) if a fuller audit trail is wanted beyond login events.
4. Documents are stored as plain URLs (`fileUrl`) — add signed/expiring URLs if uploaded documents (NID, licenses, etc.) shouldn't be accessible to anyone with the link.
