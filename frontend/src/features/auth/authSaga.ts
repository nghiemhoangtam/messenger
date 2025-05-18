import { PayloadAction } from "@reduxjs/toolkit";
import { call, put, takeLatest } from "redux-saga/effects";
import { authService } from "../../services/authService";
import { ErrorState } from "../../types/error";
import { AppError } from "../../utils/errors";
import {
  forgotPasswordRequest,
  forgotPasswordSuccess,
  getUserInfoRequest,
  getUserInfoSuccess,
  loginRequest,
  loginSuccess,
  logoutRequest,
  logoutSuccess,
  registerRequest,
  registerSuccess,
  resendVerificationRequest,
  resendVerificationSuccess,
  resetPasswordRequest,
  resetPasswordSuccess,
  setCommonFailed,
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

function toErrorState(error: AppError): ErrorState {
  return {
    code: error.code,
    messages: error.messages,
  };
}

function* handleLogin(action: PayloadAction<LoginCredentials>) {
  try {
    const user: User = yield call(authService.login, action.payload);
    yield put(loginSuccess(user));
  } catch (error) {
    yield put(setCommonFailed(toErrorState(error as AppError)));
  }
}

function* handleRegister(action: PayloadAction<RegisterCredentials>) {
  try {
    const user: User = yield call(authService.register, action.payload);
    yield put(registerSuccess(user));
  } catch (error) {
    yield put(setCommonFailed(toErrorState(error as AppError)));
  }
}

function* handleResendVerification(action: PayloadAction<string>) {
  try {
    yield call(authService.resendVerification, action.payload);
    yield put(resendVerificationSuccess());
  } catch (error) {
    yield put(setCommonFailed(toErrorState(error as AppError)));
  }
}

function* handleVerifyToken(action: PayloadAction<string>) {
  try {
    yield call(authService.verifyToken, action.payload);
    yield put(verifyTokenSuccess());
  } catch (error) {
    yield put(setCommonFailed(toErrorState(error as AppError)));
  }
}

function* handleForgotPassword(action: PayloadAction<string>) {
  try {
    yield call(authService.forgotPassword, action.payload);
    yield put(forgotPasswordSuccess());
  } catch (error) {
    yield put(setCommonFailed(toErrorState(error as AppError)));
  }
}

function* handleResetPassword(action: PayloadAction<ResetPassword>) {
  try {
    yield call(authService.resetPassword, action.payload);
    yield put(resetPasswordSuccess());
  } catch (error) {
    yield put(setCommonFailed(toErrorState(error as AppError)));
  }
}

function* handleSocialAuth(action: PayloadAction<SocialAuthCredentials>) {
  try {
    const user: User = yield call(authService.socialAuth, action.payload);
    yield put(socialAuthSuccess(user));
  } catch (error) {
    yield put(setCommonFailed(toErrorState(error as AppError)));
  }
}

function* handleLogout() {
  try {
    yield call(authService.logout);
    yield put(logoutSuccess());
  } catch (error) {
    yield put(setCommonFailed(toErrorState(error as AppError)));
  }
}

function* handleGetUserInfo() {
  try {
    const user: User = yield call(authService.getUserInfo);
    yield put(getUserInfoSuccess(user));
  } catch (error) {
    yield put(setCommonFailed(toErrorState(error as AppError)));
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
  yield takeLatest(getUserInfoRequest.type, handleGetUserInfo);
}
