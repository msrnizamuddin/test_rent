# Testing Guide — Seeding Data & Walking Through the Full Flow

Your database only has the superadmin account right now, so the website
looks empty: no vehicle categories, no vehicles, no drivers. There's no
superadmin panel UI yet (that's a separate frontend, still to be built —
see `api-list.md`), so the only way to add this data today is by calling
the backend API directly. This guide gives you copy-pasteable commands to
seed enough data to test the whole customer + driver flow end to end.

Everything below assumes:
- Backend running at `http://localhost:8000` (`E:\Code\rentacarserver`)
- Frontend running at `http://localhost:3000` (`rent_a_car`)
- You're on Windows using PowerShell

---

## 0. A note on PowerShell and `curl`

PowerShell aliases `curl` to `Invoke-WebRequest`, which behaves
differently from real curl and makes JSON bodies annoying. Every command
below uses **`curl.exe`** explicitly (the real curl that ships with
Windows 10/11) to sidestep that — just copy them as-is.

If you'd rather click through requests visually, import these into
**Postman** or **Insomnia** instead — same URLs/bodies, just point-and-click.

---

## 1. Log in as superadmin and grab a token

```powershell
$resp = curl.exe -s -X POST http://localhost:8000/api/v1/auth/web/login `
  -H "Content-Type: application/json" `
  -d '{\"emailOrPhone\":\"01700000000\",\"password\":\"YOUR_SUPERADMIN_PASSWORD\"}' | ConvertFrom-Json

$token = $resp.data.token
Write-Host "Token acquired: $($token.Substring(0,20))..."
```

Replace `01700000000` / the password with your actual superadmin
credentials. Every command below reuses `$token` — run this first in the
same PowerShell session.

---

## 2. Create vehicle categories

You need at least one category before you can add a vehicle (categories
are required on every vehicle).

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

Note the printed category IDs (you'll need one per vehicle below).

---

## 3. Create vehicles

Repeat this for as many test vehicles as you want. `categoryId` must be
one of the IDs from step 2. `location.city` is what powers the homepage
search bar and `/products?location=` filter, so use real Bangladeshi city
names (Dhaka, Chattogram, Sylhet, etc.) to test that properly.

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
    fuelType = $fuel
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
no `availabilityStatus` (defaults to `pending`) and then separately call:

```powershell
$body = @{ availabilityStatus = "available" } | ConvertTo-Json
curl.exe -s -X PATCH "http://localhost:8000/api/v1/vehicle/web/<vehicleId>" `
  -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d $body
```

**Check it worked** — this is what the frontend's `/products` page calls:

```powershell
curl.exe -s http://localhost:8000/api/v1/vehicle/app/ | ConvertFrom-Json | Select -ExpandProperty data
```

---

## 4. Create a driver account

There's no public driver signup — a driver account only exists because a
superadmin creates one (this is intentional, matches spec module 8).

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
immediately assignable/testable, activate them. This endpoint requires
`updatedBy` (your own superadmin user id — grab it once with
`$me = (curl.exe -s http://localhost:8000/api/v1/auth/web/profile -H "Authorization: Bearer $token" | ConvertFrom-Json).data.id`):

```powershell
$me = (curl.exe -s http://localhost:8000/api/v1/auth/web/profile -H "Authorization: Bearer $token" | ConvertFrom-Json).data.id

# grab the new driver's id from the previous response's data.id, then:
$body = @{ driverStatus = "available"; centralStatus = "active"; updatedBy = $me } | ConvertTo-Json
curl.exe -s -X PATCH "http://localhost:8000/api/v1/auth/web/account/<driverId>" `
  -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d $body
```

You can now log in as this driver on the website at `/driver-login` with
`01811112222` / `password123`.

---

## 5. (Optional) Create a manager account

Same pattern, `role: "manager"`, no `drivingLicense` needed:

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
This part has no UI yet, so use the API directly (or Postman) with your
`$token` from step 1.

```powershell
# List all pending requests
curl.exe -s "http://localhost:8000/api/v1/rental-request/web/" -H "Authorization: Bearer $token" | ConvertFrom-Json

# Take the request id from above, then review it
$body = @{ estimatedRent = @{ total = 2800 } } | ConvertTo-Json -Depth 5
curl.exe -s -X PATCH "http://localhost:8000/api/v1/rental-request/web/<requestId>/review" `
  -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d $body

# Confirm it
curl.exe -s -X PATCH "http://localhost:8000/api/v1/rental-request/web/<requestId>/confirm" `
  -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d "{}"

# Assign the vehicle you created in step 3
$body = @{ vehicleId = "<vehicleId>" } | ConvertTo-Json
curl.exe -s -X PATCH "http://localhost:8000/api/v1/rental-request/web/<requestId>/assign-vehicle" `
  -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d $body

# Assign the driver you created in step 4
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
   support ticket (spec module 27); check it landed with:
   ```powershell
   curl.exe -s "http://localhost:8000/api/v1/ticket/web/" -H "Authorization: Bearer $token" | ConvertFrom-Json
   ```

---

## 9. Quick reference — safe "get everything" endpoints

Every module has a `GET /all` (or `GET /` for `/web`-only modules) that
returns every row with no filters — handy for eyeballing what's actually
in the database at any point while testing:

```powershell
curl.exe -s http://localhost:8000/api/v1/vehicle/app/all -H "Authorization: Bearer $token" | ConvertFrom-Json | Select -ExpandProperty data
curl.exe -s http://localhost:8000/api/v1/rental-request/web/all -H "Authorization: Bearer $token" | ConvertFrom-Json | Select -ExpandProperty data
curl.exe -s http://localhost:8000/api/v1/trip/web/all -H "Authorization: Bearer $token" | ConvertFrom-Json | Select -ExpandProperty data
```

See `api-list.md` for the full endpoint reference if you need anything
not covered here (pricing rules, maintenance records, documents, etc.).
