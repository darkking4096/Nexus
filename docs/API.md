# NEXUS API Reference

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000`  
**Production:** `https://api.nexus.app`

---

## Authentication

All API endpoints (except `/auth/*` and `/health`) require Bearer token authentication.

### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Rate Limiting
- **General endpoints:** 100 requests per 15 minutes per IP
- **Login endpoint:** 5 requests per 5 minutes per IP
- **Response headers:** `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`

---

## Endpoints

### Authentication

#### POST `/auth/signup`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid-1234",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `400`: Invalid email or password format
- `409`: Email already exists

---

#### POST `/auth/login`
Authenticate user and get tokens.

**Rate limited:** 5 attempts per 5 minutes

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 3600
}
```

**Error Responses:**
- `401`: Invalid credentials
- `429`: Too many login attempts

---

### Profiles

#### GET `/api/profiles`
List all Instagram profiles connected to user account.

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Response (200):**
```json
{
  "profiles": [
    {
      "id": "profile-uuid",
      "username": "your_brand",
      "displayName": "Your Brand",
      "instagramUserId": "17841402448",
      "followerCount": 15000,
      "bioText": "Brand bio here",
      "profilePictureUrl": "https://...",
      "mode": "autopilot",
      "isConnected": true,
      "createdAt": "2026-04-01T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

**Error Responses:**
- `401`: Unauthorized (missing/invalid token)
- `500`: Server error

---

#### POST `/api/profiles`
Connect a new Instagram profile.

**Request:**
```json
{
  "instagramAuthCode": "code_from_oauth",
  "context": {
    "voice": "professional",
    "tone": "friendly",
    "targetAudience": "B2B Marketing professionals",
    "objectives": ["Drive engagement", "Build authority"]
  }
}
```

**Response (201):**
```json
{
  "id": "profile-uuid",
  "username": "your_brand",
  "instagramUserId": "17841402448",
  "mode": "manual",
  "context": {...},
  "isConnected": true
}
```

**Error Responses:**
- `400`: Invalid auth code or context
- `401`: Unauthorized
- `409`: Profile already connected

---

#### GET `/api/profiles/{profileId}`
Get single profile details.

**Response (200):**
```json
{
  "id": "profile-uuid",
  "username": "your_brand",
  "displayName": "Your Brand",
  "instagramUserId": "17841402448",
  "followerCount": 15000,
  "bioText": "Brand bio here",
  "profilePictureUrl": "https://...",
  "context": {...},
  "mode": "autopilot",
  "autopilotConfig": {
    "publishDays": ["Tuesday", "Thursday", "Saturday"],
    "publishTime": "09:00",
    "interval": 3,
    "contentTypes": ["carousel", "reel"]
  },
  "isConnected": true,
  "createdAt": "2026-04-01T10:00:00Z"
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Profile not found
- `403`: Access denied

---

#### PUT `/api/profiles/{profileId}`
Update profile context and settings.

**Request:**
```json
{
  "context": {
    "voice": "professional",
    "tone": "authoritative",
    "targetAudience": "CTO executives",
    "objectives": ["Thought leadership", "Product awareness"]
  },
  "mode": "autopilot",
  "autopilotConfig": {
    "publishDays": ["Monday", "Wednesday", "Friday"],
    "publishTime": "08:30",
    "interval": 2,
    "contentTypes": ["carousel", "reel", "static"]
  }
}
```

**Response (200):**
```json
{
  "id": "profile-uuid",
  "username": "your_brand",
  "context": {...},
  "mode": "autopilot",
  "autopilotConfig": {...},
  "updatedAt": "2026-04-17T10:00:00Z"
}
```

**Error Responses:**
- `400`: Invalid context or config
- `401`: Unauthorized
- `404`: Profile not found

---

### Content Generation

#### POST `/api/content/generate`
Generate caption and hashtags for Instagram post.

**Request:**
```json
{
  "profileId": "profile-uuid",
  "researchData": {
    "competitor": "competitor_username",
    "topPosts": ["post_1", "post_2"],
    "trends": ["trend1", "trend2"]
  },
  "contentType": "carousel",
  "imageUrl": "https://..."
}
```

**Response (201):**
```json
{
  "id": "content-uuid",
  "caption": "Generated caption text here...",
  "hooks": ["Hook 1", "Hook 2", "Hook 3"],
  "hashtags": ["#brand", "#marketing", "#strategy", "#insights"],
  "estimatedEngagement": {
    "expectedLikes": 250,
    "expectedComments": 15,
    "estimatedReach": 5000
  },
  "status": "draft",
  "createdAt": "2026-04-17T10:00:00Z"
}
```

**Error Responses:**
- `400`: Missing required fields
- `401`: Unauthorized
- `404`: Profile not found
- `422`: Generation failed

---

#### POST `/api/content/approve`
Approve and publish generated content.

**Request:**
```json
{
  "contentId": "content-uuid",
  "scheduledFor": "2026-04-18T09:00:00Z"
}
```

**Response (200):**
```json
{
  "id": "content-uuid",
  "status": "scheduled",
  "scheduledFor": "2026-04-18T09:00:00Z",
  "publishedAt": null
}
```

**Error Responses:**
- `400`: Invalid content ID or schedule time
- `401`: Unauthorized
- `409`: Content already published

---

#### DELETE `/api/content/{contentId}`
Delete draft or scheduled content.

**Response (204):** No content

**Error Responses:**
- `401`: Unauthorized
- `404`: Content not found
- `409`: Cannot delete published content

---

### Analytics

#### GET `/api/analytics/{profileId}`
Get analytics and performance metrics for profile.

**Query Parameters:**
- `period` (optional): `7d`, `30d`, `90d` (default: `30d`)
- `metric` (optional): `engagement`, `reach`, `impressions`, `followers`

**Response (200):**
```json
{
  "profileId": "profile-uuid",
  "period": "30d",
  "summary": {
    "totalEngagement": 2500,
    "totalReach": 45000,
    "totalImpressions": 125000,
    "avgEngagementRate": 0.056,
    "followerGrowth": 250
  },
  "daily": [
    {
      "date": "2026-04-01",
      "engagement": 85,
      "reach": 1200,
      "impressions": 4500,
      "followers": 12000
    }
  ],
  "topPosts": [
    {
      "postId": "post-123",
      "caption": "...",
      "engagement": 450,
      "reach": 8000,
      "type": "carousel"
    }
  ]
}
```

**Error Responses:**
- `400`: Invalid period or metric
- `401`: Unauthorized
- `404`: Profile not found

---

#### GET `/api/analytics/{profileId}/recommendations`
Get AI-powered recommendations based on analytics.

**Response (200):**
```json
{
  "profileId": "profile-uuid",
  "recommendations": [
    {
      "type": "best_posting_time",
      "value": "09:00",
      "confidence": 0.89,
      "rationale": "Peak engagement observed at 9 AM on weekdays"
    },
    {
      "type": "content_type_performance",
      "value": "carousel",
      "confidence": 0.85,
      "rationale": "Carousels generate 2.5x more engagement than static posts"
    }
  ]
}
```

---

### Dashboard

#### GET `/api/dashboard`
Get personalized dashboard data for authenticated user.

**Response (200):**
```json
{
  "profiles": [
    {
      "id": "profile-uuid",
      "username": "your_brand",
      "followerCount": 15000,
      "weeklyEngagement": 2500,
      "pendingContent": 3,
      "lastPublished": "2026-04-16T14:30:00Z"
    }
  ],
  "recentContent": [
    {
      "id": "content-uuid",
      "profileId": "profile-uuid",
      "caption": "...",
      "status": "published",
      "engagement": 325
    }
  ],
  "analyticsSnapshot": {
    "totalFollowers": 45000,
    "weeklyEngagement": 8500,
    "monthlyReach": 125000
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "error details"
  }
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `204` | No Content |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `409` | Conflict |
| `422` | Unprocessable Entity |
| `429` | Too Many Requests |
| `500` | Internal Server Error |

---

## SDK Examples

### JavaScript/Node.js

```javascript
// Install: npm install axios

import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
});

// Get profiles
const profiles = await client.get('/api/profiles');

// Generate content
const content = await client.post('/api/content/generate', {
  profileId: 'profile-uuid',
  contentType: 'carousel',
  researchData: {...}
});
```

### Python

```python
import requests

headers = {
    'Authorization': f'Bearer {access_token}'
}

# Get profiles
response = requests.get(
    'http://localhost:5000/api/profiles',
    headers=headers
)
profiles = response.json()

# Generate content
response = requests.post(
    'http://localhost:5000/api/content/generate',
    headers=headers,
    json={
        'profileId': 'profile-uuid',
        'contentType': 'carousel',
        'researchData': {...}
    }
)
```

### cURL

```bash
# Get profiles
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/profiles

# Generate content
curl -X POST http://localhost:5000/api/content/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "profile-uuid",
    "contentType": "carousel",
    "researchData": {...}
  }'
```

---

## WebSocket Events (Real-time)

*Planned for v2.0*

---

## Changelog

### v1.0.0 (2026-04-17)
- Initial API release
- Authentication endpoints
- Profile management
- Content generation and publishing
- Analytics and dashboard
- Rate limiting and compression

---

## Support

- **Issues:** Report via GitHub Issues
- **Email:** support@nexus.app
- **Status:** https://status.nexus.app

