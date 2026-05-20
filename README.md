# SBR Central Server — Product Module API

This module handles **Product** management for the SBR multi-tenant system.  
All endpoints are scoped to the authenticated tenant via `tenantId`.

> ⚠️ **Note:** Authentication middleware is currently **bypassed for testing**.  
> In all controller functions, the line `const tenantId = req.user.tenantId;` is **commented out**,  
> and a hardcoded test value is used instead:  
> `const tenantId = req.body.tenantId || "60d5ecb8b392d71134e9e09b";`  
> This must be reverted before moving to production.

---

## Base URL

```
/api/v1/product
```

---

## ALL GET API Endpoints

| Endpoint          | Method | Description                        | Data Source      |
|-------------------|--------|------------------------------------|------------------|
| `/`               | GET    | Get all products for the tenant    | products collection |
| `/:id`            | GET    | Get a single product by ID         | products collection |

---

## Create Product API

| Endpoint | Method | Description              |
|----------|--------|--------------------------|
| `/`      | POST   | Create a new product     |

### Request Body

```json
{
  "name": "Product Name",
  "sku": "SKU-001",
  "category": "<category_object_id>",
  "brand": "<brand_object_id>",
  "unit": "pcs",
  "barcode": "1234567890",
  "images": ["https://example.com/image.jpg"],
  "thumbnail": "https://example.com/thumb.jpg",
  "pricing": {
    "purchasePrice": 100,
    "retailPrice": 150,
    "wholesalePrice": 130,
    "dealerPrice": 120
  }
}
```

> **Required fields:** `name`, `category`, `unit`, `pricing`

---

## Update Product API

| Endpoint  | Method | Description                        |
|-----------|--------|------------------------------------|
| `/:id`    | PUT    | Update an existing product by ID   |

### Request Body (any updatable fields)

```json
{
  "name": "Updated Product Name",
  "sku": "SKU-002",
  "unit": "kg",
  "pricing": {
    "purchasePrice": 110,
    "retailPrice": 160,
    "wholesalePrice": 140,
    "dealerPrice": 125
  }
}
```

---

## Product Schema

| Field          | Type       | Required | Notes                                  |
|----------------|------------|----------|----------------------------------------|
| `tenantId`     | ObjectId   | ✅ Yes   | References `Tenant` collection         |
| `name`         | String     | ✅ Yes   | Trimmed                                |
| `sku`          | String     | ❌ No    | Unique, uppercase, sparse              |
| `category`     | ObjectId   | ✅ Yes   | References `Category` collection       |
| `brand`        | ObjectId   | ❌ No    | References `Brand` collection          |
| `unit`         | String     | ✅ Yes   | e.g., `pcs`, `kg`, `ltr`              |
| `barcode`      | String     | ❌ No    | Unique, sparse                         |
| `images`       | [String]   | ❌ No    | Array of image URLs                    |
| `thumbnail`    | String     | ❌ No    | Single thumbnail URL                   |
| `pricing`      | Object     | ✅ Yes   | Contains 4 sub-fields (see below)      |

### Pricing Sub-fields

| Field            | Type   | Required | Notes       |
|------------------|--------|----------|-------------|
| `purchasePrice`  | Number | ✅ Yes   | Min: 0      |
| `retailPrice`    | Number | ✅ Yes   | Min: 0      |
| `wholesalePrice` | Number | ✅ Yes   | Min: 0      |
| `dealerPrice`    | Number | ✅ Yes   | Min: 0      |

---

## Error Responses

| Status Code | Meaning                                        |
|-------------|------------------------------------------------|
| `400`       | Missing required fields / Duplicate SKU or Barcode |
| `404`       | Product not found                              |
| `500`       | Internal Server Error                          |