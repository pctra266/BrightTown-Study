import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Home from "../pages/Home";
import Login from "../features/Auth/components/Login";
import NotFound from "../pages/NotFound";
import Admin from "../features/AdminDashboard/Admin";
import ManagerUser from "../features/AdminDashboard/ManagerUser";
import ManageBooks from "../pages/ManageBooks";
import ForgotPassword from "../features/Auth/components/ForgotPassword";
import Library from "../pages/Library";

const routers = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "admin", element: <Admin /> },
      { path: "library", element: <Library /> },
      { path: "manageuser", element: <ManagerUser /> },
      { path: "book", element: <ManageBooks /> },
      { path: "*", element: <NotFound /> },
      { path: "forgot-password", element: <ForgotPassword /> },
    ],
  },
]);

export default routers;
