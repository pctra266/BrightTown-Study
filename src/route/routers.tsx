import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Home from "../pages/Home";
import Login from "../features/Auth/components/Login";
import NotFound from "../pages/NotFound";
import Admin from "../features/AdminDashboard/Admin";
import ManagerUser from "../features/AdminDashboard/ManagerUser";

const routers = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "admin", element: <Admin /> },
      { path: "manageuser", element: <ManagerUser /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default routers;
