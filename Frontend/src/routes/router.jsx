// router/index.jsx
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../Component/Layout/RootLayout/RootLayout.jsx";
import AuthLayout from "../Component/Layout/AuthLayout/AuthLayout.jsx";

import Category from "../Component/Category/Category.jsx";
import TopProducts from "../Component/TopProducts/TopProducts.jsx";
import Register from "../Component/Register/Register.jsx";
import Login from "../Component/Login/Login.jsx";
import ProductInfor from "../Component/ProductInfor/ProductInfor.jsx";
import ProductGrid from "../Component/ProductGrid/ProductGrid.jsx";
import CategoryDetail from "../Component/CategoryDetail/CategoryDetail.jsx";
import OTP from "../Component/OTP/OTP.jsx";
import ProfileRouter from "../Component/Profile/ProfileRouter.jsx";

const router = createBrowserRouter([
  // ===== PUBLIC LAYOUT =====
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <>
            <Category />
            <TopProducts />
          </>
        ),
      },

      {
        path: "product/:id",
        element: <ProductInfor />,
      },

      {
        path: "category/:id",
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

      {
        path: "profile/*",
        element: <ProfileRouter />,
      },
    ],
  },

  // ===== AUTH LAYOUT =====
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
]);

export default router;
