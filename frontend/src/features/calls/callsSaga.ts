import { PayloadAction } from '@reduxjs/toolkit';
import { call, delay, put, takeLatest } from 'redux-saga/effects';
import { socketService } from '../../services/socketService';
import { User } from '../auth/types';
import {
    answerCallFailure,
    answerCallRequest,
    answerCallSuccess,
    Call,
    endCallFailure,
    endCallRequest,
    endCallSuccess,
    fetchCallsFailure,
    fetchCallsRequest,
    fetchCallsSuccess,
    startCallFailure,
    startCallRequest,
    startCallSuccess,
    updateCallStatus,
} from './callsSlice';

// Mock API calls
const mockFetchCalls = async (): Promise<Call[]> => {
    await delay(1000);
    return [];
};

function* handleFetchCalls() {
    try {
        const calls: Call[] = yield call(mockFetchCalls);
        yield put(fetchCallsSuccess(calls));
    } catch (error) {
        yield put(fetchCallsFailure(error instanceof Error ? error.message : 'Failed to fetch calls'));
    }
}

function* handleStartCall(action: PayloadAction<{ participant: User; type: 'audio' | 'video' }>) {
    try {
        const { participant, type } = action.payload;
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        const call: Call = {
            id: Date.now().toString(),
            caller: currentUser,
            receiver: participant,
            type,
            status: 'ringing',
            startTime: new Date(),
            endTime: undefined,
            duration: undefined,
        };

        yield put(startCallSuccess(call));
        socketService.startCall(participant.id, type);
    } catch (error) {
        yield put(startCallFailure(error instanceof Error ? error.message : 'Failed to start call'));
    }
}

function* handleAnswerCall() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        yield put(updateCallStatus({ status: 'connected' }));
        socketService.answerCall(currentUser.id);
        yield put(answerCallSuccess({} as Call));
    } catch (error) {
        yield put(answerCallFailure(error instanceof Error ? error.message : 'Failed to answer call'));
    }
}

function* handleEndCall() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        yield put(updateCallStatus({ status: 'ended' }));
        socketService.endCall(currentUser.id);
        yield put(endCallSuccess({} as Call));
    } catch (error) {
        yield put(endCallFailure(error instanceof Error ? error.message : 'Failed to end call'));
    }
}

export function* callsSaga() {
    yield takeLatest(fetchCallsRequest.type, handleFetchCalls);
    yield takeLatest(startCallRequest.type, handleStartCall);
    yield takeLatest(answerCallRequest.type, handleAnswerCall);
    yield takeLatest(endCallRequest.type, handleEndCall);
} 