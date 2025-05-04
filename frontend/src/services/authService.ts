import {
  LoginCredentials,
  RegisterCredentials,
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
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("Đăng nhập thất bại");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    return data.user;
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      localStorage.setItem("token", data.token);
      return data;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Đăng ký thất bại",
      );
    }
  }

  async resendVerification(email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      return data;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Gửi lại mã xác minh thất bại",
      );
    }
  }

  async verifyToken(token: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/verify-token?token=${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      return data;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Xác thực mã thất bại",
      );
    }
  }

  async socialAuth({ provider, token }: SocialAuthCredentials): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${provider}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error("Đăng nhập bằng mạng xã hội thất bại");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    return data.user;
  }

  async logout(): Promise<void> {
    localStorage.removeItem("token");
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await fetch(`${this.baseUrl}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      localStorage.removeItem("token");
      return null;
    }

    const data = await response.json();
    return data.user;
  }
}

export const authService = new AuthService();
