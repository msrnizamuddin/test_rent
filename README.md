## Core Module APIs

These modules are mounted automatically from their folder names:

- `warehouse`: `/api/v1/warehouse`
- `inventory`: `/api/v1/inventory`
- `userTracking`: `/api/v1/userTracking`
- `customer`: `/api/v1/customer`

---

## Warehouse API

### Base URL
`/api/v1/warehouse`

### Endpoints

| Method | URL | Description |
|---|---|---|
| `GET` | `/ping` | Check module health |
| `POST` | `/create` | Create warehouse |
| `GET` | `/all` | Get all warehouses |
| `GET` | `/:id` | Get warehouse by ID |
| `PATCH` | `/:id` | Update warehouse by ID |

### Create Warehouse Body

```json
{
  "tenantId": "6650f1b8d7c2a9a1b2c3d4e5",
  "centralStatus": "active",
  "name": "Main Dhaka Warehouse",
  "status": "active",
  "location": "Tejgaon, Dhaka",
  "createdBy": "6650f1b8d7c2a9a1b2c3d4e6",
  "updatedBy": "6650f1b8d7c2a9a1b2c3d4e6"
}
```

### Update Warehouse Body

```json
{
  "name": "Updated Dhaka Warehouse",
  "location": "Banani, Dhaka",
  "status": "active",
  "updatedBy": "6650f1b8d7c2a9a1b2c3d4e6"
}
```

---

## Inventory API

### Base URL
`/api/v1/inventory`

### Endpoints

| Method | URL | Description |
|---|---|---|
| `GET` | `/ping` | Check module health |
| `POST` | `/create` | Create inventory item |
| `GET` | `/all` | Get all inventory items |
| `GET` | `/:id` | Get inventory item by ID |
| `PATCH` | `/:id` | Update inventory item by ID |
| `DELETE` | `/delete/:id` | Delete inventory item by ID |

### Create Inventory Body

```json
{
  "warehouseId": "6650f1b8d7c2a9a1b2c3d4e5",
  "sizeId": "6650f1b8d7c2a9a1b2c3d4e7",
  "color": "Black",
  "colorImage": "https://example.com/images/colors/black.png",
  "sku": "SBR-SHOE-BLK-42",
  "productPurchasePrice": 1200,
  "basePrice": 1800,
  "productOpeningStock": 50,
  "createdBy": "6650f1b8d7c2a9a1b2c3d4e6",
  "updatedBy": "6650f1b8d7c2a9a1b2c3d4e6"
}
```

### Update Inventory Body

```json
{
  "color": "Matte Black",
  "sku": "SBR-SHOE-MBLK-42",
  "basePrice": 1900,
  "productOpeningStock": 75,
  "updatedBy": "6650f1b8d7c2a9a1b2c3d4e6"
}
```

---

## User Tracking API

### Base URL
`/api/v1/userTracking`

### Endpoints

| Method | URL | Description |
|---|---|---|
| `GET` | `/ping` | Check module health |
| `POST` | `/` | Create user tracking event |
| `GET` | `/all` | Get all user tracking events |
| `GET` | `/:id` | Get user tracking event by ID |
| `PATCH` | `/:id` | Update user tracking event by ID |
| `DELETE` | `/:id` | Delete user tracking event by ID |

### Create User Tracking Body
tracks every api hit info except last 5 minutes from same ip or api hit from ping,favicon,userTracking.
```json
{
  "userId": "6650f1b8d7c2a9a1b2c3d4e8",
  "ip": "103.25.120.10",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0",
  "browserName": "Chrome",
  "browserVersion": "125.0",
  "osName": "Windows",
  "osVersion": "10",
  "deviceType": "desktop",
  "deviceVendor": "Dell",
  "deviceModel": "Latitude",
  "country": "Bangladesh",
  "city": "Dhaka",
  "language": "en",
  "timezone": "Asia/Dhaka",
  "screenWidth": 1920,
  "screenHeight": 1080,
  "currentUrl": "https://shop.example.com/products/premium-sneakers",
  "referrer": "https://google.com",
  "eventType": "page_view",
  "eventName": "Product Details Viewed",
  "metadata": {
    "productId": "6650f1b8d7c2a9a1b2c3d4e9",
    "campaign": "summer-sale"
  }
}
```

### Update User Tracking Body

```json
{
  "eventType": "custom",
  "eventName": "Add To Cart Clicked",
  "metadata": {
    "productId": "6650f1b8d7c2a9a1b2c3d4e9",
    "quantity": 2
  }
}
```

---

## Customer API

### Base URL
`/api/v1/customer`

### Endpoints

| Method | URL | Description |
|---|---|---|
| `POST` | `/create` | Create customer |
| `POST` | `/login` | Login customer |
| `GET` | `/all` | Get all customers |
| `GET` | `/:id` | Get customer by ID |
| `PUT` | `/:id` | Update customer by ID |

### Create Customer Body

```json
{
  "firstName": "Rahim",
  "lastName": "Uddin",
  "email": "rahim.uddin@example.com",
  "phone": "+8801711000000",
  "password": "secret123",
  "profilePicture": "https://example.com/images/customers/rahim.png",
  "billingAddress": {
    "addressLine1": "House 12, Road 5",
    "addressLine2": "Apt 4B",
    "city": "Dhaka",
    "state": "Dhaka",
    "postalCode": "1212",
    "country": "Bangladesh"
  },
  "shippingAddress": {
    "addressLine1": "House 12, Road 5",
    "city": "Dhaka",
    "state": "Dhaka",
    "postalCode": "1212",
    "country": "Bangladesh"
  },
  "isVerified": false,
  "isCentral": false,
  "centralStatus": "active",
  "status": "active"
}
```

### Update Customer Body

```json
{
  "firstName": "Rahim",
  "lastName": "Ahmed",
  "phone": "+8801911000000",
  "shippingAddress": {
    "addressLine1": "House 20, Road 11",
    "city": "Dhaka",
    "state": "Dhaka",
    "postalCode": "1213",
    "country": "Bangladesh"
  },
  "isVerified": true,
  "status": "active"
}
```
### Login Customer Body
```json
{
    "email": "rahima.uddin@example.com",
    "password": "secret123"

}
```
---

## 🚀 API Endpoint: Create Tenant

### URL
`POST /api/v1/tenant/createTenant`

### Description
"This API is used to create a new tenant. A unique tenantId is generated for each tenant."

### Request Body
```json
{
  "fullName": "John Doe",
  "businessEmail": "john@example.com",
  "businessName": "Acme Ltd",
  "businessPhone": "+8801711000000",
  "businessAddress": "Dhaka, Bangladesh",
  "centralStatus": "active"
}

--Success Response 201 Created:

json{
  "success": true,
  "message": "Tenant created successfully",
  "data": { ...tenant }
}

### Get All Tenants URL
`GET /api/v1/tenant/getTenant`

No request body needed.
Success Response (200):
json{
  "success": true,
  "data": [ ...tenants ]
}

### Update Tenant URL
`PATCH  /api/v1/tenant/updateTenant/:tenantId`

{
 {
  "fullName": "Jane Doe",
  "businessPhone": "+8801900000000",
  "centralStatus": "inactive"
}
}
* Success Response (200):
{
  "success": true,
  "message": "✅ Tenant updated successfully",
  "data": { ...updatedTenant }
}

# SBR Central Server — Product Module API

This module handles **Product** management for the SBR multi-tenant system. All endpoints are scoped to the authenticated tenant via `tenantId`.

> ⚠️ **Development Testing Note:**  
> Authentication middleware is currently **bypassed for testing**. The `tenantId` and `createdBy`/`updatedBy` user references are read from the request body or query parameter, or fall back to hardcoded defaults:
> - **Product Creation (`POST /create`)**:
>   - `tenantId` defaults to `"dummy-tenant-uuid-12345"`
>   - `createdBy` / `updatedBy` defaults to `null`
> - **Fetch All (`GET /all`) & Update (`PUT /update/:id`)**:
>   - `tenantId` defaults to `"my-company-uuid-001"`
>   - `updatedBy` defaults to `null`

---

## Base URL

```
/api/v1/product
```

---

## 📦 Endpoint Summary

| API Name | Method | Endpoint | Auth (Roles) | Body | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Create Product** | `POST` | `/api/v1/product/create` | `tenant`, `superadmin` | JSON | Validates via Joi. Auto-injects `tenantId`, `createdBy`, `updatedBy` from JWT. |
| **Get All Products** | `GET` | `/api/v1/product/all` | `tenant`, `superadmin` | None | Returns all products sorted by newest first (`createdAt: -1`). |
| **Update Product** | `PATCH` | `/api/v1/product/update/:id` | `tenant`, `superadmin` | JSON | Updates by `:id`. Enforces `tenantId` match to prevent cross-tenant access. |

---

## 🛠️ Endpoint Details

### 1. Create Product

`POST /api/v1/product/create`

`tenantId`, `createdBy`, and `updatedBy` are **automatically injected from the JWT** — do not send them in the body.

**Headers**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Required Fields (Joi)**

| Field | Type | Notes |
| :--- | :--- | :--- |
| `productName` | Object | `{ en: String, ar: String }` — both required |
| `productSlug` | String | Must be globally unique |
| `productOrderQuantity` | Number | Must be ≥ 0 |

**Optional Fields**

| Field | Type | Notes |
| :--- | :--- | :--- |
| `status` | String | `"active"` \| `"inactive"` — default `"active"` |
| `productShortDescription` | String | — |
| `productBrand` | ObjectId | Ref: `Brand` |
| `productCategory` | ObjectId | Ref: `Category` |
| `productSubCategory` | ObjectId | Ref: `Category` |
| `productChildCategory` | ObjectId | Ref: `Category` |
| `productImage` | String | Primary image URL |
| `productGallery` | [String] | Additional image URLs |
| `productStyle` | Array | — |
| `productFeaturesStatus` | String | `"active"` \| `"inactive"` |
| `productDescription` | String | Accepts HTML/Text |
| `productFeatures` | Array | `[{ featureName, featureValue }]` |
| `productYoutubeURL` | String | YouTube watch/embed link |
| `productHowToCare` | String | — |
| `deliveryInstructions` | String | — |
| `inventoryItems` | ObjectId | Ref: `Inventory` |
| `seoKeywords` | [String] | — |
| `metaTitle` | String | — |
| `metaDescription` | String | — |
| `productTags` | [String] | — |

**Request Body Example**
```json
{
  "productName": { "en": "Premium Leather Sneakers", "ar": "حذاء رياضي جلدي فاخر" },
  "productSlug": "premium-leather-sneakers",
  "productOrderQuantity": 150,
  "productShortDescription": "Handcrafted top-grain leather sneakers.",
  "productCategory": "664fa7218d6e32bc1f4a9b01",
  "productBrand": "664fa7218d6e32bc1f4a9b04",
  "status": "active"
}
```

**Success Response — `201 Created`**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "664fa7218d6e32bc1f4a9b0a",
    "tenantId": "<from JWT>",
    "createdBy": "<from JWT>",
    "updatedBy": "<from JWT>",
    "productName": { "en": "Premium Leather Sneakers", "ar": "حذاء رياضي جلدي فاخر" },
    "productSlug": "premium-leather-sneakers",
    "productOrderQuantity": 150,
    "centralStatus": "active",
    "status": "active",
    "createdAt": "2026-06-08T14:00:00.000Z",
    "updatedAt": "2026-06-08T14:00:00.000Z"
  }
}
```

---

### 2. Get All Products

`GET /api/v1/product/all`

Returns all products sorted by newest first. No request body needed.

**Headers**
```
Authorization: Bearer <token>
```

**Success Response — `200 OK`**
```json
{
  "success": true,
  "message": "All products fetched successfully",
  "count": 2,
  "data": [ { "...": "..." } ]
}
```

---

### 3. Update Product

`PATCH /api/v1/product/update/:id`

Partial update by product `_id`. The product must belong to the authenticated user's `tenantId` — cross-tenant access is blocked. `updatedBy` is auto-injected from the JWT.

**Headers**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Updatable Fields (all optional)**

| Field | Type | Notes |
| :--- | :--- | :--- |
| `productName` | Object | `{ en?, ar? }` |
| `productSlug` | String | Must remain unique |
| `productOrderQuantity` | Number | ≥ 0 |
| `productShortDescription` | String | — |
| `productBrand` | ObjectId | — |
| `productCategory` | ObjectId | — |
| `status` | String | `"active"` \| `"inactive"` |
| *(any other schema field)* | — | Allowed via `.unknown(true)` |

**Request Body Example**
```json
{
  "productName": { "en": "Updated Leather Sneakers" },
  "productOrderQuantity": 200,
  "status": "inactive"
}
```

**Success Response — `200 OK`**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": { "...": "updatedProduct" }
}
```

**Error — `404 Not Found`**
```json
{
  "success": false,
  "message": "Product not found or access denied"
}
```

---

## Product Schema Reference

| Field | Type | Required | Default | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `tenantId` | String | ✅ Yes | — | Injected from JWT. Indexed. |
| `centralStatus` | String | ❌ No | `"active"` | Enum: `["active", "inactive"]` |
| `status` | String | ❌ No | `"active"` | Enum: `["active", "inactive"]` |
| `productName` | Object | ✅ Yes | — | `{ en: String, ar: String }` |
| `productSlug` | String | ✅ Yes | — | Unique |
| `productOrderQuantity` | Number | ✅ Yes | `0` | Min 0 |
| `productImage` | String | ❌ No | — | Primary image URL |
| `productGallery` | [String] | ❌ No | `[]` | Additional image URLs |
| `productStyle` | Array | ❌ No | `[]` | — |
| `productFeaturesStatus` | String | ❌ No | `"active"` | Enum: `["active", "inactive"]` |
| `productDescription` | String | ❌ No | — | HTML/Text |
| `productShortDescription` | String | ❌ No | — | — |
| `productCategory` | ObjectId | ❌ No | — | Ref: `Category` |
| `productSubCategory` | ObjectId | ❌ No | — | Ref: `Category` |
| `productChildCategory` | ObjectId | ❌ No | — | Ref: `Category` |
| `productBrand` | ObjectId | ❌ No | — | Ref: `Brand` |
| `productFeatures` | Array | ❌ No | `[]` | `[{ featureName, featureValue }]` |
| `productYoutubeURL` | String | ❌ No | — | YouTube link |
| `productHowToCare` | String | ❌ No | — | — |
| `deliveryInstructions` | String | ❌ No | — | — |
| `inventoryItems` | ObjectId | ❌ No | — | Ref: `Inventory` |
| `seoKeywords` | [String] | ❌ No | `[]` | — |
| `metaTitle` | String | ❌ No | — | — |
| `metaDescription` | String | ❌ No | — | — |
| `productTags` | [String] | ❌ No | `[]` | — |
| `createdBy` | ObjectId | ❌ No | — | Injected from JWT. Ref: `User` |
| `updatedBy` | ObjectId | ❌ No | — | Injected from JWT. Ref: `User` |

---

## Error Responses

| Status Code | Meaning                                      |
|-------------|----------------------------------------------|
| `400`       | Missing required fields / Invalid credentials |
| `401`       | Authentication failed                         |
| `409`       | Duplicate email for the same tenant           |
| `500`       | Internal Server Error                         |

---

## Security reminder

- Do not commit `.env`; store `JWT_SECRET` securely (Vault/Secrets Manager) in production.
- If you need tenants as first-class resources, add a `tenant` model and create a tenant record during registration instead of only generating an ObjectId.

## Catergories

| Endpoint | Description | Method |
| :--- | :--- | :--- |
| `/api/v1/category/createCategory` | Create Category table | POST |
| `/api/v1/category/allCategories` | Get all Category  | GET |
| `/api/v1/category/category/:id` | Get a Category  | GET |
| `/api/v1/category/updateCategory/:id` | Update Category  | patch |

## Sub-Category

| Endpoint | Description | METHOD |
| :--- | :--- | :--- |
| `/api/v1/category/createSubCategory` | Create Sub-Category table | POST |
| `/api/v1/category/allSubCategories` | GET ALL SubCategory | GET |
| `/api/v1/category/sub-category/:id` | GET a SubCategory | GET |
| `/api/v1/category/updateSubCategory/:id` | Update SubCategory | Patch |


## Child-Category

| Endpoint | Description | Data Source |
| :--- | :--- | :--- |
| `/api/v1/category/createChildCategory` | Create Child-Category table | POST |
| `/api/v1/category/allChildCategories` | Get all Child-Category | GET |
| `/api/v1/category/child-category/:id` | Get a Child-Category | GET |
| `/api/v1/category/updateChildCategory/:id` | update Child-Category | patch |


```json
{
	"tenantId": "my-company-uuid-001",
  "centralStatus" : "active",
  "type" : "Parent",
  "status" : "active",
  "name" : "bag",
  "slug" : "nikec",
  "profileImage": "https://example.com/images/nike.png",
  "createdBy": "665f1a2c9b7d4f1a12345671",
  "updatedBy": "665f1a2c9b7d4f1a12345672"
}
```

## Country 

| Endpoint | Description | Data Source |
| :--- | :--- | :--- |
| `/api/v1/country/create` | Create Country table | POST |
| `/api/v1/country/all` | Get all Country | GET |
| `/api/v1/country/country/:id` | Get a Country | GET |
| `/api/v1/country/editCountry/:id` | update Country | patch |

| Status Code | Meaning |
| :--- | :--- |
| `400` | Validation failed / Missing required fields / Duplicate slug |
| `401` | Missing or invalid JWT token |
| `403` | Forbidden — role not permitted |
| `404` | Product not found or cross-tenant access denied |
| `500` | Internal server error |



---


