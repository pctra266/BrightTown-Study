import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Login from "../features/Auth/components/Login";
import NotFound from "../pages/NotFound";
import Admin from "../features/AdminDashboard/Admin";
import ManagerUser from "../features/AdminDashboard/ManagerUser";
import UserViewer from "../features/AdminDashboard/UserViewer";
import UserCreate from "../features/AdminDashboard/UserCreate";
import ManageBooks from "../pages/ManageBooks";
import ForgotPassword from "../features/Auth/components/ForgotPassword";
import Library from "../pages/Library";
import Home from "../pages/Home";
import SignUp from "../features/Auth/components/SignUp";
import UserEdit from "../features/AdminDashboard/UserEdit";
import FlashcardList from "../features/AdminDashboard/Flashcardmanager/FlashcardList";
import ProtectedRouteAdmin from "../features/AdminDashboard/ProtectedRouteAdmin";

const routers = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <SignUp /> },
      { path: "library", element: <Library /> },
      { path: "book", element: <ManageBooks /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      {
        path: "admin",
        element: (
          <ProtectedRouteAdmin>
            <Admin />
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: "admin/users",
        element: (
          <ProtectedRouteAdmin>
            <ManagerUser />
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: "admin/users/:id",
        element: (
          <ProtectedRouteAdmin>
            <UserViewer />
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: "admin/users/create",
        element: (
          <ProtectedRouteAdmin>
            <UserCreate />
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: "admin/users/:id/edit",
        element: (
          <ProtectedRouteAdmin>
            <UserEdit />
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: "admin/flashcards",
        element: (
          <ProtectedRouteAdmin>
            <FlashcardList />
          </ProtectedRouteAdmin>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default routers;
