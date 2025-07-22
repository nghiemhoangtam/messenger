import { PayloadAction } from "@reduxjs/toolkit";
import { call, put, takeLatest } from "redux-saga/effects";
import { contactService } from "../../services/contactService";
import { ErrorState } from "../../types/error";
import { PaginationRequest } from "../../types/pagination-request";
import { PaginationResponse } from "../../types/pagination-response";
import { AppError } from "../../utils/errors";
import {
  acceptFriendRequest,
  acceptFriendRequestSuccess,
  fetchAcceptedFriendsRequest,
  fetchAcceptedFriendsSuccess,
  fetchReceiveFriendsRequest,
  fetchReceiveFriendsSuccess,
  fetchSentFriendsRequest,
  fetchSentFriendsSuccess,
  rejectFriendRequest,
  rejectFriendRequestSuccess,
  removeFriendRequest,
  removeFriendSuccess,
  searchAnotherUserRequest,
  searchAnotherUserSuccess,
  searchFriendsRequest,
  searchFriendsSuccess,
  sendFriendRequest,
  sendFriendRequestSuccess,
  setCommonFailed,
} from "./contactsSlice";
import { Contact } from "./types";

function toErrorState(error: AppError): ErrorState {
  return {
    code: error.code,
    messages: error.messages,
  };
}

function* handleGetAcceptedFriends(action: PayloadAction<PaginationRequest>) {
  try {
    const contactPage: PaginationResponse<Contact> = yield call(
      contactService.fetchAcceptedFriends,
      action.payload
    );
    yield put(fetchAcceptedFriendsSuccess(contactPage));
  } catch (error) {
    yield put(setCommonFailed(toErrorState(error as AppError)));
  }
}

function* handleGetReceiveFriends(action: PayloadAction<PaginationRequest>) {
  try {
    const contactPage: PaginationResponse<Contact> = yield call(
      contactService.fetchReceiveFriends,
      action.payload
    );
    yield put(fetchReceiveFriendsSuccess(contactPage));
  } catch (error) {
    yield put(setCommonFailed(toErrorState(error as AppError)));
  }
}

function* handleSearchFriends(action: PayloadAction<PaginationRequest>) {
  try {
    const contactPage: PaginationResponse<Contact> = yield call(
      contactService.fetchAcceptedFriends,
      action.payload
    );
    yield put(searchFriendsSuccess(contactPage));
  } catch (error) {
    yield put(setCommonFailed(toErrorState(error as AppError)));
  }
}

function* handleSearchAnotherUser(action: PayloadAction<PaginationRequest>) {
  try {
    const contactPage: PaginationResponse<Contact> = yield call(
      contactService.searchAnotherUser,
      action.payload
    );
    yield put(searchAnotherUserSuccess(contactPage));
  } catch (error) {
    yield put(setCommonFailed(toErrorState(error as AppError)));
  }
}

function* handleFetchSentFriends(action: PayloadAction<PaginationRequest>) {
  try {
    const contactPage: PaginationResponse<Contact> = yield call(
      contactService.fetchSentFriends,
      action.payload
    );
    yield put(fetchSentFriendsSuccess(contactPage));
  } catch (error) {
    yield put(setCommonFailed(toErrorState(error as AppError)));
  }
}

function* handleSendFriendRequest(action: PayloadAction<string>) {
  try {
    yield call(contactService.sendFriendRequest, action.payload);
    yield put(sendFriendRequestSuccess(action.payload));
  } catch (error) {
    yield put(setCommonFailed(toErrorState(error as AppError)));
  }
}

function* handleAcceptFriendRequest(action: PayloadAction<string>) {
  try {
    yield call(contactService.acceptFriendRequest, action.payload);
    yield put(acceptFriendRequestSuccess(action.payload));
  } catch (error) {
    yield put(setCommonFailed(toErrorState(error as AppError)));
  }
}

function* handleRejectFriendRequest(action: PayloadAction<string>) {
  try {
    yield call(contactService.rejectFriendRequest, action.payload);
    yield put(rejectFriendRequestSuccess(action.payload));
  } catch (error) {
    yield put(setCommonFailed(toErrorState(error as AppError)));
  }
}

function* handleRemoveFriend(action: PayloadAction<string>) {
  try {
    yield call(contactService.removeFriend, action.payload);
    yield put(removeFriendSuccess(action.payload));
  } catch (error) {
    yield put(setCommonFailed(toErrorState(error as AppError)));
  }
}

export function* contactsSaga() {
  yield takeLatest(fetchAcceptedFriendsRequest.type, handleGetAcceptedFriends);
  yield takeLatest(fetchReceiveFriendsRequest.type, handleGetReceiveFriends);
  yield takeLatest(searchFriendsRequest.type, handleSearchFriends);
  yield takeLatest(searchAnotherUserRequest.type, handleSearchAnotherUser);
  yield takeLatest(fetchSentFriendsRequest.type, handleFetchSentFriends);
  yield takeLatest(sendFriendRequest.type, handleSendFriendRequest);
  yield takeLatest(acceptFriendRequest.type, handleAcceptFriendRequest);
  yield takeLatest(rejectFriendRequest.type, handleRejectFriendRequest);
  yield takeLatest(removeFriendRequest.type, handleRemoveFriend);
}
