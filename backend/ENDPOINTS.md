# API Endpoints Documentation

This document provides a comprehensive overview of all API endpoints in the application.

Generated automatically on 2025-05-03T12:38:46.571Z.

## /auth/register

### POST /auth/register

- **Tags**: auth
- **Summary**: Register a new user
- **Description**: Creates a new user account and sends a verification email.

#### Request Body

```json
{
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/RegisterDto"
      }
    }
  }
}
```

#### Responses

- **201**: User registered successfully
  **Schema**:
```json
{
  "$ref": "#/components/schemas/User"
}
```
- **403**: Missing CORS origin

---
## /auth/login

### POST /auth/login

- **Tags**: auth
- **Summary**: User login
- **Description**: Authenticates a user and returns access and refresh tokens.

#### Request Body

```json
{
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/LoginDto"
      }
    }
  }
}
```

#### Responses

- **200**: Login successful
  **Schema**:
```json
{
  "$ref": "#/components/schemas/LoginInfoResponse"
}
```
- **401**: Invalid credentials

---
## /auth/resend-verification

### POST /auth/resend-verification

- **Tags**: auth
- **Summary**: Resend verification email
- **Description**: Sends a new verification email to the user.

#### Request Body

```json
{
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "format": "email"
          }
        }
      }
    }
  }
}
```

#### Responses

- **200**: Verification email sent
- **403**: Missing CORS origin

---
## /auth/verify-token

### GET /auth/verify-token

- **Tags**: auth
- **Summary**: Verify email token
- **Description**: Verifies the email verification token and activates the user account.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|----|----------|-------------|
| token | object | query | Yes | Verification token |

#### Responses

- **200**: Token verified successfully
  **Schema**:
```json
{
  "$ref": "#/components/schemas/User"
}
```
- **400**: Invalid or expired token

---
## /auth/forgot-password

### POST /auth/forgot-password

- **Tags**: auth
- **Summary**: Request password reset
- **Description**: Sends a password reset email to the user.

#### Request Body

```json
{
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "format": "email"
          }
        }
      }
    }
  }
}
```

#### Responses

- **200**: Password reset email sent
- **403**: Missing CORS origin

---
## /auth/reset-password

### POST /auth/reset-password

- **Tags**: auth
- **Summary**: Reset password
- **Description**: Resets the user password using a reset token.

#### Request Body

```json
{
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/ResetPasswordDto"
      }
    }
  }
}
```

#### Responses

- **200**: Password reset successfully
- **400**: Invalid or expired token

---
## /auth/google

### GET /auth/google

- **Tags**: auth
- **Summary**: Initiate Google login
- **Description**: Redirects to Google OAuth login page.

#### Responses

- **302**: Redirect to Google login

---
## /auth/google/callback

### GET /auth/google/callback

- **Tags**: auth
- **Summary**: Google login callback
- **Description**: Handles Google OAuth callback and redirects with tokens.

#### Responses

- **302**: Redirect with access and refresh tokens
- **403**: Forbidden access

---
## /auth/refresh_token

### POST /auth/refresh_token

- **Tags**: auth
- **Summary**: Refresh access token
- **Description**: Generates a new access token using a refresh token.

#### Request Body

```json
{
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "type": "object",
        "properties": {
          "refresh_token": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

#### Responses

- **200**: Token refreshed successfully
  **Schema**:
```json
{
  "$ref": "#/components/schemas/LoginInfoResponse"
}
```
- **401**: Invalid refresh token

---
## /auth/facebook

### GET /auth/facebook

- **Tags**: auth
- **Summary**: Initiate Facebook login
- **Description**: Redirects to Facebook OAuth login page.

#### Responses

- **302**: Redirect to Facebook login

---
## /auth/facebook/callback

### GET /auth/facebook/callback

- **Tags**: auth
- **Summary**: Facebook login callback
- **Description**: Handles Facebook OAuth callback and redirects with tokens.

#### Responses

- **302**: Redirect with access and refresh tokens
- **403**: Forbidden access

---
## /auth/me

### GET /auth/me

- **Tags**: auth
- **Authentication**: bearer
- **Summary**: Get current user profile
- **Description**: Returns the profile of the authenticated user.

#### Responses

- **200**: User profile retrieved successfully
  **Schema**:
```json
{
  "$ref": "#/components/schemas/User"
}
```
- **403**: Forbidden access

---
