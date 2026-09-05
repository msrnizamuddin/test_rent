# Rent-A-Car — Module Guide

What each of the 32 modules from the spec does, and where it's used: on the
customer/driver-facing website (`rent_a_car`) or the Super Admin/Manager
panel (not built yet — this doc doubles as its requirements). See
`api-list.md` for the exact endpoints each module exposes.

Legend: 🌐 = website (customer/driver), 🛡️ = superadmin/manager panel, ⚙️ = backend-only (no UI of its own; other modules use it).

---

### 1. User / Customer Module 🌐
Registration, login, and profile management for customers. On the website
this is signup/login (`/customer-login`), and the profile page where a
customer edits their name, address, driving license, and NID/passport
info. The superadmin panel uses the same user records to list, search, and
manage every account (customer, driver, manager) in one place — that's
where "View all users" lives, not a separate module.

### 2. Vehicle Browsing Module 🌐
Lets a visitor search and filter vehicles *before* they're logged in — by
name, brand, category, location, type, seating, price, AC, transmission,
fuel type, availability. This is the homepage search bar and the `/search`
results grid. The superadmin panel doesn't "browse" — it manages the
underlying vehicle records (see Module 7).

### 3. Trip Category Module 🌐
Not a page of its own — it's the three trip shapes (Single, Round, Down)
a customer picks while booking. Drives which fields the booking form shows
(a Round Trip needs a return date/time, a Down Trip doesn't). Used at
checkout/booking on the website; the superadmin panel sees the chosen
trip type when reviewing a request but doesn't set it.

### 4. Rental Request Module 🌐 + 🛡️
The core booking flow. On the website, a customer fills in vehicle, trip
type, locations, dates, and submits — this creates a *request*, not a
confirmed booking. The customer's dashboard ("My Orders") lists their own
requests and their status. On the superadmin panel, this is the incoming
queue every request lands in before it becomes a real trip — the panel's
main "Rental Requests" table lives here.

### 5. Rental Estimate Module 🌐 + 🛡️
The price shown to the customer right after they submit a request —
base rate, distance charge, driver charge, taxes, total. Shown on the
booking confirmation screen on the website. Marked as *estimated* because
the superadmin can adjust it before final confirmation (see Module 11).
Backed by the Pricing module's rate rules (22) where configured, with a
placeholder calculation where it isn't yet.

### 6. Super Admin Module 🛡️
The Super Admin's home screen — total users, vehicles, drivers, managers,
pending requests of every kind, active/completed/cancelled trip counts,
today's and upcoming trips, total revenue, and a recent-requests feed.
Pure superadmin panel; nothing on the website. Backed by the `dashboard`
module's `GET /stats`.

### 7. Vehicle Entry & Approval Module 🛡️ (website only *displays* the result)
Where vehicles get added to the fleet and reviewed before they're
bookable — Pending → Approved/Rejected → Available/Assigned/On Trip/
Maintenance/Inactive/Blocked. Entirely a superadmin/manager job. The
website never adds a vehicle; it only ever sees vehicles that have already
been approved (Module 2's browsing only shows `available`/`assigned`/
`on-trip` vehicles — a pending or rejected one is invisible to customers).

### 8. Driver Management Module 🛡️
Adding drivers and approving/activating/suspending them. There's no public
"become a driver" signup — a driver account only exists because a Super
Admin created one, which the website's Driver Login page is explicit about
(it collects an application and tells the person their account isn't
self-service). The panel's Driver list, approval queue, and status
controls live here.

### 9. Manager / Admin Module 🛡️
The Manager role itself — a cut-down Super Admin. Manager accounts are
created by the Super Admin with a permissions toggle per area (users,
vehicles, drivers, bookings, payments, reports, settings). This *is* the
panel's own role system, not something the website touches at all.

### 10. Rental Request Review Module 🛡️
The Super Admin/Manager's workspace for a single incoming request: see the
customer's info, call them, verify what they actually need, adjust the
estimate, then approve/reject/ask for more info. This is the detail view
behind Module 4's request list on the panel side.

### 11. Customer Confirmation Module 🛡️
The step after review — logging the outcome of the phone call (notes,
final agreed price, confirm or reject the booking, cancellation reason if
rejected). Purely an admin action; the website customer sees the *result*
(their request moving to "Confirmed") but doesn't do anything here
themselves.

### 12. Vehicle Assignment Module 🛡️
Once a request is confirmed, the admin picks which physical vehicle
fulfills it, with a built-in guard against double-booking a vehicle across
overlapping trip windows. Panel-only; the website customer just sees
"Vehicle Assigned" appear in their booking status.

### 13. Driver Assignment Module 🛡️
Same idea as Module 12, for drivers — same overlap protection so one
driver can't be on two trips at once. Panel-only.

### 14. Trip Management Module 🌐 (driver + customer) + 🛡️
Once a request is confirmed, it becomes a Trip with its own detailed
status ladder (Confirmed → ... → Driver Accepted → On The Way → Picked Up
→ Started → In Progress → Destination Reached → Completed, or Cancelled).
The website's customer and driver dashboards both read this — customers
track their trip, drivers advance it through the ladder. The superadmin
panel gets the full list of every trip across every customer/driver.

### 15. Driver Mobile App 🌐 (driver side of the website)
Everything a driver needs day-to-day: login, dashboard (today's/upcoming
trips, active trip, earnings), the assigned-trip detail screen, the
accept/reject/on-the-way/arrived/picked-up/start/complete action buttons,
navigation (see Module 21's Maps), and trip history. This is the
`/dashboard/driver/*` section of `rent_a_car` — a responsive web app today
rather than a native app, same backend endpoints either way.

### 16. User Mobile App 🌐 (customer side of the website)
The customer-equivalent of Module 15: home (search, categories,
available vehicles, recent/upcoming trips), vehicle browsing, the booking
form, the estimate screen, "My Trips," and live trip tracking once a trip
is active. This is the `/dashboard/customer/*` section plus the public
booking flow — again, a web app rather than a native app, but functionally
the same module.

### 17. Payment Module 🌐 (customer pays/views) + 🛡️ (records/manages)
Handles payment after a booking is confirmed — advance or full, cash,
online, mobile banking, or card, with a status ladder (Pending → Partial/
Paid/Failed/Refunded/Cancelled). The customer's payment history page shows
their own payments; the superadmin panel can view/manage all payments and
issue refunds.

### 18. Invoice Module 🌐 (customer views/downloads) + 🛡️ (generates)
A generated invoice per completed trip — charges, tax, discount, paid vs.
due amount. The superadmin/manager generates it; the customer sees and can
download it from their dashboard.

### 19. Notification Module 🌐 + 🛡️
In-app notifications for all three sides — customers ("Vehicle Assigned,"
"Trip Started"), drivers ("New Trip Assignment"), and admins ("New Rental
Request," "Payment Received"). Currently the in-app channel only; SMS/
email/push dispatch is stubbed for later. The bell icon on the website
reads this; the panel can also broadcast a manual notification.

### 20. Vehicle Category Module 🛡️ (manages) + 🌐 (uses the result)
Sedan, SUV, Microbus, etc. — the categories a vehicle belongs to, each with
its own image, description, and status. Managed entirely from the panel;
the website uses the category list purely as a filter option when browsing
vehicles.

### 21. Location Management Module 🌐 (search) + 🛡️ (manages) + ⚙️ (Maps proxy)
Two halves: a curated list of pickup/drop-off/popular locations (panel
manages, website can suggest them), and live Google Maps integration —
autocomplete-as-you-type, geocoding, and distance calculation — which
powers the website's location search bar directly. The Maps API key lives
only on the backend; the website never talks to Google itself.

### 22. Pricing & Fare Management Module 🛡️ (manages) + 🌐 (result shown as an estimate)
Where rates actually get configured — per-km, per-hour, per-day, driver
charge, waiting charge, extra charges, tax — scoped by vehicle, category,
and/or trip type. Superadmin-only to edit; the website's rental estimate
(Module 5) is supposed to read these rules, though today the estimate
calculation is still a placeholder formula rather than pulling live from
this module — wiring that up is a follow-up.

### 23. Cancellation Module 🌐 (customer initiates) + 🛡️ (admin can also cancel)
Two cancellation points: before confirmation, a customer can cancel their
own rental request directly from their dashboard (this is wired up on the
website today); after confirmation, only the superadmin/manager can cancel
the resulting trip (refund/vehicle-release handling is manual for now, not
automated).

### 24. Maintenance Module 🛡️
Scheduling and tracking vehicle servicing — service date, type, cost,
next service date. Starting a maintenance record automatically pulls the
vehicle out of the available pool; marking it complete/cancelled puts it
back. Entirely a panel concern — the website only notices a vehicle
becoming unavailable to book.

### 25. Document Management Module 🌐 (uploads) + 🛡️ (verifies)
Uploading ID/license/registration/insurance documents happens from the
website (profile page for a customer's NID/license, vehicle entry for
registration/insurance) — each upload can be tracked with its own
pending/verified/rejected status and expiry date. Verifying or rejecting
a specific document is a panel-only action.

### 26. Review & Rating Module 🌐 (customer rates) + 🛡️ (moderates)
After a trip completes, the customer can rate the driver and/or vehicle
with an optional written review — this is on the website's order detail
page today. The panel can view all reviews, hide/delete inappropriate
ones, and see aggregate ratings per driver/vehicle (which also show up
publicly on vehicle listings).

### 27. Support & Communication Module 🌐 (raises tickets) + 🛡️ (handles them)
A customer or driver can contact support with a problem or question — this
is the "Contact us" button on the website, wired to a real ticket now
instead of doing nothing. The panel is where staff see the ticket queue,
reply, and close tickets.

### 28. Reports & Analytics Module 🛡️
Aggregate numbers across users, vehicles, drivers, trips, and finances —
most-rented vehicles, per-driver earnings, daily/monthly/yearly revenue,
and so on. Pure panel reporting; nothing customer-facing. Deliberately its
own `report` module rather than folded into Module 6's `dashboard` — the
two look similar (both are read-only aggregates) but grow differently:
the dashboard stays a fixed landing-page summary, while reports is where
date-range filters, CSV export, and per-manager "Assigned" scoping (see
Module 32) will eventually live.

### 29. Super Admin Settings Module 🛡️
Site-wide configuration — website name/logo, currency, tax rate,
cancellation policy, notification channel toggles, and manager
permissions. The website reads some of these values indirectly (e.g. tax
rate feeding into an estimate) but never edits them; only the Super Admin
does.

### 30. Security & Audit Module ⚙️ (invisible on both sides, except the panel's log view)
The underlying safety net: password hashing, JWT auth, role checks on
every endpoint, OTP verification, login history, auto-locking an account
after repeated failed logins, and an audit trail of admin actions. None of
this has its own website screen; the panel gets a read-only Audit Log
view into it.

### 31. Complete System Workflow
Not a module — the end-to-end story tying the others together: a customer
browses and requests (🌐) → the Super Admin reviews, calls, and confirms
(🛡️) → a driver accepts and drives the trip (🌐, driver side) → the
customer tracks, pays, and reviews (🌐, customer side). Useful as a map of
which module hands off to which.

### 32. Role Permission Structure
Also not a module — the access-control matrix (who can do what per
module) that Modules 8/9/30 implement in code via `authenticate`/
`authorize` middleware and the Manager's per-area permission flags.

---

## Quick reference: website vs. panel today

**Fully live on the website (`rent_a_car`) right now:** 1, 2, 3, 4, 5
(placeholder pricing), 14, 15, 16, 17 (customer side), 18 (customer side),
19 (customer side), 21 (search bar), 23 (customer-initiated), 25
(uploads), 26, 27.

**Backend built, no panel frontend yet (this session's work, contract is
in `api-list.md`):** 6, 7 (approval actions), 8 (approval actions), 9, 10,
11, 12, 13, 17 (admin side), 18 (admin side), 19 (admin side), 20
(management), 21 (location management), 22, 23 (admin side), 24, 25
(verification), 28, 29, 30 (audit log view).
