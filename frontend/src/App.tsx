import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import "./App.css";
import { AuthState } from "./features/auth/types";
import { AppRoutes } from "./routes";
import { socketService } from "./services/socketService";
import { store } from "./store";

interface AppState {
  auth: AuthState;
}

const App: React.FC = () => {
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState() as AppState;
      if (state.auth.isAuthenticated && state.auth.user) {
        socketService.connect(state.auth.user.id);
      } else {
        socketService.disconnect();
      }
    });

    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, []);

  return (
    <Provider store={store}>
      <ConfigProvider locale={viVN}>
        <AppRoutes />
      </ConfigProvider>
    </Provider>
  );
};

export default App;
