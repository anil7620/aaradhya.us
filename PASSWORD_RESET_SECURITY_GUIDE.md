# Password Reset Security Implementation Guide

## Overview

This document outlines the security requirements and implementation guidelines for password reset functionality in the AARADHYA e-commerce application.

## Security Requirements

### 1. Token Generation & Storage

- **Cryptographically Secure Tokens**: Use `crypto.randomBytes()` to generate tokens (minimum 256 bits)
- **Token Hashing**: Store hashed tokens in database (never store plain tokens)
- **Single-Use Tokens**: Tokens must be invalidated after use
- **Time-Limited Tokens**: Tokens should expire within 15-60 minutes (recommended: 1 hour)

### 2. Rate Limiting

- **Request Rate Limiting**: Limit password reset requests per email/IP
  - Recommended: 3 requests per hour per email
  - Recommended: 5 requests per hour per IP
- **Prevent Enumeration**: Always return the same response whether email exists or not
- **Account Lockout**: Consider temporary lockout after multiple failed attempts

### 3. Password History

- **Password Reuse Prevention**: Prevent users from reusing their last N passwords
  - Recommended: Last 5 passwords
- **Password History Storage**: Store hashed password history in user document
- **History Cleanup**: Periodically clean up old password history entries

### 4. Password Change Security

- **Current Password Required**: For password changes (not resets), require current password
- **Password Strength**: Enforce strong password requirements
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Password Validation**: Validate password strength before accepting

### 5. Email Security

- **Secure Email Delivery**: Use HTTPS for email links
- **Email Content**: Do not include the reset token in email body (use link only)
- **Link Expiration**: Clearly communicate token expiration time
- **Email Verification**: Verify email ownership before sending reset link

### 6. Audit Logging

- **Password Change Events**: Log all password changes with:
  - User ID
  - Timestamp
  - Method (reset/change/admin)
  - IP address
  - User agent
- **Failed Attempts**: Log failed password reset attempts
- **Token Usage**: Log when tokens are used or expire

### 7. Error Messages

- **Generic Error Messages**: Never reveal if email exists in system
- **Information Disclosure**: Use generic messages like "If an account exists, a reset link has been sent"
- **Development vs Production**: Detailed errors only in development

## Implementation Checklist

### Phase 1: Core Functionality

- [ ] Create password reset token generation utility
- [ ] Create password reset token storage (database collection)
- [ ] Create password reset token verification
- [ ] Create password reset request API endpoint
- [ ] Create password reset confirmation API endpoint
- [ ] Create email template for password reset

### Phase 2: Security Enhancements

- [ ] Implement rate limiting for reset requests
- [ ] Implement password history tracking
- [ ] Implement password reuse prevention
- [ ] Implement audit logging
- [ ] Implement token cleanup job

### Phase 3: User Experience

- [ ] Create password reset request page
- [ ] Create password reset confirmation page
- [ ] Create password change page (requires current password)
- [ ] Add password strength indicator
- [ ] Add password requirements display

## API Endpoints (Recommended)

### POST /api/auth/forgot-password

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (always same, regardless of email existence):**
```json
{
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

**Security:**
- Rate limit: 3 requests per hour per email
- Rate limit: 5 requests per hour per IP
- Generic response to prevent email enumeration
- Generate token and send email (if email exists)

### POST /api/auth/reset-password

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

**Security:**
- Verify token is valid and not expired
- Verify token hasn't been used
- Check password strength
- Check password history
- Hash and store new password
- Mark token as used
- Add password to history
- Log password change event

### POST /api/auth/change-password

**Request:**
```json
{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been changed successfully"
}
```

**Security:**
- Require authentication
- Verify current password
- Check password strength
- Check password history
- Hash and store new password
- Add password to history
- Log password change event

## Database Schema

### password_reset_tokens Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  token: string, // Hashed token
  expiresAt: Date,
  used: boolean,
  createdAt: Date,
  ipAddress?: string
}
```

### password_change_logs Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  method: 'reset' | 'change' | 'admin',
  ipAddress?: string,
  userAgent?: string,
  timestamp: Date
}
```

### users Collection (additions)

```typescript
{
  // ... existing fields
  passwordHistory?: string[] // Array of hashed passwords (last N)
}
```

## Rate Limiting Configuration

```typescript
// Per email: 3 requests per hour
const EMAIL_RATE_LIMIT = { limit: 3, windowMs: 60 * 60 * 1000 }

// Per IP: 5 requests per hour
const IP_RATE_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 }
```

## Email Template Example

```
Subject: Reset Your AARADHYA Password

Hello,

You requested to reset your password for your AARADHYA account.

Click the link below to reset your password:
https://aaradhya.us/reset-password?token=TOKEN_HERE

This link will expire in 1 hour.

If you did not request this password reset, please ignore this email.

Best regards,
AARADHYA Team
```

## Security Best Practices

1. **Never Log Tokens**: Never log password reset tokens in plain text
2. **HTTPS Only**: Always use HTTPS for password reset links
3. **Token Uniqueness**: Ensure tokens are unique (check database before generating)
4. **Immediate Invalidation**: Invalidate token immediately after use
5. **Cleanup Job**: Run periodic cleanup of expired tokens
6. **Email Verification**: Consider requiring email verification before allowing password reset
7. **Account Lockout**: Consider temporary account lockout after multiple failed attempts
8. **2FA Consideration**: For high-security accounts, consider requiring 2FA before password reset

## Testing Checklist

- [ ] Test token generation (uniqueness, randomness)
- [ ] Test token expiration
- [ ] Test token single-use enforcement
- [ ] Test rate limiting (email and IP)
- [ ] Test password history enforcement
- [ ] Test password strength validation
- [ ] Test email enumeration prevention
- [ ] Test audit logging
- [ ] Test error message security
- [ ] Test token cleanup

## References

- [OWASP: Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
- [OWASP: Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP: Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
