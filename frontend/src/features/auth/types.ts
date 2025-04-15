export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string | null;
  status?: "online" | "offline" | "away";
  lastSeen?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  display_name: string;
}

export interface SocialAuthCredentials {
  provider: AuthProvider;
  token: string;
}

export type AuthProvider = "google" | "facebook" | "twitter";
export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: RequestStatus;
  error: string | null;
}
