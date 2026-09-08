# Testing Guide — Seeding Data & Walking Through the Full Flow

Your database only has the superadmin account right now, so the website
looks empty: no vehicle categories, no vehicles, no drivers. There's no
superadmin panel UI yet (that's a separate frontend, still to be built —
see `api-list.md`), so the only way to add this data today is by calling
the backend API directly. This guide gives every request as both a
PowerShell command **and** a plain Postman-ready block (Method + URL +
Headers + raw JSON body) so you can use whichever you prefer.

Everything below assumes:
- Backend running at `http://localhost:8000` (`E:\Code\rentacarserver`)
- Frontend running at `http://localhost:3000` (`rent_a_car`)
- You're on Windows using PowerShell, or Postman

**Every request in this guide has been run against a live copy of this
backend before being written down — not copied from memory.**

---

## 0. A note on PowerShell and `curl`

PowerShell aliases `curl` to `Invoke-WebRequest`, which behaves
differently from real curl and makes JSON bodies annoying. Every
PowerShell command below uses **`curl.exe`** explicitly (the real curl
that ships with Windows 10/11) to sidestep that — just copy them as-is.

**For Postman**, every step below gives you:
- **Method + URL**
- **Headers**: always `Content-Type: application/json`, plus
  `Authorization: Bearer <token>` once you have one (Auth tab → Bearer
  Token, or a raw header — either works)
- **Body → raw → JSON**: the exact object to paste in

---

## 1. Log in as superadmin and grab a token

**Postman:**
- `POST http://localhost:8000/api/v1/auth/web/login`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "emailOrPhone": "01700000000",
  "password": "YOUR_SUPERADMIN_PASSWORD"
}
```
- Response has your token at `data.token` — copy it, you'll paste it into
  the `Authorization: Bearer <token>` header of every request below.

**PowerShell:**
```powershell
$resp = curl.exe -s -X POST http://localhost:8000/api/v1/auth/web/login `
  -H "Content-Type: application/json" `
  -d '{\"emailOrPhone\":\"01700000000\",\"password\":\"YOUR_SUPERADMIN_PASSWORD\"}' | ConvertFrom-Json

$token = $resp.data.token
Write-Host "Token acquired: $($token.Substring(0,20))..."
```

Replace `01700000000` / the password with your actual superadmin
credentials. Every PowerShell command below reuses `$token` — run this
first in the same session.

---

## 2. Create vehicle categories

You need at least one category before you can add a vehicle (categories
are required on every vehicle).

**Postman:**
- `POST http://localhost:8000/api/v1/vehicle-category/web/`
- Headers: `Content-Type: application/json`, `Authorization: Bearer <token>`
- Body (raw JSON) — repeat with a different name for each category you want:
```json
{
  "name": "Sedan",
  "description": "Comfortable 4-door cars for city trips"
}
```
```json
{
  "name": "SUV",
  "description": "Spacious vehicles for families and hills"
}
```
```json
{
  "name": "Microbus",
  "description": "Group travel, 7-10 seats"
}
```
- Response's `data.id` is the category ID — note each one down, you need
  it in step 3.

**PowerShell:**
```powershell
function New-Category($name, $description) {
  $body = @{ name = $name; description = $description } | ConvertTo-Json
  $res = curl.exe -s -X POST http://localhost:8000/api/v1/vehicle-category/web/ `
    -H "Content-Type: application/json" `
    -H "Authorization: Bearer $token" `
    -d $body | ConvertFrom-Json
  Write-Host "$name -> $($res.data.id)"
  return $res.data.id
}

$sedanId    = New-Category "Sedan"    "Comfortable 4-door cars for city trips"
$suvId      = New-Category "SUV"      "Spacious vehicles for families and hills"
$microbusId = New-Category "Microbus" "Group travel, 7-10 seats"
```

---

## 3. Create vehicles

`categoryId` must be one of the IDs from step 2. `location.city` is what
powers the homepage search bar and `/products?location=` filter, so use
real Bangladeshi city names (Dhaka, Chattogram, Sylhet, etc.) to test that
properly. `vehicleType` must be one of: `sedan, suv, hatchback, microbus,
minibus, bus, pickup, van, coaster, other`.

**Postman:**
- `POST http://localhost:8000/api/v1/vehicle/web/`
- Headers: `Content-Type: application/json`, `Authorization: Bearer <token>`
- Body (raw JSON) — swap in a real `categoryId` from step 2, and repeat
  with different values for more vehicles:
```json
{
  "vehicleName": "Axio",
  "brand": "Toyota",
  "vehicleModel": "Axio",
  "categoryId": "PASTE_SEDAN_CATEGORY_ID_HERE",
  "vehicleType": "sedan",
  "registrationNumber": "DHA-1234",
  "modelYear": 2021,
  "seatingCapacity": 5,
  "fuelType": ["petrol"],
  "transmission": "automatic",
  "isAC": true,
  "location": { "city": "Dhaka" },
  "estimatedRentalRate": { "perDay": 2500 },
  "images": ["https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800"],
  "availabilityStatus": "available"
}
```
```json
{
  "vehicleName": "Pajero",
  "brand": "Mitsubishi",
  "vehicleModel": "Pajero",
  "categoryId": "PASTE_SUV_CATEGORY_ID_HERE",
  "vehicleType": "suv",
  "registrationNumber": "DHA-5678",
  "modelYear": 2022,
  "seatingCapacity": 7,
  "fuelType": ["diesel"],
  "transmission": "automatic",
  "isAC": true,
  "location": { "city": "Chattogram" },
  "estimatedRentalRate": { "perDay": 5500 },
  "images": ["https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800"],
  "availabilityStatus": "available"
}
```
```json
{
  "vehicleName": "Noah",
  "brand": "Toyota",
  "vehicleModel": "Noah",
  "categoryId": "PASTE_MICROBUS_CATEGORY_ID_HERE",
  "vehicleType": "microbus",
  "registrationNumber": "DHA-9012",
  "modelYear": 2020,
  "seatingCapacity": 8,
  "fuelType": ["petrol"],
  "transmission": "automatic",
  "isAC": true,
  "location": { "city": "Sylhet" },
  "estimatedRentalRate": { "perDay": 4200 },
  "images": ["https://images.unsplash.com/photo-1609520505218-7421df709fee?w=800"],
  "availabilityStatus": "available"
}
```
- Note each response's `data.id` — you'll need one for step 8.

**PowerShell:**
```powershell
function New-Vehicle($name, $brand, $model, $categoryId, $vehicleType, $regNo, $year, $seats, $fuel, $transmission, $city, $perDay) {
  $body = @{
    vehicleName = $name
    brand = $brand
    vehicleModel = $model
    categoryId = $categoryId
    vehicleType = $vehicleType
    registrationNumber = $regNo
    modelYear = $year
    seatingCapacity = $seats
    fuelType = @($fuel)  # array — a vehicle can have more than one fuel type now
    transmission = $transmission
    isAC = $true
    location = @{ city = $city }
    estimatedRentalRate = @{ perDay = $perDay }
    images = @("https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800")
    availabilityStatus = "available"
  } | ConvertTo-Json -Depth 5

  $res = curl.exe -s -X POST http://localhost:8000/api/v1/vehicle/web/ `
    -H "Content-Type: application/json" `
    -H "Authorization: Bearer $token" `
    -d $body | ConvertFrom-Json
  Write-Host "$name -> $($res.data.id)"
  return $res.data.id
}

New-Vehicle "Axio"   "Toyota" "Axio"   $sedanId    "sedan"    "DHA-1234" 2021 5 "petrol" "automatic" "Dhaka"      2500
New-Vehicle "Pajero"  "Mitsubishi" "Pajero" $suvId  "suv"      "DHA-5678" 2022 7 "diesel" "automatic" "Chattogram" 5500
New-Vehicle "Noah"    "Toyota" "Noah"   $microbusId "microbus" "DHA-9012" 2020 8 "petrol" "automatic" "Sylhet"     4200
```

Setting `availabilityStatus: "available"` directly skips the normal
pending→approved workflow (module 7) since you're seeding as superadmin.
If you want to test the **approval workflow itself**, instead create with
no `availabilityStatus` field at all (defaults to `pending`), then
separately approve it:

**Postman:** `PATCH http://localhost:8000/api/v1/vehicle/web/<vehicleId>`
```json
{ "availabilityStatus": "available" }
```

**PowerShell:**
```powershell
$body = @{ availabilityStatus = "available" } | ConvertTo-Json
curl.exe -s -X PATCH "http://localhost:8000/api/v1/vehicle/web/<vehicleId>" `
  -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d $body
```

**Check it worked** — this is what the frontend's `/products` page calls
(no auth needed, it's public):
- Postman: `GET http://localhost:8000/api/v1/vehicle/app/`
```powershell
curl.exe -s http://localhost:8000/api/v1/vehicle/app/ | ConvertFrom-Json | Select -ExpandProperty data
```

---

## 4. Create a driver account

There's no public driver signup — a driver account only exists because a
superadmin creates one (this is intentional, matches spec module 8).

**Postman:**
- `POST http://localhost:8000/api/v1/auth/web/staff`
- Headers: `Content-Type: application/json`, `Authorization: Bearer <token>`
```json
{
  "role": "driver",
  "fullName": "Karim Driver",
  "mobileNumber": "01811112222",
  "password": "password123",
  "drivingLicense": { "number": "DL-000111" }
}
```
- Note the response's `data.id` — that's the driver's user ID, needed below.
- `fatherName`, `motherName`, `dateOfBirth`, and NID (`identification: { type: "nid",
  number }`) are all optional here too — add them the same way as the vehicle fields
  above if you want a fully-filled-in test driver. See API_LIST.md §1.15 for the full
  shape, and §11 (Document Module) for uploading the driver's NID/license images and
  attaching them via §1.17a (`PATCH /auth/web/users/:userId`).

**PowerShell:**
```powershell
$body = @{
  role = "driver"
  fullName = "Karim Driver"
  mobileNumber = "01811112222"
  password = "password123"
  drivingLicense = @{ number = "DL-000111" }
} | ConvertTo-Json -Depth 5

curl.exe -s -X POST http://localhost:8000/api/v1/auth/web/staff `
  -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d $body
```

By default the new driver's `driverStatus` is `pending`. To make them
immediately assignable/testable, activate them. **This endpoint requires
an `updatedBy` field — your own superadmin user ID** (not documented
anywhere else, and not auto-filled server-side — found this the hard way
while verifying this guide). Get your own ID first:

**Postman:** `GET http://localhost:8000/api/v1/auth/web/profile` with
`Authorization: Bearer <token>` — response's `data.id` is your own user ID.

Then activate the driver:

**Postman:** `PATCH http://localhost:8000/api/v1/auth/web/account/<driverId>`
```json
{
  "driverStatus": "available",
  "centralStatus": "active",
  "updatedBy": "PASTE_YOUR_OWN_SUPERADMIN_USER_ID_HERE"
}
```

**PowerShell:**
```powershell
$me = (curl.exe -s http://localhost:8000/api/v1/auth/web/profile -H "Authorization: Bearer $token" | ConvertFrom-Json).data.id

# use the driver id from the previous response's data.id:
$body = @{ driverStatus = "available"; centralStatus = "active"; updatedBy = $me } | ConvertTo-Json
curl.exe -s -X PATCH "http://localhost:8000/api/v1/auth/web/account/<driverId>" `
  -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d $body
```

You can now log in as this driver on the website at `/driver-login` with
`01811112222` / `password123`.

**Assign this driver to one of the vehicles from step 3** (the persistent
fleet-level "this driver drives this car" pairing — separate from any
specific booking):

**Postman:** `PATCH http://localhost:8000/api/v1/vehicle/web/<vehicleId>`
```json
{ "assignedDriverId": "PASTE_DRIVER_ID_FROM_ABOVE" }
```

**PowerShell:**
```powershell
$body = @{ assignedDriverId = $driverId } | ConvertTo-Json
curl.exe -s -X PATCH "http://localhost:8000/api/v1/vehicle/web/<vehicleId>" `
  -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d $body
```

A driver can only be assigned to one vehicle at a time — assigning them to a second
vehicle while already assigned returns `409 Conflict`. Unassign first with
`{ "assignedDriverId": null }`, or see API_LIST.md §4 Step 4 for the full behavior
(including `ownerDriverId` for a driver's own personally-owned vehicle).

---

## 5. (Optional) Create a manager account

Same pattern, `role: "manager"`, no `drivingLicense` needed:

**Postman:** `POST http://localhost:8000/api/v1/auth/web/staff`
```json
{
  "role": "manager",
  "fullName": "Manager Rahim",
  "mobileNumber": "01911113333",
  "password": "password123",
  "permissions": {
    "vehicleManagement": true,
    "bookingManagement": true,
    "driverManagement": true
  }
}
```

**PowerShell:**
```powershell
$body = @{
  role = "manager"
  fullName = "Manager Rahim"
  mobileNumber = "01911113333"
  password = "password123"
  permissions = @{ vehicleManagement = $true; bookingManagement = $true; driverManagement = $true }
} | ConvertTo-Json -Depth 5

curl.exe -s -X POST http://localhost:8000/api/v1/auth/web/staff `
  -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d $body
```

There's no manager panel UI either yet, but this account can call every
`/web` endpoint that manager role is authorized for — useful if you're
testing the API directly rather than through a browser.

---

## 6. (Optional) Add pickup/drop-off locations

Only needed if you want to test the **Locations module** (`GET
/location/app/all`) separately from the Google Maps autocomplete (which
doesn't need this — see step 7).

**Postman:** `POST http://localhost:8000/api/v1/location/web/`
```json
{ "name": "Dhaka Airport", "city": "Dhaka", "type": "pickup" }
```
```json
{ "name": "Shahjalal International", "city": "Dhaka", "type": "popular" }
```
(`type` is one of `pickup`, `dropoff`, `popular`.)

**PowerShell:**
```powershell
function New-Location($name, $city, $type) {
  $body = @{ name = $name; city = $city; type = $type } | ConvertTo-Json
  curl.exe -s -X POST http://localhost:8000/api/v1/location/web/ `
    -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d $body
}

New-Location "Dhaka Airport" "Dhaka" "pickup"
New-Location "Shahjalal International" "Dhaka" "popular"
```

---

## 7. (Optional but recommended) Set your Google Maps key

The homepage search bar's location autocomplete needs a real key —
without it you'll see `500 Google Maps is not configured` in the backend
logs whenever you type in the From/To fields (this is expected, not a bug).

1. Get a key at https://console.cloud.google.com/google/maps-apis with
   **Places API**, **Geocoding API**, and **Distance Matrix API** enabled.
2. In `E:\Code\rentacarserver\.env`, set:
   ```
   GOOGLE_MAPS_API_KEY=your_real_key_here
   ```
3. Restart the backend (`node server.js`).

If you skip this, everything else still works — you just won't get
autocomplete suggestions while typing a location. Typing a full city name
and pressing on regardless still works for search/filtering since
`/products?location=` doesn't depend on Maps at all.

---

## 8. Now test the actual website, step by step

With the data above seeded, walk through the real customer → admin →
driver → customer loop:

### A. Customer side — browse and request
1. Go to `http://localhost:3000/`. You should now see real vehicles in the
   "জনপ্রিয় গাড়িসমূহ" section and in `/products`.
2. Sign up a new customer at `/customer-login` ("Create Account").
3. Browse `/products`, open a vehicle, click "এখনই কিনুন" (Buy Now) — this
   adds it to cart and takes you to `/checkout`.
4. Fill in the checkout form and submit. This calls
   `POST /rental-request/app/` and creates a request with status
   `submitted`.
5. Check `/dashboard/customer/orders` — your new request should appear.

### B. Superadmin side — review and confirm
This part has no UI yet, so use Postman or PowerShell with your token
from step 1.

**List all pending requests:**
- Postman: `GET http://localhost:8000/api/v1/rental-request/web/`
```powershell
curl.exe -s "http://localhost:8000/api/v1/rental-request/web/" -H "Authorization: Bearer $token" | ConvertFrom-Json
```

**Review it** (take the request id from the list above):
- Postman: `PATCH http://localhost:8000/api/v1/rental-request/web/<requestId>/review`
```json
{ "estimatedRent": { "total": 2800 } }
```
```powershell
$body = @{ estimatedRent = @{ total = 2800 } } | ConvertTo-Json -Depth 5
curl.exe -s -X PATCH "http://localhost:8000/api/v1/rental-request/web/<requestId>/review" `
  -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d $body
```

**Confirm it:**
- Postman: `PATCH http://localhost:8000/api/v1/rental-request/web/<requestId>/confirm`, body `{}`
```powershell
curl.exe -s -X PATCH "http://localhost:8000/api/v1/rental-request/web/<requestId>/confirm" `
  -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d "{}"
```

**Assign the vehicle you created in step 3:**
- Postman: `PATCH http://localhost:8000/api/v1/rental-request/web/<requestId>/assign-vehicle`
```json
{ "vehicleId": "PASTE_VEHICLE_ID_HERE" }
```
```powershell
$body = @{ vehicleId = "<vehicleId>" } | ConvertTo-Json
curl.exe -s -X PATCH "http://localhost:8000/api/v1/rental-request/web/<requestId>/assign-vehicle" `
  -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d $body
```

**Assign the driver you created in step 4:**
- Postman: `PATCH http://localhost:8000/api/v1/rental-request/web/<requestId>/assign-driver`
```json
{ "driverId": "PASTE_DRIVER_ID_HERE" }
```
```powershell
$body = @{ driverId = "<driverId>" } | ConvertTo-Json
curl.exe -s -X PATCH "http://localhost:8000/api/v1/rental-request/web/<requestId>/assign-driver" `
  -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d $body
```

Assigning a driver creates the real `Trip` row — after this the customer's
order status will change and a `Trip` will show up under the driver's
account.

### C. Driver side — accept and run the trip
1. Log in at `/driver-login` with the driver you created.
2. Go to `/dashboard/driver` — the assigned trip should appear.
3. Go to `/dashboard/driver/requests`, accept the trip.
4. Walk it through the status buttons (on-the-way → arrived → picked up →
   start → complete).

### D. Customer side — track, pay, review
1. Back on the customer account, `/dashboard/customer/orders/<id>` should
   now show live trip status.
2. Once the driver marks the trip complete, go back to the order detail
   page — a "Rate your trip" form should appear (this is the review
   feature, spec module 26).
3. Test cancellation on a *different*, still-pending request (before it's
   confirmed) — the Cancel button should appear on its detail page.
4. Test "Contact us" from the homepage FAQ section — submits a real
   support ticket (spec module 27); check it landed:
   - Postman: `GET http://localhost:8000/api/v1/ticket/web/`
   ```powershell
   curl.exe -s "http://localhost:8000/api/v1/ticket/web/" -H "Authorization: Bearer $token" | ConvertFrom-Json
   ```

---

## 9. Quick reference — safe "get everything" endpoints

Every module has a `GET /all` (or `GET /` for `/web`-only modules) that
returns every row with no filters — handy for eyeballing what's actually
in the database at any point while testing. All need
`Authorization: Bearer <token>` except where noted public:

```powershell
curl.exe -s http://localhost:8000/api/v1/vehicle/app/all -H "Authorization: Bearer $token" | ConvertFrom-Json | Select -ExpandProperty data
curl.exe -s http://localhost:8000/api/v1/rental-request/web/all -H "Authorization: Bearer $token" | ConvertFrom-Json | Select -ExpandProperty data
curl.exe -s http://localhost:8000/api/v1/trip/web/all -H "Authorization: Bearer $token" | ConvertFrom-Json | Select -ExpandProperty data
```

In Postman these are just `GET` requests to the same URLs with the same
`Authorization` header — no body needed on any `GET`.

See `api-list.md` for the full endpoint reference if you need anything
not covered here (pricing rules, maintenance records, documents, etc.).
