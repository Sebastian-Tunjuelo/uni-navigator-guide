# API Documentation - Virtual University Concierge

## Base URL

```
http://localhost:3001/api
```

## Authentication

Las rutas protegidas requieren un JWT token en el header `Authorization`:

```
Authorization: Bearer <access_token>
```

El token se obtiene del endpoint `/api/auth/login` o `/api/auth/signup`.

---

## Health Check

### GET /health
Verifica que el servidor está vivo y conectado a Supabase.

**Response (200)**
```json
{
  "status": "healthy",
  "timestamp": "2026-05-01T14:30:00.000Z",
  "supabase": "connected",
  "uptime": 123.45
}
```

---

## Authentication

### POST /auth/signup
Registra un nuevo usuario.

**Request**
```json
{
  "email": "laura@example.com",
  "password": "securepassword123"
}
```

**Response (201)**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "laura@example.com",
    "user_metadata": {}
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

---

### POST /auth/login
Inicia sesión con credenciales.

**Request**
```json
{
  "email": "laura@example.com",
  "password": "securepassword123"
}
```

**Response (200)**
```json
{
  "message": "Logged in successfully",
  "user": {
    "id": "uuid",
    "email": "laura@example.com"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

---

### POST /auth/logout
Cierra la sesión del usuario. **Requiere autenticación.**

**Response (200)**
```json
{
  "message": "Logged out successfully"
}
```

---

### GET /auth/me
Obtiene información del usuario actual. **Requiere autenticación.**

**Response (200)**
```json
{
  "user": {
    "id": "uuid",
    "email": "laura@example.com",
    "user_metadata": {},
    "created_at": "2026-05-01T10:00:00Z"
  }
}
```

---

## Chat

### POST /chat/message
Envía un mensaje al chatbot. **Requiere autenticación.**

**Request**
```json
{
  "message": "¿Dónde está la biblioteca?"
}
```

**Response (201)**
```json
{
  "id": "uuid",
  "message": "¿Dónde está la biblioteca?",
  "response": "La biblioteca central está en el edificio principal...",
  "sources": [
    {
      "title": "Biblioteca Central",
      "similarity": 0.95,
      "building_id": "uuid"
    }
  ],
  "timestamp": "2026-05-01T14:30:00Z"
}
```

---

### GET /chat/history
Obtiene el historial de chat del usuario. **Requiere autenticación.**

**Query Parameters**
- `limit` (optional, default: 50, max: 500) - Número de mensajes a recuperar

**Response (200)**
```json
{
  "count": 5,
  "messages": [
    {
      "id": "uuid",
      "message": "¿Dónde está la biblioteca?",
      "response": "La biblioteca central...",
      "sources": [],
      "timestamp": "2026-05-01T14:30:00Z"
    }
  ]
}
```

---

### DELETE /chat/:messageId
Elimina un mensaje del historial. **Requiere autenticación.**

**Response (200)**
```json
{
  "message": "Message deleted successfully"
}
```

---

### DELETE /chat/clear/all
Limpia todo el historial de chat del usuario. **Requiere autenticación.**

**Response (200)**
```json
{
  "message": "Chat history cleared successfully"
}
```

---

## Campus (Mapa)

### GET /campus/buildings
Obtiene lista de todos los edificios.

**Response (200)**
```json
{
  "count": 25,
  "buildings": [
    {
      "id": "uuid",
      "name": "Biblioteca Central",
      "description": "Edificio principal con 5 pisos...",
      "category": "service",
      "latitude": 4.7110,
      "longitude": -74.0721,
      "color": "#3b82f6",
      "floor": 5,
      "created_at": "2026-05-01T10:00:00Z"
    }
  ]
}
```

---

### GET /campus/buildings/:id
Obtiene información de un edificio específico.

**Response (200)**
```json
{
  "id": "uuid",
  "name": "Biblioteca Central",
  "description": "Edificio principal con 5 pisos...",
  "category": "service",
  "latitude": 4.7110,
  "longitude": -74.0721,
  "color": "#3b82f6"
}
```

**Response (404)**
```json
{
  "error": "Building not found",
  "timestamp": "2026-05-01T14:30:00Z"
}
```

---

### GET /campus/buildings/category/:category
Obtiene edificios por categoría.

**Path Parameters**
- `category` - `academic`, `service`, `residence`, o `sport`

**Response (200)**
```json
{
  "category": "service",
  "count": 8,
  "buildings": [...]
}
```

---

### GET /campus/routes/:from/:to
Obtiene la ruta entre dos edificios.

**Path Parameters**
- `from` - ID del edificio de origen
- `to` - ID del edificio de destino

**Response (200)**
```json
{
  "id": "uuid",
  "from_id": "uuid",
  "to_id": "uuid",
  "distance": 250,
  "type": "walking",
  "duration": 5,
  "waypoints": [[4.71, -74.07], [4.712, -74.072]]
}
```

---

### GET /campus/nearby
Obtiene edificios cercanos a una ubicación.

**Query Parameters**
- `lat` (required) - Latitud
- `lng` (required) - Longitud
- `radius` (optional, default: 1) - Radio en km

**Response (200)**
```json
{
  "location": {
    "latitude": 4.7110,
    "longitude": -74.0721
  },
  "radius": 1,
  "count": 3,
  "buildings": [...]
}
```

---

### POST /campus/bookmark
Agrega un edificio a favoritos del usuario. **Requiere autenticación.**

**Request**
```json
{
  "buildingId": "uuid"
}
```

**Response (201)**
```json
{
  "message": "Building bookmarked successfully",
  "bookmark": {
    "id": "uuid",
    "user_id": "uuid",
    "building_id": "uuid",
    "created_at": "2026-05-01T14:30:00Z"
  }
}
```

---

### DELETE /campus/bookmark/:buildingId
Elimina un edificio de favoritos. **Requiere autenticación.**

**Response (200)**
```json
{
  "message": "Bookmark removed successfully"
}
```

---

### GET /campus/bookmarks
Obtiene los favoritos del usuario. **Requiere autenticación.**

**Response (200)**
```json
{
  "count": 3,
  "bookmarks": [
    {
      "id": "uuid",
      "name": "Biblioteca Central",
      "category": "service"
    }
  ]
}
```

---

## Error Responses

Todos los errores siguen este formato:

```json
{
  "error": "Description of the error",
  "details": "Additional context (if applicable)",
  "timestamp": "2026-05-01T14:30:00Z"
}
```

### Error Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 400 | Bad Request - Validation error | Missing required field |
| 401 | Unauthorized - Invalid/missing token | Invalid JWT |
| 404 | Not Found - Resource doesn't exist | Building ID not found |
| 500 | Server Error | Database connection error |

---

## Example Usage

### Flujo completo: Signup → Login → Chat → Bookmark

```bash
# 1. Registro
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"laura@example.com","password":"pass123"}'

# Obtener access_token de la respuesta

# 2. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"laura@example.com","password":"pass123"}'

# 3. Enviar mensaje al chat
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"message":"¿Dónde está la biblioteca?"}'

# 4. Obtener historial
curl -X GET http://localhost:3001/api/chat/history \
  -H "Authorization: Bearer <access_token>"

# 5. Obtener edificios
curl -X GET http://localhost:3001/api/campus/buildings

# 6. Guardar favorito
curl -X POST http://localhost:3001/api/campus/bookmark \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"buildingId":"uuid-of-building"}'
```

---

## CORS

El servidor está configurado para aceptar requests desde:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (alternate)

Para agregar más orígenes, edita `src/index.ts` en la configuración de CORS.

---

## Rate Limiting

No hay rate limiting implementado en esta versión. Se recomienda agregar en producción usando middlewares como `express-rate-limit`.

---

## Logging

Todos los requests y errores son registrados con Pino logger. En desarrollo, usa `pino-pretty` para formato legible.

```
[14:30:00] INFO: POST /api/auth/login
[14:30:01] INFO: Auth: User abc123 logged in successfully
```
