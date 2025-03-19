import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials, RegisterCredentials, SocialAuthCredentials, User } from './types';

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Login with email/password
        loginRequest: (state, action: PayloadAction<LoginCredentials>) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Register with email/password
        registerRequest: (state, action: PayloadAction<RegisterCredentials>) => {
            state.loading = true;
            state.error = null;
        },
        registerSuccess: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
        },
        registerFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Social authentication
        socialAuthRequest: (state, action: PayloadAction<SocialAuthCredentials>) => {
            state.loading = true;
            state.error = null;
        },
        socialAuthSuccess: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
        },
        socialAuthFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Logout
        logoutRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        logoutSuccess: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },
        logoutFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    loginRequest,
    loginSuccess,
    loginFailure,
    registerRequest,
    registerSuccess,
    registerFailure,
    socialAuthRequest,
    socialAuthSuccess,
    socialAuthFailure,
    logoutRequest,
    logoutSuccess,
    logoutFailure,
    clearError,
} = authSlice.actions;

export default authSlice.reducer; 