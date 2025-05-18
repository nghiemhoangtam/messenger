import { ErrorState } from "../../types/error";

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar?: string | null;
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
export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: RequestStatus;
  error: ErrorState;
}
