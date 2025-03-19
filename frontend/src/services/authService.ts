import { LoginCredentials, RegisterCredentials, SocialAuthCredentials, User } from '../features/auth/types';

class AuthService {
    private baseUrl = 'http://localhost:3001/api/auth';

    async login(credentials: LoginCredentials): Promise<User> {
        const response = await fetch(`${this.baseUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            throw new Error('Đăng nhập thất bại');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        return data.user;
    }

    async register(credentials: RegisterCredentials): Promise<User> {
        const response = await fetch(`${this.baseUrl}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            throw new Error('Đăng ký thất bại');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        return data.user;
    }

    async socialAuth({ provider, token }: SocialAuthCredentials): Promise<User> {
        const response = await fetch(`${this.baseUrl}/${provider}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            throw new Error('Đăng nhập bằng mạng xã hội thất bại');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        return data.user;
    }

    async logout(): Promise<void> {
        localStorage.removeItem('token');
    }

    async getCurrentUser(): Promise<User | null> {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const response = await fetch(`${this.baseUrl}/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            return null;
        }

        const data = await response.json();
        return data.user;
    }
}

export const authService = new AuthService(); 