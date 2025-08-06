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
import ProtectedRouteAdmin from "../features/AdminDashboard/ProtectedRouteAdmin";
import FlashCardsCreate from "../features/Flashcard/FlashcardsCreate";
import FlashcardsUpdate from "../features/Flashcard/FlashcardsUpdate";
import FlashcardsPlay from "../features/Flashcard/FlashcardsPlay";
import FlashcardList from "../features/AdminDashboard/Flashcardmanager/FlashcardList";
import SignUp from "../features/Auth/components/SignUp";
import UserEdit from "../features/AdminDashboard/UserEdit";
import DiscussionHub from "../features/Discussion/components/DiscussionHub";
import BookDetails from "../features/library-book/components/BookDetail";
import DiscussionDetail from "../features/Discussion/components/DiscussionDetail";
import ProtectedRouteUser from "./ProtectedRouteUser";

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
      {path:"/library/flashcard",
        element: <ProtectedRouteUser/>,
        children:[
          {path:"new", element:  <FlashCardsCreate />},
          {path:"edit/:id", element:  <FlashcardsUpdate />},
        ]
      },
      { path: "/library/flashcard/:id/play", element: <FlashcardsPlay /> },
      { path: "book", element: <ManageBooks /> },
      { path: "manage-book", element: <ManageBooks /> },
      { path: "/books/:id", element: < BookDetails /> },
      { path: "*", element: <NotFound /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "/talk", element: <DiscussionHub /> },
      { path: "/talk/:id", element: <DiscussionDetail /> },
      {
        path: "admin",
        element: <ProtectedRouteAdmin />,
        children: [
          { path: "", element: <Admin /> },
          { path: "users", element: <ManagerUser /> },
          { path: "users/:id", element: <UserViewer /> },
          { path: "users/create", element: <UserCreate /> },
          { path: "users/:id/edit", element: <UserEdit /> },
          { path: "flashcards", element: <FlashcardList /> },
        ],
      },
    ],
  },
]);

export default routers;