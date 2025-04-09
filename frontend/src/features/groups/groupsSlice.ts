import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Group {
  id: string;
  name: string;
  avatar?: string;
  members: string[];
  admins: string[];
  createdAt: string;
}

interface GroupsState {
  groups: Group[];
  loading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  groups: [],
  loading: false,
  error: null,
};

const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    fetchGroupsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchGroupsSuccess: (state, action: PayloadAction<Group[]>) => {
      state.groups = action.payload;
      state.loading = false;
    },
    fetchGroupsFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { fetchGroupsRequest, fetchGroupsSuccess, fetchGroupsFailure } =
  groupsSlice.actions;
export default groupsSlice.reducer;
