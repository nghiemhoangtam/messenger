import { PayloadAction } from "@reduxjs/toolkit";
import { call, put, takeLatest } from "redux-saga/effects";
import { chatService } from "../../services/chatService";
import { contactService } from "../../services/contactService";
import { roomService } from "../../services/roomService";
import { socketService } from "../../services/socketService";
import { userService } from "../../services/userService";
import { PaginationRequest } from "../../types/pagination-request";
import { PaginationResponse } from "../../types/pagination-response";
import { Contact } from "../contacts/types";
import {
  createGroupRoomFailure,
  createGroupRoomRequest,
  createGroupRoomSuccess,
  createPrivateRoomFailure,
  createPrivateRoomRequest,
  createPrivateRoomSuccess,
  deleteMessageFailure,
  deleteMessageRequest,
  deleteMessageSuccess,
  editMessageFailure,
  editMessageRequest,
  editMessageSuccess,
  fetchConversationsFailure,
  fetchConversationsRequest,
  fetchConversationsSuccess,
  fetchMessagesFailure,
  fetchMessagesRequest,
  fetchMessagesSuccess,
  getAvailableFriendsFailure,
  getAvailableFriendsRequest,
  getAvailableFriendsSuccess,
  markMessagesAsReadFailure,
  markMessagesAsReadRequest,
  markMessagesAsReadSuccess,
  removeAvailableFriend,
  searchGroupUserFailure,
  searchGroupUserRequest,
  searchGroupUserSuccess,
  sendMessageFailure,
  sendMessageRequest,
  sendMessageSuccess,
} from "./chatSlice";
import { Conversation, CreateGroupRoomRequest, Message } from "./types";

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

function* handleSendMessage(
  action: PayloadAction<{ conversationId: string; content: string; type?: string }>,
) {
  try {

    
    // Sử dụng WebSocket để gửi tin nhắn real-time thay vì REST API
    const messageData = {
      room_id: action.payload.conversationId,
      content: action.payload.content,
      type: action.payload.type || "text"
    };
    
    // Gửi tin nhắn qua WebSocket
    socketService.sendMessage(messageData);
    
    // Không tạo temp message nữa, chỉ đánh dấu là đã gửi thành công
    yield put(sendMessageSuccess());
  } catch (error) {
    console.error('Error sending message:', error);
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

function* handleGetAvailableFriends(action: PayloadAction<PaginationRequest>) {
  try {
    const friendPage: PaginationResponse<Contact> = yield call(
      contactService.getAvailableFriends,
      action.payload
    );
    yield put(getAvailableFriendsSuccess(friendPage));
  } catch (error) {
    yield put(
      getAvailableFriendsFailure(
        error instanceof Error ? error.message : "Failed to get available friends"
      )
    );
  }
}

function* handleCreatePrivateRoom(action: PayloadAction<string>) {

  try {
    const privateRoom: Conversation = yield call(
      roomService.createPrivateRoom,
      action.payload
    );
    yield put(createPrivateRoomSuccess(privateRoom));
    yield put(removeAvailableFriend(action.payload));
  } catch (error) {
    yield put(
      createPrivateRoomFailure(
        error instanceof Error ? error.message : "Failed to create private room"
      )
    );
  }
}

function* handleMarkMessagesAsRead(action: PayloadAction<string>) {
  try {
    yield call(chatService.markMessagesAsRead, action.payload);
    yield put(markMessagesAsReadSuccess(action.payload));
  } catch (error) {
    yield put(
      markMessagesAsReadFailure(
        error instanceof Error
          ? error.message
          : "Failed to mark messages as read"
      )
    );
  }
}

function* handleGetMessages(action: PayloadAction<{ roomId: string; pageRequest: PaginationRequest }>) {
  try {
    const messages: PaginationResponse<Message> = yield call(chatService.getMessages, action.payload.roomId, action.payload.pageRequest);
    yield put(fetchMessagesSuccess({
      roomId: action.payload.roomId,
      messages,
    }));
  } catch (error) {
    yield put(fetchMessagesFailure(error instanceof Error ? error.message : "Failed to fetch messages"));
  }
}

function* handleEditMessage(action: PayloadAction<{ messageId: string; content: string }>) {
  try {
    const updatedMessage: Message = yield call(
      chatService.editMessage,
      action.payload.messageId,
      action.payload.content
    );
    yield put(editMessageSuccess(updatedMessage));
  } catch (error) {
    yield put(
      editMessageFailure({
        messageId: action.payload.messageId,
        error: error instanceof Error ? error.message : "Failed to edit message"
      })
    );
  }
}

function* handleDeleteMessage(action: PayloadAction<{ messageId: string }>) {
  try {
    yield call(chatService.deleteMessage, action.payload.messageId);
    yield put(deleteMessageSuccess({ messageId: action.payload.messageId }));
  } catch (error) {
    yield put(
      deleteMessageFailure({
        messageId: action.payload.messageId,
        error: error instanceof Error ? error.message : "Failed to delete message"
      })
    );
  }
}

export function* chatSaga() {
  yield takeLatest(fetchConversationsRequest.type, handleFetchConversations);
  yield takeLatest(sendMessageRequest.type, handleSendMessage);
  yield takeLatest(searchGroupUserRequest.type, handleSearchGroupUser);
  yield takeLatest(createGroupRoomRequest.type, handleCreateGroupRoom);
  yield takeLatest(getAvailableFriendsRequest.type, handleGetAvailableFriends);
  yield takeLatest(createPrivateRoomRequest.type, handleCreatePrivateRoom);
  yield takeLatest(markMessagesAsReadRequest.type, handleMarkMessagesAsRead);
  yield takeLatest(fetchMessagesRequest.type, handleGetMessages);
  yield takeLatest(editMessageRequest.type, handleEditMessage);
  yield takeLatest(deleteMessageRequest.type, handleDeleteMessage);
}
