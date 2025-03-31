import React from "react";
import { useSelector } from "react-redux";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { LoginPage, RegisterPage } from "../features/auth";
import { CallsPage } from "../features/calls";
import { ChatPage } from "../features/chat/pages/ChatPage";
import { ContactsPage } from "../features/contacts/pages/ContactsPage";
import { ProfilePage } from "../features/profile/pages/ProfilePage";
import { SettingsPage } from "../features/settings/pages/SettingsPage";
import { MainLayout } from "../layouts/MainLayout";
import { RootState } from "../store";
// Import other components here

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Private Routes - All wrapped in MainLayout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout>
                <Outlet />
              </MainLayout>
            </PrivateRoute>
          }
        >
          {/* Chat Routes */}
          <Route index element={<ChatPage />} />
          <Route path="chat/:conversationId" element={<ChatPage />} />

          {/* Calls Routes */}
          <Route path="calls" element={<CallsPage />} />
          <Route path="calls/:callId" element={<CallsPage />} />

          {/* Contacts Routes */}
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="contacts/:contactId" element={<ContactsPage />} />

          {/* Profile Routes */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:userId" element={<ProfilePage />} />

          {/* Settings Routes */}
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/:section" element={<SettingsPage />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};
