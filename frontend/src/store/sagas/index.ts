import { all } from 'redux-saga/effects';
import { callsSaga } from '../../features/calls/callsSaga';
import { chatSaga } from '../../features/chat/chatSaga';
import { authSaga } from './authSaga';

export default function* rootSaga() {
    yield all([
        authSaga(),
        chatSaga(),
        callsSaga(),
    ]);
} 