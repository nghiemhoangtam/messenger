import {
  LoginCredentials,
  RegisterCredentials,
  ResetPassword,
  SocialAuthCredentials,
  User,
} from "../features/auth/types";
import { accessTokenAxiosClient, axiosClient } from "./axiosClient";

class AuthService {
  async login(credentials: LoginCredentials): Promise<void> {
    try {
      const response = await axiosClient.post("/auth/login", credentials);
      const { data } = response.data;
      window.location.href = `${window.location.origin}/auth/callback?access_token=${data.access_token}&refresh_token=${data.refresh_token}`;
    } catch (error: any) {
      const message = error.response?.data?.message;
      throw new Error(message);
    }
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const response = await axiosClient.post("/auth/register", credentials);

      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message;
      throw new Error(message);
    }
  }

  async resendVerification(email: string): Promise<void> {
    try {
      const response = await axiosClient.post("/resend-verification", {
        email,
      });

      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message;
      throw new Error(message);
    }
  }

  async verifyToken(token: string): Promise<void> {
    try {
      const response = await axiosClient.get("/auth/verify-token", {
        params: { token },
      });

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message;
      throw new Error(message);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await axiosClient.post("/auth/forgot-password", {
        email,
      });
    } catch (error: any) {
      const message = error.response?.data?.message;
      throw new Error(message);
    }
  }

  async resetPassword(resetPassword: ResetPassword): Promise<void> {
    try {
      await axiosClient.post("/auth/reset-password", {
        password: resetPassword.password,
        token: resetPassword.token,
      });
    } catch (error: any) {
      const message = error.response?.data?.message;
      throw new Error(message);
    }
  }

  async socialAuth({ provider, token }: SocialAuthCredentials): Promise<User> {
    const response = await axiosClient.post(`/auth/${provider}`, {
      body: JSON.stringify({ token }),
    });

    localStorage.setItem("token", response.data.token);
    return response.data.user;
  }

  async logout(): Promise<void> {
    localStorage.removeItem("token");
  }

  async getUserInfo(): Promise<User | null> {
    try {
      const access_token = localStorage.getItem("access_token");
      if (!access_token) return null;
      const response = await accessTokenAxiosClient.get("/auth/me");
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message;
      throw new Error(message);
    }
  }
}

export const authService = new AuthService();
