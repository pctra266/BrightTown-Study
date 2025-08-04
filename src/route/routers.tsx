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
import DiscussionHub from "../features/Discussion/components/DiscussionHub";
import BookDetails from "../features/library-book/components/BookDetail";
const routers = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <SignUp /> },
      { path: "admin", element: <Admin /> },
      { path: "library", element: <Library /> },
      { path: "manageuser", element: <ManagerUser /> },
      { path: "book", element: <ManageBooks /> },
      { path: "manage-book", element: <ManageBooks /> },
      { path: "/books/:id", element: < BookDetails /> },
      { path: "*", element: <NotFound /> },
      { path: 'userdetail/:id', element: <UserViewer /> },
      { path: 'adduser', element: <UserCreate /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: 'useredit/:id', element: <UserEdit /> },
      { path: "/talk", element: <DiscussionHub /> },
    ],
  },
]);

export default routers;
