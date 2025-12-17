// router/index.jsx
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

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

// ROLE BASE
import RoleBasedHome from "../Component/Common/RoleBasedHome.jsx";

// BIDDER
import ProfileRouter from "../Component/Profile/ProfileRouter.jsx";

// SELLER
import SellerProfileUI from "../Component/Profile/SellerProfile.jsx";

// ADMIN
import AdminProfile from "../Component/Profile/Admin/AdminProfile.jsx";

// ================= Protected Route =================
const ProtectedRoute = ({ allowRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/login" replace />;

  if (allowRoles && !allowRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

// ================= Router =================
const router = createBrowserRouter([
  // ========= ROOT (ALL ROLES) =========
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // HOME → render theo ROLE
      {
        index: true,
        element: <RoleBasedHome />,
      },

      // ===== PUBLIC =====
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

      // ===== BIDDER / SELLER =====
      {
        path: "profile",
        element: <ProtectedRoute allowRoles={["BIDDER", "SELLER"]} />,
        children: [
          { path: "*", element: <ProfileRouter /> },
        ],
      },

      // ===== SELLER =====
      {
        path: "seller/profile",
        element: <ProtectedRoute allowRoles={["SELLER"]} />,
        children: [{ index: true, element: <SellerProfileUI /> }],
      },

      // ===== ADMIN =====
      {
        path: "admin/profile",
        element: <ProtectedRoute allowRoles={["ADMIN"]} />,
        children: [{ index: true, element: <AdminProfile /> }],
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
