export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
export const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:3000";

export const APP_NAME = "Messenger App";
export const APP_VERSION = "1.0.0";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "audio/mpeg",
  "video/mp4",
];

export const DEFAULT_AVATAR = "/images/default-avatar.png";
export const DEFAULT_GROUP_AVATAR = "/images/default-group-avatar.png";

export const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  FILE: "file",
  AUDIO: "audio",
  VIDEO: "video",
};

export const USER_STATUS = {
  ONLINE: "online",
  OFFLINE: "offline",
  AWAY: "away",
};

export const GROUP_ROLES = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  MEMBER: "member",
};

export const FRIENDSHIP_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  BLOCKED: "blocked",
};
