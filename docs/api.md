# API Contract

Base URL: `http://localhost:5000/api`
كل الردود بصيغة JSON.

## شكل الرد الموحّد

- نجاح: `{ "data": ... }`
- خطأ: `{ "error": "ERROR_CODE", "message": "...", "details": {...} }`

## Works

### GET /works

جلب كل الأعمال. فلتر اختياري: `?category=kitchens`

**Response 200**
{
"data": [
{
"id": 1,
"title": "مطبخ خشب زان",
"category": "kitchens",
"description": "مطبخ كامل بتصميم مودرن",
"images": ["https://.../1.jpg"],
"createdAt": "2026-11-01T10:00:00Z"
}
]
}

### GET /works/:id

**Response 200:** نفس شكل العنصر الواحد داخل `data`
**Response 404:** `{ "error": "NOT_FOUND", "message": "العمل غير موجود" }`

## التصنيفات المسموحة (category)

kitchens | bedrooms | doors | living-rooms | other
