# Vehicle Rental API Documentation

## Base API URL

```
http://localhost:8000/api/v1
```

Database: **PostgreSQL** (via Prisma). All IDs are **UUIDs** (not Mongo ObjectIds) — e.g. `f7d642a1-471a-44cb-a2db-9c2a3fcffdb3`.

---

## Web vs. App — every module is doubled

Every module below is mounted **twice**: once under `/web` and once under `/app`, e.g.

```
POST /api/v1/auth/web/login
POST /api/v1/auth/app/login
```

Both paths hit the exact same controller/business logic today — they exist so the Super
Admin/Manager **web panel** and the Customer/Driver **mobile apps** can be versioned or
restricted independently later without touching each other. Pick whichever reads better
for what you're building; for admin work use `/web`, for customer/driver-facing work use
`/app`. Every endpoint in this document should be read as `/<module>/web/...` **or**
`/<module>/app/...`.

---

## Authentication

The API uses JWT bearer-token authentication.

| Token | Description | Used for |
|---|---|---|
| `TOKEN_ADMIN` | Superadmin / Manager token | Administrative operations |
| `TOKEN_DRIVER` | Driver token | Driver-side trip actions |
| `TOKEN_USER` | Customer token | Customer profile & booking operations |

For protected endpoints, send the token in the request header:

```
Authorization: Bearer <TOKEN>
```

---

## 1. Auth Module

### Base URL
```
http://localhost:8000/api/v1/auth/{web|app}
```

### 1.1 Create the first Superadmin

There's no separate setup doc — it's a single API call, gated by a `SETUP_SECRET`
environment variable so it only works once (it also refuses if a superadmin already
exists).

**Endpoint**
```
POST /bootstrap-superadmin
```
**Authentication:** ❌ No token required (gated by `setupKey` instead)

**Request Body**
```json
{
  "setupKey": "<value of SETUP_SECRET in .env>",
  "fullName": "Admin",
  "mobileNumber": "01700000000",
  "email": "admin@example.com",
  "password": "SuperAdmin@123"
}
```

After this succeeds, log in normally to get `TOKEN_ADMIN`.

---

### 1.2 Login (Superadmin / Manager / Driver / Customer — same endpoint for all roles)

**Endpoint**
```
POST /login
```
**Authentication:** ❌ No token required

**Request Body**
```json
{
  "emailOrPhone": "01700000000",
  "password": "SuperAdmin@123"
}
```
`emailOrPhone` accepts either an email address or an 11-digit BD mobile number
(`01[3-9]XXXXXXXX`).

**Response**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<JWT>",
    "user": { "id": "<uuid>", "role": "superadmin", "...": "..." }
  }
}
```
Save `data.token` as `TOKEN_ADMIN` / `TOKEN_DRIVER` / `TOKEN_USER` depending on who
logged in, and save `data.user.id` — several admin endpoints below need it.

---

### 1.3 Customer Registration

**Endpoint**
```
POST /customer
```
**Authentication:** ❌ No token required

**Request Body**
```json
{
  "fullName": "Rakib Hasan",
  "mobileNumber": "01712345678",
  "email": "rakib@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "address": {
    "presentAddress": "House 12, Road 5, Dhanmondi",
    "city": "Dhaka",
    "district": "Dhaka",
    "country": "Bangladesh"
  }
}
```
**Response** includes `otpSent: true`. In non-production (`NODE_ENV !== "production"`)
the response also echoes the OTP code directly (`data.otp`) so you can verify without
wiring up SMS/email — see §1.6.

---

### 1.3b Driver Registration ("Become a Driver")

Public self-signup for drivers — no admin token needed to apply, unlike `POST /staff`
(§1.15). Unlike customer registration there's no OTP step: the account is created
immediately with `centralStatus: "active"` (login works right away) but
`isVerified: false` — the driver logs in, completes their profile (identification,
driving license, documents — see §1.10/§1.11/Document module §11) and calls
`POST /driver/submit-for-review` (§1.3c) once ready. A superadmin/manager then reviews
and approves from the Drivers list (`driverStatus: "approved"`, §1.18), which also flips
`isVerified` to `true`. Driver-only trip endpoints (`/trip/:tripId/driver-action`,
`/trip/:tripId/location`) and being assigned to a rental request both require
`isVerified: true` — an unverified driver gets a 403 explaining they need to submit
documents first.

**Endpoint**
```
POST /driver
```
**Authentication:** ❌ No token required

**Request Body**
```json
{
  "fullName": "Test Driver",
  "mobileNumber": "01712345678",
  "email": "testdriver@example.com",
  "licenseNumber": "DL-12345",
  "password": "DriverPass123"
}
```
`email` is optional; everything else is required. Rejected with `409` if a `User`
already exists with that mobile/email.

---

### 1.3c Driver: Submit Profile for Review

Marks a driver's profile ready for admin review — requires `identification` and
`drivingLicense` already set (§1.10/§1.11) and at least one uploaded `Document` row
(Document module §11, `ownerType: "user"`, no `ownerId` needed for self-upload).
Sets `profileSubmittedAt` so admin can see who's actually finished vs. just registered.

**Endpoint**
```
POST /driver/submit-for-review
```
**Authentication:** ✅ `TOKEN_DRIVER`

**Response** on missing prerequisites: `400` with a message naming what's missing
("Please add your NID/identification details first", etc.) — check each in order and
fix one at a time.

---

### 1.4 Verify OTP

Registration issues a 6-digit OTP (5-minute expiry, `purpose: "registration"`).

**Endpoint**
```
POST /verify-otp
```
**Authentication:** ❌ No token required

**Request Body**
```json
{
  "emailOrPhone": "01712345678",
  "code": "123456",
  "purpose": "registration"
}
```
`purpose` is one of `registration` | `login` | `reset-password` | `change-mobile`.

---

### 1.5 Get My Profile

**Endpoint:** `GET /profile`
**Authentication:** ✅ Any authenticated token

---

### 1.6 Update Profile

**Endpoint:** `PATCH /profile`
**Authentication:** ✅ Any authenticated token

```json
{ "fullName": "Rakib H. Chowdhury" }
```
Any updatable profile field may be sent (`fullName`, `email`, `mobileNumber`,
`address`, `drivingLicense`, `identification`, `profilePicture`) — at least one field
required.

---

### 1.7 Update Profile Picture

**Endpoint:** `PATCH /profile/picture`
**Authentication:** ✅ Any authenticated token
```json
{ "profilePicture": "https://cdn.example.com/uploads/dp123.jpg" }
```

---

### 1.8 Update Contact Information

**Endpoint:** `PATCH /profile/contact`
**Authentication:** ✅ Any authenticated token
```json
{ "email": "rakib.new@example.com" }
```
(`mobileNumber` may also be updated here — at least one field required.)

---

### 1.9 Update Address

**Endpoint:** `PATCH /profile/address`
**Authentication:** ✅ Any authenticated token
```json
{
  "presentAddress": "House 20, Road 8, Banani",
  "city": "Dhaka",
  "district": "Dhaka",
  "postCode": "1213",
  "country": "Bangladesh"
}
```

---

### 1.10 Update Driving License

**Endpoint:** `PATCH /profile/driving-license`
**Authentication:** ✅ Any authenticated token
```json
{
  "number": "DL-654321",
  "issueDate": "2021-03-10",
  "expiryDate": "2031-03-10"
}
```

---

### 1.11 Update Identification

**Endpoint:** `PATCH /profile/identification`
**Authentication:** ✅ Any authenticated token
```json
{ "type": "nid", "number": "1234567890123" }
```
`type` is `nid` or `passport`.

---

### 1.12 Change Password

**Endpoint:** `PATCH /change-password`
**Authentication:** ✅ Any authenticated token
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}
```

---

### 1.13 Forgot Password

**Endpoint:** `POST /forgot-password`
**Authentication:** ❌ No token required
```json
{ "emailOrPhone": "01712345678" }
```
Response includes `resetSent: true` and, outside production, `resetToken` directly —
save it for the next step.

---

### 1.14 Reset Password

**Endpoint:** `POST /reset-password`
**Authentication:** ❌ No token required
```json
{
  "resetPasswordToken": "<value from forgot-password response>",
  "newPassword": "password123",
  "confirmPassword": "password123"
}
```

---

### 1.15 Create Staff (Driver / Manager / another Superadmin)

**Endpoint:** `POST /staff`
**Authentication:** ✅ `TOKEN_ADMIN` (superadmin only)

**Create a Driver**
```json
{
  "role": "driver",
  "fullName": "Kamal Uddin",
  "fatherName": "Abdul Karim",
  "motherName": "Rahima Begum",
  "dateOfBirth": "1990-05-20",
  "mobileNumber": "01812345678",
  "email": "kamal@example.com",
  "password": "password123",
  "address": {
    "presentAddress": "Agrabad, Chattogram",
    "city": "Chattogram",
    "district": "Chattogram",
    "country": "Bangladesh"
  },
  "identification": { "type": "nid", "number": "9876543210123" },
  "drivingLicense": {
    "number": "DL-123456",
    "issueDate": "2020-01-01",
    "expiryDate": "2030-01-01"
  },
  "profilePicture": "https://res.cloudinary.com/.../avatar.jpg"
}
```
(`drivingLicense.number` is required when `role` is `"driver"`. `fatherName`, `motherName`,
`dateOfBirth`, and `profilePicture` are all optional.)

**Create a Manager**
```json
{
  "role": "manager",
  "fullName": "Nusrat Jahan",
  "mobileNumber": "01911223344",
  "email": "nusrat@example.com",
  "password": "password123",
  "permissions": {
    "userManagement": true,
    "vehicleManagement": true,
    "driverManagement": false,
    "bookingManagement": true,
    "paymentManagement": false,
    "reports": true,
    "settings": false
  }
}
```

> **Note:** unlike the old Mongo version, `createdBy` is **not** sent in the body — the
> server injects it from your `TOKEN_ADMIN` automatically. Sending it is ignored.

---

### 1.16 List Users

**Endpoint:** `GET /users`
**Authentication:** ✅ `TOKEN_ADMIN` (superadmin or manager)

**Optional query params:** `role`, `status`, `search`, `page`, `limit`
```
GET /users?role=customer&search=rakib&page=1&limit=20
```

---

### 1.17 Get User Details

**Endpoint:** `GET /users/:userId`
**Authentication:** ✅ `TOKEN_ADMIN`

---

### 1.17a Update User (Full Profile Edit)

**Endpoint:** `PATCH /users/:userId`
**Authentication:** ✅ `TOKEN_ADMIN` (superadmin or manager only)

Lets an admin edit any user's personal/document details directly — distinct from
§1.6 `updateProfile` (self-service only) and §1.18 below (role/status only, not
personal details). Every field is optional; send just what changed.
```json
{
  "fullName": "Kamal Uddin",
  "fatherName": "Abdul Karim",
  "motherName": "Rahima Begum",
  "dateOfBirth": "1990-05-20",
  "email": "kamal@example.com",
  "mobileNumber": "01812345678",
  "address": {
    "presentAddress": "Agrabad, Chattogram",
    "permanentAddress": "Agrabad, Chattogram",
    "city": "Chattogram",
    "district": "Chattogram",
    "postCode": "4100",
    "country": "Bangladesh"
  },
  "identification": {
    "type": "nid",
    "number": "9876543210123",
    "frontImage": "https://res.cloudinary.com/.../nid-front.jpg",
    "backImage": "https://res.cloudinary.com/.../nid-back.jpg",
    "expiryDate": "2030-01-01"
  },
  "drivingLicense": {
    "number": "DL-123456",
    "issueDate": "2020-01-01",
    "expiryDate": "2030-01-01",
    "frontImage": "https://res.cloudinary.com/.../dl-front.jpg",
    "backImage": "https://res.cloudinary.com/.../dl-back.jpg"
  },
  "profilePicture": "https://res.cloudinary.com/.../avatar.jpg"
}
```
`identification.type` is `"nid"` \| `"passport"`. Pair with the Document module
(§11) — upload the images there first, then put the returned `fileUrl` into
`frontImage`/`backImage`/`profilePicture` here.

---

### 1.18 Update Account Status / Role / Permissions

**Endpoint:** `PATCH /account/:userId`
**Authentication:** ✅ `TOKEN_ADMIN` (superadmin only)

**Suspend an account**
```json
{ "centralStatus": "suspended" }
```
`centralStatus` is `active` | `inactive` | `suspended` | `blocked`.

**Deactivate a driver (reason required)**
```json
{ "centralStatus": "inactive", "reason": "Suspected fake documents" }
```
Setting `centralStatus` to `"inactive"` specifically requires a `reason` — stored as
`inactiveReason` and shown back to the driver verbatim on their next blocked login
attempt instead of the generic "Account is inactive". `suspended`/`blocked` don't
require a reason. Moving `centralStatus` away from `"inactive"` again clears the stored
reason.

**Approve a driver (documents required)**
```json
{ "driverStatus": "approved" }
```
Rejected with `400` ("Cannot approve: this driver has no documents uploaded") unless the
driver has at least one `Document` row (see Document module §11). Succeeding also sets
`isVerified: true` on the driver — see §1.3b.

**Change role & permissions**
```json
{
  "role": "manager",
  "permissions": {
    "userManagement": true,
    "vehicleManagement": false,
    "driverManagement": true,
    "bookingManagement": false,
    "paymentManagement": false,
    "reports": false,
    "settings": false
  }
}
```
(`updatedBy` is likewise injected server-side now, not sent by the client.)

---

### 1.19 Deactivate Account

**Endpoint:** `PATCH /deactivate`
**Authentication:** ✅ Any authenticated token
```json
{ "userId": "<target user's id>", "reason": "Requested by customer" }
```

---

### 1.20 Activate Account

**Endpoint:** `POST /activate`
**Authentication:** ❌ No token required (uses a verification token instead)
```json
{ "userId": "<user id>", "verificationToken": "<token>" }
```

---

### 1.21 Logout

**Endpoint:** `POST /logout`
**Authentication:** ✅ Any authenticated token — no body required (stateless JWT; the
client just discards the token).

---

## 2. Vehicle Category Module

### Base URL
```
http://localhost:8000/api/v1/vehicle-category/{web|app}
```

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List categories (`?status=active`) |
| GET | `/:categoryId` | Public | Get one category |
| POST | `/` | `TOKEN_ADMIN` | Create a category |
| PATCH | `/:categoryId` | `TOKEN_ADMIN` | Update a category |
| DELETE | `/:categoryId` | `TOKEN_ADMIN` | Delete a category |

**Create**
```json
{
  "name": "Sedan",
  "description": "Standard 4-seat sedans",
  "image": "https://example.com/sedan.png",
  "status": "active"
}
```
Deleting a category that's still referenced by a vehicle returns **409** — reassign or
delete those vehicles first.

---

## 3. Location Module

### Base URL
```
http://localhost:8000/api/v1/location/{web|app}
```

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Search locations (`?search=&city=&type=&isActive=`) |
| GET | `/:locationId` | Public | Get one location |
| POST | `/` | `TOKEN_ADMIN` | Create a location |
| PATCH | `/:locationId` | `TOKEN_ADMIN` | Update a location |
| DELETE | `/:locationId` | `TOKEN_ADMIN` | Delete a location |

**Create**
```json
{
  "name": "Shahjalal International Airport",
  "address": "Kurmitola",
  "city": "Dhaka",
  "district": "Dhaka",
  "latitude": 23.8433,
  "longitude": 90.3978,
  "type": "popular",
  "isActive": true
}
```
`type` is `pickup` | `dropoff` | `popular`.

---

## 4. Vehicle Module

### Base URL
```
http://localhost:8000/api/v1/vehicle/{web|app}
```

### Step 1 — Search & Filter Vehicles

**Endpoint:** `GET /`
**Authentication:** ❌ Public

**Optional query parameters**

| Parameter | Type | Description |
|---|---|---|
| `search` | String | Matches vehicle name / brand |
| `brand` | String | Vehicle brand |
| `categoryId` | UUID | Vehicle category id (was `category` string in the old API — now a real FK) |
| `location` | String | Matches city / district / address |
| `vehicleType` | String | `sedan`, `suv`, `hatchback`, `microbus`, `minibus`, `bus`, `pickup`, `van`, `coaster`, `other` |
| `seatingCapacity` | Number | Minimum seats |
| `minPrice` / `maxPrice` | Number | Per-day rate range |
| `isAC` | Boolean | AC availability |
| `transmission` | String | `manual` \| `automatic` |
| `fuelType` | String or String[] | `petrol`, `diesel`, `cng`, `electric`, `hybrid` — a vehicle can have more than one (e.g. hybrid + electric); pass once for a single value or repeat the param (`fuelType=petrol&fuelType=diesel`) to match ANY of several |
| `availability` | String | `available`, `assigned`, `on-trip`, `maintenance` |
| `condition` | String | `new` \| `old` |
| `page` / `limit` | Number | Pagination |
| `sortBy` | String | `modelYear` \| `createdAt` (price sort not supported — see note below) |
| `sortOrder` | String | `asc` \| `desc` |

```
GET /?search=corolla&brand=toyota&categoryId=<uuid>&location=dhaka&vehicleType=sedan
    &seatingCapacity=4&minPrice=1000&maxPrice=5000&isAC=true&transmission=automatic
    &fuelType=petrol&fuelType=diesel&availability=available&page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

> Note: `sortBy=estimatedRentalRate.perDay` from the old docs is no longer supported —
> Prisma can't order by a path inside a JSON column, so price-sorted requests silently
> fall back to newest-first. Everything else behaves the same.

---

### Step 2 — View Vehicle Details

**Endpoint:** `GET /:vehicleId`
**Authentication:** ❌ Public
```
GET /f7d642a1-471a-44cb-a2db-9c2a3fcffdb3
```

---

### Step 3 — Add Vehicle

**Endpoint:** `POST /`
**Authentication:** ✅ `TOKEN_ADMIN` (superadmin or manager)

```json
{
  "vehicleName": "Toyota Corolla",
  "brand": "Toyota",
  "vehicleModel": "Corolla Altis",
  "categoryId": "<uuid from vehicle-category>",
  "vehicleType": "sedan",
  "images": ["https://example.com/corolla1.jpg"],
  "registrationNumber": "DHAKA-METRO-GA-1234",
  "modelYear": 2022,
  "seatingCapacity": 4,
  "fuelType": ["petrol"],
  "transmission": "automatic",
  "isAC": true,
  "condition": "new",
  "color": "White",
  "features": ["Bluetooth", "GPS", "Reverse Camera"],
  "location": { "address": "Gulshan 1", "city": "Dhaka", "district": "Dhaka" },
  "estimatedRentalRate": { "perDay": 3500, "perHour": 200, "perKm": 25 },
  "driverRequired": false,
  "ownerInfo": { "name": "Jamal Uddin", "contactNumber": "01711111111" },
  "availabilityStatus": "available"
}
```

> **Important — `categoryId` is required.** Create a vehicle category first (§2) and
> pass its `id` here — the old free-text `category` field no longer exists; categories
> are now a real table with a foreign key.

> **`condition`** is `"new"` or `"old"` (defaults to `"new"`) — new vehicles are priced
> higher than old ones in the same category. Used by the Pricing module (§14) to pick the
> right base/extra rates for a vehicle.

> **`fuelType` is an array**, not a single string — a vehicle can support more than one
> fuel type (e.g. `["hybrid", "electric"]`). At least one value required.

> **`location` and `estimatedRentalRate` are both optional** — omit either (or both) and
> fill them in later via Step 4.

If `availabilityStatus` is omitted, `"pending"` is applied automatically, and the
vehicle won't appear in public browsing (§ Step 1) until it's changed to `available`.

**Driver-owned vehicle:** to register a vehicle a driver personally brought (rather than
a company fleet vehicle), pass `ownerDriverId` (must be an existing user with
`role: "driver"`). Unless `assignedDriverId` is also given, the vehicle is automatically
assigned to its owner. See the assignment note under Step 4.

---

### Step 4 — Update Vehicle

**Endpoint:** `PATCH /:vehicleId`
**Authentication:** ✅ `TOKEN_ADMIN`
```json
{ "estimatedRentalRate": { "perDay": 4000 }, "availabilityStatus": "available" }
```
At least one field required. Same body shape as Step 3 (all fields optional here).

**Fleet-level driver assignment** — separate from RentalRequest's per-trip assignment;
this is the persistent "this driver drives this car" pairing:
```json
{ "assignedDriverId": "<driver's user id>" }
```
Pass `"assignedDriverId": null` to unassign. A driver can only be the `assignedDriver` of
**one vehicle at a time** — assigning a driver who's already assigned elsewhere is
rejected with `409 Conflict` ("This driver is already assigned to `<vehicle>`
(`<registration>`). Unassign it first.") rather than silently moving the assignment.

**Ownership** — `ownerDriverId` can likewise be set (must reference a `role: "driver"`
user) or cleared with `null`.

---

### Step 5 — Delete Vehicle

**Endpoint:** `DELETE /:vehicleId`
**Authentication:** ✅ `TOKEN_ADMIN`

---

### Health Check

**Endpoint:** `GET /health` — public, no auth, no body. Every module has this.

---

## 5. Rental Request Module — the core booking workflow

### Base URL
```
http://localhost:8000/api/v1/rental-request/{web|app}
```

This is new since the last version of this doc — it's the module that actually drives
a booking end to end: **customer submits → admin reviews/confirms → admin assigns
vehicle + driver → a Trip is auto-created** (see §6).

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | `TOKEN_USER` | Customer creates a rental request |
| GET | `/mine` | `TOKEN_USER` | Customer's own requests (`?status=&page=&limit=`) |
| GET | `/:requestId` | Any authenticated | Get one (owner customer, or admin) |
| PATCH | `/:requestId/cancel` | `TOKEN_USER` | Customer cancels their own request |
| GET | `/` | `TOKEN_ADMIN` | List all requests (`?status=&customerId=&page=&limit=`) |
| PATCH | `/:requestId/review` | `TOKEN_ADMIN` | Admin adds notes / adjusts estimate |
| PATCH | `/:requestId/confirm` | `TOKEN_ADMIN` | Admin confirms the request |
| PATCH | `/:requestId/assign-vehicle` | `TOKEN_ADMIN` | Assign a vehicle |
| PATCH | `/:requestId/assign-driver` | `TOKEN_ADMIN` | Assign a driver (auto-creates the Trip) |
| PATCH | `/:requestId/reject` | `TOKEN_ADMIN` | Reject the request |

**1) Create a rental request**
```json
{
  "tripType": "single",
  "vehicleId": "<uuid, optional>",
  "pickupLocation": { "city": "Dhaka", "address": "Gulshan 1" },
  "destination": { "city": "Chattogram" },
  "pickupDate": "2026-10-01",
  "pickupTime": "09:00",
  "passengerCount": 2,
  "driverRequired": false,
  "specialInstructions": "Please arrive 10 minutes early",
  "contactNumber": "01712345678",
  "offeredPrice": 2500
}
```
`tripType` is `single` | `round` | `down`. For `round` trips, `returnLocation`,
`returnDate`, and `returnTime` become required. The response includes a computed
`estimatedRent` breakdown (placeholder pricing model — flat per-km/service-charge
math, since there's no separate dynamic Pricing module yet). `offeredPrice` is
optional — the price the customer is proposing to pay, shown to the admin
alongside the system estimate so they can accept it as-is (pass it back as
`finalRent` on confirm) or counter with a different `finalRent`.

**2) Admin confirms**
```
PATCH /:requestId/confirm
```
```json
{ "finalRent": 2800 }
```

**3) Admin assigns a vehicle**
```json
{ "vehicleId": "<uuid>" }
```
Rejected with **409** if that vehicle is already booked for an overlapping date range.

**4) Admin assigns a driver**
```json
{ "driverId": "<uuid of a user with role \"driver\">" }
```
Same overlap protection. Once both vehicle and driver are assigned, a `Trip` row is
created automatically — the response includes `data.tripId`.

**Reject a request**
```json
{ "reason": "Vehicle unavailable for requested dates" }
```

---

## 6. Trip Module — post-confirmation lifecycle

### Base URL
```
http://localhost:8000/api/v1/trip/{web|app}
```

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/mine` | `TOKEN_USER` | Customer's own trips (`?status=&page=&limit=`) |
| GET | `/assigned` | `TOKEN_DRIVER` | Driver's assigned/active trips (`?status=`) |
| GET | `/:tripId` | Any authenticated | Get one (owner customer, assigned driver, or admin) |
| GET | `/` | `TOKEN_ADMIN` | List all trips (`?status=&driverId=&customerId=&page=&limit=`) |
| PATCH | `/:tripId/driver-action` | `TOKEN_DRIVER` | Advance the trip's status |
| PATCH | `/:tripId/location` | `TOKEN_DRIVER` | Update live GPS location |
| PATCH | `/:tripId/cancel` | `TOKEN_ADMIN` | Cancel a trip |

**Driver actions** — call in this order:
```json
{ "action": "accept" }
```
Valid `action` values: `accept`, `reject`, `on-the-way`, `arrived`, `picked-up`,
`start`, `complete` — each maps to the next trip status (`driver_accepted` →
`driver_on_the_way` → `destination_reached` → `customer_picked_up` → `trip_started` →
`trip_completed`). Skipping a step is rejected with **400**.

**Live location**
```json
{ "latitude": 23.8103, "longitude": 90.4125 }
```

**Cancel**
```json
{ "reason": "Customer no-show" }
```

---

## 7. Payment Module

### Base URL
```
http://localhost:8000/api/v1/payment/{web|app}
```

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Any authenticated | Record a payment |
| PATCH | `/:paymentId/status` | `TOKEN_ADMIN` | Update payment status |
| GET | `/mine` | `TOKEN_USER` | Customer's own payment history |
| GET | `/trip/:tripId` | Any authenticated | Payments for a trip (owner/driver/admin) |
| GET | `/` | `TOKEN_ADMIN` | List all payments (`?status=&method=&customerId=&page=&limit=`) |
| POST | `/:paymentId/refund` | `TOKEN_ADMIN` | Refund a payment |

**Record a payment**
```json
{
  "tripId": "<uuid>",
  "amount": 3000,
  "paymentType": "full",
  "method": "cash",
  "transactionId": "optional-gateway-ref"
}
```
`paymentType` is `advance` | `full`. `method` is `cash` | `online` | `mobile_banking` |
`card`. Staff (superadmin/manager) may also pass `"status": "paid"` to record a
payment already collected in person; customer-submitted payments always start
`"pending"`.

**Update status** (marking paid syncs the trip's `paymentStatus` automatically)
```json
{ "status": "paid", "transactionId": "TXN123" }
```

---

## 8. Invoice Module

### Base URL
```
http://localhost:8000/api/v1/invoice/{web|app}
```

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/generate` | `TOKEN_ADMIN` | Generate an invoice for a trip |
| GET | `/mine` | `TOKEN_USER` | Customer's own invoices |
| GET | `/trip/:tripId` | Any authenticated | Invoice for a trip (owner/admin) |
| GET | `/` | `TOKEN_ADMIN` | List all invoices (`?paymentStatus=&page=&limit=`) |
| GET | `/:invoiceId` | Any authenticated | Get one invoice by id |

**Generate**
```json
{
  "tripId": "<uuid>",
  "rentalCharge": 3000,
  "driverCharge": 0,
  "additionalCharges": 0,
  "tax": 0,
  "discount": 0
}
```
Fails with **409** if an invoice already exists for that trip. `paidAmount`/
`dueAmount`/`paymentStatus` are computed from the trip's recorded payments.

---

## 9. Notification Module

### Base URL
```
http://localhost:8000/api/v1/notification/{web|app}
```

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/mine` | Any authenticated | Own notifications (`?isRead=&page=&limit=`) |
| PATCH | `/:notificationId/read` | Any authenticated | Mark one read |
| PATCH | `/read-all` | Any authenticated | Mark all read |
| DELETE | `/:notificationId` | Any authenticated | Delete one |
| POST | `/` | `TOKEN_ADMIN` | Send a notification to a user |
| GET | `/` | `TOKEN_ADMIN` | List all notifications (`?userId=&channel=&page=&limit=`) |

**Send**
```json
{
  "userId": "<uuid>",
  "title": "Trip Confirmed",
  "message": "Your rental request has been confirmed.",
  "type": "rental_request_confirmed",
  "channel": "in_app"
}
```
`channel` is `push` | `in_app` | `sms` | `email` — this module persists/lists
in-app notifications; actual SMS/push/email dispatch isn't wired up yet.

---

## 10. Review Module

### Base URL
```
http://localhost:8000/api/v1/review/{web|app}
```

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | `TOKEN_USER` | Review a completed trip |
| GET | `/mine` | `TOKEN_USER` | Customer's own submitted reviews |
| GET | `/driver/:driverId` | Public | Driver's visible reviews + average rating |
| GET | `/vehicle/:vehicleId` | Public | Vehicle's visible reviews + average rating |
| GET | `/` | `TOKEN_ADMIN` | List all reviews, incl. hidden (`?driverId=&vehicleId=&isHidden=&page=&limit=`) |
| PATCH | `/:reviewId/hide` | `TOKEN_ADMIN` | Hide a review |
| PATCH | `/:reviewId/unhide` | `TOKEN_ADMIN` | Unhide a review |
| DELETE | `/:reviewId` | `TOKEN_ADMIN` | Permanently delete a review |

**Create**
```json
{
  "tripId": "<uuid of a trip_completed trip>",
  "driverRating": 5,
  "vehicleRating": 4,
  "reviewText": "Great, comfortable ride!"
}
```
At least one of `driverRating`/`vehicleRating` is required. The trip must belong to
the caller and be `trip_completed`. One review per (trip, customer) — a second attempt
returns **409**.

---

## 11. Document Module

Backs identity/license documents on a user and photos/paperwork on a vehicle — same
Cloudinary integration used by `profilePicture` elsewhere.

### Base URL
```
http://localhost:8000/api/v1/document/{web|app}
```

### Upload a file

**Endpoint:** `POST /upload`
**Authentication:** ✅ Any authenticated token
**Content-Type:** `multipart/form-data`

| Field | Required | Description |
|---|---|---|
| `file` | ✅ | The binary file |
| `ownerType` | ❌ | `"user"` \| `"vehicle"` — omit for "my own document" uploads made while creating a record whose id isn't known yet (e.g. a new driver's NID before the user exists) |
| `ownerId` | Required if `ownerType` is `"vehicle"`; optional if `"user"` | UUID of the vehicle, or of the user this document belongs to. For `ownerType: "user"`: omit to upload as yourself; superadmin/manager can pass another user's id to upload on their behalf (e.g. attaching a driver's NID from the driver's edit page). Anyone else passing someone else's id gets `403`. |
| `category` | ✅ | Free string — use `nid`, `passport`, `driving_license` for driver docs; `vehicle_photo`, `registration_copy`, `tax_token`, `fitness_certificate` for vehicle docs |
| `expiryDate` | ❌ | ISO date |

```
POST /document/web/upload
Content-Type: multipart/form-data

file=<binary>
ownerType=vehicle
ownerId=f7d642a1-471a-44cb-a2db-9c2a3fcffdb3
category=registration_copy
```

Response `data` includes the created Document record's `fileUrl` (the Cloudinary URL).

### Record a document you already have a URL for

**Endpoint:** `POST /`
**Authentication:** ✅ Any authenticated token
```json
{ "ownerType": "vehicle", "ownerId": "<vehicle id>", "category": "tax_token", "fileUrl": "https://res.cloudinary.com/.../tax-token.jpg" }
```
Same field rules as `/upload`, minus the file — you provide `fileUrl` directly.

### Other endpoints

| Endpoint | Description |
|---|---|
| `GET /mine` | Documents you uploaded for yourself (no `ownerType`/`ownerId` set) |
| `GET /all` | Every document (superadmin/manager) |
| `GET /?ownerType=&ownerId=&status=&category=` | Filtered search (superadmin/manager) |
| `GET /owner/:ownerType/:ownerId` | All documents for one owner (superadmin/manager) |
| `GET /:documentId` | Get one document |
| `PATCH /:documentId/verify` | Mark verified (superadmin/manager) |
| `PATCH /:documentId/reject` | Reject with `{ "rejectionReason": "..." }` (superadmin/manager) |
| `DELETE /:documentId` | Delete (superadmin/manager) |

---

## 12. Offer Module

Marketing promotions shown on the public website (e.g. an "Eid Special Offer" banner on
the homepage) — separate from RentalRequest/Trip discounts, purely promotional content the
admin panel manages and the customer-facing site reads.

### Base URL
```
http://localhost:8000/api/v1/offer/{web|app}
```

### List / filter offers

**Endpoint:** `GET /`
**Authentication:** ❌ Public
**Optional query params:** `status` (`active` \| `inactive`), `tripType` (`single` \| `round`
\| `down`)
```
GET /offer/app/?status=active
```

### Create offer

**Endpoint:** `POST /`
**Authentication:** ✅ `TOKEN_ADMIN` (superadmin or manager)
```json
{
  "title": "Eid Special Offer",
  "subtitle": "Save on every ride this Eid",
  "tripType": "round",
  "status": "active",
  "fromLocation": "Dhaka",
  "toLocation": "Chattogram",
  "discountType": "percentage",
  "discountValue": 10,
  "startDate": "2026-09-10",
  "endDate": "2026-09-20",
  "bannerImage": "https://res.cloudinary.com/.../banner.jpg",
  "offerText": "<p>Book now and <strong>save 10%</strong> on Eid trips.</p>"
}
```
Only `title` and `discountValue` are required — everything else is optional. `tripType`,
`fromLocation`/`toLocation` let an offer target a specific route; omit them for a
platform-wide offer. `discountType` is `"percentage"` (value 0-100) or `"fixed"` (a flat
amount) — `discountValue` means whichever `discountType` says. `bannerImage` and
`offerText` (rich HTML) are typically populated by uploading via the Document module
(§11, `POST /document/web/upload`, no `ownerType`/`ownerId` needed) and an image-embed step,
then passing the resulting URL(s) here.

**Note:** `discountValue` is a Postgres `Decimal` — it comes back from the API as a numeric
string (e.g. `"15"`), not a JS number, matching every other money-like field in this API
(Payment/Invoice `amount`, `total`, etc).

### Update / delete offer

**Endpoint:** `PATCH /:offerId` — same body shape as create, all fields optional, at least
one required. `DELETE /:offerId` removes it. Both `TOKEN_ADMIN` only.

### Get one / list everything

`GET /:offerId` (public) and `GET /all` (public, no filters — same "safe get everything"
pattern as every other module).

---

## 13. Tourist Spot Module

Common/basic fields for now (name, description, image, location, status) — same shape and
CRUD pattern as Vehicle Category (§2); expand as the feature grows.

### Base URL
```
http://localhost:8000/api/v1/tourist-spot/{web|app}
```

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List/filter (`?status=active\|inactive`) |
| GET | `/all` | Public | List everything |
| GET | `/:touristSpotId` | Public | Get one |
| POST | `/` | TOKEN_ADMIN | Create (`name` required) |
| PATCH | `/:touristSpotId` | TOKEN_ADMIN | Update |
| DELETE | `/:touristSpotId` | TOKEN_ADMIN | Delete |

```json
{
  "name": "Cox's Bazar",
  "description": "World's longest natural sea beach",
  "image": "https://res.cloudinary.com/.../coxsbazar.jpg",
  "location": "Chattogram",
  "status": "active"
}
```

---

## 14. Pricing Module

A base-package rate table (`PricingRule`) keyed by **vehicle category + vehicle condition**
(`new` or `old` — see Vehicle's `condition` field, §7). Each rule names a base package —
so much included time and distance for a flat price — plus overage rates for anything
beyond it:

| Field | Meaning | Example |
|---|---|---|
| `categoryId` | Which vehicle category this rule prices | Sedan |
| `vehicleCondition` | `new` or `old` — new vehicles are priced higher | `new` |
| `basePrice` | Flat price for the base package | ৳3,500 |
| `baseHours` | Hours included in the base package (a minimum booking block, not reduced if the trip is shorter) | 8 |
| `includedKm` | Distance included in the base package | 80 km |
| `extraKmCharge` | Rate per km once `includedKm` is exceeded | ৳20/km |
| `extraHourPrice` | Rate per hour once `baseHours` is exceeded | ৳200/hour |

**Total price** for a trip of `distanceKm`/`durationHours` in this category+condition:
```
total = basePrice
      + max(0, distanceKm - includedKm) * extraKmCharge
      + max(0, durationHours - baseHours) * extraHourPrice
```
e.g. a 217 km, 5-hour Dhaka→Chattogram trip in a new Sedan (base 8h/80km/৳3,500, extra
৳20/km, ৳200/hour): distance exceeds includedKm by 137 km (+৳2,740) but duration is under
baseHours (no extra-hour charge) → total ৳6,240. The public site computes this per vehicle
card once a route's distance/duration is known (Maps module, §9), then checks for a
matching active Offer (§12) and applies its discount on top before showing the final price.

### Base URL
```
http://localhost:8000/api/v1/pricing/{web|app}
```

### The customer-facing "view price" range (legacy, still supported)

A rule also carries `viewPriceLowOffset`/`viewPriceHighOffset` — flat amounts
subtracted/added to a `perKmRate`-based estimate for callers still using that older,
simpler per-km model. Both default to `100` on create if omitted. Not used by the
category+condition base-package flow above.

### List / filter pricing rules

**Endpoint:** `GET /`
**Authentication:** ❌ Public
**Optional query params:** `categoryId`, `vehicleCondition` (`new` \| `old`), `tripType`
(`single` \| `round` \| `down`), `vehicleId`, `isActive`
```
GET /pricing/app/?categoryId=<id>&vehicleCondition=new&isActive=true
```

### Create / update pricing rule

**Endpoint:** `POST /` (create) / `PATCH /:pricingId` (update)
**Authentication:** ✅ `TOKEN_ADMIN` (superadmin only)
```json
{
  "name": "Sedan - New",
  "categoryId": "<sedan-category-id>",
  "vehicleCondition": "new",
  "basePrice": 3500,
  "baseHours": 8,
  "includedKm": 80,
  "extraKmCharge": 20,
  "extraHourPrice": 200,
  "isActive": true
}
```
`name`, `categoryId`, `vehicleCondition`, `basePrice`, `baseHours`, `includedKm`,
`extraKmCharge`, and `extraHourPrice` are what the admin panel's Price Configuration screen
sets. `tripType`/`vehicleId`/`perKmRate`/`perHourRate`/`perDayRate`/`driverCharge`/
`waitingCharge`/`nightCharge`/`serviceCharge`/`taxPercent`/`viewPriceLowOffset`/
`viewPriceHighOffset` remain available for other/future pricing UIs and are left unset here.

### Get one / list everything / delete

`GET /:pricingId` (public), `GET /all` (public, no filters), `DELETE /:pricingId`
(`TOKEN_ADMIN`).

---

## 📋 Complete API Endpoint Summary

Every row below exists under both `/web` and `/app`.

### Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/bootstrap-superadmin` | Public + setupKey | Create the first superadmin |
| POST | `/login` | Public | Login (any role) |
| POST | `/customer` | Public | Register customer |
| POST | `/driver` | Public | Driver self-signup — active but unverified until admin approves (§1.3b) |
| POST | `/driver/submit-for-review` | TOKEN_DRIVER | Mark profile+documents ready for admin review (§1.3c) |
| POST | `/verify-otp` | Public | Verify OTP |
| POST | `/forgot-password` | Public | Request password reset |
| POST | `/reset-password` | Public | Reset password |
| POST | `/activate` | Public + token | Activate account |
| GET | `/profile` | Authenticated | Get profile |
| PATCH | `/profile` | Authenticated | Update profile |
| PATCH | `/profile/picture` | Authenticated | Update profile picture |
| PATCH | `/profile/contact` | Authenticated | Update contact |
| PATCH | `/profile/address` | Authenticated | Update address |
| PATCH | `/profile/driving-license` | Authenticated | Update driving license |
| PATCH | `/profile/identification` | Authenticated | Update identification |
| PATCH | `/change-password` | Authenticated | Change password |
| PATCH | `/deactivate` | Authenticated | Deactivate account |
| POST | `/logout` | Authenticated | Logout |
| POST | `/staff` | TOKEN_ADMIN | Create driver/manager/superadmin |
| GET | `/users` | TOKEN_ADMIN | List users |
| GET | `/users/:userId` | TOKEN_ADMIN | Get user |
| PATCH | `/users/:userId` | TOKEN_ADMIN (superadmin/manager) | Full profile edit for any user |
| PATCH | `/account/:userId` | TOKEN_ADMIN | Manage account status/role/permissions |

### Document — `/api/v1/document`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Authenticated | Record a document you already have a `fileUrl` for |
| POST | `/upload` | Authenticated | Upload a file (multipart) to Cloudinary and record it |
| GET | `/mine` | Authenticated | My own documents |
| GET | `/all` | TOKEN_ADMIN | List every document |
| GET | `/` | TOKEN_ADMIN | Search documents (`?ownerType=&ownerId=&status=&category=`) |
| GET | `/owner/:ownerType/:ownerId` | TOKEN_ADMIN | All documents for one owner |
| GET | `/:documentId` | Authenticated | Get one document |
| PATCH | `/:documentId/verify` | TOKEN_ADMIN | Mark a document verified |
| PATCH | `/:documentId/reject` | TOKEN_ADMIN | Reject a document (`rejectionReason` required) |
| DELETE | `/:documentId` | TOKEN_ADMIN | Delete a document |

### Offer — `/api/v1/offer`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List/filter offers (`?status=&tripType=`) |
| GET | `/all` | Public | List every offer |
| GET | `/:offerId` | Public | Get one offer |
| POST | `/` | TOKEN_ADMIN | Create offer |
| PATCH | `/:offerId` | TOKEN_ADMIN | Update offer |
| DELETE | `/:offerId` | TOKEN_ADMIN | Delete offer |

### Tourist Spot — `/api/v1/tourist-spot`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List/filter (`?status=`) |
| GET | `/all` | Public | List everything |
| GET | `/:touristSpotId` | Public | Get one |
| POST | `/` | TOKEN_ADMIN | Create |
| PATCH | `/:touristSpotId` | TOKEN_ADMIN | Update |
| DELETE | `/:touristSpotId` | TOKEN_ADMIN | Delete |

### Pricing — `/api/v1/pricing`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List/filter (`?tripType=&categoryId=&vehicleId=&isActive=`) |
| GET | `/all` | Public | List everything |
| GET | `/:pricingId` | Public | Get one |
| POST | `/` | TOKEN_ADMIN (superadmin) | Create |
| PATCH | `/:pricingId` | TOKEN_ADMIN (superadmin) | Update |
| DELETE | `/:pricingId` | TOKEN_ADMIN (superadmin) | Delete |

### Vehicle Category — `/api/v1/vehicle-category`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List categories |
| GET | `/:categoryId` | Public | Get category |
| POST | `/` | TOKEN_ADMIN | Create category |
| PATCH | `/:categoryId` | TOKEN_ADMIN | Update category |
| DELETE | `/:categoryId` | TOKEN_ADMIN | Delete category |

### Location — `/api/v1/location`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Search locations |
| GET | `/:locationId` | Public | Get location |
| POST | `/` | TOKEN_ADMIN | Create location |
| PATCH | `/:locationId` | TOKEN_ADMIN | Update location |
| DELETE | `/:locationId` | TOKEN_ADMIN | Delete location |

### Vehicle — `/api/v1/vehicle`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Browse & filter vehicles |
| GET | `/:vehicleId` | Public | Get vehicle details |
| POST | `/` | TOKEN_ADMIN | Add vehicle |
| PATCH | `/:vehicleId` | TOKEN_ADMIN | Update vehicle |
| DELETE | `/:vehicleId` | TOKEN_ADMIN | Delete vehicle |
| GET | `/health` | Public | Health check |

### Rental Request — `/api/v1/rental-request`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | TOKEN_USER | Create rental request |
| GET | `/mine` | TOKEN_USER | My rental requests |
| GET | `/:requestId` | Authenticated | Get one request |
| PATCH | `/:requestId/cancel` | TOKEN_USER | Cancel my request |
| GET | `/` | TOKEN_ADMIN | List all requests |
| PATCH | `/:requestId/review` | TOKEN_ADMIN | Review request |
| PATCH | `/:requestId/confirm` | TOKEN_ADMIN | Confirm request |
| PATCH | `/:requestId/assign-vehicle` | TOKEN_ADMIN | Assign vehicle |
| PATCH | `/:requestId/assign-driver` | TOKEN_ADMIN | Assign driver (creates Trip) |
| PATCH | `/:requestId/reject` | TOKEN_ADMIN | Reject request |

### Trip — `/api/v1/trip`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/mine` | TOKEN_USER | My trips |
| GET | `/assigned` | TOKEN_DRIVER | Driver's assigned trips |
| GET | `/:tripId` | Authenticated | Get one trip |
| GET | `/` | TOKEN_ADMIN | List all trips |
| PATCH | `/:tripId/driver-action` | TOKEN_DRIVER | Advance trip status |
| PATCH | `/:tripId/location` | TOKEN_DRIVER | Update live location |
| PATCH | `/:tripId/cancel` | TOKEN_ADMIN | Cancel trip |

### Payment — `/api/v1/payment`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Authenticated | Record payment |
| PATCH | `/:paymentId/status` | TOKEN_ADMIN | Update payment status |
| GET | `/mine` | TOKEN_USER | My payment history |
| GET | `/trip/:tripId` | Authenticated | Payments for a trip |
| GET | `/` | TOKEN_ADMIN | List all payments |
| POST | `/:paymentId/refund` | TOKEN_ADMIN | Refund payment |

### Invoice — `/api/v1/invoice`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/generate` | TOKEN_ADMIN | Generate invoice |
| GET | `/mine` | TOKEN_USER | My invoices |
| GET | `/trip/:tripId` | Authenticated | Invoice for a trip |
| GET | `/` | TOKEN_ADMIN | List all invoices |
| GET | `/:invoiceId` | Authenticated | Get invoice by id |

### Notification — `/api/v1/notification`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/mine` | Authenticated | My notifications |
| PATCH | `/read-all` | Authenticated | Mark all read |
| PATCH | `/:notificationId/read` | Authenticated | Mark one read |
| DELETE | `/:notificationId` | Authenticated | Delete notification |
| POST | `/` | TOKEN_ADMIN | Send notification |
| GET | `/` | TOKEN_ADMIN | List all notifications |

### Review — `/api/v1/review`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | TOKEN_USER | Create review |
| GET | `/mine` | TOKEN_USER | My reviews |
| GET | `/` | TOKEN_ADMIN | List all reviews |
| GET | `/driver/:driverId` | Public | Driver's reviews + rating |
| GET | `/vehicle/:vehicleId` | Public | Vehicle's reviews + rating |
| PATCH | `/:reviewId/hide` | TOKEN_ADMIN | Hide review |
| PATCH | `/:reviewId/unhide` | TOKEN_ADMIN | Unhide review |
| DELETE | `/:reviewId` | TOKEN_ADMIN | Delete review |

---

## 🔐 Recommended Testing Flow

For Postman/curl testing, follow this sequence — it exercises the whole system in
dependency order:

1. **Bootstrap the superadmin** — §1.1 (`POST /auth/web/bootstrap-superadmin`)
2. **Login as superadmin** — §1.2, save `TOKEN_ADMIN`
3. **Register + verify a customer** — §1.3 + §1.4, then login (§1.2) to save `TOKEN_USER`
4. **Test customer profile APIs** — §1.5–1.11, using `TOKEN_USER`
5. **Create a driver and a manager** — §1.15, using `TOKEN_ADMIN` (no `createdBy`
   needed — it's injected from the token now)
6. **Test user management** — §1.16–1.19, using `TOKEN_ADMIN`
7. **Create a vehicle category, then a vehicle** — §2 then §4 Step 3, using
   `TOKEN_ADMIN`. Create it with `"availabilityStatus": "available"` so it shows up
   in public browsing immediately.
8. **Test public vehicle browsing** — §4 Step 1/2, no token, test filters/pagination/sort
9. **Create a rental request as the customer** — §5, `POST /rental-request/app`
10. **Confirm it and assign a vehicle + driver as admin** — §5, note the `tripId`
    returned from `assign-driver`
11. **Drive the trip through its lifecycle** — §6, login as the driver (`TOKEN_DRIVER`)
    and call `driver-action` in order: `accept` → `on-the-way` → `arrived` →
    `picked-up` → `start` → `complete`
12. **Record a payment and mark it paid** — §7, then **generate an invoice** — §8
13. **Leave a review** — §10, as the customer, on the now-`trip_completed` trip
14. **Check notifications** — §9, `GET /notification/app/mine`
