import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BidderProfile from "./BidderProfile";
import SellerProfile from "./SellerProfile";
import AdminProfile from "./Admin/AdminProfile";

const ROLE = {
    ADMIN: "admin",
    SELLER: "seller",
    BIDDER: "bidder",
};

export default function ProfileRouter() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        console.log("Stored user in ProfileRouter:", storedUser);

        if (!storedUser) {
            navigate("/login");
            return;
        }

        setUser(storedUser);
    }, [navigate]);

    if (!user) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <p className="text-gray-500">Loading profile...</p>
            </div>
        );
    }

    switch (user.role) {
        case ROLE.BIDDER:
            return <BidderProfile user={user} />;
        case ROLE.SELLER:
            return <SellerProfile user={user} />;
        case ROLE.ADMIN:
            return <AdminProfile user={user} />;
        default:
            navigate("/login");
            return null;
    }
}
