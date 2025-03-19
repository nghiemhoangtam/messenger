import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from "redux-saga";
import callsReducer from "../features/calls/callsSlice";
import chatReducer from "../features/chat/chatSlice";
import rootSaga from "./sagas";
import authReducer from "./slices/authSlice";
import contactsReducer from "./slices/contactsSlice";
import groupsReducer from "./slices/groupsSlice";
import profileReducer from "./slices/profileSlice";
import settingsReducer from "./slices/settingsSlice";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        profile: profileReducer,
        contacts: contactsReducer,
        groups: groupsReducer,
        calls: callsReducer,
        settings: settingsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 