import { createSlice } from "@reduxjs/toolkit";

interface SettingsState {
  theme: "light" | "dark";
  language: "vi" | "en";
  notifications: boolean;
}

const initialState: SettingsState = {
  theme: "light",
  language: "vi",
  notifications: true,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications;
    },
  },
});

export const { toggleTheme, setLanguage, toggleNotifications } =
  settingsSlice.actions;
export default settingsSlice.reducer;
