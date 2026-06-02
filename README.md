## 🚀 API Endpoint: Create Tenant

### URL
`POST /api/v1/tenant/createTenant`

### Description
"This API is used to create a new tenant. A unique tenantId (TEN-xxxxxxx) is generated for each tenant."

### Request Body
```json
{
  "shopName": "My Shop",
  "email": "shop@example.com",
  "plan": "basic"
}
