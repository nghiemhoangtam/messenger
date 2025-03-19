export interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    username: string;
}

export interface SocialAuthCredentials {
    provider: AuthProvider;
    token: string;
}

export type AuthProvider = 'google' | 'facebook' | 'twitter';

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
} 