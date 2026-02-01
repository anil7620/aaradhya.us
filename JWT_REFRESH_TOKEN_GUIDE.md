# JWT Refresh Token Implementation Guide

## Overview

This document describes the JWT refresh token implementation for the AARADHYA e-commerce application. The system uses short-lived access tokens (24 hours) and longer-lived refresh tokens (7 days) for enhanced security.

## Security Improvements

### Before (SEC-018 Issue)
- **Access Token Expiration**: 7 days (too long)
- **No Token Revocation**: Stolen tokens remain valid for 7 days
- **No Refresh Mechanism**: Users had to re-authenticate after token expiration

### After (Fixed)
- **Access Token Expiration**: 24 hours (reduced exposure window)
- **Refresh Token Expiration**: 7 days (for user convenience)
- **Token Revocation**: Refresh tokens can be revoked
- **Token Rotation**: New refresh token issued on each refresh
- **Device Tracking**: Track devices/sessions using refresh tokens

## Architecture

### Token Types

1. **Access Token** (24 hours)
   - Used for API authentication
   - Contains: userId, email, role, type: 'access'
   - Stored in: Cookie or Authorization header
   - Cannot be revoked (stateless)

2. **Refresh Token** (7 days)
   - Used to obtain new access tokens
   - Contains: userId, type: 'refresh'
   - Stored in: Database (hashed)
   - Can be revoked
   - Rotated on each use

### Token Flow

```
1. Login/Register
   → Generate access token (24h) + refresh token (7d)
   → Store refresh token in database (hashed)
   → Return both tokens to client

2. API Request
   → Client sends access token
   → Server verifies access token
   → If expired, client uses refresh token

3. Token Refresh
   → Client sends refresh token
   → Server verifies refresh token
   → Generate new access token + new refresh token
   → Revoke old refresh token
   → Store new refresh token
   → Return new tokens to client

4. Logout
   → Revoke refresh token(s)
   → Access token remains valid until expiration (stateless)
```

## API Endpoints

### POST /api/auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "access-token-here",        // Backward compatibility
  "accessToken": "access-token-here",  // New field
  "refreshToken": "refresh-token-here",
  "redirect": "/dashboard"
}
```

### POST /api/auth/register

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "Password123!",
  "acceptTerms": true
}
```

**Response:**
```json
{
  "token": "access-token-here",        // Backward compatibility
  "accessToken": "access-token-here",  // New field
  "refreshToken": "refresh-token-here",
  "redirect": "/dashboard",
  "associatedOrdersCount": 0
}
```

### POST /api/auth/refresh

**Request:**
```json
{
  "refreshToken": "refresh-token-here"
}
```

**Response:**
```json
{
  "accessToken": "new-access-token-here",
  "refreshToken": "new-refresh-token-here"
}
```

**Errors:**
- `400`: Refresh token is required
- `401`: Invalid or expired refresh token

### POST /api/auth/logout

**Request (Option 1 - Revoke specific token):**
```json
{
  "refreshToken": "refresh-token-here"
}
```

**Request (Option 2 - Revoke all tokens):**
```json
{}
```
(Requires valid access token in Authorization header or cookie)

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "revokedTokens": 1
}
```

## Database Schema

### refresh_tokens Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  token: string,        // Hashed refresh token (SHA-256)
  deviceInfo?: string,  // Device/browser information
  ipAddress?: string,  // IP address when token was created
  userAgent?: string,   // User agent string
  expiresAt: Date,      // 7 days from creation
  revoked: boolean,      // Whether token has been revoked
  revokedAt?: Date,     // When token was revoked
  createdAt: Date,      // When token was created
  lastUsedAt?: Date     // Last time token was used
}
```

## Client-Side Implementation

### Storing Tokens

```typescript
// Store access token in cookie (for automatic inclusion in requests)
document.cookie = `token=${accessToken}; path=/; secure; samesite=strict`

// Store refresh token in httpOnly cookie or secure storage
// Option 1: httpOnly cookie (most secure)
// Set via server response header: Set-Cookie: refresh-token=...; httpOnly; secure; samesite=strict

// Option 2: localStorage (less secure, but easier for SPA)
localStorage.setItem('refreshToken', refreshToken)
```

### Token Refresh Flow

```typescript
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken')
  
  if (!refreshToken) {
    // No refresh token, redirect to login
    window.location.href = '/login'
    return null
  }
  
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    
    if (!response.ok) {
      // Refresh token invalid, redirect to login
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
      return null
    }
    
    const { accessToken, refreshToken: newRefreshToken } = await response.json()
    
    // Update tokens
    document.cookie = `token=${accessToken}; path=/; secure; samesite=strict`
    localStorage.setItem('refreshToken', newRefreshToken)
    
    return accessToken
  } catch (error) {
    console.error('Token refresh failed:', error)
    window.location.href = '/login'
    return null
  }
}

// Use in API calls
async function apiCall(url: string, options: RequestInit = {}) {
  let token = getTokenFromCookie()
  
  // If token expired, try to refresh
  if (!token || isTokenExpired(token)) {
    token = await refreshAccessToken()
  }
  
  if (!token) {
    throw new Error('Not authenticated')
  }
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  })
}
```

## Security Features

### 1. Token Rotation
- New refresh token issued on each refresh
- Old refresh token automatically invalidated
- Prevents token reuse attacks

### 2. Token Revocation
- Refresh tokens can be revoked individually
- All user tokens can be revoked on logout
- Useful for security incidents

### 3. Device Tracking
- Track IP address and user agent
- Identify suspicious login locations
- Enable "active sessions" management

### 4. Short-Lived Access Tokens
- 24-hour expiration reduces exposure window
- Stolen tokens become useless quickly
- Stateless (no database lookup needed)

### 5. Hashed Storage
- Refresh tokens hashed before storage (SHA-256)
- Even database compromise doesn't expose tokens
- Similar to password hashing

## Maintenance

### Cleanup Expired Tokens

Run periodically (e.g., daily cron job):

```typescript
import { cleanupExpiredTokens } from '@/lib/refresh-token'

// Clean up expired and old revoked tokens
const deletedCount = await cleanupExpiredTokens()
console.log(`Cleaned up ${deletedCount} expired tokens`)
```

### Active Sessions Management

Allow users to view and revoke active sessions:

```typescript
import { getUserRefreshTokens, revokeTokenById } from '@/lib/refresh-token'

// Get user's active sessions
const sessions = await getUserRefreshTokens(userId)

// Revoke specific session
await revokeTokenById(sessionId)
```

## Migration Notes

### Backward Compatibility

- Login/Register endpoints still return `token` field (access token)
- Existing clients using `token` field will continue to work
- New clients should use `accessToken` and `refreshToken` fields

### Breaking Changes

- Access tokens now expire in 24 hours (was 7 days)
- Clients must implement refresh token flow
- Middleware now rejects refresh tokens for route protection

## Testing

### Test Cases

1. **Login Flow**
   - [ ] Login returns access token and refresh token
   - [ ] Refresh token is stored in database (hashed)
   - [ ] Access token expires in 24 hours
   - [ ] Refresh token expires in 7 days

2. **Token Refresh**
   - [ ] Valid refresh token returns new tokens
   - [ ] Old refresh token is invalidated
   - [ ] New refresh token is stored
   - [ ] Expired refresh token is rejected
   - [ ] Revoked refresh token is rejected

3. **Logout**
   - [ ] Logout with refresh token revokes that token
   - [ ] Logout without refresh token revokes all user tokens
   - [ ] Revoked tokens cannot be used

4. **Security**
   - [ ] Refresh tokens cannot be used as access tokens
   - [ ] Access tokens cannot be used to refresh
   - [ ] Token rotation prevents reuse
   - [ ] Hashed storage prevents token exposure

## References

- [OWASP: Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [RFC 7519: JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)
- [OWASP: Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
