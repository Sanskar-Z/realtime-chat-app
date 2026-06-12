import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css'
import { AuthProvider } from "./context/AuthProvider";
import { ModeProvider } from "./context/ModeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ModeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ModeProvider>
  </React.StrictMode>
);
