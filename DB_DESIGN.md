Table users {
  id uuid [pk]
  email varchar [unique]
  display_name varchar
  password varchar
  avatar varchar
  is_active boolean
  status boolean
  last_seen timestamp
  created_at timestamp
  updated_at timestamp
}

Table social_accounts {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  provider varchar  // google, facebook, etc.
  provider_id varchar
  access_token text
  refresh_token text
  created_at timestamp
}

Table tokens {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  access_token text
  refresh_token text
  created_at timestamp
  revoked_at timestamp
  user_agent text
  ip_address varchar
}

Table password_reset_tokens {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  token varchar
  expired_at timestamp
  is_used boolean
  created_at timestamp
}

Table email_verification_tokens {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  token varchar
  expires_at timestamp
  is_used boolean
  created_at timestamp
}

Table rooms {
  id uuid [pk]
  name varchar
  type varchar // "private", "group"
  is_active boolean
  created_at timestamp
  created_by uuid [ref: > users.id]
  avatar varchar // Avatar của nhóm
  description text // Mô tả nhóm
  max_members int // Số thành viên tối đa
  is_encrypted boolean // Mã hóa tin nhắn
  last_message_at timestamp // Thời gian tin nhắn cuối
  pinned_message_id uuid [ref: > messages.id] // Tin nhắn ghim
}

Table room_members {
  id uuid [pk]
  room_id uuid [ref: > rooms.id]
  user_id uuid [ref: > users.id]
  joined_at timestamp
  role varchar // admin, member
  nickname varchar // Biệt danh trong nhóm
  is_muted boolean // Tắt thông báo
  last_read_at timestamp // Thời gian đọc cuối
  typing_until timestamp // Đang gõ đến khi nào
}

Table messages {
  id uuid [pk]
  room_id uuid [ref: > rooms.id]
  sender_id uuid [ref: > users.id]
  type varchar // "text", "image", "file", "video", "voice", "sticker", "emoji"
  content text
  metadata jsonb
  created_at timestamp
  updated_at timestamp
  is_deleted boolean
  reply_to_id uuid [ref: > messages.id] // Để reply message
  edited_at timestamp // Thời gian chỉnh sửa
  edited_by uuid [ref: > users.id] // Ai chỉnh sửa
  status varchar // "sent", "delivered", "read", "failed"
  encryption_key varchar // Cho message encryption
}

Table message_reactions {
  id uuid [pk]
  message_id uuid [ref: > messages.id]
  sender_id uuid [ref: > users.id]
  emoji varchar
  reacted_at timestamp
}

Table message_reads {
  id uuid [pk]
  message_id uuid [ref: > messages.id]
  reader_id uuid [ref: > users.id]
  read_at timestamp
}

Table message_threads {
  id uuid [pk]
  parent_message_id uuid [ref: > messages.id]
  root_message_id uuid [ref: > messages.id]
  thread_id uuid [ref: > message_threads.id]
  created_at timestamp
}

Table message_mentions {
  id uuid [pk]
  message_id uuid [ref: > messages.id]
  mentioned_user_id uuid [ref: > users.id]
  mention_type varchar // "user", "role", "all"
  created_at timestamp
}

Table files {
  id uuid [pk]
  uploader_id uuid [ref: > users.id]
  message_id uuid [ref: > messages.id]
  file_url varchar
  file_type varchar
  file_size int
  uploaded_at timestamp
  original_name varchar // Tên file gốc
  mime_type varchar // Loại MIME
  thumbnail_url varchar // URL thumbnail
  duration int // Thời lượng (cho video/audio)
  width int // Chiều rộng (cho image/video)
  height int // Chiều cao (cho image/video)
  is_processed boolean // Đã xử lý chưa
  processing_status varchar // "pending", "processing", "completed", "failed"
}

Table calls {
  id uuid [pk]
  room_id uuid [ref: > rooms.id]
  started_by uuid [ref: > users.id]
  started_at timestamp
  ended_at timestamp
  call_type varchar // audio, video, screen_share
}

Table call_participants {
  id uuid [pk]
  call_id uuid [ref: > calls.id]
  user_id uuid [ref: > users.id]
  joined_at timestamp
  left_at timestamp
  call_type varchar
}

Table user_settings {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  dark_mode boolean
  language varchar // vi, en,
  notification_enabled boolean
}

Table user_presence {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  status varchar // "online", "offline", "away", "busy"
  last_seen timestamp
  custom_status varchar // Trạng thái tùy chỉnh
  updated_at timestamp
}

Table typing_indicators {
  id uuid [pk]
  room_id uuid [ref: > rooms.id]
  user_id uuid [ref: > users.id]
  started_at timestamp
  expires_at timestamp
}

Table message_search_index {
  id uuid [pk]
  message_id uuid [ref: > messages.id]
  room_id uuid [ref: > rooms.id]
  content_vector tsvector // Full-text search
  created_at timestamp
}

Table notifications {
  id uuid [pk]
  user_id uuid [ref: > users.id] // Người nhận thông báo
  sender_id uuid [ref: > users.id] // Người tạo ra hành động (nếu có)
  type varchar // "message", "group_invite", "call", "reaction", etc.
  title varchar // Nội dung tiêu đề thông báo
  body text // Nội dung chi tiết thông báo
  is_read boolean
  metadata jsonb
  created_at timestamp
  priority varchar // "low", "normal", "high", "urgent"
  action_url varchar // URL để navigate
  expires_at timestamp // Thời gian hết hạn
  notification_type varchar // "push", "email", "sms"
}

Table user_relationships {
  id uuid [pk]
  sender_id uuid [ref: > users.id]  // người gửi lời mời
  receiver_id uuid [ref: > users.id]  // người nhận lời mời
  status varchar  // "pending", "accepted", "blocked", "rejected", "removed"
  created_at timestamp
  updated_at timestamp
}

Table block_lists {
  id uuid [pk]
  user_id uuid [ref: > users.id]      // Người chặn
  blocked_user_id uuid [ref: > users.id]  // Người bị chặn
  created_at timestamp
}

Ref: "message_reactions"."reacted_at" < "tokens"."user_id"