# QuickNotes API Design

The QuickNotes API is a REST API for managing users, notes and tags. The API
returns JSON and uses standard HTTP status codes.

## Endpoints

| Method | Path | Description | Success |
|---|---|---|---|
| GET | `/api/v1/notes` | List notes for the authenticated user | `200 OK` |
| GET | `/api/v1/notes/:id` | Get one note by ID | `200 OK` |
| POST | `/api/v1/notes` | Create a new note | `201 Created` |
| PUT | `/api/v1/notes/:id` | Replace an existing note | `200 OK` |
| DELETE | `/api/v1/notes/:id` | Delete a note | `204 No Content` |
| GET | `/api/v1/tags` | List the user's tags | `200 OK` |
| POST | `/api/v1/notes/:id/tags` | Add a tag to a note | `201 Created` |
| DELETE | `/api/v1/notes/:id/tags/:tagId` | Remove a tag from a note | `204 No Content` |

## Authentication

Protected endpoints require an authenticated user. The client sends an access
token using the `Authorization` header:

```text
Authorization: Bearer <access-token>
```

## Create a Note

### Request

```http
POST /api/v1/notes
Content-Type: application/json
Authorization: Bearer <access-token>
```

```json
{
  "title": "Buy groceries",
  "body": "Milk, bread and vegetables"
}
```

### Response

```http
HTTP/1.1 201 Created
Content-Type: application/json
```

```json
{
  "id": 101,
  "userId": 1,
  "title": "Buy groceries",
  "body": "Milk, bread and vegetables",
  "createdAt": "2026-10-07T10:30:00Z",
  "updatedAt": "2026-10-07T10:30:00Z"
}
```

## List Notes

### Request

```http
GET /api/v1/notes
Authorization: Bearer <access-token>
```

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "notes": [
    {
      "id": 101,
      "userId": 1,
      "title": "Buy groceries",
      "body": "Milk, bread and vegetables",
      "createdAt": "2026-10-07T10:30:00Z",
      "updatedAt": "2026-10-07T10:30:00Z"
    },
    {
      "id": 102,
      "userId": 1,
      "title": "Project ideas",
      "body": "Build a useful web application.",
      "createdAt": "2026-10-07T11:00:00Z",
      "updatedAt": "2026-10-07T11:00:00Z"
    }
  ],
  "total": 2
}
```

## Query Parameters

The list endpoint can support pagination and filtering.

```text
GET /api/v1/notes?limit=20&offset=0
```

* `limit` controls the maximum number of notes returned.
* `offset` controls where the result set starts.

## Error Status Codes

### 400 Bad Request

The request contains invalid data.

Example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required."
  }
}
```

### 401 Unauthorized

The request does not contain a valid authentication token.

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required."
  }
}
```

### 403 Forbidden

The authenticated user does not have permission to perform the requested action.

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this note."
  }
}
```

### 404 Not Found

The requested resource does not exist.

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Note not found."
  }
}
```

### 500 Internal Server Error

An unexpected server-side error occurred.

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

## API Design Principles

The API uses resource-based URLs and standard HTTP methods. JSON is used for
request and response bodies. Authentication is handled separately from the
resource URLs, and users can only access notes they are authorized to access.

The API should also validate request data on the server even when the browser
client performs validation. This prevents invalid or malicious requests from
bypassing client-side checks.
