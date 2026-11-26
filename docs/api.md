# API Contract

Base URL: `http://localhost:5000/api`
All responses are JSON.

## General Rules

**Response shape**

- Success: `{ "data": ... }` (lists also include `meta`)
- Error: `{ "error": "ERROR_CODE", "message": "...", "details": {...} }`

**Authentication**

- Access Token (expires in 15 minutes) goes in the header: `Authorization: Bearer <token>`
- Refresh Token (expires in 7 days) is stored in an `httpOnly` cookie named `refreshToken`. The frontend never reads it. Requests to `/auth/*` must be sent with `credentials: "include"`.
- Access levels: **Public** (anyone) / **Optional** (token optional, result differs by role) / **User** (any logged-in user) / **Admin**

**IDs** are 24-character strings (ObjectId), not numbers.

**Pagination** (lists): `?page=1&limit=12`

```json
"meta": { "page": 1, "limit": 12, "total": 30, "totalPages": 3 }
```

Default `limit` differs per endpoint (noted below). Maximum is always 50.

**Common errors**

| Status | error                        | Meaning                                                  |
| ------ | ---------------------------- | -------------------------------------------------------- |
| 400    | `VALIDATION_ERROR`           | Invalid input, see `details`                             |
| 400    | `INVALID_JSON`               | Request body is not valid JSON                           |
| 401    | `NO_TOKEN` / `INVALID_TOKEN` | Missing, invalid or expired token                        |
| 403    | `FORBIDDEN`                  | Logged in but not an admin                               |
| 404    | `NOT_FOUND`                  | Resource or route does not exist                         |
| 409    | `DUPLICATE`                  | Unique value already exists (username, email, slug, sku) |
| 429    | `TOO_MANY_REQUESTS`          | Rate limit exceeded                                      |
| 500    | `SERVER_ERROR`               | Server error                                             |

`VALIDATION_ERROR` example:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid data",
  "details": { "phone": "Phone must be a valid Egyptian number" }
}
```

**Rate limits (per IP)**

- Global: 300 requests / 15 min
- `POST /auth/login`: 10 failed attempts / 15 min
- `POST /auth/register`: 5 / hour
- `POST /custom-requests`: 5 / hour

---

## Health

### GET /health (Public)

`200` → `{ "status": "ok" }`

---

## Auth

### POST /auth/register (Public)

```json
{ "username": "ahmed", "email": "ahmed@test.com", "password": "12345678" }
```

- `username`: min 3 chars, English letters, digits and `_` only
- `email`: valid email, stored lowercase
- `password`: min 8 chars
- `role` is always `customer` (any `role` sent is ignored)

`201`

```json
{
  "data": {
    "accessToken": "eyJ...",
    "user": {
      "id": "...",
      "username": "ahmed",
      "email": "ahmed@test.com",
      "role": "customer"
    }
  }
}
```

Also sets the `refreshToken` cookie. Errors: `400`, `409`, `429`.

### POST /auth/login (Public)

```json
{ "identifier": "ahmed@test.com", "password": "12345678" }
```

- `identifier` is an email (if it contains `@`) or a username. Admins log in with their username.

`200`: same shape as register, plus the cookie.
Errors: `400`, `401 INVALID_CREDENTIALS` (same message for wrong username or wrong password), `429`.

### POST /auth/refresh (Public, needs cookie)

No body. Send with `credentials: "include"`.

`200` → `{ "data": { "accessToken": "eyJ..." } }` and a **new** refresh cookie (token rotation).
Errors: `401 NO_TOKEN`, `401 INVALID_TOKEN`.
If an already-used refresh token is sent, all sessions of that user are revoked.

### POST /auth/logout (Public)

No body. Removes the refresh token from the database and clears the cookie.

`200` → `{ "data": { "message": "Logged out" } }`

---

## Categories

Category object:

```json
{
  "id": "...",
  "name": "Kitchens",
  "slug": "kitchens",
  "description": "",
  "image": "",
  "parentCategory": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### GET /categories (Public)

`200` → `{ "data": [Category, ...] }` sorted by name. No pagination.

### POST /categories (Admin)

```json
{
  "name": "Doors",
  "slug": "doors",
  "description": "optional",
  "image": "https://...",
  "parentCategory": "ID"
}
```

- `name`: min 2 chars
- `slug`: lowercase English letters, digits and `-`
- `description`, `image` (URL), `parentCategory` are optional

`201` → `{ "data": Category }`. Errors: `400`, `401`, `403`, `409`.

### PUT /categories/:id (Admin)

Same fields as create, all optional.
`200` → `{ "data": Category }`. Errors: `400`, `404`, `409`.

### DELETE /categories/:id (Admin)

`200` → `{ "data": { "message": "..." } }`
Errors: `404`, `409 CATEGORY_IN_USE` (category still has works).

---

## Works (portfolio gallery, display only)

Work object:

```json
{
  "id": "...",
  "title": "Oak kitchen",
  "category": { "id": "...", "name": "Kitchens", "slug": "kitchens" },
  "description": "...",
  "images": ["https://..."],
  "createdAt": "...",
  "updatedAt": "..."
}
```

(`category` is populated on reads and on update; on create it is the raw id.)

### GET /works (Public)

Query: `?category=CATEGORY_ID&page=1&limit=12` (default limit 12)
`200` → `{ "data": [Work, ...], "meta": {...} }` newest first.

### GET /works/:id (Public)

`200` → `{ "data": Work }`. Error: `404`.

### POST /works (Admin)

```json
{
  "title": "Oak kitchen",
  "category": "CATEGORY_ID",
  "description": "optional",
  "images": ["https://res.cloudinary.com/..."]
}
```

- `title`: min 2 chars
- `category`: valid ObjectId
- `images`: array of URLs (use `POST /uploads` to get them)

`201` → `{ "data": Work }`.

### PUT /works/:id (Admin)

Same fields, all optional. `200` → `{ "data": Work }`. Error: `404`.

### DELETE /works/:id (Admin)

`200` → `{ "data": { "message": "..." } }`. Error: `404`.

---

## Products

Product object:

```json
{
  "id": "...",
  "name": "Oak door",
  "description": "...",
  "category": { "id": "...", "name": "Doors", "slug": "doors" },
  "images": ["https://..."],
  "price": 3500,
  "stock": 5,
  "sku": "DOOR-001",
  "dimensions": { "length": 210, "width": 90, "height": 4 },
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### GET /products (Optional)

Query (all optional, combinable):

| Param                  | Meaning                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ |
| `page`, `limit`        | Pagination (default limit 12)                                                  |
| `category`             | Category id (`400` if invalid)                                                 |
| `minPrice`, `maxPrice` | Price range                                                                    |
| `search`               | Case-insensitive match on name                                                 |
| `isActive`             | `true` / `false`, **admin only** (ignored for others, `400` if not true/false) |

Public and customers only see products with `isActive: true`. Admins see all.
`200` → `{ "data": [Product, ...], "meta": {...} }`

### GET /products/:id (Optional)

`200` → `{ "data": Product }`. Hidden products return `404` for non-admins.

### POST /products (Admin)

```json
{
  "name": "Oak door",
  "description": "optional",
  "category": "CATEGORY_ID",
  "images": ["https://..."],
  "price": 3500,
  "stock": 5,
  "sku": "door-001",
  "dimensions": { "length": 210, "width": 90, "height": 4 },
  "isActive": true
}
```

- Required: `name` (min 2), `category`, `price` (number, >= 0)
- `price` and `stock` must be numbers, not strings. `stock` is an integer >= 0.
- `sku` is uppercased automatically and must be unique.

`201` → `{ "data": Product }`. Errors: `400`, `409`.

### PUT /products/:id (Admin)

Same fields, all optional. `200` → `{ "data": Product }`. Error: `404`.
Set `{ "isActive": false }` to hide a product without deleting it.

### DELETE /products/:id (Admin)

`200` → `{ "data": { "message": "..." } }`. Error: `404`.

---

## Uploads

### POST /uploads (Admin)

`multipart/form-data`, field name **`images`** (1 to 10 files).

- Allowed types: JPG, PNG, WebP
- Max size: 5 MB per file

`201`

```json
{
  "data": { "urls": ["https://res.cloudinary.com/.../carpentry-shop/abc.jpg"] }
}
```

Errors: `400 NO_FILE`, `400 INVALID_FILE_TYPE`, `400 FILE_TOO_LARGE`, `400 TOO_MANY_FILES`.

Usage: upload first, then put the returned URLs in `images` / `designImages` of the other endpoints.

### POST /uploads/custom (User)

Same as `POST /uploads`, but for logged-in customers (and admins).

- Field name: `images`, max **5** files (instead of 10)
- Rate limit: 20 uploads / hour per IP
- Guests cannot upload (`401`). Guests send custom requests without images.

`201` → `{ "data": { "urls": ["https://..."] } }`
Errors: `400 NO_FILE`, `400 INVALID_FILE_TYPE`, `400 FILE_TOO_LARGE`, `400 TOO_MANY_FILES`, `401`, `429`.

---

## Orders

All order endpoints require login.

Order object:

```json
{
  "id": "...",
  "user": "USER_ID",
  "items": [
    { "product": "...", "name": "Oak door", "unitPrice": 3500, "quantity": 2 }
  ],
  "totalAmount": 7000,
  "status": "pending",
  "paymentStatus": "unpaid",
  "shippingAddress": {
    "name": "...",
    "phone": "01012345678",
    "address": "..."
  },
  "notes": "",
  "createdAt": "...",
  "updatedAt": "..."
}
```

- `status`: `pending` | `confirmed` | `in-progress` | `delivered` | `cancelled`
- `paymentStatus`: `unpaid` | `paid` (changed manually by admin)
- `name` and `unitPrice` in each item are a **snapshot** taken at purchase time.

### POST /orders (User)

```json
{
  "items": [{ "productId": "PRODUCT_ID", "quantity": 2 }],
  "shippingAddress": {
    "name": "Ahmed Mohamed",
    "phone": "01012345678",
    "address": "Nile St, Beni Suef"
  },
  "notes": "optional"
}
```

- `items`: 1 to 50 entries, `quantity` integer 1 to 100
- `phone`: Egyptian mobile number (`010`, `011`, `012`, `015` + 8 digits)
- The server calculates prices from the database. Any `price`, `totalAmount`, `status` or `user` sent is ignored.
- Duplicate `productId`s are merged before the stock check.
- Stock is deducted atomically.

`201` → `{ "data": Order }`
Errors: `400 PRODUCT_UNAVAILABLE`, `400 INSUFFICIENT_STOCK`, `409 STOCK_CHANGED` (retry).

### GET /orders/my (User)

Query: `?page=1&limit=10` (default limit 10). Only the caller's orders, newest first.
`200` → `{ "data": [Order, ...], "meta": {...} }`

### GET /orders/:id (User)

Owner or admin. Anyone else gets `404` (not `403`).
`200` → `{ "data": Order }`

### GET /orders (Admin)

Query: `?status=pending&paymentStatus=unpaid&page=1&limit=10`
Invalid `status` or `paymentStatus` → `400`. Each order's `user` is populated with `{ id, username, email }`.
`200` → `{ "data": [Order, ...], "meta": {...} }`

### PATCH /orders/:id/status (Admin)

```json
{ "status": "confirmed" }
```

Allowed transitions:

```
pending     → confirmed, cancelled
confirmed   → in-progress, cancelled
in-progress → delivered, cancelled
delivered   → (final)
cancelled   → (final)
```

- Cancelling restores the stock (once only).

`200` → `{ "data": Order }`
Errors: `400 INVALID_TRANSITION`, `400 VALIDATION_ERROR`, `404`, `409 STATUS_CHANGED`.

### PATCH /orders/:id/payment (Admin)

```json
{ "paymentStatus": "paid" }
```

`200` → `{ "data": Order }`
Errors: `400 ORDER_CANCELLED` (cannot change payment of a cancelled order), `404`.

### PATCH /orders/:id/cancel (User)

No body. Cancels the caller's own order, only while its status is `pending`.
Stock is restored in the same transaction.

`200` → `{ "data": Order }`
Errors: `400 CANNOT_CANCEL` (order already confirmed or later, or already cancelled), `404` (not found or not yours), `409 STATUS_CHANGED`.

---

## Custom Requests (made-to-order furniture)

CustomRequest object:

```json
{
  "id": "...",
  "user": null,
  "contact": { "name": "Mahmoud Ali", "phone": "01112345678" },
  "productType": "Kitchen",
  "dimensions": { "length": 400, "width": 60, "height": 90 },
  "woodType": "Beech",
  "designImages": [],
  "description": "...",
  "estimatedPrice": null,
  "status": "new",
  "createdAt": "...",
  "updatedAt": "..."
}
```

- `status`: `new` | `contacted` | `quoted` | `in-progress` | `delivered` | `cancelled`
- `user` is `null` for guests.

### POST /custom-requests (Optional)

```json
{
  "contact": { "name": "Mahmoud Ali", "phone": "01112345678" },
  "productType": "Kitchen",
  "dimensions": { "length": 400, "width": 60, "height": 90 },
  "woodType": "Beech",
  "designImages": ["https://..."],
  "description": "L-shaped kitchen with upper cabinets"
}
```

- Required: `contact.name` (min 2), `contact.phone` (Egyptian number), `productType` (2 to 100 chars)
- `dimensions` values: 0 to 10000. `designImages`: max 10 URLs. `description`: max 2000 chars.
- `status`, `estimatedPrice` and `user` in the body are ignored. `user` is taken from the token if present.

`201` → `{ "data": CustomRequest }`. Errors: `400`, `429`.

### GET /custom-requests/my (User)

`200` → `{ "data": [CustomRequest, ...] }` (caller's requests, no pagination)

### GET /custom-requests (Admin)

Query: `?status=new&page=1&limit=10` (invalid status → `400`). `user` is populated with `{ id, username, email }`.
`200` → `{ "data": [...], "meta": {...} }`

### GET /custom-requests/:id (User)

Owner or admin, otherwise `404`. `200` → `{ "data": CustomRequest }`

### PATCH /custom-requests/:id (Admin)

```json
{ "status": "quoted", "estimatedPrice": 25000 }
```

- Only `status` and `estimatedPrice` are accepted. At least one is required, otherwise `400`.

`200` → `{ "data": CustomRequest }`. Error: `404`.
