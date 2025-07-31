import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Home from "../pages/Home";
import Login from "../features/Auth/components/Login";
import NotFound from "../pages/NotFound";
import Admin from "../features/AdminDashboard/Admin";
import ManagerUser from "../features/AdminDashboard/ManagerUser";
import ManageBooks from "../pages/ManageBooks";
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
    ],
  },
]);

export default routers;
