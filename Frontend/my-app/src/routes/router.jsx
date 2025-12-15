import { createBrowserRouter } from "react-router-dom";
import Header from "../Component/Header/Header.jsx";
import Footer from "../Component/Footer/Footer.jsx";
import Category from "../Component/Category/Category.jsx";
import TopProducts from "../Component/TopProducts/TopProducts.jsx";
import Register from "../Component/Register/Register.jsx";
import Login from "../Component/Login/Login.jsx";
import ProductInfor from "../Component/ProductInfor/ProductInfor.jsx";
import ProductGrid from "../Component/ProductGrid/ProductGrid.jsx";
import CategoryDetail from "../Component/CategoryDetail/CategoryDetail.jsx";
import OTP from "../Component/OTP/OTP.jsx";
import ProfileRouter from "../Component/Profile/ProfileRouter.jsx";

const Layout = ({ children }) => (
    <>
        <div className="position-fixed w-100 z-3">
        <Header />
        </div>

        <div className="row" style={{ paddingTop: "100px" }}>
        <div className="col-2 bg-secondary-subtle"></div>

        <div className="col-8 mb-5 pt-4">
            {children}
        </div>

        <div className="col-2 bg-secondary-subtle"></div>
        </div>

        <Footer />
    </>
    );

    const router = createBrowserRouter([
    {
        path: "/",
        element: (
        <Layout>
            <Category />
            <TopProducts />
        </Layout>
        ),
    },
    {
        path: "/register",
        element: (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <Register />
        </div>
        ),
    },
    {
        path: "/login",
        element: (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <Login />
        </div>
        ),
    },
    {
        path: "/productInfor",
        element: (
        <Layout>
            <ProductInfor />
        </Layout>
        ),
    },
    {
        path: "/productGridWithCat",
        element: (
        <Layout>
            <CategoryDetail />
            <ProductGrid />
        </Layout>
        ),
    },
    {
        path: "/verify-otp",
        element: (
        <Layout>
            <OTP />
        </Layout>
        ),
    },
    {
        path: "/profile",
        element: (
        <Layout>
            <ProfileRouter />
        </Layout>
        ),
    },
]);

export default router;
