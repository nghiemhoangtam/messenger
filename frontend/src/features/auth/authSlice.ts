import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  ResetPassword,
  SocialAuthCredentials,
  User,
} from "./types";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Login with email/password
    loginRequest: (state, action: PayloadAction<LoginCredentials>) => {
      state.status = "loading";
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.status = "succeeded";
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },

    // Register with email/password
    registerRequest: (state, action: PayloadAction<RegisterCredentials>) => {
      state.status = "loading";
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.status = "succeeded";
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },

    // Resend verification email
    resendVerificationRequest: (state, action: PayloadAction<string>) => {
      state.status = "loading";
      state.error = null;
    },
    resendVerificationSuccess: (state) => {
      state.status = "succeeded";
      state.error = null;
    },
    resendVerificationFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },

    // Verify email
    verifyTokenRequest: (state, action: PayloadAction<string>) => {
      state.status = "loading";
      state.error = null;
    },
    verifyTokenSuccess: (state) => {
      state.status = "succeeded";
      state.error = null;
    },
    verifyTokenFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },

    // Forgot password
    forgotPasswordRequest: (state, action: PayloadAction<string>) => {
      state.status = "loading";
      state.error = null;
    },
    forgotPasswordSuccess: (state) => {
      state.status = "succeeded";
      state.error = null;
    },
    forgotPasswordFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },

    // Reset password
    resetPasswordRequest: (state, action: PayloadAction<ResetPassword>) => {
      state.status = "loading";
      state.error = null;
    },
    resetPasswordSuccess: (state) => {
      state.status = "succeeded";
      state.error = null;
    },
    resetPasswordFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },

    // Social authentication
    socialAuthRequest: (
      state,
      action: PayloadAction<SocialAuthCredentials>,
    ) => {
      state.status = "loading";
      state.error = null;
    },
    socialAuthSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.status = "succeeded";
      state.error = null;
    },
    socialAuthFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },

    // Logout
    logoutRequest: (state) => {
      state.status = "loading";
      state.error = null;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = "succeeded";
      state.error = null;
    },
    logoutFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    resetStatus: (state, action: PayloadAction<void>) => {
      state.status = "idle";
    },
    resetStatusAndError: (state) => {
      state.error = null;
      state.status = "idle";
    },

    // Set user info
    getUserInfoRequest: (state, action: PayloadAction<void>) => {
      state.status = "loading";
      state.error = null;
    },
    getUserInfoSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.status = "succeeded";
      state.error = null;
      state.isAuthenticated = true;
    },
    getUserInfoFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
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
  resendVerificationRequest,
  resendVerificationSuccess,
  resendVerificationFailure,
  verifyTokenRequest,
  verifyTokenSuccess,
  verifyTokenFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
  socialAuthRequest,
  socialAuthSuccess,
  socialAuthFailure,
  logoutRequest,
  logoutSuccess,
  logoutFailure,
  logout,
  resetStatus,
  resetStatusAndError,
  getUserInfoRequest,
  getUserInfoSuccess,
  getUserInfoFailure,
} = authSlice.actions;

export default authSlice.reducer;
