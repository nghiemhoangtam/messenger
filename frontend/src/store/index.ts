import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { all, fork } from "redux-saga/effects";

import { authSaga } from "../features/auth/authSaga";
import authReducer from "../features/auth/authSlice";
import { callsSaga } from "../features/calls/callsSaga";
import callsReducer from "../features/calls/callsSlice";
import { chatSaga } from "../features/chat/chatSaga";
import chatReducer from "../features/chat/chatSlice";
import { contactsSaga } from "../features/contacts/contactsSaga";
import contactsReducer from "../features/contacts/contactsSlice";
import groupsReducer from "../features/groups/groupsSlice";
import profileReducer from "../features/profile/profileSlice";
import settingsReducer from "../features/settings/settingsSlice";
import { socketService } from "../services/socketService";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    profile: profileReducer,
    contact: contactsReducer,
    group: groupsReducer,
    call: callsReducer,
    setting: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

function* rootSaga() {
  yield all([fork(authSaga), fork(chatSaga), fork(callsSaga), fork(contactsSaga)]);
}
sagaMiddleware.run(rootSaga);

// Initialize socketService with the store's dispatch function
socketService.initialize(store.dispatch);

// Connect socket when user is authenticated
store.subscribe(() => {
  const state = store.getState();
  const { user, token } = state.auth;
  
  if (user && token && !socketService.isConnected()) {
    socketService.connect(user.id, token);
  } else if (!user && socketService.isConnected()) {
    socketService.disconnect();
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
