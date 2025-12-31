import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import GuestHome from "../GuestHome/GuestHome.jsx"
import SellerHome from "../SellerHome/SellerHome.jsx";
import AdminHome from "../AdminHome/AdminHome.jsx"

export default function HomePage() {
    const { user } = useContext(AuthContext);

    // Chưa login
    if (!user) {
        return <GuestHome />;
    }

    // Đã login → check role
    switch (user.role) {
        case "seller":
            return <SellerHome />;

        case "admin":
            return <AdminHome />;

        default:
            return <GuestHome />;
    }
}