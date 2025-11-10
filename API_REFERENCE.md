# API Reference

This document describes the REST API endpoints with DTO validation.

## Architecture

- **DTOs**: Defined in `lib/dtos.ts` with Zod validation schemas
- **Mappers**: Convert Prisma models to DTOs in `lib/mappers.ts`
- **Routes**: Next.js App Router API routes in `app/api/(auth)/`

---

## Photoshoots

### List Photoshoots

```http
GET /api/photoshoots
```

**Response**: `PhotoshootDTO[]`

```json
[
  {
    "id": 1,
    "title": "Sunset Beach Session",
    "description": "A relaxed sunset photoshoot",
    "date": "2025-10-05T14:00:00.000Z",
    "ownerId": null,
    "createdAt": "2025-10-05T14:00:00.000Z",
    "updatedAt": "2025-10-05T14:00:00.000Z"
  }
]
```

### Get Photoshoot

```http
GET /api/photoshoots/:photoshootId
```

**Response**: `PhotoshootDTO`

### Create Photoshoot

```http
POST /api/photoshoots
Content-Type: application/json
```

**Request body** (validated with `CreatePhotoshootDTOZ`):

```json
{
  "title": "Summer Wedding",
  "description": "Beautiful outdoor wedding",
  "date": "2025-07-15T10:00:00.000Z",
  "ownerId": 1
}
```

**Response**: `PhotoshootDTO` (201 Created)

### Update Photoshoot

```http
PATCH /api/photoshoots/:photoshootId
Content-Type: application/json
```

**Request body** (validated with `UpdatePhotoshootDTOZ`, all fields optional):

```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response**: `PhotoshootDTO` (200 OK)

### Delete Photoshoot

```http
DELETE /api/photoshoots/:photoshootId
```

**Response**: `{ message: "Photoshoot deleted successfully" }` (200 OK)

**Note**: Deletes all related photos and comments (cascade)

---

## Photos

### List Photos

```http
GET /api/photos?photoshootId=123
```

**Query Parameters**:

- `photoshootId` (optional): Filter by photoshoot

**Response**: `PhotoDTO[]`

```json
[
  {
    "id": 1,
    "photoshootId": 1,
    "filename": "sunset-1.jpg",
    "caption": "Golden hour",
    "CreatedAt": "2025-10-05T14:00:00.000Z"
  }
]
```

### Get Photo

```http
GET /api/photos/:photoId
```

**Response**: `PhotoDTO`

### Create Photo

```http
POST /api/photos
Content-Type: application/json
```

**Request body** (validated with `CreatePhotoDTOZ`):

```json
{
  "photoshootId": 1,
  "filename": "photo-001.jpg",
  "caption": "Beautiful sunset"
}
```

**Response**: `PhotoDTO` (201 Created)

### Update Photo

```http
PATCH /api/photos/:photoId
Content-Type: application/json
```

**Request body** (validated with `UpdatePhotoDTOZ`, all fields optional):

```json
{
  "filename": "photo-001-edited.jpg",
  "caption": "Updated caption"
}
```

**Response**: `PhotoDTO` (200 OK)

### Delete Photo

```http
DELETE /api/photos/:photoId
```

**Response**: `{ message: "Photo deleted successfully" }` (200 OK)

**Note**: Deletes all related comments (cascade)

---

## Comments

### List Comments

```http
GET /api/comments?photoId=123
```

**Query Parameters**:

- `photoId` (optional): Filter by photo

**Response**: `CommentDTO[]`

```json
[
  {
    "id": 1,
    "photoId": 1,
    "authorId": 1,
    "body": "Lovely colors!"
  }
]
```

### Get Comment

```http
GET /api/comments/:commentId
```

**Response**: `CommentDTO`

### Create Comment

```http
POST /api/comments
Content-Type: application/json
```

**Request body** (validated with `CreateCommentDTOZ`):

```json
{
  "photoId": 1,
  "authorId": 1,
  "body": "Great shot!"
}
```

**Response**: `CommentDTO` (201 Created)

### Update Comment

```http
PATCH /api/comments/:commentId
Content-Type: application/json
```

**Request body** (validated with `UpdateCommentDTOZ`):

```json
{
  "body": "Updated comment text"
}
```

**Response**: `CommentDTO` (200 OK)

### Delete Comment

```http
DELETE /api/comments/:commentId
```

**Response**: `{ message: "Comment deleted successfully" }` (200 OK)

---

## Error Responses

All endpoints return consistent error responses:

### 400 Bad Request

```json
{
  "error": "Invalid photoshoot ID"
}
```

### 404 Not Found

```json
{
  "error": "Photoshoot not found"
}
```

### 422 Unprocessable Entity (Validation Error)

```json
{
  "error": "Invalid input",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "path": ["title"],
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to fetch photoshoots"
}
```

---

## File Structure

```
lib/
├── dtos.ts          # DTO interfaces and Zod schemas
└── mappers.ts       # Prisma → DTO mapper functions

app/api/(auth)/
├── photoshoots/
│   ├── route.ts                    # GET, POST
│   └── [photoshootId]/route.ts     # GET, PATCH, DELETE
├── photos/
│   ├── route.ts                    # GET, POST
│   └── [photoId]/route.ts          # GET, PATCH, DELETE
└── comments/
    ├── route.ts                    # GET, POST
    └── [commentId]/route.ts        # GET, PATCH, DELETE
```

---

## Testing Examples

### cURL Examples

**Create a photoshoot:**

```bash
curl -X POST http://localhost:3000/api/photoshoots \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Shoot","description":"Test description"}'
```

**List photos for a photoshoot:**

```bash
curl "http://localhost:3000/api/photos?photoshootId=1"
```

**Update a comment:**

```bash
curl -X PATCH http://localhost:3000/api/comments/1 \
  -H "Content-Type: application/json" \
  -d '{"body":"Updated comment"}'
```

**Delete a photo:**

```bash
curl -X DELETE http://localhost:3000/api/photos/1
```
