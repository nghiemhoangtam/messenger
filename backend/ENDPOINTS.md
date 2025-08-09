# API Endpoints Documentation

This document provides a comprehensive overview of all API endpoints in the application.

Generated automatically on 2025-08-09T17:44:31.680Z.

## /health (Version: v1)

### GET /health

- **Version**: v1
- **Tags**: App
- **Summary**: No summary provided
- **Description**: No description provided

#### Responses

- **200**: 

---
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
## /auth/logout (Version: v1)

### POST /auth/logout

- **Version**: v1
- **Tags**: auth
- **Authentication**: bearer
- **Summary**: Logout user
- **Description**: Logs out the user by invalidating the access token.

#### Responses

- **200**: User logged out successfully
- **403**: Forbidden access

---
## /chat (Version: v1)

### POST /chat

- **Version**: v1
- **Tags**: chat
- **Summary**: Send a message
- **Description**: Send a message to a chat room

#### Request Body

```json
{
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/CreateMessageDto"
      }
    }
  }
}
```

#### Responses

- **201**: Message sent successfully
  **Schema**:
```json
{
  "$ref": "#/components/schemas/MessageResponse"
}
```
- **403**: Forbidden

---
## /chat/messages/{roomId} (Version: v1)

### GET /chat/messages/{roomId}

- **Version**: v1
- **Tags**: chat
- **Summary**: Get messages by room ID
- **Description**: Retrieve messages by room ID

#### Parameters

| Name | Type | In | Required | Description |
|------|------|----|----------|-------------|
| roomId | object | path | Yes | No description |
| page | object | query | Yes | Page number for pagination |
| limit | object | query | Yes | Number of items per page |
| sortBy | object | query | Yes | Field to sort by |
| search | object | query | Yes | Search term for filtering results |
| filter | object | query | No | Filter criteria |

#### Responses

- **200**: Messages retrieved successfully
- **403**: Forbidden
- **404**: Messages not found

---
## /chat/mark-as-read/{roomId} (Version: v1)

### POST /chat/mark-as-read/{roomId}

- **Version**: v1
- **Tags**: chat
- **Summary**: Mark all messages in a room as read
- **Description**: Mark all unread messages in a specific room as read for the current user

#### Parameters

| Name | Type | In | Required | Description |
|------|------|----|----------|-------------|
| roomId | object | path | Yes | No description |

#### Responses

- **200**: Messages marked as read successfully
- **403**: Forbidden
- **404**: Room not found

---
## /room/conversation (Version: v1)

### GET /room/conversation

- **Version**: v1
- **Tags**: room
- **Summary**: Get all conversations for a user
- **Description**: Retrieve all chat conversations that the user is a member of

#### Parameters

| Name | Type | In | Required | Description |
|------|------|----|----------|-------------|
| page | object | query | Yes | Page number for pagination |
| limit | object | query | Yes | Number of items per page |
| sortBy | object | query | Yes | Field to sort by |
| search | object | query | Yes | Search term for filtering results |
| filter | object | query | No | Filter criteria |

#### Responses

- **200**: List of conversations retrieved successfully
- **403**: Forbidden

---
## /room/group (Version: v1)

### POST /room/group

- **Version**: v1
- **Tags**: room
- **Summary**: Create a new group room
- **Description**: Create a new chat group room with the specified members and name

#### Request Body

```json
{
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/CreateRoomDto"
      }
    }
  }
}
```

#### Responses

- **201**: Group room created successfully
- **403**: Forbidden

---
## /room/info/{roomId} (Version: v1)

### GET /room/info/{roomId}

- **Version**: v1
- **Tags**: room
- **Summary**: Get room information
- **Description**: Get room information before joining

#### Parameters

| Name | Type | In | Required | Description |
|------|------|----|----------|-------------|
| roomId | object | path | Yes | No description |

#### Responses

- **200**: Room information retrieved successfully
- **403**: Forbidden
- **404**: Room not found

---
## /room/join/{roomId} (Version: v1)

### POST /room/join/{roomId}

- **Version**: v1
- **Tags**: room
- **Summary**: Join a room
- **Description**: Join an existing chat room by its ID

#### Parameters

| Name | Type | In | Required | Description |
|------|------|----|----------|-------------|
| roomId | object | path | Yes | No description |

#### Responses

- **200**: Joined room successfully
- **400**: Invalid room type or room full
- **403**: Forbidden
- **404**: Room not found
- **409**: User already in room

---
## /room/leave/{roomId} (Version: v1)

### POST /room/leave/{roomId}

- **Version**: v1
- **Tags**: room
- **Summary**: Leave a room
- **Description**: Leave an existing chat room by its ID

#### Parameters

| Name | Type | In | Required | Description |
|------|------|----|----------|-------------|
| roomId | object | path | Yes | No description |

#### Responses

- **200**: Left room successfully
- **403**: Forbidden
- **404**: Room not found
- **409**: User not in room

---
## /room/private/{memberId} (Version: v1)

### POST /room/private/{memberId}

- **Version**: v1
- **Tags**: room
- **Summary**: Create a new private room
- **Description**: Create a new chat private room with the specified members and name

#### Parameters

| Name | Type | In | Required | Description |
|------|------|----|----------|-------------|
| memberId | object | path | Yes | No description |

#### Request Body

```json
{
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "type": "string"
      }
    }
  }
}
```

#### Responses

- **201**: Private room created successfully
- **403**: Forbidden

---
## /user-relationship/send-friend-request (Version: v1)

### POST /user-relationship/send-friend-request

- **Version**: v1
- **Tags**: user-relationship
- **Summary**: Send a friend request
- **Description**: Allows a user to send a friend request to another user

#### Responses

- **200**: Friend request sent successfully
- **403**: Forbidden
- **404**: User not found or self-request
- **409**: Duplicate friend request

---
## /user-relationship/accept-friend-request (Version: v1)

### POST /user-relationship/accept-friend-request

- **Version**: v1
- **Tags**: user-relationship
- **Summary**: Accept a friend request
- **Description**: Allows a user to accept a friend request from another user

#### Responses

- **200**: Friend request accepted successfully
- **403**: Forbidden
- **404**: User not found or friend request does not exist

---
## /user-relationship/search-another-user (Version: v1)

### GET /user-relationship/search-another-user

- **Version**: v1
- **Tags**: user-relationship
- **Summary**: Search another user
- **Description**: Allows a user to search another user

#### Parameters

| Name | Type | In | Required | Description |
|------|------|----|----------|-------------|
| page | object | query | Yes | Page number for pagination |
| limit | object | query | Yes | Number of items per page |
| sortBy | object | query | Yes | Field to sort by |
| search | object | query | Yes | Search term for filtering results |
| filter | object | query | No | Filter criteria |

#### Responses

- **200**: User searched successfully
- **403**: Forbidden

---
## /user-relationship/reject-friend-request (Version: v1)

### POST /user-relationship/reject-friend-request

- **Version**: v1
- **Tags**: user-relationship
- **Summary**: Reject a friend request
- **Description**: Allows a user to reject a friend request from another user

#### Responses

- **200**: Friend request rejected successfully
- **403**: Forbidden
- **404**: User not found or friend request does not exist

---
## /user-relationship/remove-friend-request (Version: v1)

### POST /user-relationship/remove-friend-request

- **Version**: v1
- **Tags**: user-relationship
- **Summary**: Remove a friend
- **Description**: Allows a user to remove a friend from their friend list

#### Responses

- **200**: Friend removed successfully
- **403**: Forbidden
- **404**: User not found or friend does not exist

---
## /user-relationship/block-user-request (Version: v1)

### POST /user-relationship/block-user-request

- **Version**: v1
- **Tags**: user-relationship
- **Summary**: Block a user
- **Description**: Allows a user to block another user

#### Responses

- **200**: User blocked successfully
- **403**: Forbidden
- **404**: User not found or already blocked

---
## /user-relationship/unblock-user-request (Version: v1)

### POST /user-relationship/unblock-user-request

- **Version**: v1
- **Tags**: user-relationship
- **Summary**: Unblock a user
- **Description**: Allows a user to unblock another user

#### Responses

- **200**: User unblocked successfully
- **403**: Forbidden
- **404**: User not found or not blocked

---
## /user-relationship/list-accepted-friends (Version: v1)

### GET /user-relationship/list-accepted-friends

- **Version**: v1
- **Tags**: user-relationship
- **Summary**: List friends
- **Description**: Retrieve a list of friends for the authenticated user

#### Parameters

| Name | Type | In | Required | Description |
|------|------|----|----------|-------------|
| page | object | query | Yes | Page number for pagination |
| limit | object | query | Yes | Number of items per page |
| sortBy | object | query | Yes | Field to sort by |
| search | object | query | Yes | Search term for filtering results |
| filter | object | query | No | Filter criteria |

#### Responses

- **200**: List of friends retrieved successfully
- **403**: Forbidden

---
## /user-relationship/list-received-friends (Version: v1)

### GET /user-relationship/list-received-friends

- **Version**: v1
- **Tags**: user-relationship
- **Summary**: List received friend requests
- **Description**: Retrieve a list of received friend requests for the authenticated user

#### Parameters

| Name | Type | In | Required | Description |
|------|------|----|----------|-------------|
| page | object | query | Yes | Page number for pagination |
| limit | object | query | Yes | Number of items per page |
| sortBy | object | query | Yes | Field to sort by |
| search | object | query | Yes | Search term for filtering results |
| filter | object | query | No | Filter criteria |

#### Responses

- **200**: List of received friend requests retrieved successfully
- **403**: Forbidden

---
## /user-relationship/list-sent-friends (Version: v1)

### GET /user-relationship/list-sent-friends

- **Version**: v1
- **Tags**: user-relationship
- **Summary**: List sent friend requests
- **Description**: Retrieve a list of sent friend requests for the authenticated user

#### Parameters

| Name | Type | In | Required | Description |
|------|------|----|----------|-------------|
| page | object | query | Yes | Page number for pagination |
| limit | object | query | Yes | Number of items per page |
| sortBy | object | query | Yes | Field to sort by |
| search | object | query | Yes | Search term for filtering results |
| filter | object | query | No | Filter criteria |

#### Responses

- **200**: List of sent friend requests retrieved successfully
- **403**: Forbidden

---
## /user-relationship/search-active-user (Version: v1)

### GET /user-relationship/search-active-user

- **Version**: v1
- **Tags**: user-relationship
- **Summary**: Search all active users
- **Description**: Get all active users with pagination and search

#### Parameters

| Name | Type | In | Required | Description |
|------|------|----|----------|-------------|
| page | object | query | Yes | Page number for pagination |
| limit | object | query | Yes | Number of items per page |
| sortBy | object | query | Yes | Field to sort by |
| search | object | query | Yes | Search term for filtering results |
| filter | object | query | No | Filter criteria |

#### Responses

- **200**: Active users fetched successfully
- **403**: Forbidden

---
## /user-relationship/available-friends (Version: v1)

### GET /user-relationship/available-friends

- **Version**: v1
- **Tags**: user-relationship
- **Summary**: List accepted friends without private room
- **Description**: No description provided

#### Parameters

| Name | Type | In | Required | Description |
|------|------|----|----------|-------------|
| page | object | query | Yes | Page number for pagination |
| limit | object | query | Yes | Number of items per page |
| sortBy | object | query | Yes | Field to sort by |
| search | object | query | Yes | Search term for filtering results |
| filter | object | query | No | Filter criteria |

#### Responses

- **200**: Available friends fetched successfully
- **403**: Forbidden
- **404**: No available friends found

---

# Endpoint Summary

The following table lists all API endpoints for quick reference:

| Path | Method | Version | Tags | Summary |
|------|--------|---------|------|---------|
| /health | GET | v1 | App | No summary provided |
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
| /auth/logout | POST | v1 | auth | Logout user |
| /chat | POST | v1 | chat | Send a message |
| /chat/messages/{roomId} | GET | v1 | chat | Get messages by room ID |
| /chat/mark-as-read/{roomId} | POST | v1 | chat | Mark all messages in a room as read |
| /room/conversation | GET | v1 | room | Get all conversations for a user |
| /room/group | POST | v1 | room | Create a new group room |
| /room/info/{roomId} | GET | v1 | room | Get room information |
| /room/join/{roomId} | POST | v1 | room | Join a room |
| /room/leave/{roomId} | POST | v1 | room | Leave a room |
| /room/private/{memberId} | POST | v1 | room | Create a new private room |
| /user-relationship/send-friend-request | POST | v1 | user-relationship | Send a friend request |
| /user-relationship/accept-friend-request | POST | v1 | user-relationship | Accept a friend request |
| /user-relationship/search-another-user | GET | v1 | user-relationship | Search another user |
| /user-relationship/reject-friend-request | POST | v1 | user-relationship | Reject a friend request |
| /user-relationship/remove-friend-request | POST | v1 | user-relationship | Remove a friend |
| /user-relationship/block-user-request | POST | v1 | user-relationship | Block a user |
| /user-relationship/unblock-user-request | POST | v1 | user-relationship | Unblock a user |
| /user-relationship/list-accepted-friends | GET | v1 | user-relationship | List friends |
| /user-relationship/list-received-friends | GET | v1 | user-relationship | List received friend requests |
| /user-relationship/list-sent-friends | GET | v1 | user-relationship | List sent friend requests |
| /user-relationship/search-active-user | GET | v1 | user-relationship | Search all active users |
| /user-relationship/available-friends | GET | v1 | user-relationship | List accepted friends without private room |
