import {
  LoginCredentials,
  RegisterCredentials,
  ResetPassword,
  SocialAuthCredentials,
  User,
} from "../features/auth/types";
import {
  accessTokenAxiosClient,
  axiosClient,
} from "../utils/request/axiosClient";
import { apiRequest } from "../utils/request/http-request";

class AuthService {
  async login(credentials: LoginCredentials): Promise<void> {
    return apiRequest<void>(() =>
      axiosClient.post("/auth/login", credentials).then((res) => {
        window.location.href = `${window.location.origin}/auth/callback?access_token=${res.data.data.access_token}&refresh_token=${res.data.data.refresh_token}`;
        return res;
      }),
    );
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    return apiRequest<User>(() =>
      axiosClient.post<User>("/auth/register", credentials),
    );
  }

  async resendVerification(email: string): Promise<void> {
    return apiRequest<void>(() =>
      axiosClient.post("/resend-verification", {
        email,
      }),
    );
  }

  async verifyToken(token: string): Promise<void> {
    return apiRequest<void>(() =>
      axiosClient.get("/auth/verify-token", {
        params: { token },
      }),
    );
  }

  async forgotPassword(email: string): Promise<void> {
    return apiRequest<void>(() =>
      axiosClient.post("/auth/forgot-password", {
        email,
      }),
    );
  }

  async resetPassword(resetPassword: ResetPassword): Promise<void> {
    return apiRequest<void>(() =>
      axiosClient.post("/auth/reset-password", {
        password: resetPassword.password,
        token: resetPassword.token,
      }),
    );
  }

  async socialAuth({ provider, token }: SocialAuthCredentials): Promise<User> {
    return apiRequest<User>(() =>
      axiosClient
        .post(`/auth/${provider}`, {
          body: JSON.stringify({ token }),
        })
        .then((res) => {
          localStorage.setItem("token", res.data.token);
          return res;
        }),
    );
  }

  async logout(): Promise<void> {
    localStorage.removeItem("token");
  }

  async getUserInfo(): Promise<User | null> {
    return apiRequest<User | null>(() =>
      accessTokenAxiosClient.get("/auth/me"),
    );
  }
}

export const authService = new AuthService();
