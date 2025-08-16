export const authBlacklistKey = (key: string) => `auth:blacklist:${key}`;
export const resetPasswordBlacklistKey = (key: string) =>
  `auth:reset-password:${key}`;
export const userDataKey = (userId: string) => `auth:user-data:${userId}`;
export const loginAttemptKey = (userId: string) =>  `auth:login-attempt:${userId}`;

// Room activity tracking keys
export const roomOnlineUsersKey = (roomId: string) => `room:online:${roomId}`;
export const userRoomsKey = (userId: string) => `user:rooms:${userId}`;
export const userStatusKey = (userId: string) => `user:status:${userId}`;
export const userPresenceKey = (userId: string) => `user:presence:${userId}`;
export const roomActivityKey = (roomId: string) => `room:activity:${roomId}`;