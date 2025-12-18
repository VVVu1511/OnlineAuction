import { createBrowserRouter } from "react-router-dom";

import RootLayout from "../Component/Layout/RootLayout/RootLayout.jsx";
import AuthLayout from "../Component/Layout/AuthLayout/AuthLayout.jsx";

// PUBLIC
import ProductInfor from "../Component/ProductInfor/ProductInfor.jsx";
import ProductGrid from "../Component/ProductGrid/ProductGrid.jsx";
import CategoryDetail from "../Component/CategoryDetail/CategoryDetail.jsx";
import OTP from "../Component/OTP/OTP.jsx";

// AUTH
import Register from "../Component/Register/Register.jsx";
import Login from "../Component/Login/Login.jsx";

// PROFILE
import ProfileRouter from "../Component/Profile/ProfileRouter.jsx";
import SellerProfileUI from "../Component/Profile/SellerProfile.jsx";
import AdminProfile from "../Component/Profile/Admin/AdminProfile.jsx";

import Category from "../Component/Category/Category.jsx";
import TopProducts from "../Component/TopProducts/TopProducts.jsx";

const router = createBrowserRouter([
  // ========= ROOT =========
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // HOME (NO ROLE BASE)
      {
        index: true,
        element: 
        <>
          <Category />,
          <TopProducts />
        </>

      },

      // ===== PUBLIC =====
      {
        path: "product/:id",
        element: <ProductInfor />,
      },
      {
        path: "category/:categoryId",
        element: (
          <>
            <CategoryDetail />
            <ProductGrid />
          </>
        ),
      },
      {
        path: "verify-otp",
        element: <OTP />,
      },

      // ===== PROFILE (self-protected inside component) =====
      {
        path: "profile",
        element: <ProfileRouter />,
      },
    ],
  },

  // ========= AUTH =========
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
]);

export default router;
