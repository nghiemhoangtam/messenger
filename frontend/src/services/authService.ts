import axios from "axios";
import {
  LoginCredentials,
  RegisterCredentials,
  ResetPassword,
  SocialAuthCredentials,
  User,
} from "../features/auth/types";

class AuthService {
  private baseUrl = "http://localhost:8080/auth";

  constructor() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.resendVerification = this.resendVerification.bind(this);
    this.socialAuth = this.socialAuth.bind(this);
    this.logout = this.logout.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.verifyToken = this.verifyToken.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await axios.post(`${this.baseUrl}/login`, credentials, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;

      localStorage.setItem("token", data.data.token);
      return data.data.user;
    } catch (error: any) {
      const message = error.response?.data?.message;
      throw new Error(message);
    }
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/register`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message;
      throw new Error(message);
    }
  }

  async resendVerification(email: string): Promise<void> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/resend-verification`,
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message;
      throw new Error(message);
    }
  }

  async verifyToken(token: string): Promise<void> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/verify-token?token=${token}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message;
      throw new Error(message);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/forgot-password`,
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message;
      throw new Error(message);
    }
  }

  async resetPassword(resetPassword: ResetPassword): Promise<void> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/reset-password`,
        { password: resetPassword.password, token: resetPassword.token },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message;
      throw new Error(message);
    }
  }

  async socialAuth({ provider, token }: SocialAuthCredentials): Promise<User> {
    const response = await axios.post(`${this.baseUrl}/${provider}`, {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    localStorage.setItem("token", response.data.token);
    return response.data.user;
  }

  async logout(): Promise<void> {
    localStorage.removeItem("token");
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await axios.get(`${this.baseUrl}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.user;
  }
}

export const authService = new AuthService();
