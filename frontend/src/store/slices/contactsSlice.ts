import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Contact {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    status: 'online' | 'offline';
    lastSeen?: string;
}

interface ContactsState {
    contacts: Contact[];
    loading: boolean;
    error: string | null;
}

const initialState: ContactsState = {
    contacts: [],
    loading: false,
    error: null,
};

const contactsSlice = createSlice({
    name: 'contacts',
    initialState,
    reducers: {
        fetchContactsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchContactsSuccess: (state, action: PayloadAction<Contact[]>) => {
            state.contacts = action.payload;
            state.loading = false;
        },
        fetchContactsFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        updateContactStatus: (state, action: PayloadAction<{ id: string; status: Contact['status'] }>) => {
            const contact = state.contacts.find(c => c.id === action.payload.id);
            if (contact) {
                contact.status = action.payload.status;
                if (action.payload.status === 'offline') {
                    contact.lastSeen = new Date().toISOString();
                }
            }
        },
    },
});

export const {
    fetchContactsRequest,
    fetchContactsSuccess,
    fetchContactsFailure,
    updateContactStatus,
} = contactsSlice.actions;

export default contactsSlice.reducer; 