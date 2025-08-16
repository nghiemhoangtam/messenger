import { ErrorState } from "../../types/error";
import { RequestStatus } from "../../types/request";

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar?: string | null;
  status: "online" | "offline" | "away";
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  display_name: string;
}

export interface ResetPassword {
  password: string;
  token: string;
}

export interface SocialAuthCredentials {
  provider: AuthProvider;
  token: string;
}

export type AuthProvider = "google" | "facebook" | "twitter";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: RequestStatus;
  error: ErrorState;
  // token: string | null;
}
