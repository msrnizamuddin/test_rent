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

```http
/api/v1/product
```

---

## API Endpoints

### 1. Fetch All Products
Retrieves all products for a specified tenant where `centralStatus` is `"active"`.

* **URL**: `/all`
* **Method**: `GET`
* **Query Parameters / Body**:
  * `tenantId` (String, Optional) — Bypasses defaults if provided.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "message": "Products fetched successfully",
    "data": [
      {
        "_id": "664fa7218d6e32bc1f4a9b0a",
        "tenantId": "my-company-uuid-001",
        "centralStatus": "active",
        "status": "active",
        "productName": {
          "en": "Premium Leather Sneakers",
          "ar": "حذاء رياضي جلدي فاخر"
        },
        "productSlug": "premium-leather-sneakers",
        "productImage": "https://example.com/images/sneakers-main.jpg",
        "productGallery": [
          "https://example.com/images/sneakers-side.jpg"
        ],
        "productStyle": ["casual"],
        "productFeaturesStatus": "active",
        "productCategory": "664fa7218d6e32bc1f4a9b01",
        "productBrand": "664fa7218d6e32bc1f4a9b04",
        "productFeatures": [],
        "productOrderQuantity": 150,
        "productYoutueURL": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "productHowToCare": "Wipe with a damp cloth.",
        "deliveryInstructions": "Keep away from heat.",
        "seoKeywords": ["shoes"],
        "metaTitle": "Premium Leather Sneakers",
        "metaDescription": "Top-grain leather sneakers",
        "productTags": ["shoes"],
        "createdAt": "2026-05-24T09:14:05.123Z",
        "updatedAt": "2026-05-24T09:14:05.123Z"
      }
    ]
  }
  ```

---

### 2. Create Product
Creates a new product record in the database.

* **URL**: `/create`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Required Fields**: `productName` (Object), `productSlug` (String)
* **Request Body Example**:
  ```json
  {
    "tenantId": "my-company-uuid-001",
    "productName": {
      "en": "Premium Leather Sneakers",
      "ar": "حذاء رياضي جلدي فاخر"
    },
    "productSlug": "premium-leather-sneakers",
    "productImage": "https://example.com/images/sneakers-main.jpg",
    "productGallery": [
      "https://example.com/images/sneakers-side.jpg"
    ],
    "productStyle": ["casual", "streetwear"],
    "productDescription": "<p>These premium leather sneakers offer comfort and modern design.</p>",
    "productShortDescription": "Handcrafted top-grain leather sneakers.",
    "productCategory": "664fa7218d6e32bc1f4a9b01",
    "productSubCategory": "664fa7218d6e32bc1f4a9b02",
    "productChildCategory": "664fa7218d6e32bc1f4a9b03",
    "productBrand": "664fa7218d6e32bc1f4a9b04",
    "productFeatures": [
      {
        "featureName": "Sole Type",
        "featureValue": "Rubber"
      }
    ],
    "productOrderQuantity": 150,
    "productYoutueURL": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "productHowToCare": "Wipe with a damp cloth.",
    "deliveryInstructions": "Store in a cool, dry place.",
    "inventoryItems": "664fa7218d6e32bc1f4a9b05",
    "seoKeywords": ["leather sneakers", "shoes"],
    "metaTitle": "Premium Leather Sneakers",
    "metaDescription": "Handcrafted premium leather sneakers.",
    "productTags": ["new-arrival", "shoes"]
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Product created successfully",
    "data": {
      "_id": "664fa7218d6e32bc1f4a9b0a",
      "tenantId": "my-company-uuid-001",
      "centralStatus": "active",
      "status": "active",
      ...
    }
  }
  ```

---

### 3. Update Product
Updates an existing product by its ID and tenant scope.

* **URL**: `/update/:id`
* **Method**: `PUT`
* **Headers**: `Content-Type: application/json`
* **Request Body Example**:
  ```json
  {
    "tenantId": "my-company-uuid-001",
    "productName": {
      "en": "Updated Premium Leather Sneakers",
      "ar": "حذاء رياضي جلدي فاخر معدل"
    },
    "productOrderQuantity": 175
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Product updated successfully",
    "data": {
      "_id": "664fa7218d6e32bc1f4a9b0a",
      "tenantId": "my-company-uuid-001",
      "productName": {
        "en": "Updated Premium Leather Sneakers",
        "ar": "حذاء رياضي جلدي فاخر معدل"
      },
      "productOrderQuantity": 175,
      ...
    }
  }
  ```

---

## Product Schema Reference

Below is the complete representation of the `Product` model:

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `tenantId` | String | ✅ Yes | — | UUID identifying the owning tenant. Indexed. |
| `centralStatus` | String | ❌ No | `"active"` | Enum: `["active", "inactive"]`. Filtered in `/all`. |
| `status` | String | ❌ No | `"active"` | Enum: `["active", "inactive"]`. |
| `productName` | Object | ✅ Yes | — | Multilingual name container (e.g., `{ "en": "...", "ar": "..." }`). |
| `productSlug` | String | ✅ Yes | — | Unique slug identifier. |
| `productImage` | String | ❌ No | — | Primary image URL. |
| `productGallery` | [String] | ❌ No | `[]` | Array of additional image URLs. |
| `productStyle` | Array | ❌ No | `[]` | General stylistic categorization arrays. |
| `productFeaturesStatus` | String | ❌ No | `"active"` | Enum: `["active", "inactive"]`. |
| `productDescription` | String | ❌ No | — | Detailed description (accepts HTML/Text). |
| `productShortDescription`| String | ❌ No | — | Summary snippet. |
| `productCategory` | ObjectId | ❌ No | — | Reference to `Category` model. |
| `productSubCategory` | ObjectId | ❌ No | — | Reference to sub-category `Category` model. |
| `productChildCategory` | ObjectId | ❌ No | — | Reference to child-category `Category` model. |
| `productBrand` | ObjectId | ❌ No | — | Reference to `Brand` model. |
| `productFeatures` | Array | ❌ No | `[]` | Custom property structure array (e.g., `[{ featureName, featureValue }]`). |
| `productOrderQuantity` | Number | ❌ No | `0` | Available or cumulative ordered quantity. |
| `productYoutueURL` | String | ❌ No | — | YouTube embed/watch link. *(Note: Schema spelling is `productYoutueURL`)* |
| `productHowToCare` | String | ❌ No | — | Product care guidance text. |
| `deliveryInstructions` | String | ❌ No | — | Specific delivery instructions. |
| `inventoryItems` | ObjectId | ❌ No | — | Reference to `Inventory` model. |
| `seoKeywords` | [String] | ❌ No | `[]` | Array of search terms for SEO optimization. |
| `metaTitle` | String | ❌ No | — | Custom header meta title. |
| `metaDescription` | String | ❌ No | — | Custom header meta description. |
| `productTags` | [String] | ❌ No | `[]` | Custom organizational tags. |
| `createdBy` | ObjectId | ❌ No | — | Reference to `User` model who created this product. |
| `updatedBy` | ObjectId | ❌ No | — | Reference to `User` model who last updated this product. |

---

## Mock Data for Testing

Copy the JSON array below to use as mock product records when testing the endpoints:

```json
[
  {
    "tenantId": "my-company-uuid-001",
    "centralStatus": "active",
    "status": "active",
    "productName": {
      "en": "Premium Leather Sneakers",
      "ar": "حذاء رياضي جلدي فاخر"
    },
    "productSlug": "premium-leather-sneakers",
    "productImage": "https://example.com/images/sneakers-main.jpg",
    "productGallery": [
      "https://example.com/images/sneakers-side.jpg",
      "https://example.com/images/sneakers-sole.jpg"
    ],
    "productStyle": ["casual", "streetwear"],
    "productFeaturesStatus": "active",
    "productDescription": "<p>These premium leather sneakers offer comfort and modern design. Handcrafted with authentic top-grain leather.</p>",
    "productShortDescription": "Handcrafted top-grain leather sneakers.",
    "productCategory": "664fa7218d6e32bc1f4a9b01",
    "productSubCategory": "664fa7218d6e32bc1f4a9b02",
    "productChildCategory": "664fa7218d6e32bc1f4a9b03",
    "productBrand": "664fa7218d6e32bc1f4a9b04",
    "productFeatures": [
      {
        "featureName": "Sole Type",
        "featureValue": "Rubber"
      },
      {
        "featureName": "Color",
        "featureValue": "White/Navy"
      }
    ],
    "productOrderQuantity": 150,
    "productYoutueURL": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "productHowToCare": "Wipe with a damp cloth. Use leather conditioner periodically.",
    "deliveryInstructions": "Store in a cool, dry place. Keep away from direct heat.",
    "inventoryItems": "664fa7218d6e32bc1f4a9b05",
    "seoKeywords": ["leather sneakers", "casual shoes", "premium footwear"],
    "metaTitle": "Premium Leather Sneakers | Footwear Collection",
    "metaDescription": "Discover our handcrafted premium leather sneakers. Made for style, built for durability.",
    "productTags": ["new-arrival", "shoes", "summer-collection"],
    "createdBy": "664fa7218d6e32bc1f4a9b06",
    "updatedBy": "664fa7218d6e32bc1f4a9b06"
  },
  {
    "tenantId": "dummy-tenant-uuid-12345",
    "centralStatus": "active",
    "status": "active",
    "productName": {
      "en": "Ergonomic Office Chair",
      "ar": "كرسي مكتب مريح"
    },
    "productSlug": "ergonomic-office-chair",
    "productImage": "https://example.com/images/chair-main.jpg",
    "productGallery": [
      "https://example.com/images/chair-back.jpg",
      "https://example.com/images/chair-details.jpg"
    ],
    "productStyle": ["office", "modern"],
    "productFeaturesStatus": "active",
    "productDescription": "<p>A high-back ergonomic office chair with adjustable lumbar support, 3D armrests, and breathable mesh back.</p>",
    "productShortDescription": "Adjustable mesh chair for modern offices.",
    "productCategory": "664fa7218d6e32bc1f4a9c01",
    "productSubCategory": "664fa7218d6e32bc1f4a9c02",
    "productBrand": "664fa7218d6e32bc1f4a9c04",
    "productFeatures": [
      {
        "featureName": "Frame Material",
        "featureValue": "Nylon"
      },
      {
        "featureName": "Max Weight Capacity",
        "featureValue": "150kg"
      }
    ],
    "productOrderQuantity": 50,
    "productYoutueURL": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "productHowToCare": "Vacuum clean the mesh. Wipe plastic parts with dry micro-fiber cloth.",
    "deliveryInstructions": "Requires assembly. Instructions and tools included in the box.",
    "inventoryItems": "664fa7218d6e32bc1f4a9c05",
    "seoKeywords": ["office chair", "ergonomic chair", "desk chair", "mesh chair"],
    "metaTitle": "Ergonomic Office Chair - Mesh & Lumbar Support",
    "metaDescription": "Upgrade your workspace with our premium ergonomic office chair featuring customizable comfort.",
    "productTags": ["furniture", "office", "best-seller"],
    "createdBy": "664fa7218d6e32bc1f4a9c06",
    "updatedBy": "664fa7218d6e32bc1f4a9c06"
  }
]
```

### Quick Testing Snippets

#### 1. Testing POST Create (cURL)
```bash
curl -X POST http://localhost:5000/api/v1/product/create \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "my-company-uuid-001",
    "productName": {
      "en": "Mock Product",
      "ar": "منتج تجريبي"
    },
    "productSlug": "mock-product-test"
  }'
```

#### 2. Testing GET All (cURL)
```bash
curl -X GET http://localhost:5000/api/v1/product/all?tenantId=my-company-uuid-001
```

---

## Error Responses

| Status Code | Meaning |
|---|---|
| `400` | Missing required fields / Duplicate slug |
| `401` | No tenantId found in the request |
| `404` | Product not found or missing update permission |
| `500` | Internal server error |
