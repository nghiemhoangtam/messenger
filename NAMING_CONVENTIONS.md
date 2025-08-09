# Naming Conventions Standardization

## Overview
This document outlines the standardized naming conventions used throughout the messenger application for send message and real-time functionality.

## Backend (NestJS) - snake_case
- **Database fields**: Use snake_case (e.g., `room_id`, `user_id`, `message_id`)
- **API responses**: Use snake_case for consistency with database
- **WebSocket events**: Use snake_case for event names and data properties
- **DTO properties**: Use snake_case to match database schema

### Examples:
```typescript
// WebSocket events
'send_message'
'join_conversation'
'typing_start'
'message_delivered'

// Data properties
{
  room_id: string;
  user_id: string;
  message_id: string;
  content: string;
  type: string;
}
```

## Frontend (React/TypeScript) - camelCase
- **JavaScript/TypeScript properties**: Use camelCase
- **Component props**: Use camelCase
- **State management**: Use camelCase for Redux state
- **API calls**: Convert snake_case from backend to camelCase for frontend use

### Examples:
```typescript
// Component props
interface ChatInputProps {
  room_id: string; // Matches backend naming
  onSendMessage: (content: string) => void;
}

// Redux state
interface ChatState {
  currentConversation: Conversation | null;
  typingIndicators: TypingIndicator[];
}
```

## WebSocket Communication
- **Event names**: snake_case (e.g., `send_message`, `new_message`)
- **Data properties**: snake_case to match backend
- **Frontend handling**: Convert snake_case to camelCase where needed

### WebSocket Events:
```typescript
// Backend emits
'send_message' -> { room_id, content, type }
'new_message' -> Message object with snake_case properties
'message_delivered' -> { message_id, room_id, timestamp }
'typing_start' -> { user_id, room_id, timestamp }
'message_read' -> { user_id, room_id, message_ids, timestamp }

// Frontend receives
socket.on('new_message', (message) => {
  // message has snake_case properties: room_id, sender, created_at, etc.
});
```

## Database Schema
All database fields use snake_case:
- `room_id`
- `user_id`
- `message_id`
- `created_at`
- `updated_at`
- `message_reads`
- `room_members`

## API Endpoints
REST API endpoints use kebab-case:
- `POST /chat` - Send message
- `GET /chat/messages/:room_id` - Get messages
- `POST /chat/messages/:room_id/read` - Mark as read

## File Naming
- **Backend**: kebab-case for files, PascalCase for classes
- **Frontend**: PascalCase for components, camelCase for utilities

## Migration Summary
The following files were updated to standardize naming conventions:

### Backend:
- `backend/src/apis/chat/chat.gateway.ts` - Updated WebSocket event data properties to snake_case
- `backend/src/apis/chat/common/dto/request/create-message.dto.ts` - Already using snake_case
- `backend/src/apis/chat/common/dto/response/message.response.ts` - Already using snake_case

### Frontend:
- `frontend/src/services/socketService.ts` - Updated method parameters and event handling
- `frontend/src/services/chatService.ts` - Updated method parameters
- `frontend/src/features/chat/components/ChatInput/index.tsx` - Updated props interface
- `frontend/src/features/chat/components/ChatWindow/index.tsx` - Updated component props
- `frontend/src/features/chat/components/TypingIndicator/index.tsx` - Updated props interface
- `frontend/src/features/chat/chatSaga.ts` - Updated WebSocket message data structure

## Benefits
1. **Consistency**: All backend data uses snake_case, frontend uses camelCase
2. **Clarity**: Clear distinction between backend and frontend naming
3. **Maintainability**: Easier to understand and maintain code
4. **Type Safety**: TypeScript interfaces clearly define expected data structures
5. **Real-time Communication**: WebSocket events use consistent snake_case naming

## Best Practices
1. Always use snake_case for backend database fields and API responses
2. Use camelCase for frontend JavaScript/TypeScript properties
3. Convert between naming conventions at the API boundary
4. Document any naming convention exceptions
5. Use TypeScript interfaces to enforce naming conventions 