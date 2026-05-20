
# SBR Central Server — Auth Module API

This module handles user authentication (registration and login) for the SBR multi-tenant system.

---

## Base URL

```
/api/v1/auth
```

---

## Public Endpoints

| Endpoint       | Method | Description                         |
|----------------|--------|-------------------------------------|
| `/register`    | POST   | Register a new user (returns JWT)   |
| `/login`       | POST   | Authenticate user (returns JWT)     |

---

## Register API

| Endpoint | Method | Description            |
|----------|--------|------------------------|
| `/`      | POST   | Create a new user      |

### Request Body

```json
{
	"fullName": "John Doe",
	"email": "john@example.com",
	"password": "password123",
	"tenantId": "<optional_object_id>"
}
```

> If `tenantId` is omitted, the server will auto-generate an ObjectId for the user (not linked to a `tenant` document).

### Success Response (201)

```json
{
	"success": true,
	"message": "User registered successfully",
	"data": {
		"token": "<jwt>",
		"user": { /* user object without plaintext password */ }
	}
}
```

---

## Login API

| Endpoint | Method | Description            |
|----------|--------|------------------------|
| `/`      | POST   | Login with email/password |

### Request Body

```json
{
	"email": "john@example.com",
	"password": "password123"
}
```

### Success Response (200)

```json
{
	"success": true,
	"message": "Login successful",
	"data": {
		"token": "<jwt>",
		"user": { /* public user fields */ }
	}
}
```

---

## User Schema (summary)

| Field           | Type     | Required | Notes                                   |
|-----------------|----------|----------|-----------------------------------------|
| `tenantId`      | ObjectId | ✅ Yes   | Auto-generated if omitted               |
| `fullName`      | String   | ✅ Yes   | Trimmed                                 |
| `email`         | String   | ✅ Yes   | Lowercased, unique per tenant           |
| `password`      | String   | ✅ Yes   | Stored hashed (bcrypt); not returned    |
| `role`          | String   | ❌ No    | Enum: `Super Admin` or `Tenant`         |
| `isActive`      | Boolean  | ❌ No    | Default `true`                          |
| `centralStatus` | String   | ❌ No    | Enum: `active`, `inactive`, `deleted`   |

Timestamps: `createdAt`, `updatedAt`

---

## Implementation notes

- `v1/modules/auth/model/auth.model.js`: Mongoose schema and password hashing in `pre('save')`.
- `v1/modules/auth/service/auth.service.js`: Business logic for registration/login, tenantId auto-generation, and calling the JWT utility.
- `v1/modules/auth/controller/auth.controller.js`: Express handlers returning JSON responses and logging errors.
- `v1/modules/auth/route/index.js`: Exposes `/register` and `/login` routes and is dynamically loaded by `route.js`.
- `v1/utils/jwt.js`: Signs JWTs using `process.env.JWT_SECRET` and `process.env.JWT_EXPIRES_IN`.
- `config/env.js` and `config/db.js`: Env loading/validation and MongoDB connection.

---

## Environment variables (required)

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret used to sign JWTs (keep this secret in production)
- `JWT_EXPIRES_IN` — token expiry (examples: `1d`, `7d`)

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

