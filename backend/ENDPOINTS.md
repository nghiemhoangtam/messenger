# API Endpoints Documentation

This document provides a comprehensive overview of all API endpoints in the application.

Generated automatically on 2025-05-10T12:06:22.910Z.

## /auth/welcome (Version: v1)

### GET /auth/welcome

- **Version**: v1
- **Tags**: auth
- **Summary**: Welcome to auth api
- **Description**: Welcome to auth api

#### Responses

- **200**: Test auth api successfully

---
## /auth/register (Version: v1)

### POST /auth/register

- **Version**: v1
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
## /auth/login (Version: v1)

### POST /auth/login

- **Version**: v1
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
## /auth/resend-verification (Version: v1)

### POST /auth/resend-verification

- **Version**: v1
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
## /auth/verify-token (Version: v1)

### GET /auth/verify-token

- **Version**: v1
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
## /auth/forgot-password (Version: v1)

### POST /auth/forgot-password

- **Version**: v1
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
## /auth/reset-password (Version: v1)

### POST /auth/reset-password

- **Version**: v1
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
## /auth/google (Version: v1)

### GET /auth/google

- **Version**: v1
- **Tags**: auth
- **Summary**: Initiate Google login
- **Description**: Redirects to Google OAuth login page.

#### Responses

- **302**: Redirect to Google login

---
## /auth/google/callback (Version: v1)

### GET /auth/google/callback

- **Version**: v1
- **Tags**: auth
- **Summary**: Google login callback
- **Description**: Handles Google OAuth callback and redirects with tokens.

#### Responses

- **302**: Redirect with access and refresh tokens
- **403**: Forbidden access

---
## /auth/refresh_token (Version: v1)

### POST /auth/refresh_token

- **Version**: v1
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
## /auth/facebook (Version: v1)

### GET /auth/facebook

- **Version**: v1
- **Tags**: auth
- **Summary**: Initiate Facebook login
- **Description**: Redirects to Facebook OAuth login page.

#### Responses

- **302**: Redirect to Facebook login

---
## /auth/facebook/callback (Version: v1)

### GET /auth/facebook/callback

- **Version**: v1
- **Tags**: auth
- **Summary**: Facebook login callback
- **Description**: Handles Facebook OAuth callback and redirects with tokens.

#### Responses

- **302**: Redirect with access and refresh tokens
- **403**: Forbidden access

---
## /auth/me (Version: v1)

### GET /auth/me

- **Version**: v1
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

# Endpoint Summary

The following table lists all API endpoints for quick reference:

| Path | Method | Version | Tags | Summary |
|------|--------|---------|------|---------|
| /auth/welcome | GET | v1 | auth | Welcome to auth api |
| /auth/register | POST | v1 | auth | Register a new user |
| /auth/login | POST | v1 | auth | User login |
| /auth/resend-verification | POST | v1 | auth | Resend verification email |
| /auth/verify-token | GET | v1 | auth | Verify email token |
| /auth/forgot-password | POST | v1 | auth | Request password reset |
| /auth/reset-password | POST | v1 | auth | Reset password |
| /auth/google | GET | v1 | auth | Initiate Google login |
| /auth/google/callback | GET | v1 | auth | Google login callback |
| /auth/refresh_token | POST | v1 | auth | Refresh access token |
| /auth/facebook | GET | v1 | auth | Initiate Facebook login |
| /auth/facebook/callback | GET | v1 | auth | Facebook login callback |
| /auth/me | GET | v1 | auth | Get current user profile |
