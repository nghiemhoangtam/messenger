import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ErrorState } from "../../types/error";
import { PaginationRequest } from "../../types/pagination-request";
import { createPaginationResponse, PaginationResponse } from "../../types/pagination-response";
import { Contact, ContactsState } from "./types";

const initialState: ContactsState = {
  acceptedFriendPagination: createPaginationResponse<Contact>(),
  receivedFriendPagination: createPaginationResponse<Contact>(),
  sentFriendPagination: createPaginationResponse<Contact>(),
  searchAnotherUserPagination: createPaginationResponse<Contact>(),
  status: "idle",
  error: null,
};

const setLoading = (state: ContactsState) => {
  state.status = "loading";
  state.error = null;
};

const contactsSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    fetchAcceptedFriendsRequest: (
      state,
      action: PayloadAction<PaginationRequest>
    ) => setLoading(state),
    fetchAcceptedFriendsSuccess: (
      state,
      action: PayloadAction<PaginationResponse<Contact>>
    ) => {
      state.acceptedFriendPagination = {
        ...action.payload,
        results: [
          ...state.acceptedFriendPagination.results,
          ...action.payload.results,
        ],
      };
      state.status = "succeeded";
    },
    fetchReceiveFriendsRequest: (
      state,
      action: PayloadAction<PaginationRequest>
    ) => setLoading(state),
    fetchReceiveFriendsSuccess: (
      state,
      action: PayloadAction<PaginationResponse<Contact>>
    ) => {
      state.receivedFriendPagination = {
        ...action.payload,
        results: [
          ...state.receivedFriendPagination.results,
          ...action.payload.results,
        ],
      };
      state.status = "succeeded";
    },
    searchFriendsRequest: (state, action: PayloadAction<PaginationRequest>) =>
      setLoading(state),
    searchFriendsSuccess: (
      state,
      action: PayloadAction<PaginationResponse<Contact>>
    ) => {
      state.acceptedFriendPagination = {
        ...action.payload,
        results: action.payload.results,
      };
      state.status = "succeeded";
    },
    fetchSentFriendsRequest: (state, action: PayloadAction<PaginationRequest>) =>
      setLoading(state),
    fetchSentFriendsSuccess: (
      state,
      action: PayloadAction<PaginationResponse<Contact>>
    ) => {
      state.sentFriendPagination = {
        ...action.payload,
        results: action.payload.results,
      };
      state.status = "succeeded";
    },
    searchAnotherUserRequest: (state, action: PayloadAction<PaginationRequest>) =>
      setLoading(state),
    searchAnotherUserSuccess: (
      state,
      action: PayloadAction<PaginationResponse<Contact>>
    ) => {
      state.searchAnotherUserPagination.results = [
        ...state.searchAnotherUserPagination.results,
        ...action.payload.results,
      ];
      state.status = "succeeded";
    },
    sendFriendRequest: (state, action: PayloadAction<string>) =>
      setLoading(state),
    sendFriendRequestSuccess: (state, action: PayloadAction<string>) => {
      const currentContact = state.searchAnotherUserPagination.results.find(
        (contact) => contact.id === action.payload
      );
      if (currentContact) {
        state.searchAnotherUserPagination.results = state.searchAnotherUserPagination.results.filter(
          (contact) => contact.id !== action.payload
        );
        state.sentFriendPagination.results = [
          ...state.sentFriendPagination.results,
          currentContact,
        ];
        state.sentFriendPagination.meta.total += 1;
        state.searchAnotherUserPagination.meta.total -= 1;
      }
      state.status = "succeeded";
    },
    acceptFriendRequest: (state, action: PayloadAction<string>) =>
      setLoading(state),
    acceptFriendRequestSuccess: (state, action: PayloadAction<string>) => {
      const currentContact = state.receivedFriendPagination.results.find(
        (contact) => contact.id === action.payload
      );
      if (currentContact) {
      state.receivedFriendPagination.results =
        state.receivedFriendPagination.results.filter(
          (contact) => contact.id !== action.payload
        );
      state.acceptedFriendPagination.results = [
        ...state.acceptedFriendPagination.results,
        currentContact,
      ];
      state.acceptedFriendPagination.meta.total += 1;
      }
      state.status = "succeeded";
    },
    rejectFriendRequest: (state, action: PayloadAction<string>) =>
      setLoading(state),
    rejectFriendRequestSuccess: (state, action: PayloadAction<string>) => {
      state.receivedFriendPagination.results = state.receivedFriendPagination.results.filter(
        (contact) => contact.id !== action.payload
      );
      state.receivedFriendPagination.meta.total -= 1;
      state.status = "succeeded";
    },
    removeFriendRequest: (state, action: PayloadAction<string>) =>
      setLoading(state),
    removeFriendSuccess: (state, action: PayloadAction<string>) => {
      state.sentFriendPagination.results =
        state.sentFriendPagination.results.filter(
          (contact) => contact.id !== action.payload
        );
      state.sentFriendPagination.meta.total -= 1;
      state.status = "succeeded";
    },
    // Uncomment and implement these if needed
    // fetchSentFriendsRequest: (state) => setLoading(state),
    // fetchSentFriendsSuccess: (state, action: PayloadAction<Contact[]>) => {
    //   state.contacts = action.payload;
    //   state.status = "succeeded";
    // },
    // fetchBlockedFriendsRequest: (state) => setLoading(state),
    // fetchBlockedFriendsSuccess: (state, action: PayloadAction<Contact[]>) => {
    //   state.contacts = action.payload;
    //   state.status = "succeeded";
    // },
    setCommonFailed: (
      state: ContactsState,
      action: PayloadAction<ErrorState>
    ) => {
      state.status = "failed";
      state.error = action.payload;
    },
    updateContactStatus: (
      state,
      action: PayloadAction<{ id: string; status: Contact["status"] }>
    ) => {
      // const contact = state.contacts.find((c) => c.id === action.payload.id);
      // if (contact) {
      //   contact.status = action.payload.status;
      //   if (action.payload.status === "offline") {
      //     contact.last_seen = new Date().toISOString();
      //   }
      // }
    },
  },
});

export const {
  fetchAcceptedFriendsRequest,
  fetchAcceptedFriendsSuccess,
  fetchReceiveFriendsRequest,
  fetchReceiveFriendsSuccess,
  searchFriendsRequest,
  searchFriendsSuccess,
  fetchSentFriendsRequest,
  fetchSentFriendsSuccess,
  searchAnotherUserRequest,
  searchAnotherUserSuccess,
  sendFriendRequest,
  sendFriendRequestSuccess,
  acceptFriendRequest,
  acceptFriendRequestSuccess,
  rejectFriendRequest,
  rejectFriendRequestSuccess,
  removeFriendRequest,
  removeFriendSuccess,
  // fetchBlockedFriendsRequest,
  // fetchBlockedFriendsSuccess,
  setCommonFailed,
  updateContactStatus,
} = contactsSlice.actions;

export default contactsSlice.reducer;
