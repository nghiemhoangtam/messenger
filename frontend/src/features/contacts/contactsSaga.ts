import { PayloadAction } from "@reduxjs/toolkit";
import { call, put, takeLatest } from "redux-saga/effects";
import { contactService } from "../../services/contactService";
import { ErrorState } from "../../types/error";
import { PaginationRequest } from "../../types/pagination-request";
import { PaginationResponse } from "../../types/pagination-response";
import { AppError } from "../../utils/errors";
import {
  fetchAcceptedFriendsRequest,
  fetchAcceptedFriendsSuccess,
  fetchReceiveFriendsRequest,
  fetchReceiveFriendsSuccess,
  searchFriendsRequest,
  searchFriendsSuccess,
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

export function* contactsSaga() {
  yield takeLatest(fetchAcceptedFriendsRequest.type, handleGetAcceptedFriends);
  yield takeLatest(fetchReceiveFriendsRequest.type, handleGetReceiveFriends);
  yield takeLatest(searchFriendsRequest.type, handleSearchFriends);
}
