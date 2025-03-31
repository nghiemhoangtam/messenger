import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../auth/types';
import { Call, CallsState } from './types';

const initialState: CallsState = {
    calls: [],
    currentCall: null,
    loading: false,
    error: null,
};

const callsSlice = createSlice({
    name: 'calls',
    initialState,
    reducers: {
        fetchCallsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchCallsSuccess: (state, action: PayloadAction<Call[]>) => {
            state.calls = action.payload;
            state.loading = false;
        },
        fetchCallsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        startCallRequest: (state, action: PayloadAction<{ participant: User; type: 'audio' | 'video' }>) => {
            state.loading = true;
            state.error = null;
        },
        startCallSuccess: (state, action: PayloadAction<Call>) => {
            state.loading = false;
            state.currentCall = action.payload;
            state.calls.unshift(action.payload);
        },
        startCallFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        answerCallRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        answerCallSuccess: (state, action: PayloadAction<Call>) => {
            state.loading = false;
            state.currentCall = action.payload;
            const index = state.calls.findIndex((call) => call.id === action.payload.id);
            if (index !== -1) {
                state.calls[index] = action.payload;
            }
        },
        answerCallFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        endCallRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        endCallSuccess: (state, action: PayloadAction<Call>) => {
            state.loading = false;
            state.currentCall = null;
            const index = state.calls.findIndex((call) => call.id === action.payload.id);
            if (index !== -1) {
                state.calls[index] = action.payload;
            }
        },
        endCallFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateCallStatus: (state, action: PayloadAction<{ status: Call['status'] }>) => {
            if (state.currentCall) {
                state.currentCall.status = action.payload.status;
                if (action.payload.status === 'ended') {
                    state.currentCall.endTime = new Date();
                    state.currentCall.duration =
                        state.currentCall.endTime.getTime() -
                        state.currentCall.startTime!.getTime();
                }
            }
        },
        receiveIncomingCall: (state, action: PayloadAction<Call>) => {
            state.currentCall = {
                ...action.payload,
                status: 'ringing',
            };
            state.calls.unshift(action.payload);
        },
    },
});

export const {
    fetchCallsRequest,
    fetchCallsSuccess,
    fetchCallsFailure,
    startCallRequest,
    startCallSuccess,
    startCallFailure,
    answerCallRequest,
    answerCallSuccess,
    answerCallFailure,
    endCallRequest,
    endCallSuccess,
    endCallFailure,
    updateCallStatus,
    receiveIncomingCall,
} = callsSlice.actions;

export default callsSlice.reducer; 