import { PayloadAction } from "@reduxjs/toolkit";
import { call, put, takeLatest } from "redux-saga/effects";
import { authService } from "../../services/authService";
import { INTERNAL_SERVER } from "../../utils/constants/message.constant";
import {
  forgotPasswordFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  loginFailure,
  loginRequest,
  loginSuccess,
  logoutFailure,
  logoutRequest,
  logoutSuccess,
  registerFailure,
  registerRequest,
  registerSuccess,
  resendVerificationFailure,
  resendVerificationRequest,
  resendVerificationSuccess,
  resetPasswordFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  socialAuthFailure,
  socialAuthRequest,
  socialAuthSuccess,
  verifyTokenRequest,
  verifyTokenSuccess,
} from "./authSlice";
import {
  LoginCredentials,
  RegisterCredentials,
  ResetPassword,
  SocialAuthCredentials,
  User,
} from "./types";

function* handleLogin(action: PayloadAction<LoginCredentials>) {
  try {
    const user: User = yield call(authService.login, action.payload);
    yield put(loginSuccess(user));
  } catch (error) {
    yield put(
      loginFailure(
        error instanceof Error && error.message
          ? error.message
          : INTERNAL_SERVER,
      ),
    );
  }
}

function* handleRegister(action: PayloadAction<RegisterCredentials>) {
  try {
    const user: User = yield call(authService.register, action.payload);
    yield put(registerSuccess(user));
  } catch (error) {
    yield put(
      registerFailure(
        error instanceof Error && error.message
          ? error.message
          : INTERNAL_SERVER,
      ),
    );
  }
}

function* handleResendVerification(action: PayloadAction<string>) {
  try {
    yield call(authService.resendVerification, action.payload);
    yield put(resendVerificationSuccess());
  } catch (error) {
    yield put(
      resendVerificationFailure(
        error instanceof Error && error.message
          ? error.message
          : INTERNAL_SERVER,
      ),
    );
  }
}

function* handleVerifyToken(action: PayloadAction<string>) {
  try {
    yield call(authService.verifyToken, action.payload);
    yield put(verifyTokenSuccess());
  } catch (error) {
    yield put(
      resendVerificationFailure(
        error instanceof Error && error.message
          ? error.message
          : INTERNAL_SERVER,
      ),
    );
  }
}

function* handleForgotPassword(action: PayloadAction<string>) {
  try {
    yield call(authService.forgotPassword, action.payload);
    yield put(forgotPasswordSuccess());
  } catch (error) {
    yield put(
      forgotPasswordFailure(
        error instanceof Error && error.message
          ? error.message
          : INTERNAL_SERVER,
      ),
    );
  }
}

function* handleResetPassword(action: PayloadAction<ResetPassword>) {
  try {
    yield call(authService.resetPassword, action.payload);
    yield put(resetPasswordSuccess());
  } catch (error) {
    yield put(
      resetPasswordFailure(
        error instanceof Error && error.message
          ? error.message
          : INTERNAL_SERVER,
      ),
    );
  }
}

function* handleSocialAuth(action: PayloadAction<SocialAuthCredentials>) {
  try {
    const user: User = yield call(authService.socialAuth, action.payload);
    yield put(socialAuthSuccess(user));
  } catch (error) {
    yield put(
      socialAuthFailure(
        error instanceof Error && error.message
          ? error.message
          : INTERNAL_SERVER,
      ),
    );
  }
}

function* handleLogout() {
  try {
    yield call(authService.logout);
    yield put(logoutSuccess());
  } catch (error) {
    yield put(
      logoutFailure(
        error instanceof Error && error.message
          ? error.message
          : INTERNAL_SERVER,
      ),
    );
  }
}

export function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(registerRequest.type, handleRegister);
  yield takeLatest(resendVerificationRequest.type, handleResendVerification);
  yield takeLatest(verifyTokenRequest.type, handleVerifyToken);
  yield takeLatest(forgotPasswordRequest.type, handleForgotPassword);
  yield takeLatest(resetPasswordRequest.type, handleResetPassword);
  yield takeLatest(socialAuthRequest.type, handleSocialAuth);
  yield takeLatest(logoutRequest.type, handleLogout);
}
