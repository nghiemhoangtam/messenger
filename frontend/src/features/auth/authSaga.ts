import { PayloadAction } from "@reduxjs/toolkit";
import { call, put, takeLatest } from "redux-saga/effects";
import { authService } from "../../services/authService";
import {
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
  socialAuthFailure,
  socialAuthRequest,
  socialAuthSuccess,
  verifyTokenRequest,
  verifyTokenSuccess,
} from "./authSlice";
import {
  LoginCredentials,
  RegisterCredentials,
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
        error instanceof Error ? error.message : "Đăng nhập thất bại",
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
        error instanceof Error ? error.message : "Đăng ký thất bại",
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
        error instanceof Error ? error.message : "Gửi lại mã xác thực thất bại",
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
        error instanceof Error ? error.message : "Xác thực mã thất bại",
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
        error instanceof Error
          ? error.message
          : "Đăng nhập bằng mạng xã hội thất bại",
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
        error instanceof Error ? error.message : "Đăng xuất thất bại",
      ),
    );
  }
}

export function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(registerRequest.type, handleRegister);
  yield takeLatest(resendVerificationRequest.type, handleResendVerification);
  yield takeLatest(verifyTokenRequest.type, handleVerifyToken);
  yield takeLatest(socialAuthRequest.type, handleSocialAuth);
  yield takeLatest(logoutRequest.type, handleLogout);
}
