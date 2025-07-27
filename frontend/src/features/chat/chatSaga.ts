import { PayloadAction } from "@reduxjs/toolkit";
import { call, put, takeLatest } from "redux-saga/effects";
import { roomService } from "../../services/roomService";
import { userService } from "../../services/userService";
import { PaginationRequest } from "../../types/pagination-request";
import { PaginationResponse } from "../../types/pagination-response";
import { Contact } from "../contacts/types";
import {
  createGroupRoomFailure,
  createGroupRoomRequest,
  createGroupRoomSuccess,
  fetchConversationsFailure,
  fetchConversationsRequest,
  fetchConversationsSuccess,
  fetchMessagesFailure,
  fetchMessagesRequest,
  fetchMessagesSuccess,
  searchGroupUserFailure,
  searchGroupUserRequest,
  searchGroupUserSuccess,
  sendMessageFailure,
  sendMessageRequest,
  sendMessageSuccess,
} from "./chatSlice";
import { Conversation, CreateGroupRoomRequest } from "./types";

function* handleFetchConversations(action: PayloadAction<PaginationRequest>) {
  try {
    const conversationPage: PaginationResponse<Conversation> = yield call(
      roomService.getConversations,
      action.payload
    );
    yield put(fetchConversationsSuccess(conversationPage));
  } catch (error: any) {
    yield put(
      fetchConversationsFailure(
        error instanceof Error ? error.message : "Failed to fetch conversations"
      )
    );
  }
}

function* handleFetchMessages(action: PayloadAction<string>) {
  try {
    // TODO: Gọi API lấy messages theo roomId nếu cần
    yield put(
      fetchMessagesSuccess({
        conversationId: action.payload,
        messages: [],
      })
    );
  } catch (error) {
    yield put(
      fetchMessagesFailure(
        error instanceof Error ? error.message : "Failed to fetch messages"
      )
    );
  }
}

function* handleSendMessage(
  action: PayloadAction<{ roomId: string; content: string }>,
) {
  try {
    // TODO: Gọi API gửi message nếu cần
    yield put(sendMessageSuccess({
      id: Date.now().toString(),
      room_id: action.payload.roomId,
      sender: {} as any,
      content: action.payload.content,
      created_at: new Date(),
      status: "sent",
    }));
  } catch (error) {
    yield put(
      sendMessageFailure(
        error instanceof Error ? error.message : "Failed to send message"
      )
    );
  }
}

function* handleSearchGroupUser(
  action: PayloadAction<PaginationRequest>
): Generator<any, void, any> {
  try {
    const activeUserPage: PaginationResponse<Contact> = yield call(
      userService.searchActiveUser,
      action.payload
    );
    yield put(searchGroupUserSuccess(activeUserPage));
  } catch (error) {
    yield put(
      searchGroupUserFailure(
        error instanceof Error ? error.message : "Failed to fetch active users"
      )
    );
  }
}

function* handleCreateGroupRoom(action: PayloadAction<CreateGroupRoomRequest>) {
  try {
    const groupRoom: Conversation = yield call(
      roomService.createGroupRoom,
      action.payload
    );
    yield put(createGroupRoomSuccess(groupRoom));
  } catch (error) {
    yield put(
      createGroupRoomFailure(
        error instanceof Error ? error.message : "Failed to create group room"
      )
    );
  }
}

export function* chatSaga() {
  yield takeLatest(fetchConversationsRequest.type, handleFetchConversations);
  yield takeLatest(fetchMessagesRequest.type, handleFetchMessages);
  yield takeLatest(sendMessageRequest.type, handleSendMessage);
  yield takeLatest(searchGroupUserRequest.type, handleSearchGroupUser);
  yield takeLatest(createGroupRoomRequest.type, handleCreateGroupRoom);
}
