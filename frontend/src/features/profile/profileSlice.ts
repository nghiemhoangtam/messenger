import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Profile {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
    phone?: string;
}

interface ProfileState {
    profile: Profile | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProfileState = {
    profile: null,
    loading: false,
    error: null,
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        updateProfileRequest: (state, action: PayloadAction<Partial<Profile>>) => {
            state.loading = true;
            state.error = null;
        },
        updateProfileSuccess: (state, action: PayloadAction<Profile>) => {
            state.profile = action.payload;
            state.loading = false;
        },
        updateProfileFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        setProfile: (state, action: PayloadAction<Profile>) => {
            state.profile = action.payload;
        },
    },
});

export const {
    updateProfileRequest,
    updateProfileSuccess,
    updateProfileFailure,
    setProfile,
} = profileSlice.actions;

export default profileSlice.reducer; 