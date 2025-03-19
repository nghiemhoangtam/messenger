import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import { User } from '../../features/auth/types';
import { authService } from '../../services/authService';
import {
    loginFailure,
    loginRequest,
    loginSuccess,
    registerFailure,
    registerRequest,
    registerSuccess,
} from '../slices/authSlice';

function* handleLogin(
    action: PayloadAction<{ email: string; password: string }>
): Generator<any, void, User> {
    try {
        const user: User = yield call(authService.login, action.payload);
        yield put(loginSuccess(user));
    } catch (error: any) {
        yield put(loginFailure(error.message));
    }
}

function* handleRegister(
    action: PayloadAction<{ email: string; password: string; username: string }>
): Generator<any, void, User> {
    try {
        const user: User = yield call(authService.register, action.payload);
        yield put(registerSuccess(user));
    } catch (error: any) {
        yield put(registerFailure(error.message));
    }
}

export function* authSaga(): Generator<any, void, any> {
    yield takeLatest(loginRequest.type, handleLogin);
    yield takeLatest(registerRequest.type, handleRegister);
} 