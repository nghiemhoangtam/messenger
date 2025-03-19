# Messenger App

Ứng dụng nhắn tin thời gian thực với các tính năng chat, gọi điện thoại và quản lý liên hệ.

## Công nghệ sử dụng

### Frontend
- **React** - Thư viện UI
- **TypeScript** - Ngôn ngữ lập trình
- **Redux Toolkit** - Quản lý state
- **Redux Saga** - Xử lý side effects
- **Ant Design** - UI Component Library
- **Socket.IO Client** - Kết nối WebSocket
- **React Router** - Điều hướng
- **CSS Modules** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - WebSocket server
- **MongoDB** - Database
- **JWT** - Authentication

## Cấu trúc thư mục

```
src/
├── components/          # Shared components
│   ├── atoms/          # Basic UI components
│   └── molecules/      # Composite components
├── features/           # Feature modules
│   ├── auth/          # Authentication
│   ├── chat/          # Chat functionality
│   ├── calls/         # Call functionality
│   ├── contacts/      # Contact management
│   ├── groups/        # Group management
│   ├── profile/       # User profile
│   └── settings/      # App settings
├── layouts/           # Layout components
├── services/          # API services
├── store/             # Redux store
│   ├── slices/        # Redux slices
│   └── sagas/         # Redux sagas
├── types/             # TypeScript types
└── utils/             # Utility functions
```

## Tính năng chính

### 1. Xác thực người dùng
- Đăng ký tài khoản
- Đăng nhập/Đăng xuất
- Quên mật khẩu
- Xác thực JWT

### 2. Chat
- Nhắn tin text
- Gửi hình ảnh
- Gửi file
- Gửi tin nhắn âm thanh
- Đánh dấu tin nhắn đã đọc
- Hiển thị trạng thái online/offline
- Tìm kiếm tin nhắn

### 3. Gọi điện thoại
- Gọi audio
- Gọi video
- Hiển thị lịch sử cuộc gọi
- Phân loại cuộc gọi (nhỡ, đến, đi)
- Hiển thị thời lượng cuộc gọi

### 4. Quản lý liên hệ
- Thêm/xóa liên hệ
- Tìm kiếm liên hệ
- Phân loại liên hệ
- Chặn/bỏ chặn liên hệ
- Hiển thị trạng thái online/offline
- Gợi ý thêm bạn
- Xác nhận yêu cầu kết bạn
- Danh sách bạn bè chung

### 5. Nhóm chat
- Tạo nhóm
- Quản lý thành viên
- Phân quyền trong nhóm (admin, moderator, member)
- Chat nhóm
- Gọi nhóm
- Tìm kiếm nhóm
- Thêm/xóa thành viên
- Đổi tên nhóm
- Đổi ảnh nhóm
- Cài đặt thông báo nhóm
- Rời nhóm

### 6. Tìm kiếm
- Tìm kiếm người dùng
- Tìm kiếm nhóm
- Tìm kiếm tin nhắn
- Tìm kiếm file
- Lọc kết quả theo:
  + Trạng thái online/offline
  + Thời gian
  + Loại tin nhắn
  + Người gửi
- Lưu lịch sử tìm kiếm
- Gợi ý tìm kiếm

### 7. Hồ sơ người dùng
- Cập nhật thông tin cá nhân
- Đổi mật khẩu
- Tùy chỉnh avatar
- Cài đặt trạng thái
- Xem danh sách bạn bè
- Xem danh sách nhóm
- Xem lịch sử hoạt động

### 8. Cài đặt ứng dụng
- Chế độ tối/sáng
- Ngôn ngữ
- Thông báo
- Bảo mật
- Lưu trữ
- Quyền riêng tư
- Chặn người dùng
- Xóa tài khoản

## Cài đặt và chạy

1. Clone repository:
```bash
git clone https://github.com/yourusername/messenger-app.git
cd messenger-app
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file môi trường:
```bash
cp .env.example .env
```

4. Chạy ứng dụng:
```bash
npm start
```

## Cấu hình môi trường

Tạo file `.env` với các biến môi trường sau:

```
REACT_APP_API_URL=http://localhost:3000
REACT_APP_SOCKET_URL=http://localhost:3000
```

## Đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## Cấu trúc Database

### Users
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  status ENUM('online', 'offline', 'away') DEFAULT 'offline',
  last_seen TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Friendships
```sql
CREATE TABLE friendships (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  friend_id VARCHAR(36),
  status ENUM('pending', 'accepted', 'rejected', 'blocked') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_friendship (user_id, friend_id)
);
```

### Conversations
```sql
CREATE TABLE conversations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100),
  type ENUM('private', 'group') DEFAULT 'private',
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Conversation Participants
```sql
CREATE TABLE conversation_participants (
  conversation_id VARCHAR(36),
  user_id VARCHAR(36),
  role ENUM('admin', 'moderator', 'member') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (conversation_id, user_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Messages
```sql
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36),
  sender_id VARCHAR(36),
  content TEXT,
  type ENUM('text', 'image', 'file', 'audio', 'video') DEFAULT 'text',
  status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Calls
```sql
CREATE TABLE calls (
  id VARCHAR(36) PRIMARY KEY,
  caller_id VARCHAR(36),
  receiver_id VARCHAR(36),
  type ENUM('audio', 'video') DEFAULT 'audio',
  status ENUM('ringing', 'connected', 'ended', 'missed', 'rejected') DEFAULT 'ringing',
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (caller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Search History
```sql
CREATE TABLE search_history (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  query VARCHAR(255),
  type ENUM('user', 'group', 'message', 'file') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Users
- `GET /api/users` - Lấy danh sách users
- `GET /api/users/:id` - Lấy thông tin user
- `PUT /api/users/:id` - Cập nhật thông tin user
- `PUT /api/users/:id/avatar` - Cập nhật avatar

### Friendships
- `GET /api/friends` - Lấy danh sách bạn bè
- `GET /api/friends/pending` - Lấy danh sách yêu cầu kết bạn
- `POST /api/friends/request` - Gửi yêu cầu kết bạn
- `PUT /api/friends/request/:id/accept` - Chấp nhận yêu cầu kết bạn
- `PUT /api/friends/request/:id/reject` - Từ chối yêu cầu kết bạn
- `DELETE /api/friends/:id` - Xóa bạn bè
- `PUT /api/friends/:id/block` - Chặn người dùng
- `PUT /api/friends/:id/unblock` - Bỏ chặn người dùng

### Conversations
- `GET /api/conversations` - Lấy danh sách cuộc trò chuyện
- `POST /api/conversations` - Tạo cuộc trò chuyện mới
- `GET /api/conversations/:id` - Lấy thông tin cuộc trò chuyện
- `PUT /api/conversations/:id` - Cập nhật thông tin cuộc trò chuyện
- `DELETE /api/conversations/:id` - Xóa cuộc trò chuyện
- `POST /api/conversations/:id/members` - Thêm thành viên vào nhóm
- `DELETE /api/conversations/:id/members/:userId` - Xóa thành viên khỏi nhóm
- `PUT /api/conversations/:id/members/:userId/role` - Cập nhật vai trò thành viên

### Messages
- `GET /api/conversations/:id/messages` - Lấy tin nhắn của cuộc trò chuyện
- `POST /api/conversations/:id/messages` - Gửi tin nhắn mới
- `PUT /api/messages/:id` - Cập nhật trạng thái tin nhắn
- `DELETE /api/messages/:id` - Xóa tin nhắn
- `GET /api/messages/search` - Tìm kiếm tin nhắn

### Calls
- `POST /api/calls` - Bắt đầu cuộc gọi
- `PUT /api/calls/:id/answer` - Trả lời cuộc gọi
- `PUT /api/calls/:id/reject` - Từ chối cuộc gọi
- `PUT /api/calls/:id/end` - Kết thúc cuộc gọi
- `GET /api/calls` - Lấy lịch sử cuộc gọi

### Search
- `GET /api/search/users` - Tìm kiếm người dùng
- `GET /api/search/groups` - Tìm kiếm nhóm
- `GET /api/search/messages` - Tìm kiếm tin nhắn
- `GET /api/search/files` - Tìm kiếm file
- `GET /api/search/history` - Lấy lịch sử tìm kiếm
- `DELETE /api/search/history` - Xóa lịch sử tìm kiếm

## Frontend Routes

### Public Routes
- `/login` - Trang đăng nhập
- `/register` - Trang đăng ký

### Private Routes
- `/` - Trang chủ (Chat)
- `/chat/:conversationId` - Trang chat với cuộc trò chuyện cụ thể
- `/calls` - Trang cuộc gọi
- `/calls/:callId` - Trang chi tiết cuộc gọi
- `/contacts` - Trang danh bạ
- `/contacts/:contactId` - Trang chi tiết liên hệ
- `/profile` - Trang cá nhân
- `/profile/:userId` - Trang cá nhân của user khác
- `/settings` - Trang cài đặt
- `/settings/:section` - Trang cài đặt chi tiết
- `/groups` - Trang quản lý nhóm
- `/groups/:groupId` - Trang chi tiết nhóm
- `/search` - Trang tìm kiếm

## Công nghệ sử dụng

### Frontend
- React
- TypeScript
- Redux Toolkit
- Redux Saga
- Ant Design
- Socket.IO Client
- React Router

### Backend
- Node.js
- Express
- TypeScript
- MySQL
- Socket.IO
- JWT Authentication

### Development
- ESLint
- Prettier
- Husky
- Jest
- React Testing Library
