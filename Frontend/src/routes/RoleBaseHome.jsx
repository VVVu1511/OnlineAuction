
// Component/Common/RoleBasedHome.jsx
import Category from "../Category/Category.jsx";
import TopProducts from "../TopProducts/TopProducts.jsx";
import SellerDashboard from "../Seller/Dashboard.jsx";
import AdminDashboard from "../Admin/Dashboard.jsx";

const RoleBasedHome = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    // ===== GUEST =====
    if (!user) {
        return (
        <>
            <Category />
            <TopProducts />
        </>
        );
    }

    // ===== ROLE BASED =====
    switch (user.role_description.toLowerCase()) {
        case "bidder":
            return (
                <>
                <Category />
                <TopProducts />
                </>
            );

        case "seller":
            return <SellerDashboard />;

        case "admin":
            return <AdminDashboard />;

        default:
            return null;
    }
};

export default RoleBasedHome;
