export const authBlacklistKey = (key: string) => `auth:blacklist:${key}`;
export const resetPasswordBlacklistKey = (key: string) =>
  `auth:reset-password:${key}`;
export const userDataKey = (userId: string) => `auth:user-data:${userId}`;
export const loginAttemptKey = (userId: string) =>  `auth:login-attempt:${userId}`;