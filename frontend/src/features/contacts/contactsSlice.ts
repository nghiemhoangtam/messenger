import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ErrorState } from "../../types/error";
import { PaginationRequest } from "../../types/pagination-request";
import { PaginationResponse } from "../../types/pagination-response";
import { Contact, ContactsState } from "./types";

const initialState: ContactsState = {
  acceptedFriendPagination: new PaginationResponse<Contact>(),
  receivedFriendPagination: new PaginationResponse<Contact>(),
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
  // fetchSentFriendsRequest,
  // fetchSentFriendsSuccess,
  // fetchBlockedFriendsRequest,
  // fetchBlockedFriendsSuccess,
  setCommonFailed,
  updateContactStatus,
} = contactsSlice.actions;

export default contactsSlice.reducer;
