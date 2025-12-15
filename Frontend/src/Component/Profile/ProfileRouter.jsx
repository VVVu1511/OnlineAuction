import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BidderProfile from "./BidderProfile";
import SellerProfile from "./SellerProfile";
import AdminProfile from "./Admin/AdminProfile";
import * as accountService from "../../service/account.service.jsx"

export default function ProfileRouter() {
    const [user, setUser] = useState(null);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) return navigate("/login");
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const data = await accountService.getProfile();
        setUser(data.data);
    };

    if (!user) return <p>Loading...</p>;

    // role: 3 = bidder, 2 = seller, 1 = admin
    switch (user.role) {
        case "3":
            return <BidderProfile user={user} token={token} />;
        case "2":
            return <SellerProfile user={user} token={token} />;
        case "1":
            return <AdminProfile user={user} token={token} />;
        default:
            return <p>Unknown role</p>;
    }
}
