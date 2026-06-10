import Chat from "./pages/Chat";
import RegisterUser from "./components/RegisterUser";
import LoginUser from "./components/LoginUser";
import ProtectedRoute from "../routes/ProtectedRoute";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Settings from "./pages/Settings";
import { ModeProvider } from "./context/ModeContext";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      ),
    },
    {
      path: "/register",
      element: <RegisterUser />,
    },
    {
      path: "/login",
      element: <LoginUser />,
    },
    {
      path: "/settings",
      element: (
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      )
    },
  ]);

  return (
    <ModeProvider>
      <RouterProvider router={router} />
    </ModeProvider>
  );
}

export default App;
