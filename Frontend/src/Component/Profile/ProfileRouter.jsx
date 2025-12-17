import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BidderProfile from "./BidderProfile";
import SellerProfile from "./SellerProfile";
import AdminProfile from "./Admin/AdminProfile";
import * as accountService from "../../service/account.service";

const ROLE = {
    ADMIN: "1",
    SELLER: "2",
    BIDDER: "3"
};

export default function ProfileRouter() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        fetchProfile();
    }, [token]);

    const fetchProfile = async () => {
        try {
            const res = await accountService.getProfile();
            setUser(res.data);
        } catch (err) {
            console.error("Profile error:", err);
            setError("Phiên đăng nhập đã hết hạn");
            localStorage.removeItem("token");
            navigate("/login", { replace: true });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <p className="text-gray-500">Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-[60vh] text-red-500">
                {error}
            </div>
        );
    }

    switch (user?.role) {
        case ROLE.BIDDER:
            return <BidderProfile user={user} token={token} />;
        case ROLE.SELLER:
            return <SellerProfile user={user} token={token} />;
        case ROLE.ADMIN:
            return <AdminProfile user={user} token={token} />;
        default:
            return (
                <div className="text-center mt-10 text-gray-500">
                    Unknown role
                </div>
            );
    }
}
