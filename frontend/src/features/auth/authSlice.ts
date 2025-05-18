import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ErrorState } from "../../types/error";
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

const setLoading = (state: AuthState) => {
  state.status = "loading";
  state.error = null;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Login with email/password
    loginRequest: (state, action: PayloadAction<LoginCredentials>) =>
      setLoading(state),
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.status = "succeeded";
      state.error = null;
    },

    // Register with email/password
    registerRequest: (state, action: PayloadAction<RegisterCredentials>) =>
      setLoading(state),
    registerSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.status = "succeeded";
      state.error = null;
    },

    // Resend verification email
    resendVerificationRequest: (state, action: PayloadAction<string>) =>
      setLoading(state),
    resendVerificationSuccess: (state) => {
      state.status = "succeeded";
      state.error = null;
    },

    // Verify email
    verifyTokenRequest: (state, action: PayloadAction<string>) =>
      setLoading(state),
    verifyTokenSuccess: (state) => {
      state.status = "succeeded";
      state.error = null;
    },

    // Forgot password
    forgotPasswordRequest: (state, action: PayloadAction<string>) =>
      setLoading(state),
    forgotPasswordSuccess: (state) => {
      state.status = "succeeded";
      state.error = null;
    },

    // Reset password
    resetPasswordRequest: (state, action: PayloadAction<ResetPassword>) =>
      setLoading(state),
    resetPasswordSuccess: (state) => {
      state.status = "succeeded";
      state.error = null;
    },

    // Social authentication
    socialAuthRequest: (state, action: PayloadAction<SocialAuthCredentials>) =>
      setLoading(state),
    socialAuthSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.status = "succeeded";
      state.error = null;
    },

    // Logout
    logoutRequest: (state) => setLoading(state),
    logoutSuccess: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = "succeeded";
      state.error = null;
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
    getUserInfoRequest: (state, action: PayloadAction<void>) =>
      setLoading(state),
    getUserInfoSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.status = "succeeded";
      state.error = null;
      state.isAuthenticated = true;
    },
    setCommonFailed: (state: AuthState, action: PayloadAction<ErrorState>) => {
      state.status = "failed";
      state.error = action.payload;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  registerRequest,
  registerSuccess,
  resendVerificationRequest,
  resendVerificationSuccess,
  verifyTokenRequest,
  verifyTokenSuccess,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  resetPasswordRequest,
  resetPasswordSuccess,
  socialAuthRequest,
  socialAuthSuccess,
  logoutRequest,
  logoutSuccess,
  logout,
  resetStatus,
  resetStatusAndError,
  getUserInfoRequest,
  getUserInfoSuccess,
  setCommonFailed,
} = authSlice.actions;

export default authSlice.reducer;
