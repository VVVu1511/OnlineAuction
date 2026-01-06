import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../components/RootLayout/RootLayout.jsx";
import HomePage from "../components/HomePage/HomePage.jsx";
import Product from "../components/Product/Product.jsx";
import CategoryPage from "../components/CategoryPage/CategoryPage.jsx";
import SearchPage from "../components/SearchPage/SearchPage.jsx";
import Login from "../components/Login/Login.jsx";
import Register from "../components/Register/Register.jsx";
import ForgotPassword from "../components/ForgotPassword/ForgotPassword.jsx"
import Profile from "../components/Profile/Profile.jsx";
import OrderCompletion from "../components/OrderCompletion/OrderCompletion.jsx";
import OAuthSuccess from "../components/OAuthSuccess/OAuthSuccess.jsx"
import RatingPage from "../components/RatingPage/RatingPage.jsx";
import AdvancedSearch from "../components/AdvancedSearch/AdvancedSearch.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,       // <-- route "/"
        element: <HomePage />
      },
      {
        path: "/product/:id",
        element: <Product />
      },
      {
          path: "/category/:id",
          element: <CategoryPage />
      },
      {
        path: "/account"
        
      },
      {
        path: "/search/:keyword",
        element: <SearchPage />
      },
      {
        path: "/profile",
        element: <Profile />
      },
      {
        path: "/order/complete/:id",
        element: <OrderCompletion />
      },
      {
          path:"/oauth-success",
          element: <OAuthSuccess />
      },
      {
          path:"/advanced-search",
          element: <AdvancedSearch />
      }
    ],
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
      element: <Register />
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />
  },
  {
    path: "/ratings/:id",
    element: <RatingPage />
  }
]);

export default router;
