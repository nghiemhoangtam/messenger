import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import React from "react";
import { Provider } from "react-redux";
import "./App.css";
import { AppRoutes } from "./routes";
import { store } from "./store";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConfigProvider locale={viVN}>
        <AppRoutes />
      </ConfigProvider>
    </Provider>
  );
};

export default App;
